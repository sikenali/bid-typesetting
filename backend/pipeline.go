package wordformat

import (
	"fmt"

	"github.com/unidoc/unioffice/v2/document"
)

type pipelineStep struct {
	name string
	fn   func(*document.Document, *Config) error
}

func RunPipeline(doc *document.Document, cfg *Config) error {
	pipeline := []pipelineStep{
		{"预处理", Preprocess},
		{"页面设置", func(d *document.Document, c *Config) error {
			if c.ApplyPage {
				return ApplyPageSetupWithHF(d, &c.Margins, &c.HeaderFooter)
			}
			return nil
		}},
		{"正文格式", func(d *document.Document, c *Config) error {
			if c.ApplyBody {
				return ApplyBodyFormat(d, &c.Body)
			}
			return nil
		}},
		{"标题格式", func(d *document.Document, c *Config) error {
			if c.ApplyHeadings {
				return ApplyHeadingFormats(d, c.Headings)
			}
			return nil
		}},
		{"图题表题格式", func(d *document.Document, c *Config) error {
			if c.ApplyFigTbl {
				return ApplyCaptionFormats(d, &c.FigCaption, &c.TblCaption)
			}
			return nil
		}},
		{"表格格式", func(d *document.Document, c *Config) error {
			if c.ApplyTable || c.ApplyFigTbl {
				if err := ApplyTableFormat(d, &c.Table); err != nil {
					return err
				}
				if c.TableSettings.Enable {
					return ApplyTableSettings(d, &c.TableSettings)
				}
			}
			return nil
		}},
		{"目录格式", func(d *document.Document, c *Config) error {
			if c.ApplyTOC {
				return ApplyTOCFormat(d, &c.TOC)
			}
			return nil
		}},
		{"页眉页脚", func(d *document.Document, c *Config) error {
			if c.ApplyHeaderFooter {
				return ApplyHeaderFooter(d, &c.HeaderFooter)
			}
			return nil
		}},
		{"编号模式", func(d *document.Document, c *Config) error {
			return ApplyNumbering(d, &c.Patterns)
		}},
		{"TOC域代码", func(d *document.Document, c *Config) error {
			if c.ApplyTOC {
				return InjectTOC(d, &c.TOC)
			}
			return nil
		}},
	}

	for _, step := range pipeline {
		fmt.Printf("[%s] 执行中...\n", step.name)
		if err := step.fn(doc, cfg); err != nil {
			return fmt.Errorf("[%s] 失败: %w", step.name, err)
		}
	}

	return nil
}
