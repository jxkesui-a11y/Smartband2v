<template>
  <div class="space-y-8 text-left">
    
    <div>
      <h2 class="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
        <i class="fa-solid fa-sliders text-[#F5C518]"></i> Band Practice & Rehearsal Utilities
      </h2>
      <p class="text-xs text-gray-400">Interactive metronome, pitch reference tuner, and practice hour logger</p>
    </div>

    <!-- Metronome & Pitch Generator Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- 1. Web Audio Metronome -->
      <div class="glass-card p-6 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-[#F5C518]/10 text-[#F5C518] flex items-center justify-center font-bold">
              <i class="fa-solid fa-[#F5C518] fa-drum text-lg"></i>
            </div>
            <div>
              <h3 class="font-bold text-white text-base">Band Metronome</h3>
              <p class="text-xs text-gray-400">Web Audio API engine</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span v-for="b in timeSigBeats" :key="b"
              :class="currentBeat === b && isPlaying ? 'bg-[#F5C518] text-black scale-125 shadow-lg shadow-[#F5C518]/30 font-black' : 'bg-white/10 text-gray-400'"
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all">
              {{ b }}
            </span>
          </div>
        </div>

        <!-- Tempo Display -->
        <div class="text-center py-4 bg-[#0f121a] rounded-2xl border border-white/10">
          <div class="text-5xl font-black gold-gradient-text tracking-tight font-mono">{{ bpm }}</div>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">BPM • Tempo</p>
        </div>

        <!-- Slider & Controls -->
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <button @click="bpm = Math.max(40, bpm - 1)" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-lg">-</button>
            <input type="range" v-model.number="bpm" min="40" max="240" class="flex-1 accent-[#F5C518] cursor-pointer">
            <button @click="bpm = Math.min(240, bpm + 1)" class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-lg">+</button>
          </div>

          <div class="flex gap-3">
            <button @click="toggleMetronome"
              :class="isPlaying ? 'bg-red-500 text-white' : 'bg-[#F5C518] text-black'"
              class="flex-1 py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg">
              <i class="fa-solid" :class="isPlaying ? 'fa-square' : 'fa-play'"></i>
              <span>{{ isPlaying ? 'Stop Metronome' : 'Start Metronome' }}</span>
            </button>

            <button @click="handleTapTempo"
              class="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs uppercase font-bold tracking-wider transition-all border border-white/5">
              Tap Tempo
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Pitch Reference Generator -->
      <div class="glass-card p-6 rounded-3xl border border-white/5 space-y-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-[#0A84FF]/10 text-[#0A84FF] flex items-center justify-center font-bold">
            <i class="fa-solid fa-wave-square text-lg"></i>
          </div>
          <div>
            <h3 class="font-bold text-white text-base">Pitch Reference Generator</h3>
            <p class="text-xs text-gray-400">Warm-up & tuning reference tones</p>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button v-for="pitch in pitches" :key="pitch.name"
            @click="togglePitchTone(pitch)"
            :class="activePitch === pitch.name ? 'bg-[#0A84FF] text-white font-extrabold shadow-lg shadow-[#0A84FF]/30 scale-105' : 'bg-white/5 text-gray-300 hover:bg-white/10'"
            class="py-4 rounded-2xl text-center transition-all border border-white/5">
            <div class="text-lg font-black">{{ pitch.name }}</div>
            <div class="text-[10px] opacity-70 uppercase tracking-wider font-bold">{{ pitch.freq }} Hz</div>
          </button>
        </div>

        <div class="p-4 bg-[#0f121a] rounded-2xl border border-white/10 flex items-center justify-between text-xs text-gray-400">
          <span><i class="fa-solid fa-info-circle text-[#0A84FF] mr-1"></i> Standard Concert A440 & Concert Pitch Warming Tones</span>
          <button v-if="activePitch" @click="stopPitchTone" class="text-red-400 font-bold uppercase text-[10px]">
            Stop Pitch
          </button>
        </div>
      </div>
    </div>

    <!-- 3. Practice Hour Logger Section -->
    <div class="glass-card p-6 rounded-3xl border border-white/5 space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-[#32d74b]/10 text-[#32d74b] flex items-center justify-center font-bold">
            <i class="fa-solid fa-book-journal-whills text-lg"></i>
          </div>
          <div>
            <h3 class="font-bold text-white text-base">Practice & Rehearsal Log</h3>
            <p class="text-xs text-gray-400">Record practice duration and pieces worked on</p>
          </div>
        </div>
      </div>

      <!-- Log Form -->
      <form @submit.prevent="handleLogPractice" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Duration (Minutes)</label>
          <input v-model.number="logMinutes" type="number" min="5" max="480" placeholder="e.g. 45" required
            class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Piece Practiced</label>
          <input v-model="logPiece" type="text" placeholder="e.g. Stars and Stripes Forever" required
            class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Notes / Focus</label>
          <input v-model="logNotes" type="text" placeholder="e.g. Practiced measure 32-64 articulation"
            class="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
        </div>

        <div class="flex items-end">
          <button type="submit" :disabled="!logMinutes || !logPiece.trim()"
            class="w-full py-3.5 bg-[#32d74b] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider hover:bg-[#28b83e] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <i class="fa-solid fa-plus"></i> Save Practice Log
          </button>
        </div>
      </form>

      <!-- Practice Logs History Table -->
      <div class="overflow-x-auto pt-2">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider">
              <th class="py-3 px-4">Member</th>
              <th class="py-3 px-4">Instrument</th>
              <th class="py-3 px-4">Piece</th>
              <th class="py-3 px-4">Duration</th>
              <th class="py-3 px-4">Notes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="log in bandStore.practiceLogs" :key="log.id" class="hover:bg-white/5 transition-colors">
              <td class="py-3 px-4 font-bold text-white">{{ log.user_name }}</td>
              <td class="py-3 px-4 text-[#F5C518] font-bold">{{ log.instrument }}</td>
              <td class="py-3 px-4 text-gray-300">{{ log.piece_name }}</td>
              <td class="py-3 px-4 font-bold text-emerald-400">{{ log.duration_minutes }} mins</td>
              <td class="py-3 px-4 text-gray-400 truncate max-w-xs">{{ log.notes || '-' }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="bandStore.practiceLogs.length === 0" class="text-center py-6 text-gray-500 italic text-xs">
          No practice logs recorded yet. Be the first to submit a log!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { useBandStore } from '../../stores/bandStore';

const bandStore = useBandStore();

// Metronome Logic
const bpm = ref(120);
const isPlaying = ref(false);
const currentBeat = ref(1);
const timeSigBeats = [1, 2, 3, 4];
let metronomeTimer = null;
let audioCtx = null;

const playClickSound = (isFirstBeat) => {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.frequency.value = isFirstBeat ? 1000 : 700;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.09);
  } catch (e) {}
};

