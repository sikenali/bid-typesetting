package wordformat

import (
	"archive/zip"
	"bytes"
	"encoding/xml"
	"fmt"
	"io"
	"os"
	"path"
	"regexp"
	"sort"
	"strings"

	"github.com/unidoc/unioffice/v2/document"
)

// SaveDocx writes a document as a valid .docx zip package using only public
// unioffice APIs, bypassing the license-gated Save/SaveToFile.
//
// It serialises every part reachable from the document object (body, styles,
// settings, numbering, theme, font table, headers, footers, relationships,
// content types, properties), carries binary parts such as word/media/* over
// from the source file, then reconciles the relationship tables and content
// type overrides so the package contains no dangling references.
//
// sourcePath may name the file the document was opened from. It may be empty
// (for documents built from scratch or intermediate round-trips), in which
// case parts unioffice does not expose cannot be recovered.
func SaveDocx(doc *document.Document, outputPath, sourcePath string) error {
	if err := os.MkdirAll(parentDir(outputPath), 0o644); err != nil {
		return err
	}

	parts, err := collectParts(doc, sourcePath)
	if err != nil {
		return err
	}
	reconcileParts(parts)

	return writeZip(outputPath, parts)
}

// collectParts assembles the zip entry contents, keyed by part name.
func collectParts(doc *document.Document, sourcePath string) (map[string][]byte, error) {
	parts := map[string][]byte{}

	add := func(name string, v interface{}) error {
		data, err := marshalXML(v)
		if err != nil {
			return fmt.Errorf("marshal %s: %w", name, err)
		}
		if data == nil {
			return nil
		}
		var buf bytes.Buffer
		buf.WriteString(xml.Header)
		buf.Write(data)
		parts[name] = buf.Bytes()
		return nil
	}

	if err := add("[Content_Types].xml", doc.ContentTypes.X()); err != nil {
		return nil, err
	}
	if err := add("_rels/.rels", doc.Rels.X()); err != nil {
		return nil, err
	}
	if err := add("docProps/app.xml", doc.AppProperties.X()); err != nil {
		return nil, err
	}
	if err := add("docProps/core.xml", doc.CoreProperties.X()); err != nil {
		return nil, err
	}
	if err := add("word/document.xml", doc.X()); err != nil {
		return nil, err
	}
	if err := add("word/_rels/document.xml.rels", doc.DocRels().X()); err != nil {
		return nil, err
	}
	if err := add("word/settings.xml", doc.Settings.X()); err != nil {
		return nil, err
	}
	if err := add("word/styles.xml", doc.Styles.X()); err != nil {
		return nil, err
	}
	if err := add("word/numbering.xml", doc.Numbering.X()); err != nil {
		return nil, err
	}

	if themes := doc.Themes(); len(themes) > 0 && themes[0] != nil {
		if err := add("word/theme/theme1.xml", themes[0]); err != nil {
			return nil, err
		}
	}
	if ft := doc.FontTable(); ft != nil {
		if err := add("word/fontTable.xml", ft); err != nil {
			return nil, err
		}
	}

	// Headers and footers are the parts that used to be dropped and replaced
	// with empty placeholders, which silently erased every page header and
	// footer formatting the user had configured.
	for _, h := range doc.Headers() {
		if err := add(headerFooterPart(h.Index(), false), h.X()); err != nil {
			return nil, err
		}
	}
	for _, f := range doc.Footers() {
		if err := add(headerFooterPart(f.Index(), true), f.X()); err != nil {
			return nil, err
		}
	}

	if err := carryOverBinaryParts(parts, sourcePath); err != nil {
		return nil, err
	}
	return parts, nil
}

func headerFooterPart(index int, footer bool) string {
	if footer {
		return fmt.Sprintf("word/footer%d.xml", index+1)
	}
	return fmt.Sprintf("word/header%d.xml", index+1)
}

