import { useState, useRef } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import ColumnHeader from './ColumnHeader'
import CardPreview from './CardPreview'
import AddCardForm from './AddCardForm'

export default function Column({ column, cards, labels, index, isFirst, isLast, onUpdateColumn, onDeleteColumn, onArchiveColumn, onShiftColumn, onAddCard, onAddCardWithImage, onCardClick, onToggleComplete, collapsed, onToggleCollapse }) {
  const [showAddCard, setShowAddCard] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef()

  // Higher priority floats to top (urgent → low → null), then position keeps user's manual order.
  // Treat null priority as -1 so it sorts last.
  const sortedCards = [...cards].sort((a, b) => {
    const pa = a.priority == null ? -1 : a.priority
    const pb = b.priority == null ? -1 : b.priority
    if (pb !== pa) return pb - pa
    return a.position - b.position
  })

  function getImageFiles(dataTransfer) {
    const files = []
    for (const file of dataTransfer.files) {
      if (file.type.startsWith('image/')) files.push(file)
    }
    return files
  }

  async function handleImageDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const files = getImageFiles(e.dataTransfer)
    if (files.length === 0) return
    setUploading(true)
    try {
      for (const file of files) {
        await onAddCardWithImage(column.id, file)
      }
    } catch (err) {
      console.error('Error uploading image:', err)
    }
    setUploading(false)
  }

  function handleDragOver(e) {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault()
      setDragOver(true)
    }
  }

  function handleDragLeave(e) {
    // Only clear if leaving the column container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(false)
    }
  }

  async function handlePaste(e) {
    const files = []
    for (const item of e.clipboardData.items) {
      if (item.type.startsWith('image/')) {
        files.push(item.getAsFile())
      }
    }
    if (files.length === 0) return
    e.preventDefault()
    setUploading(true)
    try {
      for (const file of files) {
        await onAddCardWithImage(column.id, file)
      }
    } catch (err) {
      console.error('Error pasting image:', err)
    }
    setUploading(false)
  }

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
    if (files.length === 0) return
    setUploading(true)
    try {
      for (const file of files) {
        await onAddCardWithImage(column.id, file)
      }
    } catch (err) {
      console.error('Error uploading image:', err)
    }
    setUploading(false)
    e.target.value = ''
  }

  if (collapsed) {
    return (
      <Draggable draggableId={`col-${column.id}`} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="rounded-xl w-10 flex-shrink-0 flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
            style={{ backgroundColor: column.color ? column.color + '90' : '#f3f4f6', minHeight: 200 }}
            onClick={() => onToggleCollapse(column.id)}
          >
            <div className="flex flex-col items-center pt-2 pb-2 h-full">
              <span className="text-xs font-medium text-gray-500 mb-2">{cards.length}</span>
              <div className="flex-1 flex items-center">
                <span
                  className="text-sm font-semibold text-gray-700 whitespace-nowrap"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  {column.title}
                </span>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    )
  }

  return (
    <Draggable draggableId={`col-${column.id}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`rounded-xl w-72 flex-shrink-0 flex flex-col max-h-full ${
            dragOver ? 'ring-2 ring-blue-400' : ''
          }`}
          style={{ backgroundColor: column.color ? column.color + '90' : '#f3f4f6' }}
          onDrop={handleImageDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onPaste={handlePaste}
          tabIndex={0}
        >
          <div {...provided.dragHandleProps}>
            <ColumnHeader
              column={column}
              cardCount={cards.length}
              onUpdate={onUpdateColumn}
              onDelete={onDeleteColumn}
              onArchive={onArchiveColumn}
              onCollapse={() => onToggleCollapse(column.id)}
              onShiftLeft={isFirst ? null : () => onShiftColumn?.(column.id, -1)}
              onShiftRight={isLast ? null : () => onShiftColumn?.(column.id, 1)}
            />
          </div>

          <Droppable droppableId={column.id} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 overflow-y-auto px-2 pb-2 transition-colors ${
                  snapshot.isDraggingOver
                    ? 'bg-blue-100/70 ring-2 ring-blue-400 ring-inset rounded'
                    : ''
                }`}
                // Bigger hit target — empty columns get a usable drop zone instead of a 4px sliver
                style={{ minHeight: snapshot.isDraggingOver ? 80 : 40 }}
              >
                {sortedCards.length === 0 && snapshot.isDraggingOver && (
                  <div className="text-xs text-blue-700 text-center py-6 border-2 border-dashed border-blue-300 rounded my-2">
                    Drop here
                  </div>
                )}
                {sortedCards.map((card, i) => (
                  <CardPreview
                    key={card.id}
                    card={card}
                    index={i}
                    labels={labels}
                    onClick={onCardClick}
                    onToggleComplete={onToggleComplete}
                  />
                ))}
                {provided.placeholder}

                {uploading && (
                  <div className="text-center py-3 text-sm text-blue-500">Uploading...</div>
                )}

                {dragOver && !uploading && (
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center text-sm text-blue-500 mb-2">
                    Drop image here
                  </div>
                )}
              </div>
            )}
          </Droppable>

          <div className="flex items-center gap-1">
            {showAddCard ? (
              <div className="flex-1">
                <AddCardForm
                  onAdd={title => { onAddCard(column.id, title); setShowAddCard(false) }}
                  onCancel={() => setShowAddCard(false)}
                />
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowAddCard(true)}
                  className="flex-1 text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-200 rounded-bl-xl bg-transparent border-none cursor-pointer transition-colors"
                >
                  + Add a card
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-br-xl bg-transparent border-none cursor-pointer transition-colors"
                  title="Add image card"
                >
                  &#128247;
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
