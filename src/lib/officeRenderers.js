import { defineAsyncComponent } from 'vue'

// 文档预览与编辑器依赖的体积最大的第三方库（pdf.js 含 WASM、SheetJS、
// pptx 渲染器、Word 在线编辑器）全部改这里按需加载：
// 本文件只持有几个 defineAsyncComponent 工厂，不引入任何实现代码，
// 因此不会被打包进主包，首次真正渲染对应组件时才拉取各自的分包。

const lazy = (loader) => defineAsyncComponent(async () => (await loader()).default)

export const VueOfficeDocx = lazy(() => import('./office/docxRenderer'))
export const VueOfficePdf = lazy(() => import('./office/pdfRenderer'))
export const VueOfficeExcel = lazy(() => import('./office/excelRenderer'))
export const VueOfficePptx = lazy(() => import('./office/pptxRenderer'))
export const DocxEditor = lazy(() => import('./office/docxEditor'))
