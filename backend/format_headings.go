package wordformat

import (
	"fmt"

	"github.com/unidoc/unioffice/document"
	"github.com/unidoc/unioffice/measurement"
	"github.com/unidoc/unioffice/schema/soo/wml"
)

func ApplyHeadingFormats(doc *document.Document, hs []HeadingStyle) error {
	for _, p := range doc.Paragraphs() {
		styleID := p.Style()
		for level, h := range hs {
			if styleID == fmt.Sprintf("Heading%d", level+1) {
				p.SetAlignment(wml.ST_JcStart)

				p.SetLineSpacing(
					twipsFromLineSpacing(h.LineSpacingMode, h.LineSpacingValue)*measurement.Twips,
					lineSpacingEnum(h.LineSpacingMode))
				p.SetBeforeSpacing(twipsFromSpacing(h.SpaceBeforeValue, h.SpaceBeforeUnit) * measurement.Twips)
				p.SetAfterSpacing(twipsFromSpacing(h.SpaceAfterValue, h.SpaceAfterUnit) * measurement.Twips)

				if h.FirstLineIndentChars > 0 {
					p.SetFirstLineIndent(measurement.Distance(h.FirstLineIndentChars*200) * measurement.Twips)
				}
				if h.LeftIndentValue > 0 {
					p.SetLeftIndent(measurement.Distance(h.LeftIndentValue*200) * measurement.Twips)
				}
				if h.RightIndentValue > 0 {
					p.SetRightIndent(measurement.Distance(h.RightIndentValue*200) * measurement.Twips)
				}

				for _, r := range p.Runs() {
					rPr := r.Properties()
					if h.ENFont != "" || h.CNFont != "" {
						font := h.ENFont
						if font == "" {
							font = h.CNFont
						}
						rPr.SetFontFamily(font)
						if h.CNFont != "" && h.CNFont != h.ENFont {
							rPr.X().RFonts.EastAsiaAttr = &h.CNFont
						}
					}
					rPr.SetSize(cnSizeToHalfPoints(h.SizeCN) * measurement.HalfPoint)
					rPr.SetBold(h.Bold)
					if h.Italic {
						rPr.SetItalic(true)
					}
				}
			}
		}
	}
	return nil
}
