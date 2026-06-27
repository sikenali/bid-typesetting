export function useDocumentExport() {
  const fontTable = {
    '宋体': { ascii: 'SimSun', hAnsi: 'SimSun', eastAsia: 'SimSun', cs: 'SimSun' },
    '仿宋': { ascii: 'FangSong', hAnsi: 'FangSong', eastAsia: 'FangSong', cs: 'FangSong' },
    '黑体': { ascii: 'SimHei', hAnsi: 'SimHei', eastAsia: 'SimHei', cs: 'SimHei' },
    '楷体': { ascii: 'KaiTi', hAnsi: 'KaiTi', eastAsia: 'KaiTi', cs: 'KaiTi' },
  }

  const cnFontSizePt = {
    '初号': 42, '小初': 36, '一号': 26, '小一': 24,
    '二号': 22, '小二': 18, '三号': 16, '小三': 15,
    '四号': 14, '小四': 12, '五号': 10.5, '小五': 9,
  }

  function resolveFont(chineseName) {
    return fontTable[chineseName] || fontTable['仿宋']
  }

  function parseFontSize(str) {
    const match = str.match(/(\d+(?:\.\d+)?)/)
    if (match) return Math.round(parseFloat(match[1]) * 2)
    for (const [cn, pt] of Object.entries(cnFontSizePt)) {
      if (str.includes(cn)) return Math.round(pt * 2)
    }
    return 24
  }

  async function exportFormattedDoc(originalFile, formatParams) {
    const mammoth = await import('mammoth')
    const { Document, Packer, Paragraph, TextRun, AlignmentType, convertInchesToTwip, PageOrientation, HeadingLevel } = await import('docx')

    const buf = await originalFile.arrayBuffer()
    const { value: htmlContent } = await mammoth.convertToHtml({ arrayBuffer: buf })

    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    const paragraphs = Array.from(doc.body.children).filter(el => el.tagName === 'P')

    const bodyFontObj = resolveFont(formatParams.body.font)
    const bodySize = parseFontSize(formatParams.body.fontSize)
    const lineSpacing = formatParams.body.lineSpacing.includes('28') ? 560 : 400
    const indentFirst = formatParams.body.indentFirst > 0

    const h1 = {
      fontObj: resolveFont(formatParams.heading.level1.font),
      size: parseFontSize(formatParams.heading.level1.fontSize),
    }
    const h2 = {
      fontObj: resolveFont(formatParams.heading.level2.font),
      size: parseFontSize(formatParams.heading.level2.fontSize),
    }
    const h3 = {
      fontObj: resolveFont(formatParams.heading.level3.font),
      size: parseFontSize(formatParams.heading.level3.fontSize),
    }

    const headingPatterns = [
      { prefix: /^第[一二三四五六七八九十]+[、．. ]/, level: HeadingLevel.HEADING_1, font: h1.fontObj, size: h1.size },
      { prefix: /^（[一二三四五六七八九十]+）/, level: HeadingLevel.HEADING_2, font: h2.fontObj, size: h2.size },
      { prefix: /^\d+[、．. ]/, level: HeadingLevel.HEADING_3, font: h3.fontObj, size: h3.size },
      { prefix: /^[一二三四五六七八九十]+[、．. ]/, level: HeadingLevel.HEADING_1, font: h1.fontObj, size: h1.size },
    ]

    function detectHeading(text) {
      for (const p of headingPatterns) {
        if (p.prefix.test(text)) return p
      }
      return null
    }

    function makeFont(fontObj) {
      return { ascii: fontObj.ascii, hAnsi: fontObj.hAnsi, eastAsia: fontObj.eastAsia, cs: fontObj.cs }
    }

    const pageWidth = convertInchesToTwip(21 / 2.54 * 0.9)
    const pageHeight = convertInchesToTwip(29.7 / 2.54 * 0.9)
    const marginTop = Math.round(formatParams.page.marginTop * 567)
    const marginBottom = Math.round(formatParams.page.marginBottom * 567)
    const marginLeft = Math.round(formatParams.page.marginLeft * 567)
    const marginRight = Math.round(formatParams.page.marginRight * 567)

    const docParagraphs = []

    if (paragraphs.length === 0) {
      const text = doc.body.textContent || ''
      const lines = text.split('\n').filter(l => l.trim())
      for (const line of lines) {
        const heading = detectHeading(line.trim())
        if (heading) {
          docParagraphs.push(
            new Paragraph({
              heading: heading.level,
              spacing: { before: 200, after: 120, line: lineSpacing },
              children: [
                new TextRun({
                  text: line.trim(),
                  font: makeFont(heading.font),
                  size: heading.size,
                  bold: true,
                }),
              ],
            })
          )
        } else {
          docParagraphs.push(
            new Paragraph({
              indent: indentFirst ? { firstLine: 480 } : undefined,
              spacing: { line: lineSpacing },
              children: [
                new TextRun({
                  text: line.trim(),
                  font: makeFont(bodyFontObj),
                  size: bodySize,
                }),
              ],
            })
          )
        }
      }
    } else {
      for (const p of paragraphs) {
        const text = p.textContent?.trim()
        if (!text) {
          docParagraphs.push(new Paragraph({ spacing: { after: 120 } }))
          continue
        }
        const heading = detectHeading(text)
        if (heading) {
          docParagraphs.push(
            new Paragraph({
              heading: heading.level,
              spacing: { before: 200, after: 120, line: lineSpacing },
              children: [
                new TextRun({
                  text,
                  font: makeFont(heading.font),
                  size: heading.size,
                  bold: true,
                }),
              ],
            })
          )
        } else {
          docParagraphs.push(
            new Paragraph({
              indent: indentFirst ? { firstLine: 480 } : undefined,
              spacing: { line: lineSpacing },
              children: [
                new TextRun({
                  text,
                  font: makeFont(bodyFontObj),
                  size: bodySize,
                }),
              ],
            })
          )
        }
      }
    }

    const outputDoc = new Document({
      title: originalFile.name.replace(/\.docx$/i, ''),
      styles: {
        default: {
          document: {
            run: {
              font: bodyFontObj.eastAsia,
              size: bodySize,
            },
          },
        },
      },
      sections: [
        {
          properties: {
            page: {
              size: {
                width: pageWidth,
                height: pageHeight,
                orientation: formatParams.page.orientation === 'landscape' ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
              },
              margin: {
                top: marginTop,
                bottom: marginBottom,
                left: marginLeft,
                right: marginRight,
              },
            },
          },
          children: docParagraphs,
        },
      ],
    })

    const blob = await Packer.toBlob(outputDoc)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = originalFile.name.replace(/\.docx$/i, '') + '_已排版.docx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return { exportFormattedDoc }
}
