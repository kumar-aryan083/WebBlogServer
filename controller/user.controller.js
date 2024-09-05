import userModel from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import commentModel from '../models/comment.model.js';
import blogModel from '../models/blog.model.js';

export const register = async (req, res) => {
    try {
        const user = await userModel.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.email },
                { phone: req.body.phone }
            ]
        });
        if (!user) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);
            const newUser = userModel({ ...req.body, password: hash });
            await newUser.save();
            const token = jwt.sign({ id: newUser._id }, process.env.KEY);
            const { password, ...others } = newUser._doc;
            res.cookie('token', token, {
                httpOnly: true
            }).status(200).json({
                success: true,
                message: 'User Registered Successfully',
                user:others,
                token: token
            })
        } else {
            res.status(301).json({
                success: false,
                message: 'Phone, Email or Username exist already'
            })
        }
    } catch (error) {
        console.log(error);
    }
}
export const login = async (req, res) => {
    try {
        const user = await userModel.findOne({
            $or: [
                { username: req.body.id },
                { email: req.body.id },
                { phone: req.body.id }
            ]
        });

        if (!user) {
            res.json({
                success: false,
                message: 'invalid credentials'
            });
        } else {
            const password = user.password;
            if (bcrypt.compareSync(req.body.password, password)) {
                // Log the value of process.env.KEY
                console.log('JWT Key:', process.env.KEY);

                // Fallback to a default key if process.env.KEY is undefined
                const token = jwt.sign({ id: user._id }, process.env.KEY || 'defaultSecretKey');
                
                const { password, ...others } = user._doc;
                res.cookie('token', token, {
                    httpOnly: true
                }).status(200).json({
                    success: true,
                    message: 'Logged in Successfully',
                    user: others,
                    token: token
                });
            } else {
                res.status(403).json({
                    success: false,
                    message: 'invalid credentials'
                });
            }
        }
    } catch (error) {
        console.log(error);
    }
}
export const addComment = async (req, res) => {
    try {
        const newComment = new commentModel({
            ...req.body,
            userId: req.user.id
        })
        await newComment.save();
        const user = await userModel.findOne({ _id: req.user.id })
        user.commentId.push(newComment._id);
        await user.save();
        const blog = await blogModel.findOne({ _id: req.body.blogId });
        blog.commentId.push(newComment._id);
        await blog.save();
        const singleComment = await (await newComment.populate('blogId')).populate('userId')
        res.status(200).json({
            success: true,
            message: 'Comment added successfully',
            newComment:singleComment
        })
    } catch (error) {
        console.log(error);
    }
}
export const saveBlog = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.user.id });

        // Check if the blog is already saved using the `some` method
        const isBlogSaved = user.savedBlog.some(blogId => blogId.toString() === req.params.bId);

        if (!isBlogSaved) {
            user.savedBlog.push(req.params.bId);
            await user.save();
            return res.status(200).json({
                success: true,
                message: 'Blog successfully saved'
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Blog already saved'
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while saving the blog'
        });
    }
}
export const likeComment = async (req, res) => {
    try {
        const comment = await commentModel.findOne({ _id: req.params.cId });

        // Remove dislike if the user had previously disliked the comment
        const isDislikedBefore = comment.dislikes.some(dislikeId => dislikeId.toString() === req.user.id);
        if (isDislikedBefore) {
            comment.dislikes = comment.dislikes.filter(dislikeId => dislikeId.toString() !== req.user.id);
            await comment.save();
        }

        // Check if the comment is already liked by the user
        const isLikedBefore = comment.likes.some(likeId => likeId.toString() === req.user.id);
        if (isLikedBefore) {
            return res.status(403).json({
                success: false,
                message: 'Already liked'
            });
        } else {
            comment.likes.push(req.user.id);
            await comment.save();

            // Populate comments with user information
            const blog = await blogModel.findOne({ _id: comment.blogId }).populate({
                path: 'commentId',
                populate: { path: 'userId' }
            });

            res.status(200).json({
                success: true,
                message: 'Liked successfully',
                comments: blog.commentId
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'An error occurred',
        });
    }
}
export const disLikeComment = async (req, res) => {
    try {
        const comment = await commentModel.findOne({ _id: req.params.cId });
        const isLikedBefore = comment.likes.some(likesId => likesId.toString() === req.user.id);
        if (isLikedBefore) {
            comment.likes.pull(req.user.id); // Use pull to remove the user's ID from likes
        }

        const isDislikedBefore = comment.dislikes.some(dislikeId => dislikeId.toString() === req.user.id);
        if (isDislikedBefore) {
            return res.status(403).json({
                success: false,
                message: 'Already Disliked'
            });
        } else {
            comment.dislikes.push(req.user.id);
            await comment.save();

            // Populate the comments with user data for the response
            const updatedBlog = await blogModel.findOne({ _id: comment.blogId })
                .populate({
                    path: 'commentId',
                    populate: {
                        path: 'userId'
                    }
                });

            res.status(200).json({
                success: true,
                message: 'Disliked successfully',
                comments: updatedBlog.commentId
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
export const editComment = async (req, res) => {
    try {
        const comment = await commentModel.findByIdAndUpdate(req.body.cId, {
            content: req.body.content,
            edited: true
        }, { new: true })

        const comments = (await blogModel.findOne({ _id: req.body.blogId }).populate('commentId')).commentId
        res.status(200).json({
            success: true,
            message: 'Comment Edited Successfully',
            comments: comments
        })
    } catch (error) {
        console.log(error);
    }
}
export const deleteComment = async (req, res) => {
    try {
        const comment = await commentModel.findByIdAndDelete(req.params.cId);
        const user = await userModel.findOne({ _id: req.user.id });
        user.commentId.pop(req.params.cId);
        await user.save();
        const blog = await blogModel.findOne({ _id: comment.blogId })
        blog.commentId.pop(req.params.cId);
        await blog.save();
        const fullBlogData = (await blog.populate('commentId')).commentId;
        res.status(200).json({
            success: true,
            message: 'Comment deleted permanently',
            newUser: user,
            comments: fullBlogData
        })
    } catch (error) {
        console.log(error);
    }
}
export const likeBlog = async (req, res) => {
    try {
        const blog = await blogModel.findOne({ _id: req.params.bId });

        // Remove dislike if the user had previously disliked the blog
        const isDislikedBefore = blog.dislikes.some(dislikeId => dislikeId.toString() === req.user.id);
        if (isDislikedBefore) {
            blog.dislikes = blog.dislikes.filter(dislikeId => dislikeId.toString() !== req.user.id);
            await blog.save();
        }

        // Check if the blog is already liked by the user
        const isLikedBefore = blog.likes.some(likeId => likeId.toString() === req.user.id);
        if (isLikedBefore) {
            return res.status(403).json({
                success: false,
                message: 'Already liked'
            });
        } else {
            blog.likes.push(req.user.id);
            await blog.save();

            // Populate commentId and userId within commentId
            const blogData = await blogModel.findOne({ _id: blog._id }).populate({
                path: 'commentId',
                populate: { path: 'userId' }
            });

            res.status(200).json({
                success: true,
                message: 'Liked successfully',
                blog: blogData
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'An error occurred',
        });
    }
}
export const disLikeBlog = async (req, res) => {
    try {
        const blog = await blogModel.findOne({ _id: req.params.bId });

        // Remove like if the user had previously liked the blog
        const isLikedBefore = blog.likes.some(likeId => likeId.toString() === req.user.id);
        if (isLikedBefore) {
            blog.likes = blog.likes.filter(likeId => likeId.toString() !== req.user.id);
            await blog.save();
        }

        // Check if the blog is already disliked by the user
        const isDislikedBefore = blog.dislikes.some(dislikeId => dislikeId.toString() === req.user.id);
        if (isDislikedBefore) {
            return res.status(403).json({
                success: false,
                message: 'Already disliked'
            });
        } else {
            blog.dislikes.push(req.user.id);
            await blog.save();

            // Populate commentId and userId within commentId
            const blogData = await blogModel.findOne({ _id: blog._id }).populate({
                path: 'commentId',
                populate: { path: 'userId' }
            });

            res.status(200).json({
                success: true,
                message: 'Disliked successfully',
                blog: blogData
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'An error occurred',
        });
    }
}
export const blogBySlug = async (req, res) => {
    try {
        const blog = await blogModel
            .findOne({ slug: req.params.slug })
            .populate('adminId', 'name email') // Populate fields from the Admin model
            .populate('cat', 'catName') // Populate fields from the Category model
            .populate({
                path: 'commentId',
                populate: {
                    path: 'userId', // Populate userId inside each comment
                    select: 'name email' // Select specific fields to populate
                }
            })
            .exec();

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Blog Fetched...',
            blog
        });
    } catch (error) {
        console.error('Error fetching blog by slug:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog'
        });
    }
}