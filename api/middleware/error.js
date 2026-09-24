const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const notFound = (req, res, next) => {
    next(new ApiError(404, 'Route not found'));
};

const errorHandler = (err, req, res, next) => {
    let status = err.status || 500;
    let message = err.message || 'Internal server error';

    if (err.name === 'CastError') {
        status = 400;
        message = 'Invalid identifier';
    }
    if (err.code === 11000) {
        status = 400;
        message = 'Username is already taken';
    }
    if (err.name === 'MulterError') {
        status = 400;
        message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 5MB' : err.message;
    }
    if (err.storageErrors || err.name === 'UnexpectedResponse') {
        console.error('Image upload failed:', err.http_code, err.message);
        status = 502;
        message = 'Image upload failed. Please try again later.';
    }

    if (status === 500 && !env.isTest) {
        console.error(err);
    }
    res.status(status).json({ error: message });
};

module.exports = { notFound, errorHandler };
