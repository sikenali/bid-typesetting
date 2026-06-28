package wordformat

import (
	"github.com/unidoc/unioffice/document"
)

func ClearIndents(doc *document.Document) error {
	for _, p := range doc.Paragraphs() {
		p.SetLeftIndent(0)
		p.SetRightIndent(0)
		p.SetFirstLineIndent(0)
	}
	return nil
}
