package wordformat

import (
	"github.com/unidoc/unioffice/document"
	"github.com/unidoc/unioffice/measurement"
	"github.com/unidoc/unioffice/schema/soo/wml"
)

func ApplyTableFormat(doc *document.Document, ts *TableStyle) error {
	for _, tbl := range doc.Tables() {
		tblProps := tbl.Properties()
		switch ts.Align {
		case "LEFT":
			tblProps.SetAlignment(wml.ST_JcTableLeft)
		case "CENTER":
			tblProps.SetAlignment(wml.ST_JcTableCenter)
		case "RIGHT":
			tblProps.SetAlignment(wml.ST_JcTableRight)
		}

		if ts.Autofit {
			tblPr := tbl.X().TblPr
			if tblPr == nil {
				tbl.X().TblPr = wml.NewCT_TblPr()
				tblPr = tbl.X().TblPr
			}
			tblPr.TblW = wml.NewCT_TblWidth()
			tblPr.TblW.TypeAttr = wml.ST_TblWidthAuto
			tblPr.TblLayout = wml.NewCT_TblLayoutType()
			tblPr.TblLayout.TypeAttr = wml.ST_TblLayoutTypeFixed
		}

		for _, row := range tbl.Rows() {
			if ts.MinRowHeightPT > 0 {
				row.Properties().SetHeight(
					measurement.Distance(ts.MinRowHeightPT)*measurement.Point,
					wml.ST_HeightRuleAtLeast)
			}
			for _, cell := range row.Cells() {
				if ts.EnableCellFormatting {
					cellProps := cell.Properties()
					switch ts.CellAlign {
					case "CENTER":
						cellProps.SetVerticalAlignment(wml.ST_VerticalJcCenter)
					case "TOP":
						cellProps.SetVerticalAlignment(wml.ST_VerticalJcTop)
					case "BOTTOM":
						cellProps.SetVerticalAlignment(wml.ST_VerticalJcBottom)
					}
				}
				for _, p := range cell.Paragraphs() {
					p.SetLineSpacing(
						twipsFromLineSpacing(ts.LineSpacingMode, ts.LineSpacingValue)*measurement.Twips,
						lineSpacingEnum(ts.LineSpacingMode))

					for _, r := range p.Runs() {
						rPr := r.Properties()
						if ts.ENFont != "" || ts.CNFont != "" {
							font := ts.ENFont
							if font == "" {
								font = ts.CNFont
							}
							rPr.SetFontFamily(font)
							if ts.CNFont != "" && ts.CNFont != ts.ENFont {
								rPr.X().RFonts.EastAsiaAttr = &ts.CNFont
							}
						}
						rPr.SetSize(cnSizeToHalfPoints(ts.SizeCN) * measurement.HalfPoint)
					}
				}
			}
		}
	}
	return nil
}
