package wordformat

import (
	"fmt"

	"github.com/unidoc/unioffice/v2/document"
)

type preprocessStep struct {
	name string
	fn   func(*document.Document, *Config) error
}

func Preprocess(doc *document.Document, cfg *Config) error {
	steps := []preprocessStep{
		{"清除样式", func(d *document.Document, c *Config) error {
			if c.PreprocessClearAllStyles {
				return ClearAllStyles(d)
			}
			return nil
		}},
		{"清除缩进", func(d *document.Document, c *Config) error {
			if c.PreprocessClearIndents {
				return ClearIndents(d)
			}
			return nil
		}},
		{"清除标题缩进", func(d *document.Document, c *Config) error {
			if c.PreprocessClearHeadingIndent || c.PreprocessClearHeadingLeftIndent || c.PreprocessClearHeadingRightIndent || c.PreprocessClearHeadingSpecialIndent {
				return ClearHeadingIndents(d, c.PreprocessClearHeadingLeftIndent, c.PreprocessClearHeadingRightIndent, c.PreprocessClearHeadingSpecialIndent)
			}
			return nil
		}},
		{"清除对齐网格", func(d *document.Document, c *Config) error {
			if c.PreprocessClearSnapToGrid {
				return ClearSnapToGrid(d)
			}
			return nil
		}},
		{"清除额外空格", func(d *document.Document, c *Config) error {
			if c.PreprocessClearExtraSpaces {
				return ClearExtraSpaces(d)
			}
			return nil
		}},
		{"清除图表格式", func(d *document.Document, c *Config) error {
			if c.PreprocessClearChartFormat {
				return ClearChartFormat(d)
			}
			return nil
		}},
		{"SDT折叠", func(d *document.Document, c *Config) error {
			if c.PreprocessFlattenSDT {
				return FlattenSDT(d)
			}
			return nil
		}},
		{"软回车处理", func(d *document.Document, c *Config) error {
			if c.PreprocessSoftReturn {
				return ReplaceSoftReturns(d)
			}
			return nil
		}},
		{"制表符处理", func(d *document.Document, c *Config) error {
			if c.PreprocessTabMode != 0 {
				return ProcessTabMode(d, c.PreprocessTabMode)
			}
			return nil
		}},
		{"中英文空格", func(d *document.Document, c *Config) error {
			if c.PreprocessSpaces {
				if c.Body.AddSpace {
					return InsertCJKEUSpacingWith(d, c.Body.SpaceCount)
				}
				return InsertCJKEUSpacing(d)
			}
			return nil
		}},
		{"Markdown转纯文本", func(d *document.Document, c *Config) error {
			if c.PreprocessMarkdownToPlain {
				return MarkdownToPlaintext(d)
			}
			return nil
		}},
		{"上下标清除", func(d *document.Document, c *Config) error {
			if c.PreprocessSuperscript {
				return ClearSuperscript(d)
			}
			return nil
		}},
		{"标点标准化", func(d *document.Document, c *Config) error {
			if c.PreprocessPunctuation {
				return NormalizePunctuation(d)
			}
			return nil
		}},
		{"对象环绕", func(d *document.Document, c *Config) error {
			if c.PreprocessObjectWrapping {
				return ClearObjectWrapping(d)
			}
			return nil
		}},
		{"删除空行", func(d *document.Document, c *Config) error {
			if c.PreprocessDeleteEmptyLines {
				return DeleteEmptyLines(d)
			}
			return nil
		}},
		{"图题间距", AdjustCaptionSpacing},
		{"表格单元格", func(d *document.Document, c *Config) error {
			if c.PreprocessTableCellEnable {
				return ApplyPreprocessTableCells(d,
					c.PreprocessTableCellFont,
					c.PreprocessTableCellSize,
					c.PreprocessTableCellLineSpacing,
					c.PreprocessTableCellAlign,
					c.PreprocessTableCellBorder,
					c.PreprocessTableCellMinHeight,
					c.PreprocessTableAutoWidth)
			}
			return nil
		}},
	}

	for _, step := range steps {
		if err := step.fn(doc, cfg); err != nil {
			return fmt.Errorf("%s: %w", step.name, err)
		}
	}
	return nil
}
