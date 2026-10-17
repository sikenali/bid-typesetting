<template>
  <div
    ref="rootRef"
    class="upload-card"
    :class="{ 'is-dragging': dragging, 'is-locked': state === 'processing' }"
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="handleCardClick"
  >
    <input
      ref="inputRef"
      type="file"
      class="file-input"
      :accept="accept"
      :disabled="state === 'processing' || disabled"
      @click.stop
      @change="handleFileChange"
    />

    <button
      v-if="state !== 'empty'"
      class="replace-fab"
      :disabled="state === 'processing' || disabled"
      title="替换文件"
      aria-label="替换文件"
      @click.stop="handleReplace"
    >
      <span class="replace-fab-icon">
        <RiRefreshLine size="18" />
      </span>
    </button>

    <div v-if="state === 'empty'" class="empty-state">
      <div class="empty-icon">
        <RiUploadCloud2Line size="36" />
      </div>
      <div class="empty-title">拖拽文件至此处，或点击选择</div>
      <div class="empty-hint">支持 docx / xlsx / csv / pdf / html / md / txt，单文件不超过 50MB</div>
      <div class="fmt-row">
        <span class="fmt" style="background: var(--color-file-word)">W</span>
        <span class="fmt" style="background: var(--color-file-excel)">X</span>
        <span class="fmt" style="background: var(--color-file-pdf)">P</span>
        <span class="fmt" style="background: var(--color-file-pdf)">PDF</span>
        <span class="fmt" style="background: var(--color-file-md)">MD</span>
        <span class="fmt" style="background: var(--color-file-txt)">TXT</span>
      </div>
    </div>

    <div v-else class="file-state">
      <div class="file-icon" :style="{ background: fileColor }">
        {{ fileLetter }}
      </div>
      <div class="file-name" :title="file && file.name">{{ file && file.name }}</div>
      <div class="file-meta-row">
        <span class="file-meta">{{ sizeText }} · {{ statusText }}</span>
        <button
          class="swap-btn"
          :disabled="state === 'processing' || disabled"
          @click.stop="handleReplace"
        >
          <RiFileSwapLine size="16" />
          <span>替换文件</span>
        </button>
      </div>

      <div class="panel">
        <StepStrip
          :steps="steps"
          :current="stepCurrent"
          :done="state === 'done'"
        />
        <button class="cta-btn" :class="{ 'is-processing': state === 'processing' }" @click.stop="handleCtaClick">
          <RiMagicLine size="20" />
          <span>{{ ctaText }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import StepStrip from './StepStrip.vue'
import { ElMessage } from '@/utils/toast'

const props = defineProps({
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['success', 'replace'])

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
const ACCEPT = '.docx,.xlsx,.csv,.pdf,.html,.md,.txt,.doc'

const EXT_META = {
  doc:  { letter: 'W', color: 'var(--color-file-word)' },
  docx: { letter: 'W', color: 'var(--color-file-word)' },
  xlsx: { letter: 'X', color: 'var(--color-file-excel)' },
  csv:  { letter: 'X', color: 'var(--color-file-excel)' },
  pdf:  { letter: 'P', color: 'var(--color-file-pdf)' },
  html: { letter: 'H', color: 'var(--color-file-pdf)' },
  md:   { letter: 'M', color: 'var(--color-file-md)' },
  txt:  { letter: 'T', color: 'var(--color-file-txt)' },
}
const FALLBACK_META = { letter: '?', color: 'var(--color-file-txt)' }

const state = ref(STATE_EMPTY)
const stage = ref(1)
const stageProgress = ref(0)
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

const fileMeta = computed(() => EXT_META[extOf(file.value && file.value.name)] || FALLBACK_META)
const fileLetter = computed(() => fileMeta.value.letter)
const fileColor = computed(() => fileMeta.value.color)

const sizeText = computed(() => {
  if (!file.value) return ''
  const kb = file.value.size / 1024
  if (kb < 1024) return kb.toFixed(1) + ' KB'
  return (kb / 1024).toFixed(1) + ' MB'
})

const statusText = computed(() => {
  if (state.value === STATE_DONE) return '已解析'
  if (state.value === STATE_PROCESSING) {
    const step = steps[stage.value - 1]
    return step ? step.label + '中…' : '解析中…'
  }
  return '待解析'
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
  const ext = extOf(f.name)
  if (ext === 'doc') {
    ElMessage.warning('暂不支持 .doc 格式，请另存为 .docx')
    return
  }
  if (!ALLOWED.includes(ext)) {
    ElMessage.warning('暂不支持 .' + ext + ' 格式')
    return
  }
  if (f.size > MAX_SIZE) {
    ElMessage.warning('文件大小超过 50MB')
    return
  }
  stopAnim()
  file.value = f
  stage.value = 1
  stageProgress.value = 0
  state.value = STATE_PROCESSING
  runStage()
}

function runStage() {
  stageProgress.value = 0
  stageStart = performance.now()
  const duration = 1200 + Math.random() * 800
  const tick = () => {
    if (state.value !== STATE_PROCESSING) return
    const elapsed = performance.now() - stageStart
    const pct = Math.min(100, (elapsed / duration) * 100)
    stageProgress.value = pct
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
  if (state.value === STATE_PROCESSING) return
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
  if (state.value === STATE_PROCESSING) return
  dragging.value = true
}

function handleDragOver(e) {
  e.preventDefault()
  if (state.value === STATE_PROCESSING) return
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
  if (state.value === STATE_PROCESSING) return
  if (props.disabled) return
  const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]
  if (f) selectFile(f)
}

function handleReplace() {
  stopAnim()
  emit('replace')
  file.value = null
  stage.value = 1
  stageProgress.value = 0
  state.value = STATE_EMPTY
}

function handleCtaClick() {
  if (state.value === STATE_DONE && file.value) {
    emit('success', file.value)
  }
}

onBeforeUnmount(() => {
  stopAnim()
})
</script>

<style scoped>
.upload-card {
  position: relative;
  width: min(875px, calc(100vw - 64px));
  min-height: 390px;
  background: var(--color-bg-panel);
  border: 0.7px solid var(--color-border-strong);
  border-radius: 14px;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color var(--transition-base), background-color var(--transition-base);
}

.upload-card.is-dragging {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.upload-card.is-locked {
  pointer-events: none;
  cursor: not-allowed;
}

.file-input {
  display: none;
}

.replace-fab {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border);
  color: var(--color-text-body);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color var(--transition-base), color var(--transition-base);
}

.replace-fab:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.replace-fab-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-slow);
}

.replace-fab:hover:not(:disabled) .replace-fab-icon {
  transform: rotate(120deg);
}

.replace-fab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 9999px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.empty-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.empty-hint {
  font-size: 15px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.fmt-row {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.fmt {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 13px;
  color: #fff;
  font-weight: 500;
  line-height: 1.4;
}

.file-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
}

.file-icon {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
}

.file-name {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-primary);
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  line-height: 1.4;
}

.file-meta-row {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding-top: 4px;
}

.file-meta {
  font-size: 15px;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.swap-btn {
  height: 40px;
  padding: 0 16px;
  background: var(--color-bg-white);
  border: 0.7px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text-body);
  font-size: 15px;
  font-weight: 400;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: border-color var(--transition-base), color var(--transition-base), background-color var(--transition-base);
}

.swap-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.swap-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  padding-top: 16px;
  width: 100%;
}

.cta-btn {
  width: 292px;
  height: 60px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 500;
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
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
