import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'hackathon',
    tagline: '',
    about: '',
    max_participants: '',
    min_team_size: '',
    max_team_size: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/events', formData);
      console.log('Event created:', response.data);
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      setError(error.response?.data?.error || 'Failed to create event. Please try again.');
    }
  };

  if (user.role !== 'organizer') {
    return <div>You do not have permission to create events.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">Create Event</h1>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Event Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Event Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="hackathon">Hackathon</option>
              <option value="workshop">Workshop</option>
              <option value="conference">Conference</option>
            </select>
          </div>
          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">
              Tagline
            </label>
            <input
              type="text"
              name="tagline"
              id="tagline"
              value={formData.tagline}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="about" className="block text-sm font-medium text-gray-700">
              About
            </label>
            <textarea
              id="about"
              name="about"
              rows={3}
              value={formData.about}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700">
              Max Participants
            </label>
            <input
              type="number"
              name="max_participants"
              id="max_participants"
              value={formData.max_participants}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="min_team_size" className="block text-sm font-medium text-gray-700">
              Min Team Size
            </label>
            <input
              type="number"
              name="min_team_size"
              id="min_team_size"
              value={formData.min_team_size}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="max_team_size" className="block text-sm font-medium text-gray-700">
              Max Team Size
            </label>
            <input
              type="number"
              name="max_team_size"
              id="max_team_size"
              value={formData.max_team_size}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;

