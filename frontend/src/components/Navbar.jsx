import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          EFA Match Center
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-links">Home</Link>
          </li>
          
          {user && user.username ? (
            <>
               {user.role === 'manager' && (
                  <li className="nav-item">
                    <Link to="/manager" className="nav-links">Manager Dashboard</Link>
                  </li>
               )}
               {user.role === 'admin' && (
                  <li className="nav-item">
                    <Link to="/admin" className="nav-links">Admin</Link>
                  </li>
               )}
               {user.role === 'fan' && (
                  <li className="nav-item">
                     <Link to="/my-tickets" className="nav-links">My Tickets</Link>
                  </li>
               )}
              <li className="nav-item">
                <Link to="/profile" className="nav-links">Profile</Link>
              </li>
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-links-btn">Logout ({user.username})</button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-links">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/signup" className="nav-links">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
