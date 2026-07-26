<template>
  <div class="h-[calc(100vh-160px)] flex flex-col glass-card rounded-3xl border border-white/5 overflow-hidden text-left">
    
    <!-- Channel Bar -->
    <div class="px-6 py-4 bg-[#12151e] border-b border-white/10 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <span class="text-xl text-[#F5C518] font-black">#</span>
        <h2 class="text-lg font-bold text-white uppercase tracking-wider">{{ bandStore.selectedChannel }}</h2>
        <span class="text-xs text-gray-400 hidden md:inline">• Band Sectional & General Discussion</span>
      </div>

      <!-- Quick Channel Switcher Pills -->
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
        <button v-for="ch in channels" :key="ch.id"
          @click="switchChannel(ch.id)"
          :class="bandStore.selectedChannel === ch.id ? 'bg-[#F5C518] text-black font-extrabold shadow-md shadow-[#F5C518]/20' : 'bg-white/5 text-gray-400 hover:text-white'"
          class="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all shrink-0 relative">
          <span>#{{ ch.name }}</span>
          <span v-if="bandStore.unreadMessages[ch.id] > 0"
            class="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[9px] rounded-full font-bold animate-pulse">
            {{ bandStore.unreadMessages[ch.id] }}
          </span>
        </button>
      </div>
    </div>

    <!-- Messages Chat Box -->
    <div id="chatBoxContainer" class="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
      <div v-for="msg in bandStore.chatMessages" :key="msg.id" 
        class="flex items-start gap-3 group animate-in slide-in-from-bottom-2">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1a1e2e] to-[#252a3e] border border-white/10 flex items-center justify-center font-bold text-sm text-[#F5C518] shrink-0">
          {{ getInitials(msg.first_name, msg.last_name) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-2 mb-1">
            <span class="font-bold text-white text-xs md:text-sm">{{ msg.first_name }} {{ msg.last_name }}</span>
            <span class="text-[10px] text-gray-500 uppercase tracking-wider">{{ formatTime(msg.created_at) }}</span>
          </div>
          <div class="bg-[#151926] border border-white/5 rounded-2xl rounded-tl-none p-3 text-xs md:text-sm text-gray-200 leading-relaxed inline-block max-w-2xl break-words shadow-sm">
            {{ msg.content }}
          </div>
        </div>
      </div>

      <div v-if="bandStore.chatMessages.length === 0" class="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-2">
        <i class="fa-regular fa-comments text-4xl text-gray-600"></i>
        <p class="text-sm font-bold">No messages in #{{ bandStore.selectedChannel }} yet.</p>
        <p class="text-xs text-gray-600">Be the first to start the conversation!</p>
      </div>
    </div>

    <!-- Message Input Bar -->
    <div class="p-4 bg-[#12151e] border-t border-white/10 shrink-0">
      <form @submit.prevent="handleSendMessage" class="flex items-center gap-3">
        <input v-model="messageInput" type="text" 
          :placeholder="'Message #' + bandStore.selectedChannel + '...'" required
          class="flex-1 glass-input rounded-2xl px-5 py-3.5 text-white placeholder-gray-500 text-sm focus:outline-none">
        
        <button type="submit" :disabled="!messageInput.trim()"
          class="px-6 py-3.5 bg-[#F5C518] text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider hover:bg-[#d4a914] transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-[#F5C518]/10 shrink-0">
          <span>Send</span>
          <i class="fa-solid fa-paper-plane text-xs"></i>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useBandStore } from '../../stores/bandStore';
import { useRoute } from 'vue-router';

const bandStore = useBandStore();
const route = useRoute();

const messageInput = ref('');

const channels = [
  { id: 'general', name: 'general' },
  { id: 'important', name: 'important' },
  { id: 'sectionals', name: 'sectionals' },
  { id: 'brass', name: 'brass' },
  { id: 'woodwinds', name: 'woodwinds' },
  { id: 'percussion', name: 'percussion' }
];

const switchChannel = async (channelId) => {
  await bandStore.fetchMessages(channelId);
  scrollToBottom();
};

const handleSendMessage = async () => {
  if (!messageInput.value.trim()) return;
  const content = messageInput.value;
  messageInput.value = '';
  await bandStore.sendMessage(content);
  scrollToBottom();
};

const getInitials = (first, last) => {
  const f = first?.[0] || 'M';
  const l = last?.[0] || '';
  return `${f}${l}`.toUpperCase();
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.getElementById('chatBoxContainer');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
};

onMounted(async () => {
  const initialChan = route.params.channel || 'general';
  await bandStore.fetchMessages(initialChan);
  scrollToBottom();
});

watch(() => bandStore.chatMessages.length, () => {
  scrollToBottom();
});
</script>
