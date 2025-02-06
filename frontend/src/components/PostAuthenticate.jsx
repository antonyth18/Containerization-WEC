import { useAuth0 } from "@auth0/auth0-react";
import { authAPI } from "../api/api.js";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from '../contexts/AuthContext';

const PostAuthenticate = () => {
  const { user: auth0User, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { checkAuthStatus } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthentication = async () => {
      try {
        if (!isAuthenticated || !auth0User) {
          setLoading(false);
          return;
        }

        console.log('Auth0 user data:', auth0User);

        // Get the token and set it in the API
        const token = await getAccessTokenSilently({
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: "openid profile email"
        });
        
        // Set the token for all subsequent API calls
        authAPI.setAuthToken(token);

        // Check auth status to create/get user in our database
        await checkAuthStatus();

        // Redirect to about page
        navigate('/about');
      } catch (error) {
        console.error('Authentication error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    handleAuthentication();
  }, [isAuthenticated, auth0User, getAccessTokenSilently, navigate, checkAuthStatus]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!auth0User) return <Navigate to="/" replace />;

  return <div>Authenticating...</div>;
};

export default PostAuthenticate;