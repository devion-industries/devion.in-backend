import { Router } from 'express';
import leaderboardController from '../controllers/leaderboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All leaderboard routes require authentication
router.use(authenticate);

// Leaderboard endpoints
router.get('/global', leaderboardController.getGlobalLeaderboard.bind(leaderboardController));
router.get('/cohort/:cohortId', leaderboardController.getCohortLeaderboard.bind(leaderboardController));
router.get('/friends', leaderboardController.getFriendsLeaderboard.bind(leaderboardController));
router.get('/my-rank', leaderboardController.getMyRank.bind(leaderboardController));

// Friends management
router.get('/my-friends', leaderboardController.getFriends.bind(leaderboardController));
router.post('/add-friend', leaderboardController.addFriend.bind(leaderboardController));
router.delete('/remove-friend/:friendId', leaderboardController.removeFriend.bind(leaderboardController));

export default router;

