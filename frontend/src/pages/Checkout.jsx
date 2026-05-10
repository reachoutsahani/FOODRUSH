
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, paymentAPI } from '../services/api';
import toast from 'react-hot-toast';

const DELIVERY_FEE = 40;

export default function Checkout() {
  const { cartItems, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const deliveryFee = total >= 500 ? 0 : DELIVERY_FEE;
  const tax = Math.round(total * 0.05);
  const grandTotal = total + deliveryFee + tax;

  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
  });
  const [instructions, setInstructions] = useState('');
  const [errors, setErrors] = useState({});

  const validateAddress = () => {
    const e = {};
    if (!address.name) e.name = 'Name required';
    if (!address.phone || address.phone.length < 10) e.phone = 'Valid phone required';
    if (!address.street) e.street = 'Street address required';
    if (!address.city) e.city = 'City required';
    if (!address.state) e.state = 'State required';
    if (!address.pincode || address.pincode.length !== 6) e.pincode = 'Valid 6-digit pincode required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateAddress()) setStep(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(({ food, quantity }) => ({ food: food._id, quantity })),
        deliveryAddress: address,
        instructions,
        paymentMethod: 'razorpay',
      };
      const { data } = await orderAPI.place(orderData);
      setPlacedOrder(data.order);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  
  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data } = await paymentAPI.createOrder(placedOrder._id);

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'FoodRush',
        description: `Order #${placedOrder._id}`,
        image: '/favicon.svg',
        order_id: data.razorpayOrderId,

        handler: async (response) => {
          try {
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: placedOrder._id,
            };
            <button
  onClick={async () => {
    await paymentAPI.cod(placedOrder._id);
    toast.success('Order placed with COD ✅');
    clearCart();
    navigate(`/orders/${placedOrder._id}`);
  }}
  className="w-full py-3 mt-3 border border-gray-300 rounded-xl hover:bg-gray-50"
>
  💵 Cash on Delivery
</button>
            await paymentAPI.verify(verifyData);
            toast.success('Payment successful! 🎉');
            clearCart();
            navigate(`/orders/${placedOrder._id}`);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
          
        },
        

        prefill: {
          name: address.name,
          contact: address.phone,
          email: user?.email,
        },

        theme: { color: '#f97316' }, 

        modal: {
          ondismiss: () => {
            toast('Payment cancelled. Your order is saved — you can pay later.', { icon: 'ℹ️' });
            navigate(`/orders/${placedOrder._id}`);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !placedOrder) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Checkout</h1>

      <div className="flex items-center gap-0 mb-8">
        {['Delivery Address', 'Review Order', 'Payment'].map((label, idx) => {
          const s = idx + 1;
          const isDone = step > s;
          const isCurrent = step === s;
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${isDone ? 'bg-green-500 text-white' : isCurrent ? 'bg-brand-500 text-white ring-4 ring-brand-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                  {isDone ? '✓' : s}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${isCurrent ? 'text-brand-500' : 'text-gray-400'}`}>{label}</span>
              </div>
              {idx < 2 && <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">

          {step === 1 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-5">📍 Delivery Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'name', label: 'Full Name', placeholder: 'John Doe', col: 1 },
                  { id: 'phone', label: 'Phone Number', placeholder: '9876543210', col: 1 },
                  { id: 'street', label: 'Street Address', placeholder: '123 Main Street, Apt 4B', col: 2 },
                  { id: 'city', label: 'City', placeholder: 'Mumbai', col: 1 },
                  { id: 'state', label: 'State', placeholder: 'Maharashtra', col: 1 },
                  { id: 'pincode', label: 'Pincode', placeholder: '400001', col: 1 },
                ].map(f => (
                  <div key={f.id} className={f.col === 2 ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                    <input
                      type="text"
                      value={address[f.id]}
                      onChange={e => setAddress({ ...address, [f.id]: e.target.value })}
                      placeholder={f.placeholder}
                      className={`input-field ${errors[f.id] ? 'border-red-400' : ''}`}
                    />
                    {errors[f.id] && <p className="text-red-500 text-xs mt-1">{errors[f.id]}</p>}
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Special Instructions (optional)
                  </label>
                  <textarea
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    placeholder="e.g. Ring bell twice, leave at door..."
                    className="input-field resize-none"
                    rows={2}
                  />
                </div>
              </div>
              <button onClick={handleNext} className="btn-primary w-full py-3 mt-5">
                Continue to Review →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">📋 Review Order</h2>

              <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-3 mb-4 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{address.name} · {address.phone}</p>
                    <p className="text-gray-500 dark:text-gray-400">{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-brand-500 text-xs hover:underline">Edit</button>
                </div>
              </div>

              <div className="space-y-3">
                {cartItems.map(({ food, quantity, subtotal }) => (
                  <div key={food._id} className="flex items-center gap-3">
                    <img src={food.image} alt={food.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800 dark:text-gray-100">{food.name}</p>
                      <p className="text-xs text-gray-400">₹{food.price} × {quantity}</p>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">₹{subtotal}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1 py-3">
                  {loading ? 'Placing...' : 'Place Order & Pay →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="card p-8 text-center animate-fade-in">
              <div className="text-6xl mb-4">💳</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to Pay!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                Order placed successfully. Complete payment to confirm.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Order ID: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{placedOrder?._id}</code>
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
                <div className="flex justify-between"><span>Amount</span><span className="font-bold text-xl text-gray-900 dark:text-white">₹{grandTotal}</span></div>
                <div className="flex justify-between text-gray-500"><span>Payment via</span><span>Razorpay (UPI/Card/Net Banking)</span></div>
              </div>
              <button onClick={handlePayment} disabled={loading} className="btn-primary w-full py-4 text-lg">
                {loading ? '⏳ Initializing...' : '🔐 Pay ₹' + grandTotal + ' Securely'}
              </button>
              <p className="text-xs text-gray-400 mt-3">🔒 256-bit SSL encrypted · Powered by Razorpay</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Bill Details</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Item total</span><span>₹{total}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-green-500' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>GST (5%)</span><span>₹{tax}</span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2.5 flex justify-between font-bold text-base text-gray-900 dark:text-white">
                <span>Grand Total</span><span>₹{grandTotal}</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-400 text-center">
              🎉 You're saving ₹{deliveryFee === 0 ? DELIVERY_FEE : 0} on delivery!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
