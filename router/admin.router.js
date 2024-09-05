import express from 'express'
import { addBlog, check, deleteBlog, deleteComment, deleteForm, getBlogById, getComment, getCommentByBlogId, login, register, sendMail, updateBlog, verifyOtp } from '../controller/admin.controller.js';
import { verifyToken } from '../verifyToken.js';

const router = express.Router(); 

router.get('/validate',verifyToken, check);
router.post('/login', login);
router.get('/verify-otp/:id/:otp', verifyOtp);
router.post('/register', register);
router.post('/add-blog',verifyToken, addBlog); 
router.delete('/delete-blog/:bId',verifyToken, deleteBlog);
router.put('/update-blog/:bId',verifyToken , updateBlog);
router.delete('/delete-comment/:cId/:uId', verifyToken, deleteComment);
router.get('/:id/comments', verifyToken, getCommentByBlogId);
router.get('/delete-form/:fId', verifyToken, deleteForm);
router.get('/get-form',verifyToken, getComment);
router.post('/send-mail', verifyToken, sendMail);
router.get('/blog/:id',verifyToken, getBlogById );


export default router;  