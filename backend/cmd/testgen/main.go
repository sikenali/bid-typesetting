package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	wordformat "github.com/anomalyco/bid-pageformatting-backend"
	"github.com/unidoc/unioffice/v2/color"
	"github.com/unidoc/unioffice/v2/document"
	"github.com/unidoc/unioffice/v2/schema/soo/wml"
)

func main() {
	if len(os.Args) < 3 {
		fmt.Fprintf(os.Stderr, "用法: %s <config.json> <output.docx> [input.docx]\n", os.Args[0])
		os.Exit(1)
	}
	configPath := os.Args[1]
	outputPath := os.Args[2]
	var inputPath string
	if len(os.Args) >= 4 {
		inputPath = os.Args[3]
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

	var doc *document.Document
	if inputPath != "" {
		doc, err = document.Open(inputPath)
		if err != nil {
			fmt.Fprintf(os.Stderr, "打开输入文档失败: %v\n", err)
			os.Exit(1)
		}
	} else {
		doc = buildSampleDoc()
	}
	defer doc.Close()

	if err := wordformat.RunPipeline(doc, &cfg); err != nil {
		fmt.Fprintf(os.Stderr, "排版流水线失败: %v\n", err)
		os.Exit(1)
	}

	if err := os.MkdirAll(filepath.Dir(outputPath), 0o755); err != nil {
		fmt.Fprintf(os.Stderr, "创建输出目录失败: %v\n", err)
		os.Exit(1)
	}
	if err := wordformat.SaveDocx(doc, outputPath); err != nil {
		fmt.Fprintf(os.Stderr, "保存文档失败: %v\n", err)
		os.Exit(1)
	}

	// Print summary
	st, _ := os.Stat(outputPath)
	fmt.Printf("✓ 格式化完成: %s (%.1f KB)\n", outputPath, float64(st.Size())/1024.0)
}

func buildSampleDoc() *document.Document {
	doc := document.New()

	// Document title (heading 1)
	p := doc.AddParagraph()
	p.SetStyle("Heading1")
	p.AddRun().AddText("投标文件标准排版测试")

	// Body intro
	p = doc.AddParagraph()
	p.AddRun().AddText("本测试文档用于验证 unioffice 后端对所有前端字段的实际处理效果。")

	// Heading 2
	p = doc.AddParagraph()
	p.SetStyle("Heading2")
	p.AddRun().AddText("一、章节标题测试")

	// Body text with first line indent
	p = doc.AddParagraph()
	p.AddRun().AddText("本段落用于测试正文字体（小四宋体）、行距（1.5 倍）、首行缩进（2 字符）、两端对齐。")

	// Heading 3
	p = doc.AddParagraph()
	p.SetStyle("Heading3")
	p.AddRun().AddText("1.1 表格测试")

	// Body before table
	p = doc.AddParagraph()
	p.AddRun().AddText("下表用于测试表格格式：居中、五号宋体、全部边框、最小行高 20 磅。")

	// Sample table
	tbl := doc.AddTable()
	tbl.Properties().SetStyle("TableGrid")
	for r := 0; r < 4; r++ {
		row := tbl.AddRow()
		for c := 0; c < 3; c++ {
			cell := row.AddCell()
			cell.AddParagraph().AddRun().AddText(fmt.Sprintf("行%d列%d", r+1, c+1))
		}
	}

	// Caption (fig)
	p = doc.AddParagraph()
	p.AddRun().AddText("图1  投标文件标准结构示意图")

	// Heading 3
	p = doc.AddParagraph()
	p.SetStyle("Heading3")
	p.AddRun().AddText("1.2 中英文混排测试")

	// Body with mixed CJK + ASCII
	p = doc.AddParagraph()
	p.AddRun().AddText("本段测试 AddSpace：Bid Formatting Tool 支持 DOCX 文件的中英文混排，例如 UNIOCFFICE v1.39 API 调用。")

	// Heading 4
	p = doc.AddParagraph()
	p.SetStyle("Heading4")
	p.AddRun().AddText("1.2.1 编号列表测试")

	// Numbered paragraphs
	for i := 1; i <= 3; i++ {
		p = doc.AddParagraph()
		p.AddRun().AddText(fmt.Sprintf("%d）这是第 %d 个编号段落。", i, i))
	}

	// TOC marker
	p = doc.AddParagraph()
	p.SetStyle("TOCHeading")
	p.AddRun().AddText("目录")

	// TOC entry placeholder paragraphs (use SetStyle to set style on the paragraph)
	p = doc.AddParagraph()
	p.SetStyle("toc1")
	p.AddRun().AddText("一、章节标题测试")

	p = doc.AddParagraph()
	p.SetStyle("toc2")
	p.AddRun().AddText("1.1 表格测试")

	// More body
	p = doc.AddParagraph()
	p.AddRun().AddText("下表是预处理阶段的表格单元格格式测试：")

	tbl2 := doc.AddTable()
	tbl2.Properties().SetStyle("TableGrid")
	for r := 0; r < 3; r++ {
		row := tbl2.AddRow()
		for c := 0; c < 4; c++ {
			cell := row.AddCell()
			cell.AddParagraph().AddRun().AddText(fmt.Sprintf("预处理表格 %d-%d", r+1, c+1))
		}
	}

	// Body with strike + highlight
	p = doc.AddParagraph()
	p.AddRun().AddText("下划线/删除线/高亮测试：")
	p2 := doc.AddParagraph()
	run := p2.AddRun()
	run.AddText("高亮文本")
	run.Properties().SetHighlight(wml.ST_HighlightColorYellow)
	run2 := p2.AddRun()
	run2.AddText("  删除线  ")
	run2.Properties().SetStrikeThrough(true)
	run3 := p2.AddRun()
	run3.AddText("下划线文本")
	run3.Properties().SetUnderline(wml.ST_UnderlineDouble, color.FromHex("#000000"))

	return doc
}
