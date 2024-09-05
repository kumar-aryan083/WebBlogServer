import mongoose from "mongoose";


const categorySchema = mongoose.Schema({
    catName: {
        type: String,
        required: true,
        unique: true
    }, 
    blogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }]
}, {timestamps: true});


export default mongoose.model('Category', categorySchema);