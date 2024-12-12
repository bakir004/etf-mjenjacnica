package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
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
	MainCodes []MainCode  `json:"mainCodes"`
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
	UserCode   string
	HeaderPath string
}

type Cache struct {
	mu      sync.Mutex
	entries map[string]string
}

func (c *Cache) GetHeaderPath(userID, userCode string) (string, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()

	key := userID + ":" + userCode
	path, exists := c.entries[key]
	return path, exists
}

func (c *Cache) AddEntry(userID, userCode, headerPath string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if len(c.entries) == 10 {
		for key, path := range c.entries {
			os.Remove(path)
			delete(c.entries, key)
			break
		}
	}

	key := userID + ":" + userCode
	c.entries[key] = headerPath
}

var headerCache = &Cache{entries: make(map[string]string)}

func logDuration(start time.Time, operation string) {
	elapsed := time.Since(start)
	log.Printf("%s took %s", operation, elapsed)
}

func runCppCode(userID, userCode, mainCode string, mainCodeID string) CodeResponse {
	defer logDuration(time.Now(), "runCppCode")
	compileStart := time.Now()

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
		log.Println("Cache miss: added new entry")
	} else {
		log.Println("Cache hit")
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
	compileCmd := exec.Command("g++", "-O3", "-fsanitize=leak", mainFile.Name(), "-o", compiledFile)
	var compileErrBuf bytes.Buffer
	compileCmd.Stderr = &compileErrBuf

	// Ensure a fresh buffer and unique log entry
	compileErrBuf.Reset() // Reset the buffer to avoid accumulation
	if err := compileCmd.Run(); err != nil {
		// Log error with unique ID
		return CodeResponse{"", fmt.Sprintf("Compilation Error [ID %s]: %s", mainCodeID, compileErrBuf.String())}
	}

	compileDuration := time.Since(compileStart)
	log.Printf("Compilation of ID %s took %s", mainCodeID, compileDuration)

	defer os.Remove(compiledFile)

	runStart := time.Now()

	// Execute with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	runCmd := exec.CommandContext(ctx, compiledFile)
	var outBuf, errBuf bytes.Buffer
	runCmd.Stdout = &outBuf
	runCmd.Stderr = &errBuf

	err = runCmd.Run()

	if ctx.Err() == context.DeadlineExceeded {
		return CodeResponse{"", "Execution timed out after 5 seconds"}
	}

	if err != nil {
		// Log execution error with unique ID
		return CodeResponse{"", fmt.Sprintf("Execution Error [ID %s]: %s", mainCodeID, errBuf.String())}
	}

	runtime := time.Since(runStart)
	log.Printf("Execution of %s took %s", mainCodeID, runtime)

	return CodeResponse{outBuf.String(), ""}
}

func handleCodeExecution(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	defer logDuration(start, "handleCodeExecution")

	var req CodeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	result := runCppCode(req.UserID, req.UserCode, req.MainCode, "1")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func handleBatchExecution(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	defer logDuration(start, "handleBatchExecution")

	var req BatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	const maxConcurrency = 4 // Number of thads to run concurrently
	semaphore := make(chan struct{}, maxConcurrency) // Concurrency control
	resultsChan := make(chan BatchResult, len(req.MainCodes))

	var wg sync.WaitGroup

	for _, mainCode := range req.MainCodes {
		wg.Add(1)

		semaphore <- struct{}{}

		go func(mainCode MainCode) {
			defer wg.Done()
			defer func() { <-semaphore }() // Release semaphore slot when done
            println("Running code for main code id: ", mainCode.ID)
			result := runCppCode(req.UserID, req.UserCode, mainCode.MainCode, mainCode.ID)
			resultsChan <- BatchResult{MainCodeID: mainCode.ID, Output: result.Output, Error: result.Error}
		}(mainCode)
	}

	go func() {
		wg.Wait()
		close(resultsChan)
	}()

	var results []BatchResult
	for result := range resultsChan {
		results = append(results, result)
	}


	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(BatchResponse{Results: results})
}


func main() {
	http.HandleFunc("/api/v1/run", handleCodeExecution)
	http.HandleFunc("/api/v1/batch-run", handleBatchExecution)

	log.Println("Server started at :8080")
	http.ListenAndServe(":8080", nil)
}
