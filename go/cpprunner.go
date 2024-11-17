package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"time"
)

type CodeRequest struct {
	UserCode string `json:"userCode"`
}

type CodeResponse struct {
	Output   string `json:"output"`
	Error    string `json:"error,omitempty"`
}

func runCppCode(code string) CodeResponse {
	tmpFile, err := os.CreateTemp("", "*.cpp")
	if err != nil {
		return CodeResponse{"", fmt.Sprintf("Failed to create temp file: %v", err)}
	}
	defer os.Remove(tmpFile.Name()) 

	if _, err := tmpFile.WriteString(code); err != nil {
		return CodeResponse{"", fmt.Sprintf("Failed to write code to file: %v", err)}
	}

	if err := tmpFile.Close(); err != nil {
		return CodeResponse{"", fmt.Sprintf("Failed to close temp file: %v", err)}
	}

	compiledFile := tmpFile.Name() + ".out"
	// dodati -fsanitize=address
	compileCmd := exec.Command("g++", "-O0", tmpFile.Name(), "-o", compiledFile)
	var compileErrBuf bytes.Buffer
	compileCmd.Stderr = &compileErrBuf

	if err := compileCmd.Run(); err != nil {
		return CodeResponse{"", fmt.Sprintf("Compilation Error: %s", compileErrBuf.String())}
	}

	defer os.Remove(compiledFile)

	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	runCmd := exec.CommandContext(ctx, compiledFile)
	var outBuf, errBuf bytes.Buffer
	runCmd.Stdout = &outBuf
	runCmd.Stderr = &errBuf

	err = runCmd.Run()

	if ctx.Err() == context.DeadlineExceeded {
		return CodeResponse{"", "Execution timed out after 8 seconds"}
	}

	if err != nil {
		return CodeResponse{"", fmt.Sprintf("Execution Error: %s", errBuf.String())}
	}

	return CodeResponse{outBuf.String(), ""}
}

func handleCodeExecution(w http.ResponseWriter, r *http.Request) {
	var req CodeRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	result := runCppCode(req.UserCode)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func main() {
	http.HandleFunc("/api/v1/run", handleCodeExecution)

	fmt.Println("Server started at :8080")
	http.ListenAndServe(":8080", nil)
}
