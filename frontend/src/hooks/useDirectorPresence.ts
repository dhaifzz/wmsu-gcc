import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useDirectorPresence(userRole?: string) {
  const [isDirectorOnline, setIsDirectorOnline] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // We create a single presence channel
    const channel = supabase.channel('director_presence', {
      config: {
        presence: {
          key: 'director',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const isOnline = !!state['director'] && state['director'].length > 0;
        setIsDirectorOnline(isOnline);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        if (key === 'director') {
          setIsDirectorOnline(true);
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key === 'director') {
          // Verify with sync state if it's completely empty
          const state = channel.presenceState();
          if (!state['director'] || state['director'].length === 0) {
            setIsDirectorOnline(false);
          }
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
          // If the current user is the director, broadcast their presence
          if (userRole === 'director' || userRole === 'admin') {
            await channel.track({ online_at: new Date().toISOString() });
          }
        }
      });

    return () => {
      setConnected(false);
      supabase.removeChannel(channel);
    };
  }, [userRole]);

  return { isDirectorOnline, connected };
}
