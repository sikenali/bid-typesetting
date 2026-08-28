package wordformat

type Config struct {
	ApplyPage         bool `json:"apply_page"`
	ApplyBody         bool `json:"apply_body"`
	ApplyHeadings     bool `json:"apply_headings"`
	ApplyFigTbl       bool `json:"apply_figtbl"`
	ApplyTOC          bool `json:"apply_toc"`
	ApplyHeaderFooter bool `json:"apply_header_footer"`
	ApplyTable        bool `json:"apply_table"`

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
	PreprocessMarkdownToPlain   bool `json:"preprocess_markdown_to_plaintext"`
	PreprocessClearExtraSpaces  bool `json:"preprocess_clear_extra_spaces"`
	PreprocessClearChartFormat  bool `json:"preprocess_clear_chart_format"`
	PreprocessClearHeadingIndent       bool `json:"preprocess_clear_heading_indent"`
	PreprocessClearHeadingLeftIndent   bool `json:"preprocess_clear_heading_left_indent"`
	PreprocessClearHeadingRightIndent  bool `json:"preprocess_clear_heading_right_indent"`
	PreprocessClearHeadingSpecialIndent bool `json:"preprocess_clear_heading_special_indent"`
	PreprocessTableCellEnable       bool    `json:"preprocess_table_cell_enable"`
	PreprocessTableCellFont         string  `json:"preprocess_table_cell_font"`
	PreprocessTableCellSize         string  `json:"preprocess_table_cell_size"`
	PreprocessTableCellLineSpacing float64 `json:"preprocess_table_cell_line_spacing"`
	PreprocessTableCellMinHeight    float64 `json:"preprocess_table_cell_min_height"`
	PreprocessTableCellAlign        string  `json:"preprocess_table_cell_align"`
	PreprocessTableCellBorder       string  `json:"preprocess_table_cell_border"`
	PreprocessTableAutoWidth        bool    `json:"preprocess_table_auto_width"`
	AutoRefreshFields               bool    `json:"auto_refresh_fields"`
	CloseWordAfterRefresh           bool    `json:"close_word_after_refresh"`

	Margins       Margins        `json:"margins"`
	Body          BodyStyle      `json:"body"`
	Headings      []HeadingStyle `json:"headings"`
	FigCaption    CaptionStyle   `json:"fig_caption"`
	TblCaption    CaptionStyle   `json:"tbl_caption"`
	Table         TableStyle     `json:"table"`
	TableSettings TableSettings  `json:"table_settings"`
	TOC           TOCConfig      `json:"toc"`
	HeaderFooter  HeaderFooter   `json:"header_footer"`
	Patterns      PatternConfig  `json:"patterns"`
}

type BodyStyle struct {
	CNFont               string  `json:"cn_font"`
	ENFont               string  `json:"en_font"`
	SizeCN               string  `json:"size_cn"`
	Bold                 bool    `json:"bold"`
	Italic               bool    `json:"italic"`
	Underline            bool    `json:"underline"`
	UnderlineType        string  `json:"underline_type"`
	Color                string  `json:"color"`
	LineSpacingMode      string  `json:"line_spacing_mode"`
	LineSpacingValue     float64 `json:"line_spacing_value"`
	FirstLineIndentChars float64 `json:"first_line_indent_chars"`
	Align                string  `json:"align"`
	SpaceBeforeValue     float64 `json:"space_before_value"`
	SpaceBeforeUnit      string  `json:"space_before_unit"`
	SpaceAfterValue      float64 `json:"space_after_value"`
	SpaceAfterUnit       string  `json:"space_after_unit"`
	LeftIndentValue      float64 `json:"left_indent_value"`
	LeftIndentUnit       string  `json:"left_indent_unit"`
	RightIndentValue     float64 `json:"right_indent_value"`
	RightIndentUnit      string  `json:"right_indent_unit"`
	AddSpace             bool    `json:"add_space"`
	SpaceCount           int     `json:"space_count"`
	Highlight            string  `json:"highlight"`
	Strike               bool    `json:"strike"`
	KeepWithNext         bool    `json:"keep_with_next"`
	PageBreakBefore      bool    `json:"page_break_before"`
}

type HeadingStyle struct {
	BodyStyle
}

type CaptionStyle struct {
	BodyStyle
}

