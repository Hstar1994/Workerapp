import React, { useState } from 'react';

const DEMO_USERS = [
  { email: 'admin@example.com', label: 'Admin' },
  { email: 'manager@example.com', label: 'Manager' },
  { email: 'worker1@example.com', label: 'Worker One' },
  { email: 'worker2@example.com', label: 'Worker Two' },
  { email: 'worker3@example.com', label: 'Worker Three' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: '80px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Sign In</h2>
      <form onSubmit={handleLogin}>
        <label>Email or phone</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          list="demo-users"
          style={{ width: '100%', marginBottom: 12 }}
          autoFocus
        />
        <datalist id="demo-users">
          {DEMO_USERS.map(u => (
            <option key={u.email} value={u.email}>{u.label}</option>
          ))}
        </datalist>
        <button type="submit" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>
      <div style={{ fontSize: 12, color: '#888', marginTop: 16 }}>
        Demo users:<br />
        {DEMO_USERS.map(u => (
          <div key={u.email}>{u.label}: {u.email}</div>
        ))}
      </div>
    </div>
  );
}
