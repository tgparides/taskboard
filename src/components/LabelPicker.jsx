import { useState } from 'react'
import { LABEL_COLORS } from '../lib/constants'

export default function LabelPicker({ labels, cardLabels, onToggle, onCreateLabel }) {
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(LABEL_COLORS[0].hex)

  function handleCreate() {
    if (!newColor) return
    onCreateLabel(newName.trim(), newColor)
    setNewName('')
    setShowCreate(false)
  }

  const activeLabelIds = new Set(cardLabels.map(cl => cl.label_id))

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Labels</p>
      <div className="space-y-1">
        {labels.map(label => (
          <button
            key={label.id}
            onClick={() => onToggle(label.id)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left cursor-pointer border ${
              activeLabelIds.has(label.id)
                ? 'border-gray-400 bg-gray-50'
                : 'border-transparent hover:bg-gray-100'
            }`}
          >
            <span
              className="w-8 h-5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: label.color }}
            />
            <span className="text-gray-700 flex-1">{label.name || 'Unnamed'}</span>
            {activeLabelIds.has(label.id) && <span className="text-blue-600">&#10003;</span>}
          </button>
        ))}
      </div>

      {showCreate ? (
        <div className="mt-2 space-y-2">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Label name (optional)"
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-1">
            {LABEL_COLORS.map(c => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setNewColor(c.hex)}
                className={`w-7 h-5 rounded-sm cursor-pointer border-2 ${
                  newColor === c.hex ? 'border-gray-800' : 'border-transparent'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-2 py-1 bg-blue-600 text-white text-xs rounded border-none cursor-pointer">
              Create
            </button>
            <button onClick={() => setShowCreate(false)} className="px-2 py-1 text-xs text-gray-500 bg-transparent border-none cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="mt-2 text-sm text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer"
        >
          + Create label
        </button>
      )}
    </div>
  )
}
