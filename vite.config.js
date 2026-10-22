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
    include: ['@vue-office/docx', 'vue-demi'],
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: {
    host: '127.0.0.1',
    port: 5103,
    // Wujie 微前端通过 fetch 拉取子应用资源，必须放行跨域
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
})