// carryOverBinaryParts copies parts the document object does not expose back to
// the writer: media, embeddings, charts, diagrams, glyphs, themes and the
// per-part relationship files that images and embedded objects rely on.
func carryOverBinaryParts(parts map[string][]byte, sourcePath string) error {
	if sourcePath == "" {
		return nil
	}
	r, err := zip.OpenReader(sourcePath)
	if err != nil {
		// The source may be gone (round-trip through a temp file). The package
		// is still valid on its own.
		return nil
	}
	defer r.Close()

	for _, f := range r.File {
		name := f.Name
		if parts[name] != nil {
			continue
		}
		switch {
		case strings.HasPrefix(name, "word/media/"),
			strings.HasPrefix(name, "word/embeddings/"),
			strings.HasPrefix(name, "word/charts/"),
			strings.HasPrefix(name, "word/diagrams/"),
			strings.HasPrefix(name, "word/glyphs/"),
			strings.HasPrefix(name, "word/theme/"),
			strings.HasPrefix(name, "customXml/"),
			strings.HasPrefix(name, "word/_rels/header"),
			strings.HasPrefix(name, "word/_rels/footer"),
			name == "word/fontTable.xml",
			name == "word/webSettings.xml",
			name == "word/stylesWithEffects.xml":
		default:
			continue
		}
		data, err := readZipEntry(f)
		if err != nil {
			return fmt.Errorf("read %s from source: %w", name, err)
		}
		parts[name] = data
	}
	return nil
}

func readZipEntry(f *zip.File) ([]byte, error) {
	rc, err := f.Open()
	if err != nil {
		return nil, err
	}
	defer rc.Close()
	return io.ReadAll(rc)
}

var (
	relTagRE       = regexp.MustCompile(`<Relationship\b[^>]*/?>(?:\s*</Relationship>)?`)
	attrIDRE       = regexp.MustCompile(`Id="([^"]*)"`)
	attrTargetRE   = regexp.MustCompile(`Target="([^"]*)"`)
	attrTargetMode = regexp.MustCompile(`TargetMode="([^"]*)"`)
	overrideRE     = regexp.MustCompile(`<Override\b[^>]*/?>(?:\s*</Override>)?`)
	attrPartNameRE = regexp.MustCompile(`PartName="([^"]*)"`)
	attrExtRE      = regexp.MustCompile(`Extension="([^"]*)"`)
	refIDRE        = regexp.MustCompile(`(?:r|pr|a14|a|vml|w10|rds):[a-zA-Z]*?(?:id|embed|link|relId)="([^"]+)"`)
)

// reconcileParts removes relationship entries and content type overrides that
// point at parts we did not write, and makes sure every part we did write has
// a content type. The result is a package whose references all resolve.
func reconcileParts(parts map[string][]byte) {
	for _, name := range sortedParts(parts) {
		if !strings.HasSuffix(name, ".rels") {
			continue
		}
		baseDir, owner := splitRelsPart(name)
		parts[name] = reconcileRels(parts[name], parts, owner, baseDir)
	}
	if ct, ok := parts["[Content_Types].xml"]; ok {
		parts["[Content_Types].xml"] = reconcileContentTypes(ct, parts)
	}
}

// splitRelsPart parses a rels part name such as "word/_rels/document.xml.rels"
// into the directory its targets resolve against and the part whose content
// references its relationship ids.
func splitRelsPart(relsName string) (baseDir, owner string) {
	dirs := strings.Split(relsName, "/")
	if len(dirs) < 2 || dirs[len(dirs)-2] != "_rels" {
		return "", ""
	}
	owner = strings.TrimSuffix(dirs[len(dirs)-1], ".rels")
	if owner == "" {
		return "", ""
	}
	return strings.TrimSuffix(strings.Join(dirs[:len(dirs)-2], "/"), "/"), owner
}

func reconcileRels(data []byte, parts map[string][]byte, owner, baseDir string) []byte {
	ids := map[string]bool{}
	if body, ok := parts[owner]; ok {
		for _, id := range refIDRE.FindAllStringSubmatch(string(body), -1) {
			ids[id[1]] = true
		}
	}
	return dropTags(data, relTagRE, func(tag []byte) bool {
		return keepRel(tag, parts, ids, baseDir)
	})
}

func keepRel(tag []byte, parts map[string][]byte, ids map[string]bool, baseDir string) bool {
	mode := sub(tag, attrTargetMode)
	target := sub(tag, attrTargetRE)
	id := sub(tag, attrIDRE)
	if target == "" {
		return false
	}
	if mode != "" && strings.EqualFold(mode, "External") {
		return true
	}
	if strings.Contains(target, "://") || strings.HasPrefix(target, "#") {
		return true
	}
	if _, ok := parts[resolveTarget(baseDir, target)]; ok {
		return true
	}
	// A relationship whose target we did not write is only safe to keep when
	// the owning part never references that id.
	if id != "" && ids[id] {
		return false
	}
	return false
}

