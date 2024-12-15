import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user`, { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, { email, password }, { withCredentials: true });
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email, username, password, role) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/register`, { email, username, password, role }, { withCredentials: true });
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/logout`, {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

