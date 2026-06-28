package wordformat

import (
	"github.com/unidoc/unioffice/document"
	"github.com/unidoc/unioffice/measurement"
	"github.com/unidoc/unioffice/schema/soo/wml"
)

func ApplyHeaderFooter(doc *document.Document, hf *HeaderFooter) error {
	section := doc.BodySection()

	if hf.EnableHeader {
		hdr, exists := section.GetHeader(wml.ST_HdrFtrDefault)
		if !exists {
			hdr = doc.AddHeader()
			section.SetHeader(hdr, wml.ST_HdrFtrDefault)
		}
		hdr.Clear()
		hp := hdr.AddParagraph()
		switch hf.HeaderAlign {
		case "居中", "CENTER":
			hp.SetAlignment(wml.ST_JcCenter)
		case "居左", "LEFT":
			hp.SetAlignment(wml.ST_JcStart)
		case "居右", "RIGHT":
			hp.SetAlignment(wml.ST_JcEnd)
		}
		run := hp.AddRun()
		if hf.HeaderENFont != "" || hf.HeaderCNFont != "" {
			font := hf.HeaderENFont
			if font == "" {
				font = hf.HeaderCNFont
			}
			run.Properties().SetFontFamily(font)
			if hf.HeaderCNFont != "" && hf.HeaderCNFont != hf.HeaderENFont {
				run.Properties().X().RFonts.EastAsiaAttr = &hf.HeaderCNFont
			}
		}
		run.Properties().SetSize(cnSizeToHalfPoints(hf.HeaderSizeCN) * measurement.HalfPoint)
		run.Properties().SetBold(hf.HeaderBold)
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
		switch hf.FooterAlign {
		case "居中", "CENTER":
			fp.SetAlignment(wml.ST_JcCenter)
		case "居左", "LEFT":
			fp.SetAlignment(wml.ST_JcStart)
		case "居右", "RIGHT":
			fp.SetAlignment(wml.ST_JcEnd)
		}
		run := fp.AddRun()
		if hf.FooterENFont != "" || hf.FooterCNFont != "" {
			font := hf.FooterENFont
			if font == "" {
				font = hf.FooterCNFont
			}
			run.Properties().SetFontFamily(font)
			if hf.FooterCNFont != "" && hf.FooterCNFont != hf.FooterENFont {
				run.Properties().X().RFonts.EastAsiaAttr = &hf.FooterCNFont
			}
		}
		run.Properties().SetSize(cnSizeToHalfPoints(hf.FooterSizeCN) * measurement.HalfPoint)

		run.AddField("PAGE")
		run.AddText(" / ")
		run.AddField("NUMPAGES")
	}

	return nil
}
