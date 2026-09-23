const express = require('express');
const rateLimit = require('express-rate-limit');
const requireAuth = require('../middleware/auth');
const { validate, validateObjectId } = require('../middleware/validate');
const { upload } = require('../config/upload');
const {
    postSchema,
    listPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
} = require('../controllers/postController');
const {
    commentSchema,
    listComments,
    createComment,
} = require('../controllers/commentController');

const router = express.Router();

const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests, please slow down' },
});

router.get('/post', listPosts);
router.post(
    '/post',
    requireAuth,
    writeLimiter,
    upload.single('file'),
    validate(postSchema),
    createPost
);
router.get('/post/:id', validateObjectId(), getPost);
router.put(
    '/post/:id',
    requireAuth,
    writeLimiter,
    validateObjectId(),
    upload.single('file'),
    validate(postSchema),
    updatePost
);
router.delete('/post/:id', requireAuth, validateObjectId(), deletePost);

router.get('/post/:id/comments', validateObjectId(), listComments);
router.post(
    '/post/:id/comments',
    requireAuth,
    validateObjectId(),
    validate(commentSchema),
    createComment
);

module.exports = router;
