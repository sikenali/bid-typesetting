#!/usr/bin/env python3
"""Generate before-formatting.docx and after-formatting.docx with randomized params."""
import json, random, zipfile, os, io
from datetime import datetime

random.seed(42)

CN_FONTS = ['宋体', '仿宋', '黑体', '楷体']
EN_FONTS = ['Times New Roman', 'Arial', 'Calibri']
SIZES = ['初号', '小初', '一号', '小一', '二号', '小二', '三号', '四号', '小四', '五号', '小五']
ALIGNS = ['LEFT', 'CENTER', 'RIGHT', 'JUSTIFY']
BOLD_VALS = [True, False]
ITALIC_VALS = [True, False]

def pick(lst): return lst[random.randint(0, len(lst)-1)]
def rand_cm(): return round(random.uniform(1.5, 5.0), 1)
def sz_twip(size):
    m = {'初号':42,'小初':36,'一号':26,'小一':24,'二号':22,'小二':18,'三号':16,'四号':14,'小四':12,'五号':10.5,'小五':9}
    return str(int(m.get(size,12)*2))

def make_config(rand_seed):
    cfg = {
        'page': {
            'top_cm': rand_cm(), 'bottom_cm': rand_cm(),
            'left_cm': rand_cm(), 'right_cm': rand_cm(),
        },
        'body': {
            'cn_font': pick(CN_FONTS), 'en_font': pick(EN_FONTS),
            'size_cn': pick(SIZES), 'bold': pick(BOLD_VALS),
            'italic': pick(ITALIC_VALS), 'align': pick(ALIGNS),
        },
        'headings': [
            {'level':i+1, 'cn_font':pick(CN_FONTS), 'size_cn':pick(SIZES), 'bold':pick(BOLD_VALS)}
            for i in range(4)
        ],
        'fig_caption': {'cn_font': pick(CN_FONTS), 'size_cn': pick(SIZES)},
        'tbl_caption': {'cn_font': pick(CN_FONTS), 'size_cn': pick(SIZES)},
    }
    return cfg

BID_CONTENT = """第一章 总体概述

本公司郑重承诺，将按照招标文件要求完成本次投标项目的全部工作。我们具备丰富的行业经验，拥有专业的技术团队和完善的质量管理体系。

第二章 技术方案

2.1 系统架构设计

本方案采用分层架构设计，确保系统的可扩展性、可靠性和可维护性。所有模块均经过严格测试，满足国家信息安全等级保护要求。

2.2 数据安全机制

数据加密传输采用国密算法SM2/SM3/SM4，确保数据传输和存储的绝对安全。

2.3 性能指标

- 系统响应时间≤200ms
- 并发用户数≥10000
- 数据可用性≥99.99%

第三章 项目管理方案

3.1 组织管理

成立专门的项目管理团队，设项目经理1名、技术负责人2名、开发人员8名、测试人员3名。

3.2 进度计划

项目总工期为180个日历日，分为需求分析、系统设计、开发实现、测试验收四个阶段。

3.3 质量保证

严格执行ISO9001质量管理体系，所有交付物须经三级审核后方可提交。

第四章 售后服务方案

公司提供终身免费技术支持，7×24小时响应，4小时内到达现场处理问题。定期提供系统巡检和健康评估报告。

第五章 公司简介

本公司成立于2010年，注册资本5000万元，累计服务政府及企业客户超过200家，拥有多项自主知识产权和专利证书。"""

def build_doc(cfg, title):
    html_content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
</Types>'''

    rels_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>'''

    app_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
