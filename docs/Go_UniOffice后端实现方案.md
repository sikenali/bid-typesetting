# Go + unioffice 跨平台后端实现方案

> 目标：实现跨平台 Word 文档格式化工具  
> 架构：前端任意框架 (vue) + 后端 unioffice (Go)  
> 核心价值：单二进制部署 | macOS/Linux/Windows | TOC域代码无需外部程序

---

## 一、项目骨架 & 配置模型

```go
// config.go — 直接映射 0.上一次设置.json
package wordformat

type Config struct {
	ApplyPage         bool `json:"apply_page"`
	ApplyBody         bool `json:"apply_body"`
	ApplyHeadings     bool `json:"apply_headings"`
	ApplyFigTbl       bool `json:"apply_figtbl"`
	ApplyTOC          bool `json:"apply_toc"`
	ApplyHeaderFooter bool `json:"apply_header_footer"`

	PreprocessSpaces            bool `json:"preprocess_spaces"`
	PreprocessFigCaption        bool `json:"preprocess_fig_caption"`
	PreprocessFigCaptionSpaces  int  `json:"preprocess_fig_caption_spaces"`
	PreprocessTblCaption        bool `json:"preprocess_tbl_caption"`
	PreprocessTblCaptionSpaces  int  `json:"preprocess_tbl_caption_spaces"`
	PreprocessSuperscript       bool `json:"preprocess_superscript"`
	PreprocessPunctuation       bool `json:"preprocess_punctuation"`
	PreprocessObjectWrapping    bool `json:"preprocess_object_wrapping"`
	PreprocessSoftReturn        bool `json:"preprocess_soft_return"`
	PreprocessTabMode           int  `json:"preprocess_tab_mode"`
	PreprocessClearAllStyles    bool `json:"preprocess_clear_all_styles"`
	PreprocessClearIndents      bool `json:"preprocess_clear_indents"`
	PreprocessDeleteEmptyLines  bool `json:"preprocess_delete_empty_lines"`
	PreprocessClearSnapToGrid   bool `json:"preprocess_clear_snap_to_grid"`
	PreprocessFlattenSDT        bool `json:"preprocess_flatten_sdt"`
	PreprocessPostCleanStyles   bool `json:"preprocess_post_clean_styles"`

	Margins      Margins        `json:"margins"`
	Body         BodyStyle      `json:"body"`
	Headings     []HeadingStyle `json:"headings"`
	FigCaption   CaptionStyle   `json:"fig_caption"`
	TblCaption   CaptionStyle   `json:"tbl_caption"`
	Table        TableStyle     `json:"table"`
	TOC          TOCConfig      `json:"toc"`
	HeaderFooter HeaderFooter   `json:"header_footer"`
	Patterns     PatternConfig  `json:"patterns"`
}

type BodyStyle struct {
	CNFont               string  `json:"cn_font"`
	ENFont               string  `json:"en_font"`
	SizeCN               string  `json:"size_cn"`     // "四号" → 14pt
	Bold                 bool    `json:"bold"`
	LineSpacingMode      string  `json:"line_spacing_mode"`
	LineSpacingValue     float64 `json:"line_spacing_value"`
	FirstLineIndentChars float64 `json:"first_line_indent_chars"`
	Align                string  `json:"align"`       // "JUSTIFY"
	SpaceBeforeValue     float64 `json:"space_before_value"`
	SpaceBeforeUnit      string  `json:"space_before_unit"`
	SpaceAfterValue      float64 `json:"space_after_value"`
	SpaceAfterUnit       string  `json:"space_after_unit"`
	LeftIndentValue      float64 `json:"left_indent_value"`
	LeftIndentUnit       string  `json:"left_indent_unit"`
	RightIndentValue     float64 `json:"right_indent_value"`
	RightIndentUnit      string  `json:"right_indent_unit"`
}

type HeadingStyle struct {
	BodyStyle
}

type CaptionStyle struct {
	BodyStyle
}

type Margins struct {
	TopCM               float64 `json:"top_cm"`
	BottomCM            float64 `json:"bottom_cm"`
	LeftCM              float64 `json:"left_cm"`
	RightCM             float64 `json:"right_cm"`
	PaperSize           string  `json:"paper_size"`
	PaperWidthCM        float64 `json:"paper_width_cm"`
	PaperHeightCM       float64 `json:"paper_height_cm"`
	Columns             int     `json:"columns"`
	ColumnSpacingCM     float64 `json:"column_spacing_cm"`
	KeepOriginalOrientation bool `json:"keep_original_orientation"`
}

type TableStyle struct {
	CNFont              string  `json:"cn_font"`
	ENFont              string  `json:"en_font"`
	SizeCN              string  `json:"size_cn"`
	Autofit             bool    `json:"autofit"`
	LineSpacingMode     string  `json:"line_spacing_mode"`
	LineSpacingValue    float64 `json:"line_spacing_value"`
	Align               string  `json:"align"`
	CellAlign           string  `json:"cell_align"`
	MinRowHeightPT      float64 `json:"min_row_height_pt"`
	EnableCellFormatting bool   `json:"enable_cell_formatting"`
	StyleType           string  `json:"style_type"`
}

type TOCConfig struct {
	Enable      bool        `json:"enable"`
	TitleText   string      `json:"title_text"`
	TitleCNFont string      `json:"title_cn_font"`
	TitleENFont string      `json:"title_en_font"`
	TitleSizeCN string      `json:"title_size_cn"`
	LevelStyles []TOCLevel  `json:"level_styles"`
}

type TOCLevel struct {
	CNFont         string  `json:"cn_font"`
	ENFont         string  `json:"en_font"`
	SizeCN         string  `json:"size_cn"`
	Bold           bool    `json:"bold"`
	ColorRGB       [3]int  `json:"color_rgb"`
	LineSpacingMode string `json:"line_spacing_mode"`
	TabLeader      string  `json:"tab_leader"`
	LeftIndentChars float64 `json:"left_indent_chars"`
}

type HeaderFooter struct {
	EnableHeader        bool   `json:"enable_header"`
	EnableFooter        bool   `json:"enable_footer"`
	HeaderText          string `json:"header_text"`
	HeaderCNFont        string `json:"header_cn_font"`
	HeaderENFont        string `json:"header_en_font"`
	HeaderSizeCN        string `json:"header_size_cn"`
	HeaderAlign         string `json:"header_align"`
	HeaderBold          bool   `json:"header_bold"`
	HeaderTopCM         float64 `json:"header_top_cm"`
	FooterBottomCM      float64 `json:"footer_bottom_cm"`
	PageNumberFromBody  bool   `json:"page_number_from_body"`
	ClearFooter         bool   `json:"clear_footer"`
	FooterCNFont        string `json:"footer_cn_font"`
	FooterENFont        string `json:"footer_en_font"`
	FooterSizeCN        string `json:"footer_size_cn"`
	FooterAlign         string `json:"footer_align"`
	FooterPageNumberType string `json:"footer_page_number_type"`
}

type PatternConfig struct {
	Rules []PatternRule `json:"rules"`
}

type PatternRule struct {
	Scheme       string `json:"scheme"`       // "ZH_NUM" | "ARABIC"
	Wrapper      string `json:"wrapper"`      // "DUNHAO" | "DOUBLE_PAREN" | "DOT" | "SINGLE_PAREN"
	MultiDepth   string `json:"multi_depth"`  // "1.1" | "1.1.1"
	Enabled      bool   `json:"enabled"`
	CustomExample string `json:"custom_example"`
}
```

