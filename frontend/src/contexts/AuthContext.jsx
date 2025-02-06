import { createContext, useContext, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { 
    isAuthenticated, 
    user, 
    isLoading, 
    loginWithRedirect, 
    logout,
    getAccessTokenSilently 
  } = useAuth0();

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated && user) {
        try {
          // Get token and store it
          const token = await getAccessTokenSilently();
          localStorage.setItem('auth0_token', token);

          // Register/update user in backend
          await authAPI.register(user);
        } catch (error) {
          console.error('Error initializing auth:', error);
        }
      }
    };

    initAuth();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login: loginWithRedirect,
    logout: () => {
      localStorage.removeItem('auth0_token');
      logout({ returnTo: window.location.origin });
    },
    getAccessToken: getAccessTokenSilently
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

