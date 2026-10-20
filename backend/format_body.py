from utils import is_heading_style, apply_style_to_run, apply_paragraph_spacing, ALIGN_MAP


def apply_body_format(doc, style):
    for p in doc.paragraphs:
        style_id = p.style.style_id if p.style else ''
        if is_heading_style(style_id):
            continue
        align = style.get('align', '')
        if align and align in ALIGN_MAP:
            p.alignment = ALIGN_MAP[align]
        apply_paragraph_spacing(p, style)
        for r in p.runs:
            apply_style_to_run(r, style)
