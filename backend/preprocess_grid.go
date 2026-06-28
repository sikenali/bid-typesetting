package wordformat

import (
	"github.com/unidoc/unioffice/document"
	"github.com/unidoc/unioffice/schema/soo/ofc/sharedTypes"
	"github.com/unidoc/unioffice/schema/soo/wml"
)

func ClearSnapToGrid(doc *document.Document) error {
	for _, p := range doc.Paragraphs() {
		pPr := p.X().PPr
		if pPr == nil {
			continue
		}
		off := false
		pPr.SnapToGrid = wml.NewCT_OnOff()
		pPr.SnapToGrid.ValAttr = &sharedTypes.ST_OnOff{Bool: &off}
	}
	return nil
}
