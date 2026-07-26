<template>
  <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
    <div class="glass-panel w-full max-w-lg max-h-[90vh] rounded-3xl p-6 md:p-8 shadow-2xl relative text-left border border-white/10 flex flex-col">
      
      <button @click="$emit('cancel')" class="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
        <i class="fa-solid fa-xmark text-xl"></i>
      </button>

      <div class="flex items-center gap-3 mb-6 shrink-0">
        <div class="w-12 h-12 rounded-2xl bg-[#F5C518]/20 text-[#F5C518] border border-[#F5C518]/30 flex items-center justify-center font-bold text-xl">
          <i class="fa-solid fa-user-pen"></i>
        </div>
        <div>
          <h3 class="text-xl font-extrabold text-white">Member Profile & Preferences</h3>
          <p class="text-xs text-gray-400">Update contact info, availability schedule & senior accessibility</p>
        </div>
      </div>

      <form @submit.prevent="handleSave" class="flex-1 overflow-y-auto space-y-5 pr-1 text-left">
        
        <!-- Personal Details -->
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

        <!-- Phone & Instrument -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Instrument Section</label>
            <select v-model="localForm.instrument" required
              class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none appearance-none">
              <option v-for="inst in instrumentList" :key="inst" :value="inst">{{ inst }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Contact Phone</label>
            <input v-model="localForm.phone" type="tel" placeholder="09123456789"
              class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
          </div>
        </div>

        <!-- Emergency Contact -->
        <div class="bg-[#12151e] p-4 rounded-2xl border border-white/5 space-y-3">
          <h4 class="text-xs font-bold text-[#F5C518] uppercase tracking-wider flex items-center gap-2">
            <i class="fa-solid fa-[#F5C518] fa-phone-volume text-sm"></i> Emergency Call-up Contact
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input v-model="localForm.emergencyName" type="text" placeholder="Contact Name"
              class="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none">
            <input v-model="localForm.emergencyPhone" type="tel" placeholder="Emergency Phone"
              class="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none">
          </div>
        </div>

        <!-- Member Availability Schedule (Quiet Hours Muting) -->
        <div class="bg-[#12151e] p-4 rounded-2xl border border-white/5 space-y-3">
          <div class="flex justify-between items-center">
            <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-clock text-sm"></i> Member Availability & Quiet Hours
            </h4>
            <span class="text-[9px] text-gray-400">Mutes notifications when unavailable</span>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Weekly Available Days</label>
            <div class="flex flex-wrap gap-1.5">
              <button type="button" v-for="day in daysOfWeek" :key="day"
                @click="toggleDay(day)"
                :class="localForm.availableDays.includes(day) ? 'bg-emerald-500 text-black font-extrabold' : 'bg-white/5 text-gray-400'"
                class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                {{ day }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Quiet Start Hour</label>
              <input v-model="localForm.quietStart" type="time"
                class="w-full glass-input rounded-xl px-3 py-2 text-white text-xs focus:outline-none">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Quiet End Hour</label>
              <input v-model="localForm.quietEnd" type="time"
                class="w-full glass-input rounded-xl px-3 py-2 text-white text-xs focus:outline-none">
            </div>
          </div>
        </div>

        <!-- Senior Citizen Accessibility Toggles -->
        <div class="bg-[#12151e] p-4 rounded-2xl border border-white/5 space-y-3">
          <h4 class="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
            <i class="fa-solid fa-universal-access text-sm"></i> Senior Citizen & Accessibility Preferences
          </h4>

          <div class="space-y-2">
            <label class="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <span class="text-xs text-white font-medium">Large Text Mode (Senior Friendly)</span>
              <input v-model="localForm.largeText" type="checkbox" class="w-4 h-4 accent-[#F5C518]">
            </label>

            <label class="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <span class="text-xs text-white font-medium">High Contrast Theme</span>
              <input v-model="localForm.highContrast" type="checkbox" class="w-4 h-4 accent-[#F5C518]">
            </label>

            <label class="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <span class="text-xs text-white font-medium">Enable Voice Readout (TTS for Announcements)</span>
              <input v-model="localForm.speechEnabled" type="checkbox" class="w-4 h-4 accent-[#F5C518]">
            </label>
          </div>
        </div>

        <!-- Password Update Toggle -->
        <div class="pt-2 border-t border-white/10">
          <button type="button" @click="showPasswordFields = !showPasswordFields"
            class="text-xs font-bold text-[#F5C518] hover:text-white transition-colors flex items-center gap-2">
            <i class="fa-solid" :class="showPasswordFields ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
            <span>Change Account Password</span>
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

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-4 border-t border-white/10 shrink-0">
          <button type="button" @click="$emit('cancel')" class="flex-1 py-3 bg-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button type="submit"
            class="flex-1 py-3 bg-[#F5C518] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider hover:bg-[#d4a914] transition-all shadow-md flex items-center justify-center gap-2">
            <span>Save Profile</span>
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
  user: Object,
  instrumentList: Array
});

const emit = defineEmits(['update', 'cancel']);

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const localForm = ref({
  firstName: '',
  lastName: '',
  instrument: '',
  phone: '',
  emergencyName: '',
  emergencyPhone: '',
  availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  quietStart: '22:00',
  quietEnd: '06:00',
  largeText: false,
  highContrast: false,
  speechEnabled: true
});

const showPasswordFields = ref(false);
const passwords = ref({ current: '', new: '' });

watch(() => props.show, (isShowing) => {
  if (isShowing && props.user) {
    localForm.value = {
      firstName: props.user.first_name || '',
      lastName: props.user.last_name || '',
      instrument: props.user.instrument || 'Trumpet',
      phone: props.user.phone || '',
      emergencyName: props.user.emergency_name || '',
      emergencyPhone: props.user.emergency_phone || '',
      availableDays: props.user.available_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      quietStart: props.user.quiet_start || '22:00',
      quietEnd: props.user.quiet_end || '06:00',
      largeText: !!props.user.large_text,
      highContrast: !!props.user.high_contrast,
      speechEnabled: props.user.speech_enabled !== false
    };
  }
}, { immediate: true });

const toggleDay = (day) => {
  const idx = localForm.value.availableDays.indexOf(day);
  if (idx !== -1) {
    localForm.value.availableDays.splice(idx, 1);
  } else {
    localForm.value.availableDays.push(day);
  }
};

const handleSave = () => {
  emit('update', {
    ...localForm.value,
    passwords: showPasswordFields.value ? passwords.value : null
  });
};
</script>
