package wordformat

import (
	"fmt"

	"github.com/unidoc/unioffice/measurement"

	"github.com/unidoc/unioffice/document"
)

func ApplyTOCFormat(doc *document.Document, toc *TOCConfig) error {
	for _, p := range doc.Paragraphs() {
		styleID := p.Style()

		if styleID == "TOCHeading" {
			for _, r := range p.Runs() {
				rPr := r.Properties()
				if toc.TitleENFont != "" || toc.TitleCNFont != "" {
					font := toc.TitleENFont
					if font == "" {
						font = toc.TitleCNFont
					}
					rPr.SetFontFamily(font)
					if toc.TitleCNFont != "" && toc.TitleCNFont != toc.TitleENFont {
						rPr.X().RFonts.EastAsiaAttr = &toc.TitleCNFont
					}
				}
				rPr.SetSize(cnSizeToHalfPoints(toc.TitleSizeCN) * measurement.HalfPoint)
			}
			continue
		}

		for i, ls := range toc.LevelStyles {
			if styleID == fmt.Sprintf("toc%d", i+1) ||
				styleID == fmt.Sprintf("TOC%d", i+1) {
				for _, r := range p.Runs() {
					rPr := r.Properties()
					if ls.ENFont != "" || ls.CNFont != "" {
						font := ls.ENFont
						if font == "" {
							font = ls.CNFont
						}
						rPr.SetFontFamily(font)
						if ls.CNFont != "" && ls.CNFont != ls.ENFont {
							rPr.X().RFonts.EastAsiaAttr = &ls.CNFont
						}
					}
					rPr.SetSize(cnSizeToHalfPoints(ls.SizeCN) * measurement.HalfPoint)
					rPr.SetBold(ls.Bold)
					if ls.ColorRGB != [3]int{0, 0, 0} {
						hex := fmt.Sprintf("%02X%02X%02X", ls.ColorRGB[0], ls.ColorRGB[1], ls.ColorRGB[2])
						rPr.SetColor(colorFromHex(hex))
					}
				}
				if ls.LeftIndentChars > 0 {
					p.SetLeftIndent(measurement.Distance(ls.LeftIndentChars*200) * measurement.Twips)
				}
			}
		}
	}
	return nil
}
