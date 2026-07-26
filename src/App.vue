<template>
  <div id="smartband-root"
    :class="[
      authStore.currentUser?.large_text ? 'senior-text-mode' : '',
      authStore.currentUser?.high_contrast ? 'high-contrast-mode' : ''
    ]"
    class="min-h-screen bg-[#090a0f] text-gray-100 font-sans selection:bg-[#F5C518] selection:text-black">
    
    <!-- Login Screen -->
    <Login v-if="!authStore.isLoggedIn" @login-success="handleLoginSuccess" />

    <!-- Offline Alert Banner -->
    <div v-if="isOffline" class="bg-red-600 text-white text-[10px] font-extrabold text-center py-1.5 fixed top-0 left-0 right-0 z-[9999] uppercase tracking-[0.2em] animate-pulse">
      <i class="fa-solid fa-wifi mr-2"></i> Offline Mode: Viewing cached music sheets & data.
    </div>

    <!-- PWA Install Prompt Banner -->
    <div v-if="deferredInstallPrompt && !installBannerDismissed"
      class="bg-gradient-to-r from-[#F5C518] to-[#ffd700] text-black px-4 py-2 fixed top-0 left-0 right-0 z-[9998] shadow-lg flex items-center justify-between font-bold text-xs">
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-mobile-screen text-base"></i>
        <span>Install SmartBand 2.0 App on your Home Screen for full offline capabilities!</span>
      </div>
      <div class="flex items-center gap-2">
        <button @click="triggerPwaInstall" class="bg-black text-white px-3 py-1 rounded-xl text-[10px] uppercase font-extrabold hover:bg-gray-900 transition-all">
          Install App
        </button>
        <button @click="installBannerDismissed = true" class="text-black hover:text-gray-800 p-1">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>

    <!-- Toast Notification Overlay -->
    <div v-if="toast.show" 
      class="fixed top-6 right-1/2 translate-x-1/2 md:translate-x-0 md:right-8 z-[10000] px-6 py-3.5 rounded-2xl shadow-2xl transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2 animate-in slide-in-from-top-4"
      :class="toast.type === 'error' ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-emerald-500 text-black shadow-emerald-500/20'">
      <i :class="toast.type === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'"></i>
      <span>{{ toast.message }}</span>
    </div>

    <!-- Main Authenticated Layout Shell -->
    <div v-if="authStore.isLoggedIn" class="min-h-screen p-4 md:p-6 flex gap-6" :class="isOffline || deferredInstallPrompt ? 'pt-10' : ''">
      
      <!-- Backdrop glow -->
      <div class="fixed bottom-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(245,197,24,0.06)_0%,rgba(0,0,0,0)_70%)] pointer-events-none -z-10 animate-glow"></div>

      <!-- Backdrop Overlay for Mobile Drawer -->
      <div v-if="showMobileMenu" @click="closeMenus" class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"></div>

      <!-- Desktop Sidebar -->
      <aside class="w-64 shrink-0 glass-panel rounded-3xl p-5 flex flex-col hidden md:flex shadow-2xl relative z-50 justify-between">
        <div>
          <!-- Logo & Brand Header -->
          <div class="flex items-center gap-3 text-xl font-extrabold text-white mb-8 px-2 tracking-tight">
            <div class="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-[#f5c518] to-[#ffd700] text-black flex items-center justify-center shadow-lg shadow-[#f5c518]/20">
              <i class="fa-solid fa-music"></i>
            </div>
            <span>SmartBand <span class="text-[#f5c518]">2.0</span></span>
          </div>

          <!-- Navigation Links -->
          <nav class="space-y-1.5">
            <router-link v-for="tab in filteredTabs" :key="tab.id" :to="tab.path"
              @click="showMobileMenu = false"
              v-slot="{ isActive }">
              <button class="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all text-left relative"
                :class="isActive ? 'bg-[#1a1e2e] text-white border border-white/10 shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'">
                <i :class="tab.icon" class="w-5 text-center text-sm"></i>
                <span class="flex-1">{{ tab.name }}</span>
                <span v-if="tab.id === 'requests' && bandStore.pendingUsers.length > 0"
                  class="w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {{ bandStore.pendingUsers.length }}
                </span>
              </button>
            </router-link>
          </nav>
        </div>

        <!-- Sidebar Bottom Tools: Scope & Attendance -->
        <div class="space-y-2">
          <button @click="showScopeModal = true" class="w-full py-2.5 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-white/5">
            <i class="fa-solid fa-compass-drafting text-[#0A84FF]"></i> <span>Scope & Limitations</span>
          </button>

          <button @click="showAttendanceModal = true" class="w-full py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-qrcode"></i> <span>Rehearsal Check-In</span>
          </button>
        </div>
      </aside>

      <!-- Mobile Navigation Drawer -->
      <div v-if="showMobileMenu" class="fixed top-[80px] left-4 right-4 glass-panel border border-white/10 rounded-3xl shadow-2xl z-50 p-4 md:hidden animate-in slide-in-from-top-4">
        <nav class="space-y-1.5 mb-3">
          <router-link v-for="tab in filteredTabs" :key="tab.id" :to="tab.path"
            @click="showMobileMenu = false"
            v-slot="{ isActive }">
            <button class="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-left"
              :class="isActive ? 'bg-[#1a1e2e] text-white border border-white/10' : 'text-gray-400'">
              <i :class="tab.icon" class="w-5 text-center text-sm"></i>
              <span class="flex-1">{{ tab.name }}</span>
            </button>
          </router-link>
        </nav>

        <button @click="showScopeModal = true; closeMenus()" class="w-full py-2.5 bg-white/5 text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
          <i class="fa-solid fa-compass-drafting text-[#0A84FF]"></i> Scope & Limitations
        </button>
      </div>

      <!-- Main Content Area -->
      <main class="flex-1 glass-panel rounded-3xl border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
        
        <!-- Header App Bar -->
        <header class="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-[#12151e]/60 backdrop-blur-md relative z-40">
          <div class="flex items-center gap-4">
            <button @click="showMobileMenu = !showMobileMenu" class="md:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white">
              <i class="fa-solid fa-bars"></i>
            </button>

            <div>
              <h1 class="text-lg md:text-xl font-extrabold text-white tracking-wider uppercase">
                {{ currentRouteName }}
              </h1>
              <p class="text-xs text-gray-400">
                Category: <span class="text-[#F5C518] font-bold capitalize">{{ authStore.currentUser?.tier || 'Junior' }}</span>
                <span class="mx-1.5">•</span>
                <span class="text-white font-bold">{{ authStore.currentUser?.instrument }}</span>
              </p>
            </div>
          </div>

          <!-- User Menu & Initials -->
          <div class="relative">
            <!-- Invisible overlay to close dropdown -->
            <div v-if="showProfileMenu" @click="showProfileMenu = false" class="fixed inset-0 z-40"></div>

            <button @click="showProfileMenu = !showProfileMenu" class="relative z-50 w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#f5c518] to-[#ffd700] text-black font-black text-sm flex items-center justify-center shadow-md shadow-[#f5c518]/20 hover:scale-105 transition-transform">
              {{ authStore.userInitials }}
            </button>

            <div v-if="showProfileMenu" class="absolute right-0 mt-3 w-64 bg-[#090a0f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in">
              <div class="p-4 bg-[#1a1e2e] border-b border-white/10 text-left">
                <p class="text-white font-bold text-sm leading-tight">{{ authStore.currentUser?.first_name }} {{ authStore.currentUser?.last_name }}</p>
                <p class="text-[10px] text-[#F5C518] uppercase tracking-widest font-extrabold mt-1">{{ authStore.currentUser?.role }} Status</p>
              </div>

              <button @click="showMyProfileModal = true; closeMenus()" class="p-3.5 text-left text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 border-b border-white/5">
                <i class="fa-solid fa-user-pen text-[#F5C518]"></i> Edit Profile & Availability
              </button>

              <button @click="showScopeModal = true; closeMenus()" class="p-3.5 text-left text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 border-b border-white/5">
                <i class="fa-solid fa-compass-drafting text-[#0A84FF]"></i> Scope & Limitations
              </button>

              <button @click="handleLogout" class="p-3.5 text-left text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2">
                <i class="fa-solid fa-right-from-bracket"></i> Sign Out
              </button>
            </div>
          </div>
        </header>

        <!-- Router View Container -->
        <div class="flex-1 p-6 md:p-8 overflow-y-auto">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" 
                @open-add-post="showAddPostModal = true"
                @open-add-event="showAddEventModal = true"
                @open-edit-member="member => { editingUser = member; }"
                @open-application-form="showApplicationModal = true"
              />
            </keep-alive>
          </router-view>
        </div>
      </main>
    </div>

    <!-- Modals Mount -->
    <AddPostModal :show="showAddPostModal" :isSubmitting="isSubmitting" @submit="submitPost" @cancel="showAddPostModal = false" />
    <AddEventModal :show="showAddEventModal" :isSubmitting="isSubmitting" @submit="submitEvent" @cancel="showAddEventModal = false" />
    
    <EditMemberModal
      :modelValue="editingUser"
      :isSubmitting="isSubmitting"
      :availableRoles="availableRoles"
      :instrumentList="instrumentList"
      :isAdmin="authStore.isAdmin"
      @save="handleSaveUser"
      @cancel="editingUser = null"
    />

    <MyProfileModal
      :show="showMyProfileModal"
      :user="authStore.currentUser"
      :instrumentList="instrumentList"
      @update="updateMyProfile"
      @cancel="showMyProfileModal = false"
    />

    <ApplicationFormModal
      :show="showApplicationModal"
      :instrumentList="instrumentList"
      :isSubmitting="isSubmitting"
      @submit="submitApplication"
      @cancel="showApplicationModal = false"
    />

    <ScopeModal
      :show="showScopeModal"
      @close="showScopeModal = false"
    />

    <AttendanceModal
      :show="showAttendanceModal"
      :canManage="authStore.canManageDashboard"
      @close="showAttendanceModal = false"
      @check-in="code => showToast('Checked in successfully with code ' + code + '!')"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/authStore';
