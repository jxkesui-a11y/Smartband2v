<template>
  <div class="space-y-6 text-left">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <i class="fa-solid fa-user-shield text-[#F5C518]"></i> Member Verification & Applications
        </h2>
        <p class="text-xs text-gray-400">Review application forms, verify member identity documents, and grant access</p>
      </div>

      <button @click="$emit('open-application-form')"
        class="bg-[#F5C518] text-black px-4 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-[#d4a914] transition-all flex items-center gap-2 shadow-md">
        <i class="fa-solid fa-plus"></i> Submit New Application
      </button>
    </div>

    <!-- Applications List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="req in bandStore.pendingUsers" :key="req.id"
        class="glass-card p-6 rounded-3xl border border-white/5 flex flex-col justify-between space-y-4 relative">
        
        <div>
          <!-- Badge Header -->
          <div class="flex items-center justify-between mb-3">
            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Awaiting Verification
            </span>
            <span class="text-[10px] text-gray-500 font-mono">{{ formatDate(req.created_at) }}</span>
          </div>

          <!-- Applicant Name & Email -->
          <h3 class="font-extrabold text-white text-base">{{ req.first_name }} {{ req.last_name }}</h3>
          <p class="text-xs text-gray-400 mt-0.5">{{ req.email }}</p>

          <!-- Instrument & Tier -->
          <div class="flex flex-wrap gap-2 mt-3">
            <span class="px-2.5 py-1 rounded-xl text-[9px] font-extrabold uppercase tracking-widest bg-[#F5C518]/10 text-[#F5C518] border border-[#F5C518]/20">
              {{ req.instrument }}
            </span>

            <span class="px-2.5 py-1 rounded-xl text-[9px] font-extrabold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {{ req.tier || 'Junior' }}
            </span>
          </div>

          <!-- Application Details Box -->
          <div class="mt-4 p-3 bg-[#12151e] rounded-2xl border border-white/5 space-y-1.5 text-xs text-gray-300">
            <p v-if="req.phone"><strong>Phone:</strong> {{ req.phone }}</p>
            <p v-if="req.emergency_name"><strong>Emergency:</strong> {{ req.emergency_name }} ({{ req.emergency_phone }})</p>
            <p v-if="req.availability_notes"><strong>Availability:</strong> {{ req.availability_notes }}</p>
            
            <div v-if="req.id_file" class="pt-1">
              <span class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <i class="fa-solid fa-file-image"></i> ID Attachment Uploaded
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-3 border-t border-white/10">
          <button @click="triggerDecline(req.id)"
            class="flex-1 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold rounded-xl text-xs uppercase tracking-wider transition-all border border-red-500/20">
            Decline
          </button>

          <button @click="handleApprove(req.id)"
            class="flex-1 py-2.5 bg-emerald-500 text-black hover:bg-emerald-400 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1">
            <i class="fa-solid fa-check"></i> Verify & Approve
          </button>
        </div>
      </div>
    </div>

    <div v-if="bandStore.pendingUsers.length === 0" class="glass-panel p-12 rounded-3xl text-center text-gray-500 space-y-3">
      <i class="fa-solid fa-clipboard-check text-4xl text-emerald-400"></i>
      <p class="text-sm font-bold text-white">All caught up! No pending verification applications.</p>
    </div>

    <!-- Confirm Decline Modal -->
    <ConfirmModal
      :show="confirmModal.show"
      :title="confirmModal.title"
      :message="confirmModal.message"
      confirmText="Decline Application"
      :isDanger="true"
      @confirm="executeDecline"
      @cancel="confirmModal.show = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBandStore } from '../../stores/bandStore';
import ConfirmModal from '../modals/ConfirmModal.vue';

defineEmits(['open-application-form']);

const bandStore = useBandStore();

const confirmModal = ref({
  show: false,
  title: '',
  message: '',
  reqId: null
});

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
};

const handleApprove = async (id) => {
  await bandStore.approveUser(id);
};

const triggerDecline = (id) => {
  confirmModal.value = {
    show: true,
    title: 'Decline Application Request',
    message: 'Are you sure you want to decline and remove this member registration application?',
    reqId: id
  };
};

const executeDecline = async () => {
  if (confirmModal.value.reqId) {
    await bandStore.declineUser(confirmModal.value.reqId);
  }
  confirmModal.value.show = false;
};

onMounted(() => {
  bandStore.fetchPendingUsers();
});
</script>
