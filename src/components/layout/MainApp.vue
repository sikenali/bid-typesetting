<template>
  <div class="main-app">
    <slot><router-view /></slot>
  </div>
</template>

<script setup>
</script>

<style scoped>
.main-app {
  min-height: 100vh;
  background-color: var(--color-bg-main);
}
</style>
