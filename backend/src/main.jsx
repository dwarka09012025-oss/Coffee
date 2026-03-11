import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import Dashboard from './pages/Dashboard'
import AdminLogin from './pages/AdminLogin'
import ErrorBoundary from './components/ErrorBoundary'
import { onAuthStateChange, signOut } from './supabase'
import './index.css'

const App = () => {
  const [user, setUser] = useState(undefined) // undefined = loading

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((u) => setUser(u))
    return () => subscription.unsubscribe()
  }, [])

  if (user === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0ebe4' }}>
        <p style={{ color: '#6F4E37', fontSize: '1.1rem' }}>☕ Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <AdminLogin onLogin={setUser} />
  }

  return <Dashboard user={user} onSignOut={() => signOut().then(() => setUser(null))} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
