import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Assuming you have a way to get the current user's ID
        const userId = 1; // Replace this with actual user ID
        const response = await axios.get(`${API_URL}/api/profiles/${userId}`);
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">My Profile</h1>
      <div className="bg-white p-4 rounded shadow">
        <img src={profile.avatar_url} alt="Profile" className="w-32 h-32 rounded-full mb-4" />
        <h2 className="text-2xl font-bold">{profile.first_name} {profile.last_name}</h2>
        <p className="text-gray-600 mb-2">{profile.bio}</p>
        <p>Gender: {profile.gender}</p>
        <p>Country: {profile.country}</p>
        <p>City: {profile.city}</p>
      </div>
    </div>
  );
}

export default Profile;

