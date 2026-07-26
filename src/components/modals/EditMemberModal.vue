<template>
  <div v-if="modelValue" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
    <div class="glass-panel w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl relative text-left">
      <button @click="$emit('cancel')" class="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
        <i class="fa-solid fa-xmark text-xl"></i>
      </button>

      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-2xl bg-[#bf5af2]/10 text-[#bf5af2] flex items-center justify-center font-bold">
          <i class="fa-solid fa-user-gear text-lg"></i>
        </div>
        <div>
          <h3 class="text-xl font-bold text-white">Manage Member</h3>
          <p class="text-xs text-gray-400">{{ form.first_name }} {{ form.last_name }}</p>
        </div>
      </div>

      <form @submit.prevent="handleSave" class="space-y-4">
        <div v-if="isAdmin">
          <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Email Address</label>
          <input v-model="form.email" type="email" required
            class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Instrument Part</label>
          <select v-model="form.instrument" required
            class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none appearance-none">
            <option v-for="inst in instrumentList" :key="inst" :value="inst">{{ inst }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Band Role</label>
          <select v-model="form.role" :disabled="!isAdmin" required
            class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none appearance-none disabled:opacity-50">
            <option v-for="r in availableRoles" :key="r.value" :value="r.value" :disabled="r.disabled">
              {{ r.label }} {{ r.disabled ? '(Assigned)' : '' }}
            </option>
          </select>
          <p v-if="!isAdmin" class="text-[10px] text-amber-400 mt-1"><i class="fa-solid fa-lock mr-1"></i> Only Admins can modify officer roles.</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Performance Tier</label>
          <select v-model="form.tier" required
            class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none appearance-none">
            <option value="senior">Senior Member</option>
            <option value="junior">Junior Member</option>
            <option value="trainee">Trainee / Probationary</option>
          </select>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="button" @click="$emit('cancel')" class="flex-1 py-3 bg-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting"
            class="flex-1 py-3 bg-[#bf5af2] text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-[#a648d8] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin"></i>
            <span>{{ isSubmitting ? 'Saving...' : 'Save Changes' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Object,
  isSubmitting: Boolean,
  availableRoles: Array,
  instrumentList: Array,
  isAdmin: Boolean
});

const emit = defineEmits(['save', 'cancel']);

const form = ref({
  id: '',
  first_name: '',
  last_name: '',
  email: '',
  instrument: '',
  role: '',
  tier: ''
});

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    form.value = { ...newVal };
  }
}, { immediate: true });

const handleSave = () => {
  emit('save', form.value);
};
</script>
