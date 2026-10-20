from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.shared import Pt
from docx.enum.table import WD_ALIGN_VERTICAL
from docx.enum.text import WD_ALIGN_PARAGRAPH
from utils import (apply_style_to_run, apply_paragraph_spacing, set_line_spacing,
                   ALIGN_MAP)


def apply_cell_borders(cell, style):
    if not style or style == '无' or style == 'none':
        tcPr = cell._tc.get_or_add_tcPr()
        tcBorders = OxmlElement('w:tcBorders')
        for side in ('top', 'left', 'bottom', 'right'):
            border = OxmlElement('w:' + side)
            border.set(qn('w:val'), 'none')
            border.set(qn('w:sz'), '0')
            tcBorders.append(border)
        old = tcPr.find(qn('w:tcBorders'))
        if old is not None:
            tcPr.remove(old)
        tcPr.append(tcBorders)
        return
    if style in ('保留', 'preserve', '原样', 'original'):
        return
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    sz = '4'
    color = '000000'
    val = 'single'
    if style in ('全部', 'ALL', 'all'):
        for side in ('top', 'left', 'bottom', 'right'):
            border = OxmlElement('w:' + side)
            border.set(qn('w:val'), val)
            border.set(qn('w:sz'), sz)
            border.set(qn('w:color'), color)
            tcBorders.append(border)
    elif style in ('外框', 'outside', 'OUTSIDE'):
        for side in ('top', 'left', 'bottom', 'right'):
            border = OxmlElement('w:' + side)
            border.set(qn('w:val'), val)
            border.set(qn('w:sz'), sz)
            border.set(qn('w:color'), color)
            tcBorders.append(border)
    elif style in ('内部', 'inside', 'INSIDE'):
        # Inside borders are handled at table level in _set_table_borders
        return
    old = tcPr.find(qn('w:tcBorders'))
    if old is not None:
        tcPr.remove(old)
    tcPr.append(tcBorders)


def _set_table_borders(tbl, style):
    """Set table-level borders for inside/outside/all styles."""
    tblPr = tbl._tbl.tblPr
    # Remove existing tblBorders
    old = tblPr.find(qn('w:tblBorders'))
    if old is not None:
        tblPr.remove(old)
    if style in ('内部', 'inside', 'INSIDE'):
        # Only set inside borders (horizontal and vertical between cells)
        tblBorders = OxmlElement('w:tblBorders')
        for side in ('insideH', 'insideV'):
            border = OxmlElement('w:' + side)
            border.set(qn('w:val'), 'single')
            border.set(qn('w:sz'), '4')
            border.set(qn('w:color'), '000000')
            tblBorders.append(border)
        # Set outer borders to none
        for side in ('top', 'left', 'bottom', 'right'):
            border = OxmlElement('w:' + side)
            border.set(qn('w:val'), 'none')
            border.set(qn('w:sz'), '0')
            tblBorders.append(border)
        tblPr.append(tblBorders)
    elif style in ('外框', 'outside', 'OUTSIDE'):
        tblBorders = OxmlElement('w:tblBorders')
        for side in ('top', 'left', 'bottom', 'right'):
            border = OxmlElement('w:' + side)
            border.set(qn('w:val'), 'single')
            border.set(qn('w:sz'), '4')
            border.set(qn('w:color'), '000000')
            tblBorders.append(border)
        tblPr.append(tblBorders)


def _set_table_alignment(tbl, align):
    tblPr = tbl._tbl.tblPr
    old = tblPr.find(qn('w:jc'))
    if old is not None:
        tblPr.remove(old)
    jc = OxmlElement('w:jc')
    amap = {'LEFT': 'left', 'CENTER': 'center', 'RIGHT': 'right',
            '居左': 'left', '居中': 'center', '居右': 'right'}
    jc.set(qn('w:val'), amap.get(align, 'center'))
    tblPr.append(jc)


def _set_table_autofit(tbl):
    tblPr = tbl._tbl.tblPr
    tblW = OxmlElement('w:tblW')
    tblW.set(qn('w:type'), 'auto')
    old = tblPr.find(qn('w:tblW'))
    if old is not None:
        tblPr.remove(old)
    tblPr.append(tblW)
    tblLayout = OxmlElement('w:tblLayout')
    tblLayout.set(qn('w:type'), 'autofit')
    old = tblPr.find(qn('w:tblLayout'))
    if old is not None:
        tblPr.remove(old)
    tblPr.append(tblLayout)


