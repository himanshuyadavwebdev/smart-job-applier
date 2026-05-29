import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import {
  generateDocs,
  confirmApplication,
  getApplicationHistory,
  updateApplicationStatus,
} from '../controllers/apply.controller.js';

const router = Router();

router.use(protect);

router.post(
  '/generate',
  [body('jobId').notEmpty().withMessage('Job ID is required.')],
  generateDocs
);

router.post(
  '/confirm',
  [body('jobId').notEmpty().withMessage('Job ID is required.')],
  confirmApplication
);

router.get('/history', getApplicationHistory);

router.patch(
  '/:id/status',
  [body('status').notEmpty().withMessage('Status is required.')],
  updateApplicationStatus
);

export default router;