// sub extracts the first capture group of re from tag as a string.
func sub(tag []byte, re *regexp.Regexp) string {
	m := re.FindSubmatch(tag)
	if len(m) < 2 {
		return ""
	}
	return string(m[1])
}

// resolveTarget resolves a relationship target against the owning part's
// directory, following the package-part path rules including ../ steps.
func resolveTarget(baseDir, target string) string {
	clean := strings.ReplaceAll(strings.TrimSpace(target), "\\", "/")
	if clean == "" || strings.HasPrefix(clean, "http") || strings.HasPrefix(clean, "#") {
		return ""
	}
	seg := strings.Split(clean, "/")
	if baseDir != "" {
		seg = append(strings.Split(baseDir, "/"), seg...)
	}
	out := make([]string, 0, len(seg))
	for _, s := range seg {
		switch {
		case s == "" || s == ".":
		case s == "..":
			if len(out) == 0 {
				return ""
			}
			out = out[:len(out)-1]
		default:
			out = append(out, s)
		}
	}
	return strings.Join(out, "/")
}

func reconcileContentTypes(data []byte, parts map[string][]byte) []byte {
	base := dropTags(data, overrideRE, func(tag []byte) bool {
		name := sub(tag, attrPartNameRE)
		if name == "" {
			return true
		}
		_, ok := parts[strings.TrimPrefix(name, "/")]
		return ok
	})

	haveExt := map[string]bool{}
	for name := range parts {
		if ext := path.Ext(strings.TrimSuffix(name, ".rels")); ext != "" {
			haveExt[strings.TrimPrefix(ext, ".")] = true
		}
	}

	var add bytes.Buffer
	for ext := range haveExt {
		if bytes.Contains(base, []byte(`Extension="`+ext+`"`)) {
			continue
		}
		_, _ = fmt.Fprintf(&add, `<Default Extension="%s" ContentType="%s"></Default>`, ext, contentTypeFor(ext))
	}
	if add.Len() == 0 {
		return base
	}
	idx := bytes.Index(base, []byte("</Types>"))
	if idx < 0 {
		return base
	}
	res := append([]byte(nil), base[:idx]...)
	res = append(res, add.Bytes()...)
	res = append(res, base[idx:]...)
	return res
}

// dropTags removes tags for which keep returns false. Everything before the
// first tag and after the last one is always preserved so the wrapper element
// stays well-formed; kept tags are rejoined with a single space.
func dropTags(data []byte, re *regexp.Regexp, keep func([]byte) bool) []byte {
	locs := re.FindAllIndex(data, -1)
	if len(locs) == 0 {
		return data
	}

	var out bytes.Buffer
	out.Write(data[:locs[0][0]])
	first := true
	for _, loc := range locs {
		if keep(data[loc[0]:loc[1]]) {
			if !first {
				out.WriteString(" ")
			}
			out.Write(data[loc[0]:loc[1]])
			first = false
		}
	}
	out.Write(data[locs[len(locs)-1][1]:])
	return out.Bytes()
}

func contentTypeFor(ext string) string {
	switch strings.ToLower(ext) {
	case "jpeg", "jpg":
		return "image/jpeg"
	case "png":
		return "image/png"
	case "gif":
		return "image/gif"
	case "bmp":
		return "image/bmp"
	case "tiff":
		return "image/tiff"
	case "wmf":
		return "image/x-wmf"
	case "emf":
		return "image/x-emf"
	case "svg":
		return "image/svg+xml"
	case "bin":
		return "application/vnd.openxmlformats-officedocument.oleObject"
	case "xlsx":
		return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	default:
		return "application/octet-stream"
	}
}

func writeZip(outputPath string, parts map[string][]byte) error {
	f, err := os.Create(outputPath)
	if err != nil {
		return err
	}
	defer f.Close()

	zw := zip.NewWriter(f)
	for _, name := range sortedParts(parts) {
		w, err := zw.Create(name)
		if err != nil {
			return fmt.Errorf("zip entry %s: %w", name, err)
		}
		if _, err := w.Write(parts[name]); err != nil {
			return fmt.Errorf("write %s: %w", name, err)
		}
	}
	return zw.Close()
}

func sortedParts(parts map[string][]byte) []string {
	names := make([]string, 0, len(parts))
	for name := range parts {
		names = append(names, name)
	}
	sort.Strings(names)
	return names
}

// marshalXML serialises a value with encoding/xml. The encoder calls the type's
// MarshalXML method, which is how unioffice's schema types emit their namespace
// attributes and element names.
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
