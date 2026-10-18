<template>
  <div class="app-shell" :class="{ 'is-sidebar': isSidebar }">
    <SideNav v-if="isSidebar" />
    <main class="app-main">
      <router-view />
    </main>
    <ToastContainer />
    <ConfirmHost />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import ToastContainer from '@/components/ToastContainer.vue'
import ConfirmHost from '@/components/ConfirmHost.vue'
import SideNav from '@/components/layout/SideNav.vue'

const themeStore = useThemeStore()
const isSidebar = computed(() => themeStore.layout === 'sidebar')
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-main);
}

.app-shell.is-sidebar {
  flex-direction: row;
}

.app-main {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
