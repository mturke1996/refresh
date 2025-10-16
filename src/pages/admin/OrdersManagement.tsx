import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order } from '../../types';
import { formatDate, formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const statusOptions = [
  { value: 'pending', label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', label: 'مؤكد', color: 'bg-blue-100 text-blue-700' },
  { value: 'preparing', label: 'قيد التحضير', color: 'bg-purple-100 text-purple-700' },
  { value: 'ready', label: 'جاهز', color: 'bg-green-100 text-green-700' },
  { value: 'delivered', label: 'تم التوصيل', color: 'bg-gray-100 text-gray-700' },
  { value: 'cancelled', label: 'ملغي', color: 'bg-red-100 text-red-700' },
];

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Order[];
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('حدث خطأ أثناء جلب الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      toast.success('تم تحديث حالة الطلب');
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('حدث خطأ أثناء تحديث الطلب');
    }
  };

  const getStatusStyle = (status: Order['status']) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option?.color || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: Order['status']) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option?.label || status;
  };

  const getOrderTypeLabel = (type: Order['type']) => {
    const labels = {
      'dine-in': 'داخل المقهى',
      pickup: 'استلام',
      delivery: 'توصيل',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 skeleton rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">إدارة الطلبات</h2>
        <p className="text-gray-600 mt-1">إجمالي الطلبات: {orders.length}</p>
      </div>

      <div className="space-y-4">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Order Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">طلب #{order.id.slice(-6)}</h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100">
                      {getOrderTypeLabel(order.type)}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">العميل:</span> {order.customer.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">الهاتف:</span> {order.customer.phone}
                  </p>
                  {order.customer.address && (
                    <p className="text-sm">
                      <span className="font-medium">العنوان:</span> {order.customer.address}
                    </p>
                  )}
                  {order.customer.notes && (
                    <p className="text-sm">
                      <span className="font-medium">ملاحظات:</span> {order.customer.notes}
                    </p>
                  )}
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2">المنتجات:</h4>
                  <ul className="space-y-1">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="text-sm flex justify-between">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t flex justify-between font-bold">
                    <span>الإجمالي:</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="lg:w-48">
                <label className="block text-sm font-medium mb-2">تحديث الحالة</label>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                  className="input text-sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="card p-12 text-center text-gray-500">
          لا توجد طلبات حتى الآن
        </div>
      )}
    </div>
  );
}