<TotalTime>0</TotalTime>
</Properties>'''

    core_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:title>{title}</dc:title>
<dc:subject>投标文件</dc:subject>
</cp:coreProperties>'''

    # Build body paragraphs
    para_xml_parts = []
    paragraphs = BID_CONTENT.strip().split('\n\n')
    body = cfg['body']

    for para in paragraphs:
        trimmed = para.strip()
        if not trimmed:
            continue

        pPr = ''
        rpr_body = ''

        # Heading detection
        is_h1 = bool(__import__('re').match(r'^[一二三四五六七八九十]+[章]', trimmed))
        is_h2 = bool(__import__('re').match(r'^\d+[、．. ]', trimmed)) and paragraphs and __import__('re').match(r'^[一二三四五][章]', paragraphs[0])

        if is_h1:
            pPr += '<w:pPr><w:spacing w:before="360" w:after="120"/>'
            rpr_body = f'<w:bcs/><w:sz w:val="32"/>'
        elif is_h2:
            pPr += '<w:pPr><w:spacing w:before="180" w:after="60"/>'
            rpr_body = f'<w:bcs/><w:sz w:val="28"/>'
        else:
            size_val = sz_twip(body['size_cn'])
            pPr += f'<w:pPr><w:spacing w:line="280" w:lineRule="auto"/>'
            rpr_body = f'<w:sz w:val="{size_val}">'
            if body['bold']: rpr_body += '<w:b/>'
            if body['italic']: rpr_body += '<w:i/>'

        align_map = {'LEFT':'left','CENTER':'center','RIGHT':'right','JUSTIFY':'both'}
        align = align_map.get(body['align'], 'left')
        pPr += f'<w:jc w:val="{align}"/>'
        pPr += '</w:pPr>'

        # Build runs with font info
        runs_xml = ''
        lines = trimmed.split('\n')
        for line in lines:
            has_cjk = any('\u4e00' <= c <= '\u9fff' for c in line)
            font_tag = f'w:eastAsia="{body["cn_font"]}"' if has_cjk else f'w:hAnsi="{body["en_font"]}"'
            runs_xml += (
                f'<w:r><w:rPr><w:rFonts {font_tag}/>{rpr_body if is_h1 or is_h2 else ""}'
                f'</w:rPr><w:t xml:space="preserve">{_esc(line)}</w:t></w:r>'
            )

        para_xml_parts.append(f'<w:p w:rsidR="00A1B2C3" w:rsidP="00A1B2C3">{pPr}{runs_xml}</w:p>')

    document_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
{"".join(para_xml_parts)}
</w:document>'''

    settings_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:pgSz w:w="12240" w:h="15840"/>
</w:settings>'''

    styles_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Normal">
    <w:name w:val="Normal"/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:keepNext/><w:keepLines/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="32"/></w:rPr>
  </w:style>
</w:styles>'''

    files = {
        '[Content_Types].xml': html_content_types,
        '_rels/.rels': rels_xml,
        'docProps/app.xml': app_xml,
        'docProps/core.xml': core_xml,
        'word/document.xml': document_xml,
        'word/settings.xml': settings_xml,
        'word/styles.xml': styles_xml,
    }

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
        for name, content in files.items():
            zf.writestr(name, content.encode('utf-8'))

    return buf.getvalue()

def _esc(s):
    return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('"','&quot;')

if __name__ == '__main__':
    os.makedirs('docs', exist_ok=True)

    # Before: minimal/default config
    print('=== 文版猩 — 生成排版示例文档 ===\n')
    before_cfg = {
        'page':{'top_cm':2.54,'bottom_cm':2.54,'left_cm':3.17,'right_cm':3.17},
        'body':{'cn_font':'宋体','en_font':'Times New Roman','size_cn':'小四','bold':False,'italic':False,'align':'JUSTIFY'},
        'headings':[{'level':1,'cn_font':'黑体','size_cn':'三号','bold':True},
                    {'level':2,'cn_font':'黑体','size_cn':'四号','bold':True},
                    {'level':3,'cn_font':'楷体','size_cn':'小四','bold':False},
                    {'level':4,'cn_font':'仿宋','size_cn':'小四','bold':False}],
        'fig_caption':{'cn_font':'宋体','size_cn':'五号'},
        'tbl_caption':{'cn_font':'宋体','size_cn':'五号'},
    }

    # After: randomized config
    after_cfg = make_config(1)

    before_data = build_doc(before_cfg, '投标文件 — 排版前原始文档')
    after_data = build_doc(after_cfg, '投标文件 — 排版后规范文档')

    with open('docs/before-formatting.docx', 'wb') as f: f.write(before_data)
    print(f'✓ 生成: docs/before-formatting.docx ({len(before_data):,} bytes)')

    with open('docs/after-formatting.docx', 'wb') as f: f.write(after_data)
    print(f'✓ 生成: docs/after-formatting.docx ({len(after_data):,} bytes)\n')

    print('排版后随机配置参数:')
    print(json.dumps(after_cfg, ensure_ascii=False, indent=2))
