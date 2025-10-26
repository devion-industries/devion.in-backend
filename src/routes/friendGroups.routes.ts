import { Router } from 'express';
import friendGroupsController from '../controllers/friendGroups.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All friend groups routes require authentication
router.use(authenticate);

// Friend groups endpoints
router.post('/', friendGroupsController.createGroup.bind(friendGroupsController));
router.get('/my-groups', friendGroupsController.getMyGroups.bind(friendGroupsController));
router.post('/join', friendGroupsController.joinGroup.bind(friendGroupsController));
router.delete('/:groupId/leave', friendGroupsController.leaveGroup.bind(friendGroupsController));
router.get('/:groupId/members', friendGroupsController.getGroupMembers.bind(friendGroupsController));
router.get('/:groupId/leaderboard', friendGroupsController.getGroupLeaderboard.bind(friendGroupsController));
router.put('/:groupId/regenerate-code', friendGroupsController.regenerateCode.bind(friendGroupsController));
router.delete('/:groupId', friendGroupsController.deleteGroup.bind(friendGroupsController));

export default router;

