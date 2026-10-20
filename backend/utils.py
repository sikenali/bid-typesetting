import re
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_COLOR_INDEX

CN_SIZE_MAP = {
    '初号': 42, '小初': 36, '一号': 26, '小一': 24,
    '二号': 22, '小二': 18, '三号': 16, '小三': 15,
    '四号': 14, '小四': 12, '五号': 10.5, '小五': 9,
    '六号': 7.5, '小六': 6.5, '七号': 5.5, '八号': 5,
}

ALIGN_MAP = {
    'JUSTIFY': WD_ALIGN_PARAGRAPH.JUSTIFY,
    'BOTH': WD_ALIGN_PARAGRAPH.JUSTIFY,
    '两端对齐': WD_ALIGN_PARAGRAPH.JUSTIFY,
    'LEFT': WD_ALIGN_PARAGRAPH.LEFT,
    '居左': WD_ALIGN_PARAGRAPH.LEFT,
    'CENTER': WD_ALIGN_PARAGRAPH.CENTER,
    '居中': WD_ALIGN_PARAGRAPH.CENTER,
    'RIGHT': WD_ALIGN_PARAGRAPH.RIGHT,
    '居右': WD_ALIGN_PARAGRAPH.RIGHT,
}

HIGHLIGHT_MAP = {
    'yellow': WD_COLOR_INDEX.YELLOW, '绿色': WD_COLOR_INDEX.GREEN,
    'green': WD_COLOR_INDEX.GREEN, 'cyan': WD_COLOR_INDEX.TEAL,
    '青色': WD_COLOR_INDEX.TEAL, 'red': WD_COLOR_INDEX.RED,
    '红色': WD_COLOR_INDEX.RED, 'magenta': WD_COLOR_INDEX.PINK,
    '品红': WD_COLOR_INDEX.PINK, 'blue': WD_COLOR_INDEX.BLUE,
    '蓝色': WD_COLOR_INDEX.BLUE, 'black': WD_COLOR_INDEX.BLACK,
    '黑色': WD_COLOR_INDEX.BLACK, 'darkblue': WD_COLOR_INDEX.DARK_BLUE,
    '深蓝': WD_COLOR_INDEX.DARK_BLUE, 'darkcyan': WD_COLOR_INDEX.TEAL,
    '深青': WD_COLOR_INDEX.TEAL, 'darkgreen': WD_COLOR_INDEX.GREEN,
    '深绿': WD_COLOR_INDEX.GREEN, 'darkmagenta': WD_COLOR_INDEX.PINK,
    '深品红': WD_COLOR_INDEX.PINK, 'darkred': WD_COLOR_INDEX.DARK_RED,
    '深红': WD_COLOR_INDEX.DARK_RED, 'darkyellow': WD_COLOR_INDEX.DARK_YELLOW,
    '深黄': WD_COLOR_INDEX.DARK_YELLOW, 'darkgray': WD_COLOR_INDEX.GRAY_50,
    '深灰': WD_COLOR_INDEX.GRAY_50, 'lightgray': WD_COLOR_INDEX.GRAY_25,
    '浅灰': WD_COLOR_INDEX.GRAY_25, 'none': None, '无': None,
}

UNDERLINE_MAP = {
    'single': 'single', 'single': 'single',
    'double': 'double', 'double': 'double',
    'dotted': 'dotted', 'dotted': 'dotted',
    'dashed': 'dashed', 'dashed': 'dashed',
    'wavy': 'wave', 'wavy': 'wave',
}


def cm_to_twips(cm):
    return cm / 2.54 * 1440


def twips_from_spacing(value, unit):
    u = unit.lower() if unit else ''
    if u in ('磅', 'pt'):
        return value * 20
    if u in ('行', 'line'):
        return value * 240
    if u in ('char',):
        return value * 200
    return value * 20


def twips_from_indent_value(value, unit):
    u = unit.lower() if unit else ''
    if u in ('磅', 'pt'):
        return value * 20
    if u in ('cm',):
        return cm_to_twips(value)
    return value * 200


def cn_size_to_half_points(cn):
    if cn in CN_SIZE_MAP:
        return CN_SIZE_MAP[cn] * 2
    try:
        return float(cn) * 2
    except (ValueError, TypeError):
        return 28


