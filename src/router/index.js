import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const DashboardTab = () => import('../components/tabs/DashboardTab.vue');
const MessagesTab = () => import('../components/tabs/MessagesTab.vue');
const MusicTab = () => import('../components/tabs/MusicTab.vue');
const RosterTab = () => import('../components/tabs/RosterTab.vue');
const RequestsTab = () => import('../components/tabs/RequestsTab.vue');
const ToolsTab = () => import('../components/tabs/ToolsTab.vue');

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: DashboardTab, name: 'dashboard' },
  { path: '/messages/:channel?', component: MessagesTab, name: 'messages' },
  { path: '/music', component: MusicTab, name: 'music' },
  { path: '/roster', component: RosterTab, name: 'roster' },
  { path: '/requests', component: RequestsTab, name: 'requests', meta: { adminOnly: true } },
  { path: '/tools', component: ToolsTab, name: 'tools' },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// Guard checking authenticated Pinia state instead of tampered localStorage
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  if (authStore.isLoading) {
    await authStore.initAuth();
  }

  if (to.meta.adminOnly) {
    if (!authStore.canManageDashboard) {
      return next({ name: 'dashboard' });
    }
  }

  next();
});
