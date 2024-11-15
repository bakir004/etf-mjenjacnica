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

type Code struct {
	Id   int    `json:"id"`   
	Code string `json:"code"`
}

type CodeResponse struct {
	Id     int    `json:"id"`     
	Output string `json:"output"` 
	Error  string `json:"error,omitempty"` 
}

func runMultipleCppCodes(codes []Code) []CodeResponse {
	var results []CodeResponse 
	var wg sync.WaitGroup

	concurrencyLimit := 5
	semaphore := make(chan struct{}, concurrencyLimit)

	for _, codeObj := range codes {
		wg.Add(1)

		go func(codeObj Code) {
			defer wg.Done()

			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			result := runCppCode(codeObj.Id, codeObj.Code)
			results = append(results, result)
		}(codeObj)
	}

	wg.Wait()
	return results
}

func runCppCode(id int, code string) CodeResponse {
	tmpFile, err := os.CreateTemp("", "*.cpp")
	if err != nil {
		return CodeResponse{id, "", fmt.Sprintf("Failed to create temp file: %v", err)}
	}
	defer os.Remove(tmpFile.Name()) 

	if _, err := tmpFile.WriteString(code); err != nil {
		return CodeResponse{id, "", fmt.Sprintf("Failed to write code to file: %v", err)}
	}

	if err := tmpFile.Close(); err != nil {
		return CodeResponse{id, "", fmt.Sprintf("Failed to close temp file: %v", err)}
	}
	compiledFile := tmpFile.Name() + ".out"
    compileCmd := exec.Command("g++", "-fsanitize=address", tmpFile.Name(), "-o", compiledFile)
	var compileErrBuf bytes.Buffer
	compileCmd.Stderr = &compileErrBuf

	if err := compileCmd.Run(); err != nil {
		return CodeResponse{id, "", fmt.Sprintf("Compilation Error: %s", compileErrBuf.String())}
	}

	defer os.Remove(compiledFile) 

	ctx, cancel := context.WithTimeout(context.Background(), 7*time.Second)
	defer cancel()

	runCmd := exec.CommandContext(ctx, compiledFile)
	var outBuf, errBuf bytes.Buffer
	runCmd.Stdout = &outBuf
	runCmd.Stderr = &errBuf

	err = runCmd.Run()

	if ctx.Err() == context.DeadlineExceeded {
		return CodeResponse{id, "", "Execution timed out after 7 seconds"}
	}

	if err != nil {
		return CodeResponse{id, "", fmt.Sprintf("Execution Error: %s", errBuf.String())}
	}

	return CodeResponse{id, outBuf.String(), ""}
}

func handleCodeExecution(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Codes []Code `json:"codes"`
	}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	results := runMultipleCppCodes(req.Codes)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func main() {
	http.HandleFunc("/api/v1/run", handleCodeExecution)
	fmt.Println("Server started at :8080")
	http.ListenAndServe(":8080", nil)
}
