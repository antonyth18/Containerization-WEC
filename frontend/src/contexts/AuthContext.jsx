import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { authAPI } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const checkAuthStatus = async () => {
    try {
      if (!isAuthenticated) {
        setUser(null);
        setLoading(false);
        return;
      }

      const token = await getAccessTokenSilently({
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "openid profile email"
      });
      
      authAPI.setAuthToken(token);
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [isAuthenticated]);

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
    loading,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