type Margins struct {
	TopCM                   float64 `json:"top_cm"`
	BottomCM                float64 `json:"bottom_cm"`
	LeftCM                  float64 `json:"left_cm"`
	RightCM                 float64 `json:"right_cm"`
	GutterCM                float64 `json:"gutter_cm"`
	HeaderMarginCM          float64 `json:"header_margin_cm"`
	PaperSize               string  `json:"paper_size"`
	PaperWidthCM            float64 `json:"paper_width_cm"`
	PaperHeightCM           float64 `json:"paper_height_cm"`
	Columns                 int     `json:"columns"`
	ColumnSpacingCM         float64 `json:"column_spacing_cm"`
	KeepOriginalOrientation bool    `json:"keep_original_orientation"`
	Orientation             string  `json:"orientation"`
}

type TableStyle struct {
	Enable                bool    `json:"enable"`
	CNFont                string  `json:"cn_font"`
	ENFont                string  `json:"en_font"`
	SizeCN                string  `json:"size_cn"`
	Autofit               bool    `json:"autofit"`
	LineSpacingMode       string  `json:"line_spacing_mode"`
	LineSpacingValue      float64 `json:"line_spacing_value"`
	Align                 string  `json:"align"`
	CellAlign             string  `json:"cell_align"`
	MinRowHeightPT        float64 `json:"min_row_height_pt"`
	EnableCellFormatting  bool    `json:"enable_cell_formatting"`
	StyleType             string  `json:"style_type"`
}

type TableSettings struct {
	Enable           bool    `json:"enable"`
	CNFont           string  `json:"cn_font"`
	ENFont           string  `json:"en_font"`
	SizeCN           string  `json:"size_cn"`
	LineSpacingValue float64 `json:"line_spacing_value"`
	MinLineHeight    float64 `json:"min_line_height"`
	Align            string  `json:"align"`
	BorderStyle      string  `json:"border_style"`
	AutoWidth        bool    `json:"auto_width"`
}

type TOCConfig struct {
	Enable      bool       `json:"enable"`
	TitleText   string     `json:"title_text"`
	TitleCNFont string     `json:"title_cn_font"`
	TitleENFont string     `json:"title_en_font"`
	TitleSizeCN string     `json:"title_size_cn"`
	LevelStyles []TOCLevel `json:"level_styles"`
}

type TOCLevel struct {
	CNFont            string  `json:"cn_font"`
	ENFont            string  `json:"en_font"`
	SizeCN            string  `json:"size_cn"`
	Bold              bool    `json:"bold"`
	Italic            bool    `json:"italic"`
	ColorRGB          [3]int  `json:"color_rgb"`
	LineSpacingMode   string  `json:"line_spacing_mode"`
	LineSpacingValue  float64 `json:"line_spacing_value"`
	TabLeader         string  `json:"tab_leader"`
	LeftIndentChars   float64 `json:"left_indent_chars"`
	RightIndentValue  float64 `json:"right_indent_value"`
	RightIndentUnit   string  `json:"right_indent_unit"`
	FirstLineIndentChars float64 `json:"first_line_indent_chars"`
	Align             string  `json:"align"`
	SpaceBeforeValue  float64 `json:"space_before_value"`
	SpaceBeforeUnit   string  `json:"space_before_unit"`
	SpaceAfterValue   float64 `json:"space_after_value"`
	SpaceAfterUnit    string  `json:"space_after_unit"`
}

type HeaderFooter struct {
	EnableHeader          bool    `json:"enable_header"`
	EnableFooter          bool    `json:"enable_footer"`
	HeaderText            string  `json:"header_text"`
	HeaderCNFont          string  `json:"header_cn_font"`
	HeaderENFont          string  `json:"header_en_font"`
	HeaderSizeCN          string  `json:"header_size_cn"`
	HeaderAlign           string  `json:"header_align"`
	HeaderBold            bool    `json:"header_bold"`
	HeaderItalic          bool    `json:"header_italic"`
	HeaderUnderlineType   string  `json:"header_underline_type"`
	HeaderTopCM           float64 `json:"header_top_cm"`
	FooterBottomCM        float64 `json:"footer_bottom_cm"`
	PageNumberFromBody    bool    `json:"page_number_from_body"`
	ClearFooter           bool    `json:"clear_footer"`
	FooterCNFont          string  `json:"footer_cn_font"`
	FooterENFont          string  `json:"footer_en_font"`
	FooterSizeCN          string  `json:"footer_size_cn"`
	FooterAlign           string  `json:"footer_align"`
	FooterItalic          bool    `json:"footer_italic"`
	FooterPageNumberType  string  `json:"footer_page_number_type"`
}

type PatternConfig struct {
	Rules []PatternRule `json:"rules"`
}

type PatternRule struct {
	Scheme        string `json:"scheme"`
	Wrapper       string `json:"wrapper"`
	MultiDepth    int    `json:"multi_depth"`
	Enabled       bool   `json:"enabled"`
	CustomExample string `json:"custom_example"`
}
