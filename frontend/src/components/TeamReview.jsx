import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const TeamReview = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { eventId } = useParams();

  useEffect(() => {
    fetchTeams();
  }, [eventId]);

  const fetchTeams = async () => {
    try {
      const response = await api.get(`/api/events/${eventId}/teams/review`);
      setTeams(response.data);
    } catch (err) {
      setError('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (teamId, status) => {
    try {
      await api.put(`/api/teams/${teamId}/status`, { status });
      fetchTeams();
    } catch (err) {
      setError('Failed to update team status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-4">Team Review</h2>
      <div className="space-y-4">
        {teams.map(team => (
          <div key={team.id} className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-medium">{team.name}</h3>
            <p className="text-sm text-gray-500">Members: {team.members.length}</p>
            <ul className="mt-2">
              {team.members.map(member => (
                <li key={member.id} className="text-sm">{member.username}</li>
              ))}
            </ul>
            <div className="mt-4 space-x-2">
              <button
                onClick={() => handleStatusUpdate(team.id, 'approved')}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatusUpdate(team.id, 'rejected')}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamReview;
