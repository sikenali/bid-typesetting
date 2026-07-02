<script setup>
import { useSettings } from './composables/useSettings'
import Navbar from './components/Navbar.vue'
import ToastContainer from './components/ToastContainer.vue'

const { currentThemeClasses } = useSettings()
</script>

<template>
  <div :class="[currentThemeClasses.bg, currentThemeClasses.text, 'min-h-screen', 'font-songti']">
    <Navbar />
    <main id="main-content" :class="currentThemeClasses.bg">
      <router-view />
    </main>
    <ToastContainer />
  </div>
</template>
