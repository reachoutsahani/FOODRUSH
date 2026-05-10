
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              <span className="text-2xl">🍔</span>
              <span>FoodRush</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">
              Order delicious food from the best restaurants near you. Fast delivery, fresh food, happy you.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-brand-400 transition-colors">Home</Link></li>
              <li><Link to="/menu" className="hover:text-brand-400 transition-colors">Menu</Link></li>
              <li><Link to="/orders" className="hover:text-brand-400 transition-colors">My Orders</Link></li>
              <li><Link to="/profile" className="hover:text-brand-400 transition-colors">Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-400">📞 87072-FOOD-RUSH</span></li>
              <li><span className="text-gray-400">✉️ help@foodrush.in</span></li>
              <li><span className="text-gray-400">🕐 24/7 Support</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} FoodRush. Built by Siddharth Pathak
        </div>
      </div>
    </footer>
  );
}