const toggleMetronome = () => {
  if (isPlaying.value) {
    clearInterval(metronomeTimer);
    isPlaying.value = false;
    currentBeat.value = 1;
  } else {
    isPlaying.value = true;
    const intervalMs = (60 / bpm.value) * 1000;
    playClickSound(currentBeat.value === 1);
    metronomeTimer = setInterval(() => {
      currentBeat.value = (currentBeat.value % 4) + 1;
      playClickSound(currentBeat.value === 1);
    }, intervalMs);
  }
};

// Tap Tempo
let tapTimes = [];
const handleTapTempo = () => {
  const now = Date.now();
  tapTimes.push(now);
  if (tapTimes.length > 4) tapTimes.shift();
  if (tapTimes.length > 1) {
    const diffs = [];
    for (let i = 1; i < tapTimes.length; i++) {
      diffs.push(tapTimes[i] - tapTimes[i - 1]);
    }
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    bpm.value = Math.min(240, Math.max(40, Math.round(60000 / avgDiff)));
  }
};

// Pitch Generator Logic
const activePitch = ref(null);
let pitchOsc = null;
let pitchGain = null;

const pitches = [
  { name: 'Concert A440', freq: 440 },
  { name: 'Bb4 Pitch', freq: 466.16 },
  { name: 'F4 Pitch', freq: 349.23 },
  { name: 'C4 Pitch', freq: 261.63 }
];

const togglePitchTone = (pitch) => {
  if (activePitch.value === pitch.name) {
    stopPitchTone();
  } else {
    stopPitchTone();
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      pitchOsc = audioCtx.createOscillator();
      pitchGain = audioCtx.createGain();
      pitchOsc.type = 'sine';
      pitchOsc.frequency.value = pitch.freq;
      pitchGain.gain.setValueAtTime(0.2, audioCtx.currentTime);

      pitchOsc.connect(pitchGain);
      pitchGain.connect(audioCtx.destination);
      pitchOsc.start();
      activePitch.value = pitch.name;
    } catch (e) {}
  }
};

const stopPitchTone = () => {
  if (pitchOsc) {
    pitchOsc.stop();
    pitchOsc.disconnect();
    pitchOsc = null;
  }
  activePitch.value = null;
};

// Practice Logger Logic
const logMinutes = ref(45);
const logPiece = ref('');
const logNotes = ref('');

const handleLogPractice = async () => {
  if (!logMinutes.value || !logPiece.value.trim()) return;
  await bandStore.addPracticeLog(logMinutes.value, logPiece.value.trim(), logNotes.value.trim());
  logPiece.value = '';
  logNotes.value = '';
};

onUnmounted(() => {
  if (metronomeTimer) clearInterval(metronomeTimer);
  stopPitchTone();
  if (audioCtx) audioCtx.close();
});
</script>
