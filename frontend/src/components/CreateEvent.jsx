import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EventForm from './EventForm';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  // This block of code stores the initalization of all the state variables (fields and entries) in the form
  const localFormData = {
    name: '',
    type: 'HACKATHON',
    tagline: '',
    about: '',
    maxParticipants: '',
    minTeamSize: '1',
    maxTeamSize: '4',
    status: 'DRAFT',
    eventTimeline: {
      eventStart: '',
      eventEnd: '',
      applicationsStart: '',
      applicationsEnd: '',
      timezone: 'IST',
      rsvpDeadlineDays: 7
    },
    eventLinks: {
      websiteUrl: '',
      micrositeUrl: '',
      contactEmail: '',
      codeOfConductUrl: '',
      socialLinks: {}
    },
    eventBranding: {
      brandColor: '#000000',
      logoUrl: '',
      logoFile: null,
      faviconUrl: '',
      faviconFile: null,
      coverImageUrl: '',
      coverImageFile: null
    },
    tracks: [
      {
        name: '',
        description: '',
        prizes: [
          {
            title: '',
            description: '',
            value: 0
          }
        ]
      }
    ],
    sponsors: [
      {
        name: '',
        logoUrl: '',
        websiteUrl: '',
        tier: 'GOLD'
      }
    ],
    eventPeople: [
      {
        name: '',
        role: 'JUDGE',
        bio: '',
        imageUrl: '',
        linkedinUrl: ''
      }
    ],
    applicationForm: {
      educationRequired: false,
      experienceRequired: false,
      profilesRequired: false,
      contactRequired: false,
      tShirtSizeRequired: false
    },
    customQuestions: [
      {
        questionText: '',
        questionType: '',
        options: null,
        isRequired: false 
      }
    ]
  };

  const apiCall = async (payload) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/events`, payload, { withCredentials: true });
      console.log('Event created:', response.data);
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      setError(error.response?.data?.error || 'An error occurred while creating the event. Please try again.');
    }
  }

  
  // This block of code returns the form to be displayed on the page (every element is a part of the form)
  return (
    <EventForm
    mode = {1} //to specify event create mode
    localFormData = {localFormData}
    apiCall = {apiCall}
    />
  );
};

export default CreateEvent;

