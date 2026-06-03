// Archive viewer for the current board.
// Shows archived lists (whole columns) and archived cards, each with Unarchive + Delete actions.
export default function ArchiveModal({ archivedCards, archivedColumns = [], cards = [], columns, onClose, onUnarchive, onDelete, onUnarchiveColumn, onDeleteColumn, onOpenCard }) {
  function colName(columnId) {
    return columns.find(c => c.id === columnId)?.title || '—'
  }
  function cardCountFor(columnId) {
    return cards.filter(c => c.column_id === columnId && !c.archived_at).length
  }
  function formatWhen(iso) {
    const d = new Date(iso)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const nothingArchived = archivedColumns.length === 0 && archivedCards.length === 0

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center pt-12 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mb-12" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Archive</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {archivedColumns.length} archived list{archivedColumns.length === 1 ? '' : 's'} · {archivedCards.length} archived card{archivedCards.length === 1 ? '' : 's'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl leading-none">&times;</button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {nothingArchived ? (
            <p className="text-sm text-gray-400 text-center py-8">Nothing archived on this board.</p>
          ) : (
            <>
              {archivedColumns.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Lists</h3>
                  <ul className="flex flex-col gap-2">
                    {archivedColumns.map(col => {
                      const count = cardCountFor(col.id)
                      return (
                        <li key={col.id} className="border border-gray-200 rounded-lg p-3 flex items-start justify-between gap-3 hover:bg-gray-50">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                                style={{ backgroundColor: col.color || '#d1d5db' }}
                              />
                              <span className="text-sm font-semibold text-gray-900 truncate">{col.title}</span>
                              <span className="text-xs text-gray-400 flex-shrink-0">{count} card{count === 1 ? '' : 's'}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">archived {formatWhen(col.archived_at)}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => onUnarchiveColumn(col.id)}
                              className="text-xs font-semibold text-emerald-700 border border-emerald-300 hover:bg-emerald-50 px-3 py-1 rounded"
                            >
                              Unarchive
                            </button>
                            <button
                              onClick={() => { if (confirm(`Permanently delete the list "${col.title}" and its ${count} card${count === 1 ? '' : 's'}? This cannot be undone.`)) onDeleteColumn(col.id) }}
                              className="text-xs text-gray-400 hover:text-red-600"
                              title="Delete permanently"
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {archivedCards.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Cards</h3>
                  <ul className="flex flex-col gap-2">
                    {archivedCards.map(card => (
                      <li key={card.id} className="border border-gray-200 rounded-lg p-3 flex items-start justify-between gap-3 hover:bg-gray-50">
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => { onOpenCard(card); onClose() }}
                            className="text-sm font-semibold text-gray-900 hover:underline text-left truncate block w-full"
                          >
                            {card.title}
                          </button>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            from <span className="font-medium">{colName(card.column_id)}</span> · archived {formatWhen(card.archived_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => onUnarchive(card.id)}
                            className="text-xs font-semibold text-emerald-700 border border-emerald-300 hover:bg-emerald-50 px-3 py-1 rounded"
                          >
                            Unarchive
                          </button>
                          <button
                            onClick={() => { if (confirm(`Permanently delete "${card.title}"? This cannot be undone.`)) onDelete(card.id) }}
                            className="text-xs text-gray-400 hover:text-red-600"
                            title="Delete permanently"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
