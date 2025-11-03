import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'worker', is_active: true });
    const [submitting, setSubmitting] = useState(false);
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

    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '', email: '', phone: '', role: 'worker', is_active: true });
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setModalMode('edit');
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            is_active: user.is_active
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setFormData({ name: '', email: '', phone: '', role: 'worker', is_active: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const token = localStorage.getItem('token');
        const url = modalMode === 'create' ? '/api/users/' : `/api/users/${selectedUser.id}`;
        const method = modalMode === 'create' ? 'POST' : 'PUT';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await fetchUsers();
                closeModal();
            } else {
                const data = await response.json();
                alert(`Error: ${data.detail || 'Failed to save user'}`);
            }
        } catch (err) {
            console.error('Error saving user:', err);
            alert('Error saving user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (user) => {
        if (!confirm(`Are you sure you want to deactivate ${user.name}?`)) {
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': token }
            });

            if (response.ok || response.status === 204) {
                await fetchUsers();
            } else {
                const data = await response.json();
                alert(`Error: ${data.detail || 'Failed to deactivate user'}`);
            }
        } catch (err) {
            console.error('Error deactivating user:', err);
            alert('Error deactivating user');
        }
    };

    const handleToggleActive = async (user) => {
        const newStatus = !user.is_active;
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ is_active: newStatus })
            });

            if (response.ok) {
                await fetchUsers();
            } else {
                const data = await response.json();
                alert(`Error: ${data.detail || 'Failed to update user status'}`);
            }
        } catch (err) {
            console.error('Error updating user status:', err);
            alert('Error updating user status');
        }
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
                    <button onClick={openCreateModal} style={styles.createButton}>
                        + Create User
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
                            <th style={styles.th}>Actions</th>
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
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button 
                                            onClick={() => openEditModal(user)} 
                                            style={styles.actionButton}
                                            title="Edit user"
                                        >
                                            ✏️
                                        </button>
                                        <button 
                                            onClick={() => handleToggleActive(user)}
                                            style={{
                                                ...styles.actionButton,
                                                backgroundColor: user.is_active ? '#ffc107' : '#198754'
                                            }}
                                            title={user.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            {user.is_active ? '⏸️' : '▶️'}
                                        </button>
                                        {user.id !== parseInt(localStorage.getItem('userId')) && (
                                            <button 
                                                onClick={() => handleDelete(user)}
                                                style={{...styles.actionButton, backgroundColor: '#dc3545'}}
                                                title="Delete user"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div style={styles.modalOverlay} onClick={closeModal}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>{modalMode === 'create' ? 'Create New User' : 'Edit User'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Phone</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Role *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    style={styles.input}
                                    required
                                >
                                    <option value="worker">Worker</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                    />
                                    <span style={{ marginLeft: '8px' }}>Active</span>
                                </label>
                            </div>
                            <div style={styles.modalActions}>
                                <button type="button" onClick={closeModal} style={styles.cancelButton}>
                                    Cancel
                                </button>
                                <button type="submit" style={styles.saveButton} disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
    createButton: {
        padding: '10px 20px',
        backgroundColor: '#198754',
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
    actionButton: {
        padding: '5px 10px',
        backgroundColor: '#0d6efd',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
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
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    modal: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
    },
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: '600',
        color: '#495057'
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        fontSize: '14px',
        boxSizing: 'border-box'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer'
    },
    modalActions: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
        marginTop: '20px'
    },
    cancelButton: {
        padding: '10px 20px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    saveButton: {
        padding: '10px 20px',
        backgroundColor: '#198754',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    }
};

export default UserManagement;
