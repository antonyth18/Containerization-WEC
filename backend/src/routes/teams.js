import express from 'express';
import { getTeams, createTeam } from '../controllers/teams.js';
import { authenticateUser } from '../middleware/auth.js';
import { validate, teamSchema } from '../middleware/validate.js';

const router = express.Router();

router.get('/', authenticateUser, getTeams);
router.post('/', authenticateUser, validate(teamSchema), createTeam);

export default router; 