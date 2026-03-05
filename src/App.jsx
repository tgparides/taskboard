import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LoginPage from './components/LoginPage'
import BoardsPage from './components/BoardsPage'
import BoardPage from './components/BoardPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Loading...</p></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><BoardsPage /></ProtectedRoute>} />
          <Route path="/board/:id" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
          <Route path="/board/:id/card/:cardId" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
