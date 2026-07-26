<template>
  <div class="space-y-8 text-left">
    
    <!-- Top Band Practice Summary Banner -->
    <div class="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#12151e] via-[#1a1e2e] to-[#12151e]">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-[#F5C518]/10 border border-[#F5C518]/20 flex items-center justify-center text-[#F5C518] text-2xl shrink-0">
          <i class="fa-solid fa-stopwatch"></i>
        </div>
        <div>
          <h3 class="text-lg font-extrabold text-white">Weekly Rehearsal Summary</h3>
          <p class="text-xs text-gray-400">Total logged practice hours across all band sections</p>
        </div>
      </div>
      <div class="flex items-center gap-6">
        <div class="text-right">
          <span class="text-2xl font-black gold-gradient-text">{{ bandStore.totalPracticeHoursThisWeek.toFixed(1) }}</span>
          <span class="text-xs text-gray-400 font-bold ml-1 uppercase">Hours</span>
        </div>
        <router-link to="/tools" class="px-4 py-2 bg-[#F5C518] text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-[#d4a914] transition-all">
          <i class="fa-solid fa-plus mr-1"></i> Log Practice
        </router-link>
      </div>
    </div>

    <!-- Main Grid: Announcements Feed & Event Roadmap -->
    <div class="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] xl:grid-cols-[1.5fr_1fr] gap-6 md:gap-8">
      
      <!-- Announcements Section -->
      <section>
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <i class="fa-solid fa-bullhorn text-[#F5C518]"></i> Band Announcements
          </h2>
          <button v-if="authStore.canManageDashboard" @click="emit('open-add-post')"
            class="text-xs bg-[#F5C518] text-black px-4 py-2 font-bold uppercase tracking-wider rounded-xl hover:scale-105 transition-transform flex items-center gap-1.5 shadow-md shadow-[#F5C518]/10">
            <i class="fa-solid fa-plus"></i> <span>Add Post</span>
          </button>
        </div>

        <div class="space-y-4">
          <div v-for="post in bandStore.posts" :key="post.id" 
            class="p-5 md:p-6 rounded-3xl border transition-all relative group flex flex-col glass-card"
            :class="post.is_urgent ? 'border-red-500/30 bg-red-950/20' : 'border-white/5'">
            
            <!-- Delete Post (Officers Only) -->
            <button v-if="authStore.canManageDashboard" @click="handleDeletePost(post.id)"
              class="absolute top-4 right-4 text-gray-500 hover:text-red-400 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2">
              <i class="fa-solid fa-trash-can"></i>
            </button>

            <!-- Metadata Header -->
            <div class="flex items-center gap-2 mb-3">
              <span v-if="post.is_urgent" class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                <i class="fa-solid fa-triangle-exclamation mr-1"></i> URGENT
              </span>
              <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {{ formatDate(post.created_at) }} • By {{ post.users?.first_name || 'Officer' }}
              </span>
            </div>

            <!-- Title & Message -->
            <h3 class="font-bold text-white text-base md:text-lg mb-2 leading-snug">{{ post.title }}</h3>
            <p class="text-xs md:text-sm text-gray-300 leading-relaxed break-words flex-1 whitespace-pre-line">{{ post.message }}</p>

            <!-- Read Acknowledgment Footer -->
            <div v-if="post.is_urgent" class="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
              <button v-if="!bandStore.hasAcknowledged(post.id)" @click="handleAcknowledge(post.id)"
                class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-1.5">
                <i class="fa-solid fa-check"></i> Mark as Read / Acknowledged
              </button>
              <span v-else class="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <i class="fa-solid fa-circle-check"></i> Acknowledged
              </span>

              <span v-if="authStore.canManageDashboard" class="text-[10px] text-[#F5C518] uppercase tracking-widest font-bold">
                <i class="fa-solid fa-eye mr-1"></i> {{ bandStore.getAckCount(post.id) }} Reads
              </span>
            </div>
          </div>

          <div v-if="bandStore.posts.length === 0" class="glass-panel p-8 rounded-3xl text-center text-gray-500 text-sm italic">
            No active announcements.
          </div>
        </div>
      </section>

      <!-- Event Roadmap Section -->
      <section>
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <i class="fa-regular fa-calendar-days text-[#0A84FF]"></i> Event Roadmap
          </h2>
          <button v-if="authStore.canManageDashboard" @click="emit('open-add-event')"
            class="text-xs bg-white/10 text-white px-4 py-2 font-bold uppercase tracking-wider rounded-xl hover:bg-white/20 transition-all flex items-center gap-1.5">
            <i class="fa-solid fa-calendar-plus"></i> <span>Add Event</span>
          </button>
        </div>

        <div class="space-y-4">
          <div v-for="event in bandStore.events" :key="event.id" 
            class="glass-card p-5 rounded-3xl border border-white/5 flex flex-col relative group">
            
            <!-- Delete Event (Officers Only) -->
            <button v-if="authStore.canManageDashboard" @click="handleDeleteEvent(event.id)"
              class="absolute top-4 right-4 text-gray-500 hover:text-red-400 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1.5">
              <i class="fa-solid fa-xmark"></i>
            </button>

            <!-- Event Header -->
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-[#0f121a] rounded-2xl border border-white/10 flex flex-col items-center justify-center text-[#F5C518] shrink-0 shadow-inner">
                <span class="text-[9px] font-extrabold uppercase tracking-widest text-gray-400">{{ formatMonth(event.event_date) }}</span>
                <span class="text-2xl font-black text-white leading-none mt-0.5">{{ formatDay(event.event_date) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-white text-base truncate">{{ event.title }}</h4>
                <p class="text-[10px] text-gray-400 uppercase tracking-wider mt-1 flex items-center gap-2">
                  <span><i class="fa-regular fa-clock mr-1 text-[#0A84FF]"></i> {{ event.time_str }}</span>
                  <span>•</span>
                  <span class="truncate"><i class="fa-solid fa-location-dot mr-1 text-red-400"></i> {{ event.location }}</span>
                </p>
              </div>
            </div>

            <!-- RSVP Buttons & Calendar Download -->
            <div class="mt-4 pt-3 border-t border-white/10 flex flex-col gap-3">
              <div class="flex gap-2">
                <button @click="bandStore.submitRSVP(event.id, 'going')"
                  :class="bandStore.getUserRSVP(event.id) === 'going' ? 'bg-emerald-500 text-black font-extrabold' : 'bg-white/5 text-gray-300 hover:bg-white/10'"
                  class="flex-1 py-2.5 rounded-xl text-[10px] uppercase font-bold transition-all border border-white/5 flex items-center justify-center gap-1">
                  <i class="fa-solid fa-thumbs-up"></i> Going
                </button>
                <button @click="bandStore.submitRSVP(event.id, 'not_going')"
                  :class="bandStore.getUserRSVP(event.id) === 'not_going' ? 'bg-red-500 text-white font-extrabold' : 'bg-white/5 text-gray-300 hover:bg-white/10'"
                  class="flex-1 py-2.5 rounded-xl text-[10px] uppercase font-bold transition-all border border-white/5 flex items-center justify-center gap-1">
                  <i class="fa-solid fa-thumbs-down"></i> Can't Make It
                </button>
                <button @click="downloadCalendarFile(event)"
                  title="Export to Calendar (.ics)"
                  class="px-3 py-2.5 bg-white/5 text-gray-300 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase transition-all border border-white/5">
                  <i class="fa-regular fa-calendar-plus text-sm"></i>
                </button>
              </div>

              <!-- Attendee Breakdown Toggle -->
              <div class="flex justify-between items-center text-[10px] text-gray-400 uppercase font-bold px-1">
                <span class="text-emerald-400 cursor-pointer hover:text-white transition-colors" @click="toggleAttendees(event.id)">
                  <i :class="expandedEventId === event.id ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'" class="mr-1"></i>
                  {{ bandStore.getRSVPStats(event.id).going }} Going
                </span>
                <span class="text-red-400 cursor-pointer hover:text-white transition-colors" @click="toggleAttendees(event.id)">
                  {{ bandStore.getRSVPStats(event.id).notGoing }} Not Going
                </span>
              </div>

              <!-- Expanded Attendee List -->
              <div v-if="expandedEventId === event.id" class="mt-2 pt-3 border-t border-white/10 space-y-3 animate-in slide-in-from-top-2">
                <div v-if="bandStore.getAttendeesList(event.id).goingList.length > 0">
                  <p class="text-[9px] font-bold uppercase text-emerald-400 tracking-widest mb-1.5">Confirmed Going</p>
                  <div class="flex flex-wrap gap-1.5">
                    <span v-for="(att, idx) in bandStore.getAttendeesList(event.id).goingList" :key="idx"
                      class="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg text-[9px] font-bold border border-emerald-500/20">
                      {{ att }}
                    </span>
                  </div>
                </div>

                <div v-if="bandStore.getAttendeesList(event.id).notGoingList.length > 0">
                  <p class="text-[9px] font-bold uppercase text-red-400 tracking-widest mb-1.5">Can't Make It</p>
                  <div class="flex flex-wrap gap-1.5">
                    <span v-for="(att, idx) in bandStore.getAttendeesList(event.id).notGoingList" :key="idx"
                      class="bg-red-500/10 text-red-400 px-2.5 py-1 rounded-lg text-[9px] font-bold border border-red-500/20">
                      {{ att }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="bandStore.events.length === 0" class="glass-panel p-8 rounded-3xl text-center text-gray-500 text-sm italic">
            No upcoming events scheduled.
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { useBandStore } from '../../stores/bandStore';

const emit = defineEmits(['open-add-post', 'open-add-event']);

const authStore = useAuthStore();
const bandStore = useBandStore();

const expandedEventId = ref(null);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatMonth = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('default', { month: 'short' });
};

const formatDay = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).getDate();
};

const toggleAttendees = (eventId) => {
  expandedEventId.value = expandedEventId.value === eventId ? null : eventId;
};

const handleAcknowledge = async (postId) => {
  try {
    await bandStore.acknowledgePost(postId);
  } catch (err) {
    console.error('Failed to acknowledge post:', err);
  }
};

const handleDeletePost = async (postId) => {
  if (confirm('Are you sure you want to delete this post?')) {
    await bandStore.deletePost(postId);
  }
};

const handleDeleteEvent = async (eventId) => {
  if (confirm('Are you sure you want to delete this event?')) {
    await bandStore.deleteEvent(eventId);
  }
};

const downloadCalendarFile = (event) => {
  if (!event.event_date || !event.time_str) return;
  const timeParts = event.time_str.trim().split(' ');
  const [hStr, mStr] = timeParts[0].split(':');
  let h = parseInt(hStr);
  const m = parseInt(mStr);
  if (timeParts.length >= 2) {
    if (timeParts[1].toUpperCase() === 'PM' && h !== 12) h += 12;
    if (timeParts[1].toUpperCase() === 'AM' && h === 12) h = 0;
  }
  const dateObj = new Date(event.event_date);
  dateObj.setHours(h, m, 0, 0);

  const dtStr = dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const ical = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${event.title}\nDTSTART:${dtStr}\nLOCATION:${event.location}\nEND:VEVENT\nEND:VCALENDAR`;

  const blob = new Blob([ical], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>
