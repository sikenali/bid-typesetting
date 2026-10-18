package wordformat

import (
	"strings"

	"github.com/unidoc/unioffice/v2/document"
)

// NormalizePunctuation 把中文语境下的半角标点统一为全角。
// 仅在标点相邻字符为 CJK 时转换，避免破坏 99.9%、HTTP 1.1、50ms 等数字与英文片段。
func NormalizePunctuation(doc *document.Document) error {
	for _, p := range doc.Paragraphs() {
		for _, r := range p.Runs() {
			text := r.Text()
			out := normalizePunct(text)
			if out != text {
				r.ClearContent()
				r.AddText(out)
			}
		}
	}
	return nil
}

func isCJK(r rune) bool {
	return (r >= 0x4E00 && r <= 0x9FFF) ||
		(r >= 0x3400 && r <= 0x4DBF) ||
		(r >= 0x3000 && r <= 0x303F) ||
		(r >= 0xFF00 && r <= 0xFFEF)
}

func isDigit(r rune) bool { return r >= '0' && r <= '9' }

func normalizePunct(text string) string {
	runes := []rune(text)
	n := len(runes)
	var sb strings.Builder
	sb.Grow(n)

	dqState, sqState := 0, 0

	for i, ch := range runes {
		prev, next := rune(0), rune(0)
		if i > 0 {
			prev = runes[i-1]
		}
		if i+1 < n {
			next = runes[i+1]
		}
		adjCJK := isCJK(prev) || isCJK(next)

		switch ch {
		case '.':
			// 小数点与版本号保留半角
			if !isDigit(prev) && !isDigit(next) && adjCJK {
				sb.WriteRune('。')
				continue
			}
		case ',':
			// 千分位逗号保留半角
			if !isDigit(prev) && adjCJK {
				sb.WriteRune('，')
				continue
			}
		case ';':
			if adjCJK {
				sb.WriteRune('；')
				continue
			}
		case ':':
			if adjCJK {
				sb.WriteRune('：')
				continue
			}
		case '!':
			if adjCJK {
				sb.WriteRune('！')
				continue
			}
		case '?':
			if adjCJK {
				sb.WriteRune('？')
				continue
			}
		case '(':
			if adjCJK {
				sb.WriteRune('（')
				continue
			}
		case ')':
			if adjCJK {
				sb.WriteRune('）')
				continue
			}
		case '"':
			if adjCJK {
				if dqState == 0 {
					sb.WriteRune('“')
					dqState = 1
				} else {
					sb.WriteRune('”')
					dqState = 0
				}
				continue
			}
		case '\'':
			if adjCJK {
				if sqState == 0 {
					sb.WriteRune('‘')
					sqState = 1
				} else {
					sb.WriteRune('’')
					sqState = 0
				}
				continue
			}
		}
		sb.WriteRune(ch)
	}
	return sb.String()
}
