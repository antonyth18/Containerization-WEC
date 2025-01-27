import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EventForm from './EventForm';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

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
      coverImage: {
        filePath: '',
        bucket: '',
        publicUrl: '',
      },
      faviconImage: {
        filePath: '',
        bucket: '',
        publicUrl: '',
      },
      logoImage: {
        filePath: '',
        bucket: '',
        publicUrl: '',
      }
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
      console.log('Sending payload:', JSON.stringify(payload, null, 2));
      const response = await api.post(`${import.meta.env.VITE_API_URL}/api/events`, payload, { withCredentials: true });
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

