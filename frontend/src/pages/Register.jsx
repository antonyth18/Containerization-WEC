import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PARTICIPANT');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, username, password, role);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to register');
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-black transition-colors text-sm";
  const labelClasses = "block mb-2 text-sm text-gray-600 tracking-wide";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-16">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light tracking-tight mb-2">Join Orbis</h2>
          <p className="text-gray-500 text-sm tracking-wide">
            Create an account to start managing events
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className={labelClasses}>Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClasses}
              placeholder="your.email@nitk.edu.in"
            />
          </div>

          <div>
            <label htmlFor="username" className={labelClasses}>Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={inputClasses}
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClasses}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClasses}
              placeholder="Create a strong password"
            />
          </div>

          <div>
            <label htmlFor="role" className={labelClasses}>I want to</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputClasses}
            >
              <option value="PARTICIPANT">Participate in Events</option>
              <option value="ORGANIZER">Organize Events</option>
              <option value="ADMIN">Manage Platform (Admin)</option>
            </select>
          </div>

          <Button 
            type="submit"
            variant="primary"
            className="w-full py-3 mt-4"
          >
            Create Account
          </Button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-black hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;

