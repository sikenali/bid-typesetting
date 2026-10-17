package wordformat

import (
	"fmt"

	"github.com/unidoc/unioffice/v2/document"
)

func headingStyleIDs(level int) []string {
	cn := map[int]string{1: "一", 2: "二", 3: "三", 4: "四"}
	cnChar := cn[level]
	return []string{
		fmt.Sprintf("Heading%d", level),
		fmt.Sprintf("heading%d", level),
		fmt.Sprintf("标题%s", cnChar),
		fmt.Sprintf("標題%s", cnChar),
		fmt.Sprintf("标题 %d", level),
	}
}

func matchHeadingLevel(styleID string) int {
	if len(styleID) >= 7 && (styleID[:7] == "Heading" || styleID[:7] == "heading") {
		var lvl int
		if _, err := fmt.Sscanf(styleID[7:], "%d", &lvl); err == nil {
			return lvl
		}
	}
	cnMap := map[string]int{"一": 1, "二": 2, "三": 3, "四": 4}
	cnHeadings := []string{"标题", "標題"}
	for _, prefix := range cnHeadings {
		if len(styleID) > len(prefix) {
			if styleID[:len(prefix)] == prefix {
				rest := styleID[len(prefix):]
				rest = trimSpace(rest)
				if c, ok := cnMap[rest]; ok {
					return c
				}
				var lvl int
				if _, err := fmt.Sscanf(rest, "%d", &lvl); err == nil {
					return lvl
				}
			}
		}
	}
	return -1
}

func trimSpace(s string) string {
	start := 0
	end := len(s)
	for start < end && (s[start] == ' ' || s[start] == '\t') {
		start++
	}
	for end > start && (s[end-1] == ' ' || s[end-1] == '\t') {
		end--
	}
	return s[start:end]
}

func ApplyHeadingFormats(doc *document.Document, hs []HeadingStyle) error {
	if len(hs) == 0 {
		return nil
	}

	for _, p := range doc.Paragraphs() {
		styleID := p.Style()
		lvl := matchHeadingLevel(styleID)
		if lvl < 1 || lvl > len(hs) {
			continue
		}
		h := hs[lvl-1]

		if h.Align != "" {
			p.SetAlignment(alignFromString(h.Align))
		}

		applyParagraphSpacing(p, &h.BodyStyle)

		for _, r := range p.Runs() {
			applyStyleToRun(r, &h.BodyStyle)
		}
	}
	return nil
}
