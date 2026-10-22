import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    vue(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ['@vue-office/docx', 'vue-demi', 'vue', 'vue-router', 'pinia'],
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  // 生产构建产物预览：与开发服务同端口，便于本地以「构建态」联调（秒开）
  preview: {
    host: '127.0.0.1',
    port: 5103,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },

  server: {
    host: '127.0.0.1',
    port: 5103,
    // Wujie 微前端通过 fetch 拉取子应用资源，必须放行跨域
    headers: { 'Access-Control-Allow-Origin': '*' },
    // 预热入口模块，避免首次点击时逐个模块请求造成长时间白屏
    warmup: {
      clientFiles: ['src/main.js'],
    },
  },
})