def _set_table_style(tbl, style_type):
    if not style_type:
        return
    tblPr = tbl._tbl.tblPr
    old = tblPr.find(qn('w:tblStyle'))
    if old is not None:
        tblPr.remove(old)
    tblStyle = OxmlElement('w:tblStyle')
    tblStyle.set(qn('w:val'), style_type)
    tblPr.append(tblStyle)


def apply_table_format(doc, ts):
    if not ts:
        return
    if not ts.get('enable', False):
        return
    for tbl in doc.tables:
        align = ts.get('align', '')
        if align:
            _set_table_alignment(tbl, align)
        style_type = ts.get('style_type', '')
        if style_type:
            _set_table_style(tbl, style_type)
        if ts.get('autofit'):
            _set_table_autofit(tbl)
        min_row_h = ts.get('min_row_height_pt', 0) or 0
        enable_cell = ts.get('enable_cell_formatting', False)
        cell_align = ts.get('cell_align', '')
        for row in tbl.rows:
            if min_row_h and float(min_row_h) > 0:
                trPr = row._tr.get_or_add_trPr()
                old = trPr.find(qn('w:trHeight'))
                if old is not None:
                    trPr.remove(old)
                trHeight = OxmlElement('w:trHeight')
                trHeight.set(qn('w:val'), str(int(min_row_h * 20)))
                trHeight.set(qn('w:hRule'), 'atLeast')
                trPr.append(trHeight)
            for cell in row.cells:
                if enable_cell and cell_align:
                    vmap = {'CENTER': WD_ALIGN_VERTICAL.CENTER, 'TOP': WD_ALIGN_VERTICAL.TOP, 'BOTTOM': WD_ALIGN_VERTICAL.BOTTOM}
                    if cell_align in vmap:
                        cell.vertical_alignment = vmap[cell_align]
                for p in cell.paragraphs:
                    ls_mode = ts.get('line_spacing_mode', '')
                    if ls_mode:
                        pPr = p._element.get_or_add_pPr()
                        set_line_spacing(pPr, ls_mode, ts.get('line_spacing_value', 0))
                    p_align = ts.get('align', '')
                    if p_align and p_align in ALIGN_MAP:
                        p.alignment = ALIGN_MAP[p_align]
                    for r in p.runs:
                        apply_style_to_run(r, {
                            'cn_font': ts.get('cn_font', ''),
                            'en_font': ts.get('en_font', ''),
                            'size_cn': ts.get('size_cn', ''),
                        })


def apply_table_settings(doc, ts):
    if not ts or not ts.get('enable', False):
        return
    bs = {
        'cn_font': ts.get('cn_font', ''),
        'en_font': ts.get('en_font', ''),
        'size_cn': ts.get('size_cn', ''),
        'line_spacing_mode': 'MULTIPLE',
        'line_spacing_value': ts.get('line_spacing_value', 1.5),
    }
    for tbl in doc.tables:
        if ts.get('auto_width'):
            _set_table_autofit(tbl)
        border_style = ts.get('border_style', '')
        if border_style and border_style in ('内部', 'inside', 'INSIDE'):
            _set_table_borders(tbl, border_style)
        for row in tbl.rows:
            min_h = ts.get('min_line_height', 0) or 0
            if min_h and float(min_h) > 0:
                trPr = row._tr.get_or_add_trPr()
                old = trPr.find(qn('w:trHeight'))
                if old is not None:
                    trPr.remove(old)
                trHeight = OxmlElement('w:trHeight')
                trHeight.set(qn('w:val'), str(int(min_h * 20)))
                trHeight.set(qn('w:hRule'), 'atLeast')
                trPr.append(trHeight)
            for cell in row.cells:
                border_style = ts.get('border_style', '')
                if border_style:
                    apply_cell_borders(cell, border_style)
                cell_align = ts.get('align', '')
                if cell_align:
                    vmap = {'CENTER': WD_ALIGN_VERTICAL.CENTER, 'TOP': WD_ALIGN_VERTICAL.TOP, 'BOTTOM': WD_ALIGN_VERTICAL.BOTTOM}
                    if cell_align in vmap:
                        cell.vertical_alignment = vmap[cell_align]
                for p in cell.paragraphs:
                    apply_paragraph_spacing(p, bs)
                    if cell_align and cell_align in ALIGN_MAP:
                        p.alignment = ALIGN_MAP[cell_align]
                    for r in p.runs:
                        apply_style_to_run(r, bs)
