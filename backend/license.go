package wordformat

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	_ "embed"
)

//go:embed config.json
var configBytes []byte

type licenseEntry struct {
	Name      string `json:"name"`
	Key       string `json:"key"`
	Encrypted bool   `json:"encrypted,omitempty"`
}

type LicenseEntryRequest struct {
	Name string `json:"name"`
	Key  string `json:"key"`
}

type LicenseEntryResponse struct {
	Name string `json:"name"`
}

type AiProviderEntry struct {
	ID        string `json:"id"`
	Provider  string `json:"provider"`
	Model     string `json:"model"`
	ModelName string `json:"modelName"`
	Key       string `json:"key"`
	Enabled   bool   `json:"enabled"`
	Endpoint  string `json:"endpoint,omitempty"`
	Format    string `json:"format,omitempty"`
}

type AiProvidersResponse struct {
	Providers []AiProviderEntry `json:"ai_providers"`
}

type TestKeyRequest struct {
	Provider string `json:"provider"`
	Model    string `json:"model"`
	Key      string `json:"key"`
	Endpoint string `json:"endpoint"`
	Format   string `json:"format"`
}

type TestKeyResponse struct {
	Available bool   `json:"available"`
	Error     string `json:"error,omitempty"`
}

type ConfigForAPI struct {
	LicenseEntries []LicenseEntryResponse `json:"license_entries"`
	AiProviders    []AiProviderEntry      `json:"ai_providers"`
}

var configMutex sync.Mutex

func LoadConfigForAPI() ConfigForAPI {
	configMutex.Lock()
	defer configMutex.Unlock()

	raw, err := os.ReadFile("config.json")
	if err != nil {
		return ConfigForAPI{LicenseEntries: []LicenseEntryResponse{}, AiProviders: []AiProviderEntry{}}
	}
	var cfg config
	json.Unmarshal(raw, &cfg)
	var entries []LicenseEntryResponse
	for _, e := range cfg.LicenseEntries {
		entries = append(entries, LicenseEntryResponse{Name: e.Name})
	}
	return ConfigForAPI{LicenseEntries: entries, AiProviders: cfg.AiProviders}
}

func SaveLicenseEntries(entries []LicenseEntryRequest) error {
	configMutex.Lock()
	defer configMutex.Unlock()

	raw, err := os.ReadFile("config.json")
	if err != nil {
		raw = []byte("{}")
	}
	var cfg config
	json.Unmarshal(raw, &cfg)

	existingKeys := make(map[string]string)
	for _, e := range cfg.LicenseEntries {
		existingKeys[e.Name] = e.Key
	}

	var result []licenseEntry
	for _, e := range entries {
		if e.Name == "" {
			continue
		}
		key := e.Key
		if key == "" {
			if existing, ok := existingKeys[e.Name]; ok {
				key = existing
			} else {
				continue
			}
		} else {
			var err error
			key, err = Encrypt(key)
			if err != nil {
				return err
			}
		}
		result = append(result, licenseEntry{
			Name:      e.Name,
			Key:       key,
			Encrypted: true,
		})
	}
	cfg.LicenseEntries = result

	if len(entries) > 0 && entries[0].Name != "" && entries[0].Key != "" {
		cfg.UnidocLicenseKey = entries[0].Key
	}

	data, _ := json.MarshalIndent(cfg, "", "  ")
	return os.WriteFile("config.json", data, 0644)
}

func SaveAiProviders(providers []AiProviderEntry) error {
	configMutex.Lock()
	defer configMutex.Unlock()

	raw, err := os.ReadFile("config.json")
	if err != nil {
		raw = []byte("{}")
	}
	var cfg config
	json.Unmarshal(raw, &cfg)
	cfg.AiProviders = providers
	data, _ := json.MarshalIndent(cfg, "", "  ")
	return os.WriteFile("config.json", data, 0644)
}

func TestApiKey(provider string, apiKey string, model string, customEndpoint string, customFormat string) TestKeyResponse {
	if customEndpoint != "" {
		return testCustomEndpoint(customEndpoint, apiKey, model, customFormat)
	}

	baseURL := getDefaultBaseURL(provider)
	return testModelsEndpoint(baseURL, apiKey)
}

