const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// ================= RAZORPAY INSTANCE =================
const getRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// ================= CREATE RAZORPAY ORDER =================
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: `foodrush_${order._id}`,
      notes: {
        orderId: order._id.toString(),
      },
    });

    // IMPORTANT FIX
    order.razorpayOrderId = razorpayOrder.id;
    order.paymentMethod = 'razorpay';

    await order.save();

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

// ================= VERIFY PAYMENT =================
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed',
      });

      return res.status(400).json({
        success: false,
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'confirmed',
      },
      { new: true }
    );

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// ================= DIRECT UPI =================
const createUPIPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
      });
    }

    const upiId = process.env.UPI_ID;
    const name = process.env.UPI_NAME;

    const upiLink = `upi://pay?pa=${upiId}&pn=${name}&am=${order.totalAmount}&cu=INR`;

    order.paymentMethod = 'upi';

    await order.save();

    res.json({
      success: true,
      upiLink,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};

// ================= COD =================
const placeCODOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
      });
    }

    order.paymentMethod = 'cod';
    order.paymentStatus = 'pending';
    order.status = 'confirmed';

    await order.save();

    res.json({
      success: true,
      message: 'Order placed with COD',
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  createUPIPayment,
  placeCODOrder,
};