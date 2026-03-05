import { Draggable } from '@hello-pangea/dnd'

export default function CardPreview({ card, index, labels, onClick }) {
  const cardLabels = (card.card_labels || [])
    .map(cl => labels.find(l => l.id === cl.label_id))
    .filter(Boolean)

  const isDueSoon = card.due_date && new Date(card.due_date) < new Date(Date.now() + 86400000)
  const isOverdue = card.due_date && new Date(card.due_date) < new Date()

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
          }`}
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

          {/* Title */}
          <p className="text-sm text-gray-800 break-words">{card.title}</p>

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
