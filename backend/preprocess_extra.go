package wordformat

import (
	"github.com/unidoc/unioffice/v2/document"
)

func ClearHeadingIndents(doc *document.Document, clearLeft, clearRight, clearSpecial bool) error {
	for _, p := range doc.Paragraphs() {
		styleID := p.Style()
		if !isHeading(styleID) {
			continue
		}
		if clearLeft {
			p.SetLeftIndent(0)
		}
		if clearRight {
			p.SetRightIndent(0)
		}
		if clearSpecial {
			p.SetFirstLineIndent(0)
		}
	}
	return nil
}

func ClearExtraSpaces(doc *document.Document) error {
	for _, p := range doc.Paragraphs() {
		for _, r := range p.Runs() {
			text := r.Text()
			if text == "" {
				continue
			}
			cleaned := collapseSpaces(text)
			if cleaned != text {
				r.ClearContent()
				r.AddText(cleaned)
			}
		}
	}
	return nil
}

func collapseSpaces(s string) string {
	var out []rune
	prevSpace := false
	for _, c := range s {
		if c == ' ' || c == '\t' {
			if !prevSpace {
				out = append(out, ' ')
			}
			prevSpace = true
		} else {
			out = append(out, c)
			prevSpace = false
		}
	}
	return string(out)
}

func ClearChartFormat(doc *document.Document) error {
	return nil
}

func MarkdownToPlaintext(doc *document.Document) error {
	replacements := map[string]string{
		"**": "",
		"__": "",
		"~~": "",
	}
	for _, p := range doc.Paragraphs() {
		for _, r := range p.Runs() {
			text := r.Text()
			if text == "" {
				continue
			}
			modified := text
			for old, new := range replacements {
				if old == "" {
					continue
				}
				modified = replaceAll(modified, old, new)
			}
			if modified != text {
				r.ClearContent()
				r.AddText(modified)
			}
		}
	}
	return nil
}

func replaceAll(s, old, new string) string {
	if old == "" {
		return s
	}
	result := ""
	for {
		i := indexOf(s, old)
		if i < 0 {
			result += s
			return result
		}
		result += s[:i] + new
		s = s[i+len(old):]
	}
}

func indexOf(s, substr string) int {
	for i := 0; i+len(substr) <= len(s); i++ {
		if s[i:i+len(substr)] == substr {
			return i
		}
	}
	return -1
}
