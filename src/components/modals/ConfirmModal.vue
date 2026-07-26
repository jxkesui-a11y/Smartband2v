<template>
  <div v-if="show" class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
    <div class="glass-panel w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl relative text-left border border-white/10">
      
      <!-- Modal Header Icon -->
      <div class="flex items-center gap-4 mb-5">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0"
          :class="isDanger ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#F5C518]/20 text-[#F5C518] border border-[#F5C518]/30'">
          <i :class="icon || (isDanger ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-question')"></i>
        </div>
        <div>
          <h3 class="text-lg font-extrabold text-white leading-snug">{{ title || 'Confirm Action' }}</h3>
          <p class="text-xs text-gray-400">Please confirm your decision below</p>
        </div>
      </div>

      <!-- Modal Body Message -->
      <div class="bg-[#12151e] p-4 rounded-2xl border border-white/5 mb-6 text-sm text-gray-300 leading-relaxed">
        {{ message }}
      </div>

      <!-- Modal Action Buttons -->
      <div class="flex items-center gap-3">
        <button @click="$emit('cancel')"
          class="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all border border-white/5">
          {{ cancelText || 'Cancel' }}
        </button>

        <button @click="$emit('confirm')"
          :class="isDanger ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#F5C518] hover:bg-[#d4a914] text-black'"
          class="flex-1 py-3 px-4 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2">
          <span>{{ confirmText || 'Confirm' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: String,
  message: String,
  confirmText: String,
  cancelText: String,
  isDanger: {
    type: Boolean,
    default: true
  },
  icon: String
});

defineEmits(['confirm', 'cancel']);
</script>
