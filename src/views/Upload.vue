<template>
  <div class="upload-view">
    <TopNav title="智能化文件排版工具" :show-back="false" @open-settings="showSettings = true" />

    <main class="upload-body">
      <UploadCard @success="handleSuccess" @replace="handleReplace" />
    </main>

    <PageFooter
      @credit-query="showCreditModal = true"
      @bidding-sites="showBiddingModal = true"
    />

    <SettingsModal v-model:visible="showSettings" />
    <CreditQualificationModal v-model:visible="showCreditModal" />
    <BiddingSitesModal v-model:visible="showBiddingModal" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TopNav from '@/components/layout/TopNav.vue'
import PageFooter from '@/components/layout/PageFooter.vue'
import SettingsModal from '@/components/layout/SettingsModal.vue'
import CreditQualificationModal from '@/components/layout/CreditQualificationModal.vue'
import BiddingSitesModal from '@/components/layout/BiddingSitesModal.vue'
import UploadCard from '@/components/upload/UploadCard.vue'
import { useDocument } from '@/composables/useDocument'
import { ElMessage } from '@/utils/toast'

const router = useRouter()
const { setFile, getFile } = useDocument()

const showSettings = ref(false)
const showCreditModal = ref(false)
const showBiddingModal = ref(false)

function handleSuccess(file) {
  if (!file) return
  setFile(file)
  router.push('/editor')
}

function handleReplace() {
  setFile(null)
  ElMessage.info('已清除文件，请重新选择')
}
</script>

<style scoped>
.upload-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-main);
}
.upload-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 32px;
}
</style>
