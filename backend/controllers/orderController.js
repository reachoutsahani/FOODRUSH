

const Order = require('../models/Order');
const Food = require('../models/Food');
const User = require('../models/User');


const placeOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, paymentMethod, instructions } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    const orderItems = [];
    let itemsTotal = 0;

    for (const item of items) {
      const food = await Food.findById(item.food);
      if (!food || !food.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${food?.name || 'An item'} is no longer available`,
        });
      }

      orderItems.push({
        food: food._id,
        name: food.name,     
        image: food.image,   
        price: food.price,   
        quantity: item.quantity,
      });

      itemsTotal += food.price * item.quantity;
    }

    const deliveryFee = itemsTotal > 500 ? 0 : 40; 
    const tax = Math.round(itemsTotal * 0.05);      
    const totalAmount = itemsTotal + deliveryFee + tax;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      deliveryAddress,
      itemsTotal,
      deliveryFee,
      tax,
      totalAmount,
      paymentMethod: paymentMethod || 'razorpay',
      instructions,
      statusHistory: [{ status: 'placed', timestamp: new Date() }],
    });

   
    await User.findByIdAndUpdate(req.user._id, { cartData: new Map() });

    
    const io = req.app.get('io');
    io.to('admin_room').emit('new_order', {
      orderId: order._id,
      userName: req.user.name,
      totalAmount,
      itemCount: orderItems.length,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order,
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const cancellableStatuses = ['placed', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage',
      });
    }

    order.status = 'cancelled';
    order.cancelReason = req.body.reason || 'Cancelled by user';
    order.statusHistory.push({ status: 'cancelled', timestamp: new Date(), note: order.cancelReason });
    await order.save();

    const io = req.app.get('io');
    io.to(`order_${order._id}`).emit('order_status_update', {
      orderId: order._id,
      status: 'cancelled',
    });

    res.json({ success: true, message: 'Order cancelled', order });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, orders, total, totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const validTransitions = {
      placed: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['out_for_delivery'],
      out_for_delivery: ['delivered'],
    };

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot move order from "${order.status}" to "${status}"`,
      });
    }

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date(), note });

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    const io = req.app.get('io');
    io.to(`order_${order._id}`).emit('order_status_update', {
      orderId: order._id,
      status,
      timestamp: new Date(),
    });

    res.json({ success: true, message: `Order status updated to "${status}"`, order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};
