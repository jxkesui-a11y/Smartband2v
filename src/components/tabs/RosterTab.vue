<template>
  <div class="space-y-6 text-left">
    
    <!-- Header & Search -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <i class="fa-solid fa-users text-[#F5C518]"></i> Active Band Roster
        </h2>
        <p class="text-xs text-gray-400">Directory of approved band members, officers, and instrumentation</p>
      </div>

      <div class="relative w-full md:w-72">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
        <input v-model="bandStore.searchFilter" type="text" placeholder="Search by name or instrument..."
          class="w-full glass-input rounded-2xl pl-11 pr-4 py-2.5 text-white placeholder-gray-500 text-xs focus:outline-none">
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

    <!-- Members Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div v-for="member in bandStore.filteredRoster" :key="member.id"
        class="glass-card p-6 rounded-3xl border border-white/5 flex flex-col justify-between group hover:border-[#F5C518]/30 transition-all relative">
        
        <!-- Online Status Indicator -->
        <div class="absolute top-4 right-4 flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full" :class="isOnline(member.last_seen) ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'"></span>
          <span class="text-[9px] font-bold uppercase tracking-wider text-gray-500">
            {{ isOnline(member.last_seen) ? 'Online' : 'Offline' }}
          </span>
        </div>

        <div>
          <!-- Member Avatar & Name -->
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1a1e2e] to-[#252a3e] border border-white/10 flex items-center justify-center font-black text-xl text-[#F5C518] mb-4 shadow-md">
            {{ member.first_name[0] }}{{ member.last_name[0] }}
          </div>

          <h3 class="font-bold text-white text-base leading-tight">{{ member.first_name }} {{ member.last_name }}</h3>
          <p class="text-xs text-gray-400 font-medium mt-0.5">{{ member.email }}</p>

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

        <!-- Officer Actions -->
        <div v-if="authStore.isOfficer" class="mt-6 pt-4 border-t border-white/10 flex items-center gap-2">
          <button @click="emit('open-edit-member', member)"
            class="flex-1 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all border border-white/5 flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-user-pen"></i> Edit Member
          </button>
          
          <button v-if="authStore.isAdmin && member.id !== authStore.currentUser.id"
            @click="handleDeleteMember(member.id)"
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
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { useBandStore } from '../../stores/bandStore';

const emit = defineEmits(['open-edit-member']);

const authStore = useAuthStore();
const bandStore = useBandStore();

const sectionOptions = ['All', 'Trumpet', 'Alto Sax', 'Tenor Sax', 'Clarinet', 'Flute', 'Trombone', 'Tuba', 'Percussion'];

const isOnline = (lastSeenStr) => {
  if (!lastSeenStr) return false;
  return (new Date() - new Date(lastSeenStr)) < 300000;
};

const handleDeleteMember = async (userId) => {
  if (confirm('Permanently remove this member from the roster?')) {
    await bandStore.deleteMember(userId);
  }
};

onMounted(() => {
  bandStore.fetchRoster();
});
</script>