func getDefaultBaseURL(provider string) string {
	switch provider {
	case "阿里云":
		return "https://dashscope.aliyuncs.com/compatible-mode"
	case "智谱":
		return "https://open.bigmodel.cn/api/paas/v4"
	case "DeepSeek":
		return "https://api.deepseek.com"
	case "Moonshot":
		return "https://api.moonshot.cn/v1"
	case "零一万物":
		return "https://api.lingyiwanwu.com/v1"
	case "OpenAI":
		return "https://api.openai.com/v1"
	case "Anthropic":
		return "https://api.anthropic.com/v1"
	case "Google":
		return "https://generativelanguage.googleapis.com/v1beta"
	case "Mistral":
		return "https://api.mistral.ai/v1"
	case "Groq":
		return "https://api.groq.com/openai/v1"
	default:
		return provider
	}
}

func trimEndpointSuffix(ep string) string {
	if strings.HasSuffix(ep, "/chat/completions") {
		return ep[:len(ep)-len("/chat/completions")]
	}
	if strings.HasSuffix(ep, "/messages") {
		return ep[:len(ep)-len("/messages")]
	}
	return ep
}

func testModelsEndpoint(baseURL string, apiKey string) TestKeyResponse {
	modelsURL := trimEndpointSuffix(baseURL) + "/models"
	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, modelsURL, nil)
	if err != nil {
		return TestKeyResponse{Available: false, Error: fmt.Sprintf("request error: %v", err)}
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return TestKeyResponse{Available: false, Error: fmt.Sprintf("connection failed: %v", err)}
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusOK:
		return TestKeyResponse{Available: true}
	case http.StatusUnauthorized, http.StatusForbidden:
		return TestKeyResponse{Available: false, Error: "API key invalid"}
	case http.StatusNotFound:
		return testChatCompletions(trimEndpointSuffix(baseURL), apiKey, "")
	default:
		return TestKeyResponse{Available: false, Error: fmt.Sprintf("unexpected status %d", resp.StatusCode)}
	}
}

func testCustomEndpoint(endpoint string, apiKey string, model string, format string) TestKeyResponse {
	normalized := trimEndpointSuffix(endpoint)

	modelsURL := normalized + "/models"
	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, modelsURL, nil)
	if err != nil {
		return TestKeyResponse{Available: false, Error: fmt.Sprintf("request error: %v", err)}
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return TestKeyResponse{Available: false, Error: fmt.Sprintf("connection failed: %v", err)}
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusOK:
		return TestKeyResponse{Available: true}
	case http.StatusUnauthorized, http.StatusForbidden:
		return TestKeyResponse{Available: false, Error: "API key invalid"}
	case http.StatusNotFound:
		return testChatCompletions(normalized, apiKey, model)
	default:
		return TestKeyResponse{Available: false, Error: fmt.Sprintf("unexpected status %d", resp.StatusCode)}
	}
}

func testChatCompletions(baseURL string, apiKey string, model string) TestKeyResponse {
	isAnthropic := strings.EqualFold(model, "anthropic")
	var messagesURL string
	if isAnthropic {
		messagesURL = baseURL + "/messages"
	} else {
		messagesURL = baseURL + "/chat/completions"
	}

	payload := map[string]any{
		"model":    model,
		"messages": []map[string]string{{"role": "user", "content": "Hi"}},
	}
	if isAnthropic {
		payload["max_tokens"] = 1
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return TestKeyResponse{Available: false, Error: fmt.Sprintf("marshal error: %v", err)}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, messagesURL, bytes.NewReader(body))
	if err != nil {
		return TestKeyResponse{Available: false, Error: fmt.Sprintf("request error: %v", err)}
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)
	if isAnthropic {
		req.Header.Set("x-api-key", apiKey)
		req.Header.Set("anthropic-version", "2023-06-01")
	}

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return TestKeyResponse{Available: false, Error: fmt.Sprintf("connection failed: %v", err)}
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	switch resp.StatusCode {
	case http.StatusOK:
		return TestKeyResponse{Available: true}
	case http.StatusUnauthorized, http.StatusForbidden:
		return TestKeyResponse{Available: false, Error: "API key invalid"}
	default:
		errorMsg := string(respBody)
		if len(errorMsg) > 200 {
			errorMsg = errorMsg[:200]
		}
		return TestKeyResponse{Available: false, Error: fmt.Sprintf("status %d: %s", resp.StatusCode, errorMsg)}
	}
}

type config struct {
	UnidocLicenseKey string            `json:"unidoc_license_key"`
	LicenseEntries   []licenseEntry    `json:"license_entries"`
	AiProviders      []AiProviderEntry `json:"ai_providers"`
}
