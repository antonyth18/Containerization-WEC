const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM project_submissions ORDER BY submission_time DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  const { event_id, team_id, title, description, github_url, demo_url } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO project_submissions (event_id, team_id, title, description, github_url, demo_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [event_id, team_id, title, description, github_url, demo_url]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating project:', err);
    next(err);
  }
});

module.exports = router;

