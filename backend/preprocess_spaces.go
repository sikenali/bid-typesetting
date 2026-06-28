package wordformat

import (
	"regexp"

	"github.com/unidoc/unioffice/document"
)

func InsertCJKEUSpacing(doc *document.Document) error {
	re1 := regexp.MustCompile(`([\p{Han}])([a-zA-Z0-9])`)
	re2 := regexp.MustCompile(`([a-zA-Z0-9])([\p{Han}])`)

	for _, p := range doc.Paragraphs() {
		for _, r := range p.Runs() {
			oldText := r.Text()
			newText := re1.ReplaceAllString(oldText, "${1} ${2}")
			newText = re2.ReplaceAllString(newText, "${1} ${2}")
			r.ClearContent()
			r.AddText(newText)
		}
	}
	return nil
}
