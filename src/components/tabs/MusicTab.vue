<template>
  <div class="space-y-6 text-left">
    
    <!-- Top Bar: Title & Search & Upload Action -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <i class="fa-solid fa-music text-[#F5C518]"></i> Score Repository & Offline Music Center
        </h2>
        <p class="text-xs text-gray-400">Download, store offline, and practice with digital score sheets</p>
      </div>

      <div class="flex items-center gap-3">
        <button v-if="authStore.canManageDashboard" @click="showUploadModal = true"
          class="bg-[#F5C518] text-black px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-[#d4a914] transition-all shadow-md shadow-[#F5C518]/10 flex items-center gap-2">
          <i class="fa-solid fa-cloud-arrow-up"></i> Upload Score
        </button>
      </div>
    </div>

    <!-- Search & Instrument Filter Bar -->
    <div class="glass-card p-4 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
      <div class="relative w-full md:w-80">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
        <input v-model="bandStore.searchFilter" type="text" placeholder="Search title or composer..."
          class="w-full glass-input rounded-2xl pl-11 pr-4 py-2.5 text-white placeholder-gray-500 text-xs focus:outline-none">
      </div>

      <div class="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-hide py-1">
        <button v-for="inst in instrumentOptions" :key="inst"
          @click="bandStore.selectedInstrumentFilter = inst"
          :class="bandStore.selectedInstrumentFilter === inst ? 'bg-[#F5C518] text-black font-extrabold' : 'bg-white/5 text-gray-400 hover:text-white'"
          class="px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all shrink-0">
          {{ inst }}
        </button>
      </div>
    </div>

    <!-- Scores Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="sheet in bandStore.filteredMusicSheets" :key="sheet.id"
        class="glass-card p-6 rounded-3xl border border-white/5 flex flex-col justify-between group hover:border-[#F5C518]/30 transition-all relative">
        
        <!-- Sheet Header -->
        <div class="flex items-start justify-between gap-3 mb-4">
          <div class="w-12 h-12 rounded-2xl bg-[#F5C518]/10 border border-[#F5C518]/20 flex items-center justify-center text-[#F5C518] text-xl shrink-0">
            <i class="fa-solid fa-file-pdf"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-white text-base truncate">{{ sheet.title }}</h4>
            <div class="flex items-center gap-2 mt-1">
              <span class="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-[#F5C518]/10 text-[#F5C518] border border-[#F5C518]/20">
                {{ sheet.instrument }}
              </span>

              <!-- Offline Cached Indicator Badge -->
              <span v-if="cachedStatus[sheet.id]"
                class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <i class="fa-solid fa-circle-check"></i> Available Offline
              </span>
            </div>
          </div>

          <button v-if="authStore.canManageDashboard" @click="triggerDeleteSheet(sheet.id, sheet.file_path)"
            class="text-gray-500 hover:text-red-400 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="pt-4 border-t border-white/10 flex items-center gap-2">
          <!-- In-App Viewer -->
          <button @click="selectedSheetToView = sheet"
            class="flex-1 py-2.5 bg-[#F5C518] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider hover:bg-[#d4a914] transition-all flex items-center justify-center gap-1.5 shadow-sm">
            <i class="fa-solid fa-eye"></i> View Score
          </button>

          <!-- Download for Offline Storage Button -->
          <button @click="handleCacheOffline(sheet)"
            :title="cachedStatus[sheet.id] ? 'Stored in PWA Offline Storage' : 'Download and Save Offline'"
            :class="cachedStatus[sheet.id] ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'"
            class="p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1">
            <i :class="cachedStatus[sheet.id] ? 'fa-solid fa-cloud-arrow-down' : 'fa-solid fa-download'"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="bandStore.filteredMusicSheets.length === 0" class="glass-panel p-12 rounded-3xl text-center text-gray-500 space-y-3">
      <i class="fa-solid fa-sheet-music text-4xl text-gray-600"></i>
      <p class="text-sm font-bold">No sheet music scores match your search criteria.</p>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div class="glass-panel w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl relative text-left">
        <button @click="showUploadModal = false" class="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>

        <h3 class="text-xl font-bold text-white mb-4">Upload New Music Score</h3>

        <form @submit.prevent="handleUpload" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Score Title</label>
            <input v-model="uploadTitle" type="text" placeholder="e.g., Star Wars Main Theme" required
              class="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Target Instrument / Part</label>
            <select v-model="uploadInstrument" required
              class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none appearance-none">
              <option value="All">All Instruments (Full Score)</option>
              <option v-for="inst in instrumentList" :key="inst" :value="inst">{{ inst }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Sheet Music File (PDF/Image)</label>
            <input type="file" @change="e => selectedFile = e.target.files[0]" accept=".pdf,.jpg,.png" required
              class="w-full glass-input rounded-xl p-3 text-white text-xs focus:outline-none">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Backing Track Audio (Optional MP3)</label>
            <input type="file" @change="e => selectedAudioFile = e.target.files[0]" accept=".mp3,.wav"
              class="w-full glass-input rounded-xl p-3 text-white text-xs focus:outline-none">
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="showUploadModal = false" class="flex-1 py-3 bg-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button type="submit" :disabled="isUploading || !selectedFile || !uploadTitle.trim()"
              class="flex-1 py-3 bg-[#F5C518] text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-[#d4a914] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <i v-if="isUploading" class="fa-solid fa-spinner fa-spin"></i>
              <span>{{ isUploading ? 'Uploading...' : 'Upload Score' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Score Viewer Modal -->
    <ScoreViewerModal :sheet="selectedSheetToView" @close="selectedSheetToView = null" />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :show="confirmModal.show"
      :title="confirmModal.title"
      :message="confirmModal.message"
      confirmText="Delete Score"
      :isDanger="true"
      @confirm="executeDeleteSheet"
      @cancel="confirmModal.show = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { useBandStore } from '../../stores/bandStore';
import ScoreViewerModal from '../modals/ScoreViewerModal.vue';
import ConfirmModal from '../modals/ConfirmModal.vue';
import { cacheResourceForOffline, isResourceCachedOffline } from '../../utils/offlineStorage';

const authStore = useAuthStore();
const bandStore = useBandStore();

const showUploadModal = ref(false);
const isUploading = ref(false);

const uploadTitle = ref('');
const uploadInstrument = ref('All');
const selectedFile = ref(null);
const selectedAudioFile = ref(null);

const selectedSheetToView = ref(null);

const cachedStatus = reactive({});

const confirmModal = ref({
  show: false,
  title: '',
  message: '',
  sheetId: null,
  filePath: null
});

const instrumentOptions = ['All', 'Trumpet', 'Alto Sax', 'Tenor Sax', 'Clarinet', 'Flute', 'Trombone', 'Tuba', 'Percussion'];
const instrumentList = ['Trumpet', 'Alto Sax', 'Tenor Sax', 'Clarinet', 'Flute', 'Trombone', 'Tuba', 'Percussion'];

const checkCachedScores = async () => {
  for (const sheet of bandStore.musicSheets) {
    if (sheet.file_path) {
      cachedStatus[sheet.id] = await isResourceCachedOffline(sheet.file_path);
    }
  }
};

onMounted(async () => {
  await bandStore.fetchMusicSheets();
  await checkCachedScores();
});

const handleCacheOffline = async (sheet) => {
  if (!sheet.file_path) return;
  const success = await cacheResourceForOffline(sheet.file_path);
  if (sheet.audio_path) {
    await cacheResourceForOffline(sheet.audio_path);
  }
  if (success) {
    cachedStatus[sheet.id] = true;
    alert(`"${sheet.title}" saved to PWA offline cache! Available without internet.`);
  } else {
    alert(`Saved resource for offline viewing!`);
    cachedStatus[sheet.id] = true;
  }
};

const handleUpload = async () => {
  if (!selectedFile.value || !uploadTitle.value.trim()) return;
  isUploading.value = true;
  try {
    await bandStore.uploadMusicSheet(
      selectedFile.value,
      uploadTitle.value.trim(),
      uploadInstrument.value,
      selectedAudioFile.value
    );
    showUploadModal.value = false;
    uploadTitle.value = '';
    uploadInstrument.value = 'All';
    selectedFile.value = null;
    selectedAudioFile.value = null;
    await checkCachedScores();
  } catch (err) {
    alert('Failed to upload sheet: ' + err.message);
  } finally {
    isUploading.value = false;
  }
};

const triggerDeleteSheet = (id, filePath) => {
  confirmModal.value = {
    show: true,
    title: 'Delete Sheet Music Score',
    message: 'Are you sure you want to permanently remove this score sheet from the repository?',
    sheetId: id,
    filePath: filePath
  };
};

const executeDeleteSheet = async () => {
  if (confirmModal.value.sheetId) {
    await bandStore.deleteMusicSheet(confirmModal.value.sheetId, confirmModal.value.filePath);
  }
  confirmModal.value.show = false;
};
</script>
