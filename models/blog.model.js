import mongoose from "mongoose";


const blogSchema = mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin', 
        require: true
    },
    title: { 
        type: String,
        required: true
    },
    description: {
        type: String, 
        required: true 
    },
    keyword: [{
        type: String
    }],
    bImg: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    cat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    content: {
        type: String,
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    commentId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, {timestamps: true});


export default mongoose.model('Blog', blogSchema);