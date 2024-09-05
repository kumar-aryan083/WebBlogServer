import mongoose from "mongoose";


const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String
    },
    savedBlog: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }],
    commentId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
}, {timestamps: true});


export default mongoose.model('User', userSchema);