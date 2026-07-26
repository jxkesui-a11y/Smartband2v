<template>
  <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
    <div class="glass-panel w-full max-w-2xl max-h-[85vh] rounded-3xl p-6 md:p-8 shadow-2xl relative text-left border border-white/10 flex flex-col">
      
      <!-- Close Button -->
      <button @click="$emit('close')" class="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
        <i class="fa-solid fa-xmark text-xl"></i>
      </button>

      <!-- Modal Title -->
      <div class="flex items-center gap-3 mb-6 shrink-0">
        <div class="w-12 h-12 rounded-2xl bg-[#0A84FF]/20 text-[#0A84FF] border border-[#0A84FF]/30 flex items-center justify-center font-bold text-xl">
          <i class="fa-solid fa-compass-drafting"></i>
        </div>
        <div>
          <h3 class="text-xl font-extrabold text-white">System Scope & Limitations</h3>
          <p class="text-xs text-gray-400">SmartBand 2.0 Architectural Boundaries & Features</p>
        </div>
      </div>

      <!-- Content Container -->
      <div class="flex-1 overflow-y-auto space-y-6 pr-2 text-xs leading-relaxed text-gray-300">
        
        <!-- Project Scope Section -->
        <div class="bg-[#12151e] p-5 rounded-2xl border border-white/5 space-y-3">
          <h4 class="font-bold text-[#F5C518] uppercase tracking-wider text-xs flex items-center gap-2">
            <i class="fa-solid fa-circle-check text-emerald-400"></i> Project Scope & Core Capabilities
          </h4>
          <ul class="space-y-2 list-disc list-inside text-gray-300 pl-1">
            <li><strong class="text-white">Member Application & Verification:</strong> Official application form submission with ID proof attachments, senior citizen verification, and admin approval workflows.</li>
            <li><strong class="text-white">PWA Offline Sheet Music Portal:</strong> Offline storage and downloading of PDF sheet music scores and MP3 backing tracks using browser Cache Storage API.</li>
            <li><strong class="text-white">Availability Schedule & Muted Notifications:</strong> Member-defined weekly available days and Quiet Hours to auto-silence alerts during unavailable times.</li>
            <li><strong class="text-white">Re-Notify Alert Escalation:</strong> Officer tool to trigger targeted follow-up re-notifications for members who have not acknowledged urgent announcements or event RSVPs.</li>
            <li><strong class="text-white">Senior Citizen Rule-Based Accessibility:</strong> Dedicated Large Text Mode, High Contrast toggle, 1-tap direct dial buttons, and Web Speech API Voice Readout for announcements.</li>
            <li><strong class="text-white">Disciplinary & Call-Up Analytics:</strong> Member responsiveness metrics, call-up count tracking, and rule-based compliance status (Green, Yellow, Red).</li>
          </ul>
        </div>

        <!-- System Limitations Section -->
        <div class="bg-[#12151e] p-5 rounded-2xl border border-white/5 space-y-3">
          <h4 class="font-bold text-amber-400 uppercase tracking-wider text-xs flex items-center gap-2">
            <i class="fa-solid fa-triangle-exclamation"></i> System Limitations
          </h4>
          <ul class="space-y-2 list-disc list-inside text-gray-300 pl-1">
            <li><strong class="text-white">Offline Storage Limits:</strong> Offline score availability depends on available client device storage space (browser Cache Storage quota).</li>
            <li><strong class="text-white">Notification Schedule Muting:</strong> Quiet Hours muting applies within the web app and service worker layer; external device SMS depends on native carrier/device settings.</li>
            <li><strong class="text-white">Realtime Synchronization:</strong> Realtime live updates require an active internet connection; changes made offline queue locally until connection is restored.</li>
            <li><strong class="text-white">Voice Readout:</strong> Speech Synthesis utilizes native web browser TTS engines; voice quality and language accents depend on host OS language packs.</li>
          </ul>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="pt-5 mt-4 border-t border-white/10 flex justify-end shrink-0">
        <button @click="$emit('close')"
          class="px-6 py-3 bg-[#F5C518] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider hover:bg-[#d4a914] transition-all shadow-md">
          Close Window
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean
});

defineEmits(['close']);
</script>
