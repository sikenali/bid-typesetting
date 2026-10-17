package wordformat

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/unidoc/unioffice/v2/document"
	"github.com/unidoc/unioffice/v2/schema/soo/wml"
)

var zhNumPattern = `[一二三四五六七八九十百千]+`
var arabicPattern = `\d+`

var wrapperMap = map[string]string{
	"DUNHAO":       `、`,
	"DOUBLE_PAREN": `[）)]`,
	"DOT":          `\.`,
	"SINGLE_PAREN": `[)]`,
	"PAREN":        `[)]`,
	"BRACKET":      `[]]`,
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
	return regexp.MustCompile(fmt.Sprintf(`^(%s)%s?\s*(.*)`, scheme, wrapper))
}

type NumberingManager struct {
	doc       *document.Document
	ruleCache map[string]document.NumberingDefinition
}

func NewNumberingManager(doc *document.Document) *NumberingManager {
	return &NumberingManager{
		doc:       doc,
		ruleCache: make(map[string]document.NumberingDefinition),
	}
}

func (nm *NumberingManager) ruleKey(rule *PatternRule) string {
	return fmt.Sprintf("%s|%s|%s", rule.Scheme, rule.Wrapper, rule.CustomExample)
}

func (nm *NumberingManager) EnsureAbstractNum(rule *PatternRule) (document.NumberingDefinition, error) {
	key := nm.ruleKey(rule)
	if cached, ok := nm.ruleCache[key]; ok {
		return cached, nil
	}

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
		default:
			lvl.SetFormat(wml.ST_NumberFormatDecimal)
		}
		lvl.SetAlignment(wml.ST_JcStart)
		lvl.SetText(fmt.Sprintf("%%%d.", level+1))
	}

	nm.ruleCache[key] = nd
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
	defCache := make(map[string]int64)

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

			key := nm.ruleKey(&rule)
			if _, ok := defCache[key]; !ok {
				nd, err := nm.EnsureAbstractNum(&rule)
				if err != nil {
					continue
				}
				defCache[key] = nd.AbstractNumberID()
			}

			p.SetNumberingDefinitionByID(defCache[key])
			level := countDepthLevel(rule.MultiDepth)
			p.SetNumberingLevel(level)

			break
		}
	}
	return nil
}

func countDepthLevel(depth int) int {
	if depth < 0 {
		return 0
	}
	if depth > 8 {
		return 8
	}
	return depth
}

func countDepthLevelFromString(depth string) int {
	if depth == "" {
		return 0
	}
	if n, err := strconv.Atoi(depth); err == nil {
		return countDepthLevel(n)
	}
	return strings.Count(depth, ".")
}
