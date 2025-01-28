import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { useAuth } from '../contexts/AuthContext';
import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {
  const { user } = useAuth0();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    profile: {},
    education: [],
    experience: [],
    skills: [],
    socialProfiles: [],
    projects: []
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, { withCredentials: true });
      // const response = { data: {}}
      setProfile(user);
      setFormData({
        profile: response.data.profile || {},
        education: response.data.education || [],
        experience: response.data.experience || [],
        skills: response.data.skills || [],
        socialProfiles: response.data.socialProfiles || [],
        projects: response.data.projects || []
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleChange = (e, section, index = null) => {
    const { name, value } = e.target;
    setFormData(prevState => {
      if (index !== null) {
        const newArray = [...prevState[section]];
        newArray[index] = { ...newArray[index], [name]: value };
        return { ...prevState, [section]: newArray };
      } else {
        return { ...prevState, [section]: { ...prevState[section], [name]: value } };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/profile`, formData, { withCredentials: true });
      setProfile(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const addItem = (section) => {
    setFormData(prevState => ({
      ...prevState,
      [section]: [...prevState[section], {}]
    }));
  };

  const removeItem = (section, index) => {
    setFormData(prevState => ({
      ...prevState,
      [section]: prevState[section].filter((_, i) => i !== index)
    }));
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-5">User Profile</h2>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Basic Information</h3>
            <input
              type="text"
              name="firstName"
              value={formData.profile.firstName || ''}
              onChange={(e) => handleChange(e, 'profile')}
              placeholder="First Name"
              className="w-full px-3 py-2 border rounded mb-2"
            />
            <input
              type="text"
              name="lastName"
              value={formData.profile.lastName || ''}
              onChange={(e) => handleChange(e, 'profile')}
              placeholderplaceholder="Last Name"
              className="w-full px-3 py-2 border rounded mb-2"
            />
            <textarea
              name="bio"
              value={formData.profile.bio || ''}
              onChange={(e) => handleChange(e, 'profile')}
              placeholder="Bio"
              className="w-full px-3 py-2 border rounded mb-2"
            />
          </div>
          
          {/* Education */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Education</h3>
            {formData.education.map((edu, index) => (
              <div key={index} className="mb-4">
                <input
                  type="text"
                  name="institutionName"
                  value={edu.institutionName || ''}
                  onChange={(e) => handleChange(e, 'education', index)}
                  placeholder="Institution Name"
                  className="w-full px-3 py-2 border rounded mb-2"
                />
                <input
                  type="text"
                  name="degree"
                  value={edu.degree || ''}
                  onChange={(e) => handleChange(e, 'education', index)}
                  placeholder="Degree"
                  className="w-full px-3 py-2 border rounded mb-2"
                />
                <input
                  type="number"
                  name="graduationYear"
                  value={edu.graduationYear || ''}
                  onChange={(e) => handleChange(e, 'education', index)}
                  placeholder="Graduation Year"
                  className="w-full px-3 py-2 border rounded mb-2"
                />
                <button type="button" onClick={() => removeItem('education', index)} className="text-red-500">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addItem('education')} className="text-blue-500">Add Education</button>
          </div>

          {/* Experience */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Experience</h3>
            {formData.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <input
                  type="text"
                  name="company"
                  value={exp.company || ''}
                  onChange={(e) => handleChange(e, 'experience', index)}
                  placeholder="Company"
                  className="w-full px-3 py-2 border rounded mb-2"
                />
                <input
                  type="text"
                  name="position"
                  value={exp.position || ''}
                  onChange={(e) => handleChange(e, 'experience', index)}
                  placeholder="Position"
                  className="w-full px-3 py-2 border rounded mb-2"
                />
                <input
                  type="date"
                  name="startDate"
                  value={exp.startDate || ''}
                  onChange={(e) => handleChange(e, 'experience', index)}
                  className="w-full px-3 py-2 border rounded mb-2"
                />
                <input
                  type="date"
                  name="endDate"
                  value={exp.endDate || ''}
                  onChange={(e) => handleChange(e, 'experience', index)}
                  className="w-full px-3 py-2 border rounded mb-2"
                />
                <button type="button" onClick={() => removeItem('experience', index)} className="text-red-500">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addItem('experience')} className="text-blue-500">Add Experience</button>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Skills</h3>
            {formData.skills.map((skill, index) => (
              <div key={index} className="mb-4">
                <input
                  type="text"
                  name="skillName"
                  value={skill.skillName || ''}
                  onChange={(e) => handleChange(e, 'skills', index)}
                  placeholder="Skill Name"
                  className="w-full px-3 py-2 border rounded mb-2"
                />
                <select
                  name="expertiseLevel"
                  value={skill.expertiseLevel || ''}
                  onChange={(e) => handleChange(e, 'skills', index)}
                  className="w-full px-3 py-2 border rounded mb-2"
                >
                  <option value="">Select Expertise Level</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="EXPERT">Expert</option>
                </select>
                <button type="button" onClick={() => removeItem('skills', index)} className="text-red-500">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addItem('skills')} className="text-blue-500">Add Skill</button>
          </div>

          {/* Social Profiles */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Social Profiles</h3>
            {formData.socialProfiles.map((profile, index) => (
              <div key={index} className="mb-4">
                <select
                  name="platform"
                  value={profile.platform || ''}
                  onChange={(e) => handleChange(e, 'socialProfiles', index)}
                  className="w-full px-3 py-2 border rounded mb-2"
                >
                  <option value="">Select Platform</option>
                  <option value="GITHUB">GitHub</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="TWITTER">Twitter</option>
                  <option value="PORTFOLIO">Portfolio</option>
                  <option value="OTHER">Other</option>
                </select>
                <input
                  type="url"
                  name="url"
                  value={profile.url || ''}
                  onChange={(e) => handleChange(e, 'socialProfiles', index)}
                  placeholder="Profile URL"
                  className="w-full px-3 py-2 border rounded mb-2"
                />
                <button type="button" onClick={() => removeItem('socialProfiles', index)} className="text-red-500">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addItem('socialProfiles')} className="text-blue-500">Add Social Profile</button>
          </div>

          {/* Projects */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Projects</h3>
            {formData.projects.map((project, index) => (
              <div key={index} className="mb-4">
                <input
                  type="text"
                  name="name"
                  value={project.name || ''}
                  onChange={(e) => handleChange(e, 'projects', index)}
                  placeholder="Project Name"
                  className="w-full px-3 py-2 border rounded mb-2"
                />
                <textarea
                  name="description"
                  value={project.description || ''}
                  onChange={(e) => handleChange(e, 'projects', index)}
                  placeholder="Project Description"
                  className="w-full px-3 py-2 border rounded mb-2"
                />
                <input
                  type="url"
                  name="projectUrl"
                  value={project.projectUrl || ''}
                  onChange={(e) => handleChange(e, 'projects', index)}
                  placeholder="Project URL"
                  className="w-full px-3 py-2 border rounded mb-2"
                />
                <button type="button" onClick={() => removeItem('projects', index)} className="text-red-500">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addItem('projects')} className="text-blue-500">Add Project</button>
          </div>

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Save Changes
          </button>
        </form>
      ) : (
        <div>
          <h3 className="text-xl font-semibold mb-3">Basic Information</h3>
          <p>Name: {profile.profile?.firstName} {profile.profile?.lastName}</p>
          <p>Email: {user.email}</p>
          <p>Bio: {profile.profile?.bio}</p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Education</h3>
          {profile.education?.map((edu, index) => (
            <div key={index} className="mb-2">
              <p>{edu.institutionName} - {edu.degree} ({edu.graduationYear})</p>
            </div>
          ))}

          <h3 className="text-xl font-semibold mt-6 mb-3">Experience</h3>
          {profile.experience?.map((exp, index) => (
            <div key={index} className="mb-2">
              <p>{exp.company} - {exp.position}</p>
              <p>{new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}</p>
            </div>
          ))}

          <h3 className="text-xl font-semibold mt-6 mb-3">Skills</h3>
          {profile.skills?.map((skill, index) => (
            <p key={index}>{skill.skillName} - {skill.expertiseLevel}</p>
          ))}

          <h3 className="text-xl font-semibold mt-6 mb-3">Social Profiles</h3>
          {profile.socialProfiles?.map((profile, index) => (
            <p key={index}>{profile.platform}: <a href={profile.url} target="_blank" rel="noopener noreferrer">{profile.url}</a></p>
          ))}

          <h3 className="text-xl font-semibold mt-6 mb-3">Projects</h3>
          {profile.projects?.map((project, index) => (
            <div key={index} className="mb-2">
              <p><strong>{project.name}</strong></p>
              <p>{project.description}</p>
              <p><a href={project.projectUrl} target="_blank" rel="noopener noreferrer">Project Link</a></p>
            </div>
          ))}

          <button onClick={() => setIsEditing(true)} className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;


