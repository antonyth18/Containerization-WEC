import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateEvent from './components/CreateEvent';
import EditEvent from './components/EditEvent';
import CreateTeam from './components/CreateTeam';
import SubmitProject from './components/SubmitProject';
import Profile from './pages/Profile';
import Applications from './pages/Applications';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
            <Route path="/create-event" element={<ProtectedRoute requiredRole="organizer"><CreateEvent /></ProtectedRoute>} />
            <Route path="/edit-event/:id" element={<ProtectedRoute requiredRole="organizer"><EditEvent /></ProtectedRoute>} />
            <Route path="/create-team" element={<ProtectedRoute><CreateTeam /></ProtectedRoute>} />
            <Route path="/submit-project" element={<ProtectedRoute><SubmitProject /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute requiredRole="organizer"><Applications /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

