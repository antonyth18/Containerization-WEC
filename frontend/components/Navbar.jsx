import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-white">Orbis</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link to="/events" className="text-white hover:text-gray-200 px-3 py-2 rounded-md">
                Events
              </Link>
              <Link to="/projects" className="text-white hover:text-gray-200 px-3 py-2 rounded-md">
                Projects
              </Link>
              <Link to="/profile" className="text-white hover:text-gray-200 px-3 py-2 rounded-md">
                Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/create-event" className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-gray-100">
              Create Event
            </Link>
            <Link to="/create-project" className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-gray-100">
              Create Project
            </Link>
            <Link to="/create-profile" className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-gray-100">
              Create Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

