import { createRouter, createWebHistory } from 'vue-router'
import Upload from '@/views/Upload.vue'
import Editor from '@/views/Editor.vue'
import Compare from '@/views/Compare.vue'
import Template from '@/views/Template.vue'
import SettingsView from '@/views/Settings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Upload },
    { path: '/editor', component: Editor },
    { path: '/compare', component: Compare },
    { path: '/template', component: Template },
    { path: '/settings', component: SettingsView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
