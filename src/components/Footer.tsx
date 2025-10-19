import { motion } from 'framer-motion';
import { Coffee, Phone, Mail, MapPin, Clock, Instagram, Facebook, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Custom SVG icons for Snapchat and TikTok
const SnapchatIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.498.011.047.031.097.059.145.184.314.421.555.665.788.288.276.591.553.776.932.283.601.157 1.279-.351 1.804-.519.537-1.327.851-2.13.851-.137 0-.272-.014-.407-.036-.002.014-.004.028-.004.042 0 .075.016.15.05.225.049.11.125.222.22.334.16.19.357.384.555.577l.019.018c.276.263.545.516.754.816.28.403.458.895.458 1.412 0 .287-.049.568-.146.839-.41 1.149-1.566 1.902-3.002 1.955l-.23.007c-.75 0-1.47-.109-2.144-.309-.584-.173-1.095-.28-1.602-.28-.515 0-1.034.11-1.627.287-.653.195-1.371.301-2.118.301-.028 0-.056 0-.084-.001-1.479-.062-2.655-.838-3.053-2.008-.087-.258-.13-.526-.13-.803 0-.517.178-1.009.458-1.412.209-.3.478-.553.754-.816l.019-.018c.198-.193.395-.387.555-.577.095-.112.171-.224.22-.334.034-.075.05-.15.05-.225 0-.014-.002-.028-.004-.042-.135.022-.27.036-.407.036-.803 0-1.611-.314-2.13-.851-.508-.525-.634-1.203-.351-1.804.185-.379.488-.656.776-.932.244-.233.481-.474.665-.788.028-.048.048-.098.059-.145-.008-.153-.018-.318-.03-.498l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.86 1.069 11.216.793 12.206.793z" />
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();
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

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: settings?.socialMedia?.instagram || '#',
      gradient: 'from-pink-500 via-purple-500 to-orange-500',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: settings?.socialMedia?.facebook || '#',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Snapchat',
      icon: SnapchatIcon,
      url: settings?.socialMedia?.snapchat || '#',
      gradient: 'from-yellow-400 to-yellow-500',
    },
    {
      name: 'TikTok',
      icon: TikTokIcon,
      url: settings?.socialMedia?.tiktok || '#',
      gradient: 'from-black via-cyan-500 to-pink-500',
    },
  ];

  const quickLinks = [
    { name: 'الرئيسية', href: '#hero' },
    { name: 'القائمة', href: '#menu' },
    { name: 'العروض', href: '#featured' },
    { name: 'التواصل', href: '#contact' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>

      <div className="container-custom relative z-10">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-white to-gray-300 rounded-2xl shadow-2xl">
                <Coffee className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Refresh Cafe
              </h3>
            </div>
            <p className="text-gray-400 text-lg mb-6 leading-relaxed">
              قهوة مميزة ومشروبات لذيذة في أجواء مريحة. نقدم أفضل أنواع القهوة والمشروبات في طرابلس.
            </p>

            {/* Social Media Links - Enhanced with Colors */}
            <div className="space-y-3">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
                <span>تابعنا على</span>
              </h4>
              <div className="flex gap-3 flex-wrap">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.15, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-4 bg-gradient-to-r ${social.gradient} rounded-2xl shadow-xl hover:shadow-2xl transition-all group`}
                    title={social.name}
                  >
                    <social.icon className="w-7 h-7 text-white group-hover:scale-110 transition-transform drop-shadow-lg" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-bold text-xl mb-6 flex items-center gap-2">روابط سريعة</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-all flex items-center gap-2 group"
                  >
                    <span className="w-2 h-2 bg-gray-600 rounded-full group-hover:bg-white transition-colors"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-bold text-xl mb-6">معلومات التواصل</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">الهاتف</p>
                  <a href={`tel:${settings?.phone || '+218911234567'}`} className="hover:underline">
                    {settings?.phone || '+218 91 123 4567'}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">البريد</p>
                  <a
                    href={`mailto:${settings?.email || 'info@refresh-cafe.ly'}`}
                    className="hover:underline"
                  >
                    {settings?.email || 'info@refresh-cafe.ly'}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">الموقع</p>
                  <a
                    href="https://maps.app.goo.gl/Xx52hyercV6bfoaN8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {settings?.address || 'طرابلس، ليبيا'}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group">
                <Clock className="w-5 h-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">ساعات العمل</p>
                  <p>{settings?.workingHours || 'من 6 صباحاً إلى 2 ليلاً'}</p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-gray-400 text-center md:text-right flex items-center gap-2"
            >
              © {currentYear} Refresh Cafe. جميع الحقوق محفوظة
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center md:items-end gap-2"
            >
              <p className="text-gray-400 text-sm flex items-center gap-2">
                تم التصميم والتطوير بواسطة
                <span className="font-bold text-white">Mohamed Turki</span>
                <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <a
                  href="tel:0910929091"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  0910929091
                </a>
                <span>•</span>
                <a
                  href="mailto:mohturke96@gmail.com"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  mohturke96@gmail.com
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-600/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/10 to-transparent rounded-full blur-3xl"></div>
    </footer>
  );
}
