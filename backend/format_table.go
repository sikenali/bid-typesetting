package wordformat

import (
	"github.com/unidoc/unioffice/v2/color"
	"github.com/unidoc/unioffice/v2/document"
	"github.com/unidoc/unioffice/v2/measurement"
	"github.com/unidoc/unioffice/v2/schema/soo/wml"
)

func applyCellBorders(cell document.Cell, style string) {
	zero := measurement.Distance(0)
	black := color.FromHex("#000000")
	if style == "" || style == "无" || style == "none" {
		// Clear all borders
		borders := cell.Properties().Borders()
		borders.SetTop(wml.ST_BorderNone, black, zero)
		borders.SetBottom(wml.ST_BorderNone, black, zero)
		borders.SetLeft(wml.ST_BorderNone, black, zero)
		borders.SetRight(wml.ST_BorderNone, black, zero)
		borders.SetInsideHorizontal(wml.ST_BorderNone, black, zero)
		borders.SetInsideVertical(wml.ST_BorderNone, black, zero)
		return
	}
	// Skip if preserving original borders
	if style == "保留" || style == "preserve" || style == "原样" || style == "original" {
		return
	}
	borders := cell.Properties().Borders()
	// 1px ≈ 0.75pt ≈ 6 eighths of point
	thickness := measurement.Distance(0.75) * measurement.Point
	switch style {
	case "全部", "ALL", "all":
		borders.SetAll(wml.ST_BorderSingle, black, thickness)
	case "外框", "outside", "OUTSIDE":
		borders.SetTop(wml.ST_BorderSingle, black, thickness)
		borders.SetBottom(wml.ST_BorderSingle, black, thickness)
		borders.SetLeft(wml.ST_BorderSingle, black, thickness)
		borders.SetRight(wml.ST_BorderSingle, black, thickness)
	case "内部", "inside", "INSIDE":
		borders.SetInsideHorizontal(wml.ST_BorderSingle, black, thickness)
		borders.SetInsideVertical(wml.ST_BorderSingle, black, thickness)
	case "上", "top", "TOP":
		borders.SetTop(wml.ST_BorderSingle, black, thickness)
	case "下", "bottom", "BOTTOM":
		borders.SetBottom(wml.ST_BorderSingle, black, thickness)
	case "左", "left", "LEFT":
		borders.SetLeft(wml.ST_BorderSingle, black, thickness)
	case "右", "right", "RIGHT":
		borders.SetRight(wml.ST_BorderSingle, black, thickness)
	case "横线", "horizontal", "HORIZONTAL":
		borders.SetTop(wml.ST_BorderSingle, black, thickness)
		borders.SetBottom(wml.ST_BorderSingle, black, thickness)
		borders.SetInsideHorizontal(wml.ST_BorderSingle, black, thickness)
	case "竖线", "vertical", "VERTICAL":
		borders.SetLeft(wml.ST_BorderSingle, black, thickness)
		borders.SetRight(wml.ST_BorderSingle, black, thickness)
		borders.SetInsideVertical(wml.ST_BorderSingle, black, thickness)
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

	bs := &BodyStyle{
		CNFont:  ts.CNFont,
		ENFont:  ts.ENFont,
		SizeCN:  ts.SizeCN,
		LineSpacingMode: "MULTIPLE",
		LineSpacingValue: ts.LineSpacingValue,
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
					applyParagraphSpacing(p, bs)
					if ts.Align != "" {
						p.SetAlignment(alignFromString(ts.Align))
					}
					for _, r := range p.Runs() {
						applyStyleToRun(r, bs)
					}
				}
			}
		}
	}
	return nil
}

func ApplyPreprocessTableCells(doc *document.Document, font, sizeCN string, lineSpacing float64, align, border string, minHeight float64, autoWidth bool) error {
	bs := &BodyStyle{
		CNFont:  font,
		ENFont:  font,
		SizeCN:  sizeCN,
	}
	if lineSpacing > 0 {
		bs.LineSpacingMode = "MULTIPLE"
		bs.LineSpacingValue = lineSpacing
	}

	for _, tbl := range doc.Tables() {
		if autoWidth {
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
			if minHeight > 0 {
				row.Properties().SetHeight(
					measurement.Distance(minHeight)*measurement.Point,
					wml.ST_HeightRuleAtLeast)
			}
			for _, cell := range row.Cells() {
				if border != "" {
					applyCellBorders(cell, border)
				}
				if align != "" {
					switch align {
					case "CENTER", "居中":
						cell.Properties().SetVerticalAlignment(wml.ST_VerticalJcCenter)
					case "TOP", "居上":
						cell.Properties().SetVerticalAlignment(wml.ST_VerticalJcTop)
					case "BOTTOM", "居下":
						cell.Properties().SetVerticalAlignment(wml.ST_VerticalJcBottom)
					}
				}
				for _, p := range cell.Paragraphs() {
					applyParagraphSpacing(p, bs)
					for _, r := range p.Runs() {
						applyStyleToRun(r, bs)
					}
				}
			}
		}
	}
	return nil
}

func parseFloatFromCNInto(s string, out *float64) {
	*out = parseFloatFromCN(s)
}
