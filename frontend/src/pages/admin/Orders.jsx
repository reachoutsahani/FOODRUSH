import { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
const TRANSITIONS = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [], cancelled: [],
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await orderAPI.getAll({ status: filterStatus, page, limit: 15 });
      setOrders(data.orders);
      setTotalPages(data.totalPages);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filterStatus, page]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const { data } = await orderAPI.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o._id === orderId ? data.order : o));
      toast.success(`Order status → ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setFilterStatus(''); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${!filterStatus ? 'bg-brand-500 text-white' : 'btn-secondary'}`}>
            All
          </button>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all capitalize ${filterStatus === s ? 'bg-brand-500 text-white' : 'btn-secondary'}`}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div className="card overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    {['Order ID', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Date', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {orders.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order._id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 dark:text-gray-100">{order.user?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{order.user?.phone || order.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">₹{order.totalAmount}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {(TRANSITIONS[order.status] || []).map(nextStatus => (
                            <button
                              key={nextStatus}
                              onClick={() => handleStatusUpdate(order._id, nextStatus)}
                              disabled={updating === order._id}
                              className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-colors capitalize disabled:opacity-50"
                            >
                              {nextStatus === 'cancelled' ? '❌' : '→'} {nextStatus.replace(/_/g, ' ')}
                            </button>
                          ))}
                          {TRANSITIONS[order.status]?.length === 0 && (
                            <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <div className="text-center py-12 text-gray-400">No orders found</div>}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary text-sm disabled:opacity-40">← Prev</button>
              <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-300">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="btn-secondary text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
