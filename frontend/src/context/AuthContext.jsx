

import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  loading: true, 
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      try {
        const { data } = await authAPI.getProfile();
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: data.user, token },
        });
      } catch {
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
      }
    };
    verifyToken();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('token', data.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.user, token: data.token } });
      toast.success(`Welcome back, ${data.user.name}! 👋`);
      return { success: true, user: data.user };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (name, email, password, phone) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await authAPI.register({ name, email, password, phone });
      localStorage.setItem('token', data.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.user, token: data.token } });
      toast.success('Account created! Welcome to FoodRush 🍔');
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
