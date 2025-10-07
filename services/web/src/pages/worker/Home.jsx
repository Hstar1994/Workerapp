import React, { useEffect, useState } from 'react';

export default function WorkerHome() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/auth/me', {
      headers: { Authorization: token || '' },
    })
      .then(res => res.json())
      .then(setMe)
      .catch(() => setError('Failed to load user'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!me) return <div>No user info</div>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
      <h2>Welcome, {me.name}!</h2>
      <div>Role: {me.role}</div>
      <div>Email: {me.email}</div>
      <div style={{ marginTop: 24, color: '#888' }}>
        <b>API health:</b> <ApiHealth />
      </div>
    </div>
  );
}

function ApiHealth() {
  const [status, setStatus] = useState('');
  useEffect(() => {
    fetch('/healthz')
      .then(res => res.json())
      .then(data => setStatus(data.status || 'ok'))
      .catch(() => setStatus('error'));
  }, []);
  return <span>{status === 'ok' ? '✅ OK' : '❌ Error'}</span>;
}
