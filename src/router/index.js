import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('@/views/Upload.vue') },
    { path: '/editor', component: () => import('@/views/Editor.vue') },
    { path: '/compare', component: () => import('@/views/Compare.vue') },
    { path: '/settings', component: () => import('@/views/Settings.vue') },
    { path: '/template', redirect: { path: '/settings', query: { tab: 'template' } } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
