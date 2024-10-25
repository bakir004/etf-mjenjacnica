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
	defer tmpFile.Close()

	// Step 2: Write the C++ code to the temporary file
	if _, err := tmpFile.WriteString(code); err != nil {
		return "", fmt.Sprintf("Failed to write code to file: %v", err)
	}

	// Step 3: Compile and run the C++ code inside a Docker container
	// Create a context with a timeout of 10 seconds
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Use gcc to compile and run the code in one command
	cmd := exec.CommandContext(ctx, "docker", "run", "--rm",
		"-v", fmt.Sprintf("%s:/app/code.cpp", tmpFile.Name()), // Mount the temp file
		"gcc:latest",
		"sh", "-c", "g++ /app/code.cpp -o /app/output && /app/output") // Compile and run
	var outBuf, errBuf bytes.Buffer
	cmd.Stdout = &outBuf
	cmd.Stderr = &errBuf

	// Step 4: Run the command
	err = cmd.Run()

	// Check if the error is due to a timeout
	if ctx.Err() == context.DeadlineExceeded {
		return "", "Execution timed out"
	}

	if err != nil {
		return "", fmt.Sprintf("Execution Error: %s", errBuf.String())
	}

	// Step 5: Return the output
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
