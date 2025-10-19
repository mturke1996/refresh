import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, Truck, AlertCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { OrderType, OrderCustomer } from '../types';
import { formatPrice, calculateDiscountedPrice } from '../utils/formatters';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { notifyNewOrder } from '../utils/telegramNotifications';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [customer, setCustomer] = useState<OrderCustomer>({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'general');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const deliveryFee = orderType === 'delivery' ? (settings.deliveryFee || 0) : 0;
  const subtotal = getTotal();
  const total = subtotal + deliveryFee;
  const minOrderAmount = settings.minOrderAmount || 0;

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      toast.error('السلة فارغة');
      return;
    }

    if (!customer.name || !customer.phone) {
      toast.error('الرجاء إدخال الاسم ورقم الهاتف');
      return;
    }

    if (orderType === 'delivery' && !customer.address) {
      toast.error('الرجاء إدخال العنوان للتوصيل');
      return;
    }

    // Check minimum order amount
    if (minOrderAmount > 0 && subtotal < minOrderAmount) {
      toast.error(`الحد الأدنى للطلب هو ${formatPrice(minOrderAmount)}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order in Firestore
      const orderData = {
        items: items.map(({ item, quantity }) => ({
          itemId: item.id,
          name: item.name,
          price: calculateDiscountedPrice(item.price, item.discountPercent),
          quantity,
        })),
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        type: orderType,
        customer,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      // Send notification to Telegram (Free Plan - Direct API)
      try {
        await notifyNewOrder(orderData, orderRef.id);
      } catch (telegramError) {
        console.error('Telegram notification failed:', telegramError);
        // Don't fail the order if Telegram fails
      }

      toast.success('تم إرسال الطلب بنجاح!');
      clearCart();
      setCustomer({ name: '', phone: '', address: '', notes: '' });
      onClose();
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">سلة المشتريات</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">السلة فارغة</p>
                </div>
              ) : (
                <>
                  {items.map(({ item, quantity }) => {
                    const price = calculateDiscountedPrice(item.price, item.discountPercent);
                    return (
                      <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-gray-600">{formatPrice(price)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, quantity - 1)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, quantity + 1)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="mr-auto p-1 hover:bg-red-100 text-red-500 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Order Type */}
                  <div className="pt-4 border-t">
                    <label className="block text-sm font-medium mb-2">نوع الطلب</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setOrderType('dine-in')}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          orderType === 'dine-in'
                            ? 'bg-black text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        في المقهى
                      </button>
                      <button
                        onClick={() => setOrderType('pickup')}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          orderType === 'pickup'
                            ? 'bg-black text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        استلام
                      </button>
                      <button
                        onClick={() => setOrderType('delivery')}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          orderType === 'delivery'
                            ? 'bg-black text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        توصيل
                      </button>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="الاسم *"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="input"
                    />
                    <input
                      type="tel"
                      placeholder="رقم الهاتف *"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="input"
                    />
                    {orderType === 'delivery' && (
                      <input
                        type="text"
                        placeholder="العنوان *"
                        value={customer.address}
                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                        className="input"
                      />
                    )}
                    <textarea
                      placeholder="ملاحظات (اختياري)"
                      value={customer.notes}
                      onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                      className="input resize-none"
                      rows={2}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">المجموع الفرعي</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                {/* Delivery Fee */}
                {orderType === 'delivery' && deliveryFee > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      رسوم التوصيل
                    </span>
                    <span className="font-medium">{formatPrice(deliveryFee)}</span>
                  </div>
                )}

                {/* Minimum Order Warning */}
                {minOrderAmount > 0 && subtotal < minOrderAmount && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <p className="text-xs text-yellow-800">
                      الحد الأدنى للطلب: {formatPrice(minOrderAmount)}
                      <br />
                      <span className="font-medium">
                        أضف {formatPrice(minOrderAmount - subtotal)} للمتابعة
                      </span>
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between text-xl font-bold pt-3 border-t">
                  <span>الإجمالي</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || (minOrderAmount > 0 && subtotal < minOrderAmount)}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

