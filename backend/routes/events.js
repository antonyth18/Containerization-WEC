const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM events ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching events:', err);
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching event:', err);
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  const { name, type, tagline, about, max_participants, min_team_size, max_team_size, created_by } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO events (name, type, tagline, about, max_participants, min_team_size, max_team_size, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, type, tagline, about, max_participants, min_team_size, max_team_size, created_by]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating event:', err);
    next(err);
  }
});

module.exports = router;

