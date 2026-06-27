export function useDocumentExport() {
  async function exportFormattedDoc(originalFile, formatParams) {
    const mammoth = await import('mammoth')
    const { Document, Packer, Paragraph, TextRun, AlignmentType, convertInchesToTwip, PageOrientation, HeadingLevel, Header, Footer } = await import('docx')

    const buf = await originalFile.arrayBuffer()
    const { value: htmlContent } = await mammoth.convertToHtml({ arrayBuffer: buf })

    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    const paragraphs = Array.from(doc.body.children).filter(el => el.tagName === 'P')

    const fontMap = {
      '宋体': 'SimSun',
      '仿宋': 'FangSong',
      '黑体': 'SimHei',
      '楷体': 'KaiTi',
    }

    const bodyFont = fontMap[formatParams.body.font] || 'FangSong'
    const bodySizeMatch = formatParams.body.fontSize.match(/(\d+)/)
    const bodySize = bodySizeMatch ? parseInt(bodySizeMatch[1]) * 2 : 24
    const lineSpacing = formatParams.body.lineSpacing.includes('28') ? 560 : 400
    const indentFirst = formatParams.body.indentFirst > 0

    const h1Font = fontMap[formatParams.heading.level1.font] || 'SimHei'
    const h1SizeMatch = formatParams.heading.level1.fontSize.match(/(\d+)/)
    const h1Size = h1SizeMatch ? parseInt(h1SizeMatch[1]) * 2 : 32
    const h2Font = fontMap[formatParams.heading.level2.font] || 'KaiTi'
    const h2SizeMatch = formatParams.heading.level2.fontSize.match(/(\d+)/)
    const h2Size = h2SizeMatch ? parseInt(h2SizeMatch[1]) * 2 : 28
    const h3Font = fontMap[formatParams.heading.level3.font] || 'FangSong'
    const h3SizeMatch = formatParams.heading.level3.fontSize.match(/(\d+)/)
    const h3Size = h3SizeMatch ? parseInt(h3SizeMatch[1]) * 2 : 24

    const headingPatterns = [
      { prefix: /^第[一二三四五六七八九十]+[、．. ]/, level: HeadingLevel.HEADING_1, font: h1Font, size: h1Size },
      { prefix: /^（[一二三四五六七八九十]+）/, level: HeadingLevel.HEADING_2, font: h2Font, size: h2Size },
      { prefix: /^\d+[、．. ]/, level: HeadingLevel.HEADING_3, font: h3Font, size: h3Size },
      { prefix: /^[一二三四五六七八九十]+[、．. ]/, level: HeadingLevel.HEADING_1, font: h1Font, size: h1Size },
    ]

    function detectHeading(text) {
      for (const p of headingPatterns) {
        if (p.prefix.test(text)) return p
      }
      return null
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
                  font: { name: heading.font, eastAsia: heading.font },
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
                  font: { name: bodyFont, eastAsia: bodyFont },
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
                  font: { name: heading.font, eastAsia: heading.font },
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
                  font: { name: bodyFont, eastAsia: bodyFont },
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
              font: bodyFont,
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
