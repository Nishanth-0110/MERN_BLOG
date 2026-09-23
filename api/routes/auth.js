const express = require('express');
const rateLimit = require('express-rate-limit');
const requireAuth = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
    credentialsSchema,
    register,
    login,
    profile,
    logout,
} = require('../controllers/authController');

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many attempts, please try again later' },
});

router.post('/register', authLimiter, validate(credentialsSchema), register);
router.post('/login', authLimiter, validate(credentialsSchema), login);
router.get('/profile', requireAuth, profile);
router.post('/logout', logout);

module.exports = router;
