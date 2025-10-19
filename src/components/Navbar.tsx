import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Menu,
  X,
  User,
  Home,
  UtensilsCrossed,
  Star,
  Phone,
  Briefcase,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface NavbarProps {
  onCartClick: () => void;
}

export default function Navbar({ onCartClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1 cursor-pointer group px-2 py-1 rounded-lg hover:bg-gray-50 transition-all duration-200"
            onClick={() => scrollToSection('hero')}
          >
            {/* Logo */}
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.shopName || 'Refresh'}
                className="h-10 sm:h-12 w-auto object-contain"
              />
            ) : (
              <span className="text-3xl sm:text-4xl font-black text-gray-900 group-hover:text-black transition-colors tracking-tight">
                {settings?.shopNameEn || 'Refresh'}
              </span>
            )}
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <button
              onClick={() => scrollToSection('hero')}
              className="flex items-center gap-2 text-sm font-medium hover:text-gray-600 transition-colors py-2 group"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              الرئيسية
            </button>
            <button
              onClick={() => scrollToSection('menu')}
              className="flex items-center gap-2 text-sm font-medium hover:text-gray-600 transition-colors py-2 group"
            >
              <UtensilsCrossed className="w-4 h-4 group-hover:scale-110 transition-transform" />
              القائمة
            </button>
            <button
              onClick={() => scrollToSection('featured')}
              className="flex items-center gap-2 text-sm font-medium hover:text-gray-600 transition-colors py-2 group"
            >
              <Star className="w-4 h-4 group-hover:scale-110 transition-transform" />
              العروض
            </button>
            <button
              onClick={() => scrollToSection('reviews')}
              className="flex items-center gap-2 text-sm font-medium hover:text-gray-600 transition-colors py-2 group"
            >
              <Star className="w-4 h-4 group-hover:scale-110 transition-transform" />
              التقييمات
            </button>
            <button
              onClick={() => scrollToSection('jobs')}
              className="flex items-center gap-2 text-sm font-medium hover:text-gray-600 transition-colors py-2 group"
            >
              <Briefcase className="w-4 h-4 group-hover:scale-110 transition-transform" />
              الوظائف
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="flex items-center gap-2 text-sm font-medium hover:text-gray-600 transition-colors py-2 group"
            >
              <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
              اتصل بنا
            </button>
          </div>

          {/* Cart, Login & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Login Button */}
            <button
              onClick={() => navigate(user ? '/admin/dashboard' : '/admin/login')}
              className="hidden sm:flex items-center gap-2 px-3 py-2 hover:bg-black/5 rounded-xl transition-colors touch-manipulation group"
              aria-label={user ? 'لوحة التحكم' : 'تسجيل الدخول'}
            >
              <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{user ? 'الإدارة' : 'دخول'}</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2 sm:p-2.5 hover:bg-black/5 rounded-xl transition-colors touch-manipulation group"
              aria-label="عربة التسوق"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center font-medium shadow-lg"
                >
                  {itemCount}
                </motion.span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 sm:p-2.5 hover:bg-black/5 rounded-xl transition-colors touch-manipulation"
              aria-label="القائمة"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-gray-100"
            >
              <div className="py-3 space-y-1">
                <button
                  onClick={() => scrollToSection('hero')}
                  className="flex items-center justify-end gap-3 w-full text-right px-4 py-3 text-base font-medium hover:bg-black/5 rounded-xl transition-colors active:bg-black/10 touch-manipulation group"
                >
                  <span>الرئيسية</span>
                  <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('menu')}
                  className="flex items-center justify-end gap-3 w-full text-right px-4 py-3 text-base font-medium hover:bg-black/5 rounded-xl transition-colors active:bg-black/10 touch-manipulation group"
                >
                  <span>القائمة</span>
                  <UtensilsCrossed className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('featured')}
                  className="flex items-center justify-end gap-3 w-full text-right px-4 py-3 text-base font-medium hover:bg-black/5 rounded-xl transition-colors active:bg-black/10 touch-manipulation group"
                >
                  <span>العروض</span>
                  <Star className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('reviews')}
                  className="flex items-center justify-end gap-3 w-full text-right px-4 py-3 text-base font-medium hover:bg-black/5 rounded-xl transition-colors active:bg-black/10 touch-manipulation group"
                >
                  <span>التقييمات</span>
                  <Star className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('jobs')}
                  className="flex items-center justify-end gap-3 w-full text-right px-4 py-3 text-base font-medium hover:bg-black/5 rounded-xl transition-colors active:bg-black/10 touch-manipulation group"
                >
                  <span>الوظائف</span>
                  <Briefcase className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="flex items-center justify-end gap-3 w-full text-right px-4 py-3 text-base font-medium hover:bg-black/5 rounded-xl transition-colors active:bg-black/10 touch-manipulation group"
                >
                  <span>اتصل بنا</span>
                  <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    navigate(user ? '/admin/dashboard' : '/admin/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-end gap-3 w-full text-right px-4 py-3 text-base font-medium bg-gradient-to-r from-black to-gray-800 text-white rounded-xl transition-colors active:bg-gray-800 touch-manipulation sm:hidden group"
                >
                  <span>{user ? 'لوحة التحكم' : 'تسجيل الدخول'}</span>
                  <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
