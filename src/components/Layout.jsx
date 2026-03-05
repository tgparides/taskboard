import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'

export default function Layout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 h-12 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-gray-800 no-underline">
            TaskBoard
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-700 bg-transparent border-none p-0 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  )
}