def cn_size_to_pt(cn):
    if cn in CN_SIZE_MAP:
        return CN_SIZE_MAP[cn]
    try:
        return float(cn)
    except (ValueError, TypeError):
        return 14


def parse_float_from_cn(s):
    if not s:
        return 0
    try:
        return float(s)
    except (ValueError, TypeError):
        return 0


def is_cjk(r):
    cp = ord(r)
    return (0x4E00 <= cp <= 0x9FFF) or (0x3400 <= cp <= 0x4DBF) or (0x3000 <= cp <= 0x303F) or (0xFF00 <= cp <= 0xFFEF)


def is_digit(r):
    return r >= '0' and r <= '9'


def is_cjk_font(name):
    for c in name:
        if 0x4E00 <= ord(c) <= 0x9FFF:
            return True
    return False


def char_width_twips(cn_font):
    if not cn_font:
        return 256
    return 256 if is_cjk_font(cn_font) else 200


def is_heading_style(style_id):
    if not style_id:
        return False
    if re.match(r'[Hh]eading\d+', style_id):
        return True
    for prefix in ('标题', '標題'):
        if style_id.startswith(prefix):
            rest = style_id[len(prefix):].strip()
            if rest in ('一', '二', '三', '四') or rest.isdigit():
                return True
    return False


def get_heading_level(style_id):
    if not style_id:
        return -1
    m = re.match(r'[Hh]eading(\d+)', style_id)
    if m:
        return int(m.group(1))
    cn_map = {'一': 1, '二': 2, '三': 3, '四': 4}
    for prefix in ('标题', '標題'):
        if style_id.startswith(prefix):
            rest = style_id[len(prefix):].strip()
            if rest in cn_map:
                return cn_map[rest]
            try:
                return int(rest)
            except ValueError:
                pass
    return -1


def get_paragraph_text(paragraph):
    return ''.join(r.text for r in paragraph.runs)


def clear_paragraph_content(paragraph):
    for r in paragraph.runs:
        r.text = ''


def has_drawing_or_object(paragraph):
    for r in paragraph.runs:
        for elem in r._element.iter():
            if elem.tag.endswith('}drawing'):
                return True
    return False


def set_line_spacing(pPr, mode, value):
    spacing = pPr.get_or_add_spacing()
    if mode in ('EXACT', 'FIXED'):
        spacing.set(qn('w:line'), str(int(value * 20)))
        spacing.set(qn('w:lineRule'), 'exact')
    elif mode == 'AT_LEAST':
        spacing.set(qn('w:line'), str(int(value * 20)))
        spacing.set(qn('w:lineRule'), 'atLeast')
    elif mode == 'MULTIPLE':
        spacing.set(qn('w:line'), str(int(value * 240)))
        spacing.set(qn('w:lineRule'), 'auto')
    elif mode == 'SINGLE':
        spacing.set(qn('w:line'), '240')
        spacing.set(qn('w:lineRule'), 'auto')


def set_space_before(pPr, value, unit):
    if value > 0:
        spacing = pPr.get_or_add_spacing()
        spacing.set(qn('w:before'), str(int(twips_from_spacing(value, unit))))


def set_space_after(pPr, value, unit):
    if value > 0:
        spacing = pPr.get_or_add_spacing()
        spacing.set(qn('w:after'), str(int(twips_from_spacing(value, unit))))


def set_first_line_indent(pPr, chars, cn_font):
    if chars > 0:
        ind = pPr.get_or_add_ind()
        ind.set(qn('w:firstLine'), str(int(chars * char_width_twips(cn_font))))


def set_left_indent(pPr, value, unit):
    if value > 0:
        ind = pPr.get_or_add_ind()
        ind.set(qn('w:left'), str(int(twips_from_indent_value(value, unit))))


def set_right_indent(pPr, value, unit):
    if value > 0:
        ind = pPr.get_or_add_ind()
        ind.set(qn('w:right'), str(int(twips_from_indent_value(value, unit))))


def set_keep_with_next(paragraph, on):
    pPr = paragraph._element.get_or_add_pPr()
    if on:
        keepNext = OxmlElement('w:keepNext')
        pPr.append(keepNext)
    else:
        el = pPr.find(qn('w:keepNext'))
        if el is not None:
            pPr.remove(el)