```go
// main_pipeline.go — 编排主流水线
func RunPipeline(doc *unioffice.Document, cfg *Config) error {
	// 阶段一: 预处理
	if err := Preprocess(doc, cfg); err != nil {
		return fmt.Errorf("preprocess: %w", err)
	}
	// 阶段二: 格式应用
	if err := ApplyFormatting(doc, cfg); err != nil {
		return fmt.Errorf("format: %w", err)
	}
	// 阶段三: 编号 + 域代码
	if err := ApplyNumbering(doc, cfg); err != nil {
		return fmt.Errorf("numbering: %w", err)
	}
	return nil
}
```

---

## 二、预处理模块

### 2.1 清除样式

```go
// preprocess_styles.go
func ClearAllStyles(doc *unioffice.Document) error {
	minimalStyles := `<?xml version="1.0" encoding="UTF-8"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  mc:Ignorable="w14">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPrDefault>
    <w:pPrDefault/>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/><w:qFormat/>
  </w:style>
  <w:style w:type="character" w:default="1" w:styleId="DefaultParagraphFont">
    <w:name w:val="Default Paragraph Font"/><w:uiPriority w:val="1"/>
  </w:style>
  <w:style w:type="table" w:default="1" w:styleId="TableNormal">
    <w:name w:val="Normal Table"/><w:uiPriority w:val="99"/><w:semiHidden/>
  </w:style>
  <w:style w:type="numbering" w:default="1" w:styleId="NoList">
    <w:name w:val="No List"/><w:uiPriority w:val="99"/><w:semiHidden/>
  </w:style>
</w:styles>`
	return doc.SetStylesXML([]byte(minimalStyles))
}

func PostCleanStyles(doc *unioffice.Document) error {
	// 遍历所有段落，移除内联样式引用
	for _, p := range doc.Paragraphs() {
		p.Properties().SetStyleID("")
		for _, r := range p.Runs() {
			r.Properties().SetStyleID("")
		}
	}
	return nil
}
```

### 2.2 对齐网格

```go
// preprocess_grid.go
func ClearSnapToGrid(doc *unioffice.Document) error {
	for _, p := range doc.Paragraphs() {
		pPr := p.Properties().X()
		if pPr != nil {
			pPr.SnapToGrid = &unioffice.CT_SnapToGrid{}
		}
	}
	return nil
}
```

### 2.3 SDT 折叠

```go
// preprocess_sdt.go
// OOXML: <w:sdt><w:sdtContent>...</w:sdtContent></w:sdt> → 展平为子节点
func FlattenSDT(doc *unioffice.Document) error {
	body := doc.X().Document.Body
	flattenSDTNode(body)
	return nil
}

func flattenSDTNode(node *xml_node.XMLNode) {
	children := node.Children()
	for i := 0; i < len(children); i++ {
		child := children[i]
		if child.LocalName() == "sdt" && child.Namespace() == "w" {
			// 查找 w:sdtContent
			for _, gc := range child.Children() {
				if gc.LocalName() == "sdtContent" && gc.Namespace() == "w" {
					subChildren := gc.Children()
					node.InsertNodeBefore(child, subChildren...)
					node.RemoveChild(child)
					children = node.Children()
					i-- // 重新扫描当前位置
					break
				}
			}
		}
		flattenSDTNode(child)
	}
}
```

### 2.4 软回车处理

