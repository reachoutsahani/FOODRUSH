import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Spinner from '../components/common/Spinner';

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 500;

export default function Cart() {
  const { cartItems, total, loading, addToCart, removeFromCart, removeItem } = useCart();
  const navigate = useNavigate();

  const deliveryFee = total >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const tax = Math.round(total * 0.05);
  const grandTotal = total + deliveryFee + tax;

  if (loading) return <Spinner />;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <span className="text-8xl block mb-4">🛒</span>
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Looks like you haven't added anything yet!</p>
        <Link to="/menu" className="btn-primary">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        🛒 Your Cart ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map(({ food, quantity, subtotal }) => (
            <div key={food._id} className="card p-4 flex gap-4 items-start animate-fade-in">
              <img
                src={food.image}
                alt={food.name}
                className="w-20 h-20 object-cover rounded-xl shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{food.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{food.restaurant}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {food.isVeg ? '🟢 Veg' : '🔴 Non-veg'}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(food._id)}
                    className="text-gray-300 hover:text-red-500 transition-colors text-xl shrink-0"
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                 
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                    <button
                      onClick={() => removeFromCart(food._id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-brand-500 hover:text-white transition-all font-bold text-lg text-gray-600 dark:text-gray-300"
                    >−</button>
                    <span className="font-semibold text-gray-800 dark:text-gray-100 min-w-[1.5rem] text-center">{quantity}</span>
                    <button
                      onClick={() => addToCart(food)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-brand-500 hover:text-white transition-all font-bold text-lg text-gray-600 dark:text-gray-300"
                    >+</button>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-400">₹{food.price} × {quantity}</span>
                    <p className="font-bold text-gray-900 dark:text-white">₹{subtotal}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

       
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Items total</span>
                <span>₹{total}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Delivery fee</span>
                <span className={deliveryFee === 0 ? 'text-green-500 font-medium' : ''}>
                  {deliveryFee === 0 ? 'FREE 🎉' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>GST (5%)</span>
                <span>₹{tax}</span>
              </div>

              {total < FREE_DELIVERY_THRESHOLD && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-xs text-green-700 dark:text-green-400">
                  Add ₹{FREE_DELIVERY_THRESHOLD - total} more for FREE delivery! 🚀
                </div>
              )}

              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full py-3 mt-5 text-base"
            >
              Proceed to Checkout →
            </button>

            <Link to="/menu" className="block text-center text-sm text-brand-500 hover:underline mt-3">
              + Add more items
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
