import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { ShoppingBag, DollarSign, MessageSquare, TrendingUp, Database, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { seedDemoData } from '../../utils/seedData';
import toast from 'react-hot-toast';

interface Stats {
  todayOrders: number;
  todayRevenue: number;
  pendingComments: number;
  totalOrders: number;
  unreadMessages: number;
}

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats>({
    todayOrders: 0,
    todayRevenue: 0,
    pendingComments: 0,
    totalOrders: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);

      // Get today's orders
      const ordersQuery = query(
        collection(db, 'orders'),
        where('createdAt', '>=', todayTimestamp)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      
      let todayRevenue = 0;
      ordersSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        todayRevenue += data.total || 0;
      });

      // Get total orders
      const allOrdersSnapshot = await getDocs(collection(db, 'orders'));

      // Get pending comments
      const commentsQuery = query(
        collection(db, 'comments'),
        where('approved', '==', false)
      );
      const commentsSnapshot = await getDocs(commentsQuery);

      // Get unread messages
      const messagesQuery = query(
        collection(db, 'messages'),
        where('read', '==', false)
      );
      const messagesSnapshot = await getDocs(messagesQuery);

      setStats({
        todayOrders: ordersSnapshot.size,
        todayRevenue,
        pendingComments: commentsSnapshot.size,
        totalOrders: allOrdersSnapshot.size,
        unreadMessages: messagesSnapshot.size,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'طلبات اليوم',
      value: stats.todayOrders,
      icon: ShoppingBag,
      color: 'bg-blue-500',
    },
    {
      title: 'إيرادات اليوم',
      value: `${stats.todayRevenue.toFixed(2)} د.ل`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'رسائل جديدة',
      value: stats.unreadMessages,
      icon: Mail,
      color: 'bg-purple-500',
    },
    {
      title: 'تقييمات للمراجعة',
      value: stats.pendingComments,
      icon: MessageSquare,
      color: 'bg-orange-500',
    },
    {
      title: 'إجمالي الطلبات',
      value: stats.totalOrders,
      icon: TrendingUp,
      color: 'bg-pink-500',
    },
  ];

  const handleSeedData = async () => {
    if (!confirm('هل تريد إضافة بيانات تجريبية؟ (4 فئات + 8 منتجات)')) return;
    
    setSeeding(true);
    const result = await seedDemoData();
    
    if (result.success) {
      toast.success(result.message);
      fetchStats(); // Refresh stats
    } else {
      toast.error(result.message);
    }
    
    setSeeding(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-6">
            <div className="h-24 skeleton rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">نظرة عامة</h2>
        <button
          onClick={handleSeedData}
          disabled={seeding}
          className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <Database className="w-4 h-4" />
          {seeding ? 'جاري الإضافة...' : 'إضافة بيانات تجريبية'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${card.color} text-white rounded-xl`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
              <p className="text-2xl font-bold">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 card p-6">
        <h3 className="text-xl font-bold mb-4">مرحباً بك في لوحة التحكم</h3>
        <p className="text-gray-600 mb-4">
          يمكنك من هنا إدارة جميع جوانب مقهى Refresh بسهولة وفعالية.
        </p>
        <ul className="space-y-2 text-gray-600">
          <li>• إدارة الفئات والمنتجات</li>
          <li>• متابعة الطلبات الواردة</li>
          <li>• مراجعة والرد على التعليقات</li>
          <li>• تخصيص إعدادات المتجر</li>
        </ul>
      </div>
    </div>
  );
}

