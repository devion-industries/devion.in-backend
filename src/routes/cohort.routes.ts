import { Router } from 'express';
import cohortController from '../controllers/cohort.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All cohort routes require authentication
router.use(authenticate);

// Teacher routes - create and manage cohorts
router.post('/', cohortController.createCohort.bind(cohortController)); // Create new cohort
router.get('/', cohortController.getCohorts.bind(cohortController)); // Get teacher's cohorts
router.get('/:cohortId/members', cohortController.getCohortMembers.bind(cohortController)); // Get cohort members
router.put('/:cohortId/regenerate-code', cohortController.regenerateCode.bind(cohortController)); // Regenerate entry code

// Student routes - join and view cohorts
router.post('/join', cohortController.joinCohort.bind(cohortController)); // Join cohort with entry code
router.get('/my-cohorts', cohortController.getMyCohorts.bind(cohortController)); // Get student's cohorts
router.delete('/:cohortId/leave', cohortController.leaveCohort.bind(cohortController)); // Leave a cohort

export default router;
