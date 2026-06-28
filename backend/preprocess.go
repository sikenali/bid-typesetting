package wordformat

import (
	"fmt"

	"github.com/unidoc/unioffice/document"
)

type preprocessStep struct {
	name string
	fn   func(*document.Document, *Config) error
}

func Preprocess(doc *document.Document, cfg *Config) error {
	steps := []preprocessStep{
		{"清除样式", func(d *document.Document, c *Config) error {
			if c.PreprocessClearAllStyles { return ClearAllStyles(d) }
			return nil
		}},
		{"清除缩进", func(d *document.Document, c *Config) error {
			if c.PreprocessClearIndents { return ClearIndents(d) }
			return nil
		}},
		{"清除对齐网格", func(d *document.Document, c *Config) error {
			if c.PreprocessClearSnapToGrid { return ClearSnapToGrid(d) }
			return nil
		}},
		{"SDT折叠", func(d *document.Document, c *Config) error {
			if c.PreprocessFlattenSDT { return FlattenSDT(d) }
			return nil
		}},
		{"软回车处理", func(d *document.Document, c *Config) error {
			if c.PreprocessSoftReturn { return ReplaceSoftReturns(d) }
			return nil
		}},
		{"制表符处理", func(d *document.Document, c *Config) error {
			if c.PreprocessTabMode > 0 { return ProcessTabMode(d, c.PreprocessTabMode) }
			return nil
		}},
		{"中英文空格", func(d *document.Document, c *Config) error {
			if c.PreprocessSpaces { return InsertCJKEUSpacing(d) }
			return nil
		}},
		{"上下标清除", func(d *document.Document, c *Config) error {
			if c.PreprocessSuperscript { return ClearSuperscript(d) }
			return nil
		}},
		{"标点标准化", func(d *document.Document, c *Config) error {
			if c.PreprocessPunctuation { return NormalizePunctuation(d) }
			return nil
		}},
		{"对象环绕", func(d *document.Document, c *Config) error {
			if c.PreprocessObjectWrapping { return ClearObjectWrapping(d) }
			return nil
		}},
		{"删除空行", func(d *document.Document, c *Config) error {
			if c.PreprocessDeleteEmptyLines { return DeleteEmptyLines(d) }
			return nil
		}},
		{"图题间距", AdjustCaptionSpacing},
	}

	for _, step := range steps {
		if err := step.fn(doc, cfg); err != nil {
			return fmt.Errorf("%s: %w", step.name, err)
		}
	}
	return nil
}
