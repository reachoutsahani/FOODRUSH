import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OrderStatusBadge, OrderStepper } from '../components/common/OrderStatusBadge';
import Spinner from '../components/common/Spinner';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    // Fetch order
    orderAPI.getById(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));

    const socket = io(SOCKET_URL);
    socket.emit('join_order_room', id);

    socket.on('order_status_update', ({ orderId, status }) => {
      if (orderId === id) {
        setOrder(prev => prev ? { ...prev, status } : prev);
        const messages = {
          confirmed: '✅ Your order has been confirmed!',
          preparing: '👨‍🍳 Your food is being prepared!',
          out_for_delivery: '🛵 Your order is on the way!',
          delivered: '🎉 Order delivered! Enjoy your meal!',
        };
        if (messages[status]) toast.success(messages[status]);
      }
    });

    socket.on('payment_success', ({ orderId }) => {
      if (orderId === id) {
        setOrder(prev => prev ? { ...prev, paymentStatus: 'paid', status: 'confirmed' } : prev);
        toast.success('Payment confirmed!');
      }
    });

    return () => socket.disconnect();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await orderAPI.cancel(id, 'Cancelled by user');
      setOrder(data.order);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleRetryPayment = async () => {
    try {
      const { data } = await paymentAPI.createOrder(id);
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'FoodRush',
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          await paymentAPI.verify({ ...response, orderId: id });
          setOrder(prev => prev ? { ...prev, paymentStatus: 'paid', status: 'confirmed' } : prev);
          toast.success('Payment successful! 🎉');
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#f97316' },
      };
      new window.Razorpay(options).open();
    } catch {
      toast.error('Failed to initialize payment');
    }
  };

  if (loading) return <Spinner />;
  if (!order) return null;

  const canCancel = ['placed', 'confirmed'].includes(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => navigate('/orders')} className="text-sm text-brand-500 hover:underline mb-1 flex items-center gap-1">
            ← Back to Orders
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-400">
            {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.status !== 'cancelled' && (
        <div className="card p-6 mb-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-5">Order Tracking</h2>
          <OrderStepper status={order.status} />
          {order.status === 'out_for_delivery' && (
            <div className="mt-4 flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-sm text-purple-700 dark:text-purple-300">
              <span className="animate-bounce">🛵</span>
              Your order is on the way! ETA: ~20-30 minutes
            </div>
          )}
        </div>
      )}

      {order.paymentStatus === 'pending' && order.status !== 'cancelled' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">⏳ Payment Pending</p>
            <p className="text-sm text-amber-600 dark:text-amber-300">Complete payment to confirm your order</p>
          </div>
          <button onClick={handleRetryPayment} className="btn-primary text-sm py-2 px-4 shrink-0">
            Pay Now
          </button>
        </div>
      )}

      {order.status === 'cancelled' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-4 mb-5">
          <p className="font-medium text-red-700 dark:text-red-300">❌ Order Cancelled</p>
          {order.cancelReason && <p className="text-sm text-red-500 mt-1">Reason: {order.cancelReason}</p>}
        </div>
      )}

      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Order Items</h2>
        <div className="space-y-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-gray-100">{item.name}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
              </div>
              <span className="font-semibold text-gray-800 dark:text-gray-100">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500"><span>Items total</span><span>₹{order.itemsTotal}</span></div>
          <div className="flex justify-between text-gray-500"><span>Delivery</span><span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span></div>
          <div className="flex justify-between text-gray-500"><span>Tax</span><span>₹{order.tax}</span></div>
          <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-700">
            <span>Total</span><span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">📍 Delivery Address</h2>
        <p className="font-medium text-gray-700 dark:text-gray-200">{order.deliveryAddress.name}</p>
        <p className="text-sm text-gray-500">{order.deliveryAddress.phone}</p>
        <p className="text-sm text-gray-500 mt-1">
          {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
        </p>
        {order.instructions && (
          <p className="text-sm text-gray-400 mt-2 italic">📝 {order.instructions}</p>
        )}
      </div>

      {/* Cancel button */}
      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="w-full py-3 border-2 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors"
        >
          {cancelling ? 'Cancelling...' : 'Cancel Order'}
        </button>
      )}
    </div>
  );
}
