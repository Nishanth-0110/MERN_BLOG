const mongoose = require("mongoose");
const {Schema, model} = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 20,
        unique: true,
        trim: true,
        match: /^[a-zA-Z0-9_]+$/,
    },
    password: {type: String, required: true},
});

const UserModel = model('User', UserSchema);

module.exports = UserModel;
