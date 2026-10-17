package wordformat

import (
	"regexp"

	"github.com/unidoc/unioffice/v2/document"
)

func ApplyCaptionFormats(doc *document.Document, fig, tbl *CaptionStyle) error {
	reFig := regexp.MustCompile(`^[图圖]\s*\d`)
	reTbl := regexp.MustCompile(`^表\s*\d`)

	for _, p := range doc.Paragraphs() {
		text := paragraphText(p)
		var style *CaptionStyle
		switch {
		case reFig.MatchString(text):
			style = fig
		case reTbl.MatchString(text):
			style = tbl
		default:
			continue
		}
		if style == nil {
			continue
		}

		if style.Align != "" {
			p.SetAlignment(alignFromString(style.Align))
		} else {
			p.SetAlignment(alignFromString("CENTER"))
		}

		applyParagraphSpacing(p, &style.BodyStyle)

		for _, r := range p.Runs() {
			applyStyleToRun(r, &style.BodyStyle)
		}
	}
	return nil
}
