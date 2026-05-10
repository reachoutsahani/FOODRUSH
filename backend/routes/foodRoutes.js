
const express = require('express');
const router = express.Router();
const {
  getAllFood, getFoodById, createFood, updateFood,
  deleteFood, getCategories, getFeaturedFood, addReview,
} = require('../controllers/foodController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');


router.get('/', getAllFood);
router.get('/categories', getCategories);
router.get('/featured', getFeaturedFood);
router.get('/:id', getFoodById);

router.post('/:id/reviews', protect, addReview);

router.post('/', protect, adminOnly, upload.single('image'), createFood);
router.put('/:id', protect, adminOnly, upload.single('image'), updateFood);
router.delete('/:id', protect, adminOnly, deleteFood);

module.exports = router;
