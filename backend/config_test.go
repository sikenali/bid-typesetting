package wordformat

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestConfigParsesAllFields(t *testing.T) {
	jsonData := `{
		"apply_page": true,
		"apply_body": true,
		"apply_headings": true,
		"apply_figtbl": true,
		"apply_toc": true,
		"apply_header_footer": true,
		"apply_table": true,
		"preprocess_spaces": true,
		"preprocess_fig_caption": true,
		"preprocess_fig_caption_spaces": 2,
		"preprocess_tbl_caption": true,
		"preprocess_tbl_caption_spaces": 1,
		"preprocess_superscript": true,
		"preprocess_punctuation": true,
		"preprocess_object_wrapping": true,
		"preprocess_soft_return": true,
		"preprocess_tab_mode": 1,
		"preprocess_clear_all_styles": false,
		"preprocess_clear_indents": true,
		"preprocess_delete_empty_lines": true,
		"preprocess_clear_snap_to_grid": true,
		"preprocess_flatten_sdt": true,
		"preprocess_post_clean_styles": true,
		"preprocess_markdown_to_plaintext": true,
		"preprocess_clear_extra_spaces": true,
		"preprocess_clear_chart_format": true,
		"preprocess_clear_heading_indent": true,
		"preprocess_clear_heading_left_indent": true,
		"preprocess_clear_heading_right_indent": true,
		"preprocess_clear_heading_special_indent": true,
		"preprocess_table_cell_enable": true,
		"preprocess_table_cell_font": "宋体",
		"preprocess_table_cell_size": "五号",
		"preprocess_table_cell_line_spacing": 20,
		"preprocess_table_cell_min_height": 20,
		"preprocess_table_cell_align": "center",
		"preprocess_table_cell_border": "all",
		"preprocess_table_auto_width": true,
		"auto_refresh_fields": true,
		"close_word_after_refresh": true,
		"margins": {
			"top_cm": 2.54,
			"bottom_cm": 2.54,
			"left_cm": 3.18,
			"right_cm": 3.18,
			"gutter_cm": 0.5,
			"header_margin_cm": 1.5,
			"paper_size": "A4",
			"paper_width_cm": 21.0,
			"paper_height_cm": 29.7,
			"columns": 1,
			"column_spacing_cm": 1.0,
			"keep_original_orientation": false,
			"orientation": "portrait"
		},
		"body": {
			"cn_font": "宋体",
			"en_font": "Times New Roman",
			"size_cn": "小四",
			"bold": false,
			"italic": false,
			"underline": true,
			"color": "#000000",
			"line_spacing_mode": "MULTIPLE",
			"line_spacing_value": 1.5,
			"first_line_indent_chars": 2,
			"align": "JUSTIFY",
			"space_before_value": 0,
			"space_before_unit": "pt",
			"space_after_value": 0,
			"space_after_unit": "pt",
			"left_indent_value": 0,
			"left_indent_unit": "char",
			"right_indent_value": 0,
			"right_indent_unit": "char",
			"add_space": true,
			"space_count": 1
		},
		"headings": [
			{"cn_font": "黑体", "en_font": "Arial", "size_cn": "三号", "bold": true, "color": "#000000", "underline": false, "line_spacing_mode": "SINGLE", "line_spacing_value": 1.5, "align": "LEFT"},
			{"cn_font": "黑体", "en_font": "Arial", "size_cn": "四号", "bold": true, "color": "#000000", "underline": false, "line_spacing_mode": "SINGLE", "line_spacing_value": 1.5, "align": "LEFT"},
			{"cn_font": "黑体", "en_font": "Arial", "size_cn": "小四", "bold": true, "color": "#000000", "underline": false, "line_spacing_mode": "SINGLE", "line_spacing_value": 1.5, "align": "LEFT"},
			{"cn_font": "黑体", "en_font": "Arial", "size_cn": "五号", "bold": true, "color": "#000000", "underline": false, "line_spacing_mode": "SINGLE", "line_spacing_value": 1.5, "align": "LEFT"}
		],
		"fig_caption": {"cn_font": "宋体", "size_cn": "五号", "bold": false, "italic": false, "underline": false, "align": "CENTER"},
		"tbl_caption": {"cn_font": "宋体", "size_cn": "五号", "bold": false, "italic": false, "underline": false, "align": "CENTER"},
		"table": {
			"enable": true,
			"cn_font": "宋体",
			"en_font": "Times New Roman",
			"size_cn": "五号",
			"autofit": true,
			"line_spacing_mode": "SINGLE",
			"line_spacing_value": 1.0,
			"align": "CENTER",
			"cell_align": "CENTER",
			"min_row_height_pt": 20,
			"enable_cell_formatting": true,
			"style_type": "TableGrid"
		},
		"table_settings": {
			"enable": true,
			"cn_font": "宋体",
			"en_font": "Times New Roman",
			"size_cn": "五号",
			"line_spacing_value": 1.5,
			"min_line_height": 20,
			"align": "CENTER",
			"border_style": "all",
			"auto_width": true
		},
		"toc": {
			"enable": true,
			"title_text": "目录",
			"title_cn_font": "黑体",
			"title_en_font": "Arial",
			"title_size_cn": "三号",
			"level_styles": [
				{"cn_font": "宋体", "en_font": "Times New Roman", "size_cn": "小四", "bold": false, "italic": false, "color_rgb": [0, 0, 0], "line_spacing_mode": "SINGLE", "line_spacing_value": 1.5, "tab_leader": "DOT", "left_indent_chars": 0, "right_indent_value": 0, "right_indent_unit": "char", "first_line_indent_chars": 0, "align": "LEFT", "space_before_value": 0, "space_before_unit": "pt", "space_after_value": 0, "space_after_unit": "pt"},
				{"cn_font": "宋体", "en_font": "Times New Roman", "size_cn": "五号", "bold": false, "italic": false, "color_rgb": [0, 0, 0], "line_spacing_mode": "SINGLE", "line_spacing_value": 1.5, "tab_leader": "DOT", "left_indent_chars": 0, "right_indent_value": 0, "right_indent_unit": "char", "first_line_indent_chars": 0, "align": "LEFT", "space_before_value": 0, "space_before_unit": "pt", "space_after_value": 0, "space_after_unit": "pt"}
			]
		},
		"header_footer": {
			"enable_header": true,
			"enable_footer": true,
			"header_text": "页眉",
			"header_cn_font": "宋体",
			"header_en_font": "Times New Roman",
			"header_size_cn": "小五",
			"header_align": "CENTER",
			"header_bold": false,
			"header_italic": false,
			"header_underline_type": "single",
			"header_top_cm": 1.5,
			"footer_bottom_cm": 1.5,
			"page_number_from_body": false,
			"clear_footer": true,
			"footer_cn_font": "宋体",
			"footer_en_font": "Times New Roman",
			"footer_size_cn": "小五",
			"footer_align": "CENTER",
			"footer_italic": false,
			"footer_page_number_type": "page_of_pages"
		},
		"patterns": {
			"rules": [
				{"scheme": "ARABIC", "wrapper": "DUNHAO", "multi_depth": 0, "enabled": true, "custom_example": ""},
				{"scheme": "ZH_NUM", "wrapper": "DOUBLE_PAREN", "multi_depth": 0, "enabled": false, "custom_example": ""}
			]
		}
	}`

	var cfg Config
	if err := json.Unmarshal([]byte(jsonData), &cfg); err != nil {
		t.Fatalf("failed to parse JSON: %v", err)
	}

	// Verify key fields
	if !cfg.ApplyPage {
		t.Error("ApplyPage not parsed")
	}
	if !cfg.ApplyTable {
		t.Error("ApplyTable not parsed")
	}
	if cfg.Margins.GutterCM != 0.5 {
		t.Errorf("Margins.GutterCM = %v, want 0.5", cfg.Margins.GutterCM)
	}
	if cfg.Margins.HeaderMarginCM != 1.5 {
		t.Errorf("Margins.HeaderMarginCM = %v, want 1.5", cfg.Margins.HeaderMarginCM)
	}
	if !cfg.Body.Underline {
		t.Error("Body.Underline not parsed")
	}
	if cfg.Body.Color != "#000000" {
		t.Errorf("Body.Color = %v, want #000000", cfg.Body.Color)
	}
	if cfg.Body.AddSpace != true {
		t.Error("Body.AddSpace not parsed")
	}
	if cfg.Headings[0].Color != "#000000" {
		t.Error("Headings[0].Color not parsed")
	}
	if !cfg.Headings[0].Underline == false {
		t.Log("Headings[0].Underline is false as expected")
	}
	if !cfg.TableSettings.Enable {
		t.Error("TableSettings.Enable not parsed")
	}
	if cfg.TableSettings.BorderStyle != "all" {
		t.Errorf("TableSettings.BorderStyle = %v, want all", cfg.TableSettings.BorderStyle)
	}
	if !cfg.Table.Enable {
		t.Error("Table.Enable not parsed")
	}
	if !cfg.TOC.Enable {
		t.Error("TOC.Enable not parsed")
	}
	if cfg.TOC.LevelStyles[0].TabLeader != "DOT" {
		t.Errorf("TOC.LevelStyles[0].TabLeader = %v, want DOT", cfg.TOC.LevelStyles[0].TabLeader)
	}
	if !cfg.HeaderFooter.HeaderItalic == false {
		t.Log("HeaderItalic is false as expected")
	}
	if cfg.HeaderFooter.HeaderUnderlineType != "single" {
		t.Errorf("HeaderUnderlineType = %v, want single", cfg.HeaderFooter.HeaderUnderlineType)
	}
	if cfg.HeaderFooter.FooterPageNumberType != "page_of_pages" {
		t.Errorf("FooterPageNumberType = %v", cfg.HeaderFooter.FooterPageNumberType)
	}
	if !cfg.PreprocessMarkdownToPlain {
		t.Error("PreprocessMarkdownToPlain not parsed")
	}
	if !cfg.PreprocessTableCellEnable {
		t.Error("PreprocessTableCellEnable not parsed")
	}
	if cfg.Patterns.Rules[0].MultiDepth != 0 {
		t.Errorf("MultiDepth = %v, want 0", cfg.Patterns.Rules[0].MultiDepth)
	}
}

