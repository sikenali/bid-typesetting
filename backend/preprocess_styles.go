package wordformat

import "github.com/unidoc/unioffice/document"

func ClearAllStyles(doc *document.Document) error {
	doc.Styles.Clear()
	doc.Styles.InitializeDefault()
	return nil
}
