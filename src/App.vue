<template>
  <div class="app-shell">
    <router-view />
    <ToastContainer />
    <ConfirmHost />
  </div>
</template>

<script setup>
import ToastContainer from '@/components/ToastContainer.vue'
import ConfirmHost from '@/components/ConfirmHost.vue'
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-main);
}
</style>
