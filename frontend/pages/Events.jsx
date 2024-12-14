import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/events`);
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.response?.data?.error || err.message);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(event => (
          <Link key={event.id} to={`/events/${event.id}`} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold">{event.name}</h2>
            <p className="text-gray-600">{event.tagline}</p>
            <p className="mt-2">Type: {event.type}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Events;

