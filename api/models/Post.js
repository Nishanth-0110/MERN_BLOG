const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const PostSchema = new Schema({
    title: {type: String, required: true, maxlength: 200, trim: true},
    summary: {type: String, required: true, maxlength: 500, trim: true},
    content: {type: String, required: true},
    cover: {type: String, required: true},
    coverPublicId: {type: String, default: null},
    author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
}, {
    timestamps: true,
});

PostSchema.index({createdAt: -1});
PostSchema.index({author: 1});

const PostModel = model('Post', PostSchema);

module.exports = PostModel;
