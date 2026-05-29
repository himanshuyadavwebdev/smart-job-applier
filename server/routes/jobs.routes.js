import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  getMatchedJobs,
  getJobById,
  saveJob,
  unsaveJob,
  getSavedJobs,
} from '../controllers/jobs.controller.js';

const router = Router();

router.use(protect);

router.get('/match', getMatchedJobs);
router.get('/saved', getSavedJobs);
router.get('/:id', getJobById);
router.post('/save', saveJob);
router.delete('/save/:jobId', unsaveJob);

export default router;