import { useBandStore } from './stores/bandStore';

import Login from './components/Login.vue';
import AddPostModal from './components/modals/AddPostModal.vue';
import AddEventModal from './components/modals/AddEventModal.vue';
import EditMemberModal from './components/modals/EditMemberModal.vue';
import MyProfileModal from './components/modals/MyProfileModal.vue';
import AttendanceModal from './components/modals/AttendanceModal.vue';
import ApplicationFormModal from './components/modals/ApplicationFormModal.vue';
import ScopeModal from './components/modals/ScopeModal.vue';

const route = useRoute();
const authStore = useAuthStore();
const bandStore = useBandStore();

const showMobileMenu = ref(false);
const showProfileMenu = ref(false);
const isOffline = ref(!navigator.onLine);

const showAddPostModal = ref(false);
const showAddEventModal = ref(false);
const showMyProfileModal = ref(false);
const showAttendanceModal = ref(false);
const showApplicationModal = ref(false);
const showScopeModal = ref(false);

const deferredInstallPrompt = ref(null);
const installBannerDismissed = ref(false);

const editingUser = ref(null);
const isSubmitting = ref(false);

const toast = ref({ show: false, message: '', type: 'success' });

const instrumentList = ['Trumpet', 'Alto Sax', 'Tenor Sax', 'Clarinet', 'Flute', 'Trombone', 'Tuba', 'Percussion', 'Staff/Support'];

