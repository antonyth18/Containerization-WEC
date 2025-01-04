import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Events = () => {
  const [events, setEvents] = useState([]);
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [applicationResponses, setApplicationResponses] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/events`, { withCredentials: true });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/events/${eventId}/join`, 
        { applicationDetails: applicationResponses[eventId] },
        { withCredentials: true }
      );
      console.log('Joined event:', response.data);
      setSelectedEvent(null);
      setApplicationResponses({});
      fetchEvents(); // Refresh the events list
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  const handleApplicationChange = (eventId, questionIndex, value) => {
    setApplicationResponses(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [questionIndex]: value
      }
    }));
  };

  const handleEventViewClick = (id) => {
    navigate(`/events/${id}`);
  }

  const handleEventEditClick = (id) => {
    navigate(`/edit-event/${id}`);
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-5">Events</h2>
      {user && user.role === 'ORGANIZER' && (
        <Link to="/create-event" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4 inline-block">
          Create Event
        </Link>
      )}
      <div className="grid gap-6">
        {events.map(event => (
          <div key={event.id} className="border p-4 rounded" >
            <h3 className="text-xl font-semibold">{event.name}</h3>
            <p>{event.tagline}</p>
            <p>Type: {event.type}</p>
            {event.eventTimeline && (
              <>
                <p>Start Date: {new Date(event.eventTimeline.eventStart).toLocaleDateString()}</p>
                <p>End Date: {new Date(event.eventTimeline.eventEnd).toLocaleDateString()}</p>
              </>
            )}
            <button 
              onClick={() => handleEventViewClick(event.id)} 
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
              View
            </button>
            {user && user.role === 'PARTICIPANT' && (
              <button 
                onClick={() => setSelectedEvent(event)} 
                className="mt-2 ml-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Join Event
              </button>
            )}
            {user && user.id === event.createdById && (
              <button 
              onClick={() => handleEventEditClick(event.id)} 
              className="mt-2 ml-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Edit
            </button>
            )}
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Join {selectedEvent.name}</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleJoinEvent(selectedEvent.id); }}>
              {/* Simple application details since we don't have questions in schema */}
              <div className="mb-4">
                <label className="block mb-2">Why do you want to join this event?</label>
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  onChange={(e) => handleApplicationChange(selectedEvent.id, 'reason', e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setSelectedEvent(null)} className="mr-2 px-4 py-2 bg-gray-300 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
