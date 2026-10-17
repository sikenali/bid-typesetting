package wordformat

import (
	"strings"

	"github.com/unidoc/unioffice/v2/document"
)

func ClearSuperscript(doc *document.Document) error {
	for _, p := range doc.Paragraphs() {
		for _, r := range p.Runs() {
			rPr := r.Properties().X()
			if rPr != nil {
				rPr.VertAlign = nil
			}
		}
	}
	return nil
}

func ProcessTabMode(doc *document.Document, mode int) error {
	for _, p := range doc.Paragraphs() {
		for _, r := range p.Runs() {
			text := r.Text()
			switch mode {
			case 1:
				r.ClearContent()
				r.AddText(strings.ReplaceAll(text, "\t", " "))
			case 2:
				r.ClearContent()
				r.AddText(strings.ReplaceAll(text, "\t", ""))
			}
		}
	}
	return nil
}

func ClearObjectWrapping(doc *document.Document) error {
	return nil
}
