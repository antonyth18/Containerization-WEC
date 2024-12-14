import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to <span className="text-indigo-600">Orbis</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Your platform for creating and managing events, projects, and profiles.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/create-event" className="group hover:shadow-lg transition-shadow duration-300">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-indigo-600 group-hover:text-indigo-700">Create Event</h3>
                <p className="mt-2 text-gray-500">Host hackathons and other events with ease.</p>
              </div>
            </div>
          </Link>

          <Link to="/create-project" className="group hover:shadow-lg transition-shadow duration-300">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-green-600 group-hover:text-green-700">Create Project</h3>
                <p className="mt-2 text-gray-500">Showcase your projects and achievements.</p>
              </div>
            </div>
          </Link>

          <Link to="/create-profile" className="group hover:shadow-lg transition-shadow duration-300">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-purple-600 group-hover:text-purple-700">Create Profile</h3>
                <p className="mt-2 text-gray-500">Build your professional presence.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

