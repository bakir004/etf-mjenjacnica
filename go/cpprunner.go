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
)

type CodeRequest struct {
	Code string `json:"code"`
}

type CodeResponse struct {
	Output string `json:"output"`
	Error  string `json:"error,omitempty"`
}

func runCppCode(code string) (string, string) {
	// Step 1: Create a temporary C++ file
	tmpFile, err := os.CreateTemp("", "*.cpp")
	if err != nil {
		return "", fmt.Sprintf("Failed to create temp file: %v", err)
	}
	defer os.Remove(tmpFile.Name()) // Clean up the temp file after execution

	// Step 2: Write the C++ code to the temporary file
	if _, err := tmpFile.WriteString(code); err != nil {
		return "", fmt.Sprintf("Failed to write code to file: %v", err)
	}

	// Ensure the file is closed before running commands
	if err := tmpFile.Close(); err != nil {
		return "", fmt.Sprintf("Failed to close temp file: %v", err)
	}

	// Step 3: Compile the C++ code
	compileCmd := exec.Command("g++", tmpFile.Name(), "-o", tmpFile.Name()+".out")
	var compileOutBuf, compileErrBuf bytes.Buffer
	compileCmd.Stdout = &compileOutBuf
	compileCmd.Stderr = &compileErrBuf

	// Run the compile command
	if err := compileCmd.Run(); err != nil {
		return "", fmt.Sprintf("Compilation Error: %s, %s", compileErrBuf.String(), err)
	}

	// Step 4: Run the compiled output with a timeout
	ctx, cancel := context.WithTimeout(context.Background(), 7*time.Second)
	defer cancel()

	runCmd := exec.CommandContext(ctx, tmpFile.Name()+".out")
	var outBuf, errBuf bytes.Buffer
	runCmd.Stdout = &outBuf
	runCmd.Stderr = &errBuf

	// Step 5: Run the compiled command
	err = runCmd.Run()

	// Check if the error is due to a timeout
	if ctx.Err() == context.DeadlineExceeded {
		return "", "Execution timed out after 7 seconds"
	}

	if err != nil {
		return "", fmt.Sprintf("Execution Error: %s, %s", errBuf.String(), err)
	}

	// Clean up the compiled output file
	os.Remove(tmpFile.Name() + ".out")

	// Step 6: Return the output
	return outBuf.String(), ""
}

func handleCodeExecution(w http.ResponseWriter, r *http.Request) {
	var req CodeRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	output, compileErr := runCppCode(req.Code)
	resp := CodeResponse{
		Output: output,
		Error:  compileErr,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func main() {
	http.HandleFunc("/api/v1/run", handleCodeExecution)
	fmt.Println("Server started at :8080")
	http.ListenAndServe(":8080", nil)
}
