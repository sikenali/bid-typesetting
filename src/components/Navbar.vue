<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { RiFileTextLine, RiBookmark3Line, RiSettings3Line } from '@remixicon/vue'
import { useDocument } from '../composables/useDocument'

const router = useRouter()
const { currentFile } = useDocument()
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 h-16 bg-parchment flex items-center justify-between px-8 z-50">
    <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
      <div class="w-11 h-11 bg-cinnabar rounded-lg flex items-center justify-center">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" class="remixicon">
          <path d="M15.4565 9.67503L15.3144 9.53297C14.6661 8.90796 13.8549 8.43369 12.9235 8.18412C10.0168 7.40527 7.22541 9.05273 6.43185 12.0143C6.38901 12.1742 6.36574 12.3537 6.3285 12.8051C6.17423 14.6752 5.73449 16.0697 4.5286 17.4842C6.78847 18.3727 9.46572 18.9986 11.5016 18.9986C13.9702 18.9986 16.1644 17.3394 16.8126 14.9202C17.3306 12.9869 16.7513 11.0181 15.4565 9.67503ZM13.2886 6.21301L18.2278 2.37142C18.6259 2.0618 19.1922 2.09706 19.5488 2.45367L22.543 5.44787C22.8997 5.80448 22.9349 6.37082 22.6253 6.76891L18.7847 11.7068C19.0778 12.8951 19.0836 14.1721 18.7444 15.4379C17.8463 18.7897 14.8142 20.9986 11.5016 20.9986C8 20.9986 3.5 19.4967 1 17.9967C4.97978 14.9967 4.04722 13.1865 4.5 11.4967C5.55843 7.54658 9.34224 5.23935 13.2886 6.21301ZM16.7015 8.09161C16.7673 8.15506 16.8319 8.21964 16.8952 8.28533L18.0297 9.41984L20.5046 6.23786L18.7589 4.4921L15.5769 6.96698L16.7015 8.09161Z"/>
        </svg>
      </div>
      <div class="flex flex-col">
        <span class="text-lg font-bold text-brown-dark">墨墨梧文</span>
        <span class="text-xs text-brown-muted">Document Typesetting</span>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <button
        @click="router.push('/template')"
        class="group flex items-center gap-2 w-10 hover:w-[90px] h-10 bg-cream-dark hover:bg-cinnabar border border-tan-border hover:border-transparent rounded-lg transition-all duration-200 overflow-hidden"
      >
        <div class="flex items-center justify-center w-10 h-10 shrink-0">
          <RiBookmark3Line size="18" class="text-brown-muted group-hover:text-white" />
        </div>
        <span class="text-[14px] font-medium text-brown group-hover:text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200">模板</span>
      </button>

      <button
        @click="router.push('/settings')"
        class="group flex items-center gap-2 w-10 hover:w-[90px] h-10 bg-cream-dark hover:bg-cinnabar border border-tan-border hover:border-transparent rounded-lg transition-all duration-200 overflow-hidden"
      >
        <div class="flex items-center justify-center w-10 h-10 shrink-0">
          <RiSettings3Line size="20" class="text-brown-muted group-hover:text-white" />
        </div>
        <span class="text-[14px] font-medium text-brown group-hover:text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200">设置</span>
      </button>
    </div>
    <div class="absolute bottom-0 left-0 right-0 h-[2px] bg-tan-dark rounded-[1px]"></div>
  </nav>
</template>
