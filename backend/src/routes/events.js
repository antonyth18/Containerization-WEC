import express from 'express';
import { getEvents, createEvent, joinEvent, getEventById, updateEvent} from '../controllers/events.js';
import { authenticateUser, isOrganizer } from '../middleware/auth.js';
import { validate, eventSchema , eventDraftSchema} from '../middleware/validate.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', authenticateUser, isOrganizer, validate(eventSchema), createEvent);
router.post('/draft', authenticateUser, isOrganizer, validate(eventDraftSchema), createEvent); 
router.post('/:eventId/join', authenticateUser, joinEvent);
router.put('/:eventId', updateEvent);

export default router; 