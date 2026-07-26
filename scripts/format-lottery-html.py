#!/usr/bin/env python3
"""
Randomly modify the lottery HTML file and format it as DOCX using bid-typesetting parameters.
"""
import random, json, zipfile, io, os, re
from datetime import datetime

random.seed(42)

# --- Read the HTML input ---
HTML_INPUT = '''<div data-v-9b48b94e="" class="main-inner theme-ssq"><!-- 左栏 40%：选号 + 参数 --><div data-v-9b48b94e="" class="layout-col layout-col--left"><!-- 红佛女 --><div data-v-9b48b94e="" class="inline-section"><div data-v-a01018f6="" data-v-9b48b94e="" class="wuxing-grid"><div data-v-a01018f6="" class="wuxing-row"><div data-v-a01018f6="" class="wuxing-row-label" style="color: rgb(16, 185, 129);">木</div><div data-v-a01018f6="" class="wuxing-row-numbers"><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(16, 185, 129, 0.094); border-color: rgba(16, 185, 129, 0.25); color: rgb(16, 185, 129);">01</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(16, 185, 129, 0.094); border-color: rgba(16, 185, 129, 0.25); color: rgb(16, 185, 129);">02</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(16, 185, 129, 0.094); border-color: rgba(16, 185, 129, 0.25); color: rgb(16, 185, 129);">03</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(16, 185, 129, 0.094); border-color: rgba(16, 185, 129, 0.25); color: rgb(16, 185, 129);">04</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(16, 185, 129, 0.094); border-color: rgba(16, 185, 129, 0.25); color: rgb(16, 185, 129);">05</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(16, 185, 129, 0.094); border-color: rgba(16, 185, 129, 0.25); color: rgb(16, 185, 129);">06</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(16, 185, 129, 0.094); border-color: rgba(16, 185, 129, 0.25); color: rgb(16, 185, 129);">07</button></div></div><div data-v-a01018f6="" class="wuxing-row"><div data-v-a01018f6="" class="wuxing-row-label" style="color: rgb(239, 68, 68);">火</div><div data-v-a01018f6="" class="wuxing-row-numbers"><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(239, 68, 68, 0.094); border-color: rgba(239, 68, 68, 0.25); color: rgb(239, 68, 68);">08</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(239, 68, 68, 0.094); border-color: rgba(239, 68, 68, 0.25); color: rgb(239, 68, 68);">09</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(239, 68, 68, 0.094); border-color: rgba(239, 68, 68, 0.25); color: rgb(239, 68, 68);">10</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(239, 68, 68, 0.094); border-color: rgba(239, 68, 68, 0.25); color: rgb(239, 68, 68);">11</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(239, 68, 68, 0.094); border-color: rgba(239, 68, 68, 0.25); color: rgb(239, 68, 68);">12</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(239, 68, 68, 0.094); border-color: rgba(239, 68, 68, 0.25); color: rgb(239, 68, 68);">13</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(239, 68, 68, 0.094); border-color: rgba(239, 68, 68, 0.25); color: rgb(239, 68, 68);">14</button></div></div><div data-v-a01018f6="" class="wuxing-row"><div data-v-a01018f6="" class="wuxing-row-label" style="color: rgb(139, 92, 246);">土</div><div data-v-a01018f6="" class="wuxing-row-numbers"><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(139, 92, 246, 0.094); border-color: rgba(139, 92, 246, 0.25); color: rgb(139, 92, 246);">15</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(139, 92, 246, 0.094); border-color: rgba(139, 92, 246, 0.25); color: rgb(139, 92, 246);">16</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(139, 92, 246, 0.094); border-color: rgba(139, 92, 246, 0.25); color: rgb(139, 92, 246);">17</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(139, 92, 246, 0.094); border-color: rgba(139, 92, 246, 0.25); color: rgb(139, 92, 246);">18</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(139, 92, 246, 0.094); border-color: rgba(139, 92, 246, 0.25); color: rgb(139, 92, 246);">19</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(139, 92, 246, 0.094); border-color: rgba(139, 92, 246, 0.25); color: rgb(139, 92, 246);">20</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(139, 92, 246, 0.094); border-color: rgba(139, 92, 246, 0.25); color: rgb(139, 92, 246);">21</button></div></div><div data-v-a01018f6="" class="wuxing-row"><div data-v-a01018f6="" class="wuxing-row-label" style="color: rgb(245, 158, 11);">金</div><div data-v-a01018f6="" class="wuxing-row-numbers"><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(245, 158, 11, 0.094); border-color: rgba(245, 158, 11, 0.25); color: rgb(245, 158, 11);">22</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(245, 158, 11, 0.094); border-color: rgba(245, 158, 11, 0.25); color: rgb(245, 158, 11);">23</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(245, 158, 11, 0.094); border-color: rgba(245, 158, 11, 0.25); color: rgb(245, 158, 11);">24</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(245, 158, 11, 0.094); border-color: rgba(245, 158, 11, 0.25); color: rgb(245, 158, 11);">25</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(245, 158, 11, 0.094); border-color: rgba(245, 158, 11, 0.25); color: rgb(245, 158, 11);">26</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(245, 158, 11, 0.094); border-color: rgba(245, 158, 11, 0.25); color: rgb(245, 158, 11);">27</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(245, 158, 11, 0.094); border-color: rgba(245, 158, 11, 0.25); color: rgb(245, 158, 11);">28</button></div></div><div data-v-a01018f6="" class="wuxing-row"><div data-v-a01018f6="" class="wuxing-row-label" style="color: rgb(59, 130, 246);">水</div><div data-v-a01018f6="" class="wuxing-row-numbers"><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">29</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">30</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">31</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">32</button><button data-v-a01018f6="" class="wuxing-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">33</button></div></div></div></div></div></div><!-- 蓝佛寺 --><div data-v-9b48b94e="" class="inline-section"><div data-v-73729326="" data-v-9b48b94e="" class="bz-grid"><div data-v-73729326="" class="bz-row"><div data-v-73729326="" class="bz-row-label" style="color: rgb(59, 130, 246);">双</div><div data-v-73729326="" class="bz-row-numbers"><button data-v-73729326="" class="bz-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">01</button><button data-v-73729326="" class="bz-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">02</button><button data-v-73729326="" class="bz-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">03</button><button data-v-73729326="" class="bz-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">04</button><button data-v-73729326="" class="bz-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">05</button><button data-v-73729326="" class="bz-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">06</button></div></div><div data-v-73729326="" class="bz-row"><div data-v-73729326="" class="bz-row-label" style="color: rgb(59, 130, 246);">色</div><div data-v-73729326="" class="bz-row-numbers"><button data-v-73729326="" class="bz-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">07</button><button data-v-73729326="" class="bz-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">08</button><button data-v-73729326="" class="bz-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">09</button><button data-v-73729326="" class="bz-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">10</button><button data-v-73729326="" class="bz-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">11</button><button data-v-73729326="" class="bz-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">12</button></div></div><div data-v-73729326="" class="bz-row"><div data-v-73729326="" class="bz-row-label" style="color: rgb(59, 130, 246);">球</div><div data-v-73729326="" class="bz-row-numbers"><button data-v-73729326="" class="bz-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">13</button><button data-v-73729326="" class="bz-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">14</button><button data-v-73729326="" class="bz-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">15</button><button data-v-73729326="" class="bz-cell" style="background: rgba(59, 130, 246, 0.094); border-color: rgba(59, 130, 246, 0.25); color: rgb(59, 130, 246);">16</button></div></div></div></div></div>'''

