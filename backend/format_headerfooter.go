package wordformat

import (
	"github.com/unidoc/unioffice/v2/color"
	"github.com/unidoc/unioffice/v2/document"
	"github.com/unidoc/unioffice/v2/measurement"
	"github.com/unidoc/unioffice/v2/schema/soo/wml"
)

func configureRun(run document.Run, cnFont, enFont, sizeCN string, bold, italic bool, underlineType string) {
	if enFont != "" || cnFont != "" {
		font := enFont
		if font == "" {
			font = cnFont
		}
		run.Properties().SetFontFamily(font)
		if cnFont != "" && cnFont != enFont {
			cf := cnFont
			run.Properties().X().RFonts.EastAsiaAttr = &cf
		}
	}
	if sizeCN != "" {
		run.Properties().SetSize(cnSizeToHalfPoints(sizeCN) * measurement.HalfPoint)
	}
	if bold {
		run.Properties().SetBold(true)
	}
	if italic {
		run.Properties().SetItalic(true)
	}
	if underlineType != "" {
		run.Properties().SetUnderline(underlineFromType(underlineType), color.FromHex("#000000"))
	}
}

func ApplyHeaderFooter(doc *document.Document, hf *HeaderFooter) error {
	if hf == nil {
		return nil
	}
	section := doc.BodySection()

	if hf.EnableHeader {
		hdr, exists := section.GetHeader(wml.ST_HdrFtrDefault)
		if !exists {
			hdr = doc.AddHeader()
			section.SetHeader(hdr, wml.ST_HdrFtrDefault)
		}
		hdr.Clear()
		hp := hdr.AddParagraph()
		hp.SetAlignment(alignFromString(hf.HeaderAlign))
		run := hp.AddRun()
		configureRun(run, hf.HeaderCNFont, hf.HeaderENFont, hf.HeaderSizeCN, hf.HeaderBold, hf.HeaderItalic, hf.HeaderUnderlineType)
		run.AddText(hf.HeaderText)
	}

	if hf.EnableFooter {
		ftr, exists := section.GetFooter(wml.ST_HdrFtrDefault)
		if !exists {
			ftr = doc.AddFooter()
			section.SetFooter(ftr, wml.ST_HdrFtrDefault)
		}
		if hf.ClearFooter {
			ftr.Clear()
		}
		fp := ftr.AddParagraph()
		fp.SetAlignment(alignFromString(hf.FooterAlign))
		run := fp.AddRun()
		configureRun(run, hf.FooterCNFont, hf.FooterENFont, hf.FooterSizeCN, false, hf.FooterItalic, "")

		if !hf.PageNumberFromBody {
			switch hf.FooterPageNumberType {
			case "page_only", "PAGE_ONLY", "仅页码":
				run.AddField("PAGE")
			case "none", "NONE", "无":
				// 不添加页码
			case "standard", "STANDARD", "标准":
				run.AddField("PAGE")
				run.AddText(" / ")
				run.AddField("NUMPAGES")
			case "dash", "DASH", "短横线":
				run.AddField("PAGE")
				run.AddText(" - ")
				run.AddField("NUMPAGES")
			case "simple", "SIMPLE", "简单":
				run.AddField("PAGE")
			default:
				// 默认标准格式
				run.AddField("PAGE")
				run.AddText(" / ")
				run.AddField("NUMPAGES")
			}
		}
	}

	return nil
}
