const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

module.exports = function requireAuth(req, res, next) {
    const { token } = req.cookies;
    if (!token) {
        return next(new ApiError(401, 'Not authenticated'));
    }
    jwt.verify(token, env.jwtSecret, {}, (err, info) => {
        if (err) {
            return next(new ApiError(401, 'Invalid or expired token'));
        }
        req.user = info;
        next();
    });
};
