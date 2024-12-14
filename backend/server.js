const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000']
}));
app.use(express.json());

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Routes
const usersRouter = require('./routes/users');
const eventsRouter = require('./routes/events');
const profilesRouter = require('./routes/profiles');
const teamsRouter = require('./routes/teams');
const projectsRouter = require('./routes/projects');

app.use('/api/users', usersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/projects', projectsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

