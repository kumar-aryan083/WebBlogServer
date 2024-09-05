import express from 'express'
import { addNewCat, allCat, catByName, deleteCat, updateCat } from '../controller/category.controller.js';
import { verifyToken } from '../verifyToken.js';
const router = express.Router(); 

router.get('/all-category', allCat)
router.get('/:catName', catByName);
router.post('/add-new-category',verifyToken, addNewCat);
router.delete('/delete-category/:id',verifyToken, deleteCat);
router.put('/update-category/?catId=:id',verifyToken, updateCat);


export default router;  