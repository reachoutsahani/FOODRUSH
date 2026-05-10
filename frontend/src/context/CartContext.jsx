
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, cartItems: action.payload.cartItems, total: action.payload.total, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'CLEAR_CART':
      return { ...state, cartItems: [], total: 0 };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    cartItems: [],
    total: 0,
    loading: false,
  });
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch({ type: 'CLEAR_CART' });
      return;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await cartAPI.get();
      dispatch({ type: 'SET_CART', payload: { cartItems: data.cartItems, total: data.total } });
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (food) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      await cartAPI.add(food._id);
      await fetchCart(); 
      toast.success(`${food.name} added to cart!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const removeFromCart = async (foodId) => {
    try {
      await cartAPI.remove(foodId);
      await fetchCart();
    } catch {
      toast.error('Failed to update cart');
    }
  };

  const removeItem = async (foodId) => {
    try {
      await cartAPI.removeItem(foodId);
      await fetchCart();
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      dispatch({ type: 'CLEAR_CART' });
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  const cartCount = state.cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      ...state,
      cartCount,
      addToCart,
      removeFromCart,
      removeItem,
      clearCart,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
