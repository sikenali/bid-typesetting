<template>
  <MainApp>
    <SettingsModal :visible="true" />
  </MainApp>
</template>

<script setup>
import MainApp from '@/components/layout/MainApp.vue'
import SettingsModal from '@/components/layout/SettingsModal.vue'
</script>
