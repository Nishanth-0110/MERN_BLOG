const { z } = require('zod');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const commentSchema = z.object({
    text: z.string().trim().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
});

const listComments = asyncHandler(async (req, res) => {
    const comments = await Comment.find({ post: req.params.id })
        .populate('author', ['username'])
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    res.json(comments);
});

const createComment = asyncHandler(async (req, res) => {
    const postDoc = await Post.findById(req.params.id).select('_id');
    if (!postDoc) {
        throw new ApiError(404, 'Post not found');
    }
    const commentDoc = await Comment.create({
        post: postDoc._id,
        author: req.user.id,
        text: req.body.text,
    });
    await commentDoc.populate('author', ['username']);
    res.status(201).json(commentDoc);
});

const deleteComment = asyncHandler(async (req, res) => {
    const commentDoc = await Comment.findById(req.params.id);
    if (!commentDoc) {
        throw new ApiError(404, 'Comment not found');
    }
    if (commentDoc.author.toString() !== req.user.id) {
        throw new ApiError(403, 'You are not the author');
    }
    await commentDoc.deleteOne();
    res.status(204).send();
});

module.exports = { commentSchema, listComments, createComment, deleteComment };
