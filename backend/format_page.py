from docx.shared import Cm, Emu
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.enum.section import WD_ORIENT
from utils import cm_to_twips


def apply_page_setup_with_hf(doc, margins, hf=None):
    top_cm = margins.get('top_cm', 2.54)
    bottom_cm = margins.get('bottom_cm', 2.54)
    left_cm = margins.get('left_cm', 3.17)
    right_cm = margins.get('right_cm', 3.17)
    gutter_cm = margins.get('gutter_cm', 0)
    header_cm = margins.get('header_margin_cm', 1.5)
    footer_cm = header_cm

    if hf:
        if hf.get('header_top_cm', 0) > 0:
            header_cm = hf['header_top_cm']
        if hf.get('footer_bottom_cm', 0) > 0:
            footer_cm = hf['footer_bottom_cm']

    keep_original = margins.get('keep_original_orientation', False)
    if not keep_original:
        paper_size = margins.get('paper_size', 'A4')
        paper_w = margins.get('paper_width_cm', 21.0)
        paper_h = margins.get('paper_height_cm', 29.7)

        size_map = {
            'A4': (21.0, 29.7), 'A3': (29.7, 42.0), 'A5': (14.8, 21.0),
            'B5': (17.6, 25.0), 'Letter': (21.59, 27.94), 'Legal': (21.59, 35.56),
        }
        if paper_size in size_map:
            paper_w, paper_h = size_map[paper_size]

        orientation = margins.get('orientation', 'portrait')
        landscape = orientation == 'landscape' or paper_size in ('A4-L', 'A3-L')
    else:
        landscape = False
        paper_w = paper_h = None

    columns = margins.get('columns', 1)
    space_twips = int(cm_to_twips(margins.get('column_spacing_cm', 1)))
    if space_twips < 0:
        space_twips = 0

    for section in doc.sections:
        section.top_margin = Cm(top_cm)
        section.bottom_margin = Cm(bottom_cm)
        section.left_margin = Cm(left_cm)
        section.right_margin = Cm(right_cm)
        section.header_distance = Cm(header_cm)
        section.footer_distance = Cm(footer_cm)
        if gutter_cm > 0:
            section.gutter = Cm(gutter_cm)

        if not keep_original and paper_w and paper_h:
            if landscape:
                section.orientation = WD_ORIENT.LANDSCAPE
                section.page_width = Cm(paper_h)
                section.page_height = Cm(paper_w)
            else:
                section.orientation = WD_ORIENT.PORTRAIT
                section.page_width = Cm(paper_w)
                section.page_height = Cm(paper_h)

        if columns > 1:
            sectPr = section._sectPr
            old_cols = sectPr.find(qn('w:cols'))
            if old_cols is not None:
                sectPr.remove(old_cols)
            cols = OxmlElement('w:cols')
            cols.set(qn('w:num'), str(columns))
            cols.set(qn('w:space'), str(space_twips))
            sectPr.append(cols)