# Extract just the visible text content
text_lines = [
    "双色球选号配置",
    "",
    "第一章 五行选号（红佛女）",
    "",
    "木（01-07）：01、02、03、04、05、06、07",
    "火（08-14）：08、09、10、11、12、13、14",
    "土（15-21）：15、16、17、18、19、20、21",
    "金（22-28）：22、23、24、25、26、27、28",
    "水（29-33）：29、30、31、32、33",
    "",
    "第二章 蓝号选择（蓝佛寺）",
    "",
    "双号区（01-06）",
    "色号区（07-12）",
    "球号区（13-16）",
    "",
    "第三章 运数配置",
    "",
    "红佛女注数：6",
    "蓝佛寺注数：1",
    "总注数：1",
    "",
    "第四章 运式选择",
    "",
    "单式投注",
]

def sz_twip(size):
    m = {'初号':42,'小初':36,'一号':26,'小一':24,'二号':22,'小二':18,'三号':16,'四号':14,'小四':12,'五号':10.5,'小五':9}
    return str(int(m.get(size,12)*2))

def make_random_cfg():
    cn_fonts = ['宋体', '仿宋', '黑体', '楷体']
    en_fonts = ['Times New Roman', 'Arial', 'Calibri']
    sizes = ['初号', '小初', '一号', '小一', '二号', '小二', '三号', '四号', '小四', '五号', '小五']
    
    return {
        'page': {'top_cm': round(random.uniform(2.5, 4.5), 1), 'bottom_cm': round(random.uniform(2.5, 4.0), 1)},
        'body': {'cn_font': random.choice(cn_fonts), 'en_font': random.choice(en_fonts), 'size_cn': random.choice(sizes), 'bold': random.choice([True,False]), 'italic': random.choice([True,False]), 'align': random.choice(['LEFT','CENTER','JUSTIFY'])},
        'headings': [{'level':i+1, 'cn_font':random.choice(cn_fonts), 'size_cn':random.choice(sizes)} for i in range(4)],
    }

