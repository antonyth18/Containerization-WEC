import express from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/auth.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/user', authenticateUser, getCurrentUser);

export default router; 