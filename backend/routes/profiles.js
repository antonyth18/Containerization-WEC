const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/:userId', async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const { rows } = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  const { user_id, first_name, last_name, avatar_url, bio, gender, phone, country, city } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO user_profiles (user_id, first_name, last_name, avatar_url, bio, gender, phone, country, city) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [user_id, first_name, last_name, avatar_url, bio, gender, phone, country, city]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating profile:', err);
    next(err);
  }
});

module.exports = router;

