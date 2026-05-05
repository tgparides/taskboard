import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useBoards(userId) {
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBoards = useCallback(async () => {
    if (!userId) return
    // Query boards directly — RLS will scope this to membership for normal users
    // and let it through fully for admins (is_admin in profiles).
    const { data: boardsData, error } = await supabase
      .from('boards')
      .select('id, title, color, created_at, created_by')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching boards:', error)
      return
    }

    // Layer in the current user's per-board role (for boards where they're a
    // member). Boards where they're not a member (admin-visible only) get role=null.
    const { data: memberships } = await supabase
      .from('board_members')
      .select('board_id, role')
      .eq('user_id', userId)
    const roleByBoard = Object.fromEntries((memberships || []).map(m => [m.board_id, m.role]))

    setBoards((boardsData || []).map(b => ({ ...b, role: roleByBoard[b.id] || null })))
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchBoards() }, [fetchBoards])

  async function createBoard(title, color) {
    // Use RPC or two-step: insert board, then add self as admin
    const { data: board, error } = await supabase
      .from('boards')
      .insert({ title, color, created_by: userId })
      .select()
      .single()

    if (error) throw error

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from('board_members')
      .insert({ board_id: board.id, user_id: userId, role: 'admin' })

    if (memberError) console.error('Error adding member:', memberError)

    await fetchBoards()
    return board
  }

  async function deleteBoard(boardId) {
    // FK constraints have ON DELETE CASCADE, so deleting the board
    // cascades to board_members, columns, cards, labels, etc.
    const { error } = await supabase.from('boards').delete().eq('id', boardId)
    if (error) throw error
    await fetchBoards()
  }

  return { boards, loading, createBoard, deleteBoard, refetch: fetchBoards }
}
