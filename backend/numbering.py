import re
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from utils import get_paragraph_text, clear_paragraph_content


def _build_pattern_regex(rule):
    scheme = r'[一二三四五六七八九十百千]+'
    if rule.get('scheme') == 'ARABIC':
        scheme = r'\d+'
    wrapper_map = {
        'DUNHAO': r'[、]', 'DOUBLE_PAREN': r'[（(][\s]*(%s)[\s]*[）)]', 'DOT': r'[.．]',
        'SINGLE_PAREN': r'[（(][\s]*(%s)[\s]*[）)]', 'PAREN': r'[（(][\s]*(%s)[\s]*[）)]', 'BRACKET': r'[【\[][\s]*(%s)[\s]*[】\]]',
    }
    wrapper = wrapper_map.get(rule.get('wrapper', ''), '')
    if not wrapper:
        return None
    # For paren/bracket wrappers, the scheme is already inside the wrapper pattern
    if wrapper.count('%s') > 0:
        wrapper = wrapper % scheme
        return re.compile(r'^%s?\s*(.*)' % wrapper)
    return re.compile(r'^(%s)%s?\s*(.*)' % (scheme, wrapper))


def _create_numbering_definition(numbering_element, rule):
    W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
    max_abstract = -1
    for abstract in numbering_element.findall('{%s}abstractNum' % W):
        aid = int(abstract.get('{%s}abstractNumId' % W))
        if aid > max_abstract:
            max_abstract = aid
    new_abstract_id = max_abstract + 1

    abstract = OxmlElement('w:abstractNum')
    abstract.set(qn('w:abstractNumId'), str(new_abstract_id))

    multi = OxmlElement('w:multiLevelType')
    multi.set(qn('w:val'), 'multilevel')
    abstract.append(multi)

    for level in range(9):
        lvl = OxmlElement('w:lvl')
        lvl.set(qn('w:ilvl'), str(level))
        start = OxmlElement('w:start')
        start.set(qn('w:val'), '1')
        lvl.append(start)
        num_fmt = OxmlElement('w:numFmt')
        if rule.get('scheme') == 'ZH_NUM':
            num_fmt.set(qn('w:val'), 'chineseCounting')
        else:
            num_fmt.set(qn('w:val'), 'decimal')
        lvl.append(num_fmt)
        lvl_text = OxmlElement('w:lvlText')
        lvl_text.set(qn('w:val'), '%%%d.' % (level + 1))
        lvl.append(lvl_text)
        lvl_jc = OxmlElement('w:lvlJc')
        lvl_jc.set(qn('w:val'), 'left')
        lvl.append(lvl_jc)
        abstract.append(lvl)

    first_num = numbering_element.find('{%s}num' % W)
    if first_num is not None:
        first_num.addprevious(abstract)
    else:
        numbering_element.append(abstract)

    max_num = 0
    for num in numbering_element.findall('{%s}num' % W):
        nid = int(num.get(qn('w:numId')))
        if nid > max_num:
            max_num = nid
    new_num_id = max_num + 1

    num = OxmlElement('w:num')
    num.set(qn('w:numId'), str(new_num_id))
    abstract_ref = OxmlElement('w:abstractNumId')
    abstract_ref.set(qn('w:val'), str(new_abstract_id))
    num.append(abstract_ref)
    numbering_element.append(num)

    return new_num_id


def _set_paragraph_numbering(paragraph, num_id, level):
    pPr = paragraph._element.get_or_add_pPr()
    existing = pPr.find(qn('w:numPr'))
    if existing is not None:
        pPr.remove(existing)
    numPr = OxmlElement('w:numPr')
    ilvl = OxmlElement('w:ilvl')
    ilvl.set(qn('w:val'), str(level))
    numPr.append(ilvl)
    num_id_el = OxmlElement('w:numId')
    num_id_el.set(qn('w:val'), str(num_id))
    numPr.append(num_id_el)
    pStyle = pPr.find(qn('w:pStyle'))
    if pStyle is not None:
        pStyle.addnext(numPr)
    else:
        pPr.insert(0, numPr)


def apply_numbering(doc, cfg):
    rules = cfg.get('rules', [])
    active_rules = [r for r in rules if r.get('enabled')]
    if not active_rules:
        return

    try:
        numbering_part = doc.part.numbering_part
        numbering_element = numbering_part.element
    except Exception:
        return

    rule_cache = {}
    for paragraph in doc.paragraphs:
        text = get_paragraph_text(paragraph)
        if not text.strip():
            continue
        for rule in active_rules:
            regex = _build_pattern_regex(rule)
            if not regex:
                continue
            match = regex.match(text)
            if not match:
                continue
            stripped = match.group(2).strip()
            clear_paragraph_content(paragraph)
            run = paragraph.add_run(stripped)
            key = '%s|%s|%s' % (rule.get('scheme', ''), rule.get('wrapper', ''), rule.get('custom_example', ''))
            if key not in rule_cache:
                num_id = _create_numbering_definition(numbering_element, rule)
                rule_cache[key] = num_id
            num_id = rule_cache[key]
            level = rule.get('multi_depth', 0)
            if level < 0:
                level = 0
            if level > 8:
                level = 8
            _set_paragraph_numbering(paragraph, num_id, level)
            break
