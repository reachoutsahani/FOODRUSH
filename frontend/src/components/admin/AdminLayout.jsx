
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/foods', label: 'Food Items', icon: '🍔' },
  { to: '/admin/orders', label: 'Orders', icon: '📦' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 overflow-hidden">
    
      <aside className="w-60 bg-gray-900 text-white flex flex-col shrink-0">
       
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl">🍔</span>
            <span>FoodRush</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
        </div>

    
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

       
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span>🚪</span> Logout
          </button>
          <NavLink to="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <span>🏠</span> View Site
          </NavLink>
        </div>
      </aside>

     
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
