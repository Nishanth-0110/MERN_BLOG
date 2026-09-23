require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';
const isProd = process.env.NODE_ENV === 'production';

const required = [
    'MONGO_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
];
if (!isTest) {
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length) {
        console.error(`Missing required environment variables: ${missing.join(', ')}`);
        console.error('Create api/.env — see .env.example');
        process.exit(1);
    }
}

const env = {
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET || 'test-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    port: parseInt(process.env.PORT || '4000', 10),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    isProd,
    isTest,
};

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
env.cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE,
};

module.exports = env;
