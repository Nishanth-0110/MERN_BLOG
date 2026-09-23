const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const CommentSchema = new Schema({
    post: {type: Schema.Types.ObjectId, ref: 'Post', required: true},
    author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    text: {type: String, required: true, maxlength: 1000, trim: true},
}, {
    timestamps: true,
});

CommentSchema.index({post: 1, createdAt: -1});

const CommentModel = model('Comment', CommentSchema);

module.exports = CommentModel;
