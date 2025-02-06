import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api/api';
import Button from '../components/Button';

const Profile = () => {
  const { user: auth0User, isLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    const fetchProfile = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setProfile(userData);
        setFormData({
          profile: userData.profile || {},
          education: userData.education || [],
          experience: userData.experience || [],
          skills: userData.skills || [],
          socialProfiles: userData.socialProfiles || [],
          projects: userData.projects || []
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (auth0User) {
      fetchProfile();
    }
  }, [auth0User]);

  if (isLoading || loading) {
    return <div className="container-width py-20">Loading...</div>;
  }

  if (error) {
    return <div className="container-width py-20 text-red-500">{error}</div>;
  }

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
      const response = await authAPI.updateUser(formData);
      setProfile(response);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
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

  const renderField = (field) => (field ? field : '-');

  const renderName = (firstName, lastName) => {
    if(firstName && lastName) {
      return firstName + ' ' + lastName;
    } else if(firstName) {
      return firstName;
    } else {
      return '-';
    }
  }

  // Check if profile is complete
  const isProfileComplete = profile?.profile?.firstName && 
    profile?.profile?.lastName && 
    profile?.profile?.bio && 
    profile?.profile?.phone;

  return (
    <div className="container-width py-20">
      <div className="max-w-4xl mx-auto">
        {!isEditing ? (
          <div>
            {!isProfileComplete && (
              <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800 mb-2">
                  Your profile is incomplete. Please fill in all required fields.
                </p>
              </div>
            )}
            
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Profile</h1>
              <Button onClick={() => setIsEditing(true)}>
                {isProfileComplete ? 'Edit Profile' : 'Complete Profile'}
              </Button>
            </div>
            
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="mt-1">{profile?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Username</label>
                  <p className="mt-1">{profile?.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Role</label>
                  <p className="mt-1">{profile?.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Status</label>
                  <p className="mt-1">{profile?.status}</p>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            {profile?.profile && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">First Name</label>
                    <p className="mt-1">{profile.profile.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Last Name</label>
                    <p className="mt-1">{profile.profile.lastName}</p>
                  </div>
                  {profile.profile.bio && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-600">Bio</label>
                      <p className="mt-1">{profile.profile.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Education */}
            {profile?.education?.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Education</h2>
                {profile.education.map((edu, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <h3 className="font-medium">{edu.institutionName}</h3>
                    <p className="text-sm text-gray-600">
                      {edu.degree} in {edu.fieldOfStudy}
                    </p>
                    <p className="text-sm text-gray-500">
                      Graduation Year: {edu.graduationYear}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {profile?.skills?.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {skill.skillName} - {skill.expertiseLevel}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-xl font-semibold mt-6 mb-3">Experience</h3>
            {profile.experience?.map((exp, index) => (
              <div key={index} className="mb-2">
                <p>{renderField(exp.company)} - {renderField(exp.position)}</p>
                <p>{renderField(new Date(exp.startDate).toLocaleDateString())} - {exp.endDate ? renderField(new Date(exp.endDate).toLocaleDateString()) : 'Present'}</p>
              </div>
            ))}

            <h3 className="text-xl font-semibold mt-6 mb-3">Social Profiles</h3>
            {profile.socialProfiles?.map((social, index) => (
              <p key={index}>{renderField(social.platform)}: <a className="text-blue-500 italic" href={renderField(social.url)} target="_blank" rel="noopener noreferrer">{renderField(social.url)}</a></p>
            ))}

            <h3 className="text-xl font-semibold mt-6 mb-3">Projects</h3>
            {profile.projects?.map((project, index) => (
              <div key={index} className="mb-2">
                <p><strong>{renderField(project.name)}</strong></p>
                <p>{renderField(project.description)}</p>
                <p><a href={renderField(project.projectUrl)} target="_blank" rel="noopener noreferrer">{renderField(project.projectUrl)}</a></p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">
                {isProfileComplete ? 'Edit Profile' : 'Complete Your Profile'}
              </h1>
              <Button variant="text" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-4xl bg-white shadow-xl border-t-black border-solid border-4 rounded-2xl p-12 mt-20 mb-20">
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
                  placeholder="Last Name"
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
                    <select
                      name="degree"
                      value={edu.degree || ''}
                      onChange={(e) => handleChange(e, 'education', index)}
                      className="w-full px-3 py-2 border rounded mb-2"
                    >
                      <option value="">Select Expertise Level</option>
                      <option value="HIGH_SCHOOL">High School</option>
                      <option value="ASSOCIATE">Associate</option>
                      <option value="BACHELOR">Bachelor</option>
                      <option value="MASTER">Master</option>
                      <option value="PHD">PHD</option>
                    </select>
                    <input
                      type="text"
                      name="fieldOfStudy"
                      value={edu.fieldOfStudy || ''}
                      onChange={(e) => handleChange(e, 'education', index)}
                      placeholder="Field of Study"
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

              <Button type="submit">
                Save Changes
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;


