import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  uploadResume,
  getActiveResume,
  updatePreferences,
  getATSScoreController,
} from '../controllers/resume.controller.js';

const router = Router();

router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);

router.get('/active', getActiveResume);

router.put(
  '/preferences',
  [
    body('desiredRole').optional().trim(),
    body('salaryMin').optional().isNumeric().withMessage('Salary min must be a number.'),
    body('salaryMax').optional().isNumeric().withMessage('Salary max must be a number.'),
    body('jobType').optional().isArray().withMessage('Job type must be an array.'),
    body('preferredLocations').optional().isArray(),
    body('techStack').optional().isArray(),
  ],
  updatePreferences
);

router.post(
  '/ats-score',
  [body('jobDescription').notEmpty().withMessage('Job description is required.')],
  getATSScoreController
);

export default router;
