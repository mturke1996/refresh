import { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  Home,
  Layers,
  Grid,
  ShoppingBag,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Tag,
  Mail,
  Briefcase,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import admin pages
import DashboardHome from './DashboardHome';
import CategoriesManagement from './CategoriesManagement';
import ItemsManagement from './ItemsManagement';
import OrdersManagement from './OrdersManagement';
import CommentsManagement from './CommentsManagement';
import SettingsManagement from './SettingsManagement';
import OffersManagement from './OffersManagement';
import MessagesManagement from './MessagesManagement';
import JobsManagement from './JobsManagement';
import JobApplicationsManagement from './JobApplicationsManagement';

const menuItems = [
  { path: '/admin/dashboard', icon: Home, label: 'الرئيسية' },
  { path: '/admin/categories', icon: Layers, label: 'الفئات' },
  { path: '/admin/items', icon: Grid, label: 'المنتجات' },
  { path: '/admin/offers', icon: Tag, label: 'العروض' },
  { path: '/admin/orders', icon: ShoppingBag, label: 'الطلبات' },
  { path: '/admin/messages', icon: Mail, label: 'الرسائل' },
  { path: '/admin/comments', icon: MessageSquare, label: 'التقييمات' },
  { path: '/admin/jobs', icon: Briefcase, label: 'الوظائف' },
  { path: '/admin/job-applications', icon: Users, label: 'طلبات التوظيف' },
  { path: '/admin/settings', icon: Settings, label: 'الإعدادات' },
];

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Top Bar - Enhanced */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16 sm:h-18">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors touch-manipulation"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl">
                R
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold">Refresh</h1>
                <p className="text-xs text-gray-500">لوحة التحكم</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-black to-gray-700 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 max-w-[150px] truncate">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm hover:bg-red-50 text-red-600 rounded-xl transition-colors touch-manipulation group"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-medium">خروج</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Enhanced */}
        <AnimatePresence>
          {(isSidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed lg:sticky top-16 sm:top-18 left-0 h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] w-72 bg-white/80 backdrop-blur-md border-r border-gray-200 z-20 overflow-y-auto shadow-lg lg:shadow-none"
            >
              <nav className="p-4 sm:p-5 space-y-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all touch-manipulation ${
                        isActive
                          ? 'bg-gradient-to-r from-black to-gray-800 text-white shadow-lg scale-105'
                          : 'text-gray-700 hover:bg-gray-100 hover:scale-102 active:scale-98'
                      }`}
                    >
                      <div
                        className={`${
                          isActive ? '' : 'group-hover:scale-110 transition-transform'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-base">{item.label}</span>
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="w-1.5 h-8 bg-white rounded-full"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content - Enhanced */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="categories" element={<CategoriesManagement />} />
              <Route path="items" element={<ItemsManagement />} />
              <Route path="offers" element={<OffersManagement />} />
              <Route path="orders" element={<OrdersManagement />} />
              <Route path="messages" element={<MessagesManagement />} />
              <Route path="comments" element={<CommentsManagement />} />
              <Route path="jobs" element={<JobsManagement />} />
              <Route path="job-applications" element={<JobApplicationsManagement />} />
              <Route path="settings" element={<SettingsManagement />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </motion.div>
        </main>
      </div>

      {/* Backdrop for mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
