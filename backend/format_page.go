package wordformat

import (
	"github.com/unidoc/unioffice/v2/color"
	"github.com/unidoc/unioffice/v2/document"
	"github.com/unidoc/unioffice/v2/measurement"
	"github.com/unidoc/unioffice/v2/schema/soo/ofc/sharedTypes"
	"github.com/unidoc/unioffice/v2/schema/soo/wml"
)

func ApplyPageSetup(doc *document.Document, m *Margins) error {
	return ApplyPageSetupWithHF(doc, m, nil)
}

func ApplyPageSetupWithHF(doc *document.Document, m *Margins, hf *HeaderFooter) error {
	section := doc.BodySection()

	top := measurement.Distance(twipsFromCM(m.TopCM) * measurement.Twips)
	right := measurement.Distance(twipsFromCM(m.RightCM) * measurement.Twips)
	bottom := measurement.Distance(twipsFromCM(m.BottomCM) * measurement.Twips)
	left := measurement.Distance(twipsFromCM(m.LeftCM) * measurement.Twips)
	header := measurement.Distance(twipsFromCM(m.HeaderMarginCM) * measurement.Twips)
	footer := header
	gutter := measurement.Distance(twipsFromCM(m.GutterCM) * measurement.Twips)

	if hf != nil {
		if hf.HeaderTopCM > 0 {
			header = measurement.Distance(twipsFromCM(hf.HeaderTopCM) * measurement.Twips)
		}
		if hf.FooterBottomCM > 0 {
			footer = measurement.Distance(twipsFromCM(hf.FooterBottomCM) * measurement.Twips)
		}
	}

	section.SetPageMargins(top, right, bottom, left, header, footer, gutter)

	if !m.KeepOriginalOrientation {
		var w, h measurement.Distance
		switch m.PaperSize {
		case "A4":
			w = measurement.Distance(11906)
			h = measurement.Distance(16838)
		case "A3":
			w = measurement.Distance(16838)
			h = measurement.Distance(23811)
		case "A5":
			w = measurement.Distance(8391)
			h = measurement.Distance(11906)
		case "B5":
			w = measurement.Distance(9979)
			h = measurement.Distance(14175)
		case "Letter":
			w = measurement.Distance(12240)
			h = measurement.Distance(15840)
		case "Legal":
			w = measurement.Distance(12240)
			h = measurement.Distance(20160)
		default:
			w = measurement.Distance(twipsFromCM(m.PaperWidthCM))
			h = measurement.Distance(twipsFromCM(m.PaperHeightCM))
		}
		orient := wml.ST_PageOrientationPortrait
		if m.Orientation == "landscape" || m.PaperSize == "A4-L" || m.PaperSize == "A3-L" {
			orient = wml.ST_PageOrientationLandscape
			w, h = h, w
		}
		section.SetPageSizeAndOrientation(
			w*measurement.Twips,
			h*measurement.Twips,
			orient)
	}

	if m.Columns > 1 {
		sectPr := section.X()
		if sectPr.Cols == nil {
			sectPr.Cols = wml.NewCT_Columns()
		}
		colNum := int64(m.Columns)
		sectPr.Cols.NumAttr = &colNum
		spaceVal := twipsFromCM(m.ColumnSpacingCM)
		if spaceVal < 0 {
			spaceVal = 0
		}
		spaceNum := uint64(spaceVal)
		sectPr.Cols.SpaceAttr = &sharedTypes.ST_TwipsMeasure{
			ST_UnsignedDecimalNumber: &spaceNum,
		}
	}

	return nil
}

func twipsFromCM(cm float64) float64 {
	return cm / 2.54 * 1440
}

func twipsFromLineSpacing(mode string, value float64) measurement.Distance {
	switch mode {
	case "EXACT", "FIXED":
		return measurement.Distance(value * 20)
	case "AT_LEAST":
		return measurement.Distance(value * 20)
	case "SINGLE":
		return 240
	case "MULTIPLE":
		return measurement.Distance(value * 240)
	}
	return 240
}

func lineSpacingEnum(mode string) wml.ST_LineSpacingRule {
	switch mode {
	case "EXACT", "FIXED":
		return wml.ST_LineSpacingRuleExact
	case "AT_LEAST":
		return wml.ST_LineSpacingRuleAtLeast
	case "SINGLE", "MULTIPLE", "AUTO":
		return wml.ST_LineSpacingRuleAuto
	}
	return wml.ST_LineSpacingRuleAuto
}

func twipsFromSpacing(value float64, unit string) measurement.Distance {
	switch unit {
	case "磅", "PT", "pt":
		return measurement.Distance(value * 20)
	case "行", "LINE", "line":
		return measurement.Distance(value * 240)
	case "char", "CHAR":
		return measurement.Distance(value * 200)
	}
	return measurement.Distance(value * 20)
}

func twipsFromIndentValue(value float64, unit string) measurement.Distance {
	switch unit {
	case "磅", "PT", "pt":
		return measurement.Distance(value * 20)
	case "cm", "CM":
		return measurement.Distance(twipsFromCM(value))
	case "char", "CHAR", "":
		return measurement.Distance(value * 200)
	}
	return measurement.Distance(value * 200)
}

func cnSizeToHalfPoints(cn string) measurement.Distance {
	m := map[string]float64{
		"初号": 42, "小初": 36, "一号": 26, "小一": 24,
		"二号": 22, "小二": 18, "三号": 16, "小三": 15,
		"四号": 14, "小四": 12, "五号": 10.5, "小五": 9,
		"六号": 7.5, "小六": 6.5, "七号": 5.5, "八号": 5,
	}
	if v, ok := m[cn]; ok {
		return measurement.Distance(v * 2)
	}
	if parsed := parseFloatFromCN(cn); parsed > 0 {
		return measurement.Distance(parsed * 2)
	}
	return 28
}

func parseFloatFromCN(s string) float64 {
	var v float64
	dec := false
	decDiv := 1.0
	for _, c := range s {
		if c >= '0' && c <= '9' {
			if dec {
				decDiv *= 10
				v = v + float64(c-'0')/decDiv
			} else {
				v = v*10 + float64(c-'0')
			}
		} else if c == '.' {
			dec = true
		}
	}
	return v
}

func alignFromString(s string) wml.ST_Jc {
	switch s {
	case "JUSTIFY", "BOTH", "两端对齐":
		return wml.ST_JcBoth
	case "LEFT", "居左":
		return wml.ST_JcStart
	case "CENTER", "居中":
		return wml.ST_JcCenter
	case "RIGHT", "居右":
		return wml.ST_JcEnd
	}
	return wml.ST_JcBoth
}

func colorFromHex(hex string) color.Color {
	if len(hex) > 0 && hex[0] != '#' {
		hex = "#" + hex
	}
	return color.FromHex(hex)
}

func underlineFromType(t string) wml.ST_Underline {
	switch t {
	case "single", "SINGLE":
		return wml.ST_UnderlineSingle
	case "double", "DOUBLE":
		return wml.ST_UnderlineDouble
	case "dotted", "DOTTED":
		return wml.ST_UnderlineDotted
	case "dashed", "DASHED":
		return wml.ST_UnderlineDash
	case "wavy", "WAVY":
		return wml.ST_UnderlineWave
	}
	return wml.ST_UnderlineNone
}