```go
// preprocess_softreturn.go
func ReplaceSoftReturns(doc *unioffice.Document) error {
	for _, p := range doc.Paragraphs() {
		runs := p.Runs()
		for i := 0; i < len(runs); i++ {
			br := runs[i].X().Break
			if br != nil && br.Type == "softReturn" {
				// 在当前段落分裂: br 前内容保留当前 Run
				// br 后内容移到新 Run 或新段落
				prevRuns := runs[:i]
				nextRuns := runs[i+1:]
				_ = prevRuns
				_ = nextRuns
				// 用 w:paragraph 标记替换
				runs[i].X().Break = nil
				runs[i].ClearContent()
				runs[i].AddText("\n")
			}
		}
	}
	return nil
}
```

### 2.5 中英文间加空格

```go
// preprocess_spaces.go
func InsertCJKEUSpacing(doc *unioffice.Document) error {
	re1 := regexp.MustCompile(`([\p{Han}])([a-zA-Z0-9])`)
	re2 := regexp.MustCompile(`([a-zA-Z0-9])([\p{Han}])`)

	for _, p := range doc.Paragraphs() {
		for _, r := range p.Runs() {
			oldText, _ := r.Text()
			newText := re1.ReplaceAllString(oldText, "${1} ${2}")
			newText = re2.ReplaceAllString(newText, "${1} ${2}")
			r.ClearContent()
			r.AddText(newText)
		}
	}
	return nil
}
```

### 2.6 图题/表题间距检测

```go
// preprocess_caption_spacing.go
func AdjustCaptionSpacing(doc *unioffice.Document, cfg *Config) error {
	reFig := regexp.MustCompile(`^[图圖](\s*)([\d一二三四五六七八九十百千]+)`)
	reTbl := regexp.MustCompile(`^[表表](\s*)([\d一二三四五六七八九十百千]+)`)

	for _, p := range doc.Paragraphs() {
		text, _ := p.Text()
		pPr := p.Properties()

		switch {
		case reFig.MatchString(text) && cfg.PreprocessFigCaption:
			spaces := twipsFromChar(cfg.PreprocessFigCaptionSpaces)
			pPr.SetSpaceBefore(unioffice.Twips(spaces))
			pPr.SetSpaceAfter(unioffice.Twips(spaces))
		case reTbl.MatchString(text) && cfg.PreprocessTblCaption:
			spaces := twipsFromChar(cfg.PreprocessTblCaptionSpaces)
			pPr.SetSpaceBefore(unioffice.Twips(spaces))
			pPr.SetSpaceAfter(unioffice.Twips(spaces))
		}
	}
	return nil
}

func twipsFromChar(chars int) float64 {
	return float64(chars * 200) // 1汉字 ≈ 200 twips
}
```

### 2.7 清除缩进

```go
// preprocess_indents.go
func ClearIndents(doc *unioffice.Document) error {
	for _, p := range doc.Paragraphs() {
		pPr := p.Properties()
		pPr.SetLeftIndent(0)
		pPr.SetRightIndent(0)
		pPr.SetFirstLineIndent(0)
	}
	return nil
}
```

### 2.8 标点全半角标准化

```go
// preprocess_punctuation.go
func NormalizePunctuation(doc *unioffice.Document) error {
	punctMap := map[rune]rune{
		'，': ',', '。': '.', '；': ';',
		'：': ':', '！': '!', '？': '?',
		'（': '(', '）': ')', '“': '"', '”': '"',
		'‘': '\'', '’': '\'', '【': '[', '】': ']',
	}
	for _, p := range doc.Paragraphs() {
		for _, r := range p.Runs() {
			text, _ := r.Text()
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
```

### 2.9 删除空行

```go
// preprocess_emptylines.go
func DeleteEmptyLines(doc *unioffice.Document) error {
	paras := doc.Paragraphs()
	var toRemove []int
	for i, p := range paras {
		text, _ := p.Text()
		if strings.TrimSpace(text) == "" {
			// 检查是否包含图片等非文本内容
			if !hasDrawingOrObject(p) {
				toRemove = append(toRemove, i)
			}
		}
	}
	// 从后往前删除，避免索引偏移
	for i := len(toRemove) - 1; i >= 0; i-- {
		doc.RemoveParagraph(paras[toRemove[i]])
	}
	return nil
}

func hasDrawingOrObject(p *unioffice.Paragraph) bool {
	// 检查段落内是否包含 w:drawing / w:object / w:pict
	for _, r := range p.Runs() {
		if r.X().Drawing != nil {
			return true
		}
	}
	return false
}
```

### 2.10 上下标/制表符/对象环绕

```go
// preprocess_misc.go
func ClearSuperscript(doc *unioffice.Document) error {
	for _, p := range doc.Paragraphs() {
		for _, r := range p.Runs() {
			rPr := r.Properties().X()
			if rPr != nil {
				rPr.VertAlign = nil // 清除上下标
			}
		}
	}
	return nil
}

func ProcessTabMode(doc *unioffice.Document, mode int) error {
	// mode 0: 保留; 1: 转空格; 2: 清除
	for _, p := range doc.Paragraphs() {
		for _, r := range p.Runs() {
			text, _ := r.Text()
			switch mode {
			case 1:
				r.ClearContent()
				r.AddText(strings.ReplaceAll(text, "\t", " "))
			case 2:
				r.ClearContent()
				r.AddText(strings.ReplaceAll(text, "\t", ""))
			}
		}
	}
	return nil
}

func ClearObjectWrapping(doc *unioffice.Document) error {
	// 操作 drawingML: 将 inline 改为上下型环绕
	// 需要遍历 w:drawing / wp:inline / wp:anchor
	// 伪代码:
	// for each drawing in doc:
	//     wrapText = "through" → "none" (上下型)
	//     set anchor.wrapNone = true
	return nil
}
```

