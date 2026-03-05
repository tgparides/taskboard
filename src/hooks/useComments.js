import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useComments(cardId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    if (!cardId) return
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(id, full_name, avatar_url)')
      .eq('card_id', cardId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
      return
    }
    setComments(data || [])
    setLoading(false)
  }, [cardId])

  useEffect(() => { fetchComments() }, [fetchComments])

  async function addComment(userId, body) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ card_id: cardId, user_id: userId, body })
      .select('*, profiles(id, full_name, avatar_url)')
      .single()
    if (error) throw error
    setComments(prev => [...prev, data])
    return data
  }

  async function deleteComment(commentId) {
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (error) throw error
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  return { comments, loading, addComment, deleteComment, refetch: fetchComments }
}
