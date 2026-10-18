import { createRouter, createWebHistory } from 'vue-router'
import Upload from '@/views/Upload.vue'
import Editor from '@/views/Editor.vue'
import Compare from '@/views/Compare.vue'
import SettingsView from '@/views/Settings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Upload },
    { path: '/editor', component: Editor },
    { path: '/compare', component: Compare },
    { path: '/settings', component: SettingsView },
    { path: '/template', redirect: { path: '/settings', query: { tab: 'template' } } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
