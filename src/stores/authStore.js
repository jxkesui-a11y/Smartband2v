import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../supabase';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null);
  const session = ref(null);
  const isLoading = ref(true);
  const authError = ref('');

  // Role getters based on verified auth profile
  const isLoggedIn = computed(() => !!currentUser.value && currentUser.value.status === 'approved');
  const userRole = computed(() => (currentUser.value?.role || 'member').toLowerCase());
  
  const isAdmin = computed(() => userRole.value === 'admin');
  const isOfficer = computed(() => ['admin', 'president', 'vp', 'secretary', 'treasurer'].includes(userRole.value));
  const canManageDashboard = computed(() => ['admin', 'president', 'vp'].includes(userRole.value));

  const userInitials = computed(() => {
    if (!currentUser.value) return 'SB';
    const f = currentUser.value.first_name?.[0] || '';
    const l = currentUser.value.last_name?.[0] || '';
    return `${f}${l}`.toUpperCase() || 'SB';
  });

  // Fetch current user from Supabase Auth & DB Sync
  async function initAuth() {
    isLoading.value = true;
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      session.value = currentSession;

      if (currentSession?.user) {
        await fetchProfileByEmail(currentSession.user.email);
      } else {
        // Fallback: check localStorage for cached profile if offline
        const cached = localStorage.getItem('smartband_user_v2');
        if (cached) {
          try {
            currentUser.value = JSON.parse(cached);
          } catch (e) {
            currentUser.value = null;
          }
        }
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
    } finally {
      isLoading.value = false;
    }

    // Subscribe to auth state changes
    supabase.auth.onAuthStateChange(async (event, newSession) => {
      session.value = newSession;
      if (newSession?.user) {
        await fetchProfileByEmail(newSession.user.email);
      } else {
        currentUser.value = null;
        localStorage.removeItem('smartband_user_v2');
      }
    });
  }

  async function fetchProfileByEmail(email) {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (profile && !error) {
      currentUser.value = profile;
      localStorage.setItem('smartband_user_v2', JSON.stringify(profile));
    }
  }

  async function login(email, password) {
    authError.value = '';
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      authError.value = error.message;
      throw error;
    }

    const { data: profile, error: profileErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (profileErr || !profile) {
      authError.value = "User profile record not found.";
      await supabase.auth.signOut();
      throw new Error("Profile record missing.");
    }

    if (profile.status === 'pending') {
      authError.value = "Your account registration is pending admin approval.";
      await supabase.auth.signOut();
      throw new Error("Account pending approval.");
    }

    currentUser.value = profile;
    localStorage.setItem('smartband_user_v2', JSON.stringify(profile));
    return profile;
  }

  async function register({ firstName, lastName, email, password, instrument }) {
    authError.value = '';
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, instrument }
      }
    });

    if (authErr) {
      authError.value = authErr.message;
      throw authErr;
    }

    if (authData?.user) {
      const { error: dbErr } = await supabase.from('users').upsert({
        email,
        first_name: firstName,
        last_name: lastName,
        instrument,
        password: 'AUTH_MANAGED',
        role: 'member',
        status: 'pending',
        tier: 'junior',
        created_at: new Date().toISOString()
      }, { onConflict: 'email' });

      if (dbErr) {
        console.error("Database registration insert failed:", dbErr);
        authError.value = `Database Error: ${dbErr.message}`;
        throw dbErr;
      }
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    currentUser.value = null;
    session.value = null;
    localStorage.removeItem('smartband_user_v2');
  }

  async function updateProfile(formData) {
    if (!currentUser.value) return;

    // Change password if provided
    if (formData.passwords?.current && formData.passwords?.new) {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: currentUser.value.email,
        password: formData.passwords.current
      });
      if (verifyError) throw new Error("Current password incorrect.");

      const { error: pwdError } = await supabase.auth.updateUser({ password: formData.passwords.new });
      if (pwdError) throw pwdError;
    }

    const { error } = await supabase.from('users')
      .update({
        first_name: formData.firstName,
        last_name: formData.lastName,
        instrument: formData.instrument
      })
      .eq('id', currentUser.value.id);

    if (error) throw error;

    currentUser.value.first_name = formData.firstName;
    currentUser.value.last_name = formData.lastName;
    currentUser.value.instrument = formData.instrument;
    localStorage.setItem('smartband_user_v2', JSON.stringify(currentUser.value));
  }

  return {
    currentUser,
    session,
    isLoading,
    authError,
    isLoggedIn,
    userRole,
    isAdmin,
    isOfficer,
    canManageDashboard,
    userInitials,
    initAuth,
    login,
    register,
    logout,
    updateProfile
  };
});
