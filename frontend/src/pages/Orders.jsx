import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { OrderStatusBadge } from '../components/common/OrderStatusBadge';
import Spinner from '../components/common/Spinner';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getMyOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-7xl block mb-4">📦</span>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No orders yet</h3>
          <p className="text-gray-400 mb-6">You haven't placed any orders. Let's fix that!</p>
          <Link to="/menu" className="btn-primary">Browse Menu</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="card p-5 hover:shadow-md transition-shadow animate-fade-in">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium', timeStyle: 'short'
                    })}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Items preview */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex -space-x-2">
                  {order.items.slice(0, 3).map((item, i) => (
                    <img key={i} src={item.image} alt={item.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-800" />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-500">Total: </span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{order.totalAmount}</span>
                  <span className={`ml-2 text-xs font-medium ${order.paymentStatus === 'paid' ? 'text-green-500' : 'text-amber-500'}`}>
                    ({order.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'})
                  </span>
                </div>
                <Link to={`/orders/${order._id}`} className="btn-outline text-sm py-1.5 px-4">
                  Track Order →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
