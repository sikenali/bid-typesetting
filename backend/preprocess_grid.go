package wordformat

import (
	"github.com/unidoc/unioffice/v2/document"
	"github.com/unidoc/unioffice/v2/schema/soo/ofc/sharedTypes"
	"github.com/unidoc/unioffice/v2/schema/soo/wml"
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
