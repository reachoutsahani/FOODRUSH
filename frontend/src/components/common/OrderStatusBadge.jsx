
const statusConfig = {
  placed:            { label: 'Order Placed',       color: 'bg-blue-100 text-blue-700',    icon: '📋' },
  confirmed:         { label: 'Confirmed',           color: 'bg-indigo-100 text-indigo-700', icon: '✅' },
  preparing:         { label: 'Preparing',           color: 'bg-amber-100 text-amber-700',  icon: '👨‍🍳' },
  out_for_delivery:  { label: 'Out for Delivery',    color: 'bg-purple-100 text-purple-700', icon: '🛵' },
  delivered:         { label: 'Delivered',           color: 'bg-green-100 text-green-700',  icon: '🎉' },
  cancelled:         { label: 'Cancelled',           color: 'bg-red-100 text-red-700',      icon: '❌' },
};

export function OrderStatusBadge({ status }) {
  const cfg = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: '•' };
  return (
    <span className={`badge ${cfg.color} gap-1`}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}


const steps = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

export function OrderStepper({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-red-500 font-medium">
        <span>❌</span> Order Cancelled
      </div>
    );
  }

  const currentIdx = steps.indexOf(status);

  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, idx) => {
        const cfg = statusConfig[step];
        const isDone = idx <= currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
      
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-500
                ${isDone
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}
                ${isCurrent ? 'ring-4 ring-brand-200 dark:ring-brand-800' : ''}
              `}>
                {isDone ? (isCurrent ? cfg.icon : '✓') : <span className="text-xs">{idx + 1}</span>}
              </div>
              <span className={`text-xs font-medium hidden sm:block text-center leading-tight max-w-[70px]
                ${isDone ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`}>
                {cfg.label}
              </span>
            </div>
          
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-1 rounded-full transition-all duration-700
                ${idx < currentIdx ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
