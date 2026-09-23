const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return next(new ApiError(400, result.error.issues[0].message));
    }
    req.body = result.data;
    next();
};

const validateObjectId = (param = 'id') => (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params[param])) {
        return next(new ApiError(400, `Invalid ${param}`));
    }
    next();
};

module.exports = { validate, validateObjectId };
