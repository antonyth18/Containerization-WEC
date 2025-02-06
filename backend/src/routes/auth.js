import express from 'express';
import { register, getCurrentUser } from '../controllers/auth.js';
import { checkJwt } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);

// Protected routes
router.get('/user', checkJwt, getCurrentUser);

export default router; 