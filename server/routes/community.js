const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getMembers,
  getMessages,
  postMessage,
  reportMessage,
} = require('../controllers/communityController');

// All community routes require authentication
router.use(authMiddleware);

// GET /api/community/:goalSlug/members - Get members pursuing this goal
router.get('/:goalSlug/members', getMembers);

// GET /api/community/:goal/messages?since=<timestamp> - Get messages with optional polling
router.get('/:goalSlug/messages', getMessages);

// POST /api/community/:goalSlug/messages - Post a new message
router.post('/:goalSlug/messages', postMessage);

// POST /api/community/:goalSlug/messages/:messageId/report - Report a message
router.post('/:goalSlug/messages/:messageId/report', reportMessage);

module.exports = router;
