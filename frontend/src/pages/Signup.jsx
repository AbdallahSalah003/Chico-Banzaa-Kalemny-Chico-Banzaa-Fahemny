import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../index.css';

const Signup = () => {
    const navigate = useNavigate();
    const { signup, user } = useAuth();

    useEffect(() => {
        if (user && user.username) {
            navigate('/');
        }
    }, [user, navigate]);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        birth_date: '',
        gender: 'Male',
        city: '',
        address: '',
        role: 'fan' // Default role
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await signup(formData);
        if (result.success) {
            navigate('/');
        } else {
            // result.error could be an array or string. Simplified handling:
            setError(JSON.stringify(result.error));
        }
    };

    return (
        <div className="container">
            <div className="card auth-card">
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Sign Up</h2>
                {error && <div className="alert alert-danger" style={{marginBottom: '10px'}}>{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input name="username" type="text" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input name="email" type="email" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input name="password" type="password" onChange={handleChange} required />
                    </div>
                    <div className="form-row">
                        <div className="form-group form-col">
                            <label className="form-label">First Name</label>
                            <input name="first_name" type="text" onChange={handleChange} required />
                        </div>
                        <div className="form-group form-col">
                            <label className="form-label">Last Name</label>
                            <input name="last_name" type="text" onChange={handleChange} required />
                         </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Birth Date</label>
                        <input name="birth_date" type="date" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select name="gender" onChange={handleChange}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                     <div className="form-group">
                        <label className="form-label">City</label>
                        <input name="city" type="text" onChange={handleChange} required />
                    </div>
                     <div className="form-group">
                        <label className="form-label">Address (Optional)</label>
                        <input name="address" type="text" onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <select name="role" onChange={handleChange}>
                            <option value="fan">Fan</option>
                            <option value="manager">Manager</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full-width">
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Signup;
