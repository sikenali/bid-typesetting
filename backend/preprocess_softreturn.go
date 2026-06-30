package wordformat

import (
	"github.com/unidoc/unioffice/document"
	"github.com/unidoc/unioffice/schema/soo/wml"
)

func ReplaceSoftReturns(doc *document.Document) error {
	for _, p := range doc.Paragraphs() {
		runs := p.Runs()
		for i := 0; i < len(runs); i++ {
			r := runs[i]
			innerContents := r.X().EG_RunInnerContent
			hasSoftBreak := false
			for _, eg := range innerContents {
				if eg.Br != nil && eg.Br.TypeAttr == wml.ST_BrTypeTextWrapping {
					hasSoftBreak = true
					eg.Br = nil
				}
			}
			if hasSoftBreak {
				text := r.Text()
				if text != "" {
					r.AddBreak()
				}
			}
		}
	}
	return nil
}
