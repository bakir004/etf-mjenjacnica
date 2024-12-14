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
	"runtime"
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
const MAX_CACHE_SIZE = 10
const TIMEOUT_SECONDS = 5
const OPTIMIZATION_LEVEL = "-O3"

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

	if len(c.entries) == MAX_CACHE_SIZE {
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


func runCppCodeOriginal(userID, userCode, mainCode string, mainCodeID string) CodeResponse {
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
	compileCmd := exec.Command("g++", OPTIMIZATION_LEVEL, "-fsanitize=leak", mainFile.Name(), "-o", compiledFile)
    // compileCmd := exec.Command("g++", OPTIMIZATION_LEVEL, mainFile.Name(), "-o", compiledFile)
	// compileCmd := exec.Command("ccache", "g++", OPTIMIZATION_LEVEL, mainFile.Name(), "-o", compiledFile)
	var compileErrBuf bytes.Buffer
	compileCmd.Stderr = &compileErrBuf

	compileErrBuf.Reset()
	if err := compileCmd.Run(); err != nil {
		return CodeResponse{"", fmt.Sprintf("Compilation Error [ID %s]: %s", mainCodeID, compileErrBuf.String())}
	}

	compileDuration := time.Since(compileStart)
	log.Printf("Compilation of ID %s took %s", mainCodeID, compileDuration)

	defer os.Remove(compiledFile)

	runStart := time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), TIMEOUT_SECONDS*time.Second)
	defer cancel()

	runCmd := exec.CommandContext(ctx, compiledFile)
	var outBuf, errBuf bytes.Buffer
	runCmd.Stdout = &outBuf
	runCmd.Stderr = &errBuf

	err = runCmd.Run()

	if ctx.Err() == context.DeadlineExceeded {
		return CodeResponse{"", fmt.Sprintf("Execution timed out after %d seconds", TIMEOUT_SECONDS)}
	}

	if err != nil {
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

	result := runCppCodeOriginal(req.UserID, req.UserCode, req.MainCode, "bax")

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
	var maxConcurrency = runtime.NumCPU()
	semaphore := make(chan struct{}, maxConcurrency)
	resultsChan := make(chan BatchResult, len(req.MainCodes))

	var wg sync.WaitGroup

	for _, mainCode := range req.MainCodes {
		wg.Add(1)

		semaphore <- struct{}{}

		go func(mainCode MainCode) {
			defer wg.Done()
			defer func() { <-semaphore }()
            println("Running code for main code id: ", mainCode.ID)
			result := runCppCodeOriginal(req.UserID, req.UserCode, mainCode.MainCode, mainCode.ID)
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
    println("Max concurrency set to:", runtime.NumCPU())
	http.ListenAndServe("0.0.0.0:8080", nil)
}
