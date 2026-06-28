package wordformat

import (
	"github.com/unidoc/unioffice/document"
	"github.com/unidoc/unioffice/schema/soo/wml"
)

func ReplaceSoftReturns(doc *document.Document) error {
	for _, p := range doc.Paragraphs() {
		runs := p.Runs()
		for i := 0; i < len(runs); i++ {
			for _, eg := range runs[i].X().EG_RunInnerContent {
				if eg.Br != nil && eg.Br.TypeAttr == wml.ST_BrTypeTextWrapping {
					eg.Br = nil
					runs[i].ClearContent()
					runs[i].AddText("\n")
				}
			}
		}
	}
	return nil
}
