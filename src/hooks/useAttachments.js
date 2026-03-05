import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useAttachments(cardId) {
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAttachments = useCallback(async () => {
    if (!cardId) return
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('card_id', cardId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching attachments:', error)
      return
    }
    setAttachments(data || [])
    setLoading(false)
  }, [cardId])

  useEffect(() => { fetchAttachments() }, [fetchAttachments])

  async function uploadAttachment(file, userId) {
    const ext = file.name.split('.').pop()
    const path = `cards/${cardId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(path, file)
    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(path)

    const { data, error } = await supabase
      .from('attachments')
      .insert({
        card_id: cardId,
        user_id: userId,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
      })
      .select()
      .single()

    if (error) throw error
    setAttachments(prev => [...prev, data])
    return data
  }

  async function deleteAttachment(attachmentId, fileUrl) {
    // Extract storage path from URL
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split('/storage/v1/object/public/attachments/')
    if (pathParts[1]) {
      await supabase.storage.from('attachments').remove([pathParts[1]])
    }

    const { error } = await supabase.from('attachments').delete().eq('id', attachmentId)
    if (error) throw error
    setAttachments(prev => prev.filter(a => a.id !== attachmentId))
  }

  return { attachments, loading, uploadAttachment, deleteAttachment, refetch: fetchAttachments }
}
