package wordformat

import (
	"regexp"
	"strings"

	"github.com/unidoc/unioffice/v2/document"
)

func InsertCJKEUSpacing(doc *document.Document) error {
	return InsertCJKEUSpacingWith(doc, 1)
}

func InsertCJKEUSpacingWith(doc *document.Document, spaceCount int) error {
	if spaceCount < 1 {
		spaceCount = 1
	}
	if spaceCount > 4 {
		spaceCount = 4
	}
	sp := strings.Repeat(" ", spaceCount)
	re1 := regexp.MustCompile(`([\p{Han}])([a-zA-Z0-9])`)
	re2 := regexp.MustCompile(`([a-zA-Z0-9])([\p{Han}])`)

	for _, p := range doc.Paragraphs() {
		for _, r := range p.Runs() {
			oldText := r.Text()
			newText := re1.ReplaceAllString(oldText, "${1}"+sp+"${2}")
			newText = re2.ReplaceAllString(newText, "${1}"+sp+"${2}")
			if newText != oldText {
				r.ClearContent()
				r.AddText(newText)
			}
		}
	}
	return nil
}
