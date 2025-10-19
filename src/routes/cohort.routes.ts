import { Router } from 'express';
import cohortController from '../controllers/cohort.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All cohort routes require authentication
router.use(authenticate);

// Teacher routes - create and manage cohorts
router.post('/', cohortController.createCohort); // Create new cohort
router.get('/', cohortController.getCohorts); // Get teacher's cohorts
router.get('/:cohortId/members', cohortController.getCohortMembers); // Get cohort members
router.put('/:cohortId/regenerate-code', cohortController.regenerateCode); // Regenerate entry code

// Student routes - join and view cohorts
router.post('/join', cohortController.joinCohort); // Join cohort with entry code
router.get('/my-cohorts', cohortController.getMyCohorts); // Get student's cohorts
router.delete('/:cohortId/leave', cohortController.leaveCohort); // Leave a cohort

export default router;
