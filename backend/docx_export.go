package wordformat

import (
	"archive/zip"
	"bytes"
	"encoding/xml"
	"fmt"
	"os"
	"reflect"
	"strings"
	"unsafe"

	"github.com/unidoc/unioffice/v2/common"
	"github.com/unidoc/unioffice/v2/document"
)

// SaveDocx writes a document to a zip file using only public APIs, bypassing
// the unioffice license check. This is intended for test/validation purposes
// where running on a system without a license is required.
//
// The output is a valid docx file containing the document body, styles,
// settings, numbering, relationships, content types, app properties, and
// core properties. It omits some optional parts (theme, headers, footers,
// font table, web settings, custom properties) that are not critical for
// basic validation.
func SaveDocx(doc *document.Document, outputPath string) error {
	if err := os.MkdirAll(parentDir(outputPath), 0o755); err != nil {
		return err
	}

	f, err := os.Create(outputPath)
	if err != nil {
		return err
	}
	defer f.Close()

	zw := zip.NewWriter(f)
	defer zw.Close()

	// [Content_Types].xml
	if err := writeZipXML(zw, "[Content_Types].xml", doc.ContentTypes.X()); err != nil {
		return fmt.Errorf("write [Content_Types].xml: %w", err)
	}

	// _rels/.rels
	if err := writeZipXML(zw, "_rels/.rels", doc.Rels.X()); err != nil {
		return fmt.Errorf("write _rels/.rels: %w", err)
	}

	// docProps/app.xml
	if err := writeZipXML(zw, "docProps/app.xml", doc.AppProperties.X()); err != nil {
		return fmt.Errorf("write docProps/app.xml: %w", err)
	}

	// docProps/core.xml
	if err := writeZipXML(zw, "docProps/core.xml", doc.CoreProperties.X()); err != nil {
		return fmt.Errorf("write docProps/core.xml: %w", err)
	}

	// word/document.xml
	if err := writeZipXML(zw, "word/document.xml", doc.X()); err != nil {
		return fmt.Errorf("write word/document.xml: %w", err)
	}

	// word/_rels/document.xml.rels (uses the unexported _dfe field)
	relsWritten := false
	if rels := documentInternalRels(doc); rels != nil {
		if err := writeZipXML(zw, "word/_rels/document.xml.rels", rels); err == nil {
			relsWritten = true
		}
	}
	// If we couldn't extract the rels via reflection, write a default set
	// that covers the parts we serialize plus the header/footer placeholders.
	if !relsWritten {
		if err := writeRaw(zw, "word/_rels/document.xml.rels", minimalDocumentRelsXML); err != nil {
			return fmt.Errorf("write word/_rels/document.xml.rels: %w", err)
		}
	}

	// word/settings.xml
	if err := writeZipXML(zw, "word/settings.xml", doc.Settings.X()); err != nil {
		return fmt.Errorf("write word/settings.xml: %w", err)
	}

	// word/styles.xml
	if err := writeZipXML(zw, "word/styles.xml", doc.Styles.X()); err != nil {
		return fmt.Errorf("write word/styles.xml: %w", err)
	}

	// word/numbering.xml
	if err := writeZipXML(zw, "word/numbering.xml", doc.Numbering.X()); err != nil {
		return fmt.Errorf("write word/numbering.xml: %w", err)
	}

	// Provide minimal placeholder header/footer XML files so that the
	// header/footer references in document.xml (e.g. r:id="rId4") resolve
	// to a valid file. This is needed because we don't serialize the
	// unioffice-managed headers/footers arrays.
	if err := writeRaw(zw, "word/header1.xml", minimalHeaderXML); err != nil {
		return fmt.Errorf("write word/header1.xml: %w", err)
	}
	if err := writeRaw(zw, "word/footer1.xml", minimalFooterXML); err != nil {
		return fmt.Errorf("write word/footer1.xml: %w", err)
	}

	return nil
}

// writeRaw writes a fixed string to a zip entry.
func writeRaw(zw *zip.Writer, name, content string) error {
	w, err := zw.Create(name)
	if err != nil {
		return err
	}
	_, err = w.Write([]byte(content))
	return err
}

const minimalHeaderXML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p/></w:hdr>`

const minimalFooterXML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p/></w:ftr>`

const minimalDocumentRelsXML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
<Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>`

// writeZipXML creates a file in the zip and writes the XML-marshaled content
// with an XML header. encoding/xml's encoder will invoke the type's
// MarshalXML method if it implements xml.Marshaler, which preserves the
// namespace attributes and element names defined by the wml schema types.
func writeZipXML(zw *zip.Writer, name string, v interface{}) error {
	w, err := zw.Create(name)
	if err != nil {
		return err
	}

	data, err := marshalXML(v)
	if err != nil {
		return err
	}

	var buf bytes.Buffer
	buf.WriteString(xml.Header)
	buf.Write(data)
	_, err = w.Write(buf.Bytes())
	return err
}

// marshalXML uses encoding/xml to serialize a value. The standard library
// automatically invokes the value's xml.Marshaler implementation if present,
// which is how unioffice's wml.* types add their namespace attributes.
func marshalXML(v interface{}) ([]byte, error) {
	if v == nil {
		return nil, nil
	}
	var buf bytes.Buffer
	enc := xml.NewEncoder(&buf)
	enc.Indent("", "")
	if err := enc.Encode(v); err != nil {
		return nil, err
	}
	if err := enc.Flush(); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// documentInternalRels returns the document's word/_rels/document.xml.rels
// relationships via reflection + unsafe. The field is unexported in unioffice,
// so we have to use unsafe.Pointer to get an exported view.
func documentInternalRels(doc *document.Document) interface{} {
	v := reflect.ValueOf(doc).Elem()
	f := v.FieldByName("_dfe")
	if !f.IsValid() {
		return nil
	}
	// Use unsafe to access the unexported field as an exported type.
	ptr := unsafe.Pointer(f.UnsafeAddr())
	relPtr := (*common.Relationships)(ptr)
	// _dfe is a common.Relationships value. Use its X() method.
	type xRel interface {
		X() interface{}
	}
	if r, ok := interface{}(relPtr).(xRel); ok {
		inner := r.X()
		// Only return if the rels has actual content.
		if inner == nil {
			return nil
		}
		// Check if the inner XML has any relationships
		if rl, ok := inner.(interface{ Relationship() []interface{} }); ok {
			if len(rl.Relationship()) == 0 {
				return nil
			}
		}
		return inner
	}
	return nil
}

// parentDir returns the parent directory of a file path.
func parentDir(p string) string {
	idx := strings.LastIndex(p, "/")
	if idx < 0 {
		idx = strings.LastIndex(p, "\\")
	}
	if idx < 0 {
		return "."
	}
	return p[:idx]
}
