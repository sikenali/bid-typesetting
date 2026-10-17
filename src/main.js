import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as RemixIcons from '@remixicon/vue'
import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'
import { BRAND_TITLE } from './constants/brand'
import './assets/global.css'

document.title = BRAND_TITLE

const app = createApp(App)

app.use(createPinia())
app.use(router)

for (const [name, component] of Object.entries(RemixIcons)) {
  app.component(name, component)
}

// 主题：JS 直写 CSS 变量，必须在挂载前完成，避免闪烁
const themeStore = useThemeStore()
themeStore.loadTheme()

app.mount('#app')
