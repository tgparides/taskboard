export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 border-none cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 border-none cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
