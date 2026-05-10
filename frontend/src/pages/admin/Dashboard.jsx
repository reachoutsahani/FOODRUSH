import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import Spinner from '../../components/common/Spinner';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className={`card p-5 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(({ data }) => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon="💰" label="Total Revenue" value={`₹${stats.totalRevenue?.toLocaleString('en-IN')}`} sub="From paid orders" color="border-green-500" />
        <StatCard icon="📦" label="Total Orders" value={stats.totalOrders} sub={`${stats.ordersByStatus?.placed || 0} new today`} color="border-blue-500" />
        <StatCard icon="🍔" label="Food Items" value={stats.totalFoodItems} color="border-brand-500" />
        <StatCard icon="👥" label="Total Users" value={stats.totalUsers} color="border-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {[
              { key: 'placed', label: 'New Orders', icon: '📋', color: 'bg-blue-500' },
              { key: 'confirmed', label: 'Confirmed', icon: '✅', color: 'bg-indigo-500' },
              { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', color: 'bg-amber-500' },
              { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵', color: 'bg-purple-500' },
              { key: 'delivered', label: 'Delivered', icon: '🎉', color: 'bg-green-500' },
            ].map(({ key, label, icon, color }) => {
              const count = stats.ordersByStatus?.[key] || 0;
              const maxCount = Math.max(...Object.values(stats.ordersByStatus || {}), 1);
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-lg w-6">{icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-300">{label}</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-700`}
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-brand-500 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders?.map(order => (
              <div key={order._id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    {order.user?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-400">{order.items?.length} items · ₹{order.totalAmount}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">🏆 Top Selling Items</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {stats.topFoods?.map((food, idx) => (
            <div key={food._id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][idx]}</div>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-100 truncate">{food._id}</p>
              <p className="text-xs text-gray-500 mt-0.5">{food.count} sold</p>
              <p className="text-xs font-semibold text-green-600 dark:text-green-400">₹{food.revenue?.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>

\      {stats.dailyRevenue?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">📈 Revenue (Last 7 Days)</h2>
          <div className="flex items-end gap-2 h-32">
            {stats.dailyRevenue.map(day => {
              const maxRev = Math.max(...stats.dailyRevenue.map(d => d.revenue), 1);
              const heightPct = (day.revenue / maxRev) * 100;
              return (
                <div key={day._id} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full">
                    <div
                      className="bg-brand-500 hover:bg-brand-600 rounded-t-lg transition-all w-full group-hover:opacity-90"
                      style={{ height: `${Math.max(heightPct * 0.9, 4)}px` }}
                      title={`₹${day.revenue}`}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                      ₹{day.revenue}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(day._id).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
