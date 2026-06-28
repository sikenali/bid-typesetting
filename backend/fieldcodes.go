package wordformat

import (
	"fmt"
	"strings"

	"github.com/unidoc/unioffice/measurement"

	"github.com/unidoc/unioffice/document"
)

func InjectTOC(doc *document.Document, tocCfg *TOCConfig) error {
	if !tocCfg.Enable {
		return nil
	}

	for _, p := range doc.Paragraphs() {
		text := paragraphText(p)
		if strings.TrimSpace(text) == tocCfg.TitleText {
			return injectTOCFieldCode(doc, tocCfg)
		}
	}

	return injectTOCAtEnd(doc, tocCfg)
}

func injectTOCFieldCode(doc *document.Document, tocCfg *TOCConfig) error {
	levels := len(tocCfg.LevelStyles)
	if levels < 1 {
		levels = 4
	}

	p := doc.AddParagraph()
	p.SetStyle("TOCHeading")

	titleRun := p.AddRun()
	if tocCfg.TitleENFont != "" || tocCfg.TitleCNFont != "" {
		font := tocCfg.TitleENFont
		if font == "" {
			font = tocCfg.TitleCNFont
		}
		titleRun.Properties().SetFontFamily(font)
		if tocCfg.TitleCNFont != "" && tocCfg.TitleCNFont != tocCfg.TitleENFont {
			titleRun.Properties().X().RFonts.EastAsiaAttr = &tocCfg.TitleCNFont
		}
	}
	titleRun.Properties().SetSize(cnSizeToHalfPoints(tocCfg.TitleSizeCN) * measurement.HalfPoint)
	titleRun.AddText(tocCfg.TitleText)

	tocRun := p.AddRun()
	tocRun.AddTOC(&document.TOCOptions{
		UseHyperlinks: true,
		HeadingLevel:  fmt.Sprintf("1-%d", levels),
	})

	tocRun.AddText("（打开文档后按 F9 刷新目录）")

	return nil
}

func injectTOCAtEnd(doc *document.Document, tocCfg *TOCConfig) error {
	return injectTOCFieldCode(doc, tocCfg)
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