### 2.11 预处理编排

```go
// preprocess.go
func Preprocess(doc *unioffice.Document, cfg *Config) error {
	steps := []struct {
		name string
		fn   func(*unioffice.Document, *Config) error
		skip bool
	}{
		{"清除样式", func(d *unioffice.Document, c *Config) error {
			if c.PreprocessClearAllStyles { return ClearAllStyles(d) }
			return nil
		}},
		{"清除缩进", func(d *unioffice.Document, c *Config) error {
			if c.PreprocessClearIndents { return ClearIndents(d) }
			return nil
		}},
		{"清除对齐网格", func(d *unioffice.Document, c *Config) error {
			if c.PreprocessClearSnapToGrid { return ClearSnapToGrid(d) }
			return nil
		}},
		{"SDT折叠", func(d *unioffice.Document, c *Config) error {
			if c.PreprocessFlattenSDT { return FlattenSDT(d) }
			return nil
		}},
		{"软回车处理", func(d *unioffice.Document, c *Config) error {
			if c.PreprocessSoftReturn { return ReplaceSoftReturns(d) }
			return nil
		}},
		{"制表符处理", func(d *unioffice.Document, c *Config) error {
			if c.PreprocessTabMode > 0 { return ProcessTabMode(d, c.PreprocessTabMode) }
			return nil
		}},
		{"中英文空格", func(d *unioffice.Document, c *Config) error {
			if c.PreprocessSpaces { return InsertCJKEUSpacing(d) }
			return nil
		}},
		{"上下标清除", func(d *unioffice.Document, c *Config) error {
			if c.PreprocessSuperscript { return ClearSuperscript(d) }
			return nil
		}},
		{"标点标准化", func(d *unioffice.Document, c *Config) error {
			if c.PreprocessPunctuation { return NormalizePunctuation(d) }
			return nil
		}},
		{"对象环绕", func(d *unioffice.Document, c *Config) error {
			if c.PreprocessObjectWrapping { return ClearObjectWrapping(d) }
			return nil
		}},
		{"删除空行", func(d *unioffice.Document, c *Config) error {
			if c.PreprocessDeleteEmptyLines { return DeleteEmptyLines(d) }
			return nil
		}},
		{"图题间距", AdjustCaptionSpacing},
	}

	for _, step := range steps {
		if step.skip {
			continue
		}
		if err := step.fn(doc, cfg); err != nil {
			return fmt.Errorf("%s: %w", step.name, err)
		}
	}
	return nil
}
```

---

## 三、格式应用模块

### 3.1 页面设置

```go
// format_page.go
func ApplyPageSetup(doc *unioffice.Document, m *Margins) error {
	for _, section := range doc.Sections() {
		props := section.Properties()
		props.SetPageMargins(
			twipsFromCM(m.TopCM),
			twipsFromCM(m.RightCM),
			twipsFromCM(m.BottomCM),
			twipsFromCM(m.LeftCM),
		)
		if !m.KeepOriginalOrientation {
			props.SetOrientation(unioffice.OrientationPortrait)
		}
		switch m.PaperSize {
		case "A4":
			props.SetSize(unioffice.SizeA4)
		case "A3":
			props.SetSize(unioffice.SizeA3)
		case "A5":
			props.SetSize(unioffice.SizeA5)
		default:
			props.SetWidth(unioffice.Measurement(twipsFromCM(m.PaperWidthCM)))
			props.SetHeight(unioffice.Measurement(twipsFromCM(m.PaperHeightCM)))
		}
		if m.Columns > 1 {
			cols := props.AddColumnGroup()
			cols.SetColumnCount(int32(m.Columns))
			cols.SetSpacing(unioffice.Measurement(twipsFromCM(m.ColumnSpacingCM)))
		}
	}
	return nil
}

func twipsFromCM(cm float64) float64 {
	return cm / 2.54 * 1440
}
```

### 3.2 正文格式

