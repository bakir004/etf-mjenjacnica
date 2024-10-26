package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"sync"
	"time"
)

// Code represents the code structure with an Id and Code string
type Code struct {
	Id   int    `json:"id"`   // Unique identifier for the code
	Code string `json:"code"` // C++ code to execute
}

// CodeResponse includes an Id, Output, and Error fields
type CodeResponse struct {
	Id     int    `json:"id"`     // Unique identifier for the code
	Output string `json:"output"` // Output of the code execution
	Error  string `json:"error,omitempty"` // Error if any occurred during execution
}

func runMultipleCppCodes(codes []Code) []CodeResponse {
	var results []CodeResponse // Flexible slice for appending results
	var wg sync.WaitGroup

	// Limit the number of concurrent executions to avoid CPU overload on a single core
	concurrencyLimit := 3
	semaphore := make(chan struct{}, concurrencyLimit)

	for _, codeObj := range codes {
		wg.Add(1)

		go func(codeObj Code) {
			defer wg.Done()

			// Acquire a slot in the semaphore
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			// Run the code and append the result to the results slice
			result := runCppCode(codeObj.Id, codeObj.Code)
			results = append(results, result)
		}(codeObj)
	}

	wg.Wait()
	return results
}

func runCppCode(id int, code string) CodeResponse {
	// Step 1: Create a temporary C++ file
	tmpFile, err := os.CreateTemp("", "*.cpp")
	if err != nil {
		return CodeResponse{id, "", fmt.Sprintf("Failed to create temp file: %v", err)}
	}
	defer os.Remove(tmpFile.Name()) // Clean up the temp file after execution

	// Step 2: Write the C++ code to the temporary file
	if _, err := tmpFile.WriteString(code); err != nil {
		return CodeResponse{id, "", fmt.Sprintf("Failed to write code to file: %v", err)}
	}

	// Ensure the file is closed before running commands
	if err := tmpFile.Close(); err != nil {
		return CodeResponse{id, "", fmt.Sprintf("Failed to close temp file: %v", err)}
	}

	// Step 3: Compile the C++ code
	compiledFile := tmpFile.Name() + ".out"
	compileCmd := exec.Command("g++", tmpFile.Name(), "-o", compiledFile)
	var compileErrBuf bytes.Buffer
	compileCmd.Stderr = &compileErrBuf

	// Run the compile command
	if err := compileCmd.Run(); err != nil {
		return CodeResponse{id, "", fmt.Sprintf("Compilation Error: %s", compileErrBuf.String())}
	}

	defer os.Remove(compiledFile) // Clean up the compiled output file

	// Step 4: Run the compiled output with a timeout
	ctx, cancel := context.WithTimeout(context.Background(), 7*time.Second)
	defer cancel()

	runCmd := exec.CommandContext(ctx, compiledFile)
	var outBuf, errBuf bytes.Buffer
	runCmd.Stdout = &outBuf
	runCmd.Stderr = &errBuf

	// Step 5: Run the compiled command
	err = runCmd.Run()

	// Check if the error is due to a timeout
	if ctx.Err() == context.DeadlineExceeded {
		return CodeResponse{id, "", "Execution timed out after 7 seconds"}
	}

	if err != nil {
		return CodeResponse{id, "", fmt.Sprintf("Execution Error: %s", errBuf.String())}
	}

	// Step 6: Return the output
	return CodeResponse{id, outBuf.String(), ""}
}

func handleCodeExecution(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Codes []Code `json:"codes"` // Updated to accept an array of Code objects
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
