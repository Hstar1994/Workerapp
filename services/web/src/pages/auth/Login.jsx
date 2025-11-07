import React, { useState } from 'react';

const DEMO_USERS = [
  { email: 'admin@example.com', label: 'Admin' },
  { email: 'manager@example.com', label: 'Manager' },
  { email: 'worker1@example.com', label: 'Worker One' },
  { email: 'worker2@example.com', label: 'Worker Two' },
  { email: 'worker3@example.com', label: 'Worker Three' },
];

export default function Login() {
  // Main login (email + password)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Seeded login (testing)
  const [seedEmail, setSeedEmail] = useState('');
  const [seedError, setSeedError] = useState('');
  const [seedLoading, setSeedLoading] = useState(false);

  // Main login handler (email + password)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name);
      localStorage.setItem('userId', data.user_id);
      localStorage.setItem('email', data.email);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Seeded login handler (email only, for testing)
  const handleSeedLogin = async (e) => {
    e.preventDefault();
    setSeedLoading(true);
    setSeedError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: seedEmail, password: null }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name);
      localStorage.setItem('userId', data.user_id);
      localStorage.setItem('email', data.email);
      window.location.href = '/dashboard';
    } catch (err) {
      setSeedError(err.message || 'Login failed');
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 340, margin: '80px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Sign In</h2>
      <form onSubmit={handleLogin}>
        <label>Email</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          list="demo-users"
          style={{ width: '100%', marginBottom: 12 }}
          autoFocus
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 12 }}
        />
        <button type="submit" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>

      {/* Seeded login panel for testing */}
      <div style={{ marginTop: 32, padding: 16, border: '1px dashed #aaa', borderRadius: 6, background: '#fafbfc' }}>
        <div style={{ fontWeight: 600, color: '#b00', marginBottom: 8 }}>(TESTING) Seeded Login Panel</div>
        <form onSubmit={handleSeedLogin}>
          <label>Email</label>
          <input
            type="text"
            value={seedEmail}
            onChange={(e) => setSeedEmail(e.target.value)}
            list="demo-users"
            style={{ width: '100%', marginBottom: 12 }}
          />
          <button type="submit" style={{ width: '100%' }} disabled={seedLoading}>
            {seedLoading ? 'Signing in...' : 'Seeded Login'}
          </button>
          {seedError && <div style={{ color: 'red', marginTop: 8 }}>{seedError}</div>}
        </form>
        <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
          <div>Seeded users (click to fill):</div>
          {DEMO_USERS.map(u => (
            <div key={u.email} style={{ cursor: 'pointer', color: '#0074d9', textDecoration: 'underline', marginBottom: 2 }}
              onClick={() => setSeedEmail(u.email)}
              title={u.email}
            >
              {u.label}: {u.email}
            </div>
          ))}
          <div style={{ marginTop: 4 }}><b>Password for all:</b> <code>testpass</code></div>
        </div>
      </div>
    </div>
  );
}
