
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

       
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-brand-500">
            <span className="text-2xl">🍔</span>
            <span>FoodRush</span>
          </Link>

       
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-brand-500' : 'text-gray-600 dark:text-gray-300 hover:text-brand-500'}`}>
              Home
            </Link>
            <Link to="/menu" className={`text-sm font-medium transition-colors ${isActive('/menu') ? 'text-brand-500' : 'text-gray-600 dark:text-gray-300 hover:text-brand-500'}`}>
              Menu
            </Link>
            {isAuthenticated && (
              <Link to="/orders" className={`text-sm font-medium transition-colors ${isActive('/orders') ? 'text-brand-500' : 'text-gray-600 dark:text-gray-300 hover:text-brand-500'}`}>
                Orders
              </Link>
            )}
          </div>

         
          <div className="flex items-center gap-3">
        
            {isAuthenticated && (
              <Link to="/cart" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-brand-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-fade-in">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            )}

         
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-500 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                    <span className="text-brand-600 dark:text-brand-300 font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block">{user?.name?.split(' ')[0]}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 card shadow-lg py-1 z-50 animate-fade-in">
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                      My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                      My Orders
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-brand-600 dark:text-brand-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100 dark:border-gray-700" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-500 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Sign Up
                </Link>
              </div>
            )}

          
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-slide-up">
            <Link to="/" className="block px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/menu" className="block px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl" onClick={() => setMenuOpen(false)}>Menu</Link>
            {isAuthenticated && <Link to="/orders" className="block px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl" onClick={() => setMenuOpen(false)}>Orders</Link>}
          </div>
        )}
      </div>

      
      {dropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />}
    </nav>
  );
}
