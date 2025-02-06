import express from 'express';
import { checkJwt, ensureUser } from '../middleware/auth.js';
import { 
  getCurrentUser,
  updateProfile,
  updateEducation,
  updateSkills,
  updateSocialProfiles
} from '../controllers/auth.js';

const router = express.Router();

// All routes require JWT
router.use(checkJwt);
router.use(ensureUser);

router.get('/user', getCurrentUser);
router.put('/profile', updateProfile);
router.put('/education', updateEducation);
router.put('/skills', updateSkills);
router.put('/social', updateSocialProfiles);

export default router; 