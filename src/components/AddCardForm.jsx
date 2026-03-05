import { useState } from 'react'

export default function AddCardForm({ onAdd, onCancel }) {
  const [title, setTitle] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim())
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="p-2">
      <textarea
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) }
          if (e.key === 'Escape') onCancel()
        }}
        placeholder="Enter a title..."
        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={2}
      />
      <div className="flex gap-2 mt-1">
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 border-none cursor-pointer">
          Add Card
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer"
        >
          &times;
        </button>
      </div>
    </form>
  )
}
