from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.shared import Pt
from utils import (cn_size_to_pt, cn_size_to_half_points, apply_paragraph_spacing,
                   apply_style_to_run, set_line_spacing, set_first_line_indent,
                   set_left_indent, set_right_indent, set_space_before, set_space_after,
                   ALIGN_MAP, char_width_twips, set_east_asia_font, set_color_hex)


def _set_tab_leader(pPr, leader):
    leader_map = {
        'DOT': 'dot', '点': 'dot', '点号': 'dot',
        'HYPHEN': 'hyphen', '连字符': 'hyphen',
        'UNDERSCORE': 'underscore', '下划线': 'underscore',
        'MIDDLE_DOT': 'middleDot', '中点': 'middleDot',
        'NONE': 'none', '无': 'none',
    }
    val = leader_map.get(leader, '')
    if not val:
        return
    tabs = pPr.find(qn('w:tabs'))
    if tabs is None:
        tabs = OxmlElement('w:tabs')
        pPr.append(tabs)
    if len(tabs) == 0:
        tab = OxmlElement('w:tab')
        tab.set(qn('w:leader'), val)
        tabs.append(tab)
    else:
        for tab in tabs:
            tab.set(qn('w:leader'), val)


def apply_toc_format(doc, toc_cfg):
    if not toc_cfg or not toc_cfg.get('enable'):
        return
    title_cn = toc_cfg.get('title_cn_font', '')
    title_en = toc_cfg.get('title_en_font', '')
    title_size = toc_cfg.get('title_size_cn', '')
    level_styles = toc_cfg.get('level_styles', [])

    for p in doc.paragraphs:
        style_id = p.style.style_id if p.style else ''
        pPr = p._element.get_or_add_pPr()

        if style_id in ('TOCHeading', 'TOC Heading'):
            for r in p.runs:
                rPr = r._element.get_or_add_rPr()
                if title_en or title_cn:
                    font = title_en if title_en else title_cn
                    r.font.name = font
                    if title_cn and title_cn != title_en:
                        set_east_asia(rPr, title_cn)
                if title_size:
                    r.font.size = Pt(cn_size_to_pt(title_size))
            continue

        for i, ls in enumerate(level_styles):
            if style_id in (f'toc{i+1}', f'TOC{i+1}'):
                align = ls.get('align', '')
                if align and align in ALIGN_MAP:
                    p.alignment = ALIGN_MAP[align]
                ls_mode = ls.get('line_spacing_mode', '')
                if ls_mode:
                    set_line_spacing(pPr, ls_mode, ls.get('line_spacing_value', 0))
                sb_val = ls.get('space_before_value', 0)
                if sb_val > 0:
                    set_space_before(pPr, sb_val, ls.get('space_before_unit', 'pt'))
                sa_val = ls.get('space_after_value', 0)
                if sa_val > 0:
                    set_space_after(pPr, sa_val, ls.get('space_after_unit', 'pt'))
                fli = ls.get('first_line_indent_chars', 0)
                if fli > 0:
                    set_first_line_indent(pPr, fli, ls.get('cn_font', ''))
                li = ls.get('left_indent_chars', 0)
                if li > 0:
                    set_left_indent(pPr, li, 'char')
                ri = ls.get('right_indent_value', 0)
                if ri > 0:
                    set_right_indent(pPr, ri, ls.get('right_indent_unit', 'char'))
                tl = ls.get('tab_leader', '')
                if tl:
                    _set_tab_leader(pPr, tl)

                cn_font = ls.get('cn_font', '')
                en_font = ls.get('en_font', '')
                size_cn = ls.get('size_cn', '')
                bold = ls.get('bold', False)
                italic = ls.get('italic', False)
                color_rgb = ls.get('color_rgb', [0, 0, 0])
                for r in p.runs:
                    rPr = r._element.get_or_add_rPr()
                    if en_font or cn_font:
                        font = en_font if en_font else cn_font
                        r.font.name = font
                        if cn_font and cn_font != en_font:
                            set_east_asia(rPr, cn_font)
                    if size_cn:
                        r.font.size = Pt(cn_size_to_pt(size_cn))
                    r.font.bold = bold
                    if italic:
                        r.font.italic = True
                    if color_rgb != [0, 0, 0]:
                        hex_str = '#%02X%02X%02X' % tuple(color_rgb)
                        set_color_hex(rPr, hex_str)
                break


def set_east_asia(rPr, cn_font):
    set_east_asia_font(rPr, cn_font)
