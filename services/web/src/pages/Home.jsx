import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  // If already authenticated, send user to dashboard
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) navigate('/dashboard', { replace: true })
  }, [navigate])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 24,
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{ margin: 0, marginBottom: 8, fontSize: 24 }}>Worker App</h1>
        <p style={{ marginTop: 0, color: '#6b7280' }}>Welcome. Please sign in to continue.</p>
        <div style={{ marginTop: 16 }}>
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '10px 16px',
              borderRadius: 6,
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
