import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../supabase';
import { useAuthStore } from './authStore';

export const useBandStore = defineStore('band', () => {
  const authStore = useAuthStore();

  // Data Collections
  const posts = ref([]);
  const events = ref([]);
  const acknowledgments = ref([]);
  const rsvps = ref([]);
  const roster = ref([]);
  const pendingUsers = ref([]);
  const musicSheets = ref([]);
  const chatMessages = ref([]);
  const practiceLogs = ref([]);

  // Channels
  const selectedChannel = ref('general');
  const unreadMessages = ref({ general: 0, important: 0, sectionals: 0 });

  // Realtime subscription handle
  let realtimeChannel = null;

  // Search & Filter States
  const searchFilter = ref('');
  const selectedInstrumentFilter = ref('All');

  // Computed Filters
  const filteredRoster = computed(() => {
    return roster.value.filter(member => {
      const nameMatch = `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchFilter.value.toLowerCase());
      const instMatch = selectedInstrumentFilter.value === 'All' || member.instrument === selectedInstrumentFilter.value;
      return nameMatch && instMatch;
    });
  });

  const filteredMusicSheets = computed(() => {
    return musicSheets.value.filter(sheet => {
      const titleMatch = sheet.title.toLowerCase().includes(searchFilter.value.toLowerCase());
      const instMatch = authStore.isAdmin || sheet.instrument === 'All' || sheet.instrument === authStore.currentUser?.instrument || selectedInstrumentFilter.value === 'All' || sheet.instrument === selectedInstrumentFilter.value;
      return titleMatch && instMatch;
    });
  });

  const totalPracticeHoursThisWeek = computed(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return practiceLogs.value
      .filter(log => new Date(log.created_at || log.date) >= oneWeekAgo)
      .reduce((sum, log) => sum + (Number(log.duration_minutes) || 0), 0) / 60;
  });

  // ==========================================
  // DASHBOARD & FEED ACTIONS
  // ==========================================
  async function loadDashboardData() {
    try {
      const [
        { data: postData },
        { data: eventData },
        { data: ackData },
        { data: rsvpData },
        { data: practiceData }
      ] = await Promise.all([
        supabase.from('feed_posts').select('*, users(first_name, last_name)').order('created_at', { ascending: false }).limit(50),
        supabase.from('events').select('*').order('event_date', { ascending: true }),
        supabase.from('post_acknowledgments').select('*'),
        supabase.from('event_rsvps').select('*'),
        supabase.from('practice_logs').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      if (postData) posts.value = postData;
      if (eventData) events.value = eventData;
      if (ackData) acknowledgments.value = ackData;
      if (rsvpData) rsvps.value = rsvpData;
      if (practiceData) practiceLogs.value = practiceData;
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  }

  async function createPost(title, message, isUrgent = false) {
    if (!authStore.currentUser) return;
    const { error } = await supabase.from('feed_posts').insert({
      author_id: authStore.currentUser.id,
      title,
      message,
      is_urgent: isUrgent
    });
    if (error) throw error;
  }

  async function deletePost(postId) {
    const { error } = await supabase.from('feed_posts').delete().eq('id', postId);
    if (!error) posts.value = posts.value.filter(p => p.id !== postId);
    else throw error;
  }

  async function acknowledgePost(postId) {
    if (!authStore.currentUser) return;
    const { error } = await supabase.from('post_acknowledgments').insert({
      user_id: authStore.currentUser.id,
      post_id: postId,
      acknowledged_at: new Date().toISOString()
    });

    if (!error) {
      acknowledgments.value.push({
        user_id: authStore.currentUser.id,
        post_id: postId,
        acknowledged_at: new Date().toISOString()
      });
    } else throw error;
  }

  function hasAcknowledged(postId) {
    if (!authStore.currentUser) return false;
    return acknowledgments.value.some(ack => ack.post_id === postId && ack.user_id === authStore.currentUser.id);
  }

  function getAckCount(postId) {
    return acknowledgments.value.filter(ack => ack.post_id === postId).length;
  }

  // ==========================================
  // EVENT & RSVP ACTIONS
  // ==========================================
  async function createEvent(eventData) {
    if (!authStore.currentUser) return;
    
    // Format time_str to 12-hour format
    const [hours, minutes] = eventData.time.split(':');
    const parsedHour = parseInt(hours);
    const ampm = parsedHour >= 12 ? 'PM' : 'AM';
    const displayHour = parsedHour % 12 || 12;
    const formattedTimeStr = `${displayHour}:${minutes} ${ampm}`;

    const { error } = await supabase.from('events').insert({
      author_id: authStore.currentUser.id,
      event_date: eventData.date,
      title: eventData.title,
      time_str: formattedTimeStr,
      location: eventData.location
    });
    if (error) throw error;
  }

  async function deleteEvent(eventId) {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (!error) events.value = events.value.filter(e => e.id !== eventId);
    else throw error;
  }

  async function submitRSVP(eventId, status) {
    if (!authStore.currentUser) return;
    const userId = authStore.currentUser.id;
    const existing = rsvps.value.find(r => r.event_id === eventId && r.user_id === userId);

    if (existing) {
      const idx = rsvps.value.findIndex(r => r.id === existing.id);
      if (idx !== -1) rsvps.value[idx].status = status;

      const { error } = await supabase.from('event_rsvps')
        .update({ status, responded_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const tempId = `temp-${Date.now()}`;
      const tempRecord = { id: tempId, user_id: userId, event_id: eventId, status, responded_at: new Date().toISOString() };
      rsvps.value.push(tempRecord);

      const { data, error } = await supabase.from('event_rsvps').insert({
        user_id: userId,
        event_id: eventId,
        status,
        responded_at: new Date().toISOString()
      }).select().single();

      if (error) {
        rsvps.value = rsvps.value.filter(r => r.id !== tempId);
        throw error;
      } else if (data) {
        const tempIdx = rsvps.value.findIndex(r => r.id === tempId);
        if (tempIdx !== -1) rsvps.value[tempIdx] = data;
      }
    }
  }

  function getUserRSVP(eventId) {
    if (!authStore.currentUser) return null;
    const rsvp = rsvps.value.find(r => r.event_id === eventId && r.user_id === authStore.currentUser.id);
    return rsvp ? rsvp.status : null;
  }

  function getRSVPStats(eventId) {
    const eventRsvps = rsvps.value.filter(r => r.event_id === eventId);
    return {
      going: eventRsvps.filter(r => r.status === 'going').length,
      notGoing: eventRsvps.filter(r => r.status === 'not_going').length,
      maybe: eventRsvps.filter(r => r.status === 'maybe').length
    };
  }

  function getAttendeesList(eventId) {
    const eventRsvps = rsvps.value.filter(r => r.event_id === eventId);
    const goingList = eventRsvps
      .filter(r => r.status === 'going')
      .map(r => {
        const u = roster.value.find(user => user.id === r.user_id);
        return u ? `${u.first_name} ${u.last_name} (${u.instrument})` : 'Unknown Member';
      });
    const notGoingList = eventRsvps
      .filter(r => r.status === 'not_going')
      .map(r => {
        const u = roster.value.find(user => user.id === r.user_id);
        return u ? `${u.first_name} ${u.last_name}` : 'Unknown Member';
      });
    return { goingList, notGoingList };
  }

  // ==========================================
  // ROSTER & REQUESTS ACTIONS
  // ==========================================
  async function fetchRoster() {
    const { data, error } = await supabase.from('users')
      .select('id, first_name, last_name, email, instrument, status, role, tier, last_seen, created_at')
      .eq('status', 'approved')
      .order('role', { ascending: true });
    if (!error && data) roster.value = data;
  }

  async function fetchPendingUsers() {
    const { data, error } = await supabase.from('users')
      .select('id, first_name, last_name, email, instrument, status, role, tier, last_seen, created_at')
      .eq('status', 'pending');
    if (!error && data) pendingUsers.value = data;
  }

  async function approveUser(userId) {
    const { error } = await supabase.from('users').update({ status: 'approved' }).eq('id', userId);
    if (!error) {
      await fetchPendingUsers();
      await fetchRoster();
    } else throw error;
  }

  async function declineUser(userId) {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (!error) await fetchPendingUsers();
    else throw error;
  }

  async function saveMemberChanges(userToSave) {
    const updatePayload = {
      role: userToSave.role,
      tier: userToSave.tier,
      instrument: userToSave.instrument
    };
    if (authStore.isAdmin) {
      updatePayload.email = userToSave.email;
    }

    const { error } = await supabase.from('users')
      .update(updatePayload)
      .eq('id', userToSave.id);

    if (!error) await fetchRoster();
    else throw error;
  }

  async function deleteMember(userId) {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (!error) await fetchRoster();
    else throw error;
  }

  // ==========================================
  // REAL-TIME MESSAGING
  // ==========================================
  async function fetchMessages(channel = selectedChannel.value) {
    selectedChannel.value = channel;
    const { data } = await supabase.from('messages')
      .select('*, users(first_name, last_name)')
      .eq('channel', channel)
      .order('created_at', { ascending: false })
      .limit(60);

    if (data) {
      chatMessages.value = data.reverse().map(msg => ({
        ...msg,
        first_name: msg.users?.first_name || 'Member',
        last_name: msg.users?.last_name || ''
      }));
      unreadMessages.value[channel] = 0;
    }
  }

  async function sendMessage(content, channel = selectedChannel.value) {
    if (!authStore.currentUser || !content.trim()) return;
    const { error } = await supabase.from('messages').insert({
      sender_id: authStore.currentUser.id,
      channel,
      content: content.trim()
    });
    if (error) throw error;
  }

  // ==========================================
  // MUSIC SHEETS ACTIONS
  // ==========================================
  async function fetchMusicSheets() {
    const { data, error } = await supabase.from('music_sheets').select('*').order('created_at', { ascending: false });
    if (!error && data) musicSheets.value = data;
  }

  async function uploadMusicSheet(file, title, instrumentStr, audioFile = null) {
    if (!file) return;
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Upload main sheet PDF/file
    const { error: uploadError } = await supabase.storage.from('sheets').upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('sheets').getPublicUrl(fileName);

    let audioUrl = null;
    if (audioFile) {
      const audioName = `audio-${Date.now()}-${audioFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error: audioUploadErr } = await supabase.storage.from('sheets').upload(audioName, audioFile);
      if (!audioUploadErr) {
        const { data: audioUrlData } = supabase.storage.from('sheets').getPublicUrl(audioName);
        audioUrl = audioUrlData.publicUrl;
      }
    }

    const { error: dbError } = await supabase.from('music_sheets').insert({
      title,
      instrument: instrumentStr,
      file_path: urlData.publicUrl,
      audio_path: audioUrl
    });

    if (dbError) throw dbError;
    await fetchMusicSheets();
  }

  async function deleteMusicSheet(sheetId, filePath) {
    const fileName = filePath.split('/').pop();
    if (fileName) {
      await supabase.storage.from('sheets').remove([fileName]);
    }
    const { error } = await supabase.from('music_sheets').delete().eq('id', sheetId);
    if (!error) await fetchMusicSheets();
    else throw error;
  }

  // ==========================================
  // PRACTICE LOGS ACTIONS
  // ==========================================
  async function addPracticeLog(minutes, piece, notes) {
    if (!authStore.currentUser) return;
    const { data, error } = await supabase.from('practice_logs').insert({
      user_id: authStore.currentUser.id,
      user_name: `${authStore.currentUser.first_name} ${authStore.currentUser.last_name}`,
      instrument: authStore.currentUser.instrument,
      duration_minutes: minutes,
      piece_name: piece,
      notes: notes || '',
      created_at: new Date().toISOString()
    }).select().single();

    if (error) {
      // Local optimistic fallback if DB table not present yet
      practiceLogs.value.unshift({
        id: `local-${Date.now()}`,
        user_name: `${authStore.currentUser.first_name} ${authStore.currentUser.last_name}`,
        instrument: authStore.currentUser.instrument,
        duration_minutes: minutes,
        piece_name: piece,
        notes: notes || '',
        created_at: new Date().toISOString()
      });
    } else if (data) {
      practiceLogs.value.unshift(data);
    }
  }

  // ==========================================
  // REAL-TIME SYNC ENGINE
  // ==========================================
  function setupRealtime() {
    if (realtimeChannel) return;

    realtimeChannel = supabase.channel('smartband2v-sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const sender = roster.value.find(u => u.id === payload.new.sender_id);
        if (selectedChannel.value === payload.new.channel) {
          chatMessages.value.push({
            ...payload.new,
            first_name: sender ? sender.first_name : 'Member',
            last_name: sender ? sender.last_name : ''
          });
        } else {
          unreadMessages.value[payload.new.channel] = (unreadMessages.value[payload.new.channel] || 0) + 1;
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchRoster();
        if (authStore.canManageDashboard) fetchPendingUsers();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_posts' }, (payload) => {
        const sender = roster.value.find(u => u.id === payload.new.author_id) || authStore.currentUser;
        posts.value.unshift({ ...payload.new, users: { first_name: sender.first_name, last_name: sender.last_name } });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'feed_posts' }, (payload) => {
        posts.value = posts.value.filter(p => p.id !== payload.old.id);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, (payload) => {
        events.value.push(payload.new);
        events.value.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'events' }, (payload) => {
        events.value = events.value.filter(e => e.id !== payload.old.id);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_acknowledgments' }, (payload) => {
        acknowledgments.value.push(payload.new);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_rsvps' }, () => {
        loadDashboardData();
      })
      .subscribe();
  }

  function stopRealtime() {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  }

  return {
    posts,
    events,
    acknowledgments,
    rsvps,
    roster,
    pendingUsers,
    musicSheets,
    chatMessages,
    practiceLogs,
    selectedChannel,
    unreadMessages,
    searchFilter,
    selectedInstrumentFilter,
    filteredRoster,
    filteredMusicSheets,
    totalPracticeHoursThisWeek,
    loadDashboardData,
    createPost,
    deletePost,
    acknowledgePost,
    hasAcknowledged,
    getAckCount,
    createEvent,
    deleteEvent,
    submitRSVP,
    getUserRSVP,
    getRSVPStats,
    getAttendeesList,
    fetchRoster,
    fetchPendingUsers,
    approveUser,
    declineUser,
    saveMemberChanges,
    deleteMember,
    fetchMessages,
    sendMessage,
    fetchMusicSheets,
    uploadMusicSheet,
    deleteMusicSheet,
    addPracticeLog,
    setupRealtime,
    stopRealtime
  };
});