def set_page_break_before(paragraph, on):
    pPr = paragraph._element.get_or_add_pPr()
    if on:
        pbb = OxmlElement('w:pageBreakBefore')
        pPr.append(pbb)
    else:
        el = pPr.find(qn('w:pageBreakBefore'))
        if el is not None:
            pPr.remove(el)


def set_snap_to_grid(pPr, off):
    stg = OxmlElement('w:snapToGrid')
    stg.set(qn('w:val'), '0' if off else '1')
    existing = pPr.find(qn('w:snapToGrid'))
    if existing is not None:
        pPr.remove(existing)
    pPr.append(stg)


def set_east_asia_font(rPr, cn_font):
    rFonts = rPr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = OxmlElement('w:rFonts')
        rPr.insert(0, rFonts)
    rFonts.set(qn('w:eastAsia'), cn_font)


def set_highlight(rPr, highlight_str):
    if not highlight_str:
        return
    val = HIGHLIGHT_MAP.get(highlight_str.lower())
    if val is None and highlight_str in HIGHLIGHT_MAP:
        val = HIGHLIGHT_MAP[highlight_str]
    if val is not None:
        highlight = OxmlElement('w:highlight')
        highlight.set(qn('w:val'), str(val))
        existing = rPr.find(qn('w:highlight'))
        if existing is not None:
            rPr.remove(existing)
        rPr.append(highlight)


def set_underline_type(rPr, type_str, color_hex):
    if not type_str:
        return
    val = UNDERLINE_MAP.get(type_str.lower(), 'single')
    u = OxmlElement('w:u')
    u.set(qn('w:val'), val)
    existing = rPr.find(qn('w:u'))
    if existing is not None:
        rPr.remove(existing)
    rPr.append(u)


def set_color_hex(rPr, hex_str):
    if not hex_str:
        return
    if not hex_str.startswith('#'):
        hex_str = '#' + hex_str
    color = OxmlElement('w:color')
    color.set(qn('w:val'), hex_str.lstrip('#'))
    existing = rPr.find(qn('w:color'))
    if existing is not None:
        rPr.remove(existing)
    rPr.append(color)


def apply_style_to_run(run, style):
    rPr = run._element.get_or_add_rPr()
    en_font = style.get('en_font', '')
    cn_font = style.get('cn_font', '')
    if en_font or cn_font:
        font = en_font if en_font else cn_font
        run.font.name = font
        if cn_font and cn_font != en_font:
            set_east_asia_font(rPr, cn_font)
    size_cn = style.get('size_cn', '')
    if size_cn:
        run.font.size = Pt(cn_size_to_pt(size_cn))
    if style.get('bold'):
        run.font.bold = True
    if style.get('italic'):
        run.font.italic = True
    if style.get('strike'):
        run.font.strike = True
    if style.get('underline'):
        ut = style.get('underline_type', 'single')
        uc = style.get('color', '') or '#000000'
        set_underline_type(rPr, ut, uc)
    if style.get('color'):
        set_color_hex(rPr, style['color'])
    if style.get('highlight'):
        set_highlight(rPr, style['highlight'])


def apply_paragraph_spacing(paragraph, style):
    pPr = paragraph._element.get_or_add_pPr()
    if style.get('line_spacing_mode'):
        set_line_spacing(pPr, style['line_spacing_mode'], style.get('line_spacing_value', 0))
    if style.get('space_before_value', 0) > 0:
        set_space_before(pPr, style['space_before_value'], style.get('space_before_unit', 'pt'))
    if style.get('space_after_value', 0) > 0:
        set_space_after(pPr, style['space_after_value'], style.get('space_after_unit', 'pt'))
    if style.get('first_line_indent_chars', 0) > 0:
        set_first_line_indent(pPr, style['first_line_indent_chars'], style.get('cn_font', ''))
    if style.get('left_indent_value', 0) > 0:
        set_left_indent(pPr, style['left_indent_value'], style.get('left_indent_unit', 'char'))
    if style.get('right_indent_value', 0) > 0:
        set_right_indent(pPr, style['right_indent_value'], style.get('right_indent_unit', 'char'))
    if style.get('keep_with_next'):
        set_keep_with_next(paragraph, True)
    if style.get('page_break_before'):
        set_page_break_before(paragraph, True)
