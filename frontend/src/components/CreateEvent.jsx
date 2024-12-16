import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'HACKATHON',
    tagline: '',
    about: '',
    maxParticipants: '',
    minTeamSize: '1',
    maxTeamSize: '4',
    eventTimeline: {
      eventStart: '',
      eventEnd: '',
      applicationsStart: '',
      applicationsEnd: '',
      timezone: 'UTC',
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
      faviconUrl: '',
      coverImageUrl: ''
    },
    tracks: [
      {
        name: '',
        description: '',
        prizes: [
          {
            title: '',
            description: '',
            value: '0'
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
    ]
  });

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setFormData(prevState => ({
        ...prevState,
        [section]: {
          ...prevState[section],
          [name]: value
        }
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (e, section, index, subSection = null, subIndex = null) => {
    const { name, value } = e.target;
    setFormData(prevState => {
      const newArray = [...prevState[section]];
      if (subSection) {
        newArray[index] = {
          ...newArray[index],
          [subSection]: newArray[index][subSection].map((item, idx) =>
            idx === subIndex ? { ...item, [name]: value } : item
          )
        };
      } else {
        newArray[index] = { ...newArray[index], [name]: value };
      }
      return { ...prevState, [section]: newArray };
    });
  };

  const addArrayItem = (section) => {
    setFormData(prevState => ({
      ...prevState,
      [section]: [...prevState[section], {}]
    }));
  };

  const removeArrayItem = (section, index) => {
    setFormData(prevState => ({
      ...prevState,
      [section]: prevState[section].filter((_, i) => i !== index)
    }));
  };

  const addTrack = () => {
    setFormData(prevState => ({
      ...prevState,
      tracks: [...prevState.tracks, {
        name: '',
        description: '',
        prizes: [{ title: '', description: '', value: '0' }]
      }]
    }));
  };

  const addPrizeToTrack = (trackIndex) => {
    setFormData(prevState => {
      const newTracks = [...prevState.tracks];
      newTracks[trackIndex].prizes.push({ title: '', description: '', value: '0' });
      return { ...prevState, tracks: newTracks };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/events`, formData, { withCredentials: true });
      console.log('Event created:', response.data);
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      setError(error.response?.data?.error || 'An error occurred while creating the event. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6">Create Event</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Event Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Event Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="HACKATHON">Hackathon</option>
            <option value="GENERAL_EVENT">General Event</option>
          </select>
        </div>

        <div>
          <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">Tagline</label>
          <input
            type="text"
            id="tagline"
            name="tagline"
            value={formData.tagline}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label htmlFor="about" className="block text-sm font-medium text-gray-700">About</label>
          <textarea
            id="about"
            name="about"
            value={formData.about}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          ></textarea>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">Max Participants</label>
            <input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="minTeamSize" className="block text-sm font-medium text-gray-700">Min Team Size</label>
            <input
              type="number"
              id="minTeamSize"
              name="minTeamSize"
              value={formData.minTeamSize}
              onChange={handleChange}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="maxTeamSize" className="block text-sm font-medium text-gray-700">Max Team Size</label>
            <input
              type="number"
              id="maxTeamSize"
              name="maxTeamSize"
              value={formData.maxTeamSize}
              onChange={handleChange}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Event Timeline</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="eventStart" className="block text-sm font-medium text-gray-700">Event Start</label>
              <input
                type="datetime-local"
                id="eventStart"
                name="eventStart"
                value={formData.eventTimeline.eventStart}
                onChange={(e) => handleChange(e, 'eventTimeline')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="eventEnd" className="block text-sm font-medium text-gray-700">Event End</label>
              <input
                type="datetime-local"
                id="eventEnd"
                name="eventEnd"
                value={formData.eventTimeline.eventEnd}
                onChange={(e) => handleChange(e, 'eventTimeline')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="applicationsStart" className="block text-sm font-medium text-gray-700">Applications Start</label>
              <input
                type="datetime-local"
                id="applicationsStart"
                name="applicationsStart"
                value={formData.eventTimeline.applicationsStart}
                onChange={(e) => handleChange(e, 'eventTimeline')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="applicationsEnd" className="block text-sm font-medium text-gray-700">Applications End</label>
              <input
                type="datetime-local"
                id="applicationsEnd"
                name="applicationsEnd"
                value={formData.eventTimeline.applicationsEnd}
                onChange={(e) => handleChange(e, 'eventTimeline')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          </div>
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">Timezone</label>
            <input
              type="text"
              id="timezone"
              name="timezone"
              value={formData.eventTimeline.timezone}
              onChange={(e) => handleChange(e, 'eventTimeline')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="rsvpDeadlineDays" className="block text-sm font-medium text-gray-700">RSVP Deadline (days before event)</label>
            <input
              type="number"
              id="rsvpDeadlineDays"
              name="rsvpDeadlineDays"
              value={formData.eventTimeline.rsvpDeadlineDays}
              onChange={(e) => handleChange(e, 'eventTimeline')}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Event Links</h3>
          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">Website URL</label>
            <input
              type="url"
              id="websiteUrl"
              name="websiteUrl"
              value={formData.eventLinks.websiteUrl}
              onChange={(e) => handleChange(e, 'eventLinks')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="micrositeUrl" className="block text-sm font-medium text-gray-700">Microsite URL</label>
            <input
              type="url"
              id="micrositeUrl"
              name="micrositeUrl"
              value={formData.eventLinks.micrositeUrl}
              onChange={(e) => handleChange(e, 'eventLinks')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Contact Email</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.eventLinks.contactEmail}
              onChange={(e) => handleChange(e, 'eventLinks')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="codeOfConductUrl" className="block text-sm font-medium text-gray-700">Code of Conduct URL</label>
            <input
              type="url"
              id="codeOfConductUrl"
              name="codeOfConductUrl"
              value={formData.eventLinks.codeOfConductUrl}
              onChange={(e) => handleChange(e, 'eventLinks')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Event Branding</h3>
          <div>
            <label htmlFor="brandColor" className="block text-sm font-medium text-gray-700">Brand Color</label>
            <input
              type="color"
              id="brandColor"
              name="brandColor"
              value={formData.eventBranding.brandColor}
              onChange={(e) => handleChange(e, 'eventBranding')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">Logo URL</label>
            <input
              type="url"
              id="logoUrl"
              name="logoUrl"
              value={formData.eventBranding.logoUrl}
              onChange={(e) => handleChange(e, 'eventBranding')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="faviconUrl" className="block text-sm font-medium text-gray-700">Favicon URL</label>
            <input
              type="url"
              id="faviconUrl"
              name="faviconUrl"
              value={formData.eventBranding.faviconUrl}
              onChange={(e) => handleChange(e, 'eventBranding')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700">Cover Image URL</label>
            <input
              type="url"
              id="coverImageUrl"
              name="coverImageUrl"
              value={formData.eventBranding.coverImageUrl}
              onChange={(e) => handleChange(e, 'eventBranding')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Tracks & Prizes</h3>
          {formData.tracks.map((track, trackIndex) => (
            <div key={trackIndex} className="border p-4 rounded">
              <input
                type="text"
                value={track.name}
                onChange={(e) => handleArrayChange(e, 'tracks', trackIndex)}
                name="name"
                placeholder="Track Name"
                className="input-field"
              />
              <textarea
                value={track.description}
                onChange={(e) => handleArrayChange(e, 'tracks', trackIndex)}
                name="description"
                placeholder="Track Description"
                className="input-field mt-2"
              />
              
              <div className="mt-4">
                <h4 className="font-medium">Prizes for this track</h4>
                {track.prizes.map((prize, prizeIndex) => (
                  <div key={prizeIndex} className="mt-2">
                    <input
                      type="text"
                      value={prize.title}
                      onChange={(e) => handleArrayChange(e, 'tracks', trackIndex, 'prizes', prizeIndex)}
                      name="title"
                      placeholder="Prize Title"
                      className="input-field"
                    />
                    <input
                      type="text"
                      value={prize.description}
                      onChange={(e) => handleArrayChange(e, 'tracks', trackIndex, 'prizes', prizeIndex)}
                      name="description"
                      placeholder="Prize Description"
                      className="input-field mt-2"
                    />
                    <input
                      type="number"
                      value={prize.value}
                      onChange={(e) => handleArrayChange(e, 'tracks', trackIndex, 'prizes', prizeIndex)}
                      name="value"
                      placeholder="Prize Value"
                      className="input-field mt-2"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addPrizeToTrack(trackIndex)}
                  className="btn-secondary mt-2"
                >
                  Add Prize to Track
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addTrack}
            className="btn-primary"
          >
            Add Track
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Sponsors</h3>
          {formData.sponsors.map((sponsor, index) => (
            <div key={index} className="space-y-2">
              <input
                type="text"
                value={sponsor.name}
                onChange={(e) => handleArrayChange(e, 'sponsors', index)}
                name="name"
                placeholder="Sponsor Name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <input
                type="url"
                value={sponsor.logoUrl}
                onChange={(e) => handleArrayChange(e, 'sponsors', index)}
                name="logoUrl"
                placeholder="Sponsor Logo URL"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <input
                type="url"
                value={sponsor.websiteUrl}
                onChange={(e) => handleArrayChange(e, 'sponsors', index)}
                name="websiteUrl"
                placeholder="Sponsor Website URL"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <button type="button" onClick={() => removeArrayItem('sponsors', index)} className="text-red-500">
                Remove Sponsor
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('sponsors')} className="text-blue-500">
            Add Sponsor
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Event People</h3>
          {formData.eventPeople.map((person, index) => (
            <div key={index} className="border p-4 rounded">
              <input
                type="text"
                value={person.name}
                onChange={(e) => handleArrayChange(e, 'eventPeople', index)}
                name="name"
                placeholder="Name"
                className="input-field"
              />
              <select
                value={person.role}
                onChange={(e) => handleArrayChange(e, 'eventPeople', index)}
                name="role"
                className="input-field mt-2"
              >
                <option value="JUDGE">Judge</option>
                <option value="SPEAKER">Speaker</option>
              </select>
              <textarea
                value={person.bio}
                onChange={(e) => handleArrayChange(e, 'eventPeople', index)}
                name="bio"
                placeholder="Bio"
                className="input-field mt-2"
              />
              <input
                type="url"
                value={person.imageUrl}
                onChange={(e) => handleArrayChange(e, 'eventPeople', index)}
                name="imageUrl"
                placeholder="Image URL"
                className="input-field mt-2"
              />
              <input
                type="url"
                value={person.linkedinUrl}
                onChange={(e) => handleArrayChange(e, 'eventPeople', index)}
                name="linkedinUrl"
                placeholder="LinkedIn URL"
                className="input-field mt-2"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('eventPeople')}
            className="btn-primary"
          >
            Add Person
          </button>
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
          Create Event
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;

