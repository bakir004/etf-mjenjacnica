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

type CodeRequest struct {
	UserID   string `json:"userId"`
	UserCode string `json:"userCode"`
	MainCode string `json:"mainCode"`
}

type BatchRequest struct {
	UserID    string      `json:"userId"`
	UserCode  string      `json:"userCode"`
	MainCodes []MainCode `json:"mainCodes"`
}

type MainCode struct {
	ID       string `json:"id"`
	MainCode string `json:"mainCode"`
}

type CodeResponse struct {
	Output string `json:"output"`
	Error  string `json:"error,omitempty"`
}

type BatchResponse struct {
	Results []BatchResult `json:"results"`
}

type BatchResult struct {
	MainCodeID string `json:"mainCodeId"`
	Output     string `json:"output"`
	Error      string `json:"error,omitempty"`
}

type CacheEntry struct {
	UserID     string
	UserCode   string
	HeaderPath string
}

type Cache struct {
	mu      sync.Mutex
	entries []CacheEntry
}

func (c *Cache) GetHeaderPath(userID, userCode string) (string, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()

	for _, entry := range c.entries {
		if entry.UserID == userID && entry.UserCode == userCode {
			return entry.HeaderPath, true
		}
	}
	return "", false
}

func (c *Cache) AddEntry(userID, userCode, headerPath string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if len(c.entries) == 10 {
		os.Remove(c.entries[0].HeaderPath)
		c.entries = c.entries[1:]
	}

	c.entries = append(c.entries, CacheEntry{userID, userCode, headerPath})
}

var headerCache = &Cache{}

func runCppCode(userID, userCode, mainCode string) CodeResponse {
	headerPath, cached := headerCache.GetHeaderPath(userID, userCode)
	if !cached {
		headerFile, err := os.CreateTemp("", "*.h")
		if err != nil {
			return CodeResponse{"", fmt.Sprintf("Failed to create temp header file: %v", err)}
		}
		headerPath = headerFile.Name()
		defer headerFile.Close()

		if _, err := headerFile.WriteString(userCode); err != nil {
			return CodeResponse{"", fmt.Sprintf("Failed to write header code to file: %v", err)}
		}

		headerCache.AddEntry(userID, userCode, headerPath)
		fmt.Println("Added to cache")
	} else {
		fmt.Println("Not added to cache")
	}

	mainFile, err := os.CreateTemp("", "*.cpp")
	if err != nil {
		return CodeResponse{"", fmt.Sprintf("Failed to create temp main file: %v", err)}
	}
	defer os.Remove(mainFile.Name())

	includeDirective := fmt.Sprintf("#include \"%s\"\n", headerPath)
	if _, err := mainFile.WriteString(includeDirective + mainCode); err != nil {
		return CodeResponse{"", fmt.Sprintf("Failed to write main code to file: %v", err)}
	}
	if err := mainFile.Close(); err != nil {
		return CodeResponse{"", fmt.Sprintf("Failed to close temp main file: %v", err)}
	}

	compiledFile := mainFile.Name() + ".out"
	compileCmd := exec.Command("g++", "-O0", mainFile.Name(), "-o", compiledFile)
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

	result := runCppCode(req.UserID, req.UserCode, req.MainCode)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func handleBatchExecution(w http.ResponseWriter, r *http.Request) {
	var req BatchRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Semaphore to limit concurrency to 2
	const maxConcurrency = 2
	semaphore := make(chan struct{}, maxConcurrency)

	var results []BatchResult
	var wg sync.WaitGroup
	var mu sync.Mutex // To protect shared slice `results`

	for _, mainCode := range req.MainCodes {
		wg.Add(1)

		// Acquire semaphore
		semaphore <- struct{}{}
		go func(mainCode MainCode) {
			defer wg.Done()
			defer func() { <-semaphore }() // Release semaphore

			result := runCppCode(req.UserID, req.UserCode, mainCode.MainCode)

			mu.Lock()
			results = append(results, BatchResult{
				MainCodeID: mainCode.ID,
				Output:     result.Output,
				Error:      result.Error,
			})
			mu.Unlock()
		}(mainCode)
	}

	// Wait for all goroutines to finish
	wg.Wait()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(BatchResponse{Results: results})
}

func main() {
	http.HandleFunc("/api/v1/run", handleCodeExecution)
	http.HandleFunc("/api/v1/batch-run", handleBatchExecution)

	fmt.Println("Server started at :8080")
	http.ListenAndServe(":8080", nil)
}
