package wordformat

import (
	"path/filepath"
	"strings"
	"testing"

	"github.com/unidoc/unioffice/v2/document"
)

func bodyStyleDoc(t *testing.T, s *BodyStyle) string {
	t.Helper()
	doc := document.New()
	doc.AddParagraph().AddRun().AddText("正文第一段")
	doc.AddParagraph().AddRun().AddText("正文第二段")
	if err := ApplyBodyFormat(doc, s); err != nil {
		t.Fatal(err)
	}
	out := filepath.Join(t.TempDir(), "out.docx")
	if err := SaveDocx(doc, out, ""); err != nil {
		t.Fatal(err)
	}
	parts := savedPackage(t, out)
	validateDocxPackage(t, parts)
	return string(parts["word/document.xml"])
}

// 验证 UI 新增控件对应的前端字段在后端确实生效：
// color / highlight / underline_type / strike / keep_with_next / page_break_before
func TestBodyStyleFieldsTakeEffect(t *testing.T) {
	xml := bodyStyleDoc(t, &BodyStyle{
		CNFont:           "仿宋",
		SizeCN:           "三号",
		LineSpacingMode:  "EXACT",
		LineSpacingValue: 28,
		Align:            "JUSTIFY",
		Underline:        true,
		UnderlineType:    "double",
		Color:            "#C00000",
		Highlight:        "yellow",
		Strike:           true,
		KeepWithNext:     true,
		PageBreakBefore:  true,
	})

	checks := map[string]string{
		"下划线样式 double": `w:val="double"`,
		"字体颜色 #C00000": `w:val="c00000"`, // unioffice 输出十六进制时会统一转小写
		"高亮底纹 yellow":  `w:val="yellow"`,
		"删除线":          "w:strike",
		"与下段同页":        "w:keepNext",
		"段前分页":         "w:pageBreakBefore",
		"中文字体 仿宋":      "仿宋",
		"两端对齐":         `w:val="both"`,
	}
	for name, needle := range checks {
		if !strings.Contains(xml, needle) {
			t.Errorf("%s 未生效，document.xml 中缺少 %q", name, needle)
		}
	}
}

// 默认全关时不应注入这些属性，避免污染原始文档
func TestBodyStyleFieldsDefaultOff(t *testing.T) {
	xml := bodyStyleDoc(t, &BodyStyle{
		CNFont:           "仿宋",
		SizeCN:           "三号",
		LineSpacingMode:  "EXACT",
		LineSpacingValue: 28,
		Align:            "JUSTIFY",
	})
	for _, needle := range []string{"w:strike", "w:keepNext", "w:pageBreakBefore", "w:highlight", "w:u "} {
		if strings.Contains(xml, needle) {
			t.Errorf("默认配置不应注入 %q", needle)
		}
	}
}

// 纸张方向 landscape 应改到 sectPr，而不是静默忽略
func TestMarginsOrientationLandscape(t *testing.T) {
	doc := document.New()
	doc.AddParagraph().AddRun().AddText("正文")

	m := Margins{
		PaperSize:     "A4",
		PaperWidthCM:  21.0,
		PaperHeightCM: 29.7,
		TopCM:         2.54,
		BottomCM:      2.54,
		LeftCM:        3.17,
		RightCM:       3.17,
		Orientation:   "landscape",
	}
	if err := ApplyPageSetup(doc, &m); err != nil {
		t.Fatal(err)
	}
	out := filepath.Join(t.TempDir(), "out.docx")
	if err := SaveDocx(doc, out, ""); err != nil {
		t.Fatal(err)
	}
	parts := savedPackage(t, out)
	validateDocxPackage(t, parts)

	sect := sectPrXML(t, parts)
	if !strings.Contains(sect, "landscape") {
		t.Errorf("横向未生效，sectPr: %s", sect)
	}
	if !strings.Contains(sect, "portrait") {
		t.Logf("portrait 未出现在 sectPr（预期，横向时不应出现）")
	}
}

func sectPrXML(t *testing.T, parts map[string][]byte) string {
	t.Helper()
	xml := string(parts["word/document.xml"])
	i := strings.Index(xml, "<w:sectPr")
	if i < 0 {
		t.Fatal("document.xml 中找不到 sectPr")
	}
	j := strings.Index(xml[i:], "</w:sectPr>")
	if j < 0 {
		return xml[i:]
	}
	return xml[i : i+j+len("</w:sectPr>")]
}
