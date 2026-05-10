import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { foodAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

export default function FoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const cartItem = cartItems.find(i => i.food._id === id);
  const qty = cartItem?.quantity || 0;

  useEffect(() => {
    foodAPI.getById(id)
      .then(({ data }) => setFood(data.food))
      .catch(() => navigate('/menu'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to review'); return; }
    setSubmitting(true);
    try {
      const { data } = await foodAPI.addReview(id, review);
      setFood(data.food);
      setReview({ rating: 5, comment: '' });
      toast.success('Review added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (!food) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="text-brand-500 text-sm hover:underline mb-4 flex items-center gap-1">
        ← Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="relative rounded-2xl overflow-hidden h-64 md:h-auto">
          <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 flex gap-2">
            {food.isVeg ? (
              <span className="badge bg-green-100 text-green-700 border border-green-200">🟢 Veg</span>
            ) : (
              <span className="badge bg-red-100 text-red-700 border border-red-200">🔴 Non-veg</span>
            )}
            {food.isFeatured && <span className="badge bg-amber-100 text-amber-700">⭐ Featured</span>}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{food.category}</span>
            {food.tags?.map(tag => (
              <span key={tag} className="badge bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">{tag}</span>
            ))}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{food.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-3">{food.restaurant}</p>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">{food.description}</p>

          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
            <span>🕐 {food.preparationTime} min</span>
            {food.rating > 0 && (
              <span className="flex items-center gap-1">
                ⭐ {food.rating} <span className="text-gray-400">({food.numReviews} reviews)</span>
              </span>
            )}
          </div>

          <div className="mt-auto">
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">₹{food.price}</p>

            {!food.isAvailable ? (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl p-3 text-center font-medium">
                Currently Unavailable
              </div>
            ) : qty === 0 ? (
              <button onClick={() => addToCart(food)} className="btn-primary w-full py-3 text-base">
                Add to Cart
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 bg-brand-500 rounded-xl px-4 py-2.5 flex-1 justify-center">
                  <button onClick={() => removeFromCart(food._id)} className="text-white font-bold text-xl hover:opacity-80">−</button>
                  <span className="text-white font-bold text-lg">{qty}</span>
                  <button onClick={() => addToCart(food)} className="text-white font-bold text-xl hover:opacity-80">+</button>
                </div>
                <button onClick={() => navigate('/cart')} className="btn-outline py-2.5 px-5">View Cart</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
          Customer Reviews {food.numReviews > 0 && `(${food.numReviews})`}
        </h2>

        {isAuthenticated && (
          <form onSubmit={handleReviewSubmit} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-3">Write a Review</h3>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => setReview({ ...review, rating: star })}
                  className={`text-2xl transition-transform hover:scale-110 ${star <= review.rating ? 'text-amber-400' : 'text-gray-300'}`}>
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={review.comment}
              onChange={e => setReview({ ...review, comment: e.target.value })}
              placeholder="Share your experience..."
              className="input-field resize-none mb-3"
              rows={2}
            />
            <button type="submit" disabled={submitting} className="btn-primary text-sm py-2 px-5">
              {submitting ? 'Posting...' : 'Post Review'}
            </button>
          </form>
        )}

        {food.reviews?.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {food.reviews?.map((r, idx) => (
              <div key={idx} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-800 dark:text-gray-100">{r.name}</span>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={s <= r.rating ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600'}>★</span>
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
