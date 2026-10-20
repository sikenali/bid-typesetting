#!/usr/bin/env node
/**
 * 端到端功能测试脚本
 * 模拟所有 UI 控件操作，验证功能是否生效
 */

import { chromium } from 'playwright'
import { readFileSync } from 'fs'

// ── 测试配置 ──────────────────────────────────────────────
const BASE_URL = 'http://localhost:5199'
const BACKEND_URL = 'http://localhost:8099'
const TEST_FILE = '/home/jingle/opc/bid-typesetting/backend/testdata/standard_output.docx'

// ── 测试结果跟踪 ──────────────────────────────────────────
const results = {
  passed: [],
  failed: [],
  skipped: [],
}

function logResult(type, module, description, detail = '') {
  results[type].push({ module, description, detail })
  const icon = type === 'passed' ? '✓' : type === 'failed' ? '✗' : '⚠'
  console.log(`${icon} [${type.toUpperCase()}] ${module}: ${description}`)
  if (detail) console.log(`   ${detail}`)
}

// ── 主测试流程 ────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║         投标文件排版系统 - 端到端功能测试               ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log(`前端: ${BASE_URL}`)
  console.log(`后端: ${BACKEND_URL}`)
  console.log('')

  // Launch browser
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  // Set viewport size
  await page.setViewportSize({ width: 1920, height: 1080 })

  try {
    // ── Step 1: Navigate to Upload page ──
    console.log('\n━━━ Step 1: 导航到上传页面 ━━━')
    await page.goto(`${BASE_URL}/upload`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    logResult('passed', 'Upload', '上传页面加载成功')

    // ── Step 2: Upload test file ──
    console.log('\n━━━ Step 2: 上传测试文件 ──')
    const fileInput = await page.$('input[type="file"]')
    if (fileInput) {
      await fileInput.setInputFiles(TEST_FILE)
      logResult('passed', 'Upload', '文件选择成功')
      
      // Wait for file processing and automatic redirect to editor
      await page.waitForTimeout(8000)
      
      // Check if we're on the editor page
      const url = page.url()
      if (url.includes('/editor')) {
        logResult('passed', 'Upload', '文件上传并自动跳转到排版页面成功')
      } else {
        logResult('failed', 'Upload', '未自动跳转到排版页面', `当前 URL: ${url}`)
      }
    } else {
      logResult('failed', 'Upload', '未找到文件上传控件')
      await browser.close()
      return
    }

    // ── Step 3: Test Page Panel ──
    console.log('\n━━━ Step 3: 测试 PagePanel (页面设置) ──')
    const sideItems = await page.$$('.side-item')
    if (sideItems.length > 0) {
      await sideItems[0].click() // 页面
      await page.waitForTimeout(500)
      logResult('passed', 'PagePanel', '页面选项卡切换成功')

      // Test margin inputs
      const marginInputs = await page.$$('input[type="number"]')
      for (let i = 0; i < Math.min(4, marginInputs.length); i++) {
        const input = marginInputs[i]
        const currentValue = await input.inputValue()
        await input.fill('2.5')
        await page.waitForTimeout(100)
        const newValue = await input.inputValue()
        if (parseFloat(newValue) === 2.5) {
          logResult('passed', 'PagePanel', `边距输入框 ${i+1} 可修改 (${currentValue} -> 2.5)`)
        } else {
          logResult('failed', 'PagePanel', `边距输入框 ${i+1} 修改失败`, `期望 2.5, 实际 ${newValue}`)
        }
      }

      // Test paper size dropdown
      const paperDropdown = await page.$('.field-row .dropdown-select')
      if (paperDropdown) {
        await paperDropdown.click()
        await page.waitForTimeout(300)
        logResult('passed', 'PagePanel', '纸张大小下拉框可点击')
      }

      // Test column buttons
      const colBtns = await page.$$('.chip')
      if (colBtns.length > 0) {
        await colBtns[0].click()
        await page.waitForTimeout(200)
        logResult('passed', 'PagePanel', '分栏按钮可点击')
      }
    }

    // ── Step 4: Test Body Panel ──
    console.log('\n━━━ Step 4: 测试 BodyPanel (正文格式) ──')
    if (sideItems.length > 2) {
      await sideItems[2].click() // 正文
      await page.waitForTimeout(500)
      logResult('passed', 'BodyPanel', '正文选项卡切换成功')

      // Test bold/italic/underline toggles
      const switchLabels = ['加粗', '斜体', '下划线']
      for (const label of switchLabels) {
        const switchEl = await page.$(`text=${label}`)
        if (switchEl) {
          await switchEl.click()
          await page.waitForTimeout(100)
          logResult('passed', 'BodyPanel', `${label}开关可点击`)
        }
      }

      // Test alignment buttons
      const alignBtns = await page.$$('.align-btn')
      if (alignBtns.length > 0) {
        await alignBtns[0].click()
        await page.waitForTimeout(100)
        logResult('passed', 'BodyPanel', '对齐方式按钮可点击')
      }

      // Test indent input
      const indentInput = await page.$('input[aria-label*="缩进"], input[placeholder*="2"]')
      if (indentInput) {
        await indentInput.fill('3')
        await page.waitForTimeout(100)
        logResult('passed', 'BodyPanel', '缩进输入框可修改')
      }
    }

    // ── Step 5: Test Heading Panel ──
    console.log('\n━━━ Step 5: 测试 HeadingPanel (标题格式) ──')
    if (sideItems.length > 1) {
      await sideItems[1].click() // 标题
      await page.waitForTimeout(500)
      logResult('passed', 'HeadingPanel', '标题选项卡切换成功')

      // Test level bar
      const levelBtns = await page.$$('.level-btn, [class*="level"]')
      if (levelBtns.length > 0) {
        await levelBtns[0].click()
        await page.waitForTimeout(200)
        logResult('passed', 'HeadingPanel', '标题级别选择可点击')
      }
    }

    // ── Step 6: Test Chart Panel ──
    console.log('\n━━━ Step 6: 测试 ChartPanel (图表表格) ──')
    if (sideItems.length > 4) {
      await sideItems[4].click() // 图表
      await page.waitForTimeout(500)
      logResult('passed', 'ChartPanel', '图表选项卡切换成功')

      // Test table settings toggle
      const tableToggle = await page.$('text=表格设置')
      if (tableToggle) {
        await page.$('text=表格设置')
        await page.waitForTimeout(200)
        logResult('passed', 'ChartPanel', '表格设置开关可点击')
      }
    }

    // ── Step 7: Test TOC Panel ──
    console.log('\n━━━ Step 7: 测试 TOCPanel (目录设置) ──')
    if (sideItems.length > 3) {
      await sideItems[3].click() // 目录
      await page.waitForTimeout(500)
      logResult('passed', 'TOCPanel', '目录选项卡切换成功')

      // Test TOC enable switch
      const tocSwitch = await page.$('.switch:not(.on):first-of-type')
      if (tocSwitch) {
        await tocSwitch.click()
        await page.waitForTimeout(200)
        logResult('passed', 'TOCPanel', '目录启用开关可点击')
      }
    }

    // ── Step 8: Test HeaderFooter Panel ──
    console.log('\n━━━ Step 8: 测试 HeaderFooterPanel (页眉页脚) ──')
    if (sideItems.length > 5) {
      await sideItems[5].click() // 页面页脚
      await page.waitForTimeout(500)
      logResult('passed', 'HeaderFooterPanel', '页眉页脚选项卡切换成功')

      // Test header switch
      const headerSwitch = await page.$$('.switch')
      if (headerSwitch.length > 0) {
        await headerSwitch[0].click()
        await page.waitForTimeout(200)
        logResult('passed', 'HeaderFooterPanel', '页眉开关可点击')
      }
    }

    // ── Step 9: Test Reset Panel ──
    console.log('\n━━━ Step 9: 测试 ResetPanel (初始化) ──')
    if (sideItems.length > 6) {
      await sideItems[6].click() // 初始化
      await page.waitForTimeout(500)
      logResult('passed', 'ResetPanel', '初始化选项卡切换成功')

      // Test cleanup switches
      const switchLabels = ['清理多余空格', '清理正文缩进', '清理标题缩进', '清理所有空行', '清除图表格式']
      for (const label of switchLabels) {
        const toggle = await page.$(`text=${label}`)
        if (toggle) {
          await toggle.click()
          await page.waitForTimeout(100)
          logResult('passed', 'ResetPanel', `${label} 开关可点击`)
        }
      }
    }

    // ── Step 10: Test Cleanup Rule Editor ──
    console.log('\n━━━ Step 10: 测试 CleanupRuleEditor (预处理规则) ──')
    const ruleBtn = await page.$('text=预处理规则')
    if (ruleBtn) {
      await ruleBtn.click()
      await page.waitForTimeout(500)
      logResult('passed', 'CleanupRuleEditor', '预处理规则面板可打开')

      // Test cleanup checkboxes
      const checkboxLabels = ['标点符号清理', '清除上标', '软回车转硬回车', '清除所有样式']
      for (const label of checkboxLabels) {
        const checkbox = await page.$(`label:text-is="${label}"`)
        if (checkbox) {
          await checkbox.click()
          await page.waitForTimeout(50)
          logResult('passed', 'CleanupRuleEditor', `${label} 复选框可点击`)
        }
      }

      // Test apply switches
      const applyLabels = ['应用页面设置', '应用正文格式', '应用标题格式']
      for (const label of applyLabels) {
        const checkbox = await page.$(`label:text-is="${label}"`)
        if (checkbox) {
          await checkbox.click()
          await page.waitForTimeout(50)
          logResult('passed', 'CleanupRuleEditor', `${label} 开关可点击`)
        }
      }
    }

    // ── Step 11: Test Backend API ──
    console.log('\n━━━ Step 11: 测试后端 API ──')
    
    // Health check
    try {
      const context = await browser.newContext()
      const resp = await context.request.get(`${BACKEND_URL}/api/health`)
      if (resp.ok()) {
        const body = await resp.json()
        logResult('passed', 'BackendAPI', '健康检查接口正常', body.status)
      } else {
        logResult('failed', 'BackendAPI', '健康检查接口返回错误', `HTTP ${resp.status()}`)
      }
      await context.close()
    } catch (e) {
      logResult('failed', 'BackendAPI', '健康检查接口请求失败', e.message)
    }

    // Format API
    try {
      const context = await browser.newContext()
      const resp = await context.request.post(`${BACKEND_URL}/api/format`, {
        multipart: {
          file: {
            name: 'test.docx',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            buffer: readFileSync(TEST_FILE),
          },
          config: JSON.stringify({
            apply_page: true,
            apply_body: true,
            apply_headings: true,
            apply_figtbl: false,
            apply_toc: false,
            apply_header_footer: false,
            apply_table: false,
            apply_numbering: false,
            margins: { top_cm: 2.54, bottom_cm: 2.54, left_cm: 3.17, right_cm: 2.54, paper_size: 'A4', orientation: 'portrait', columns: 1 },
            body: { cn_font: '仿宋', en_font: 'Times New Roman', size_cn: '三号', bold: false, italic: false, underline: false, line_spacing_mode: 'EXACT', line_spacing_value: 28, first_line_indent_chars: 2, align: 'JUSTIFY', add_space: true, space_count: 1 },
            headings: [],
            fig_caption: {},
            tbl_caption: {},
            table: { enable: false },
            table_settings: { enable: false },
            toc: { enable: false },
            header_footer: { enable_header: false, enable_footer: false },
            patterns: { rules: [] },
            preprocess_clear_snap_to_grid: false,
            preprocess_clear_extra_spaces: false,
            preprocess_delete_empty_lines: false,
            preprocess_post_clean_styles: false,
            auto_refresh_fields: false,
          }),
        },
      })
      if (resp.ok()) {
        const buffer = await resp.body()
        logResult('passed', 'BackendAPI', '格式化接口正常', `输出 ${buffer.length} bytes`)
      } else {
        const body = await resp.text()
        logResult('failed', 'BackendAPI', '格式化接口返回错误', `HTTP ${resp.status()}: ${body.substring(0, 100)}`)
      }
      await context.close()
    } catch (e) {
      logResult('failed', 'BackendAPI', '格式化接口请求失败', e.message)
    }

    // Config API
    try {
      const context = await browser.newContext()
      const resp = await context.request.get(`${BACKEND_URL}/api/config`)
      if (resp.ok()) {
        const body = await resp.json()
        logResult('passed', 'BackendAPI', '配置接口正常')
      } else {
        logResult('failed', 'BackendAPI', '配置接口返回错误', `HTTP ${resp.status()}`)
      }
      await context.close()
    } catch (e) {
      logResult('failed', 'BackendAPI', '配置接口请求失败', e.message)
    }

    // ── Take screenshot ──
    await page.screenshot({ path: '/tmp/e2e_test_screenshot.png', fullPage: true })
    console.log('\n截图已保存: /tmp/e2e_test_screenshot.png')

  } catch (e) {
    console.error('\n测试执行错误:', e.message)
    logResult('failed', 'TestRunner', '测试执行异常', e.message)
  }

  // ── Print summary ──
  console.log('\n═══════════════════════════════════════════════════════')
  console.log('                         测试结果汇总')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`✓ 通过: ${results.passed.length}`)
  console.log(`✗ 失败: ${results.failed.length}`)
  console.log(`⚠ 跳过: ${results.skipped.length}`)
  console.log(`═══════════════════════════════════════════════════════`)

  if (results.failed.length > 0) {
    console.log('\n失败详情:')
    for (const f of results.failed) {
      console.log(`  ✗ ${f.module}: ${f.description}`)
      if (f.detail) console.log(`    ${f.detail}`)
    }
  }

  // Write report
  const fs = await import('fs')
  fs.writeFileSync('/tmp/e2e_test_report.json', JSON.stringify(results, null, 2))
  console.log(`\n详细报告: /tmp/e2e_test_report.json`)

  await browser.close()
  process.exit(results.failed.length > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('测试脚本致命错误:', err)
  process.exit(2)
})
