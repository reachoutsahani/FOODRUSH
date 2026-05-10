const express = require('express');
const router = express.Router();

const {
  createRazorpayOrder,
  verifyPayment,
  createUPIPayment,
  placeCODOrder,
} = require('../controllers/paymentController');

const { protect } = require('../middleware/authMiddleware');

// Razorpay
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);

// UPI
router.post('/upi', protect, createUPIPayment);

// COD
router.post('/cod', protect, placeCODOrder);

module.exports = router;