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
})
