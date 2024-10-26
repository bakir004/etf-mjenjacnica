package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"net/http"
	"os/exec"
	"time"
	"sync"
)

type CodeRequest struct {
	Code string `json:"code"`
}

type CodeResponse struct {
	Output string `json:"output"`
	Error  string `json:"error,omitempty"`
}

func runMultipleCppCodes(codes []string) []CodeResponse {
	results := make([]CodeResponse, len(codes))
	var wg sync.WaitGroup

	// Limit the number of concurrent executions to avoid CPU overload on a single core
	concurrencyLimit := 3
	semaphore := make(chan struct{}, concurrencyLimit)

	for i, code := range codes {
		wg.Add(1)

		go func(i int, code string) {
			defer wg.Done()

			// Acquire a slot in the semaphore
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			results[i] = runCppCode(code)
		}(i, code)
	}

	wg.Wait()
	return results
}

func runCppCode(code string) CodeResponse {
	// Step 1: Create a temporary C++ file
	tmpFile, err := os.CreateTemp("", "*.cpp")
	if err != nil {
		return CodeResponse{"", fmt.Sprintf("Failed to create temp file: %v", err)}
	}
	defer os.Remove(tmpFile.Name()) // Clean up the temp file after execution

	// Step 2: Write the C++ code to the temporary file
	if _, err := tmpFile.WriteString(code); err != nil {
		return CodeResponse{"", fmt.Sprintf("Failed to write code to file: %v", err)}
	}

	// Ensure the file is closed before running commands
	if err := tmpFile.Close(); err != nil {
		return CodeResponse{"", fmt.Sprintf("Failed to close temp file: %v", err)}
	}

	// Step 3: Compile the C++ code
	compiledFile := tmpFile.Name() + ".out"
	compileCmd := exec.Command("g++", tmpFile.Name(), "-o", compiledFile)
	var compileErrBuf bytes.Buffer
	compileCmd.Stderr = &compileErrBuf

	// Run the compile command
	if err := compileCmd.Run(); err != nil {
		return CodeResponse{"", fmt.Sprintf("Compilation Error: %s", compileErrBuf.String())}
	}

	defer os.Remove(compiledFile) // Clean up the compiled output file

	// Step 4: Run the compiled output with a timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	runCmd := exec.CommandContext(ctx, compiledFile)
	var outBuf, errBuf bytes.Buffer
	runCmd.Stdout = &outBuf
	runCmd.Stderr = &errBuf

	// Step 5: Run the compiled command
	err = runCmd.Run()

	// Check if the error is due to a timeout
	if ctx.Err() == context.DeadlineExceeded {
		return CodeResponse{"", "Execution timed out after 10 seconds"}
	}

	if err != nil {
		return CodeResponse{"", fmt.Sprintf("Execution Error: %s", errBuf.String())}
	}

	// Step 6: Return the output
	return CodeResponse{outBuf.String(), ""}
}

func handleCodeExecution(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Codes []string `json:"codes"`
	}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Execute each code and gather results
	results := runMultipleCppCodes(req.Codes)

	// Set response header and encode the results as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func main() {
	http.HandleFunc("/api/v1/run", handleCodeExecution)
	fmt.Println("Server started at :8080")
	http.ListenAndServe(":8080", nil)
}
