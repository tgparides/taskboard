import { useState } from 'react'

export default function BoardHeader({ board, members, onInvite }) {
  const [showInvite, setShowInvite] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  async function handleInvite(e) {
    e.preventDefault()
    setError('')
    try {
      await onInvite(email.trim())
      setEmail('')
      setShowInvite(false)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div
      className="px-4 py-2 flex items-center gap-3 border-b"
      style={{ backgroundColor: board.color ? `${board.color}dd` : '#3b82f6dd' }}
    >
      <h2 className="text-lg font-bold text-white">{board.title}</h2>

      <div className="flex -space-x-1 ml-2">
        {members.map(m => (
          <div
            key={m.id}
            className="w-7 h-7 rounded-full bg-white/30 text-white text-xs flex items-center justify-center border-2 border-white/50"
            title={`${m.full_name || m.email} (${m.role})`}
          >
            {(m.full_name || m.email || '?')[0].toUpperCase()}
          </div>
        ))}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="text-white/80 hover:text-white bg-white/20 hover:bg-white/30 border-none px-2 py-1 rounded text-sm cursor-pointer"
        >
          Invite
        </button>

        {showInvite && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowInvite(false)} />
            <form
              onSubmit={handleInvite}
              className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg p-3 z-20 w-64"
            >
              <p className="text-sm font-medium mb-2 text-gray-700">Invite by email</p>
              <input
                autoFocus
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
              <button
                type="submit"
                className="w-full py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 border-none cursor-pointer"
              >
                Send Invite
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
