import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { foodAPI } from '../services/api';
import FoodCard from '../components/common/FoodCard';
import Spinner from '../components/common/Spinner';

const CATEGORIES = [
  { name: 'Burgers', emoji: '🍔' }, { name: 'Pizza', emoji: '🍕' },
  { name: 'Biryani', emoji: '🍚' }, { name: 'Chinese', emoji: '🍜' },
  { name: 'South Indian', emoji: '🫓' }, { name: 'Desserts', emoji: '🍰' },
  { name: 'Beverages', emoji: '🥤' }, { name: 'Rolls', emoji: '🌯' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    foodAPI.getFeatured()
      .then(({ data }) => setFeatured(data.foods))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/menu?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div>
      <section className="relative bg-gradient-to-br from-brand-500 via-brand-600 to-orange-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/10 rounded-full blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium mb-4">
              <span className="animate-pulse-dot w-2 h-2 bg-green-400 rounded-full" />
              Fast delivery · Fresh food
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
              Hungry? <br />
              <span className="text-yellow-300">We've got you</span> covered 🍔
            </h1>
            <p className="text-lg text-orange-100 mb-8 max-w-lg">
              Order from hundreds of restaurants. Free delivery on your first order!
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for food, restaurants..."
                className="flex-1 px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
              <button type="submit" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-6 py-3 rounded-xl transition-colors">
                Search
              </button>
            </form>
          </div>

          {/* Hero food emoji art */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 text-6xl select-none">
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>🍕</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🌮</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🍜</span>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-center gap-8">
          {[
            { icon: '🏪', label: '500+ Restaurants' },
            { icon: '⚡', label: '30 min avg delivery' },
            { icon: '🎯', label: '50,000+ Orders' },
            { icon: '⭐', label: '4.8 Rating' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
              <span className="text-lg">{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What are you craving?</h2>
            <Link to="/menu" className="text-sm text-brand-500 font-medium hover:underline">See all →</Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {CATEGORIES.map(({ name, emoji }) => (
              <Link
                key={name}
                to={`/menu?category=${encodeURIComponent(name)}`}
                className="flex flex-col items-center gap-2 p-3 card hover:shadow-md hover:border-brand-200 dark:hover:border-brand-700 transition-all duration-200 group cursor-pointer"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{emoji}</span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 text-center leading-tight">{name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">⭐ Featured Picks</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Handpicked favourites just for you</p>
            </div>
            <Link to="/menu" className="text-sm text-brand-500 font-medium hover:underline">View all →</Link>
          </div>

          {loading ? (
            <Spinner />
          ) : featured.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No featured items yet</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featured.map(food => <FoodCard key={food._id} food={food} />)}
            </div>
          )}
        </section>

        <section className="bg-gradient-to-r from-brand-500 to-orange-600 rounded-2xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold mb-1">First order? Get ₹50 off! 🎉</h3>
            <p className="text-orange-100 text-sm">Use code <strong>FIRST50</strong> at checkout</p>
          </div>
          <Link to="/menu" className="bg-white text-brand-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors shrink-0">
            Order Now
          </Link>
        </section>
      </div>
    </div>
  );
}