```go
// format_body.go
func ApplyBodyFormat(doc *unioffice.Document, s *BodyStyle) error {
	cnSize := cnSizeToHalfPoints(s.SizeCN)

	for _, p := range doc.Paragraphs() {
		styleID, _ := p.StyleID()
		if isHeading(styleID) || isTableParagraph(p) {
			continue
		}

		pPr := p.Properties()

		switch s.Align {
		case "JUSTIFY":
			pPr.SetAlignment(unioffice.AlignmentJustified)
		case "LEFT":
			pPr.SetAlignment(unioffice.AlignmentLeft)
		case "CENTER":
			pPr.SetAlignment(unioffice.AlignmentCenter)
		case "RIGHT":
			pPr.SetAlignment(unioffice.AlignmentRight)
		}

		if s.FirstLineIndentChars > 0 {
			pPr.SetFirstLineIndent(unioffice.Twips(s.FirstLineIndentChars * 200))
		}
		if s.LeftIndentValue > 0 {
			pPr.SetLeftIndent(unioffice.Twips(s.LeftIndentValue * 200))
		}
		if s.RightIndentValue > 0 {
			pPr.SetRightIndent(unioffice.Twips(s.RightIndentValue * 200))
		}

		pPr.SetLineSpacing(
			twipsFromLineSpacing(s.LineSpacingMode, s.LineSpacingValue),
			lineSpacingEnum(s.LineSpacingMode))

		pPr.SetSpaceBefore(twipsFromSpacing(s.SpaceBeforeValue, s.SpaceBeforeUnit))
		pPr.SetSpaceAfter(twipsFromSpacing(s.SpaceAfterValue, s.SpaceAfterUnit))

		for _, r := range p.Runs() {
			rPr := r.Properties()
			rPr.SetFont(s.ENFont)
			rPr.SetFontEastAsian(s.CNFont)
			rPr.SetSize(unioffice.HalfPoint(cnSize))
			rPr.SetBold(s.Bold)
			if s.Italic {
				rPr.SetItalic(true)
			}
		}
	}
	return nil
}

func cnSizeToHalfPoints(cn string) float64 {
	m := map[string]float64{
		"初号": 42, "小初": 36, "一号": 26, "小一": 24,
		"二号": 22, "小二": 18, "三号": 16, "小三": 15,
		"四号": 14, "小四": 12, "五号": 10.5, "小五": 9,
		"六号": 7.5, "小六": 6.5, "七号": 5.5, "八号": 5,
	}
	if v, ok := m[cn]; ok {
		return v * 2
	}
	return 28
}

func isHeading(styleID string) bool {
	return strings.HasPrefix(styleID, "Heading") ||
		strings.HasPrefix(styleID, "heading")
}

func isTableParagraph(p *unioffice.Paragraph) bool {
	// 通过段落父节点判断是否在表格内
	// unioffice 无直接 API，可遍历 doc.Tables() 判断
	return false
}

func twipsFromLineSpacing(mode string, value float64) float64 {
	switch mode {
	case "EXACT":
		return value * 20 // 磅 → twips
	case "SINGLE":
		return 240
	case "MULTIPLE":
		return value * 240
	}
	return 240
}

func lineSpacingEnum(mode string) unioffice.LineSpacing {
	switch mode {
	case "EXACT":
		return unioffice.LineSpacingExact
	case "SINGLE":
		return unioffice.LineSpacingAuto
	case "MULTIPLE":
		return unioffice.LineSpacingAuto
	}
	return unioffice.LineSpacingAuto
}

func twipsFromSpacing(value float64, unit string) unioffice.Twips {
	switch unit {
	case "磅":
		return unioffice.Twips(value * 20)
	case "行":
		return unioffice.Twips(value * 240)
	}
	return unioffice.Twips(value * 20)
}
```

### 3.3 标题格式

```go
// format_headings.go
func ApplyHeadingFormats(doc *unioffice.Document, hs []HeadingStyle) error {
	for _, p := range doc.Paragraphs() {
		styleID, _ := p.StyleID()
		for level, h := range hs {
			if styleID == fmt.Sprintf("Heading%d", level+1) ||
				styleID == fmt.Sprintf("heading%d", level+1) {
				pPr := p.Properties()
				pPr.SetAlignment(unioffice.AlignmentLeft)
				pPr.SetLineSpacing(
					twipsFromLineSpacing(h.LineSpacingMode, h.LineSpacingValue),
					lineSpacingEnum(h.LineSpacingMode))
				pPr.SetSpaceBefore(twipsFromSpacing(h.SpaceBeforeValue, h.SpaceBeforeUnit))
				pPr.SetSpaceAfter(twipsFromSpacing(h.SpaceAfterValue, h.SpaceAfterUnit))

				if h.FirstLineIndentChars > 0 {
					pPr.SetFirstLineIndent(unioffice.Twips(h.FirstLineIndentChars * 200))
				}

				for _, r := range p.Runs() {
					rPr := r.Properties()
					rPr.SetFont(h.ENFont)
					rPr.SetFontEastAsian(h.CNFont)
					rPr.SetSize(unioffice.HalfPoint(cnSizeToHalfPoints(h.SizeCN)))
					rPr.SetBold(h.Bold)
					if h.Italic {
						rPr.SetItalic(true)
					}
				}
			}
		}
	}
	return nil
}
```

### 3.4 图题/表题格式

```go
// format_captions.go
func ApplyCaptionFormats(doc *unioffice.Document, fig, tbl *CaptionStyle) error {
	reFig := regexp.MustCompile(`^[图圖]`)
	reTbl := regexp.MustCompile(`^[表表]`)

	for _, p := range doc.Paragraphs() {
		text, _ := p.Text()
		var style *CaptionStyle
		switch {
		case reFig.MatchString(text):
			style = fig
		case reTbl.MatchString(text):
			style = tbl
		default:
			continue
		}

		pPr := p.Properties()
		pPr.SetAlignment(unioffice.AlignmentCenter)
		pPr.SetFirstLineIndent(0)
		pPr.SetLineSpacing(
			twipsFromLineSpacing(style.LineSpacingMode, style.LineSpacingValue),
			lineSpacingEnum(style.LineSpacingMode))
		pPr.SetSpaceBefore(twipsFromSpacing(style.SpaceBeforeValue, style.SpaceBeforeUnit))
		pPr.SetSpaceAfter(twipsFromSpacing(style.SpaceAfterValue, style.SpaceAfterUnit))

		for _, r := range p.Runs() {
			rPr := r.Properties()
			rPr.SetFont(style.ENFont)
			rPr.SetFontEastAsian(style.CNFont)
			rPr.SetSize(unioffice.HalfPoint(cnSizeToHalfPoints(style.SizeCN)))
			rPr.SetBold(style.Bold)
		}
	}
	return nil
}
```

### 3.5 表格格式

