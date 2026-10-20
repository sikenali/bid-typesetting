from utils import get_heading_level, apply_style_to_run, apply_paragraph_spacing, ALIGN_MAP


def apply_heading_formats(doc, heading_styles):
    if not heading_styles:
        return
    for p in doc.paragraphs:
        style_id = p.style.style_id if p.style else ''
        lvl = get_heading_level(style_id)
        if lvl < 1 or lvl > len(heading_styles):
            continue
        h = heading_styles[lvl - 1]
        align = h.get('align', '')
        if align and align in ALIGN_MAP:
            p.alignment = ALIGN_MAP[align]
        apply_paragraph_spacing(p, h)
        for r in p.runs:
            apply_style_to_run(r, h)
