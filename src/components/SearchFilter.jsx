import { useState } from 'react'

export default function SearchFilter({ labels, members, filters, onChange }) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <input
        type="text"
        placeholder="Search cards..."
        value={filters.search}
        onChange={e => onChange({ ...filters, search: e.target.value })}
        className="px-2 py-1 border border-gray-300 rounded text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="relative">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-2 py-1 text-sm rounded border cursor-pointer ${
            (filters.labelId || filters.memberId || filters.dueSoon)
              ? 'bg-blue-100 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Filter
          {(filters.labelId || filters.memberId || filters.dueSoon) && ' (active)'}
        </button>

        {showFilters && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
            <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-20 w-56">
              {/* Label filter */}
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Label</p>
              <select
                value={filters.labelId || ''}
                onChange={e => onChange({ ...filters, labelId: e.target.value || null })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-3"
              >
                <option value="">All labels</option>
                {labels.map(l => (
                  <option key={l.id} value={l.id}>{l.name || 'Unnamed'}</option>
                ))}
              </select>

              {/* Member filter */}
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Member</p>
              <select
                value={filters.memberId || ''}
                onChange={e => onChange({ ...filters, memberId: e.target.value || null })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-3"
              >
                <option value="">All members</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                ))}
              </select>

              {/* Due date filter */}
              <label className="flex items-center gap-2 text-sm text-gray-700 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.dueSoon || false}
                  onChange={e => onChange({ ...filters, dueSoon: e.target.checked })}
                />
                Due soon / overdue
              </label>

              <button
                onClick={() => onChange({ search: filters.search, labelId: null, memberId: null, dueSoon: false })}
                className="w-full py-1 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 rounded border-none cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
