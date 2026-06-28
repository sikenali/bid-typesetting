package wordformat

import (
	"github.com/unidoc/unioffice/color"
	"github.com/unidoc/unioffice/document"
	"github.com/unidoc/unioffice/measurement"
	"github.com/unidoc/unioffice/schema/soo/ofc/sharedTypes"
	"github.com/unidoc/unioffice/schema/soo/wml"
)

func ApplyPageSetup(doc *document.Document, m *Margins) error {
	section := doc.BodySection()

	top := measurement.Distance(twipsFromCM(m.TopCM))
	right := measurement.Distance(twipsFromCM(m.RightCM))
	bottom := measurement.Distance(twipsFromCM(m.BottomCM))
	left := measurement.Distance(twipsFromCM(m.LeftCM))

	section.SetPageMargins(top, right, bottom, left, 0, 0, 0)

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
		default:
			w = measurement.Distance(twipsFromCM(m.PaperWidthCM))
			h = measurement.Distance(twipsFromCM(m.PaperHeightCM))
		}
		section.SetPageSizeAndOrientation(
			w*measurement.Twips,
			h*measurement.Twips,
			wml.ST_PageOrientationPortrait)
	}

	if m.Columns > 1 {
		sectPr := section.X()
		if sectPr.Cols == nil {
			sectPr.Cols = wml.NewCT_Columns()
		}
		colNum := int64(m.Columns)
		sectPr.Cols.NumAttr = &colNum
		spaceNum := uint64(twipsFromCM(m.ColumnSpacingCM))
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
	case "SINGLE", "MULTIPLE", "AUTO":
		return wml.ST_LineSpacingRuleAuto
	}
	return wml.ST_LineSpacingRuleAuto
}

func twipsFromSpacing(value float64, unit string) measurement.Distance {
	switch unit {
	case "磅", "PT":
		return measurement.Distance(value * 20)
	case "行", "LINE":
		return measurement.Distance(value * 240)
	}
	return measurement.Distance(value * 20)
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
	case "JUSTIFY", "BOTH":
		return wml.ST_JcBoth
	case "LEFT":
		return wml.ST_JcStart
	case "CENTER":
		return wml.ST_JcCenter
	case "RIGHT":
		return wml.ST_JcEnd
	}
	return wml.ST_JcBoth
}

func colorFromHex(hex string) color.Color {
	return color.FromHex("#" + hex)
}
