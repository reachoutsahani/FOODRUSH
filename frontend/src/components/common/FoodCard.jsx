
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function FoodCard({ food }) {
  const { addToCart, cartItems, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();


  const cartItem = cartItems.find(item => item.food._id === food._id);
  const qty = cartItem?.quantity || 0;

  return (
    <div className="card overflow-hidden hover:shadow-md transition-all duration-300 group animate-fade-in">
    
      <Link to={`/food/${food._id}`} className="block relative overflow-hidden h-48">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        <div className="absolute top-2 left-2 flex gap-1">
          {food.isVeg ? (
            <span className="badge bg-green-100 text-green-700 border border-green-300">🟢 Veg</span>
          ) : (
            <span className="badge bg-red-100 text-red-700 border border-red-300">🔴 Non-veg</span>
          )}
          {food.isFeatured && (
            <span className="badge bg-brand-100 text-brand-700">⭐ Featured</span>
          )}
        </div>
       
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
          {food.preparationTime} min
        </div>
      </Link>

     
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <Link to={`/food/${food._id}`}>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-brand-500 transition-colors line-clamp-1">
              {food.name}
            </h3>
          </Link>
          {food.rating > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-lg shrink-0 ml-2">
              ⭐ {food.rating}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{food.restaurant}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 line-clamp-2">{food.description}</p>

        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            ₹{food.price}
          </span>

         
          {!food.isAvailable ? (
            <span className="text-xs text-red-500 font-medium">Unavailable</span>
          ) : qty === 0 ? (
            <button
              onClick={() => addToCart(food)}
              className="btn-primary text-sm py-1.5 px-4"
            >
              Add +
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-brand-500 rounded-xl">
              <button
                onClick={() => removeFromCart(food._id)}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-brand-600 rounded-l-xl transition-colors font-bold text-lg"
              >
                −
              </button>
              <span className="text-white font-semibold text-sm min-w-[1.5rem] text-center">{qty}</span>
              <button
                onClick={() => addToCart(food)}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-brand-600 rounded-r-xl transition-colors font-bold text-lg"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
