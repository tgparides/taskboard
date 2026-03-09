import { Draggable } from '@hello-pangea/dnd'

export default function CardPreview({ card, index, labels, onClick, onToggleComplete }) {
  const cardLabels = (card.card_labels || [])
    .map(cl => labels.find(l => l.id === cl.label_id))
    .filter(Boolean)

  const isDueSoon = card.due_date && new Date(card.due_date) < new Date(Date.now() + 86400000)
  const isOverdue = card.due_date && new Date(card.due_date) < new Date()

  function handleCheck(e) {
    e.stopPropagation()
    onToggleComplete(card.id, !card.completed)
  }

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(card)}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-2 cursor-pointer hover:border-gray-400 transition-colors ${
            snapshot.isDragging ? 'shadow-lg rotate-2' : ''
          } ${card.completed ? 'opacity-60' : ''}`}
        >
          {/* Cover image */}
          {card.cover_url && (
            <img
              src={card.cover_url}
              alt=""
              className="w-full h-32 object-cover rounded mb-2"
            />
          )}

          {/* Labels */}
          {cardLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {cardLabels.map(label => (
                <span
                  key={label.id}
                  className="inline-block h-2 w-10 rounded-full"
                  style={{ backgroundColor: label.color }}
                  title={label.name}
                />
              ))}
            </div>
          )}

          {/* Title with check button */}
          <div className="flex items-start gap-1.5">
            <button
              onClick={handleCheck}
              className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                card.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 bg-white hover:border-green-400'
              }`}
              title={card.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              {card.completed && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <p className={`text-sm break-words ${card.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {card.title}
            </p>
          </div>

          {/* Footer: due date + members */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {card.due_date && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                isOverdue ? 'bg-red-100 text-red-700' :
                isDueSoon ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {new Date(card.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {card.description && (
              <span className="text-gray-400 text-xs" title="Has description">&#9776;</span>
            )}
            {(card.card_members || []).length > 0 && (
              <div className="flex -space-x-1 ml-auto">
                {card.card_members.slice(0, 3).map(cm => (
                  <div
                    key={cm.user_id}
                    className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white"
                    title={cm.profiles?.full_name}
                  >
                    {(cm.profiles?.full_name || '?')[0].toUpperCase()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
