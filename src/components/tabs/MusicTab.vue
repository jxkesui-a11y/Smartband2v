<template>
  <div class="space-y-6 text-left">
    
    <!-- Top Bar: Title & Search & Upload Action -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <i class="fa-solid fa-music text-[#F5C518]"></i> Score Repository & Sheet Music
        </h2>
        <p class="text-xs text-gray-400">Preview, download, and practice with digital sheet music</p>
      </div>

      <button v-if="authStore.canManageDashboard" @click="showUploadModal = true"
        class="bg-[#F5C518] text-black px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-[#d4a914] transition-all shadow-md shadow-[#F5C518]/10 flex items-center gap-2">
        <i class="fa-solid fa-cloud-arrow-up"></i> Upload Sheet / Score
      </button>
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
            <span class="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-[#F5C518]/10 text-[#F5C518] border border-[#F5C518]/20">
              {{ sheet.instrument }}
            </span>
          </div>

          <button v-if="authStore.canManageDashboard" @click="handleDeleteSheet(sheet.id, sheet.file_path)"
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

          <!-- Direct Download -->
          <a :href="sheet.file_path" target="_blank" download title="Download file"
            class="p-2.5 bg-white/5 text-gray-300 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/5">
            <i class="fa-solid fa-download"></i>
          </a>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { useBandStore } from '../../stores/bandStore';
import ScoreViewerModal from '../modals/ScoreViewerModal.vue';

const authStore = useAuthStore();
const bandStore = useBandStore();

const showUploadModal = ref(false);
const isUploading = ref(false);

const uploadTitle = ref('');
const uploadInstrument = ref('All');
const selectedFile = ref(null);
const selectedAudioFile = ref(null);

const selectedSheetToView = ref(null);

const instrumentOptions = ['All', 'Trumpet', 'Alto Sax', 'Tenor Sax', 'Clarinet', 'Flute', 'Trombone', 'Tuba', 'Percussion'];
const instrumentList = ['Trumpet', 'Alto Sax', 'Tenor Sax', 'Clarinet', 'Flute', 'Trombone', 'Tuba', 'Percussion'];

onMounted(() => {
  bandStore.fetchMusicSheets();
});

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
  } catch (err) {
    alert('Failed to upload sheet: ' + err.message);
  } finally {
    isUploading.value = false;
  }
};

const handleDeleteSheet = async (id, filePath) => {
  if (confirm('Permanently delete this score sheet?')) {
    await bandStore.deleteMusicSheet(id, filePath);
  }
};
</script>
