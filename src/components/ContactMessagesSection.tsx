import { motion } from 'framer-motion';
import { Send, User, Mail, Phone, MessageSquare, MapPin, Clock, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { notifyNewMessage } from '../utils/telegramNotifications';

export default function ContactMessagesSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.message) {
      toast.error('الرجاء إدخال الاسم والرسالة');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to Firestore
      const messageData = {
        ...formData,
        createdAt: serverTimestamp(),
        read: false,
      };

      const docRef = await addDoc(collection(db, 'messages'), messageData);

      // Send notification to Telegram (Free Plan - Direct API)
      try {
        await notifyNewMessage({ ...formData, read: false }, docRef.id);
      } catch (telegramError) {
        console.warn('Telegram notification failed:', telegramError);
        // Continue even if Telegram fails
      }

      toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('حدث خطأ أثناء إرسال الرسالة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'اتصل بنا',
      value: '+218 91 123 4567',
      href: 'tel:+218911234567',
      color: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50',
    },
    {
      icon: Mail,
      title: 'راسلنا',
      value: 'info@refresh-cafe.ly',
      href: 'mailto:info@refresh-cafe.ly',
      color: 'from-purple-500 to-pink-500',
      bgLight: 'bg-purple-50',
    },
    {
      icon: MapPin,
      title: 'موقعنا',
      value: 'طرابلس، ليبيا',
      href: 'https://maps.app.goo.gl/Xx52hyercV6bfoaN8',
      color: 'from-green-500 to-emerald-500',
      bgLight: 'bg-green-50',
    },
    {
      icon: Clock,
      title: 'أوقات العمل',
      value: '6 صباحاً - 2 ليلاً',
      href: null,
      color: 'from-orange-500 to-red-500',
      bgLight: 'bg-orange-50',
    },
  ];

  return (
    <section
      id="contact"
      className="relative py-20 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4 px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full"
          >
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-purple-900 font-semibold">تواصل معنا</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
            نحن هنا لخدمتك
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            لا تتردد في التواصل معنا، فريقنا جاهز للإجابة على استفساراتك
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 mb-12">
          {/* Contact Info Cards - Mobile Optimized */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {contactInfo.map((item, index) => (
              <motion.a
                key={index}
                href={item.href || undefined}
                target={item.href?.startsWith('http') ? '_blank' : undefined}
                rel={item.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`block p-4 sm:p-6 rounded-2xl lg:rounded-3xl ${item.bgLight} hover:shadow-2xl transition-all duration-300 group cursor-pointer border-2 border-transparent hover:border-white touch-manipulation`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`p-3 sm:p-4 bg-gradient-to-br ${item.color} rounded-xl lg:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}
                  >
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1 text-base sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 font-medium text-sm sm:text-base truncate">
                      {item.value}
                    </p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Message Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl p-5 sm:p-6 md:p-8 lg:p-10 border-2 border-gray-100 relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>

              <div className="mb-6 sm:mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2 sm:gap-3">
                  <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
                  <span>أرسل لنا رسالة</span>
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">سنرد عليك في أقرب وقت ممكن</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div className="group">
                  <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-600" />
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-base sm:text-lg placeholder:text-gray-400"
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-purple-600" />
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-base sm:text-lg placeholder:text-gray-400"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-purple-600" />
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-base sm:text-lg placeholder:text-gray-400"
                      placeholder="+218 91 234 5678"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="group">
                  <label className="block text-sm font-bold mb-2 text-gray-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    رسالتك <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:bg-white focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none text-base sm:text-lg placeholder:text-gray-400"
                    rows={5}
                    placeholder="اكتب رسالتك هنا..."
                    required
                  ></textarea>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 sm:py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-xl lg:rounded-2xl font-bold text-base sm:text-lg shadow-xl lg:shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 sm:gap-3 group relative overflow-hidden touch-manipulation"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative z-10 flex items-center gap-3">
                    {isSubmitting ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        إرسال الرسالة
                      </>
                    )}
                  </span>
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Map Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13366.448090644987!2d13.186854!3d32.887209!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13a8926811d8524b%3A0x4d1e0f1a5c5e8b5c!2sTripoli%2C%20Libya!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="grayscale hover:grayscale-0 transition-all duration-500"
          ></iframe>
        </motion.div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
