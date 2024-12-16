import express from 'express';
import { getEvents, createEvent, joinEvent } from '../controllers/events.js';
import { authenticateUser, isOrganizer } from '../middleware/auth.js';
import { validate, eventSchema } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getEvents);
router.post('/', authenticateUser, isOrganizer, validate(eventSchema), createEvent);
router.post('/:eventId/join', authenticateUser, joinEvent);

export default router; 