const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Middleware to check if user is authenticated
const authenticateUser = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Middleware to check if user is an organizer
const isOrganizer = (req, res, next) => {
  if (req.session.userRole === 'organizer') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, username, role',
      [email, username, hashedPassword, role]
    );

    const user = result.rows[0];
    req.session.userId = user.id;
    req.session.userRole = user.role;

    res.status(201).json({ user: { id: user.id, email: user.email, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    req.session.userRole = user.role;

    res.json({ user: { id: user.id, email: user.email, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out, please try again' });
    }
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logout successful' });
  });
});

// User routes
app.get('/api/user', authenticateUser, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, username, role FROM users WHERE id = $1', [req.session.userId]);
    const user = result.rows[0];
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/user', authenticateUser, async (req, res) => {
  try {
    const { username, bio, skills } = req.body;
    const result = await pool.query(
      'UPDATE users SET username = $1, bio = $2, skills = $3 WHERE id = $4 RETURNING id, email, username, role, bio, skills',
      [username, bio, skills, req.session.userId]
    );
    const updatedUser = result.rows[0];
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Replace the existing profile routes with these new ones
app.get('/api/profiles/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.role, up.* 
       FROM users u 
       LEFT JOIN user_profiles up ON u.id = up.user_id 
       WHERE u.username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/profiles/:username', authenticateUser, async (req, res) => {
  try {
    const { username } = req.params;
    // Only allow users to edit their own profile
    if (username !== req.user.username) {
      return res.status(403).json({ error: 'Not authorized to edit this profile' });
    }

    const { first_name, last_name, bio, gender, phone, country, city } = req.body;

    // First, check if profile exists
    let result = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      // Create new profile if it doesn't exist
      result = await pool.query(
        `INSERT INTO user_profiles 
         (user_id, first_name, last_name, bio, gender, phone, country, city) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [req.session.userId, first_name, last_name, bio, gender, phone, country, city]
      );
    } else {
      // Update existing profile
      result = await pool.query(
        `UPDATE user_profiles 
         SET first_name = $1, last_name = $2, bio = $3, gender = $4, 
             phone = $5, country = $6, city = $7
         WHERE user_id = $8 
         RETURNING *`,
        [first_name, last_name, bio, gender, phone, country, city, req.session.userId]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Event routes
app.get('/api/events', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM events ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/events', authenticateUser, isOrganizer, async (req, res) => {
  const { name, type, tagline, about, max_participants, min_team_size, max_team_size } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO events (name, type, tagline, about, max_participants, min_team_size, max_team_size, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, type, tagline, about, max_participants, min_team_size, max_team_size, req.session.userId]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/events/:id', authenticateUser, isOrganizer, async (req, res) => {
  const { id } = req.params;
  const { name, type, tagline, about, max_participants, min_team_size, max_team_size } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE events SET name = $1, type = $2, tagline = $3, about = $4, max_participants = $5, min_team_size = $6, max_team_size = $7 WHERE id = $8 AND created_by = $9 RETURNING *',
      [name, type, tagline, about, max_participants, min_team_size, max_team_size, id, req.session.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found or you do not have permission to edit it' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Application routes
app.post('/api/applications', authenticateUser, async (req, res) => {
  const { event_id } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO applications (event_id, user_id, status) VALUES ($1, $2, $3) RETURNING *',
      [event_id, req.session.userId, 'pending']
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/applications', authenticateUser, isOrganizer, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT a.*, u.username FROM applications a JOIN users u ON a.user_id = u.id WHERE a.event_id IN (SELECT id FROM events WHERE created_by = $1)',
      [req.session.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/applications/:id', authenticateUser, isOrganizer, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE applications SET status = $1 WHERE id = $2 AND event_id IN (SELECT id FROM events WHERE created_by = $3) RETURNING *',
      [status, id, req.session.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Application not found or you do not have permission to update it' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Team routes
app.post('/api/teams', authenticateUser, async (req, res) => {
  const { event_id, name } = req.body;
  try {
    // Check if user already has a team for this event
    const existingTeam = await pool.query(
      'SELECT * FROM team_members tm JOIN teams t ON tm.team_id = t.id WHERE tm.user_id = $1 AND t.event_id = $2',
      [req.session.userId, event_id]
    );

    if (existingTeam.rows.length > 0) {
      return res.status(400).json({ error: 'You already have a team for this event' });
    }

    // Create new team with pending status
    const { rows } = await pool.query(
      'INSERT INTO teams (event_id, name, status) VALUES ($1, $2, $3) RETURNING *',
      [event_id, name, 'pending']
    );
    const team_id = rows[0].id;
    
    // Add creator as team leader
    await pool.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
      [team_id, req.session.userId, 'leader']
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get teams for review (organizer only)
app.get('/api/events/:eventId/teams/review', authenticateUser, isOrganizer, async (req, res) => {
  const { eventId } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT t.*, 
        array_agg(json_build_object('id', u.id, 'username', u.username)) as members 
      FROM teams t 
      JOIN team_members tm ON t.id = tm.team_id 
      JOIN users u ON tm.user_id = u.id 
      WHERE t.event_id = $1 AND t.status = 'pending' 
      GROUP BY t.id`,
      [eventId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update team status (organizer only)
app.put('/api/teams/:id/status', authenticateUser, isOrganizer, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE teams SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating team status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join existing team
app.post('/api/teams/:id/join', authenticateUser, async (req, res) => {
  const { id } = req.params;
  try {
    // Check if user is already in a team for this event
    const team = await pool.query('SELECT event_id FROM teams WHERE id = $1', [id]);
    const eventId = team.rows[0].event_id;
    
    const existingMembership = await pool.query(
      'SELECT * FROM team_members tm JOIN teams t ON tm.team_id = t.id WHERE tm.user_id = $1 AND t.event_id = $2',
      [req.session.userId, eventId]
    );

    if (existingMembership.rows.length > 0) {
      return res.status(400).json({ error: 'You are already in a team for this event' });
    }

    const { rows } = await pool.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
      [id, req.session.userId, 'member']
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error joining team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add this new route to get teams for an event
app.get('/api/events/:eventId/teams', async (req, res) => {
  const { eventId } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT t.*, 
        COUNT(tm.user_id) as member_count 
      FROM teams t 
      LEFT JOIN team_members tm ON t.id = tm.team_id 
      WHERE t.event_id = $1 
      GROUP BY t.id`,
      [eventId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Project submission routes
app.post('/api/projects', authenticateUser, async (req, res) => {
  const { event_id, team_id, title, description, github_url, demo_url } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO project_submissions (event_id, team_id, title, description, github_url, demo_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [event_id, team_id, title, description, github_url, demo_url]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error submitting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM project_submissions WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/projects/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { title, description, github_url, demo_url } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE project_submissions SET title = $1, description = $2, github_url = $3, demo_url = $4 WHERE id = $5 AND team_id IN (SELECT team_id FROM team_members WHERE user_id = $6) RETURNING *',
      [title, description, github_url, demo_url, id, req.session.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or you do not have permission to edit it' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Modify the teams table to include status
const alterTeamsTable = async () => {
  try {
    await pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'teams' AND column_name = 'status') 
        THEN 
          ALTER TABLE teams ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
        END IF;
      END $$;
    `);
  } catch (error) {
    console.error('Error modifying teams table:', error);
  }
};

alterTeamsTable();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
