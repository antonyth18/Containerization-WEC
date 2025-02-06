import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import sessionConfig from './src/config/session.js';
import errorHandler from './src/middleware/error.js';
import prisma from './src/config/database.js';
import { checkJwt } from './src/middleware/auth.js';

// Import routes
import authRoutes from './src/routes/auth.js';
import eventRoutes from './src/routes/events.js';
import teamRoutes from './src/routes/teams.js';
import projectRoutes from './src/routes/projects.js';
import profileRoutes from './src/routes/profiles.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Only allow frontend origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());
app.use(sessionConfig);

// Mount auth routes at /api/auth
app.use('/api/auth', authRoutes);

// Protected routes with JWT verification
app.use('/api/events', checkJwt, eventRoutes);
app.use('/api/teams', checkJwt, teamRoutes);
app.use('/api/projects', checkJwt, projectRoutes);
app.use('/api/profiles', checkJwt, profileRoutes);

// Error handling
app.use(errorHandler);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Starting graceful shutdown...');
  
  // Close server
  server.close(() => {
    console.log('Express server closed');
  });

  try {
    // Disconnect Prisma
    await prisma.$disconnect();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

