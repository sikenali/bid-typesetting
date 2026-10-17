package wordformat

import (
	"strings"

	"github.com/unidoc/unioffice/v2/document"
)

func DeleteEmptyLines(doc *document.Document) error {
	paras := doc.Paragraphs()
	var toRemove []int
	for i, p := range paras {
		text := paragraphText(p)
		if strings.TrimSpace(text) == "" {
			if !hasDrawingOrObject(&p) {
				toRemove = append(toRemove, i)
			}
		}
	}
	for i := len(toRemove) - 1; i >= 0; i-- {
		doc.RemoveParagraph(paras[toRemove[i]])
	}
	return nil
}

func hasDrawingOrObject(p *document.Paragraph) bool {
	for _, r := range p.Runs() {
		for _, eg := range r.X().EG_RunInnerContent {
			if eg.RunInnerContentChoice != nil && eg.RunInnerContentChoice.Drawing != nil {
				return true
			}
		}
	}
	return false
}