```go
// format_table.go
func ApplyTableFormat(doc *unioffice.Document, ts *TableStyle) error {
	for _, tbl := range doc.Tables() {
		tblProps := tbl.Properties()
		switch ts.Align {
		case "LEFT":
			tblProps.SetAlignment(unioffice.TableAlignmentLeft)
		case "CENTER":
			tblProps.SetAlignment(unioffice.TableAlignmentCenter)
		case "RIGHT":
			tblProps.SetAlignment(unioffice.TableAlignmentRight)
		}

		if ts.Autofit {
			tblProps.SetAutofit(true)
		}

		for _, row := range tbl.Rows() {
			if ts.MinRowHeightPT > 0 {
				row.SetHeight(unioffice.Measurement(ts.MinRowHeightPT * 12700))
			}
			for _, cell := range row.Cells() {
				if ts.EnableCellFormatting {
					cellProps := cell.Properties()
					switch ts.CellAlign {
					case "CENTER":
						cellProps.SetVerticalAlignment(
							unioffice.TableCellVerticalAlignmentCenter)
					case "TOP":
						cellProps.SetVerticalAlignment(
							unioffice.TableCellVerticalAlignmentTop)
					case "BOTTOM":
						cellProps.SetVerticalAlignment(
							unioffice.TableCellVerticalAlignmentBottom)
					}
				}
				for _, p := range cell.Paragraphs() {
					pPr := p.Properties()
					pPr.SetLineSpacing(
						twipsFromLineSpacing(ts.LineSpacingMode, ts.LineSpacingValue),
						lineSpacingEnum(ts.LineSpacingMode))

					for _, r := range p.Runs() {
						rPr := r.Properties()
						rPr.SetFont(ts.ENFont)
						rPr.SetFontEastAsian(ts.CNFont)
						rPr.SetSize(unioffice.HalfPoint(cnSizeToHalfPoints(ts.SizeCN)))
					}
				}
			}
		}
	}
	return nil
}
```

### 3.6 目录格式

```go
// format_toc.go
func ApplyTOCFormat(doc *unioffice.Document, toc *TOCConfig) error {
	for _, p := range doc.Paragraphs() {
		styleID, _ := p.StyleID()

		if styleID == "TOCHeading" || styleID == "tocHeading" {
			for _, r := range p.Runs() {
				rPr := r.Properties()
				rPr.SetFont(toc.TitleENFont)
				rPr.SetFontEastAsian(toc.TitleCNFont)
				rPr.SetSize(unioffice.HalfPoint(cnSizeToHalfPoints(toc.TitleSizeCN)))
			}
			continue
		}

		for i, ls := range toc.LevelStyles {
			if styleID == fmt.Sprintf("toc%d", i+1) ||
				styleID == fmt.Sprintf("TOC%d", i+1) {
				for _, r := range p.Runs() {
					rPr := r.Properties()
					rPr.SetFont(ls.ENFont)
					rPr.SetFontEastAsian(ls.CNFont)
					rPr.SetSize(unioffice.HalfPoint(cnSizeToHalfPoints(ls.SizeCN)))
					rPr.SetBold(ls.Bold)
					rPr.SetColor(unioffice.RGB(
						byte(ls.ColorRGB[0]),
						byte(ls.ColorRGB[1]),
						byte(ls.ColorRGB[2])))
				}
				if ls.LeftIndentChars > 0 {
					p.Properties().SetLeftIndent(
						unioffice.Twips(ls.LeftIndentChars * 200))
				}
			}
		}
	}
	return nil
}
```

### 3.7 页眉页脚

```go
// format_headerfooter.go
func ApplyHeaderFooter(doc *unioffice.Document, hf *HeaderFooter) error {
	for _, section := range doc.Sections() {
		// 页眉
		if hf.EnableHeader {
			hdr := section.Header(unioffice.HeaderDefault)
			if hdr == nil {
				hdr = section.AddHeader(unioffice.HeaderDefault)
			}
			clearParagraphs(hdr)
			hp := hdr.AddParagraph()
			switch hf.HeaderAlign {
			case "居中":
				hp.Properties().SetAlignment(unioffice.AlignmentCenter)
			case "居左":
				hp.Properties().SetAlignment(unioffice.AlignmentLeft)
			case "居右":
				hp.Properties().SetAlignment(unioffice.AlignmentRight)
			}
			run := hp.AddRun()
			run.Properties().SetFont(hf.HeaderENFont)
			run.Properties().SetFontEastAsian(hf.HeaderCNFont)
			run.Properties().SetSize(unioffice.HalfPoint(cnSizeToHalfPoints(hf.HeaderSizeCN)))
			run.Properties().SetBold(hf.HeaderBold)
			run.AddText(hf.HeaderText)
		}

		// 页脚
		if hf.EnableFooter {
			ftr := section.Footer(unioffice.FooterDefault)
			if ftr == nil {
				ftr = section.AddFooter(unioffice.FooterDefault)
			}
			if hf.ClearFooter {
				clearParagraphs(ftr)
			}
			fp := ftr.AddParagraph()
			switch hf.FooterAlign {
			case "居中":
				fp.Properties().SetAlignment(unioffice.AlignmentCenter)
			case "居左":
				fp.Properties().SetAlignment(unioffice.AlignmentLeft)
			case "居右":
				fp.Properties().SetAlignment(unioffice.AlignmentRight)
			}
			run := fp.AddRun()
			run.Properties().SetFont(hf.FooterENFont)
			run.Properties().SetFontEastAsian(hf.FooterCNFont)
			run.Properties().SetSize(unioffice.HalfPoint(cnSizeToHalfPoints(hf.FooterSizeCN)))

			// 页码域代码 — 跨平台关键
			run.AddField(unioffice.FieldCurrentPage)
			run.AddText(" / ")
			run.AddField(unioffice.FieldTotalPages)
		}
	}
	return nil
}

func clearParagraphs(container interface{ RemoveParagraph(*unioffice.Paragraph) }) {
	// 清空已有段落
}
```

