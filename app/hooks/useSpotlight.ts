import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/app/lib/supabaseClient';

export const useSpotlight = (workshopId: string) => {
  const [currentSpotlightId, setCurrentSpotlightId] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!workshopId) {
      console.warn('useSpotlight: No workshopId provided');
      return;
    }

    let mounted = true;

    // 1. Fetch initial state
    const fetchInitialSpotlight = async () => {
      try {
        const { data, error } = await supabase
          .from('workshops')
          .select('spotlight_user_id')
          .eq('id', workshopId)
          .single();

        if (error) {
          console.error('Error fetching initial spotlight state:', error.message);
          return;
        }

        if (mounted && data) {
          console.log('Initial spotlight state:', data.spotlight_user_id);
          setCurrentSpotlightId(data.spotlight_user_id);
        }
      } catch (err) {
        console.error('Exception fetching spotlight:', err);
      }
    };

    fetchInitialSpotlight();

    // 2. Subscribe to Realtime changes
    const channelName = `workshop_spotlight:${workshopId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workshops',
          filter: `id=eq.${workshopId}`,
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          if (mounted && payload.new && 'spotlight_user_id' in payload.new) {
            const newSpotlightId = payload.new.spotlight_user_id as string | null;
            console.log('Updating spotlight to:', newSpotlightId);
            // Use functional update to ensure we get the latest state
            setCurrentSpotlightId(prev => {
              // Only update if it's different to avoid unnecessary re-renders
              if (prev !== newSpotlightId) {
                return newSpotlightId;
              }
              return prev;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for ${channelName}:`, status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to spotlight changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel subscription error');
        }
      });

    return () => {
      mounted = false;
      console.log('Cleaning up spotlight subscription');
      supabase.removeChannel(channel);
    };
  }, [workshopId, supabase]);

  // Use useCallback to memoize the function and enable optimistic updates
  const setSpotlight = useCallback(async (userId: string | null) => {
    console.log('Setting spotlight:', userId, 'for workshop:', workshopId);
    
    // OPTIMISTIC UPDATE: Update local state immediately for instant UI feedback
    // Use functional update to capture previous value
    let previousValue: string | null = null;
    setCurrentSpotlightId(prev => {
      previousValue = prev; // Capture previous value before update
      if (prev === userId) {
        return prev; // No change needed
      }
      console.log('Optimistically updating spotlight from', prev, 'to', userId);
      return userId;
    });

    try {
      const { data, error } = await supabase
        .from('workshops')
        .update({ spotlight_user_id: userId })
        .eq('id', workshopId)
        .select('spotlight_user_id')
        .single();

      if (error) {
        console.error('Error updating spotlight_user_id:', error.message);
        // Revert optimistic update on error using captured previous value
        console.log('Reverting optimistic update due to error, restoring:', previousValue);
        setCurrentSpotlightId(previousValue);
        throw error;
      }

      console.log('Spotlight updated successfully:', data);
      // The Realtime subscription will confirm the update, but we've already updated optimistically
      // This ensures instant UI feedback
      return data;
    } catch (error) {
      // On error, we've already reverted the optimistic update above
      // The Realtime subscription will eventually sync the correct state if needed
      throw error;
    }
  }, [workshopId, supabase]);

  return { currentSpotlightId, setSpotlight };
};

