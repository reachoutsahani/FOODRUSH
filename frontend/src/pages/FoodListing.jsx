import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { foodAPI } from '../services/api';
import FoodCard from '../components/common/FoodCard';
import Spinner from '../components/common/Spinner';

const CATEGORIES = ['All', 'Burgers', 'Pizza', 'Biryani', 'Chinese', 'South Indian',
  'North Indian', 'Desserts', 'Beverages', 'Salads', 'Rolls', 'Pasta', 'Sandwiches', 'Snacks', 'Seafood'];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Top Rated' },
];

export default function FoodListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state — initialize from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [isVeg, setIsVeg] = useState(false);
  const [sort, setSort] = useState('-createdAt');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort,
        ...(search && { search }),
        ...(category !== 'All' && { category }),
        ...(isVeg && { isVeg: true }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
      };
      const { data } = await foodAPI.getAll(params);
      setFoods(data.foods);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, isVeg, sort, minPrice, maxPrice, page]);

  useEffect(() => { fetchFoods(); }, [fetchFoods]);

  // Sync category from URL on first load
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFoods();
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch(''); setCategory('All'); setIsVeg(false);
    setSort('-createdAt'); setMinPrice(''); setMaxPrice(''); setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Our Menu</h1>
        <p className="text-gray-500 dark:text-gray-400">{total} items available</p>
      </div>

      {/* ── Search Bar ── */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search food, restaurants..."
            className="input-field pl-10"
          />
        </div>
        <button type="submit" className="btn-primary px-6">Search</button>
        <button type="button" onClick={resetFilters} className="btn-secondary px-4 text-sm">Reset</button>
      </form>

      <div className="flex gap-6">
        {/* ── Sidebar Filters ── */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="card p-4 sticky top-24 space-y-6">
            {/* Veg toggle */}
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 text-sm">Preference</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => { setIsVeg(!isVeg); setPage(1); }}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isVeg ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isVeg ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Veg Only 🟢</span>
              </label>
            </div>

            {/* Price range */}
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 text-sm">Price Range (₹)</h3>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="input-field py-2 text-sm" />
                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="input-field py-2 text-sm" />
              </div>
              <button onClick={() => { setPage(1); fetchFoods(); }} className="btn-outline w-full mt-2 text-sm py-1.5">Apply</button>
            </div>

            {/* Sort */}
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 text-sm">Sort By</h3>
              <div className="space-y-1.5">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSort(opt.value); setPage(1); }}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${sort === opt.value ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0">
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-brand-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Food grid */}
          {loading ? (
            <Spinner />
          ) : foods.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl">😔</span>
              <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-700 dark:text-gray-300">No items found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
              <button onClick={resetFilters} className="btn-primary mt-4">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {foods.map(food => <FoodCard key={food._id} food={food} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${p === page ? 'bg-brand-500 text-white' : 'btn-secondary'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