const currentRouteName = computed(() => {
  if (route.name === 'requests') return 'MEMBER VERIFICATION';
  return route.name ? route.name.toUpperCase() : 'DASHBOARD';
});

const filteredTabs = computed(() => {
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-border-all' },
    { id: 'messages', name: 'Messages', path: '/messages', icon: 'fa-regular fa-comments' },
    { id: 'roster', name: 'Band Roster', path: '/roster', icon: 'fa-solid fa-users' },
    { id: 'requests', name: 'Member Verification', path: '/requests', icon: 'fa-solid fa-user-shield', adminOnly: true }
  ];

  return tabs.filter(t => !t.adminOnly || authStore.canManageDashboard);
});

const availableRoles = computed(() => [
  { value: 'admin', label: 'Admin' },
  { value: 'president', label: 'President' },
  { value: 'vp', label: 'Vice President' },
  { value: 'secretary', label: 'Secretary' },
  { value: 'treasurer', label: 'Treasurer' },
  { value: 'member', label: 'General Member' }
]);

const showToast = (msg, type = 'success') => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => { toast.value.show = false; }, 3500);
};

const closeMenus = () => {
  showProfileMenu.value = false;
  showMobileMenu.value = false;
};

const triggerPwaInstall = async () => {
  if (deferredInstallPrompt.value) {
    deferredInstallPrompt.value.prompt();
    const { outcome } = await deferredInstallPrompt.value.userChoice;
    if (outcome === 'accepted') {
      showToast('SmartBand 2.0 app installed!');
    }
    deferredInstallPrompt.value = null;
  }
};

