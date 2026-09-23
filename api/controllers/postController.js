const sanitizeHtml = require('sanitize-html');
const { z } = require('zod');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { cloudinary } = require('../config/upload');
const env = require('../config/env');

const postSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
    summary: z.string().trim().min(1, 'Summary is required').max(500, 'Summary is too long'),
    content: z
        .string()
        .refine(
            (v) => v.replace(/<[^>]*>/g, '').trim().length > 0,
            'Content is required'
        ),
});

const sanitizeOptions = {
    allowedTags: [
        'h1', 'h2', 'h3', 'p', 'br', 'strong', 'em', 'u', 's',
        'blockquote', 'pre', 'code', 'ol', 'ul', 'li', 'a', 'img', 'span',
    ],
    allowedAttributes: {
        a: ['href', 'target', 'rel'],
        img: ['src', 'alt'],
        '*': ['class'],
    },
    allowedSchemes: ['http', 'https', 'data'],
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const destroyCover = async (publicId) => {
    if (!publicId || env.isTest) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error('Failed to delete cloudinary asset:', err.message);
    }
};

const coverFromFile = (file) =>
    file.path || `memory://${file.originalname}`;

const listPosts = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 9));
    const search = (req.query.search || '').trim();

    const filter = {};
    if (search) {
        const regex = new RegExp(escapeRegex(search), 'i');
        filter.$or = [{ title: regex }, { summary: regex }];
    }

    const [posts, total] = await Promise.all([
        Post.find(filter)
            .populate('author', ['username'])
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Post.countDocuments(filter),
    ]);

    res.json({ posts, page, pages: Math.max(1, Math.ceil(total / limit)), total });
});

const getPost = asyncHandler(async (req, res) => {
    const postDoc = await Post.findById(req.params.id).populate('author', ['username']);
    if (!postDoc) {
        throw new ApiError(404, 'Post not found');
    }
    res.json(postDoc);
});

const createPost = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'Cover image is required');
    }
    const { title, summary, content } = req.body;
    const postDoc = await Post.create({
        title,
        summary,
        content: sanitizeHtml(content, sanitizeOptions),
        cover: coverFromFile(req.file),
        coverPublicId: req.file.filename || null,
        author: req.user.id,
    });
    res.status(201).json(postDoc);
});

const updatePost = asyncHandler(async (req, res) => {
    const postDoc = await Post.findById(req.params.id);
    if (!postDoc) {
        throw new ApiError(404, 'Post not found');
    }
    if (postDoc.author.toString() !== req.user.id) {
        throw new ApiError(403, 'You are not the author');
    }

    const { title, summary, content } = req.body;
    const update = {
        title,
        summary,
        content: sanitizeHtml(content, sanitizeOptions),
    };
    if (req.file) {
        await destroyCover(postDoc.coverPublicId);
        update.cover = coverFromFile(req.file);
        update.coverPublicId = req.file.filename || null;
    }

    await postDoc.updateOne(update);
    res.json(await Post.findById(postDoc._id).populate('author', ['username']));
});

const deletePost = asyncHandler(async (req, res) => {
    const postDoc = await Post.findById(req.params.id);
    if (!postDoc) {
        throw new ApiError(404, 'Post not found');
    }
    if (postDoc.author.toString() !== req.user.id) {
        throw new ApiError(403, 'You are not the author');
    }

    await Comment.deleteMany({ post: postDoc._id });
    await postDoc.deleteOne();
    await destroyCover(postDoc.coverPublicId);
    res.status(204).send();
});

module.exports = { postSchema, listPosts, getPost, createPost, updatePost, deletePost };
