package wordformat

import (
	"regexp"

	"github.com/unidoc/unioffice/document"
	"github.com/unidoc/unioffice/measurement"
	"github.com/unidoc/unioffice/schema/soo/wml"
)

func ApplyCaptionFormats(doc *document.Document, fig, tbl *CaptionStyle) error {
	reFig := regexp.MustCompile(`^[图圖]`)
	reTbl := regexp.MustCompile(`^表`)

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

		p.SetAlignment(wml.ST_JcCenter)
		p.SetFirstLineIndent(0)
		p.SetLineSpacing(
			twipsFromLineSpacing(style.LineSpacingMode, style.LineSpacingValue)*measurement.Twips,
			lineSpacingEnum(style.LineSpacingMode))
		p.SetBeforeSpacing(twipsFromSpacing(style.SpaceBeforeValue, style.SpaceBeforeUnit) * measurement.Twips)
		p.SetAfterSpacing(twipsFromSpacing(style.SpaceAfterValue, style.SpaceAfterUnit) * measurement.Twips)

		for _, r := range p.Runs() {
			rPr := r.Properties()
			if style.ENFont != "" || style.CNFont != "" {
				font := style.ENFont
				if font == "" {
					font = style.CNFont
				}
				rPr.SetFontFamily(font)
				if style.CNFont != "" && style.CNFont != style.ENFont {
					rPr.X().RFonts.EastAsiaAttr = &style.CNFont
				}
			}
			rPr.SetSize(cnSizeToHalfPoints(style.SizeCN) * measurement.HalfPoint)
			rPr.SetBold(style.Bold)
		}
	}
	return nil
}
