package main

import (
	"encoding/json"
	"fmt"
	"os"

	wordformat "github.com/anomalyco/bid-pageformatting-backend"
	"github.com/unidoc/unioffice/v2/document"
)

func main() {
	if len(os.Args) < 3 {
		fmt.Fprintf(os.Stderr, "用法: %s <config.json> <input.docx> [output.docx]\n", os.Args[0])
		os.Exit(1)
	}

	configPath := os.Args[1]
	inputPath := os.Args[2]
	outputPath := inputPath
	if len(os.Args) >= 4 {
		outputPath = os.Args[3]
	}

	cfgBytes, err := os.ReadFile(configPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "读取配置失败: %v\n", err)
		os.Exit(1)
	}

	var cfg wordformat.Config
	if err := json.Unmarshal(cfgBytes, &cfg); err != nil {
		fmt.Fprintf(os.Stderr, "解析配置失败: %v\n", err)
		os.Exit(1)
	}

	doc, err := document.Open(inputPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "打开文档失败: %v\n", err)
		os.Exit(1)
	}
	defer doc.Close()

	if err := wordformat.RunPipeline(doc, &cfg); err != nil {
		fmt.Fprintf(os.Stderr, "排版流水线失败: %v\n", err)
		os.Exit(1)
	}

	if err := wordformat.SaveDocx(doc, outputPath); err != nil {
		fmt.Fprintf(os.Stderr, "保存文档失败: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("✓ 格式化完成: %s\n", outputPath)
}