const handleLoginSuccess = () => {
  showToast('Welcome to SmartBand 2.0 PWA!');
  bandStore.loadDashboardData();
  bandStore.fetchRoster();
  bandStore.setupRealtime();
};

const handleLogout = async () => {
  await authStore.logout();
  bandStore.stopRealtime();
  showProfileMenu.value = false;
};

const submitPost = async (formData) => {
  isSubmitting.value = true;
  try {
    await bandStore.createPost(formData.title, formData.message, formData.isUrgent);
    showAddPostModal.value = false;
    showToast('Announcement posted!');
  } catch (err) {
    showToast('Failed to post announcement', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const submitEvent = async (formData) => {
  isSubmitting.value = true;
  try {
    await bandStore.createEvent(formData);
    showAddEventModal.value = false;
    showToast('Event scheduled on roadmap!');
  } catch (err) {
    showToast('Failed to add event', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const submitApplication = async (formData) => {
  isSubmitting.value = true;
  try {
    await bandStore.submitMemberApplication(formData);
    showApplicationModal.value = false;
    showToast('Member verification application submitted!');
  } catch (err) {
    showToast('Application submission failed', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const handleSaveUser = async (updatedUser) => {
  isSubmitting.value = true;
  try {
    await bandStore.saveMemberChanges(updatedUser);
    editingUser.value = null;
    showToast('Member profile updated!');
  } catch (err) {
    showToast('Failed to save changes', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const updateMyProfile = async (formData) => {
  try {
    await authStore.updateProfile(formData);
    showMyProfileModal.value = false;
    showToast('Your profile has been updated!');
  } catch (err) {
    showToast(err.message || 'Profile update failed', 'error');
  }
};

onMounted(async () => {
  window.addEventListener('offline', () => isOffline.value = true);
  window.addEventListener('online', () => {
    isOffline.value = false;
    showToast('Connection restored!', 'success');
  });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt.value = e;
  });

  await authStore.initAuth();
  if (authStore.isLoggedIn) {
    bandStore.loadDashboardData();
    bandStore.fetchRoster();
    bandStore.setupRealtime();
  }
});

onUnmounted(() => {
  bandStore.stopRealtime();
});
</script>

<style>
.senior-text-mode {
  font-size: 1.15rem !important;
  line-height: 1.75 !important;
}

.senior-text-mode button {
  font-size: 0.95rem !important;
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
}

.high-contrast-mode {
  filter: contrast(125%) brightness(110%);
}
</style>
