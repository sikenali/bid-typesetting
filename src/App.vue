<script setup>
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="min-h-screen bg-parchment font-songti text-ink-black">
    <Navbar />
    <main class="pt-16">
      <router-view />
    </main>
  </div>
</template>
