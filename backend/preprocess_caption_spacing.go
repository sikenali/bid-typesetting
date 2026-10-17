package wordformat

import (
	"regexp"

	"github.com/unidoc/unioffice/v2/document"
	"github.com/unidoc/unioffice/v2/measurement"
)

func AdjustCaptionSpacing(doc *document.Document, cfg *Config) error {
	reFig := regexp.MustCompile(`^[图圖](\s*)([\d一二三四五六七八九十百千]+)`)
	reTbl := regexp.MustCompile(`^表(\s*)([\d一二三四五六七八九十百千]+)`)

	for _, p := range doc.Paragraphs() {
		text := paragraphText(p)

		switch {
		case reFig.MatchString(text) && cfg.PreprocessFigCaption:
			spaces := twipsFromChar(cfg.PreprocessFigCaptionSpaces)
			p.SetBeforeSpacing(measurement.Distance(spaces) * measurement.Twips)
			p.SetAfterSpacing(measurement.Distance(spaces) * measurement.Twips)
		case reTbl.MatchString(text) && cfg.PreprocessTblCaption:
			spaces := twipsFromChar(cfg.PreprocessTblCaptionSpaces)
			p.SetBeforeSpacing(measurement.Distance(spaces) * measurement.Twips)
			p.SetAfterSpacing(measurement.Distance(spaces) * measurement.Twips)
		}
	}
	return nil
}

func twipsFromChar(chars int) float64 {
	return float64(chars * 200)
}
