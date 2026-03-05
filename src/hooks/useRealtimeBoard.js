import { useEffect } from 'react'
import { supabase } from '../supabase'

export function useRealtimeBoard(boardId, { onCardChange, onColumnChange, onCommentChange, onLabelChange }) {
  useEffect(() => {
    if (!boardId) return

    const channel = supabase
      .channel(`board-${boardId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cards',
      }, payload => {
        onCardChange?.(payload)
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'columns',
        filter: `board_id=eq.${boardId}`,
      }, payload => {
        onColumnChange?.(payload)
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
      }, payload => {
        onCommentChange?.(payload)
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'card_labels',
      }, payload => {
        onLabelChange?.(payload)
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'card_members',
      }, payload => {
        onCardChange?.(payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [boardId])
}
