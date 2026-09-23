const express = require('express');
const requireAuth = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');
const { deleteComment } = require('../controllers/commentController');

const router = express.Router();

router.delete('/comment/:id', requireAuth, validateObjectId(), deleteComment);

module.exports = router;