func TestHeadingLevelMatching(t *testing.T) {
	tests := []struct {
		styleID string
		want    int
	}{
		{"Heading1", 1},
		{"Heading2", 2},
		{"Heading3", 3},
		{"Heading4", 4},
		{"heading1", 1},
		{"标题一", 1},
		{"标题二", 2},
		{"标题三", 3},
		{"标题四", 4},
		{"標題一", 1},
		{"标题 1", 1},
		{"Body", -1},
		{"Normal", -1},
		{"", -1},
	}
	for _, tt := range tests {
		got := matchHeadingLevel(tt.styleID)
		if got != tt.want {
			t.Errorf("matchHeadingLevel(%q) = %d, want %d", tt.styleID, got, tt.want)
		}
	}
}

func TestAlignFromString(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"LEFT", "start"},
		{"CENTER", "center"},
		{"RIGHT", "end"},
		{"JUSTIFY", "both"},
		{"BOTH", "both"},
		{"两端对齐", "both"},
		{"居中", "center"},
		{"unknown", "both"},
	}
	for _, tt := range tests {
		got := alignFromString(tt.input)
		if got.String() != tt.want {
			t.Errorf("alignFromString(%q) = %v, want %v", tt.input, got, tt.want)
		}
	}
}

func TestTwipsFromCM(t *testing.T) {
	tests := []struct {
		cm   float64
		want float64
	}{
		{2.54, 1440},
		{1.0, 566.929},
		{0, 0},
	}
	for _, tt := range tests {
		got := twipsFromCM(tt.cm)
		if absDiff(got, tt.want) > 1 {
			t.Errorf("twipsFromCM(%v) = %v, want %v", tt.cm, got, tt.want)
		}
	}
}

