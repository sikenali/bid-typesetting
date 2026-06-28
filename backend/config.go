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
	SizeCN               string  `json:"size_cn"`
	Bold                 bool    `json:"bold"`
	Italic               bool    `json:"italic"`
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
	PaperSize               string  `json:"paper_size"`
	PaperWidthCM            float64 `json:"paper_width_cm"`
	PaperHeightCM           float64 `json:"paper_height_cm"`
	Columns                 int     `json:"columns"`
	ColumnSpacingCM         float64 `json:"column_spacing_cm"`
	KeepOriginalOrientation bool    `json:"keep_original_orientation"`
}

type TableStyle struct {
	CNFont               string  `json:"cn_font"`
	ENFont               string  `json:"en_font"`
	SizeCN               string  `json:"size_cn"`
	Autofit              bool    `json:"autofit"`
	LineSpacingMode      string  `json:"line_spacing_mode"`
	LineSpacingValue     float64 `json:"line_spacing_value"`
	Align                string  `json:"align"`
	CellAlign            string  `json:"cell_align"`
	MinRowHeightPT       float64 `json:"min_row_height_pt"`
	EnableCellFormatting bool    `json:"enable_cell_formatting"`
	StyleType            string  `json:"style_type"`
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
	CNFont          string  `json:"cn_font"`
	ENFont          string  `json:"en_font"`
	SizeCN          string  `json:"size_cn"`
	Bold            bool    `json:"bold"`
	ColorRGB        [3]int  `json:"color_rgb"`
	LineSpacingMode string  `json:"line_spacing_mode"`
	TabLeader       string  `json:"tab_leader"`
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
	Scheme       string `json:"scheme"`
	Wrapper      string `json:"wrapper"`
	MultiDepth   string `json:"multi_depth"`
	Enabled      bool   `json:"enabled"`
	CustomExample string `json:"custom_example"`
}
