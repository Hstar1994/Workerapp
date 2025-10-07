import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedName = localStorage.getItem('name');
    
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Try to fetch user info from API
    fetch('/api/auth/me', {
      headers: { Authorization: token },
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to localStorage if API fails
        setUser({ name: storedName, role: storedRole });
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    window.location.href = '/login';
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  if (!user) return <div style={{ padding: 20 }}>No user data</div>;

  const { role, name } = user;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, borderBottom: '1px solid #eee', paddingBottom: 20 }}>
        <h1>Worker App Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <span>You are logged in as <strong>{name}</strong> ({role})</span>
          <button onClick={handleLogout} style={{ padding: '5px 10px' }}>Logout</button>
        </div>
      </header>

      {/* Admin-only content */}
      {role === 'admin' && (
        <section style={{ backgroundColor: '#f0f8ff', padding: 15, marginBottom: 20, border: '1px solid #0066cc' }}>
          <h2>🔧 Admin Panel</h2>
          <p>Admin-only features:</p>
          <ul>
            <li>User management</li>
            <li>System settings</li>
            <li>All data access</li>
            <li>Role assignments</li>
          </ul>
          <button style={{ backgroundColor: '#0066cc', color: 'white', padding: '8px 16px', border: 'none' }}>
            Manage Users
          </button>
        </section>
      )}

      {/* Manager and Admin content */}
      {(role === 'manager' || role === 'admin') && (
        <section style={{ backgroundColor: '#f0fff0', padding: 15, marginBottom: 20, border: '1px solid #00aa00' }}>
          <h2>📊 Manager Dashboard</h2>
          <p>Manager features:</p>
          <ul>
            <li>Weekly schedule view</li>
            <li>Job assignment</li>
            <li>Worker oversight</li>
            <li>Approve time extensions</li>
          </ul>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ backgroundColor: '#00aa00', color: 'white', padding: '8px 16px', border: 'none' }}>
              View Schedule
            </button>
            <button style={{ backgroundColor: '#00aa00', color: 'white', padding: '8px 16px', border: 'none' }}>
              Create Job
            </button>
          </div>
        </section>
      )}

      {/* Worker content - everyone can see this */}
      <section style={{ backgroundColor: '#fff8f0', padding: 15, marginBottom: 20, border: '1px solid #ff8800' }}>
        <h2>👷 Worker Dashboard</h2>
        <p>Worker features (available to all):</p>
        <ul>
          <li>Today's assignments</li>
          <li>Time tracking</li>
          <li>Job completion</li>
          <li>Request extensions</li>
        </ul>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ backgroundColor: '#ff8800', color: 'white', padding: '8px 16px', border: 'none' }}>
            Start Job
          </button>
          <button style={{ backgroundColor: '#ff8800', color: 'white', padding: '8px 16px', border: 'none' }}>
            View My Tasks
          </button>
        </div>
      </section>

      {/* API Health Check */}
      <section style={{ backgroundColor: '#f8f8f8', padding: 15, border: '1px solid #ccc' }}>
        <h3>System Status</h3>
        <ApiHealth />
      </section>
    </div>
  );
}

function ApiHealth() {
  const [status, setStatus] = useState('checking...');
  
  useEffect(() => {
    fetch('/healthz')
      .then(res => res.json())
      .then(data => setStatus(data.status === 'ok' ? '✅ API Online' : '❌ API Error'))
      .catch(() => setStatus('❌ API Offline'));
  }, []);
  
  return <div><strong>Backend:</strong> {status}</div>;
}