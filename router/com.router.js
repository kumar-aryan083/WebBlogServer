import express from 'express'
import { allBlog, catBlog, submitForm } from '../controller/com.controller.js';

const router = express.Router();

router.get('/all-blogs', allBlog);
router.get('/all-blogs/:cat', catBlog);
router.post('/submit-form', submitForm);


export default router;