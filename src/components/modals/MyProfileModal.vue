<template>
  <div v-if="show" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
    <div class="glass-panel w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl relative text-left">
      <button @click="$emit('cancel')" class="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
        <i class="fa-solid fa-xmark text-xl"></i>
      </button>

      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-2xl bg-[#F5C518]/10 text-[#F5C518] flex items-center justify-center font-bold">
          <i class="fa-solid fa-user-pen text-lg"></i>
        </div>
        <div>
          <h3 class="text-xl font-bold text-white">Edit Profile</h3>
          <p class="text-xs text-gray-400">Update personal information & password</p>
        </div>
      </div>

      <form @submit.prevent="handleUpdate" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">First Name</label>
            <input v-model="localForm.firstName" type="text" required
              class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Last Name</label>
            <input v-model="localForm.lastName" type="text" required
              class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Instrument</label>
          <select v-model="localForm.instrument" required
            class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none appearance-none">
            <option v-for="inst in instrumentList" :key="inst" :value="inst">{{ inst }}</option>
          </select>
        </div>

        <div class="pt-3 border-t border-white/10">
          <button type="button" @click="showPasswordFields = !showPasswordFields"
            class="text-xs font-bold text-[#F5C518] hover:text-white transition-colors flex items-center gap-2">
            <i class="fa-solid" :class="showPasswordFields ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
            <span>Change Password</span>
          </button>

          <div v-if="showPasswordFields" class="mt-3 space-y-3 animate-in slide-in-from-top-2">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Current Password</label>
              <input v-model="passwords.current" type="password" placeholder="••••••••"
                class="w-full glass-input rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">New Password</label>
              <input v-model="passwords.new" type="password" placeholder="••••••••"
                class="w-full glass-input rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="button" @click="$emit('cancel')" class="flex-1 py-3 bg-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button type="submit"
            class="flex-1 py-3 bg-[#F5C518] text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-[#d4a914] transition-all flex items-center justify-center gap-2">
            <span>Update Profile</span>
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
  form: Object,
  instrumentList: Array
});

const emit = defineEmits(['update', 'cancel']);

const localForm = ref({ firstName: '', lastName: '', instrument: '' });
const showPasswordFields = ref(false);
const passwords = ref({ current: '', new: '' });

watch(() => props.form, (newVal) => {
  if (newVal) {
    localForm.value = { ...newVal };
  }
}, { immediate: true });

const handleUpdate = () => {
  emit('update', {
    ...localForm.value,
    passwords: showPasswordFields.value ? passwords.value : null
  });
};
</script>
