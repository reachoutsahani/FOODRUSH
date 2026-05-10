const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const sendResponse = (res, statusCode, success, message, data = {}) => {
  res.status(statusCode).json({ success, message, ...data });
};

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, parseInt(query.limit) || 12);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const calculateOrderTotals = (items) => {
  const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = itemsTotal >= 500 ? 0 : 40;
  const tax = Math.round(itemsTotal * 0.05);
  const totalAmount = itemsTotal + deliveryFee + tax;
  return { itemsTotal, deliveryFee, tax, totalAmount };
};

module.exports = { asyncHandler, sendResponse, getPagination, calculateOrderTotals };
