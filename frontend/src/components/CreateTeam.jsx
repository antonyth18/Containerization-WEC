import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../utils/api';

const CreateTeam = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const event = location.state?.event;
  const [formData, setFormData] = useState({
    name: '',
    event_id: parseInt(eventId) // Convert to integer
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/teams', formData);
      navigate(`/events/${formData.event_id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team');
      console.error('Error creating team:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Create New Team</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Team Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Create Team
        </button>
      </form>
    </div>
  );
};

export default CreateTeam;

