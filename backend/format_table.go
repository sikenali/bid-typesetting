package wordformat

import (
	"github.com/unidoc/unioffice/document"
	"github.com/unidoc/unioffice/measurement"
	"github.com/unidoc/unioffice/schema/soo/wml"
)

func applyCellBorders(cell document.Cell, style string) {
	if style == "" || style == "无" || style == "none" {
		return
	}
	switch style {
	case "全部", "ALL", "all":
		_ = cell
	}
}

func ApplyTableFormat(doc *document.Document, ts *TableStyle) error {
	if ts != nil && !ts.Enable {
		return nil
	}

	for _, tbl := range doc.Tables() {
		if ts != nil {
			tblProps := tbl.Properties()
			switch ts.Align {
			case "LEFT", "居左":
				tblProps.SetAlignment(wml.ST_JcTableLeft)
			case "CENTER", "居中":
				tblProps.SetAlignment(wml.ST_JcTableCenter)
			case "RIGHT", "居右":
				tblProps.SetAlignment(wml.ST_JcTableRight)
			}

			if ts.StyleType != "" {
				tbl.Properties().SetStyle(ts.StyleType)
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
				tblPr.TblLayout.TypeAttr = wml.ST_TblLayoutTypeAutofit
			}
		}

		for _, row := range tbl.Rows() {
			if ts != nil && ts.MinRowHeightPT > 0 {
				row.Properties().SetHeight(
					measurement.Distance(ts.MinRowHeightPT)*measurement.Point,
					wml.ST_HeightRuleAtLeast)
			}
			for _, cell := range row.Cells() {
				if ts != nil && ts.EnableCellFormatting {
					cellProps := cell.Properties()
					switch ts.CellAlign {
					case "CENTER", "居中":
						cellProps.SetVerticalAlignment(wml.ST_VerticalJcCenter)
					case "TOP", "居上":
						cellProps.SetVerticalAlignment(wml.ST_VerticalJcTop)
					case "BOTTOM", "居下":
						cellProps.SetVerticalAlignment(wml.ST_VerticalJcBottom)
					}
				}
				for _, p := range cell.Paragraphs() {
					if ts != nil {
						if ts.LineSpacingMode != "" {
							p.SetLineSpacing(
								twipsFromLineSpacing(ts.LineSpacingMode, ts.LineSpacingValue)*measurement.Twips,
								lineSpacingEnum(ts.LineSpacingMode))
						}
						if ts.Align != "" {
							p.SetAlignment(alignFromString(ts.Align))
						}
					}
					for _, r := range p.Runs() {
						if ts != nil {
							applyStyleToRun(r, &BodyStyle{
								CNFont: ts.CNFont,
								ENFont: ts.ENFont,
								SizeCN: ts.SizeCN,
							})
						}
					}
				}
			}
		}
	}
	return nil
}

func ApplyTableSettings(doc *document.Document, ts *TableSettings) error {
	if ts == nil || !ts.Enable {
		return nil
	}

	for _, tbl := range doc.Tables() {
		if ts.AutoWidth {
			tblPr := tbl.X().TblPr
			if tblPr == nil {
				tbl.X().TblPr = wml.NewCT_TblPr()
				tblPr = tbl.X().TblPr
			}
			tblPr.TblW = wml.NewCT_TblWidth()
			tblPr.TblW.TypeAttr = wml.ST_TblWidthAuto
			tblPr.TblLayout = wml.NewCT_TblLayoutType()
			tblPr.TblLayout.TypeAttr = wml.ST_TblLayoutTypeAutofit
		}

		for _, row := range tbl.Rows() {
			if ts.MinLineHeight > 0 {
				row.Properties().SetHeight(
					measurement.Distance(ts.MinLineHeight)*measurement.Point,
					wml.ST_HeightRuleAtLeast)
			}
			for _, cell := range row.Cells() {
				if ts.BorderStyle != "" {
					applyCellBorders(cell, ts.BorderStyle)
				}
				cellAlign := ts.Align
				if cellAlign != "" {
					switch cellAlign {
					case "CENTER", "居中":
						cell.Properties().SetVerticalAlignment(wml.ST_VerticalJcCenter)
					case "TOP", "居上":
						cell.Properties().SetVerticalAlignment(wml.ST_VerticalJcTop)
					case "BOTTOM", "居下":
						cell.Properties().SetVerticalAlignment(wml.ST_VerticalJcBottom)
					}
				}
				for _, p := range cell.Paragraphs() {
					if ts.LineSpacingValue > 0 {
						p.SetLineSpacing(
							twipsFromLineSpacing("MULTIPLE", ts.LineSpacingValue)*measurement.Twips,
							wml.ST_LineSpacingRuleAuto)
					}
					for _, r := range p.Runs() {
						applyStyleToRun(r, &BodyStyle{
							CNFont: ts.CNFont,
							ENFont: ts.ENFont,
							SizeCN: ts.SizeCN,
						})
					}
				}
			}
		}
	}
	return nil
}
