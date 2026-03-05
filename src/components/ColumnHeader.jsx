import { useState } from 'react'

export default function ColumnHeader({ column, onUpdate, onDelete, cardCount }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(column.title)
  const [showMenu, setShowMenu] = useState(false)

  function handleSave() {
    if (title.trim() && title.trim() !== column.title) {
      onUpdate(column.id, { title: title.trim() })
    }
    setEditing(false)
  }

  return (
    <div className="flex items-center justify-between px-2 py-1.5 mb-1">
      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setTitle(column.title); setEditing(false) } }}
          className="text-sm font-semibold text-gray-800 bg-white border border-blue-400 rounded px-1 py-0.5 w-full focus:outline-none"
        />
      ) : (
        <h3
          onClick={() => setEditing(true)}
          className="text-sm font-semibold text-gray-700 cursor-pointer truncate flex-1"
        >
          {column.title}
          <span className="ml-1.5 text-xs font-normal text-gray-400">{cardCount}</span>
        </h3>
      )}

      <div className="relative ml-1">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-lg px-1"
        >
          &#8943;
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 w-40">
              <button
                onClick={() => { setEditing(true); setShowMenu(false) }}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 bg-transparent border-none cursor-pointer"
              >
                Rename
              </button>
              <button
                onClick={() => { onDelete(column.id); setShowMenu(false) }}
                className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 bg-transparent border-none cursor-pointer"
              >
                Delete List
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
