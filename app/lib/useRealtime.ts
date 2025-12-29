'use client'

import { useEffect, useRef } from 'react'
import { createClient } from './supabaseClient'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeCallbacks {
  onPostInsert?: (payload: any) => void
  onPostUpdate?: (payload: any) => void
  onPostDelete?: (payload: any) => void
  onCommentInsert?: (payload: any) => void
  onCommentUpdate?: (payload: any) => void
  onCommentDelete?: (payload: any) => void
  onVoteInsert?: (payload: any) => void
  onVoteUpdate?: (payload: any) => void
  onVoteDelete?: (payload: any) => void
}

export function useRealtime(callbacks: RealtimeCallbacks) {
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    // Create a single channel for all realtime subscriptions
    const channel = supabase.channel('discussion-updates')

    // Subscribe to posts table changes
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      },
      (payload) => {
        callbacks.onPostInsert?.(payload)
      }
    )

    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'posts'
      },
      (payload) => {
        callbacks.onPostUpdate?.(payload)
      }
    )

    channel.on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'posts'
      },
      (payload) => {
        callbacks.onPostDelete?.(payload)
      }
    )

    // Subscribe to comments table changes
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments'
      },
      (payload) => {
        callbacks.onCommentInsert?.(payload)
      }
    )

    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'comments'
      },
      (payload) => {
        callbacks.onCommentUpdate?.(payload)
      }
    )

    channel.on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'comments'
      },
      (payload) => {
        callbacks.onCommentDelete?.(payload)
      }
    )

    // Subscribe to votes table changes
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'votes'
      },
      (payload) => {
        callbacks.onVoteInsert?.(payload)
      }
    )

    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'votes'
      },
      (payload) => {
        callbacks.onVoteUpdate?.(payload)
      }
    )

    channel.on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'votes'
      },
      (payload) => {
        callbacks.onVoteDelete?.(payload)
      }
    )

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Realtime subscription error')
      }
    })

    channelRef.current = channel

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [callbacks.onPostInsert, callbacks.onPostUpdate, callbacks.onPostDelete,
      callbacks.onCommentInsert, callbacks.onCommentUpdate, callbacks.onCommentDelete,
      callbacks.onVoteInsert, callbacks.onVoteUpdate, callbacks.onVoteDelete,
      callbacks.onPostUpdate // Add onPostUpdate to the dependency array
    ])

  return channelRef.current
}
