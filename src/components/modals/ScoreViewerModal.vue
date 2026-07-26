<template>
  <div v-if="sheet" class="fixed inset-0 z-[999] flex items-center justify-center p-2 md:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in">
    <div class="glass-panel w-full max-w-5xl h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden relative text-left">
      
      <!-- Top Header -->
      <div class="px-6 py-4 bg-[#12151e] border-b border-white/10 flex justify-between items-center shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#F5C518]/10 text-[#F5C518] flex items-center justify-center font-bold">
            <i class="fa-solid fa-file-pdf text-xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-white text-base md:text-lg truncate max-w-xs md:max-w-md">{{ sheet.title }}</h3>
            <p class="text-xs text-[#F5C518] font-bold uppercase tracking-wider">{{ sheet.instrument }} Part</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <a :href="sheet.file_path" target="_blank" download class="px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2">
            <i class="fa-solid fa-download"></i> <span class="hidden md:inline">Download PDF</span>
          </a>
          <button @click="$emit('close')" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
      </div>

      <!-- Audio Backing Track Player (If audio_path exists) -->
      <div v-if="sheet.audio_path" class="px-6 py-3 bg-[#1a1e2e] border-b border-white/10 flex items-center gap-4 shrink-0">
        <span class="text-xs font-bold text-[#32d74b] uppercase tracking-wider flex items-center gap-2">
          <i class="fa-solid fa-headphones"></i> Backing Track:
        </span>
        <audio controls :src="sheet.audio_path" class="flex-1 h-8 rounded-lg outline-none"></audio>
      </div>

      <!-- PDF Frame Preview -->
      <div class="flex-1 bg-[#090a0f] relative overflow-hidden flex items-center justify-center">
        <iframe v-if="isPdf" :src="sheet.file_path" class="w-full h-full border-none"></iframe>
        <div v-else class="text-center p-8">
          <i class="fa-solid fa-file-arrow-down text-5xl text-gray-600 mb-4"></i>
          <p class="text-sm text-gray-300 mb-4">This score format cannot be embedded directly in browser frame.</p>
          <a :href="sheet.file_path" target="_blank" class="px-6 py-3 bg-[#F5C518] text-black font-bold rounded-xl text-xs uppercase tracking-wider inline-block">
            Open File in New Tab
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  sheet: Object
});

defineEmits(['close']);

const isPdf = computed(() => {
  if (!props.sheet?.file_path) return false;
  return props.sheet.file_path.toLowerCase().includes('.pdf');
});
</script>
