

const User = require('../models/User');
const Food = require('../models/Food');
const Order = require('../models/Order');

const getDashboardStats = async (req, res, next) => {
  try {
    
    const [
      totalUsers,
      totalFoodItems,
      totalOrders,
      revenueResult,
      recentOrders,
      ordersByStatus,
      topFoods,
      dailyRevenue,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Food.countDocuments(),
      Order.countDocuments(),

      
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),

      
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

     
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.name', count: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalFoodItems,
        totalOrders,
        totalRevenue: revenueResult[0]?.total || 0,
        recentOrders,
        ordersByStatus: ordersByStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        topFoods,
        dailyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: 'user' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, users, total });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot modify admin accounts' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getAllUsers, toggleUserStatus };
