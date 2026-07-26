<template>
  <div class="space-y-6 text-left">
    
    <div>
      <h2 class="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
        <i class="fa-solid fa-user-shield text-[#F5C518]"></i> Pending Access Requests
      </h2>
      <p class="text-xs text-gray-400">Approve or reject new member registrations seeking entry</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="req in bandStore.pendingUsers" :key="req.id"
        class="glass-card p-6 rounded-3xl border border-white/5 flex flex-col justify-between space-y-4">
        
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Awaiting Officer Approval
            </span>
            <span class="text-[10px] text-gray-500 font-mono">{{ formatDate(req.created_at) }}</span>
          </div>

          <h3 class="font-bold text-white text-base">{{ req.first_name }} {{ req.last_name }}</h3>
          <p class="text-xs text-gray-400 mt-0.5">{{ req.email }}</p>
          <p class="text-xs font-bold text-[#F5C518] mt-2 uppercase tracking-wider">Instrument: {{ req.instrument }}</p>
        </div>

        <div class="flex gap-3 pt-3 border-t border-white/10">
          <button @click="handleDecline(req.id)"
            class="flex-1 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold rounded-xl text-xs uppercase tracking-wider transition-all border border-red-500/20">
            Decline
          </button>

          <button @click="handleApprove(req.id)"
            class="flex-1 py-2.5 bg-emerald-500 text-black hover:bg-emerald-400 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1">
            <i class="fa-solid fa-check"></i> Approve
          </button>
        </div>
      </div>
    </div>

    <div v-if="bandStore.pendingUsers.length === 0" class="glass-panel p-12 rounded-3xl text-center text-gray-500 space-y-3">
      <i class="fa-solid fa-clipboard-check text-4xl text-emerald-400"></i>
      <p class="text-sm font-bold text-white">All caught up! No pending access requests.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useBandStore } from '../../stores/bandStore';

const bandStore = useBandStore();

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
};

const handleApprove = async (id) => {
  await bandStore.approveUser(id);
};

const handleDecline = async (id) => {
  if (confirm('Decline and remove this access request?')) {
    await bandStore.declineUser(id);
  }
};

onMounted(() => {
  bandStore.fetchPendingUsers();
});
</script>
