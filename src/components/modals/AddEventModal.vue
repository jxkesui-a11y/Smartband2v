<template>
  <div v-if="show" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
    <div class="glass-panel w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl relative text-left">
      <button @click="$emit('cancel')" class="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
        <i class="fa-solid fa-xmark text-xl"></i>
      </button>

      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-2xl bg-[#0A84FF]/10 text-[#0A84FF] flex items-center justify-center font-bold">
          <i class="fa-solid fa-calendar-plus text-lg"></i>
        </div>
        <div>
          <h3 class="text-xl font-bold text-white">Schedule Event</h3>
          <p class="text-xs text-gray-400">Add practice, gig, or performance to roadmap</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Event Title</label>
          <input v-model="title" type="text" placeholder="e.g., General Band Practice" required
            class="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Date</label>
            <input v-model="date" type="date" required
              class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Time</label>
            <input v-model="time" type="time" required
              class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Location</label>
          <input v-model="location" type="text" placeholder="e.g., Band Room A / Music Hall" required
            class="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none">
        </div>

        <div class="flex gap-3 pt-4">
          <button type="button" @click="$emit('cancel')" class="flex-1 py-3 bg-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting || !title.trim() || !date || !time || !location.trim()"
            class="flex-1 py-3 bg-[#0A84FF] text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-[#0070e0] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin"></i>
            <span>{{ isSubmitting ? 'Saving...' : 'Add to Roadmap' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  isSubmitting: Boolean
});

const emit = defineEmits(['submit', 'cancel']);

const title = ref('');
const date = ref('');
const time = ref('');
const location = ref('');

watch(() => props.show, (newVal) => {
  if (!newVal) {
    title.value = '';
    date.value = '';
    time.value = '';
    location.value = '';
  }
});

const handleSubmit = () => {
  emit('submit', {
    title: title.value,
    date: date.value,
    time: time.value,
    location: location.value
  });
};
</script>
