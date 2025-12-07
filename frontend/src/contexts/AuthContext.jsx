import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem('user'); // Clear invalid data
    } finally {
        setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      // Devise default login is POST /users/sign_in or similar. 
      // Based on routes.rb: devise_for :users, path: '', path_names: { sign_in: 'login' }
      // So it is POST /login
      const response = await apiClient.post('http://localhost:3000/login', {
        user: {
            username: username, 
            password: password
        }
      });
      
      const { user, token } = response.data; // Adjust based on actual Devise JSON response. 
      // Devise-JWT usually returns token in Authorization header.
      
      // If token is in header:
      // If token is in header:
      const authToken = response.headers['authorization'] || response.headers['Authorization'];
      
      const userData = response.data.user || response.data; 

      if(authToken) {
          const token = authToken.startsWith('Bearer ') ? authToken.split(' ')[1] : authToken;
          localStorage.setItem('authToken', token);
      }
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error("Login failed", error);
      return { success: false, error: error.response?.data?.error || "Login failed" };
    }
  };

  const signup = async (userData) => {
      try {
          // POST /signup
          const response = await apiClient.post('http://localhost:3000/signup', {
              user: userData
          });
          // Usually signup also logs you in
           const authToken = response.headers['authorization'] || response.headers['Authorization'];
           if(authToken) {
                const token = authToken.startsWith('Bearer ') ? authToken.split(' ')[1] : authToken;
                localStorage.setItem('authToken', token);
           }
           const user = response.data.user || response.data;
           localStorage.setItem('user', JSON.stringify(user));
           setUser(user);
           return { success: true };
      } catch (error) {
           console.error("Signup failed", error);
           return { success: false, error: error.response?.data?.errors || "Signup failed" };
      }
  }

  const logout = async () => {
    try {
        await apiClient.delete('http://localhost:3000/logout');
    } catch (e) {
        // ignore error
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
