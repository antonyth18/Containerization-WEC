import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';
import axios from 'axios';
import EventForm from './EventForm';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [localFormData, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/events/${id}`, { withCredentials: true });
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!localFormData) return <div>Event not found</div>;

  if (user?.role === 'PARTICIPANT' || user?.id !== localFormData.createdById) {
    return <div className="text-center mt-8">You don't have permission to edit events.</div>;
  }

  const apiCall = async (payload) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/events/${id}`, payload, { withCredentials: true });
      console.log('Event updated:', response.data);
      navigate('/events');
    } catch (error) {
      console.error('Error updating event:', error);
      setError(error.response?.data?.error || 'An error occurred while updating the event. Please try again.');
    }
  }

  localFormData.eventTimeline.eventStart = localFormData.eventTimeline.eventStart ? (localFormData.eventTimeline.eventStart).split('.')[0] : '';
  localFormData.eventTimeline.eventEnd = localFormData.eventTimeline.eventEnd ? (localFormData.eventTimeline.eventEnd).split('.')[0] : '';
  localFormData.eventTimeline.applicationsStart = localFormData.eventTimeline.applicationsStart ? (localFormData.eventTimeline.applicationsStart).split('.')[0] : '';
  localFormData.eventTimeline.applicationsEnd = localFormData.eventTimeline.applicationsEnd ? (localFormData.eventTimeline.applicationsEnd).split('.')[0] : '';

  console.log('localform',localFormData);

  if (!localFormData.eventLinks) {
    localFormData.eventLinks = [
      {
        websiteUrl: '',
        micrositeUrl: '',
        contactEmail: '',
        codeOfConductUrl: '',
        socialLinks: null,
      },
    ];
  }

  return (
    <EventForm
    mode = {2} //to specify event edit mode
    localFormData = {localFormData}
    apiCall = {apiCall}
    />
  );
    
};

export default EditEvent;
