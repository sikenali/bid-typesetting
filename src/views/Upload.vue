<template>
  <div class="upload-view">
    <TopNav title="智能标书排版工具" :show-back="false" @open-settings="showSettings = true" />

    <main class="upload-body">
      <div class="upload-hero">
        <h1 class="upload-title">开始您的文档排版之旅</h1>
        <p class="upload-subtitle">上传文档，智能识别排版元素，一键美化您的标书</p>
      </div>

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
  padding: 48px 32px 56px;
  gap: 40px;
}
.upload-hero {
  text-align: center;
}
.upload-title {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-text-primary);
  line-height: 1.25;
}
.upload-subtitle {
  margin-top: 10px;
  font-size: 15px;
  color: var(--color-text-muted);
}
</style>
