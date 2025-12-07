import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    const approveUser = async (id) => {
        try {
            await apiClient.patch(`/users/${id}/approve`);
            setUsers(users.map(u => u.id === id ? { ...u, is_approved: true } : u));
        } catch (error) {
            console.error("Error approving user", error);
        }
    };

    const [deleteLoading, setDeleteLoading] = useState(null); // Now stores the user object to delete, or {id, loading: true}
    const [isDeleting, setIsDeleting] = useState(false); // Valid loading state

    const initiateDelete = (user) => {
        setDeleteLoading(user);
    };

    const confirmDelete = async (id) => {
        setIsDeleting(true);
        try {
            await apiClient.delete(`/users/${id}`);
            // Use functional update to ensure we filter the most current state
            setUsers(prevUsers => prevUsers.filter(u => u.id !== id));
            setDeleteLoading(null); // Close modal on success
        } catch (error) {
            console.error("Error deleting user", error);
            alert("Failed to delete user. Check console for details.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="container">
            <h1>Admin Dashboard</h1>
            <div className="card">
                <h2>User Management</h2>
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', color: '#fff', tableLayout: 'fixed' }}>
                        <thead>
                            <tr style={{textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.1)'}}>
                                <th style={{padding: '15px', width: '10%'}}>ID</th>
                                <th style={{padding: '15px', width: '25%'}}>Username</th>
                                <th style={{padding: '15px', width: '15%'}}>Role</th>
                                <th style={{padding: '15px', width: '20%'}}>Status</th>
                                <th style={{padding: '15px', width: '30%', textAlign: 'right'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', textAlign: 'left' }}>
                                    <td style={{padding: '15px'}}>{user.id}</td>
                                    <td style={{padding: '15px'}}>{user.username}</td>
                                    <td style={{padding: '15px', textTransform: 'capitalize'}}>{user.role}</td>
                                    <td style={{padding: '15px'}}>
                                        <span style={{
                                            padding: '5px 10px', 
                                            borderRadius: '20px', 
                                            fontSize: '0.85em',
                                            backgroundColor: user.is_approved ? 'var(--accent-green)' : '#f1c40f',
                                            color: user.is_approved ? '#fff' : '#000'
                                        }}>
                                            {user.is_approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td style={{padding: '15px', textAlign: 'right'}}>
                                        {!user.is_approved && (
                                            <button className="btn btn-primary" onClick={() => approveUser(user.id)} style={{marginRight: '10px', padding: '5px 15px', fontSize: '0.9em'}}>
                                                Approve
                                            </button>
                                        )}
                                        <button className="btn btn-danger" onClick={() => initiateDelete(user)} disabled={isDeleting && deleteLoading?.id === user.id} style={{padding: '5px 15px', fontSize: '0.9em', backgroundColor: '#e74c3c'}}>
                                            {isDeleting && deleteLoading?.id === user.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            {/* Delete Confirmation Modal */}
            {deleteLoading && typeof deleteLoading === 'object' && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '400px', backgroundColor: '#222', border: '1px solid #444' }}>
                        <h3 style={{color: 'white'}}>Confirm Deletion</h3>
                        <p style={{color: '#ccc', margin: '15px 0'}}>
                            Are you sure you want to delete user <strong>{deleteLoading.username}</strong>? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => setDeleteLoading(null)}
                                style={{backgroundColor: '#666', color: 'white'}}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-danger" 
                                onClick={() => confirmDelete(deleteLoading.id)}
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default AdminDashboard;
