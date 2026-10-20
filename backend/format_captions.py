import re
from utils import (apply_style_to_run, apply_paragraph_spacing, ALIGN_MAP,
                   set_line_spacing, set_space_before, set_space_after,
                   set_left_indent, set_right_indent, set_first_line_indent)
from utils import get_paragraph_text


def apply_caption_formats(doc, fig_style, tbl_style):
    re_fig = re.compile(r'^[图圖](\s*)([\d一二三四五六七八九十百千]+)')
    re_tbl = re.compile(r'^表(\s*)([\d一二三四五六七八九十百千]+)')
    for p in doc.paragraphs:
        text = get_paragraph_text(p)
        if not text:
            continue
        text_stripped = text.strip()
        is_fig = bool(re_fig.match(text_stripped))
        is_tbl = bool(re_tbl.match(text_stripped))
        style = None
        if is_fig:
            style = fig_style
        elif is_tbl:
            style = tbl_style
        if not style:
            continue
        # Apply alignment
        align = style.get('align', '')
        if align and align in ALIGN_MAP:
            p.alignment = ALIGN_MAP[align]
        # Apply paragraph spacing/indents
        pPr = p._element.get_or_add_pPr()
        ls_mode = style.get('line_spacing_mode', '')
        if ls_mode:
            set_line_spacing(pPr, ls_mode, style.get('line_spacing_value', 0))
        sb_val = style.get('space_before_value', 0)
        if sb_val and float(sb_val) > 0:
            set_space_before(pPr, sb_val, style.get('space_before_unit', 'pt'))
        sa_val = style.get('space_after_value', 0)
        if sa_val and float(sa_val) > 0:
            set_space_after(pPr, sa_val, style.get('space_after_unit', 'pt'))
        fli = style.get('first_line_indent_chars', 0)
        if fli and float(fli) > 0:
            set_first_line_indent(pPr, fli, style.get('cn_font', ''))
        li = style.get('left_indent_value', 0)
        if li and float(li) > 0:
            set_left_indent(pPr, li, style.get('left_indent_unit', 'char'))
        ri = style.get('right_indent_value', 0)
        if ri and float(ri) > 0:
            set_right_indent(pPr, ri, style.get('right_indent_unit', 'char'))
        # Apply run formatting
        for r in p.runs:
            apply_style_to_run(r, style)
