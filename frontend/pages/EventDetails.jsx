import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function EventDetails() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/events/${id}`);
        setEvent(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
      <p className="text-xl text-gray-600 mb-4">{event.tagline}</p>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-bold mb-2">About</h2>
        <p>{event.about}</p>
        <h2 className="text-2xl font-bold mt-4 mb-2">Details</h2>
        <p>Type: {event.type}</p>
        <p>Max Participants: {event.max_participants}</p>
        <p>Team Size: {event.min_team_size} - {event.max_team_size}</p>
      </div>
    </div>
  );
}

export default EventDetails;

