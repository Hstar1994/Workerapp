import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    window.location.href = '/login';
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  if (!user) return <div style={{ padding: 20 }}>No user data</div>;

  const { role, name, email, id, created_at } = user;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return '#dc3545';
      case 'manager': return '#0d6efd';
      case 'worker': return '#198754';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, borderBottom: '2px solid #dee2e6', paddingBottom: 20 }}>
        <h1 style={{ margin: 0, color: '#212529' }}>Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          {role === 'admin' && (
            <button 
              onClick={() => navigate('/user-management')}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Manage Users
            </button>
          )}
          <button 
            onClick={handleLogout} 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Account Information Card */}
      <section style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        marginBottom: '30px', 
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#212529' }}>Account Information</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px' 
        }}>
          <div>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Name
            </div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#212529' }}>
              {name}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email
            </div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#212529' }}>
              {email}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Role
            </div>
            <div>
              <span style={{
                padding: '6px 16px',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: getRoleBadgeColor(role),
                display: 'inline-block',
                textTransform: 'uppercase'
              }}>
                {role}
              </span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Member Since
            </div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#212529' }}>
              {formatDate(created_at)}
            </div>
          </div>
        </div>
      </section>

      {/* Admin-only content */}
      {role === 'admin' && (
        <section style={{ 
          backgroundColor: '#f8d7da', 
          padding: '25px', 
          marginBottom: '20px', 
          border: '2px solid #dc3545',
          borderRadius: '8px'
        }}>
          <h2 style={{ marginTop: 0, color: '#721c24' }}>🔧 Admin Dashboard</h2>
          <p style={{ color: '#721c24', marginBottom: '15px' }}>
            As an administrator, you have full system access including:
          </p>
          <ul style={{ color: '#721c24' }}>
            <li>View and manage all users</li>
            <li>Assign and modify user roles</li>
            <li>Access system-wide settings</li>
            <li>View all jobs and schedules</li>
            <li>Generate reports and analytics</li>
          </ul>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              style={{ 
                backgroundColor: '#dc3545', 
                color: 'white', 
                padding: '10px 20px', 
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onClick={() => navigate('/user-management')}
            >
              Manage Users
            </button>
            <button
              style={{ 
                backgroundColor: '#6610f2', 
                color: 'white', 
                padding: '10px 20px', 
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onClick={() => navigate('/activity-logs')}
            >
              View Activity Logs
            </button>
          </div>
        </section>
      )}

      {/* Manager and Admin content */}
      {(role === 'manager' || role === 'admin') && (
        <section style={{ 
          backgroundColor: '#d1ecf1', 
          padding: '25px', 
          marginBottom: '20px', 
          border: '2px solid #0d6efd',
          borderRadius: '8px'
        }}>
          <h2 style={{ marginTop: 0, color: '#0c5460' }}>📊 Manager Dashboard</h2>
          <p style={{ color: '#0c5460', marginBottom: '15px' }}>
            {role === 'admin' ? 'Admins also have access to manager features:' : 'As a manager, you can:'}
          </p>
          <ul style={{ color: '#0c5460' }}>
            <li>View and manage weekly schedules</li>
            <li>Assign jobs to workers</li>
            <li>Oversee worker performance</li>
            <li>Approve time extensions and completion records</li>
            <li>Generate team reports</li>
          </ul>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ 
              backgroundColor: '#0d6efd', 
              color: 'white', 
              padding: '10px 20px', 
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              View Schedule
            </button>
            <button style={{ 
              backgroundColor: '#0d6efd', 
              color: 'white', 
              padding: '10px 20px', 
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Create Job
            </button>
          </div>
        </section>
      )}

      {/* Worker content - everyone can see this */}
      <section style={{ 
        backgroundColor: '#d4edda', 
        padding: '25px', 
        marginBottom: '20px', 
        border: '2px solid #198754',
        borderRadius: '8px'
      }}>
        <h2 style={{ marginTop: 0, color: '#155724' }}>👷 Worker Dashboard</h2>
        <p style={{ color: '#155724', marginBottom: '15px' }}>
          {role === 'worker' ? 'Your worker features:' : 'All users have access to worker features:'}
        </p>
        <ul style={{ color: '#155724' }}>
          <li>View today's job assignments</li>
          <li>Track time on active jobs</li>
          <li>Submit job completion records</li>
          <li>Request time extensions</li>
          <li>Upload job photos and get signatures</li>
        </ul>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ 
            backgroundColor: '#198754', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Start Job
          </button>
          <button style={{ 
            backgroundColor: '#198754', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            View My Tasks
          </button>
        </div>
      </section>

      {/* API Health Check */}
      <section style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        border: '1px solid #dee2e6',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginTop: 0 }}>System Status</h3>
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