cfg = make_random_cfg()
print("=== 随机排版参数 ===")
print(json.dumps(cfg, ensure_ascii=False, indent=2))

body_xml_parts = []
for line in text_lines:
    pPr = f'<w:pPr><w:jc w:val="{cfg["body"]["align"]}"/><w:spacing w:line="280" w:lineRule="auto"/></w:pPr>'
    
    rpr_body = f'<w:sz w:val="{sz_twip(cfg["body"]["size_cn"])}">'
    if cfg['body']['bold']: rpr_body += '<w:b/>'
    if cfg['body']['italic']: rpr_body += '<w:i/>'
    rpr_body += f'<w:rFonts w:eastAsia="{cfg["body"]["cn_font"]}" w:hAnsi="{cfg["body"]["en_font"]}"/>'
    
    escaped = line.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
    body_xml_parts.append(f'<w:p w:rsidR="00A1B2C3"><w:pPr>{pPr}</w:pPr><w:rPr>{rpr_body}</w:rPr><w:t xml:space="preserve">{escaped}</w:t></w:p>')

document_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
{"".join(body_xml_parts)}
</w:document>'''

files = {
    '[Content_Types].xml': '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/></Types>''',
    '_rels/.rels': '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>''',
    'docProps/app.xml': '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><TotalTime>0</TotalTime></Properties>''',
    'docProps/core.xml': '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>双色球选号配置</dc:title></cp:coreProperties>''',
    'word/document.xml': document_xml,
    'word/settings.xml': '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:pgSz w:w="12240" w:h="15840"/></w:settings>''',
    'word/styles.xml': '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:styleId="Normal"><w:name w:val="Normal"/></w:style></w:styles>''',
}

buf = io.BytesIO()
with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
    for name, content in files.items():
        zf.writestr(name, content.encode('utf-8'))

out_path = 'docs/double-color-ball.docx'
with open(out_path, 'wb') as f:
    f.write(buf.getvalue())

print(f"\n✓ 生成: {out_path} ({buf.getvalue().__len__():,} bytes)")
print("排版后文件已包含随机化字体/字号/对齐参数")
