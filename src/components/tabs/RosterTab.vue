<template>
  <div class="space-y-6 text-left">
    
    <!-- Header & Search -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <i class="fa-solid fa-users text-[#F5C518]"></i> Band Roster & Member Analytics
        </h2>
        <p class="text-xs text-gray-400">Directory, availability schedules, and member responsiveness tracking</p>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <div class="relative flex-1 md:w-72">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
          <input v-model="bandStore.searchFilter" type="text" placeholder="Search by name or instrument..."
            class="w-full glass-input rounded-2xl pl-11 pr-4 py-2.5 text-white placeholder-gray-500 text-xs focus:outline-none">
        </div>

        <button @click="showAnalyticsView = !showAnalyticsView"
          :class="showAnalyticsView ? 'bg-[#F5C518] text-black font-extrabold' : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'"
          class="px-4 py-2.5 rounded-2xl text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 shrink-0">
          <i class="fa-solid fa-chart-pie"></i>
          <span>{{ showAnalyticsView ? 'Roster Cards' : 'Disciplinary Analytics' }}</span>
        </button>
      </div>
    </div>

    <!-- Section Filter Pills -->
    <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
      <button v-for="inst in sectionOptions" :key="inst"
        @click="bandStore.selectedInstrumentFilter = inst"
        :class="bandStore.selectedInstrumentFilter === inst ? 'bg-[#F5C518] text-black font-extrabold shadow-md shadow-[#F5C518]/10' : 'bg-white/5 text-gray-400 hover:text-white'"
        class="px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-wider transition-all shrink-0">
        {{ inst }}
      </button>
    </div>

    <!-- DISCIPLINARY ANALYTICS VIEW -->
    <div v-if="showAnalyticsView" class="glass-card p-6 rounded-3xl border border-white/5 space-y-6 animate-in fade-in">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <i class="fa-solid fa-scale-balanced text-amber-400"></i> Member Responsiveness & Escalation Tracker
          </h3>
          <p class="text-xs text-gray-400">Tracks member call-up frequency ("sino pa kailangan tawagan multiple times") and unexcused absences</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider">
              <th class="py-3 px-4">Member Name</th>
              <th class="py-3 px-4">Instrument</th>
              <th class="py-3 px-4">Availability Status</th>
              <th class="py-3 px-4">Call-Up / Re-Notifies</th>
              <th class="py-3 px-4">Disciplinary Status</th>
              <th class="py-3 px-4 text-right">Quick Contact / Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="member in bandStore.filteredRoster" :key="member.id" class="hover:bg-white/5 transition-colors">
              <td class="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                <span class="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#F5C518] text-xs font-black">
                  {{ member.first_name[0] }}{{ member.last_name[0] }}
                </span>
                <div>
                  <p>{{ member.first_name }} {{ member.last_name }}</p>
                  <p v-if="member.tier === 'senior'" class="text-[9px] text-purple-400 font-bold">Senior Citizen</p>
                </div>
              </td>
              <td class="py-3.5 px-4 text-[#F5C518] font-bold">{{ member.instrument }}</td>
              <td class="py-3.5 px-4">
                <span class="px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider"
                  :class="bandStore.isUserInQuietHours(member) ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'">
                  {{ bandStore.isUserInQuietHours(member) ? 'Quiet Hours Active' : 'Available' }}
                </span>
              </td>
              <td class="py-3.5 px-4 font-black text-white">
                <span class="px-2 py-1 bg-white/10 rounded-lg text-xs">
                  {{ bandStore.getCallCount(member.id) }} Call-ups
                </span>
              </td>
              <td class="py-3.5 px-4">
                <span class="px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border"
                  :class="bandStore.getDisciplinaryStatus(member).class">
                  {{ bandStore.getDisciplinaryStatus(member).label }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <a v-if="member.phone" :href="'tel:' + member.phone" title="Direct Phone Call"
                    class="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs transition-all border border-emerald-500/20">
                    <i class="fa-solid fa-phone"></i>
                  </a>
                  <a v-if="member.phone" :href="'sms:' + member.phone" title="Send SMS"
                    class="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-xl text-xs transition-all border border-blue-500/20">
                    <i class="fa-solid fa-comment-sms"></i>
                  </a>
                  <button v-if="authStore.isOfficer" @click="openDisciplinaryModal(member)" title="Record Warning / Disciplinary Action"
                    class="p-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-xl text-xs transition-all border border-amber-500/20">
                    <i class="fa-solid fa-gavel"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ROSTER CARDS GRID VIEW -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div v-for="member in bandStore.filteredRoster" :key="member.id"
        class="glass-card p-6 rounded-3xl border border-white/5 flex flex-col justify-between group hover:border-[#F5C518]/30 transition-all relative">
        
        <!-- Member Availability & Quiet Hours Badge -->
        <div class="absolute top-4 right-4 flex flex-col items-end gap-1">
          <span class="px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest border"
            :class="bandStore.isUserInQuietHours(member) ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'">
            {{ bandStore.isUserInQuietHours(member) ? 'Quiet Hours' : 'Available' }}
          </span>
        </div>

        <div>
          <!-- Member Avatar & Name -->
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1a1e2e] to-[#252a3e] border border-white/10 flex items-center justify-center font-black text-xl text-[#F5C518] mb-4 shadow-md">
            {{ member.first_name[0] }}{{ member.last_name[0] }}
          </div>

          <h3 class="font-bold text-white text-base leading-tight">{{ member.first_name }} {{ member.last_name }}</h3>
          <p class="text-xs text-gray-400 font-medium mt-0.5">{{ member.email }}</p>
          <p v-if="member.phone" class="text-[10px] text-gray-500 mt-0.5"><i class="fa-solid fa-phone text-[#F5C518] mr-1"></i>{{ member.phone }}</p>

          <!-- Badges -->
          <div class="flex flex-wrap items-center gap-2 mt-4">
            <span class="px-2.5 py-1 rounded-xl text-[9px] font-extrabold uppercase tracking-widest bg-[#F5C518]/10 text-[#F5C518] border border-[#F5C518]/20">
              {{ member.instrument }}
            </span>

            <span class="px-2.5 py-1 rounded-xl text-[9px] font-extrabold uppercase tracking-widest bg-white/5 text-gray-300 border border-white/10">
              {{ member.role }}
            </span>

            <span class="px-2.5 py-1 rounded-xl text-[9px] font-extrabold uppercase tracking-widest"
              :class="member.tier === 'senior' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'">
              {{ member.tier || 'Junior' }}
            </span>
          </div>
        </div>

        <!-- Officer Actions & Quick Call Shortcuts -->
        <div v-if="authStore.isOfficer" class="mt-6 pt-4 border-t border-white/10 flex items-center gap-2">
          <button @click="emit('open-edit-member', member)"
            class="flex-1 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all border border-white/5 flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-user-pen"></i> Edit Profile
          </button>

          <a v-if="member.phone" :href="'tel:' + member.phone" title="Call Senior Member"
            class="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs transition-all border border-emerald-500/20">
            <i class="fa-solid fa-phone"></i>
          </a>
          
          <button v-if="authStore.isAdmin && member.id !== authStore.currentUser.id"
            @click="triggerDeleteMember(member.id)"
            class="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs transition-all border border-red-500/20">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="bandStore.filteredRoster.length === 0" class="glass-panel p-12 rounded-3xl text-center text-gray-500 space-y-3">
      <i class="fa-solid fa-users text-4xl text-gray-600"></i>
      <p class="text-sm font-bold">No band members match your search criteria.</p>
    </div>

    <!-- Disciplinary Warning Log Modal -->
    <div v-if="showDisciplinaryModal" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div class="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-left">
        <button @click="showDisciplinaryModal = false" class="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>

        <h3 class="text-lg font-bold text-white mb-2">Record Disciplinary Warning</h3>
        <p class="text-xs text-gray-400 mb-4">Member: {{ selectedDisciplinaryMember?.first_name }} {{ selectedDisciplinaryMember?.last_name }}</p>

        <form @submit.prevent="submitDisciplinaryNote" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Officer Warning / Action Note</label>
            <textarea v-model="disciplinaryNoteText" rows="3" required placeholder="e.g. Issued 1st Warning regarding unexcused absence in 3 consecutive rehearsals."
              class="w-full glass-input rounded-xl p-3 text-white text-xs focus:outline-none"></textarea>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="showDisciplinaryModal = false" class="flex-1 py-2.5 bg-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider">
              Cancel
            </button>
            <button type="submit" class="flex-1 py-2.5 bg-amber-500 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider">
              Record Action
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal
      :show="confirmModal.show"
      :title="confirmModal.title"
      :message="confirmModal.message"
      confirmText="Remove Member"
      :isDanger="true"
      @confirm="executeDeleteMember"
      @cancel="confirmModal.show = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { useBandStore } from '../../stores/bandStore';
import ConfirmModal from '../modals/ConfirmModal.vue';

const emit = defineEmits(['open-edit-member']);

const authStore = useAuthStore();
const bandStore = useBandStore();

const showAnalyticsView = ref(false);
const showDisciplinaryModal = ref(false);
const selectedDisciplinaryMember = ref(null);
const disciplinaryNoteText = ref('');

const confirmModal = ref({
  show: false,
  title: '',
  message: '',
  memberId: null
});

const sectionOptions = ['All', 'Trumpet', 'Alto Sax', 'Tenor Sax', 'Clarinet', 'Flute', 'Trombone', 'Tuba', 'Percussion'];

const openDisciplinaryModal = (member) => {
  selectedDisciplinaryMember.value = member;
  disciplinaryNoteText.value = '';
  showDisciplinaryModal.value = true;
};

const submitDisciplinaryNote = () => {
  if (selectedDisciplinaryMember.value && disciplinaryNoteText.value.trim()) {
    bandStore.addDisciplinaryNote(selectedDisciplinaryMember.value.id, disciplinaryNoteText.value.trim());
    showDisciplinaryModal.value = false;
    alert(`Disciplinary warning logged for ${selectedDisciplinaryMember.value.first_name}!`);
  }
};

const triggerDeleteMember = (userId) => {
  confirmModal.value = {
    show: true,
    title: 'Remove Member from Roster',
    message: 'Are you sure you want to permanently remove this member from the active band roster?',
    memberId: userId
  };
};

const executeDeleteMember = async () => {
  if (confirmModal.value.memberId) {
    await bandStore.deleteMember(confirmModal.value.memberId);
  }
  confirmModal.value.show = false;
};

onMounted(() => {
  bandStore.fetchRoster();
});
</script>
