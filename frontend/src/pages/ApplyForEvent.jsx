import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from '../contexts/AuthContext';

const ApplyForEvent = () => {
  const { getAccessToken } = useAuth();
  const { id } = useParams(); // Get eventId from the URL
  const [event, setEvent] = useState(null); // Store event details
  const [loading, setLoading] = useState(true); // Loading state
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    city: "",
    country: "",
    gender: "",
    tShirtSize: "",
    degree: "",
    branch: "",
    graduationYear: "",
    company: "",
    position: "",
    profiles: "",
    contactNumber: "",
    email: ""
  });
  const [error, setError] = useState(null); // Error state
  const [activeTab, setActiveTab] = useState(1);
  const [questions, setQuestions] = useState([]); // Store custom questions
  const [responses, setResponses] = useState({}); // Stores user input for each question
  //const [formResponses, setFormResponses] = useState({});




  // Fetch event details when component mounts
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/events/${id}`);
        setEvent(response.data); // Store event data
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to fetch event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  // auto fills the basic
  useEffect(() => {
    if (event?.createdBy?.profile) {
      setUserData({
        firstName: event.createdBy.profile.firstName || "",
        lastName: event.createdBy.profile.lastName || "",
        city: event.createdBy.profile.city || "",
        country: event.createdBy.profile.country || "",
        gender: event.createdBy.profile.gender?.toLowerCase() || "", 

      });
    }
  }, [event]);

  useEffect(() => {
    const fetchCustomQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/events/${id}/custom-questions`);
        setQuestions(response.data); // Store custom questions
      } catch (err) {
        console.error("Error fetching custom questions:", err);
        setError("Failed to fetch custom questions");
      }
    };

    fetchCustomQuestions();
  }, [id]);

  const handleInputChange = (index, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [index]: value, // Store user response with index as key
    }));
  };

  // const handleFormChange = (field, value) => {
  //   setFormResponses((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }));
  // };

  const handleCheckboxChange = (index, option) => {
    setResponses((prevResponses) => {
      const selectedOptions = prevResponses[index] || []; // Get existing selected checkboxes
      if (selectedOptions.includes(option)) {
        return { ...prevResponses, [index]: selectedOptions.filter((o) => o !== option) }; // Remove if unchecked
      } else {
        return { ...prevResponses, [index]: [...selectedOptions, option] }; // Add if checked
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // ADDED: Validate required fields
    if (!userData.firstName || !userData.lastName || !userData.city || !userData.country || !userData.gender) {
      alert("Please fill in all required fields.");
      return;
    }
  
    // CHANGED: Restructure form data
    const formData = {
      userData: {
        ...userData,
        // Ensure optional fields are properly handled
        tShirtSize: userData.tShirtSize || null,
        degree: userData.degree || null,
        branch: userData.branch || null,
        graduationYear: userData.graduationYear || null,
        company: userData.company || null,
        position: userData.position || null,
        profiles: userData.profiles || null,
        email: userData.email || null,
        contactNumber: userData.contactNumber || null
      },
      responses: responses // Custom question responses
    };
  
    try {
      const token = await getAccessToken();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/events/${id}/apply`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      console.log("Response from backend:", response.data);
      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    }
  };

  // Loading state
  if (loading) return <p>Loading event details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-6 mt-16">
      {/* Event Title */}
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Apply for Event: {event?.name}
      </h1>

      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        {[
          "Personal Details",
          "Team Info (YET TO BE ADDED AND CODED)",
          "Event Questions",
        ].map((tab, index) => (
          <button
            key={index}
            className={`flex-1 py-2 text-center text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === index + 1
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-indigo-600"
            }`}
            onClick={() => setActiveTab(index + 1)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {activeTab === 1 && (
          <>
            {/* Personal Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                placeholder="Enter your first name"
                value={userData.firstName || ""}
                onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                placeholder="Enter your last name"
                value={userData.lastName || ""}
                onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                value={userData.gender} // Auto-fill value
                onChange={(e) => setUserData({ ...userData, gender: e.target.value })} // Allow updates
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                placeholder="Enter city of residence"
                value={userData.city || ""}
                onChange={(e) => setUserData({ ...userData, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                placeholder="Enter country of residence"
                value={userData.country || ""}
                onChange={(e) => setUserData({ ...userData, country: e.target.value })}
              />
            </div>

            {/* Form Fields for Required Details */}
            {event.applicationForm.tShirtSizeRequired && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">T-Shirt Size *</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  value={userData.tShirtSize || ""}
                  onChange={(e) => setUserData({ ...userData, tShirtSize: e.target.value })} // Changed from handleFormChange
                >
                  <option value="">Select Size</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
            )}

            {/* Form Fields for Education Details */}
            {event.applicationForm.educationRequired && (
              <h1>EDUCATION DETAILS</h1>
            )}
            {event.applicationForm.educationRequired && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree Type *</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  value={userData.degree || ""} // Added value prop
                  onChange={(e) => setUserData({ ...userData, degree: e.target.value })}
                >
                  <option value="">Select Size</option>
                  <option value="BTech">Btech</option>
                  <option value="MTech">MTech</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>

                <label className="block text-sm font-medium text-gray-700 mb-1">Branch / Field of Study</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  placeholder="Enter branch / field of study"
                  value={userData.branch || ""} 
                  onChange={(e) => setUserData({ ...userData, branch: e.target.value })}
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year *</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  placeholder="Graduation Year"
                  value={userData.graduationYear || ""}
                  onChange={(e) => setUserData({ ...userData, graduationYear: e.target.value })}
                />
              </div>
            )}

            {/* Form Fields for Experience Details */}
            {event.applicationForm.experienceRequired && (
              <h1>EXPERIENCE DETAILS</h1>
            )}
            {event.applicationForm.experienceRequired && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  placeholder="Enter current working company name"
                  value={userData.company || ""}
                  onChange={(e) => setUserData({ ...userData, company: e.target.value })}
                  />
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  placeholder="Enter current working company name"
                  value={userData.position || ""}
                  onChange={(e) => setUserData({ ...userData, position: e.target.value })}
                  />
              </div>
            )}

            {event.applicationForm.profilesRequired && (
              <h1>PROFILES</h1>
            )}
            {event.applicationForm.profilesRequired && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Profiles (LinkedIn, GitHub, etc.) *</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  placeholder="Enter your profiles (LinkedIn, GitHub, etc.)"
                  value={userData.profiles || ""}
                  onChange={(e) => setUserData({ ...userData, profiles: e.target.value })}
                  ></textarea>
              </div>
            )}

            {event.applicationForm.contactRequired && (
              <h1>CONTACT DETAILS</h1>
            )}
            {event.applicationForm.contactRequired && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  placeholder="Enter phone number"
                  value={userData.contactNumber || ""}
                  onChange={(e) => setUserData({ ...userData, contactNumber: e.target.value })}
                  />
                <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
                <input
                  type="email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                  placeholder="Enter email ID"
                  value={userData.email || ""}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  />
              </div>
            )}
          </>
        )}
        {activeTab === 2 && (
          <>
            {/* Team Info */}
            <div>
              <h1>CREATE TEAM</h1>
            </div>
            <div>
              <h1>JOIN TEAM</h1>
            </div>
          </>
        )}
        {activeTab === 3 && (
          <>
            {questions.map((q, index) => (
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {q.questionText} {q.isRequired && <span className="text-red-500">*</span>}
                </label>

                {q.questionType === "TEXT" && (
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                    placeholder="Enter your response"
                    value={responses[index] || ""}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                )}

                {q.questionType === "NUMBER" && (
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                    placeholder="Enter a number"
                    value={responses[index] || ""}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                )}

                {q.questionType === "ENUM" && (
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
                    value={responses[index] || ""}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  >
                    <option value="">Select an option</option>
                    {q.options.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {q.questionType === "CHECKBOX" && (
                  <div>
                    {q.options.map((option, i) => (
                      <label key={i} className="block">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={responses[index]?.includes(option) || false}
                          onChange={() => handleCheckboxChange(index, option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ApplyForEvent;
