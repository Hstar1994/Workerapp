import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCurrentUser();
        fetchUsers();
    }, []);

    const fetchCurrentUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('/api/auth/me', {
                headers: { 'Authorization': token }
            });

            if (response.ok) {
                const user = await response.json();
                setCurrentUser(user);

                // Check if user is admin
                if (user.role !== 'admin') {
                    setError('Access denied. Admin privileges required.');
                    setLoading(false);
                }
            } else {
                navigate('/login');
            }
        } catch (err) {
            console.error('Error fetching current user:', err);
            navigate('/login');
        }
    };

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('/api/users/', {
                headers: { 'Authorization': token }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else if (response.status === 403) {
                setError('Access denied. Admin privileges required.');
            } else if (response.status === 401) {
                navigate('/login');
            } else {
                setError('Failed to load users');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
        navigate('/login');
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return '#dc3545';
            case 'manager': return '#0d6efd';
            case 'worker': return '#198754';
            default: return '#6c757d';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading users...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>
                    <h2>⚠️ {error}</h2>
                    <button onClick={() => navigate('/dashboard')} style={styles.button}>
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>User Management</h1>
                    <p style={styles.subtitle}>
                        Logged in as: <strong>{currentUser?.name}</strong> ({currentUser?.role})
                    </p>
                </div>
                <div style={styles.headerActions}>
                    <button onClick={() => navigate('/dashboard')} style={styles.secondaryButton}>
                        Dashboard
                    </button>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        Logout
                    </button>
                </div>
            </div>

            <div style={styles.stats}>
                <div style={styles.statCard}>
                    <div style={styles.statNumber}>{users.length}</div>
                    <div style={styles.statLabel}>Total Users</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statNumber}>
                        {users.filter(u => u.role === 'admin').length}
                    </div>
                    <div style={styles.statLabel}>Admins</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statNumber}>
                        {users.filter(u => u.role === 'manager').length}
                    </div>
                    <div style={styles.statLabel}>Managers</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statNumber}>
                        {users.filter(u => u.role === 'worker').length}
                    </div>
                    <div style={styles.statLabel}>Workers</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statNumber}>
                        {users.filter(u => u.is_active).length}
                    </div>
                    <div style={styles.statLabel}>Active</div>
                </div>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Phone</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={styles.tr}>
                                <td style={styles.td}>{user.id}</td>
                                <td style={styles.td}>
                                    <strong>{user.name}</strong>
                                    {user.id === parseInt(localStorage.getItem('userId')) && (
                                        <span style={styles.youBadge}> (You)</span>
                                    )}
                                </td>
                                <td style={styles.td}>{user.email}</td>
                                <td style={styles.td}>{user.phone || 'N/A'}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.roleBadge,
                                        backgroundColor: getRoleBadgeColor(user.role)
                                    }}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.statusBadge,
                                        backgroundColor: user.is_active ? '#198754' : '#6c757d'
                                    }}>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <small>{formatDate(user.created_at)}</small>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #dee2e6'
    },
    title: {
        margin: '0 0 5px 0',
        color: '#212529'
    },
    subtitle: {
        margin: 0,
        color: '#6c757d',
        fontSize: '14px'
    },
    headerActions: {
        display: 'flex',
        gap: '10px'
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#0d6efd',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    secondaryButton: {
        padding: '10px 20px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    logoutButton: {
        padding: '10px 20px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    stats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
    },
    statCard: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        border: '1px solid #dee2e6'
    },
    statNumber: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#0d6efd',
        marginBottom: '5px'
    },
    statLabel: {
        fontSize: '14px',
        color: '#6c757d',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    th: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        textAlign: 'left',
        fontWeight: '600',
        color: '#495057',
        borderBottom: '2px solid #dee2e6',
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    tr: {
        borderBottom: '1px solid #dee2e6',
        transition: 'background-color 0.2s'
    },
    td: {
        padding: '15px',
        color: '#212529'
    },
    roleBadge: {
        padding: '4px 12px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block'
    },
    statusBadge: {
        padding: '4px 12px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block'
    },
    youBadge: {
        color: '#0d6efd',
        fontSize: '12px',
        fontWeight: '600'
    },
    loading: {
        textAlign: 'center',
        padding: '50px',
        fontSize: '18px',
        color: '#6c757d'
    },
    error: {
        textAlign: 'center',
        padding: '50px',
        color: '#dc3545'
    }
};

export default UserManagement;

