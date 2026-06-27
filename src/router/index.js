import { createRouter, createWebHistory } from 'vue-router'
import Upload from '../views/Upload.vue'
import Editor from '../views/Editor.vue'
import Compare from '../views/Compare.vue'
import Settings from '../views/Settings.vue'

const routes = [
  { path: '/', component: Upload },
  { path: '/editor', component: Editor },
  { path: '/compare', component: Compare },
  { path: '/settings', component: Settings },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
