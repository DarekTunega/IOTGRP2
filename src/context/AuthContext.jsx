import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../utils/apiClient';

// Removed mock users

// Create the auth context
const AuthContext = createContext();

// API base URL (using relative URL for API proxy)
const API_URL = '';

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // Renamed isLoading to avoid conflict if app has other loading states

  // Check for existing login state in localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsLoggedIn(true);
        console.log('Restored session from localStorage');
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear potentially corrupted storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
    setAuthLoading(false);
  }, []);

  // Login function - now calls the backend API
  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        // Handle different error statuses if needed
        const errorData = await response.json().catch(() => ({})); // Try to parse error message
        console.error('Login failed:', response.status, errorData.message);
        return false; // Indicate failure
      }

      const data = await response.json();

      if (data.token && data.user) {
        // Store token and user details
        setToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('Login successful, token and user stored');
        return true; // Indicate success
      } else {
        console.error('Login response missing token or user data');
        return false;
      }

    } catch (error) {
      console.error('Error during login request:', error);
      return false; // Indicate failure
    }
  };

  // Register function - calls the backend API
  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Registration failed:', response.status, errorData.message);
        return { success: false, message: errorData.message || 'Registration failed' };
      }

      const data = await response.json();
      return { success: true, message: 'Registration successful' };

    } catch (error) {
      console.error('Error during registration request:', error);
      return { success: false, message: 'Error connecting to server' };
    }
  };

  // Logout function - clears token and user from state and localStorage
  const logout = async () => {
    try {
      // Call logout endpoint if needed
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(err => console.warn('Logout request failed:', err));
      }
    } finally {
      // Always clear local state even if server request fails
      setIsLoggedIn(false);
      setUser(null);
      setToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      console.log('Logged out, token and user cleared');
    }
  };

  const value = {
    isLoggedIn,
    user,
    token, // Provide token for API calls
    login,
    logout,
    register,
    authLoading // Provide loading state
  };

  // Display loading indicator while checking auth state
  if (authLoading) {
    return <div>Authenticating...</div>; // Or a spinner component
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
