package wordformat

import (
	"archive/zip"
	"io"
	"path/filepath"
	"strings"
	"testing"

	"github.com/unidoc/unioffice/v2/document"
)

func TestSaveDocxWritesUpdateFields(t *testing.T) {
	doc := document.New()
	doc.AddParagraph().AddRun().AddText("正文")

	if err := RunPipeline(doc, &Config{AutoRefreshFields: true}); err != nil {
		t.Fatal(err)
	}

	out := filepath.Join(t.TempDir(), "out.docx")
	if err := SaveDocx(doc, out, ""); err != nil {
		t.Fatal(err)
	}

	zr, err := zip.OpenReader(out)
	if err != nil {
		t.Fatal(err)
	}
	defer zr.Close()

	for _, f := range zr.File {
		if f.Name != "word/settings.xml" {
			continue
		}
		rc, err := f.Open()
		if err != nil {
			t.Fatal(err)
		}
		b, _ := io.ReadAll(rc)
		rc.Close()
		if !strings.Contains(string(b), "updateFields") {
			t.Fatalf("word/settings.xml 缺少 updateFields 节点: %s", string(b))
		}
		return
	}
	t.Fatal("未在产物中找到 word/settings.xml")
}

func TestPipelineAutoRefreshFieldsEnabled(t *testing.T) {
	doc := document.New()
	doc.AddParagraph().AddRun().AddText("正文")

	if err := RunPipeline(doc, &Config{AutoRefreshFields: true}); err != nil {
		t.Fatal(err)
	}
	if doc.Settings.X().UpdateFields == nil {
		t.Fatal("auto_refresh_fields=true 时应在 settings.xml 写入 updateFields")
	}
}

func TestPipelineAutoRefreshFieldsDisabled(t *testing.T) {
	doc := document.New()
	doc.AddParagraph().AddRun().AddText("正文")

	if err := RunPipeline(doc, &Config{}); err != nil {
		t.Fatal(err)
	}
	if doc.Settings.X().UpdateFields != nil {
		t.Fatal("auto_refresh_fields=false 时不应写入 updateFields")
	}
}

func TestPipelinePostCleanStyles(t *testing.T) {
	doc := document.New()
	doc.AddParagraph().AddRun().AddText("中  文")
	doc.AddParagraph()
	doc.AddParagraph().AddRun().AddText("正文")

	if err := RunPipeline(doc, &Config{PreprocessPostCleanStyles: true}); err != nil {
		t.Fatal(err)
	}

	paras := doc.Paragraphs()
	if len(paras) != 2 {
		t.Fatalf("格式化后清理应删除空段落，期望 2 段，实际 %d 段", len(paras))
	}
	if got := paragraphText(paras[0]); got != "中 文" {
		t.Errorf("格式化后清理应收敛多余空格，实际 %q", got)
	}
}

func TestPipelinePostCleanStylesDisabled(t *testing.T) {
	doc := document.New()
	doc.AddParagraph().AddRun().AddText("中  文")
	doc.AddParagraph()
	doc.AddParagraph().AddRun().AddText("正文")

	if err := RunPipeline(doc, &Config{}); err != nil {
		t.Fatal(err)
	}

	if got := len(doc.Paragraphs()); got != 3 {
		t.Fatalf("未启用格式化后清理时不应改动段落数，期望 3 段，实际 %d 段", got)
	}
}
