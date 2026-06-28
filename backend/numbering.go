package wordformat

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/unidoc/unioffice/document"
	"github.com/unidoc/unioffice/schema/soo/wml"
)

var zhNumPattern = `[一二三四五六七八九十百千]+`
var arabicPattern = `\d+`

var wrapperMap = map[string]string{
	"DUNHAO":       `、`,
	"DOUBLE_PAREN": `[）\)]`,
	"DOT":          `\.`,
	"SINGLE_PAREN": `[）\)]`,
}

func buildPatternRegex(rule *PatternRule) *regexp.Regexp {
	scheme := zhNumPattern
	if rule.Scheme == "ARABIC" {
		scheme = arabicPattern
	}
	wrapper, ok := wrapperMap[rule.Wrapper]
	if !ok {
		return nil
	}
	return regexp.MustCompile(fmt.Sprintf(`^(%s)%s\s*(.*)`, scheme, wrapper))
}

type NumberingManager struct {
	doc       *document.Document
	nextNumID int32
}

func NewNumberingManager(doc *document.Document) *NumberingManager {
	return &NumberingManager{
		doc:       doc,
		nextNumID: 1,
	}
}

func (nm *NumberingManager) EnsureAbstractNum(rule *PatternRule) (document.NumberingDefinition, error) {
	num := nm.doc.Numbering
	nd := num.AddDefinition()
	nd.SetMultiLevelType(wml.ST_MultiLevelTypeMultilevel)

	for level := 0; level < 9; level++ {
		lvl := nd.AddLevel()
		switch rule.Scheme {
		case "ZH_NUM":
			lvl.SetFormat(wml.ST_NumberFormatChineseCounting)
		case "ARABIC":
			lvl.SetFormat(wml.ST_NumberFormatDecimal)
		}
		lvl.SetAlignment(wml.ST_JcStart)
		lvl.SetText(fmt.Sprintf("%%%d.", level+1))
		lvl.X().Start = wml.NewCT_DecimalNumber()
		lvl.X().Start.ValAttr = 1
	}

	return nd, nil
}

func ApplyNumbering(doc *document.Document, cfg *PatternConfig) error {
	var activeRules []PatternRule
	for _, r := range cfg.Rules {
		if r.Enabled {
			activeRules = append(activeRules, r)
		}
	}
	if len(activeRules) == 0 {
		return nil
	}

	nm := NewNumberingManager(doc)

	for _, p := range doc.Paragraphs() {
		text := paragraphText(p)
		if text == "" {
			continue
		}

		for _, rule := range activeRules {
			re := buildPatternRegex(&rule)
			if re == nil {
				continue
			}
			matches := re.FindStringSubmatch(text)
			if matches == nil {
				continue
			}

			stripped := strings.TrimSpace(matches[2])
			clearParagraphContent(p)
			run := p.AddRun()
			run.AddText(stripped)

			nd, err := nm.EnsureAbstractNum(&rule)
			if err != nil {
				continue
			}
			_ = nd

			p.SetNumberingDefinitionByID(nd.AbstractNumberID())
			level := countDepthLevel(rule.MultiDepth)
			p.SetNumberingLevel(level)

			break
		}
	}
	return nil
}

func countDepthLevel(depth string) int {
	if depth == "" {
		return 0
	}
	return strings.Count(depth, ".")
}
