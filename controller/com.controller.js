import blogModel from '../models/blog.model.js'
import formModel from '../models/form.model.js'
import adminModel from '../models/admin.model.js'
import categoryModel from '../models/category.model.js';

export const allBlog = async (req, res) => {
    try {
        const blogs = await blogModel.find()
        .populate('adminId')  
        .populate('cat')      
        .populate('likes')    
        .populate('dislikes')
        .populate('commentId');
        res.json({
            success: true,
            message: 'blogs fetched successfully',
            blogs
        })
    } catch (error) {
        console.log(error);
    }
}
export const catBlog = async (req, res) => {
    try {
        const category = req.params.cat;
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Category is required'
            });
        }

        const blogs = await blogModel.find({ cat: category });
        res.json({
            success: true,
            message: 'Blogs fetched successfully',
            blogs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
export const submitForm = async (req, res) => {
    try {
        const newForm = new formModel({...req.body})
        await newForm.save();
        res.status(200).json({
            success: true,
            message: "Form Submitted Successfully..."
        });
    } catch (error) {
        console.log(error);
    }
}
