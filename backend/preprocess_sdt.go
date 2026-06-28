package wordformat

import (
	"archive/zip"
	"bytes"
	"encoding/xml"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/unidoc/unioffice/document"
)

func FlattenSDT(doc *document.Document) error {
	tmpDir, err := os.MkdirTemp("", "docx-sdt-flatten")
	if err != nil {
		return fmt.Errorf("create temp dir: %w", err)
	}
	defer os.RemoveAll(tmpDir)

	tmpPath := filepath.Join(tmpDir, "input.docx")
	if err := doc.SaveToFile(tmpPath); err != nil {
		return fmt.Errorf("save temp docx: %w", err)
	}

	r, err := zip.OpenReader(tmpPath)
	if err != nil {
		return fmt.Errorf("open temp zip: %w", err)
	}
	defer r.Close()

	var buf bytes.Buffer
	docXMLPath := "word/document.xml"
	found := false

	for _, f := range r.File {
		if f.Name != docXMLPath {
			continue
		}
		found = true
		rc, err := f.Open()
		if err != nil {
			return fmt.Errorf("open %s: %w", f.Name, err)
		}
		defer rc.Close()

		raw, err := io.ReadAll(rc)
		if err != nil {
			return fmt.Errorf("read %s: %w", f.Name, err)
		}

		flattened := flattenSDTInXML(raw)
		buf.Write(flattened)
		break
	}

	if !found {
		return nil
	}

	outputPath := tmpDir + "/output.docx"
	if err := writeModifiedDocx(tmpPath, outputPath, docXMLPath, buf.Bytes()); err != nil {
		return fmt.Errorf("write modified docx: %w", err)
	}

	modified, err := os.ReadFile(outputPath)
	if err != nil {
		return fmt.Errorf("read output docx: %w", err)
	}

	return replaceDocumentContent(doc, outputPath, modified)
}

func flattenSDTInXML(raw []byte) []byte {
	decoder := xml.NewDecoder(bytes.NewReader(raw))
	var buf bytes.Buffer
	encoder := xml.NewEncoder(&buf)
	encoder.Indent("", "")

	var sdtContentBuf bytes.Buffer
	var sdtContentEncoder *xml.Encoder
	collectingContent := false

	inSDT := false
	sdtDepthLevel := 0

	for {
		token, err := decoder.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			return raw
		}

		switch t := token.(type) {
		case xml.StartElement:
			local := t.Name.Local
			space := t.Name.Space

			if local == "sdt" && (space == "w" || space == "http://schemas.openxmlformats.org/wordprocessingml/2006/main") {
				inSDT = true
				sdtDepthLevel = 1
				continue
			}

			if inSDT {
				if local == "sdtContent" && (space == "w" || space == "http://schemas.openxmlformats.org/wordprocessingml/2006/main") {
					collectingContent = true
					sdtContentBuf.Reset()
					sdtContentEncoder = xml.NewEncoder(&sdtContentBuf)
					continue
				}
				if local == "sdt" && (space == "w" || space == "http://schemas.openxmlformats.org/wordprocessingml/2006/main") {
					sdtDepthLevel++
				}
				if collectingContent {
					sdtContentEncoder.EncodeToken(t)
				}
				continue
			}

			encoder.EncodeToken(t)

		case xml.CharData:
			if collectingContent {
				sdtContentEncoder.EncodeToken(t)
				continue
			}
			encoder.EncodeToken(t)

		case xml.EndElement:
			local := t.Name.Local
			space := t.Name.Space

			if inSDT {
				if collectingContent {
					sdtContentEncoder.EncodeToken(t)
				}
				if local == "sdtContent" && (space == "w" || space == "http://schemas.openxmlformats.org/wordprocessingml/2006/main") {
					sdtContentEncoder.Flush()
					contentBytes := sdtContentBuf.Bytes()
					contentBytes = bytes.TrimSpace(contentBytes)

					if len(contentBytes) > 0 {
						subDecoder := xml.NewDecoder(bytes.NewReader(contentBytes))
						for {
							subToken, subErr := subDecoder.Token()
							if subErr == io.EOF {
								break
							}
							if subErr != nil {
								break
							}
							encoder.EncodeToken(subToken)
						}
					}

					collectingContent = false
					continue
				}
				if local == "sdt" && (space == "w" || space == "http://schemas.openxmlformats.org/wordprocessingml/2006/main") {
					sdtDepthLevel--
					if sdtDepthLevel <= 0 {
						inSDT = false
					}
					continue
				}
				continue
			}

			encoder.EncodeToken(t)

		case xml.Comment:
			if !collectingContent {
				encoder.EncodeToken(t)
			}

		case xml.ProcInst:
			if !inSDT {
				encoder.EncodeToken(t)
			}

		case xml.Directive:
			if !inSDT {
				encoder.EncodeToken(t)
			}
		}
	}

	encoder.Flush()
	return buf.Bytes()
}

func writeModifiedDocx(srcPath, dstPath, targetPath string, newContent []byte) error {
	r, err := zip.OpenReader(srcPath)
	if err != nil {
		return err
	}
	defer r.Close()

	out, err := os.Create(dstPath)
	if err != nil {
		return err
	}
	defer out.Close()

	w := zip.NewWriter(out)
	defer w.Close()

	for _, f := range r.File {
		rc, err := f.Open()
		if err != nil {
			return err
		}

		if f.Name == targetPath {
			fh, err := zip.FileInfoHeader(f.FileInfo())
			if err != nil {
				rc.Close()
				return err
			}
			fh.Name = f.Name
			fh.Method = zip.Deflate
			fh.ModifiedTime = f.ModifiedTime
			fh.ModifiedDate = f.ModifiedDate
			fw, err := w.CreateHeader(fh)
			if err != nil {
				rc.Close()
				return err
			}
			if _, err := fw.Write(newContent); err != nil {
				rc.Close()
				return err
			}
		} else {
			fw, err := w.Create(f.Name)
			if err != nil {
				rc.Close()
				return err
			}
			if _, err := io.Copy(fw, rc); err != nil {
				rc.Close()
				return err
			}
		}
		rc.Close()
	}

	return nil
}

func replaceDocumentContent(doc *document.Document, outputPath string, newContent []byte) error {
	tmp := outputPath + ".tmp"
	if err := os.WriteFile(tmp, newContent, 0644); err != nil {
		return err
	}

	reopened, err := document.Open(tmp)
	if err != nil {
		os.Remove(tmp)
		return err
	}
	defer reopened.Close()

	*doc = *reopened

	return nil
}

var _ = strings.TrimSpace
