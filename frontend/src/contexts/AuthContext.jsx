import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/api';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/**
 * Authentication context provider component
 * Manages global authentication state and methods
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  /**
   * Check current authentication status
   */
  const checkAuthStatus = async () => {
    try {
      const { data } = await authAPI.getCurrentUser();
      console.log('User data:', data);
      setUser(data);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only check auth status for protected routes
    const publicPaths = ['/', '/login', '/register'];
    if (!publicPaths.includes(location.pathname)) {
      checkAuthStatus();
    } else {
      // For public routes, just set loading to false
      setLoading(false);
    }
  }, [location.pathname]);

  /**
   * Login user with email and password
   * @param {string} email User's email
   * @param {string} password User's password
   */
  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login(email, password);
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  /**
   * Register new user
   * @param {string} email User's email
   * @param {string} username User's username
   * @param {string} password User's password
   * @param {string} role User's role
   */
  const register = async (email, username, password, role) => {
    try {
      const { data } = await authAPI.register({ email, username, password, role });
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

