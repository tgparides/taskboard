import { useState } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import ColumnHeader from './ColumnHeader'
import CardPreview from './CardPreview'
import AddCardForm from './AddCardForm'

export default function Column({ column, cards, labels, index, onUpdateColumn, onDeleteColumn, onAddCard, onCardClick }) {
  const [showAddCard, setShowAddCard] = useState(false)

  const sortedCards = [...cards].sort((a, b) => a.position - b.position)

  return (
    <Draggable draggableId={`col-${column.id}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-gray-100 rounded-xl w-72 flex-shrink-0 flex flex-col max-h-full"
        >
          <div {...provided.dragHandleProps}>
            <ColumnHeader
              column={column}
              cardCount={cards.length}
              onUpdate={onUpdateColumn}
              onDelete={onDeleteColumn}
            />
          </div>

          <Droppable droppableId={column.id} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 overflow-y-auto px-2 pb-2 min-h-[4px] ${
                  snapshot.isDraggingOver ? 'bg-blue-50' : ''
                }`}
              >
                {sortedCards.map((card, i) => (
                  <CardPreview
                    key={card.id}
                    card={card}
                    index={i}
                    labels={labels}
                    onClick={onCardClick}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {showAddCard ? (
            <AddCardForm
              onAdd={title => { onAddCard(column.id, title); setShowAddCard(false) }}
              onCancel={() => setShowAddCard(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddCard(true)}
              className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-200 rounded-b-xl bg-transparent border-none cursor-pointer transition-colors"
            >
              + Add a card
            </button>
          )}
        </div>
      )}
    </Draggable>
  )
}
