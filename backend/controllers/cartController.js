

const User = require('../models/User');
const Food = require('../models/Food');


const getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const cartData = user.cartData || new Map();

    if (cartData.size === 0) {
      return res.json({ success: true, cartItems: [], total: 0 });
    }

    
    const foodIds = Array.from(cartData.keys());
    const foods = await Food.find({ _id: { $in: foodIds } }).lean();

    const cartItems = foods
      .map(food => ({
        food,
        quantity: cartData.get(food._id.toString()),
        subtotal: food.price * cartData.get(food._id.toString()),
      }))
      .filter(item => item.quantity > 0);

    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.json({ success: true, cartItems, total });
  } catch (error) {
    next(error);
  }
};


const addToCart = async (req, res, next) => {
  try {
    const { foodId } = req.body;

    // Verify food exists
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }
    if (!food.isAvailable) {
      return res.status(400).json({ success: false, message: 'This item is currently unavailable' });
    }

    const user = await User.findById(req.user._id);
    const cartData = user.cartData || new Map();

    const currentQty = cartData.get(foodId) || 0;
    cartData.set(foodId, currentQty + 1);

    user.cartData = cartData;
    await user.save();

    res.json({ success: true, message: 'Added to cart', cartData: Object.fromEntries(cartData) });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { foodId } = req.body;

    const user = await User.findById(req.user._id);
    const cartData = user.cartData || new Map();

    const currentQty = cartData.get(foodId) || 0;
    if (currentQty <= 1) {
      cartData.delete(foodId); 
    } else {
      cartData.set(foodId, currentQty - 1);
    }

    user.cartData = cartData;
    await user.save();

    res.json({ success: true, message: 'Cart updated', cartData: Object.fromEntries(cartData) });
  } catch (error) {
    next(error);
  }
};

const removeItemCompletely = async (req, res, next) => {
  try {
    const { foodId } = req.params;

    const user = await User.findById(req.user._id);
    const cartData = user.cartData || new Map();
    cartData.delete(foodId);

    user.cartData = cartData;
    await user.save();

    res.json({ success: true, message: 'Item removed from cart', cartData: Object.fromEntries(cartData) });
  } catch (error) {
    next(error);
  }
};


const clearCart = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { cartData: new Map() });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, removeFromCart, removeItemCompletely, clearCart };
