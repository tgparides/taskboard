import { useState, useMemo, useCallback, useRef } from 'react'
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
import ArchiveModal from './ArchiveModal'

export default function BoardPage() {
  const { id: boardId, cardId } = useParams()
  const navigate = useNavigate()
  const {
    board, columns, cards, labels, members, loading,
    updateBoard,
    addColumn, updateColumn, deleteColumn, moveColumn, shiftColumn,
    addCard, addCardWithImage, updateCard, deleteCard, moveCard,
    archiveCard, unarchiveCard,
    addLabel, toggleCardLabel, toggleCardMember, inviteMember,
    refetch,
  } = useBoard(boardId)

  const [filters, setFilters] = useState({ search: '', labelId: null, memberId: null, dueSoon: false })
  const [archiveOpen, setArchiveOpen] = useState(false)
  // Track whether a drag is in progress so we can suppress realtime refetches
  // (a mid-drag re-render can drop the operation, which is why drags felt flaky).
  const draggingRef = useRef(false)
  const [collapsedCols, setCollapsedCols] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`collapsed-${boardId}`) || '{}') } catch { return {} }
  })

  function toggleCollapse(colId) {
    setCollapsedCols(prev => {
      const next = { ...prev, [colId]: !prev[colId] }
      localStorage.setItem(`collapsed-${boardId}`, JSON.stringify(next))
      return next
    })
  }

  // Real-time sync — but skip refetches mid-drag so the operation isn't interrupted.
  // (Realtime fires on our own optimistic update too, which is what made drags
  // unreliable — it'd re-render mid-drop and lose the drop target.)
  useRealtimeBoard(boardId, {
    onCardChange: useCallback(() => { if (!draggingRef.current) refetch() }, [refetch]),
    onColumnChange: useCallback(() => { if (!draggingRef.current) refetch() }, [refetch]),
    onCommentChange: useCallback(() => {}, []),
    onLabelChange: useCallback(() => { if (!draggingRef.current) refetch() }, [refetch]),
  })

  // Filter cards (also hides archived cards from the active board view)
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      if (card.archived_at) return false
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

  function handleDragStart() {
    draggingRef.current = true
  }
  function handleDragEnd(result) {
    draggingRef.current = false
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
      <BoardHeader
        board={board}
        members={members}
        onInvite={inviteMember}
        onUpdateBoard={updateBoard}
        archivedCount={cards.filter(c => c.archived_at).length}
        onOpenArchive={() => setArchiveOpen(true)}
      />

      <SearchFilter
        labels={labels}
        members={members}
        filters={filters}
        onChange={setFilters}
      />

      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
                  isFirst={i === 0}
                  isLast={i === sortedColumns.length - 1}
                  onUpdateColumn={updateColumn}
                  onDeleteColumn={deleteColumn}
                  onShiftColumn={shiftColumn}
                  onAddCard={addCard}
                  onAddCardWithImage={addCardWithImage}
                  onCardClick={openCard}
                  onToggleComplete={(cardId, completed) => updateCard(cardId, { completed })}
                  collapsed={!!collapsedCols[column.id]}
                  onToggleCollapse={toggleCollapse}
                />
              ))}
              {provided.placeholder}
              <AddColumnButton onAdd={(title, color) => addColumn(title, color)} />
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          labels={labels}
          members={members}
          columns={sortedColumns}
          onClose={closeCard}
          onUpdate={updateCard}
          onDelete={handleDeleteCard}
          onArchive={async (id) => { await archiveCard(id); closeCard() }}
          onMoveCard={moveCard}
          onToggleLabel={toggleCardLabel}
          onToggleMember={toggleCardMember}
          onCreateLabel={(name, color) => addLabel(name, color)}
        />
      )}

      {archiveOpen && (
        <ArchiveModal
          archivedCards={cards.filter(c => c.archived_at).sort((a, b) => new Date(b.archived_at) - new Date(a.archived_at))}
          columns={columns}
          onClose={() => setArchiveOpen(false)}
          onUnarchive={unarchiveCard}
          onDelete={deleteCard}
          onOpenCard={openCard}
        />
      )}
    </Layout>
  )
}
