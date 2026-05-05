// Archived-card viewer for the current board.
// Lists all archived cards (most recently archived first) with Unarchive + Delete actions.
export default function ArchiveModal({ archivedCards, columns, onClose, onUnarchive, onDelete, onOpenCard }) {
  function colName(columnId) {
    return columns.find(c => c.id === columnId)?.title || '—'
  }
  function formatWhen(iso) {
    const d = new Date(iso)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center pt-12 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mb-12" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Archive</h2>
            <p className="text-xs text-gray-500 mt-0.5">{archivedCards.length} archived card{archivedCards.length === 1 ? '' : 's'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl leading-none">&times;</button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {archivedCards.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No archived cards on this board.</p>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}
