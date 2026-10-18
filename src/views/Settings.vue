<template>
  <MainApp>
    <SettingsModal v-model:visible="show" />
  </MainApp>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MainApp from '@/components/layout/MainApp.vue'
import SettingsModal from '@/components/layout/SettingsModal.vue'

const show = ref(true)
const router = useRouter()

watch(show, (v) => {
  if (!v) router.push('/')
})
</script>
