import { useState } from 'react'

export default function AddColumnButton({ onAdd }) {
  const [active, setActive] = useState(false)
  const [title, setTitle] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim())
    setTitle('')
    setActive(false)
  }

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="bg-white/30 hover:bg-white/50 text-white rounded-xl w-72 flex-shrink-0 h-12 flex items-center justify-center text-sm font-medium cursor-pointer border-none transition-colors backdrop-blur-sm"
      >
        + Add another list
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-100 rounded-xl w-72 flex-shrink-0 p-2">
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') setActive(false) }}
        placeholder="Enter list title..."
        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-2 mt-2">
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 border-none cursor-pointer">
          Add List
        </button>
        <button
          type="button"
          onClick={() => setActive(false)}
          className="text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer text-lg"
        >
          &times;
        </button>
      </div>
    </form>
  )
}
