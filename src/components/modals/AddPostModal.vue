<template>
  <div v-if="show" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
    <div class="glass-panel w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl relative text-left">
      <button @click="$emit('cancel')" class="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
        <i class="fa-solid fa-xmark text-xl"></i>
      </button>

      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-2xl bg-[#F5C518]/10 text-[#F5C518] flex items-center justify-center font-bold">
          <i class="fa-solid fa-[#F5C518] fa-bullhorn text-lg"></i>
        </div>
        <div>
          <h3 class="text-xl font-bold text-white">Create Announcement</h3>
          <p class="text-xs text-gray-400">Post updates to the band feed</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Title</label>
          <input v-model="title" type="text" placeholder="e.g., Rehearsal Call Time Change" required
            class="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none">
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Message</label>
          <textarea v-model="message" rows="4" placeholder="Enter details for the band..." required
            class="w-full glass-input rounded-xl p-4 text-white placeholder-gray-500 text-sm focus:outline-none resize-none"></textarea>
        </div>

        <div class="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <input v-model="isUrgent" type="checkbox" id="urgentCheck" class="w-5 h-5 rounded accent-[#FF453A] cursor-pointer">
          <label for="urgentCheck" class="text-xs font-bold text-red-400 cursor-pointer">
            <i class="fa-solid fa-triangle-exclamation mr-1"></i> Mark as Urgent Announcement (Requires Member Acknowledgment)
          </label>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="button" @click="$emit('cancel')" class="flex-1 py-3 bg-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting || !title.trim() || !message.trim()"
            class="flex-1 py-3 bg-[#F5C518] text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-[#d4a914] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin"></i>
            <span>{{ isSubmitting ? 'Posting...' : 'Post Announcement' }}</span>
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
const message = ref('');
const isUrgent = ref(false);

watch(() => props.show, (newVal) => {
  if (!newVal) {
    title.value = '';
    message.value = '';
    isUrgent.value = false;
  }
});

const handleSubmit = () => {
  emit('submit', {
    title: title.value,
    message: message.value,
    isUrgent: isUrgent.value
  });
};
</script>
