const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const credentialsSchema = z.object({
    username: z
        .string()
        .min(4, 'Username must be at least 4 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(72, 'Password must be at most 72 characters'),
});

const publicUser = (userDoc) => ({ id: userDoc._id, username: userDoc.username });

const register = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const existing = await User.findOne({ username });
    if (existing) {
        throw new ApiError(400, 'Username is already taken');
    }

    const userDoc = await User.create({
        username,
        password: bcrypt.hashSync(password, 10),
    });
    res.status(201).json(publicUser(userDoc));
});

const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    const passOk = userDoc && bcrypt.compareSync(password, userDoc.password);

    if (!passOk) {
        throw new ApiError(400, 'Wrong credentials');
    }

    const token = jwt.sign(
        { username, id: userDoc._id },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn }
    );
    res.cookie('token', token, env.cookieOptions).json(publicUser(userDoc));
});

const profile = (req, res) => {
    res.json({ id: req.user.id, username: req.user.username });
};

const logout = (req, res) => {
    const { maxAge, ...clearOptions } = env.cookieOptions;
    res.clearCookie('token', clearOptions).json('ok');
};

module.exports = { credentialsSchema, register, login, profile, logout };
