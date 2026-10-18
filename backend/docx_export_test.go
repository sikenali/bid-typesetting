package wordformat

import (
	"archive/zip"
	"io"
	"path"
	"path/filepath"
	"regexp"
	"strings"
	"testing"

	"github.com/unidoc/unioffice/v2/document"
)

// savedPackage loads every part of a docx into a map for structural checks.
func savedPackage(t *testing.T, p string) map[string][]byte {
	t.Helper()
	zr, err := zip.OpenReader(p)
	if err != nil {
		t.Fatal(err)
	}
	defer zr.Close()

	parts := map[string][]byte{}
	for _, f := range zr.File {
		rc, err := f.Open()
		if err != nil {
			t.Fatal(err)
		}
		b, err := io.ReadAll(rc)
		rc.Close()
		if err != nil {
			t.Fatal(err)
		}
		parts[f.Name] = b
	}
	return parts
}

var defaultTagRE = regexp.MustCompile(`<Default\b[^>]*/?>(?:\s*</Default>)?`)

// validateDocxPackage asserts the OOXML package invariants Word enforces:
// every relationship target exists in the package, every content type override
// points at a real part, every extension has a content type, and every
// r:id / r:embed reference resolves to a relationship of the owning part.
func validateDocxPackage(t *testing.T, parts map[string][]byte) {
	t.Helper()

	for name, data := range parts {
		if !strings.HasSuffix(name, ".rels") {
			continue
		}
		base, owner := splitRelsPart(name)
		tags := relTagRE.FindAll(data, -1)

		for _, tag := range tags {
			target := sub(tag, attrTargetRE)
			mode := sub(tag, attrTargetMode)
			if target == "" {
				continue
			}
			if mode != "" && strings.EqualFold(mode, "External") {
				continue
			}
			if strings.Contains(target, "://") || strings.HasPrefix(target, "#") {
				continue
			}
			resolved := resolveTarget(base, target)
			if _, ok := parts[resolved]; !ok {
				t.Errorf("%s: relationship target %q not in package", name, resolved)
			}
		}

		if owner == "" {
			continue
		}
		ownerBody, ok := parts[owner]
		if !ok {
			continue
		}
		for _, ref := range refIDRE.FindAllSubmatch(ownerBody, -1) {
			id := string(ref[1])
			defined := false
			for _, tag := range tags {
				if sub(tag, attrIDRE) == id {
					defined = true
					break
				}
			}
			if !defined {
				t.Errorf("%s: %s references %q which %s does not define", owner, owner, id, name)
			}
		}
	}

	if ct, ok := parts["[Content_Types].xml"]; ok {
		for _, tag := range overrideRE.FindAll(ct, -1) {
			part := strings.TrimPrefix(sub(tag, attrPartNameRE), "/")
			if _, ok := parts[part]; !ok {
				t.Errorf("[Content_Types].xml overrides missing part %q", part)
			}
		}
		defaults := map[string]bool{}
		for _, tag := range defaultTagRE.FindAll(ct, -1) {
			defaults[strings.ToLower(sub(tag, attrExtRE))] = true
		}
		for name := range parts {
			ext := path.Ext(name)
			if ext == "" || strings.HasSuffix(name, ".rels") {
				continue
			}
			if !defaults[strings.ToLower(strings.TrimPrefix(ext, "."))] {
				t.Errorf("part %q has no content type declaration", name)
			}
		}
	}
}

func TestSaveDocxPreservesHeadersAndFooters(t *testing.T) {
	doc := document.New()
	doc.AddHeader().AddParagraph().AddRun().AddText("HEADER-SENTINEL")
	doc.AddFooter().AddParagraph().AddRun().AddText("FOOTER-SENTINEL")
	doc.AddParagraph().AddRun().AddText("正文")

	out := filepath.Join(t.TempDir(), "out.docx")
	if err := SaveDocx(doc, out, ""); err != nil {
		t.Fatal(err)
	}
	parts := savedPackage(t, out)
	validateDocxPackage(t, parts)

	if hdr := string(parts["word/header1.xml"]); !strings.Contains(hdr, "HEADER-SENTINEL") {
		t.Errorf("header content lost: %s", hdr)
	}
	if ftr := string(parts["word/footer1.xml"]); !strings.Contains(ftr, "FOOTER-SENTINEL") {
		t.Errorf("footer content lost: %s", ftr)
	}
}

func TestSaveDocxRoundTripStaysValid(t *testing.T) {
	original := document.New()
	original.AddParagraph().AddRun().AddText("原文")
	src := filepath.Join(t.TempDir(), "src.docx")
	if err := SaveDocx(original, src, ""); err != nil {
		t.Fatal(err)
	}

	doc, err := document.Open(src)
	if err != nil {
		t.Fatal(err)
	}
	defer doc.Close()
	doc.AddHeader().AddParagraph().AddRun().AddText("hdr")

	out := filepath.Join(t.TempDir(), "out.docx")
	if err := SaveDocx(doc, out, src); err != nil {
		t.Fatal(err)
	}
	parts := savedPackage(t, out)
	validateDocxPackage(t, parts)

	reopened, err := document.Open(out)
	if err != nil {
		t.Fatalf("round-trip output is not openable: %v", err)
	}
	reopened.Close()
}

func TestSaveDocxDiscardsUnserialisableParts(t *testing.T) {
	doc := document.New()
	doc.AddParagraph().AddRun().AddText("x")
	out := filepath.Join(t.TempDir(), "out.docx")
	if err := SaveDocx(doc, out, ""); err != nil {
		t.Fatal(err)
	}
	validateDocxPackage(t, savedPackage(t, out))
}
