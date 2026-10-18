package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	wordformat "github.com/anomalyco/bid-pageformatting-backend"
	"github.com/unidoc/unioffice/v2/common/license"
	"github.com/unidoc/unioffice/v2/document"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func handleFormat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	if err := r.ParseMultipartForm(200 << 20); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "failed to parse multipart form: " + err.Error()})
		return
	}

	configRaw := r.FormValue("config")
	if configRaw == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing config field"})
		return
	}

	var cfg wordformat.Config
	if err := json.Unmarshal([]byte(configRaw), &cfg); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid config JSON: " + err.Error()})
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "missing file field"})
		return
	}
	defer file.Close()

	// Check file extension (C6)
	ext := filepath.Ext(header.Filename)
	if ext != ".docx" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "only .docx files are accepted"})
		return
	}

	// Check file size (max 150MB)
	if header.Size > 150*1024*1024 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "file size exceeds 150MB limit"})
		return
	}

	tmpDir, err := os.MkdirTemp("", "bid-format-*")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create temp directory"})
		return
	}
	defer os.RemoveAll(tmpDir)

	inPath := filepath.Join(tmpDir, "input.docx")
	outPath := filepath.Join(tmpDir, "output.docx")

	inFile, err := os.Create(inPath)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create temp file"})
		return
	}

	if _, err := io.Copy(inFile, file); err != nil {
		inFile.Close()
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save uploaded file"})
		return
	}
	inFile.Close()

	doc, err := document.Open(inPath)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to open document: " + err.Error()})
		return
	}

	if err := wordformat.RunPipeline(doc, &cfg); err != nil {
		doc.Close()
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "pipeline failed: " + err.Error()})
		return
	}

	if err := wordformat.SaveDocx(doc, outPath); err != nil {
		doc.Close()
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save formatted document: " + err.Error()})
		return
	}
	doc.Close()

	outFile, err := os.Open(outPath)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to open output file"})
		return
	}
	defer outFile.Close()

	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
	w.Header().Set("Content-Disposition", "attachment; filename=formatted.docx")
	w.WriteHeader(http.StatusOK)
	io.Copy(w, outFile)
}

func handleConfig(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		cfg := wordformat.LoadConfigForAPI()
		writeJSON(w, http.StatusOK, cfg)
	case http.MethodPut:
		var req struct {
			LicenseEntries json.RawMessage              `json:"license_entries"`
			AiProviders    []wordformat.AiProviderEntry `json:"ai_providers"`
		}
		body, _ := io.ReadAll(r.Body)
		if err := json.Unmarshal(body, &req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
			return
		}
		if len(req.LicenseEntries) > 0 && string(req.LicenseEntries) != "null" {
			var entries []wordformat.LicenseEntryRequest
			if err := json.Unmarshal(req.LicenseEntries, &entries); err != nil {
				writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid license_entries"})
				return
			}
			if err := wordformat.SaveLicenseEntries(entries); err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
				return
			}
		}
		if err := wordformat.SaveAiProviders(req.AiProviders); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	default:
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
	}
}

func handleTestKey(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	var req wordformat.TestKeyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	resultCh := make(chan wordformat.TestKeyResponse, 1)
	go func() {
		resultCh <- wordformat.TestApiKey(req.Provider, req.Key, req.Model, req.Endpoint, req.Format)
	}()

	select {
	case <-ctx.Done():
		writeJSON(w, http.StatusGatewayTimeout, map[string]string{"error": "测试请求超时，请检查 Key 或网络"})
		return
	case result := <-resultCh:
		writeJSON(w, http.StatusOK, result)
	}
}

func main() {
	// Register unidoc license before any document operations
	key := os.Getenv("UNIDOC_LICENSE_KEY")
	if key == "" {
		raw, err := os.ReadFile("config.json")
		if err == nil {
			var cfg struct {
				UnidocLicenseKey string `json:"unidoc_license_key"`
			}
			json.Unmarshal(raw, &cfg)
			key = cfg.UnidocLicenseKey
		}
	}
	if key != "" {
		if len(key) >= 64 {
			key = key[:64]
		}
		if err := license.SetMeteredKey(key); err != nil {
			log.Printf("[WARN] license set failed: %v", err)
		} else {
			log.Println("[OK] unidoc license registered")
		}
	} else {
		log.Println("[WARN] no unidoc license key found")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8099"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", handleHealth)
	mux.HandleFunc("/api/format", handleFormat)
	mux.HandleFunc("/api/config", handleConfig)
	mux.HandleFunc("/api/config/test-key", handleTestKey)

	handler := corsMiddleware(mux)

	fmt.Printf("格式化服务已启动，端口: %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
