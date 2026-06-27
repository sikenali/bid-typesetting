<script setup>
import Sidebar from '../components/Sidebar.vue'
import DocumentPreview from '../components/DocumentPreview.vue'
</script>

<template>
  <div class="h-[calc(100vh-4rem)] flex">
    <Sidebar />
    <div class="flex-1 flex flex-col">
      <div class="flex-1 p-4">
        <DocumentPreview />
      </div>
    </div>
    <div class="w-80 bg-white/80 backdrop-blur-sm border-l border-gold/30 p-6 overflow-y-auto">
      <h3 class="font-calligraphy text-xl text-cinnabar mb-6">排版设置</h3>
      <div class="space-y-6">
        <div class="space-y-3">
          <h4 class="font-xiaowei text-sm text-ink-black/70">页面设置</h4>
          <div class="space-y-2">
            <label class="text-sm">纸张大小</label>
            <select class="w-full px-3 py-2 border border-gold/30 rounded-lg bg-parchment/50 font-xiaowei">
              <option>A4</option>
              <option>B5</option>
              <option>16开</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm">页边距</label>
            <select class="w-full px-3 py-2 border border-gold/30 rounded-lg bg-parchment/50 font-xiaowei">
              <option>标准</option>
              <option>窄边距</option>
              <option>宽边距</option>
            </select>
          </div>
        </div>

        <div class="border-t border-gold/20"></div>

        <div class="space-y-3">
          <h4 class="font-xiaowei text-sm text-ink-black/70">正文设置</h4>
          <div class="space-y-2">
            <label class="text-sm">字体</label>
            <select class="w-full px-3 py-2 border border-gold/30 rounded-lg bg-parchment/50 font-xiaowei">
              <option>仿宋_GB2312</option>
              <option>楷体</option>
              <option>宋体</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm">字号</label>
            <select class="w-full px-3 py-2 border border-gold/30 rounded-lg bg-parchment/50 font-xiaowei">
              <option>三号</option>
              <option>小三</option>
              <option>四号</option>
              <option>小四</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm">行间距</label>
            <select class="w-full px-3 py-2 border border-gold/30 rounded-lg bg-parchment/50 font-xiaowei">
              <option>固定值 28磅</option>
              <option>1.5倍</option>
              <option>2倍</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
