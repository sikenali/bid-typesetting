package wordformat

import (
	"github.com/unidoc/unioffice/v2/document"
	"github.com/unidoc/unioffice/v2/schema/soo/wml"
)

func ReplaceSoftReturns(doc *document.Document) error {
	for _, p := range doc.Paragraphs() {
		runs := p.Runs()
		for i := 0; i < len(runs); i++ {
			r := runs[i]
			innerContents := r.X().EG_RunInnerContent
			hasSoftBreak := false
			for _, eg := range innerContents {
				if eg.RunInnerContentChoice != nil && eg.RunInnerContentChoice.Br != nil && eg.RunInnerContentChoice.Br.TypeAttr == wml.ST_BrTypeTextWrapping {
					hasSoftBreak = true
					eg.RunInnerContentChoice.Br = nil
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
