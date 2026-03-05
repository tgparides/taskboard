import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useBoards } from '../hooks/useBoards'
import { BOARD_COLORS } from '../lib/constants'
import ConfirmDialog from './ConfirmDialog'
import Layout from './Layout'

export default function BoardsPage() {
  const { user } = useAuth()
  const { boards, loading, createBoard, deleteBoard } = useBoards(user?.id)
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newColor, setNewColor] = useState(BOARD_COLORS[0])
  const [deleteTarget, setDeleteTarget] = useState(null)

  async function handleCreate(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    const board = await createBoard(newTitle.trim(), newColor)
    setNewTitle('')
    setShowCreate(false)
    navigate(`/board/${board.id}`)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center flex-1">
          <p className="text-gray-500">Loading boards...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto w-full">
        <h2 className="text-xl font-semibold mb-4">Your Boards</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {boards.map(board => (
            <div
              key={board.id}
              onClick={() => navigate(`/board/${board.id}`)}
              className="relative rounded-lg p-4 h-24 cursor-pointer hover:opacity-90 transition-opacity group"
              style={{ backgroundColor: board.color || BOARD_COLORS[0] }}
            >
              <span className="text-white font-semibold text-sm">{board.title}</span>
              <button
                onClick={e => { e.stopPropagation(); setDeleteTarget(board) }}
                className="absolute top-2 right-2 text-white/60 hover:text-white bg-transparent border-none p-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-lg"
                title="Delete board"
              >
                &times;
              </button>
            </div>
          ))}

          {/* Create new board tile */}
          {!showCreate ? (
            <div
              onClick={() => setShowCreate(true)}
              className="rounded-lg p-4 h-24 cursor-pointer bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              <span className="text-gray-600 text-sm font-medium">+ Create Board</span>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="rounded-lg p-3 bg-white border border-gray-300 shadow-sm">
              <input
                autoFocus
                type="text"
                placeholder="Board title"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-1.5 mb-2">
                {BOARD_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className={`w-6 h-6 rounded cursor-pointer border-2 ${
                      newColor === c ? 'border-gray-800' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 border-none cursor-pointer">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-3 py-1 text-sm text-gray-600 bg-transparent border-none cursor-pointer hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Board"
        message={`Delete "${deleteTarget?.title}"? All columns, cards, and data will be permanently removed.`}
        onConfirm={async () => { await deleteBoard(deleteTarget.id); setDeleteTarget(null) }}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  )
}
