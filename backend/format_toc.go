package wordformat

import (
	"fmt"

	"github.com/unidoc/unioffice/v2/measurement"
	"github.com/unidoc/unioffice/v2/schema/soo/wml"

	"github.com/unidoc/unioffice/v2/document"
)

func ApplyTOCFormat(doc *document.Document, toc *TOCConfig) error {
	if toc == nil || !toc.Enable {
		return nil
	}

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
						cn := toc.TitleCNFont
						rPr.X().RFonts.EastAsiaAttr = &cn
					}
				}
				if toc.TitleSizeCN != "" {
					rPr.SetSize(cnSizeToHalfPoints(toc.TitleSizeCN) * measurement.HalfPoint)
				}
			}
			continue
		}

		for i, ls := range toc.LevelStyles {
			if styleID == fmt.Sprintf("toc%d", i+1) ||
				styleID == fmt.Sprintf("TOC%d", i+1) {

				if ls.Align != "" {
					p.SetAlignment(alignFromString(ls.Align))
				}
				if ls.LineSpacingMode != "" {
					p.SetLineSpacing(
						twipsFromLineSpacing(ls.LineSpacingMode, ls.LineSpacingValue)*measurement.Twips,
						lineSpacingEnum(ls.LineSpacingMode))
				}
				if ls.SpaceBeforeValue > 0 {
					p.SetBeforeSpacing(twipsFromSpacing(ls.SpaceBeforeValue, ls.SpaceBeforeUnit) * measurement.Twips)
				}
				if ls.SpaceAfterValue > 0 {
					p.SetAfterSpacing(twipsFromSpacing(ls.SpaceAfterValue, ls.SpaceAfterUnit) * measurement.Twips)
				}
				if ls.FirstLineIndentChars > 0 {
					p.SetFirstLineIndent(measurement.Distance(ls.FirstLineIndentChars*charWidthTwips(ls.CNFont)) * measurement.Twips)
				}
				if ls.LeftIndentChars > 0 {
					p.SetLeftIndent(measurement.Distance(ls.LeftIndentChars*charWidthTwips(ls.CNFont)) * measurement.Twips)
				}
				if ls.RightIndentValue > 0 {
					p.SetRightIndent(twipsFromIndentValue(ls.RightIndentValue, ls.RightIndentUnit) * measurement.Twips)
				}
				if ls.TabLeader != "" {
					setTOCParagraphTabLeader(p, ls.TabLeader)
				}

				for _, r := range p.Runs() {
					rPr := r.Properties()
					if ls.ENFont != "" || ls.CNFont != "" {
						font := ls.ENFont
						if font == "" {
							font = ls.CNFont
						}
						rPr.SetFontFamily(font)
						if ls.CNFont != "" && ls.CNFont != ls.ENFont {
							cn := ls.CNFont
							rPr.X().RFonts.EastAsiaAttr = &cn
						}
					}
					if ls.SizeCN != "" {
						rPr.SetSize(cnSizeToHalfPoints(ls.SizeCN) * measurement.HalfPoint)
					}
					rPr.SetBold(ls.Bold)
					if ls.Italic {
						rPr.SetItalic(true)
					}
					if ls.ColorRGB != [3]int{0, 0, 0} {
						hex := fmt.Sprintf("#%02X%02X%02X", ls.ColorRGB[0], ls.ColorRGB[1], ls.ColorRGB[2])
						rPr.SetColor(colorFromHex(hex))
					}
				}
			}
		}
	}
	return nil
}

func setTOCParagraphTabLeader(p document.Paragraph, leader string) {
	pPr := p.X().PPr
	if pPr == nil {
		return
	}
	if pPr.Tabs == nil {
		pPr.Tabs = wml.NewCT_Tabs()
	}
	leaderVal := tocLeaderValue(leader)
	if leaderVal == wml.ST_TabTlcUnset {
		return
	}
	if len(pPr.Tabs.Tab) == 0 {
		tab := wml.NewCT_TabStop()
		tab.LeaderAttr = leaderVal
		pos := wml.ST_SignedTwipsMeasure{}
		tab.PosAttr = pos
		pPr.Tabs.Tab = append(pPr.Tabs.Tab, tab)
		return
	}
	for _, t := range pPr.Tabs.Tab {
		t.LeaderAttr = leaderVal
	}
}

func tocLeaderValue(leader string) wml.ST_TabTlc {
	switch leader {
	case "DOT", "点", "点号":
		return wml.ST_TabTlcDot
	case "HYPHEN", "连字符":
		return wml.ST_TabTlcHyphen
	case "UNDERSCORE", "下划线":
		return wml.ST_TabTlcUnderscore
	case "MIDDLE_DOT", "中点":
		return wml.ST_TabTlcMiddleDot
	}
	return wml.ST_TabTlcNone
}
