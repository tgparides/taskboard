import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useBoards(userId) {
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBoards = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('board_members')
      .select('board_id, role, boards(id, title, color, created_at, created_by)')
      .eq('user_id', userId)
      .order('created_at', { referencedTable: 'boards', ascending: false })

    if (error) {
      console.error('Error fetching boards:', error)
      return
    }

    setBoards(data.map(bm => ({ ...bm.boards, role: bm.role })))
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchBoards() }, [fetchBoards])

  async function createBoard(title, color) {
    const { data: board, error } = await supabase
      .from('boards')
      .insert({ title, color, created_by: userId })
      .select()
      .single()

    if (error) throw error

    // Add creator as admin member
    await supabase
      .from('board_members')
      .insert({ board_id: board.id, user_id: userId, role: 'admin' })

    await fetchBoards()
    return board
  }

  async function deleteBoard(boardId) {
    const { error } = await supabase.from('boards').delete().eq('id', boardId)
    if (error) throw error
    await fetchBoards()
  }

  return { boards, loading, createBoard, deleteBoard, refetch: fetchBoards }
}
