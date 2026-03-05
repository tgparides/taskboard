import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { getInsertPosition, needsNormalization, normalizePositions } from '../lib/positions'

export function useBoard(boardId) {
  const [board, setBoard] = useState(null)
  const [columns, setColumns] = useState([])
  const [cards, setCards] = useState([])
  const [labels, setLabels] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBoard = useCallback(async () => {
    if (!boardId) return

    const [boardRes, colRes, cardRes, labelRes, memberRes] = await Promise.all([
      supabase.from('boards').select('*').eq('id', boardId).single(),
      supabase.from('columns').select('*').eq('board_id', boardId).order('position'),
      supabase.from('cards').select(`
        *, card_labels(label_id), card_members(user_id, profiles(id, full_name, avatar_url))
      `).eq('column_id.board_id', boardId),
      supabase.from('labels').select('*').eq('board_id', boardId),
      supabase.from('board_members').select('user_id, role, profiles(id, full_name, avatar_url, email)').eq('board_id', boardId),
    ])

    if (boardRes.error) {
      console.error('Error fetching board:', boardRes.error)
      setLoading(false)
      return
    }

    setBoard(boardRes.data)
    setColumns(colRes.data || [])
    setLabels(labelRes.data || [])
    setMembers(memberRes.data?.map(m => ({ ...m.profiles, role: m.role })) || [])

    // Cards need column filtering since nested filter doesn't work well
    // Fetch cards per column instead
    const colIds = (colRes.data || []).map(c => c.id)
    if (colIds.length > 0) {
      const { data: cardsData } = await supabase
        .from('cards')
        .select(`*, card_labels(label_id), card_members(user_id, profiles(id, full_name, avatar_url))`)
        .in('column_id', colIds)
        .order('position')
      setCards(cardsData || [])
    } else {
      setCards([])
    }

    setLoading(false)
  }, [boardId])

  useEffect(() => { fetchBoard() }, [fetchBoard])

  // Column operations
  async function addColumn(title) {
    const position = getInsertPosition(columns, columns.length)
    const { data, error } = await supabase
      .from('columns')
      .insert({ board_id: boardId, title, position })
      .select()
      .single()
    if (error) throw error
    setColumns(prev => [...prev, data])
    return data
  }

  async function updateColumn(columnId, updates) {
    const { error } = await supabase.from('columns').update(updates).eq('id', columnId)
    if (error) throw error
    setColumns(prev => prev.map(c => c.id === columnId ? { ...c, ...updates } : c))
  }

  async function deleteColumn(columnId) {
    const { error } = await supabase.from('columns').delete().eq('id', columnId)
    if (error) throw error
    setColumns(prev => prev.filter(c => c.id !== columnId))
    setCards(prev => prev.filter(c => c.column_id !== columnId))
  }

  async function moveColumn(columnId, newIndex) {
    const sorted = [...columns].sort((a, b) => a.position - b.position)
    const filtered = sorted.filter(c => c.id !== columnId)
    const position = getInsertPosition(filtered, newIndex)

    // Optimistic update
    setColumns(prev =>
      prev.map(c => c.id === columnId ? { ...c, position } : c)
    )

    const { error } = await supabase.from('columns').update({ position }).eq('id', columnId)
    if (error) {
      console.error('Error moving column:', error)
      fetchBoard()
    }
  }

  // Card operations
  async function addCard(columnId, title) {
    const colCards = cards.filter(c => c.column_id === columnId).sort((a, b) => a.position - b.position)
    const position = getInsertPosition(colCards, colCards.length)

    const { data, error } = await supabase
      .from('cards')
      .insert({ column_id: columnId, title, position })
      .select(`*, card_labels(label_id), card_members(user_id, profiles(id, full_name, avatar_url))`)
      .single()
    if (error) throw error
    setCards(prev => [...prev, data])
    return data
  }

  async function updateCard(cardId, updates) {
    const { error } = await supabase.from('cards').update(updates).eq('id', cardId)
    if (error) throw error
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...updates } : c))
  }

  async function deleteCard(cardId) {
    const { error } = await supabase.from('cards').delete().eq('id', cardId)
    if (error) throw error
    setCards(prev => prev.filter(c => c.id !== cardId))
  }

  async function moveCard(cardId, toColumnId, newIndex) {
    const colCards = cards
      .filter(c => c.column_id === toColumnId && c.id !== cardId)
      .sort((a, b) => a.position - b.position)
    const position = getInsertPosition(colCards, newIndex)

    // Optimistic update
    setCards(prev =>
      prev.map(c => c.id === cardId ? { ...c, column_id: toColumnId, position } : c)
    )

    const { error } = await supabase
      .from('cards')
      .update({ column_id: toColumnId, position })
      .eq('id', cardId)

    if (error) {
      console.error('Error moving card:', error)
      fetchBoard()
    }
  }

  // Label operations
  async function addLabel(name, color) {
    const { data, error } = await supabase
      .from('labels')
      .insert({ board_id: boardId, name, color })
      .select()
      .single()
    if (error) throw error
    setLabels(prev => [...prev, data])
    return data
  }

  async function toggleCardLabel(cardId, labelId) {
    const card = cards.find(c => c.id === cardId)
    const hasLabel = card?.card_labels?.some(cl => cl.label_id === labelId)

    if (hasLabel) {
      await supabase.from('card_labels').delete().eq('card_id', cardId).eq('label_id', labelId)
      setCards(prev => prev.map(c =>
        c.id === cardId
          ? { ...c, card_labels: c.card_labels.filter(cl => cl.label_id !== labelId) }
          : c
      ))
    } else {
      await supabase.from('card_labels').insert({ card_id: cardId, label_id: labelId })
      setCards(prev => prev.map(c =>
        c.id === cardId
          ? { ...c, card_labels: [...(c.card_labels || []), { label_id: labelId }] }
          : c
      ))
    }
  }

  // Card member operations
  async function toggleCardMember(cardId, userId, profile) {
    const card = cards.find(c => c.id === cardId)
    const hasMember = card?.card_members?.some(cm => cm.user_id === userId)

    if (hasMember) {
      await supabase.from('card_members').delete().eq('card_id', cardId).eq('user_id', userId)
      setCards(prev => prev.map(c =>
        c.id === cardId
          ? { ...c, card_members: c.card_members.filter(cm => cm.user_id !== userId) }
          : c
      ))
    } else {
      await supabase.from('card_members').insert({ card_id: cardId, user_id: userId })
      setCards(prev => prev.map(c =>
        c.id === cardId
          ? { ...c, card_members: [...(c.card_members || []), { user_id: userId, profiles: profile }] }
          : c
      ))
    }
  }

  // Invite member to board
  async function inviteMember(email) {
    // Look up user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (profileError || !profile) throw new Error('User not found. They need to sign up first.')

    const { error } = await supabase
      .from('board_members')
      .insert({ board_id: boardId, user_id: profile.id, role: 'member' })

    if (error) {
      if (error.code === '23505') throw new Error('User is already a member.')
      throw error
    }

    await fetchBoard()
  }

  return {
    board, columns, cards, labels, members, loading,
    addColumn, updateColumn, deleteColumn, moveColumn,
    addCard, updateCard, deleteCard, moveCard,
    addLabel, toggleCardLabel,
    toggleCardMember, inviteMember,
    refetch: fetchBoard,
    setCards, setColumns,
  }
}