---

## 四、编号模式匹配与改写

```go
// numbering.go
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
	doc        *unioffice.Document
	nextNumID  int32
	nextAbsNum int32
}

func NewNumberingManager(doc *unioffice.Document) *NumberingManager {
	return &NumberingManager{
		doc:        doc,
		nextNumID:  1,
		nextAbsNum: 1,
	}
}

func (nm *NumberingManager) EnsureAbstractNum(rule *PatternRule) (int32, error) {
	num := nm.doc.Numbering()
	absNum := num.AddAbstractNum()

	for level := 0; level < 9; level++ {
		lvl := absNum.AddLevel(level)
		lvl.SetStart(1)
		switch rule.Scheme {
		case "ZH_NUM":
			lvl.SetFormat(unioffice.NumberFormatChineseCounting)
		case "ARABIC":
			lvl.SetFormat(unioffice.NumberFormatDecimal)
		}
		lvl.SetAlignment(unioffice.AlignmentLeft)
		lvl.SetText(fmt.Sprintf("%%%d.", level+1))
	}

	absNumID := nm.nextAbsNum
	absNum.X().AbstractNumId = absNumID
	nm.nextAbsNum++

	// 创建具体 num 引用
	n := num.AddNumberingDefinition(absNum)
	n.X().NumID = nm.nextNumID
	nm.nextNumID++
	return n.X().NumID, nil
}

func ApplyNumbering(doc *unioffice.Document, cfg *PatternConfig) error {
	// 过滤启用的规则
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
		text, _ := p.Text()
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

			// 命中编号规则
			// 1. 从文本中去除编号前缀
			stripped := strings.TrimSpace(matches[2])
			clearRunText(p)
			p.ClearContent()
			run := p.AddRun()
			run.AddText(stripped)

			// 2. 分配 numbering
			numID, err := nm.EnsureAbstractNum(&rule)
			if err != nil {
				continue
			}

			// 3. 设置 pPr 中的 numPr
			pPr := p.Properties().X()
			if pPr.NumberingProperties == nil {
				pPr.NumberingProperties = &unioffice.CT_NumPr{}
			}
			pPr.NumberingProperties.NumId = &unioffice.CT_DecimalNumber{Val: int64(numID)}
			// 根据 multi_depth 推断层级
			level := countDepthLevel(rule.MultiDepth)
			pPr.NumberingProperties.Ilvl = &unioffice.CT_DecimalNumber{Val: int64(level)}

			break // 一条规则匹配即可
		}
	}
	return nil
}

func clearRunText(p *unioffice.Paragraph) {
	for _, r := range p.Runs() {
		r.ClearContent()
	}
}

func countDepthLevel(depth string) int {
	if depth == "" {
		return 0
	}
	return strings.Count(depth, ".") // "1.1" → 1, "1.1.1" → 2
}
```

---

## 五、TOC 域代码注入

```go
// fieldcodes.go — 替代 Win32 COM，跨平台核心
func InjectTOC(doc *unioffice.Document, tocCfg *TOCConfig) error {
	if !tocCfg.Enable {
		return nil
	}

	// 策略一：查找已存在的 TOC 段落，替换域代码
	for _, p := range doc.Paragraphs() {
		text := strings.TrimSpace(p.Text())
		if text == tocCfg.TitleText {
			// 在标题后插入 TOC 域代码段落
			return injectTOCFieldCode(doc, p, tocCfg)
		}
	}

	// 策略二：未找到标题，在文档末尾追加
	return injectTOCAtEnd(doc, tocCfg)
}

// OOXML TOC 字段代码结构:
// <w:p>
//   <w:r><w:fldChar w:fldCharType="begin"/></w:r>
//   <w:r><w:instrText>TOC \o "1-4" \h \z \u</w:instrText></w:r>
//   <w:r><w:fldChar w:fldCharType="separate"/></w:r>
//   <w:r><w:t>（打开后自动刷新）</w:t></w:r>
//   <w:r><w:fldChar w:fldCharType="end"/></w:r>
// </w:p>
func injectTOCFieldCode(doc *unioffice.Document, afterP *unioffice.Paragraph, tocCfg *TOCConfig) error {
	// 构造指令: TOC \o "1-4" \h \z \u
	levels := len(tocCfg.LevelStyles)
	instr := fmt.Sprintf(` TOC \o "1-%d" \h \z \u `, levels)

	p := doc.AddParagraph()
	// 设置 TOCHeading 样式
	p.Properties().SetStyleID("TOCHeading")

	// begin
	r1 := p.AddRun()
	r1.X().FldChar = &unioffice.CT_FldChar{FldCharType: "begin"}

	// instrText
	r2 := p.AddRun()
	r2.X().InstrText = &unioffice.CT_InstrText{Space: unioffice.String("preserve")}
	r2.X().InstrText.Text = instr

	// separate
	r3 := p.AddRun()
	r3.X().FldChar = &unioffice.CT_FldChar{FldCharType: "separate"}

	// 占位文本（用户打开 Word/WPS 后自动刷新）
	r4 := p.AddRun()
	r4.AddText("（打开文档后按 F9 刷新目录）")

	// end
	r5 := p.AddRun()
	r5.X().FldChar = &unioffice.CT_FldChar{FldCharType: "end"}

	return nil
}

func injectTOCAtEnd(doc *unioffice.Document, tocCfg *TOCConfig) error {
	// 先写入"目录"标题
	titleP := doc.AddParagraph()
	titleP.Properties().SetStyleID("TOCHeading")
	titleRun := titleP.AddRun()
	titleRun.Properties().SetFont(tocCfg.TitleENFont)
	titleRun.Properties().SetFontEastAsian(tocCfg.TitleCNFont)
	titleRun.Properties().SetSize(unioffice.HalfPoint(cnSizeToHalfPoints(tocCfg.TitleSizeCN)))
	titleRun.AddText(tocCfg.TitleText)

	// 注入域代码段落
	return injectTOCFieldCode(doc, titleP, tocCfg)
}
```

