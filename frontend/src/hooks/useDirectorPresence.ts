import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

// Global shared state for director presence
let globalChannel: RealtimeChannel | null = null;
let isDirectorOnlineState = false;
let isConnectedState = false;
const listeners = new Set<(online: boolean, connected: boolean) => void>();

// Track who is actively tracking their presence (e.g. Director)
const activeTrackers = new Set<string>();

const updateListeners = () => {
  listeners.forEach(listener => listener(isDirectorOnlineState, isConnectedState));
};

const setupGlobalChannel = () => {
  if (globalChannel) return;

  globalChannel = supabase.channel('director_presence', {
    config: {
      presence: {
        key: 'director',
      },
    },
  });

  globalChannel
    .on('presence', { event: 'sync' }, () => {
      if (!globalChannel) return;
      const state = globalChannel.presenceState();
      const isOnline = !!state['director'] && state['director'].length > 0;
      isDirectorOnlineState = isOnline;
      updateListeners();
    })
    .on('presence', { event: 'join' }, ({ key }) => {
      if (key === 'director') {
        isDirectorOnlineState = true;
        updateListeners();
      }
    })
    .on('presence', { event: 'leave' }, ({ key }) => {
      if (key === 'director') {
        if (!globalChannel) return;
        const state = globalChannel.presenceState();
        if (!state['director'] || state['director'].length === 0) {
          isDirectorOnlineState = false;
          updateListeners();
        }
      }
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        isConnectedState = true;
        updateListeners();
        // If there are trackers (like Director), track their presence
        if (activeTrackers.size > 0 && globalChannel) {
          await globalChannel.track({ online_at: new Date().toISOString() });
        }
      }
    });
};

const tearDownGlobalChannel = () => {
  if (!globalChannel) return;
  supabase.removeChannel(globalChannel);
  globalChannel = null;
  isConnectedState = false;
  isDirectorOnlineState = false;
};

export function useDirectorPresence(userRole?: string) {
  const [isDirectorOnline, setIsDirectorOnline] = useState(isDirectorOnlineState);
  const [connected, setConnected] = useState(isConnectedState);

  // Normalize userRole for checking if they are tracking
  const isTracker = userRole === 'director' || userRole === 'Director' || userRole === 'Admin' || userRole === 'Super Admin';

  useEffect(() => {
    // Generate a unique identifier for this hook instance if it's a tracker
    const trackerId = isTracker ? Math.random().toString(36).substring(2, 9) : null;

    if (trackerId) {
      activeTrackers.add(trackerId);
    }

    const listener = (online: boolean, conn: boolean) => {
      setIsDirectorOnline(online);
      setConnected(conn);
    };

    listeners.add(listener);

    // Setup channel if not already set up
    setupGlobalChannel();

    // If already connected and we are a tracker, trigger tracking
    if (isConnectedState && isTracker && globalChannel) {
      globalChannel.track({ online_at: new Date().toISOString() }).catch(console.error);
    }

    // Immediately trigger listener with current states
    listener(isDirectorOnlineState, isConnectedState);

    return () => {
      listeners.delete(listener);
      if (trackerId) {
        activeTrackers.delete(trackerId);
      }

      if (listeners.size === 0) {
        tearDownGlobalChannel();
      }
    };
  }, [isTracker]);

  return { isDirectorOnline, connected };
}
