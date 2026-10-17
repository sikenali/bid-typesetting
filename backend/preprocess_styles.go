package wordformat

import "github.com/unidoc/unioffice/v2/document"

func ClearAllStyles(doc *document.Document) error {
	doc.Styles.Clear()
	doc.Styles.InitializeDefault()
	return nil
}
