package wordformat

import (
	"github.com/unidoc/unioffice/v2/color"
	"github.com/unidoc/unioffice/v2/document"
	"github.com/unidoc/unioffice/v2/measurement"
	"github.com/unidoc/unioffice/v2/schema/soo/wml"
)

func applyStyleToRun(r document.Run, s *BodyStyle) {
	rPr := r.Properties()
	if s.ENFont != "" || s.CNFont != "" {
		font := s.ENFont
		if font == "" {
			font = s.CNFont
		}
		rPr.SetFontFamily(font)
		if s.CNFont != "" && s.CNFont != s.ENFont {
			cn := s.CNFont
			rPr.X().RFonts.EastAsiaAttr = &cn
		}
	}
	if s.SizeCN != "" {
		rPr.SetSize(cnSizeToHalfPoints(s.SizeCN) * measurement.HalfPoint)
	}
	if s.Bold {
		rPr.SetBold(true)
	}
	if s.Italic {
		rPr.SetItalic(true)
	}
	if s.Strike {
		rPr.SetStrikeThrough(true)
	}
	if s.Underline {
		ut := s.UnderlineType
		if ut == "" {
			ut = "single"
		}
		uc := s.Color
		if uc == "" {
			uc = "#000000"
		}
		rPr.SetUnderline(underlineFromType(ut), color.FromHex(uc))
	}
	if s.Color != "" {
		rPr.SetColor(colorFromHex(s.Color))
	}
	if s.Highlight != "" {
		if hc, ok := highlightFromString(s.Highlight); ok {
			rPr.SetHighlight(hc)
		}
	}
}

func applyParagraphSpacing(p document.Paragraph, s *BodyStyle) {
	if s.LineSpacingMode != "" {
		p.SetLineSpacing(
			twipsFromLineSpacing(s.LineSpacingMode, s.LineSpacingValue)*measurement.Twips,
			lineSpacingEnum(s.LineSpacingMode))
	}
	if s.SpaceBeforeValue > 0 || s.SpaceBeforeUnit != "" {
		p.SetBeforeSpacing(twipsFromSpacing(s.SpaceBeforeValue, s.SpaceBeforeUnit) * measurement.Twips)
	}
	if s.SpaceAfterValue > 0 || s.SpaceAfterUnit != "" {
		p.SetAfterSpacing(twipsFromSpacing(s.SpaceAfterValue, s.SpaceAfterUnit) * measurement.Twips)
	}
	if s.FirstLineIndentChars > 0 {
		p.SetFirstLineIndent(measurement.Distance(s.FirstLineIndentChars*charWidthTwips(s.CNFont)) * measurement.Twips)
	}
	if s.LeftIndentValue > 0 {
		p.SetLeftIndent(twipsFromIndentValue(s.LeftIndentValue, s.LeftIndentUnit) * measurement.Twips)
	}
	if s.RightIndentValue > 0 {
		p.SetRightIndent(twipsFromIndentValue(s.RightIndentValue, s.RightIndentUnit) * measurement.Twips)
	}
	if s.KeepWithNext {
		setKeepWithNext(p, true)
	}
	if s.PageBreakBefore {
		setPageBreakBefore(p, true)
	}
}

func charWidthTwips(cnFont string) float64 {
	if cnFont == "" {
		return 256
	}
	if isCJKFont(cnFont) {
		return 256
	}
	return 200
}

func isCJKFont(name string) bool {
	for _, c := range name {
		if c >= 0x4E00 && c <= 0x9FFF {
			return true
		}
	}
	return false
}

func setKeepWithNext(p document.Paragraph, on bool) {
	pPr := p.X().PPr
	if pPr == nil {
		return
	}
	if on {
		pPr.KeepNext = wml.NewCT_OnOff()
	} else {
		pPr.KeepNext = nil
	}
}

func setPageBreakBefore(p document.Paragraph, on bool) {
	pPr := p.X().PPr
	if pPr == nil {
		return
	}
	if on {
		pPr.PageBreakBefore = wml.NewCT_OnOff()
	} else {
		pPr.PageBreakBefore = nil
	}
}

func highlightFromString(s string) (wml.ST_HighlightColor, bool) {
	switch s {
	case "yellow", "YELLOW", "黄色":
		return wml.ST_HighlightColorYellow, true
	case "green", "GREEN", "绿色":
		return wml.ST_HighlightColorGreen, true
	case "cyan", "CYAN", "青色":
		return wml.ST_HighlightColorCyan, true
	case "red", "RED", "红色":
		return wml.ST_HighlightColorRed, true
	case "magenta", "MAGENTA", "品红":
		return wml.ST_HighlightColorMagenta, true
	case "blue", "BLUE", "蓝色":
		return wml.ST_HighlightColorBlue, true
	case "black", "BLACK", "黑色":
		return wml.ST_HighlightColorBlack, true
	case "darkBlue", "DARKBLUE", "深蓝":
		return wml.ST_HighlightColorDarkBlue, true
	case "darkCyan", "DARKCYAN", "深青":
		return wml.ST_HighlightColorDarkCyan, true
	case "darkGreen", "DARKGREEN", "深绿":
		return wml.ST_HighlightColorDarkGreen, true
	case "darkMagenta", "DARKMAGENTA", "深品红":
		return wml.ST_HighlightColorDarkMagenta, true
	case "darkRed", "DARKRED", "深红":
		return wml.ST_HighlightColorDarkRed, true
	case "darkYellow", "DARKYELLOW", "深黄":
		return wml.ST_HighlightColorDarkYellow, true
	case "darkGray", "DARKGRAY", "深灰":
		return wml.ST_HighlightColorDarkGray, true
	case "lightGray", "LIGHTGRAY", "浅灰":
		return wml.ST_HighlightColorLightGray, true
	case "none", "无":
		return wml.ST_HighlightColorNone, true
	}
	return wml.ST_HighlightColorNone, false
}

func ApplyBodyFormat(doc *document.Document, s *BodyStyle) error {
	for _, p := range doc.Paragraphs() {
		styleID := p.Style()
		if isHeading(styleID) {
			continue
		}

		if s.Align != "" {
			p.SetAlignment(alignFromString(s.Align))
		}

		applyParagraphSpacing(p, s)

		for _, r := range p.Runs() {
			applyStyleToRun(r, s)
		}
	}
	return nil
}

func isHeading(styleID string) bool {
	return matchHeadingLevel(styleID) > 0 || (len(styleID) >= 3 && styleID[:3] == "TOC")
}
