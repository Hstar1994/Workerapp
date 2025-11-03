import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [filters, setFilters] = useState({ action: '' });
    const [pagination, setPagination] = useState({ limit: 50, offset: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        fetchCurrentUser();
        fetchLogs();
    }, [pagination, filters]);

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

    const fetchLogs = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const params = new URLSearchParams({
                limit: pagination.limit.toString(),
                offset: pagination.offset.toString()
            });

            if (filters.action) {
                params.append('action', filters.action);
            }

            const response = await fetch(`/api/logs/?${params}`, {
                headers: { 'Authorization': token }
            });

            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            } else if (response.status === 403) {
                setError('Access denied. Admin privileges required.');
            } else if (response.status === 401) {
                navigate('/login');
            } else {
                setError('Failed to load activity logs');
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getActionColor = (action) => {
        if (action.includes('created')) return '#198754';
        if (action.includes('updated')) return '#0d6efd';
        if (action.includes('deactivated') || action.includes('deleted')) return '#dc3545';
        return '#6c757d';
    };

    const handleNextPage = () => {
        setPagination(prev => ({
            ...prev,
            offset: prev.offset + prev.limit
        }));
    };

    const handlePrevPage = () => {
        setPagination(prev => ({
            ...prev,
            offset: Math.max(0, prev.offset - prev.limit)
        }));
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading activity logs...</div>
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
                    <h1 style={styles.title}>Activity Logs</h1>
                    <p style={styles.subtitle}>
                        Logged in as: <strong>{currentUser?.name}</strong> ({currentUser?.role})
                    </p>
                </div>
                <div style={styles.headerActions}>
                    <button onClick={() => navigate('/dashboard')} style={styles.secondaryButton}>
                        Dashboard
                    </button>
                    <button onClick={() => navigate('/user-management')} style={styles.secondaryButton}>
                        User Management
                    </button>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        Logout
                    </button>
                </div>
            </div>

            <div style={styles.filterBar}>
                <label style={styles.filterLabel}>
                    Filter by Action:
                    <select
                        value={filters.action}
                        onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                        style={styles.filterSelect}
                    >
                        <option value="">All Actions</option>
                        <option value="user_created">User Created</option>
                        <option value="user_updated">User Updated</option>
                        <option value="user_deactivated">User Deactivated</option>
                    </select>
                </label>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Timestamp</th>
                            <th style={styles.th}>Action</th>
                            <th style={styles.th}>Performed By</th>
                            <th style={styles.th}>Target User</th>
                            <th style={styles.th}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                                    No activity logs found
                                </td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id} style={styles.tr}>
                                    <td style={styles.td}>{log.id}</td>
                                    <td style={styles.td}>
                                        <small>{formatDate(log.created_at)}</small>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.actionBadge,
                                            backgroundColor: getActionColor(log.action)
                                        }}>
                                            {log.action.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <strong>{log.performer_name || 'System'}</strong>
                                    </td>
                                    <td style={styles.td}>
                                        {log.target_user_name || 'N/A'}
                                    </td>
                                    <td style={styles.td}>
                                        {log.description}
                                        {log.metadata && (
                                            <details style={{ marginTop: '5px' }}>
                                                <summary style={{ cursor: 'pointer', color: '#0d6efd' }}>
                                                    View Details
                                                </summary>
                                                <pre style={styles.metadata}>
                                                    {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div style={styles.pagination}>
                <button 
                    onClick={handlePrevPage} 
                    disabled={pagination.offset === 0}
                    style={{
                        ...styles.paginationButton,
                        opacity: pagination.offset === 0 ? 0.5 : 1,
                        cursor: pagination.offset === 0 ? 'not-allowed' : 'pointer'
                    }}
                >
                    ← Previous
                </button>
                <span style={styles.paginationInfo}>
                    Showing {pagination.offset + 1} - {pagination.offset + logs.length}
                </span>
                <button 
                    onClick={handleNextPage}
                    disabled={logs.length < pagination.limit}
                    style={{
                        ...styles.paginationButton,
                        opacity: logs.length < pagination.limit ? 0.5 : 1,
                        cursor: logs.length < pagination.limit ? 'not-allowed' : 'pointer'
                    }}
                >
                    Next →
                </button>
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
    filterBar: {
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
    },
    filterLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontWeight: '600',
        color: '#495057'
    },
    filterSelect: {
        padding: '8px 12px',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        fontSize: '14px',
        marginLeft: '10px'
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
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
        color: '#212529',
        verticalAlign: 'top'
    },
    actionBadge: {
        padding: '4px 12px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block'
    },
    metadata: {
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '12px',
        overflow: 'auto',
        maxHeight: '200px'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        padding: '20px'
    },
    paginationButton: {
        padding: '10px 20px',
        backgroundColor: '#0d6efd',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '14px',
        fontWeight: '500'
    },
    paginationInfo: {
        fontSize: '14px',
        color: '#6c757d'
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

export default ActivityLogs;
