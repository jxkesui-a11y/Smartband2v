<template>
  <div class="min-h-screen bg-[#090a0f] flex items-center justify-center p-4 relative overflow-hidden font-sans text-gray-100">
    
    <!-- Background Radial Lights -->
    <div class="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,197,24,0.12)_0%,rgba(0,0,0,0)_70%)] pointer-events-none -z-10 animate-glow"></div>
    <div class="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(10,132,255,0.1)_0%,rgba(0,0,0,0)_70%)] pointer-events-none -z-10 animate-glow"></div>

    <div class="w-full max-w-md glass-panel rounded-3xl p-8 md:p-10 z-10 shadow-2xl text-center border border-white/10 relative">
      
      <!-- Brand Logo -->
      <div class="flex justify-center items-center gap-3 text-3xl font-extrabold mb-8 text-white tracking-tight">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f5c518] to-[#ffd700] text-black flex items-center justify-center shadow-lg shadow-[#f5c518]/20">
          <i class="fa-solid fa-music text-xl"></i>
        </div>
        <span>SmartBand <span class="text-xs bg-[#f5c518]/20 text-[#f5c518] px-2 py-0.5 rounded-full border border-[#f5c518]/30 font-bold ml-1">2.0</span></span>
      </div>

      <!-- Mode Switcher -->
      <div class="flex bg-[#0f121a] rounded-2xl p-1 mb-6 border border-white/10">
        <button @click="isLogin = true; errorMessage = ''; successMessage = ''" 
          :class="isLogin ? 'bg-[#1a1e2e] text-white shadow-lg border border-white/10' : 'text-gray-400 hover:text-gray-200'" 
          class="flex-1 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider">
          Sign In
        </button>
        <button @click="isLogin = false; errorMessage = ''; successMessage = ''" 
          :class="!isLogin ? 'bg-[#1a1e2e] text-white shadow-lg border border-white/10' : 'text-gray-400 hover:text-gray-200'" 
          class="flex-1 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider">
          Request Access
        </button>
      </div>

      <!-- Alerts -->
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-3 text-left animate-in slide-in-from-top-2">
        <i class="fa-solid fa-circle-exclamation text-base shrink-0"></i> <span>{{ errorMessage }}</span>
      </div>
      <div v-if="successMessage" class="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-3 text-left animate-in slide-in-from-top-2">
        <i class="fa-solid fa-circle-check text-base shrink-0"></i> <span>{{ successMessage }}</span>
      </div>

      <form @submit.prevent="handleAuth" class="flex flex-col gap-4 text-left">
        
        <div v-if="!isLogin" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">First Name</label>
              <input v-model="firstName" type="text" placeholder="Juan" required
                class="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none text-sm">
            </div>
            <div>
              <label class="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Last Name</label>
              <input v-model="lastName" type="text" placeholder="Dela Cruz" required
                class="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none text-sm">
            </div>
          </div>

          <div>
            <label class="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Your Instrument</label>
            <select v-model="instrument" required
              class="w-full glass-input rounded-xl px-4 py-3 text-white focus:outline-none text-sm appearance-none">
              <option value="" disabled selected>Select instrument section...</option>
              <option v-for="inst in instrumentList" :key="inst" :value="inst">{{ inst }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
          <div class="relative">
            <i class="fa-regular fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input v-model="email" type="email" placeholder="you@example.com" required
              class="w-full glass-input rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none text-sm">
          </div>
        </div>

        <div>
          <div class="flex justify-between items-end mb-1.5 ml-1">
            <label class="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-wider">Password</label>
            <a v-if="isLogin" href="#" @click.prevent="handleResetPassword" class="text-[0.7rem] font-bold text-[#F5C518] hover:text-white transition-colors">Forgot?</a>
          </div>
          <div class="relative">
            <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input v-model="password" type="password" placeholder="••••••••" required
              class="w-full glass-input rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none text-sm">
          </div>

          <!-- Password strength helper for registration -->
          <div v-if="!isLogin && password" class="mt-3 p-3 bg-[#0f121a] border border-white/10 rounded-xl space-y-1.5">
            <p class="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider mb-1">Password Requirements:</p>
            <div class="flex items-center gap-2 text-[0.7rem]" :class="passwordReqs.hasLength ? 'text-emerald-400' : 'text-gray-500'">
              <i :class="passwordReqs.hasLength ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"></i>
              <span>At least 8 characters</span>
            </div>
            <div class="flex items-center gap-2 text-[0.7rem]" :class="passwordReqs.hasUppercase ? 'text-emerald-400' : 'text-gray-500'">
              <i :class="passwordReqs.hasUppercase ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"></i>
              <span>One uppercase letter (A-Z)</span>
            </div>
            <div class="flex items-center gap-2 text-[0.7rem]" :class="passwordReqs.hasNumber ? 'text-emerald-400' : 'text-gray-500'">
              <i :class="passwordReqs.hasNumber ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"></i>
              <span>One number (0-9)</span>
            </div>
            <div class="flex items-center gap-2 text-[0.7rem]" :class="passwordReqs.hasSpecial ? 'text-emerald-400' : 'text-gray-500'">
              <i :class="passwordReqs.hasSpecial ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"></i>
              <span>One special character (!@#$%^&*)</span>
            </div>
          </div>
        </div>

        <button type="submit" :disabled="isSubmitting || (!isLogin && !isPasswordStrong)"
          class="w-full bg-[#F5C518] text-black font-extrabold text-sm py-4 rounded-xl mt-2 hover:bg-[#d4a914] transition-all flex justify-center items-center gap-2 shadow-lg shadow-[#F5C518]/10 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed">
          <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin"></i>
          <span>{{ isLogin ? 'Access Dashboard' : 'Submit Access Request' }}</span>
          <i v-if="!isSubmitting" class="fa-solid fa-arrow-right ml-1"></i>
        </button>
        
        <p v-if="!isLogin" class="text-[0.65rem] text-center text-gray-400 mt-2 uppercase tracking-widest font-bold">
          <i class="fa-solid fa-shield-halved text-[#F5C518] mr-1"></i> Admin Approval Required For New Accounts
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../supabase';

const authStore = useAuthStore();
const emit = defineEmits(['login-success']);

const isLogin = ref(true);
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const instrument = ref('');

const errorMessage = ref('');
const successMessage = ref('');
const isSubmitting = ref(false);

const instrumentList = ['Trumpet', 'Alto Sax', 'Tenor Sax', 'Clarinet', 'Flute', 'Trombone', 'Tuba', 'Percussion', 'Staff/Support'];

const passwordReqs = computed(() => {
  const p = password.value || ''; 
  return {
    hasLength: p.length >= 8,
    hasUppercase: /[A-Z]/.test(p),
    hasNumber: /[0-9]/.test(p),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(p)
  };
});

const isPasswordStrong = computed(() => {
  return passwordReqs.value.hasLength && 
         passwordReqs.value.hasUppercase && 
         passwordReqs.value.hasNumber && 
         passwordReqs.value.hasSpecial;
});

const handleResetPassword = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  if (!email.value) {
    errorMessage.value = 'Please enter your email address above first.';
    return;
  }
  isSubmitting.value = true;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: window.location.origin + window.location.pathname
    });
    if (error) errorMessage.value = error.message;
    else successMessage.value = 'Password reset instructions sent to your email!';
  } catch (err) {
    errorMessage.value = 'Could not send reset email.';
  } finally {
    isSubmitting.value = false;
  }
};

const handleAuth = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  isSubmitting.value = true;

  try {
    if (isLogin.value) {
      const profile = await authStore.login(email.value, password.value);
      emit('login-success', profile);
    } else {
      await authStore.register({
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value,
        instrument: instrument.value
      });
      successMessage.value = 'Request submitted successfully! An officer will review your approval.';
      firstName.value = '';
      lastName.value = '';
      email.value = '';
      password.value = '';
      instrument.value = '';
    }
  } catch (err) {
    errorMessage.value = authStore.authError || err.message || 'Authentication failed.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>
