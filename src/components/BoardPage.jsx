import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { useBoard } from '../hooks/useBoard'
import { useRealtimeBoard } from '../hooks/useRealtimeBoard'
import { getBoardBackground } from '../lib/backgrounds'
import Layout from './Layout'
import BoardHeader from './BoardHeader'
import Column from './Column'
import AddColumnButton from './AddColumnButton'
import SearchFilter from './SearchFilter'
import CardDetailModal from './CardDetailModal'

export default function BoardPage() {
  const { id: boardId, cardId } = useParams()
  const navigate = useNavigate()
  const {
    board, columns, cards, labels, members, loading,
    updateBoard,
    addColumn, updateColumn, deleteColumn, moveColumn,
    addCard, addCardWithImage, updateCard, deleteCard, moveCard,
    addLabel, toggleCardLabel, toggleCardMember, inviteMember,
    refetch,
  } = useBoard(boardId)

  const [filters, setFilters] = useState({ search: '', labelId: null, memberId: null, dueSoon: false })

  // Real-time sync
  useRealtimeBoard(boardId, {
    onCardChange: useCallback(() => refetch(), [refetch]),
    onColumnChange: useCallback(() => refetch(), [refetch]),
    onCommentChange: useCallback(() => {}, []),
    onLabelChange: useCallback(() => refetch(), [refetch]),
  })

  // Filter cards
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      if (filters.search && !card.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !(card.description || '').toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      if (filters.labelId && !(card.card_labels || []).some(cl => cl.label_id === filters.labelId)) {
        return false
      }
      if (filters.memberId && !(card.card_members || []).some(cm => cm.user_id === filters.memberId)) {
        return false
      }
      if (filters.dueSoon && card.due_date) {
        const due = new Date(card.due_date)
        const soon = new Date(Date.now() + 2 * 86400000)
        if (due > soon) return false
      } else if (filters.dueSoon && !card.due_date) {
        return false
      }
      return true
    })
  }, [cards, filters])

  // Sort columns by position
  const sortedColumns = useMemo(() =>
    [...columns].sort((a, b) => a.position - b.position),
    [columns]
  )

  // Open card from URL
  const selectedCard = cardId ? cards.find(c => c.id === cardId) : null

  function handleDragEnd(result) {
    const { source, destination, type, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    if (type === 'column') {
      moveColumn(draggableId.replace('col-', ''), destination.index)
      return
    }

    // Card drag
    const cardIdDragged = draggableId
    moveCard(cardIdDragged, destination.droppableId, destination.index)
  }

  function openCard(card) {
    navigate(`/board/${boardId}/card/${card.id}`)
  }

  function closeCard() {
    navigate(`/board/${boardId}`)
  }

  async function handleDeleteCard(id) {
    await deleteCard(id)
    closeCard()
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center flex-1">
          <p className="text-gray-500">Loading board...</p>
        </div>
      </Layout>
    )
  }

  if (!board) {
    return (
      <Layout>
        <div className="flex items-center justify-center flex-1">
          <p className="text-gray-500">Board not found</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <BoardHeader board={board} members={members} onInvite={inviteMember} onUpdateBoard={updateBoard} />

      <SearchFilter
        labels={labels}
        members={members}
        filters={filters}
        onChange={setFilters}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" type="column" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex-1 flex gap-4 p-4 overflow-x-auto items-start"
              style={getBoardBackground(board.color).board}
            >
              {sortedColumns.map((column, i) => (
                <Column
                  key={column.id}
                  column={column}
                  cards={filteredCards.filter(c => c.column_id === column.id)}
                  labels={labels}
                  index={i}
                  onUpdateColumn={updateColumn}
                  onDeleteColumn={deleteColumn}
                  onAddCard={addCard}
                  onAddCardWithImage={addCardWithImage}
                  onCardClick={openCard}
                  onToggleComplete={(cardId, completed) => updateCard(cardId, { completed })}
                />
              ))}
              {provided.placeholder}
              <AddColumnButton onAdd={addColumn} />
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          labels={labels}
          members={members}
          onClose={closeCard}
          onUpdate={updateCard}
          onDelete={handleDeleteCard}
          onToggleLabel={toggleCardLabel}
          onToggleMember={toggleCardMember}
          onCreateLabel={(name, color) => addLabel(name, color)}
        />
      )}
    </Layout>
  )
}
