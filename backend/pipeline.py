from preprocess import preprocess
from format_page import apply_page_setup_with_hf
from format_body import apply_body_format
from format_headings import apply_heading_formats
from format_captions import apply_caption_formats
from format_table import apply_table_format, apply_table_settings
from format_toc import apply_toc_format
from format_headerfooter import apply_header_footer
from numbering import apply_numbering
from fieldcodes import inject_toc


def _print_step(name):
    print('[%s] 执行中...' % name, flush=True)


def run_pipeline(doc, cfg):
    steps = [
        ('预处理', lambda: preprocess(doc, cfg)),
        ('页面设置', lambda: apply_page_setup_with_hf(doc, cfg.get('margins', {}), cfg.get('header_footer')) if cfg.get('apply_page') else None),
        ('正文格式', lambda: apply_body_format(doc, cfg.get('body', {})) if cfg.get('apply_body') else None),
        ('标题格式', lambda: apply_heading_formats(doc, cfg.get('headings', [])) if cfg.get('apply_headings') else None),
        ('图题表题格式', lambda: apply_caption_formats(doc, cfg.get('fig_caption', {}), cfg.get('tbl_caption', {})) if cfg.get('apply_figtbl') else None),
        ('表格格式', lambda: _table_step(doc, cfg)),
        ('目录格式', lambda: apply_toc_format(doc, cfg.get('toc', {})) if cfg.get('apply_toc') else None),
        ('页眉页脚', lambda: apply_header_footer(doc, cfg.get('header_footer', {})) if cfg.get('apply_header_footer') else None),
        ('编号模式', lambda: apply_numbering(doc, cfg.get('patterns', {})) if cfg.get('apply_numbering', True) else None),
        ('TOC域代码', lambda: inject_toc(doc, cfg.get('toc', {})) if cfg.get('apply_toc') else None),
        ('自动刷新域', lambda: _set_update_fields_on_open(doc) if cfg.get('auto_refresh_fields') else None),
        ('格式化后清理', lambda: _post_clean(doc, cfg) if not cfg.get('preprocess_post_clean_styles') is False else None),
    ]

    for name, fn in steps:
        _print_step(name)
        try:
            fn()
        except Exception as e:
            raise Exception('[%s] 失败: %s' % (name, e))


def _table_step(doc, cfg):
    if not (cfg.get('apply_table') or cfg.get('apply_figtbl')):
        return
    ts = cfg.get('table', {})
    if ts.get('enable'):
        apply_table_format(doc, ts)
    ts2 = cfg.get('table_settings', {})
    if ts2.get('enable'):
        apply_table_settings(doc, ts2)


def _set_update_fields_on_open(doc):
    settings = doc.settings.element
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
    existing = settings.find(qn('w:updateFields'))
    if existing is not None:
        settings.remove(existing)
    uf = OxmlElement('w:updateFields')
    uf.set(qn('w:val'), 'true')
    settings.append(uf)


def _post_clean(doc, cfg):
    from preprocess import clear_extra_spaces, delete_empty_lines
    clear_extra_spaces(doc)
    delete_empty_lines(doc)
