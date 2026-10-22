<template>
  <div class="upload-wrapper">
    <div
      ref="rootRef"
      class="upload-card"
      :class="{ 'is-dragging': dragging, 'has-file': state !== 'empty' }"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="handleCardClick"
    >
      <template v-if="state === 'empty'">
        <div class="upload-icon-wrap">
          <RiUploadCloud2Line class="upload-icon" size="40" />
        </div>
        <p class="upload-hint">点击选择或拖拽文件到此处上传</p>
        <div class="format-row">
          <span class="fmt fmt-w">W</span>
          <span class="fmt fmt-x">X</span>
          <span class="fmt fmt-p">P</span>
          <span class="fmt fmt-pdf">PDF</span>
          <span class="fmt fmt-md">MD</span>
          <span class="fmt fmt-tx">TX</span>
        </div>
      </template>

      <template v-else>
        <UiTip v-if="state !== 'processing'" text="替换文件" placement="left" class="replace-tip">
          <button class="replace-icon" @click.stop="handleReplace">
            <RiRefreshLine size="18" />
          </button>
        </UiTip>
        <div class="file-centered">
          <div class="file-icon" :class="extClass">
            <svg v-if="ext === 'docx' || ext === 'doc'" width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="2" width="22" height="24" rx="2" stroke="currentColor" stroke-width="1.6"/>
              <path d="M8 9h12M8 13h12M8 17h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
            <svg v-else-if="ext === 'xlsx' || ext === 'csv'" width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="2" width="22" height="24" rx="2" stroke="currentColor" stroke-width="1.6"/>
              <path d="M8 9h12M8 13h12M8 17h12M14 7v14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            <svg v-else-if="ext === 'pdf'" width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="2" width="22" height="24" rx="2" stroke="currentColor" stroke-width="1.6"/>
              <path d="M9 10l4 3-4 3V10z" fill="currentColor"/>
              <path d="M17 10l4 3-4 3V10z" fill="currentColor" opacity="0.5"/>
            </svg>
            <svg v-else-if="ext === 'md'" width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="2" width="22" height="24" rx="2" stroke="currentColor" stroke-width="1.6"/>
              <text x="8" y="21" font-family="sans-serif" font-size="11" font-weight="700" fill="currentColor">M</text>
            </svg>
            <svg v-else width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="2" width="22" height="24" rx="2" stroke="currentColor" stroke-width="1.6"/>
              <path d="M9 9h10M9 13h10M9 17h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
          </div>
          <p class="file-name">{{ file && file.name }}</p>
          <p class="file-size">{{ sizeText }}</p>
        </div>
      </template>

      <input
        ref="inputRef"
        type="file"
        class="file-input"
        :accept="ACCEPT"
        :disabled="state === 'processing'"
        @click.stop
        @change="handleFileChange"
      />
    </div>

    <div class="step-area">
      <StepStrip :steps="steps" :current="stepCurrent" :done="state === 'done'" />
    </div>

    <div class="cta-area">
      <button class="cta-btn" :class="{ 'is-processing': state === 'processing' }" @click.stop="handleCtaClick">
        {{ ctaText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import StepStrip from './StepStrip.vue'
import { UiTip } from '@/components/ui'
import { ElMessage } from '@/utils/toast'

const props = defineProps({
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['success', 'replace'])

// 步骤文案按 Calicat 设计稿
const steps = [
  { label: '样式遍历' },
  { label: '样式提取' },
  { label: '样式显示' },
]

const STATE_EMPTY = 'empty'
const STATE_PROCESSING = 'processing'
const STATE_DONE = 'done'

const MAX_SIZE = 50 * 1024 * 1024
const ALLOWED = ['docx', 'xlsx', 'csv', 'pdf', 'html', 'md', 'txt']
const ACCEPT = '.docx,.xlsx,.csv,.pdf,.html,.md,.txt'

const state = ref(STATE_EMPTY)
const stage = ref(1)
const file = ref(null)
const dragging = ref(false)
const rootRef = ref(null)
const inputRef = ref(null)

let rafId = null
let stageStart = 0

function extOf(name) {
  const m = /\.([a-z0-9]+)$/i.exec(name || '')
  return m ? m[1].toLowerCase() : ''
}

function stopAnim() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

const ext = computed(() => extOf(file.value && file.value.name))
const extClass = computed(() => {
  const e = ext.value
  if (e === 'docx' || e === 'doc') return 'fmt-docx'
  if (e === 'xlsx' || e === 'csv') return 'fmt-xlsx'
  if (e === 'pdf' || e === 'html') return 'fmt-pdf'
  if (e === 'md') return 'fmt-md'
  return 'fmt-txt'
})

const sizeText = computed(() => {
  if (!file.value) return ''
  const kb = file.value.size / 1024
  if (kb < 1024) return kb.toFixed(1) + ' KB'
  return (kb / 1024).toFixed(1) + ' MB'
})

const ctaText = computed(() => {
  if (state.value === STATE_PROCESSING) return '解析中…'
  if (state.value === STATE_DONE) return '进入排版'
  return '一键解析'
})

const stepCurrent = computed(() => {
  if (state.value === STATE_DONE) return steps.length
  if (state.value === STATE_PROCESSING) return stage.value
  return 0
})

function selectFile(f) {
  if (!f) return
  const e = extOf(f.name)
  if (e === 'doc') {
    ElMessage.warning('暂不支持 .doc 格式，请另存为 .docx')
    return
  }
  if (!ALLOWED.includes(e)) {
    ElMessage.warning('暂不支持 .' + e + ' 格式')
    return
  }
  if (f.size > MAX_SIZE) {
    ElMessage.warning('文件大小超过 50MB')
    return
  }
  stopAnim()
  file.value = f
  stage.value = 1
  state.value = STATE_PROCESSING
  runStage()
}

function runStage() {
  stageStart = performance.now()
  const duration = 1200 + Math.random() * 800
  const tick = () => {
    if (state.value !== STATE_PROCESSING) return
    const elapsed = performance.now() - stageStart
    const pct = Math.min(100, (elapsed / duration) * 100)
    if (pct < 100) {
      rafId = requestAnimationFrame(tick)
      return
    }
    rafId = null
    if (stage.value < steps.length) {
      stage.value += 1
      runStage()
    } else {
      state.value = STATE_DONE
      emit('success', file.value)
    }
  }
  rafId = requestAnimationFrame(tick)
}

function handleCardClick() {
  if (state.value !== STATE_EMPTY) return
  if (props.disabled) return
  if (inputRef.value) inputRef.value.click()
}

function handleFileChange(e) {
  const f = e.target.files && e.target.files[0]
  if (f) selectFile(f)
  e.target.value = ''
}

function handleDragEnter(e) {
  e.preventDefault()
  if (state.value !== STATE_EMPTY) return
  dragging.value = true
}

function handleDragOver(e) {
  e.preventDefault()
  if (state.value !== STATE_EMPTY) return
  dragging.value = true
}

function handleDragLeave(e) {
  const rt = e.relatedTarget
  if (rt && rootRef.value && rootRef.value.contains(rt)) return
  dragging.value = false
}

function handleDrop(e) {
  e.preventDefault()
  dragging.value = false
  if (state.value !== STATE_EMPTY) return
  if (props.disabled) return
  const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]
  if (f) selectFile(f)
}

function handleReplace() {
  stopAnim()
  emit('replace')
  file.value = null
  stage.value = 1
  state.value = STATE_EMPTY
}

function handleCtaClick() {
  if (state.value === STATE_PROCESSING) return
  if (!file.value) {
    ElMessage.warning('请先上传文件')
    return
  }
  if (state.value === STATE_DONE) {
    emit('success', file.value)
  }
}

onBeforeUnmount(() => {
  stopAnim()
})
</script>

<style scoped>
.upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* 文件卡片（设计图 e88a1549：875×345 / 面板底 / 蓝描边 / r14） */
.upload-card {
  position: relative;
  width: min(875px, calc(100vw - 64px));
  height: 345px;
  flex-shrink: 0;
  background: var(--color-bg-panel);
  border: 0.7px solid var(--color-border-strong);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 40px 32px;
  overflow: hidden;
  transition: border-color 0.2s, background-color 0.2s;
}

.upload-card:not(.has-file) {
  cursor: pointer;
}

.upload-card.is-dragging {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.upload-card.has-file,
.upload-card.is-dragging {
  cursor: default;
}

.file-input {
  display: none;
}

/* 空态（bid-maker 上传组件结构） */
.upload-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.upload-hint {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.2;
  text-align: center;
  font-family: var(--font-family-cn);
}

.format-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.fmt {
  width: 28px;
  height: 28px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}
.fmt-w { background: var(--color-file-word); font-size: 11px; }
.fmt-x { background: var(--color-file-excel); font-size: 11px; }
.fmt-p { background: var(--color-file-pdf); font-size: 11px; }
.fmt-pdf { background: var(--color-file-pdf); font-size: 9px; }
.fmt-md { background: var(--color-file-md); font-size: 9px; }
.fmt-tx { background: var(--color-file-txt); font-size: 9px; }

/* 选中态 */
.replace-tip {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.replace-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 0.7px solid var(--color-border);
  background-color: var(--color-bg-white);
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s, transform 0.2s;
}

.replace-icon:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background-color: var(--color-primary-soft);
  transform: rotate(120deg);
}

.file-centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: center;
}

.file-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}
.file-icon.fmt-docx { background: var(--color-file-word); }
.file-icon.fmt-xlsx { background: var(--color-file-excel); }
.file-icon.fmt-pdf { background: var(--color-file-pdf); }
.file-icon.fmt-md { background: var(--color-file-md); }
.file-icon.fmt-txt { background: var(--color-file-txt); }

.file-name {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.file-size {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.2;
}

/* 步骤条（设计图：卡片下方 40px） */
.step-area {
  padding-top: 40px;
  width: 100%;
  display: flex;
  justify-content: center;
}

/* 一键解析按钮（设计图 292×60 / r10 / 主色） */
.cta-area {
  padding-top: 48px;
}

.cta-btn {
  width: 292px;
  height: 60px;
  background: var(--color-primary);
  color: var(--color-on-primary, #fff);
  border: none;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 500;
  font-family: var(--font-family-cn);
  cursor: pointer;
  transition: opacity var(--transition-base), transform var(--transition-base);
}

.cta-btn:hover:not(.is-processing) {
  opacity: 0.92;
  transform: translateY(-1px);
}

.cta-btn:active:not(.is-processing) {
  transform: translateY(0);
}

.cta-btn.is-processing {
  opacity: 1;
  cursor: pointer;
}
</style>