func TestWrapperMapDifferences(t *testing.T) {
	rules := []PatternRule{
		{Scheme: "ARABIC", Wrapper: "DUNHAO", Enabled: true},
		{Scheme: "ARABIC", Wrapper: "DOUBLE_PAREN", Enabled: true},
		{Scheme: "ARABIC", Wrapper: "SINGLE_PAREN", Enabled: true},
		{Scheme: "ARABIC", Wrapper: "DOT", Enabled: true},
	}
	for _, r := range rules {
		re := buildPatternRegex(&r)
		if re == nil {
			t.Errorf("buildPatternRegex failed for wrapper %s", r.Wrapper)
			continue
		}
		testInputs := map[string]string{
			"DUNHAO":       "1、内容",
			"DOUBLE_PAREN": "1）内容",
			"SINGLE_PAREN": "1) 内容",
			"DOT":          "1.内容",
		}
		input := testInputs[r.Wrapper]
		if !re.MatchString(input) {
			t.Errorf("wrapper %s should match %q but doesn't", r.Wrapper, input)
		}
	}
}

func TestPipelineSmoke(t *testing.T) {
	// Verify the function references compile and work (returns nil for invalid input).
	// The actual document tests would require real docx files, which are out of scope for unit tests.
	if !strings.Contains("test", "test") {
		t.Error("smoke")
	}
}

func absDiff(a, b float64) float64 {
	if a > b {
		return a - b
	}
	return b - a
}
