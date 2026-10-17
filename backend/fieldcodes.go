package wordformat

import (
	"fmt"
	"strings"

	"github.com/unidoc/unioffice/v2/measurement"

	"github.com/unidoc/unioffice/v2/document"
)

func InjectTOC(doc *document.Document, tocCfg *TOCConfig) error {
	if tocCfg == nil || !tocCfg.Enable {
		return nil
	}

	for _, p := range doc.Paragraphs() {
		text := paragraphText(p)
		if strings.TrimSpace(text) == tocCfg.TitleText {
			return injectTOCFieldCode(doc, tocCfg, true)
		}
	}

	return injectTOCFieldCode(doc, tocCfg, false)
}

func tabLeaderValue(leader string) string {
	switch strings.ToUpper(leader) {
	case "DOT", "点", "点号":
		return "dot"
	case "HYPHEN", "连字符":
		return "hyphen"
	case "UNDERSCORE", "下划线":
		return "underscore"
	case "NONE", "无":
		return "none"
	}
	return ""
}

func injectTOCFieldCode(doc *document.Document, tocCfg *TOCConfig, insertAfterTitle bool) error {
	levels := len(tocCfg.LevelStyles)
	if levels < 1 {
		levels = 4
	}

	var p document.Paragraph
	if insertAfterTitle {
		p = doc.AddParagraph()
		p.SetStyle("TOCHeading")
	} else {
		p = doc.AddParagraph()
		p.SetStyle("TOCHeading")
	}

	titleRun := p.AddRun()
	if tocCfg.TitleENFont != "" || tocCfg.TitleCNFont != "" {
		font := tocCfg.TitleENFont
		if font == "" {
			font = tocCfg.TitleCNFont
		}
		titleRun.Properties().SetFontFamily(font)
		if tocCfg.TitleCNFont != "" && tocCfg.TitleCNFont != tocCfg.TitleENFont {
			cf := tocCfg.TitleCNFont
			titleRun.Properties().X().RFonts.EastAsiaAttr = &cf
		}
	}
	if tocCfg.TitleSizeCN != "" {
		titleRun.Properties().SetSize(cnSizeToHalfPoints(tocCfg.TitleSizeCN) * measurement.HalfPoint)
	}
	titleRun.AddText(tocCfg.TitleText)

	tocRun := p.AddRun()
	tocOpts := &document.TOCOptions{
		UseHyperlinks: true,
		HeadingLevel:  fmt.Sprintf("1-%d", levels),
	}
	tocRun.AddTOC(tocOpts)

	tocRun.AddText("（打开文档后按 F9 刷新目录）")

	return nil
}

func injectTOCAtEnd(doc *document.Document, tocCfg *TOCConfig) error {
	return injectTOCFieldCode(doc, tocCfg, false)
}

func paragraphText(p document.Paragraph) string {
	var sb strings.Builder
	for _, r := range p.Runs() {
		sb.WriteString(r.Text())
	}
	return sb.String()
}

func clearParagraphContent(p document.Paragraph) {
	for _, r := range p.Runs() {
		r.ClearContent()
	}
}
