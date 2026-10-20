from utils import apply_style_to_run, ALIGN_MAP


def apply_caption_formats(doc, fig_style, tbl_style):
    for p in doc.paragraphs:
        text = ''.join(r.text for r in p.runs)
        if not text:
            continue
        text_stripped = text.strip()
        is_fig = text_stripped.startswith('图') or text_stripped.startswith('圖')
        is_tbl = text_stripped.startswith('表')
        style = None
        if is_fig:
            style = fig_style
        elif is_tbl:
            style = tbl_style
        if not style:
            continue
        align = style.get('align', '')
        if align and align in ALIGN_MAP:
            p.alignment = ALIGN_MAP[align]
        for r in p.runs:
            apply_style_to_run(r, style)
