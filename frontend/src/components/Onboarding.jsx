import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { authAPI } from '../api/api';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: user?.given_name || '',
    lastName: user?.family_name || '',
    bio: '',
    gender: '',
    phone: '',
    country: '',
    city: '',
    
    // Education
    education: [{
      institutionName: '',
      degree: 'BACHELORS',
      fieldOfStudy: '',
      graduationYear: new Date().getFullYear()
    }],
    
    // Experience
    experience: [{
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }],
    
    // Skills
    skills: [{
      skillName: '',
      expertiseLevel: 'BEGINNER'
    }],
    
    // Social Profiles
    socialProfiles: [{
      platform: 'LINKEDIN',
      url: ''
    }]
  });

  const handleInputChange = (section, index, field, value) => {
    setFormData(prev => {
      if (Array.isArray(prev[section])) {
        const newArray = [...prev[section]];
        newArray[index] = { ...newArray[index], [field]: value };
        return { ...prev, [section]: newArray };
      }
      return { ...prev, [field]: value };
    });
  };

  const addItem = (section) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], getEmptyItem(section)]
    }));
  };

  const removeItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const getEmptyItem = (section) => {
    switch (section) {
      case 'education':
        return {
          institutionName: '',
          degree: 'BACHELORS',
          fieldOfStudy: '',
          graduationYear: new Date().getFullYear()
        };
      case 'experience':
        return {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ''
        };
      case 'skills':
        return {
          skillName: '',
          expertiseLevel: 'BEGINNER'
        };
      case 'socialProfiles':
        return {
          platform: 'LINKEDIN',
          url: ''
        };
      default:
        return {};
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.completeOnboarding(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      {[1, 2, 3, 4].map((num) => (
        <div key={num} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === num 
              ? 'bg-blue-600 text-white'
              : step > num 
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'
          }`}>
            {step > num ? '✓' : num}
          </div>
          {num < 4 && (
            <div className={`w-16 h-1 ${
              step > num ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={e => handleInputChange('basic', 0, 'firstName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={e => handleInputChange('basic', 0, 'lastName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            value={formData.bio}
            onChange={e => handleInputChange('basic', 0, 'bio', e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            value={formData.gender}
            onChange={e => handleInputChange('basic', 0, 'gender', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => handleInputChange('basic', 0, 'phone', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Country</label>
          <input
            type="text"
            value={formData.country}
            onChange={e => handleInputChange('basic', 0, 'country', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={e => handleInputChange('basic', 0, 'city', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Education</h3>
        <button
          type="button"
          onClick={() => addItem('education')}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
        >
          + Add Education
        </button>
      </div>
      
      {formData.education.map((edu, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-4">
          <div className="flex justify-between">
            <h4 className="font-medium">Education #{index + 1}</h4>
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeItem('education', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Institution</label>
              <input
                type="text"
                value={edu.institutionName}
                onChange={e => handleInputChange('education', index, 'institutionName', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Degree</label>
              <select
                value={edu.degree}
                onChange={e => handleInputChange('education', index, 'degree', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="BACHELORS">Bachelor's</option>
                <option value="MASTERS">Master's</option>
                <option value="PHD">PhD</option>
                <option value="DIPLOMA">Diploma</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Field of Study</label>
              <input
                type="text"
                value={edu.fieldOfStudy}
                onChange={e => handleInputChange('education', index, 'fieldOfStudy', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
              <input
                type="number"
                value={edu.graduationYear}
                onChange={e => handleInputChange('education', index, 'graduationYear', parseInt(e.target.value))}
                min="1900"
                max="2100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Work Experience</h3>
        <button
          type="button"
          onClick={() => addItem('experience')}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
        >
          + Add Experience
        </button>
      </div>
      
      {formData.experience.map((exp, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-4">
          <div className="flex justify-between">
            <h4 className="font-medium">Experience #{index + 1}</h4>
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeItem('experience', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input
                type="text"
                value={exp.company}
                onChange={e => handleInputChange('experience', index, 'company', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <input
                type="text"
                value={exp.position}
                onChange={e => handleInputChange('experience', index, 'position', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={exp.startDate}
                onChange={e => handleInputChange('experience', index, 'startDate', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={exp.endDate}
                disabled={exp.current}
                onChange={e => handleInputChange('experience', index, 'endDate', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exp.current}
                onChange={e => handleInputChange('experience', index, 'current', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">Currently working here</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={exp.description}
                onChange={e => handleInputChange('experience', index, 'description', e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderNavigation = () => (
    <div className="flex justify-between mt-8">
      <button
        type="button"
        onClick={() => setStep(prev => prev - 1)}
        disabled={step === 1}
        className={`px-4 py-2 rounded-md ${
          step === 1
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gray-600 text-white hover:bg-gray-700'
        }`}
      >
        Previous
      </button>
      <button
        type={step === 4 ? 'submit' : 'button'}
        onClick={() => step < 4 && setStep(prev => prev + 1)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {step === 4 ? 'Complete' : 'Next'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Complete Your Profile
          </h2>
          
          {renderStepIndicator()}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && renderBasicInfo()}
            {step === 2 && renderEducation()}
            {step === 3 && renderExperience()}
            {/* Add other step renderers here */}
            
            {renderNavigation()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding; 