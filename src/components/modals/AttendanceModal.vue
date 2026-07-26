<template>
  <div v-if="show" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
    <div class="glass-panel w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl relative text-left">
      <button @click="$emit('close')" class="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
        <i class="fa-solid fa-xmark text-xl"></i>
      </button>

      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-2xl bg-[#32d74b]/10 text-[#32d74b] flex items-center justify-center font-bold">
          <i class="fa-solid fa-qrcode text-lg"></i>
        </div>
        <div>
          <h3 class="text-xl font-bold text-white">Rehearsal Attendance</h3>
          <p class="text-xs text-gray-400">Check-in code generator & entry</p>
        </div>
      </div>

      <div v-if="canManage" class="mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
        <p class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Today's Active Check-In Code</p>
        <div class="text-3xl font-extrabold tracking-widest text-[#F5C518] my-2 select-all font-mono">
          {{ generatedCode }}
        </div>
        <button @click="generateNewCode" class="mt-2 text-[10px] bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg uppercase tracking-wider font-bold transition-colors">
          <i class="fa-solid fa-rotate mr-1"></i> Generate New Session Code
        </button>
      </div>

      <form @submit.prevent="handleCheckIn" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Member Check-In Entry</label>
          <input v-model="userCode" type="text" placeholder="Enter 6-digit session code..." required maxlength="6"
            class="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-500 text-center font-mono text-lg uppercase tracking-widest focus:outline-none">
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" @click="$emit('close')" class="flex-1 py-3 bg-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-white/10 transition-colors">
            Close
          </button>
          <button type="submit" :disabled="userCode.length < 4"
            class="flex-1 py-3 bg-[#32d74b] text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-[#28b83e] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <i class="fa-solid fa-check"></i> Submit Check-In
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  show: Boolean,
  canManage: Boolean
});

const emit = defineEmits(['close', 'check-in']);

const generatedCode = ref('BAND88');
const userCode = ref('');

const generateNewCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  generatedCode.value = code;
};

const handleCheckIn = () => {
  emit('check-in', userCode.value);
  userCode.value = '';
};
</script>
