import express from 'express';
import { checkJwt, ensureUser, isOrganizer, requireCompleteProfile } from '../middleware/auth.js';
import { 
  getEvents, 
  getEventById, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  applyToEvent,
  joinEvent
} from '../controllers/events.js';
import { validate, eventSchema , eventDraftSchema} from '../middleware/validate.js';

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected routes
router.use(checkJwt);
router.use(ensureUser);

// Organizer routes
router.post('/', isOrganizer, createEvent);
router.post('/draft', isOrganizer, validate(eventDraftSchema), createEvent);
router.put('/:id', isOrganizer, updateEvent);
router.delete('/:id', isOrganizer, deleteEvent);

// Participant routes (require complete profile)
router.post('/:id/apply', requireCompleteProfile, applyToEvent);
router.post('/:id/join', joinEvent);

export default router; 