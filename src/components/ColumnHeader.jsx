import { useState } from 'react'
import { COLUMN_COLORS } from '../lib/constants'

export default function ColumnHeader({ column, onUpdate, onDelete, cardCount }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(column.title)
  const [showMenu, setShowMenu] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  function handleSave() {
    if (title.trim() && title.trim() !== column.title) {
      onUpdate(column.id, { title: title.trim() })
    }
    setEditing(false)
  }

  function handleColorChange(hex) {
    onUpdate(column.id, { color: hex })
    setShowColorPicker(false)
    setShowMenu(false)
  }

  return (
    <div>
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
            onClick={() => { setShowMenu(!showMenu); setShowColorPicker(false) }}
            className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-lg px-1"
          >
            &#8943;
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => { setShowMenu(false); setShowColorPicker(false) }} />
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 w-48">
                <button
                  onClick={() => { setEditing(true); setShowMenu(false) }}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 bg-transparent border-none cursor-pointer"
                >
                  Rename
                </button>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 bg-transparent border-none cursor-pointer flex items-center gap-2"
                >
                  <span
                    className="inline-block w-3 h-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: column.color || '#d1d5db' }}
                  />
                  Change Color
                </button>
                {showColorPicker && (
                  <div className="px-3 py-2 border-t border-gray-100">
                    <div className="grid grid-cols-4 gap-1.5">
                      {COLUMN_COLORS.map(c => (
                        <button
                          key={c.name}
                          onClick={() => handleColorChange(c.hex)}
                          className={`w-8 h-8 rounded-md border-2 cursor-pointer transition-transform hover:scale-110 ${
                            column.color === c.hex ? 'border-gray-800 scale-110' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: c.hex || '#f3f4f6' }}
                          title={c.label ? `${c.name} — ${c.label}` : c.name}
                        >
                          {!c.hex && (
                            <span className="text-gray-400 text-xs">&#10005;</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
    </div>
  )
}