---

## 六、完整入口

```go
// main.go
package main

import (
	"encoding/json"
	"fmt"
	"os"

	"wordformat" // 上述所有模块
	"github.com/unidoc/unioffice/document"
)

func main() {
	if len(os.Args) < 3 {
		fmt.Fprintf(os.Stderr, "用法: %s <config.json> <input.docx> [output.docx]\n", os.Args[0])
		os.Exit(1)
	}

	configPath := os.Args[1]
	inputPath := os.Args[2]
	outputPath := inputPath
	if len(os.Args) >= 4 {
		outputPath = os.Args[3]
	}

	// 1. 加载配置
	cfgBytes, err := os.ReadFile(configPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "读取配置失败: %v\n", err)
		os.Exit(1)
	}
	var cfg wordformat.Config
	if err := json.Unmarshal(cfgBytes, &cfg); err != nil {
		fmt.Fprintf(os.Stderr, "解析配置失败: %v\n", err)
		os.Exit(1)
	}

	// 2. 加载文档
	doc, err := document.Open(inputPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "打开文档失败: %v\n", err)
		os.Exit(1)
	}
	defer doc.Close()

	// 3. 执行流水线
	pipeline := []struct {
		name string
		fn   func(*document.Document, *wordformat.Config) error
	}{
		{"预处理", wordformat.Preprocess},
		{"页面设置", func(d *document.Document, c *wordformat.Config) error {
			if c.ApplyPage { return wordformat.ApplyPageSetup(d, &c.Margins) }
			return nil
		}},
		{"正文格式", func(d *document.Document, c *wordformat.Config) error {
			if c.ApplyBody { return wordformat.ApplyBodyFormat(d, &c.Body) }
			return nil
		}},
		{"标题格式", func(d *document.Document, c *wordformat.Config) error {
			if c.ApplyHeadings { return wordformat.ApplyHeadingFormats(d, c.Headings) }
			return nil
		}},
		{"图题表题格式", func(d *document.Document, c *wordformat.Config) error {
			if c.ApplyFigTbl { return wordformat.ApplyCaptionFormats(d, &c.FigCaption, &c.TblCaption) }
			return nil
		}},
		{"表格格式", func(d *document.Document, c *wordformat.Config) error {
			if c.ApplyFigTbl { return wordformat.ApplyTableFormat(d, &c.Table) }
			return nil
		}},
		{"目录格式", func(d *document.Document, c *wordformat.Config) error {
			if c.ApplyTOC { return wordformat.ApplyTOCFormat(d, &c.TOC) }
			return nil
		}},
		{"页眉页脚", func(d *document.Document, c *wordformat.Config) error {
			if c.ApplyHeaderFooter { return wordformat.ApplyHeaderFooter(d, &c.HeaderFooter) }
			return nil
		}},
		{"编号模式", func(d *document.Document, c *wordformat.Config) error {
			return wordformat.ApplyNumbering(d, &c.Patterns)
		}},
		{"TOC域代码", func(d *document.Document, c *wordformat.Config) error {
			if c.ApplyTOC { return wordformat.InjectTOC(d, &c.TOC) }
			return nil
		}},
	}

	for _, step := range pipeline {
		fmt.Printf("[%s] 执行中...\n", step.name)
		if err := step.fn(doc, &cfg); err != nil {
			fmt.Fprintf(os.Stderr, "[%s] 失败: %v\n", step.name, err)
			os.Exit(1)
		}
	}

	// 4. 保存
	if err := doc.SaveToFile(outputPath); err != nil {
		fmt.Fprintf(os.Stderr, "保存文档失败: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("✓ 格式化完成: %s\n", outputPath)
}
```

---

## 七、后端工作量汇总

| 模块 | 代码量 | 难度 | unioffice 依赖度 |
|------|--------|------|-----------------|
| 配置模型 | ~200 行 | ★☆☆ | 无（纯数据结构） |
| 预处理 11 项 | ~700 行 | ★★★ | 中 (SDT/RawXML) |
| 页面设置 | ~50 行 | ★☆☆ | 高 (API 完备) |
| 正文格式 | ~80 行 | ★☆☆ | 高 (API 完备) |
| 标题格式 | ~60 行 | ★☆☆ | 高 (API 完备) |
| 图题/表题 | ~60 行 | ★☆☆ | 高 (API 完备) |
| 表格格式 | ~80 行 | ★☆☆ | 高 (API 完备) |
| 目录格式 | ~60 行 | ★☆☆ | 高 (API 完备) |
| 页眉页脚 + 页码域 | ~100 行 | ★☆☆ | 高 (API 完备) |
| TOC 域代码注入 | ~100 行 | ★★★ | 中 (底层字段构造) |
| 编号模式匹配 | ~200 行 | ★★★ | 中 (numbering.xml) |
| 流水线编排 | ~60 行 | ★☆☆ | 无 |
| **合计** | **~1750 行** | | |

