const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const env = require('./env');

let storage;

if (env.isTest) {
    storage = multer.memoryStorage();
} else {
    cloudinary.config({
        cloud_name: env.cloudinary.cloudName,
        api_key: env.cloudinary.apiKey,
        api_secret: env.cloudinary.apiSecret,
    });
    storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'blog-posts',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        },
    });
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    },
});

module.exports = { upload, cloudinary };
