package wordformat

import (
	"strings"

	"github.com/unidoc/unioffice/v2/document"
)

func NormalizePunctuation(doc *document.Document) error {
	punctMap := map[rune]rune{
		'，': ',', '。': '.', '；': ';',
		'：': ':', '！': '!', '？': '?',
		'（': '(', '）': ')', '“': '"', '”': '"',
		'‘': '\'', '’': '\'', '【': '[', '】': ']',
	}
	for _, p := range doc.Paragraphs() {
		for _, r := range p.Runs() {
			text := r.Text()
			var sb strings.Builder
			for _, ch := range text {
				if mapped, ok := punctMap[ch]; ok {
					sb.WriteRune(mapped)
				} else {
					sb.WriteRune(ch)
				}
			}
			r.ClearContent()
			r.AddText(sb.String())
		}
	}
	return nil
}
