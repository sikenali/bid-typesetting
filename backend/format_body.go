package wordformat

import (
	"github.com/unidoc/unioffice/document"
	"github.com/unidoc/unioffice/measurement"
	"github.com/unidoc/unioffice/schema/soo/wml"
)

func ApplyBodyFormat(doc *document.Document, s *BodyStyle) error {
	cnSize := cnSizeToHalfPoints(s.SizeCN)

	for _, p := range doc.Paragraphs() {
		styleID := p.Style()
		if isHeading(styleID) {
			continue
		}

		switch s.Align {
		case "JUSTIFY":
			p.SetAlignment(wml.ST_JcBoth)
		case "LEFT":
			p.SetAlignment(wml.ST_JcStart)
		case "CENTER":
			p.SetAlignment(wml.ST_JcCenter)
		case "RIGHT":
			p.SetAlignment(wml.ST_JcEnd)
		}

		if s.FirstLineIndentChars > 0 {
			p.SetFirstLineIndent(measurement.Distance(s.FirstLineIndentChars*200) * measurement.Twips)
		}
		if s.LeftIndentValue > 0 {
			p.SetLeftIndent(measurement.Distance(s.LeftIndentValue*200) * measurement.Twips)
		}
		if s.RightIndentValue > 0 {
			p.SetRightIndent(measurement.Distance(s.RightIndentValue*200) * measurement.Twips)
		}

		p.SetLineSpacing(
			twipsFromLineSpacing(s.LineSpacingMode, s.LineSpacingValue)*measurement.Twips,
			lineSpacingEnum(s.LineSpacingMode))

		p.SetBeforeSpacing(twipsFromSpacing(s.SpaceBeforeValue, s.SpaceBeforeUnit) * measurement.Twips)
		p.SetAfterSpacing(twipsFromSpacing(s.SpaceAfterValue, s.SpaceAfterUnit) * measurement.Twips)

		for _, r := range p.Runs() {
			rPr := r.Properties()
			if s.ENFont != "" || s.CNFont != "" {
				font := s.ENFont
				if font == "" {
					font = s.CNFont
				}
				rPr.SetFontFamily(font)
				if s.CNFont != "" && s.CNFont != s.ENFont {
					rPr.X().RFonts.EastAsiaAttr = &s.CNFont
				}
			}
			rPr.SetSize(cnSize * measurement.HalfPoint)
			rPr.SetBold(s.Bold)
			if s.Italic {
				rPr.SetItalic(true)
			}
		}
	}
	return nil
}

func isHeading(styleID string) bool {
	return len(styleID) >= 7 && styleID[:7] == "Heading" ||
		len(styleID) >= 3 && styleID[:3] == "TOC"
}
