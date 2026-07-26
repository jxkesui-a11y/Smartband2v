<template>
  <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
    <div class="glass-panel w-full max-w-xl max-h-[90vh] rounded-3xl p-6 md:p-8 shadow-2xl relative text-left border border-white/10 flex flex-col">
      
      <!-- Close Button -->
      <button @click="$emit('cancel')" class="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
        <i class="fa-solid fa-xmark text-xl"></i>
      </button>

      <!-- Form Title -->
      <div class="flex items-center gap-3 mb-6 shrink-0">
        <div class="w-12 h-12 rounded-2xl bg-[#F5C518]/20 text-[#F5C518] border border-[#F5C518]/30 flex items-center justify-center font-bold text-xl">
          <i class="fa-solid fa-id-card"></i>
        </div>
        <div>
          <h3 class="text-xl font-extrabold text-white">Member Verification Application</h3>
          <p class="text-xs text-gray-400">Official Municipal Band Registration Form</p>
        </div>
      </div>

      <!-- Application Form Body -->
      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto space-y-4 pr-1 text-left">
        
        <!-- Full Name -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">First Name *</label>
            <input v-model="form.firstName" type="text" required placeholder="Juan"
              class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Last Name *</label>
            <input v-model="form.lastName" type="text" required placeholder="Dela Cruz"
              class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
          </div>
        </div>

        <!-- Contact & Email -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Email Address *</label>
            <input v-model="form.email" type="email" required placeholder="juan@example.com"
              class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Contact Phone Number *</label>
            <input v-model="form.phone" type="tel" required placeholder="09123456789"
              class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
          </div>
        </div>

        <!-- Instrument & Senior Status -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Primary Instrument *</label>
            <select v-model="form.instrument" required
              class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none appearance-none">
              <option v-for="inst in instrumentList" :key="inst" :value="inst">{{ inst }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Member Category</label>
            <select v-model="form.tier"
              class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none appearance-none">
              <option value="junior">Junior Band Member</option>
              <option value="senior">Senior Citizen Member (60+)</option>
              <option value="pwd">PWD / Special Assistance</option>
            </select>
          </div>
        </div>

        <!-- Emergency Contact Info -->
        <div class="bg-[#12151e] p-4 rounded-2xl border border-white/5 space-y-3">
          <h4 class="text-xs font-bold text-[#F5C518] uppercase tracking-wider">Emergency Contact Details</h4>
          <div class="grid grid-cols-2 gap-3">
            <input v-model="form.emergencyName" type="text" placeholder="Contact Person Name" required
              class="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none">
            <input v-model="form.emergencyPhone" type="tel" placeholder="Emergency Phone Number" required
              class="w-full glass-input rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none">
          </div>
        </div>

        <!-- ID Proof Verification -->
        <div>
          <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Verification Document / Valid ID Attachment *</label>
          <input type="file" @change="handleFileChange" accept="image/*,.pdf" required
            class="w-full glass-input rounded-xl p-3 text-white text-xs focus:outline-none">
          <p class="text-[10px] text-gray-500 mt-1">Upload a photo of your Government ID, Student ID, or Senior Citizen Card for verification.</p>
        </div>

        <!-- Availability Preference -->
        <div>
          <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Rehearsal Availability Notes</label>
          <input v-model="form.availabilityNotes" type="text" placeholder="e.g. Available weekends and weekday evenings after 6 PM"
            class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
        </div>

        <!-- Submit Buttons -->
        <div class="flex gap-3 pt-4 border-t border-white/10 shrink-0">
          <button type="button" @click="$emit('cancel')" class="flex-1 py-3 bg-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="isSubmitting"
            class="flex-1 py-3 bg-[#F5C518] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider hover:bg-[#d4a914] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin"></i>
            <span>{{ isSubmitting ? 'Submitting...' : 'Submit Application' }}</span>
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
  instrumentList: Array,
  isSubmitting: Boolean
});

const emit = defineEmits(['submit', 'cancel']);

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  instrument: 'Trumpet',
  tier: 'junior',
  emergencyName: '',
  emergencyPhone: '',
  availabilityNotes: '',
  idFile: null
});

const handleFileChange = (e) => {
  if (e.target.files && e.target.files[0]) {
    form.value.idFile = e.target.files[0];
  }
};

const handleSubmit = () => {
  emit('submit', { ...form.value });
};
</script>
