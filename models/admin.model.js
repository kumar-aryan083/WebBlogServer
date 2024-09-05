import mongoose from "mongoose";


const adminSchema = mongoose.Schema({
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
    verified: {
        type: Boolean,
        enum: [true, false],
        default: false
    },
    blogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }]
}, {timestamps: true});


export default mongoose.model('Admin', adminSchema);