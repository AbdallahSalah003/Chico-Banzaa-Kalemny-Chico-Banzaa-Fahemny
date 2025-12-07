import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
    const { user, loading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        birth_date: '',
        gender: '',
        city: '',
        address: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                birth_date: user.birth_date || '',
                gender: user.gender || '',
                city: user.city || '',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        try {
            const response = await apiClient.put(`/users/${user.id}`, { user: formData });
            // Ideally update auth context with new user data
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            console.error("Error updating profile", error);
            setMessage({ text: 'Failed to update profile.', type: 'error' });
        }
    };

    if (authLoading || !user) return <div>Loading...</div>;

    return (
        <div className="container">
            <div className="card auth-card" style={{ maxWidth: '600px', margin: '20px auto' }}>
                <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Edit Profile</h2>
                 {message.text && (
                    <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`} 
                         style={{padding: '10px', marginBottom: '10px', backgroundColor: message.type==='error'?'#f8d7da':'#d4edda', color: message.type==='error'?'#721c24':'#155724'}}>
                        {message.text}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group form-col">
                            <label className="form-label">First Name</label>
                            <input name="first_name" value={formData.first_name} onChange={handleChange} />
                        </div>
                        <div className="form-group form-col">
                            <label className="form-label">Last Name</label>
                            <input name="last_name" value={formData.last_name} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Birth Date</label>
                        <input name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Gender</label>
                         <select name="gender" value={formData.gender} onChange={handleChange}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">City</label>
                        <input name="city" value={formData.city} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <input name="address" value={formData.address} onChange={handleChange} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full-width">Update Profile</button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
