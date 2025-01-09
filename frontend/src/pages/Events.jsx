import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import { EditBtn } from '../svg/EditBtn';

const Events = () => {
  const [events, setEvents] = useState([]);
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [applicationResponses, setApplicationResponses] = useState({});
  const navigate = useNavigate();
  const canCreateEvent = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';
  const [searchWord, setSearchWord] = useState('');
  const [selected, setSelected] = useState("All");
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, [searchWord, selected]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/events`, { withCredentials: true });
      const eventList = response.data;
      const draftedEvents = eventList.filter(event => event.status === 'DRAFT');
      setDrafts(draftedEvents);
      console.log(drafts);
      
      if(searchWord !== '') {
        const searchedEventList = eventList.filter(event => event.name.toLowerCase().includes(searchWord.toLowerCase()));
        setEvents(searchedEventList);
      } else {
        if(selected === 'Hackathons') {
          const hackathons = eventList.filter(event => event.type === 'HACKATHON');
          setEvents(hackathons);
        } else if(selected === 'General Events') {
          const generalEvents = eventList.filter(event => event.type === 'GENERAL_EVENT');
          setEvents(generalEvents);
        } else if(selected === 'Created Events') {
          const createdEvents = eventList.filter(event => event.createdById === user.id);
          setEvents(createdEvents);
        } else if(selected === 'Drafts') {
          setEvents(drafts);
        } else {
          setEvents(eventList);
        }
      }
      console.log(user);
      console.log(events);
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

  function SegmentedControl() {
    return (
      <div className="flex items-center justify-center mb-10 gap-2">

        <button
          onClick={() => setSelected("All")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            selected === "All"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-800 hover:bg-blue-100"
          }`}
        >
          All
        </button>
  
        <button
          onClick={() => setSelected("Hackathons")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            selected === "Hackathons"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-800 hover:bg-blue-100"
          }`}
        >
          Hackathons
        </button>
  
        <button
          onClick={() => setSelected("General Events")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            selected === "General Events"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-800 hover:bg-blue-100"
          }`}
        >
          General Events
        </button>

        {canCreateEvent && (
          <button
            onClick={() => setSelected("Created Events")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              selected === "Created Events"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-100"
            }`}
          >
            Created Events
          </button>
        )}
        {!!drafts.length && (
          <button
            onClick={() => setSelected("Drafts")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              selected === "Drafts"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-100"
            }`}
          >
            Drafts
          </button>
        )}
      </div>
    );
  }


  return (
    <>
      <div className="flex flex-col mt-24 mb-16 mx-20">
      <h2 className="text-4xl font-semibold mb-8 text-center">Events</h2>
      <input 
        type="text" 
        name="search" 
        onChange={(e) => setSearchWord(e.target.value)}
        className="mx-auto px-4 rounded-3xl border mb-6 w-[30%] outline-none focus:ring-1 focus:ring-black focus:border-black placeholder-gray-400" 
        placeholder="🔍 Search for an event..."
      />
      <SegmentedControl />
      <div className="flex flex-wrap gap-y-12 justify-evenly">
        {events.map(event => (
          <div key={event.id} className="border flex flex-col p-6 w-[40%] shadow-xl border-t-black border-solid border-4 rounded-2xl" >
            <div className='flex justify-between'>
              <h3 className="text-2xl font-bold mb-2">{event.name}</h3>
              {user && user.id === event.createdById && (
                  <EditBtn className="w-6 h-6 cursor-pointer hover:bg-gray-200 rounded-sm" onClick={() => handleEventEditClick(event.id)}/>
              )}  
            </div>
           
            <p className=' max-w-fit bg-gray-300 px-2 py-1 rounded-md text-center text-white text-sm mb-6'>{event.type}</p>
            <p className=' text-sm font-medium'>Tagline</p>
            <p className=' text-gray-500 italic mb-6'>{event.tagline}</p>
            
            <div className='flex items-center justify-between'>
              <p className='rounded-lg text-center px-4 py-2 border-solid border-2 text-sm'>{event.mode}</p>
              <p className='rounded-lg text-center px-4 py-2 border-solid border-2 text-sm'>Starts: {new Date(event.eventTimeline.eventStart).toLocaleDateString()}</p>
              <Button
                onClick={() => handleEventViewClick(event.id)}
                className="mt-2"
              >
                Apply now
              </Button>
            </div>
            
            

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
    </>
    
  );
};

export default Events;
