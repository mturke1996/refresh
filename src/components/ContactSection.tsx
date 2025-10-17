import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle, MapPin, Instagram, Facebook, Twitter, Youtube, Globe, Clock, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { notifyNewReview } from '../utils/telegramNotifications';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    userName: '',
    rating: 5,
    text: '',
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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userName || !formData.text) {
      toast.error('الرجاء إدخال الاسم والتعليق');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        ...formData,
        approved: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'comments'), reviewData);

      // Send notification to Telegram (Free Plan - Direct API)
      try {
        await notifyNewReview({ ...formData, approved: false }, docRef.id);
      } catch (telegramError) {
        console.error('Telegram notification failed:', telegramError);
        // Don't fail the review if Telegram fails
      }

      toast.success('تم إرسال تقييمك بنجاح! سيظهر بعد الموافقة.');
      setFormData({ userName: '', rating: 5, text: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('حدث خطأ أثناء إرسال التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: settings?.socialMedia?.instagram || 'https://instagram.com/refresh_cafe',
      color: 'hover:text-pink-600',
      bgColor: 'hover:bg-pink-50',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: settings?.socialMedia?.facebook || 'https://facebook.com/refresh.cafe',
      color: 'hover:text-blue-600',
      bgColor: 'hover:bg-blue-50',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: settings?.socialMedia?.twitter || 'https://twitter.com/refresh_cafe',
      color: 'hover:text-sky-500',
      bgColor: 'hover:bg-sky-50',
    },
    {
      name: 'Youtube',
      icon: Youtube,
      url: settings?.socialMedia?.youtube || 'https://youtube.com/@refresh_cafe',
      color: 'hover:text-red-600',
      bgColor: 'hover:bg-red-50',
    },
  ];

  return (
    <section id="contact" className="section-padding bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
            تواصل معنا
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            نحن هنا لخدمتك. تواصل معنا عبر أي من القنوات التالية
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {/* Phone */}
            <motion.div 
              whileHover={{ scale: 1.02, x: 5 }}
              className="card p-6 flex items-center gap-4 group cursor-pointer transition-all hover:shadow-xl"
            >
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">الهاتف</h3>
                <a
                  href={`tel:${settings?.phone || '+218911234567'}`}
                  className="text-gray-600 hover:text-blue-600 transition-colors text-lg font-medium"
                >
                  {settings?.phone || '+218 91 123 4567'}
                </a>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div 
              whileHover={{ scale: 1.02, x: 5 }}
              className="card p-6 flex items-center gap-4 group cursor-pointer transition-all hover:shadow-xl"
            >
              <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">البريد الإلكتروني</h3>
                <a
                  href={`mailto:${settings?.email || 'info@refresh-cafe.ly'}`}
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  {settings?.email || 'info@refresh-cafe.ly'}
                </a>
              </div>
            </motion.div>

            {/* Telegram */}
            <motion.div 
              whileHover={{ scale: 1.02, x: 5 }}
              className="card p-6 flex items-center gap-4 group cursor-pointer transition-all hover:shadow-xl"
            >
              <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <MessageCircle className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">تليجرام</h3>
                <a
                  href="https://t.me/refresh_cafe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-cyan-600 transition-colors"
                >
                  @refresh_cafe
                </a>
              </div>
            </motion.div>

            {/* Location */}
            <motion.div 
              whileHover={{ scale: 1.02, x: 5 }}
              className="card p-6 flex items-center gap-4 group cursor-pointer transition-all hover:shadow-xl"
            >
              <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">العنوان</h3>
                <a
                  href="https://maps.app.goo.gl/Xx52hyercV6bfoaN8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  {settings?.address || 'طرابلس، ليبيا'}
                </a>
              </div>
            </motion.div>

            {/* Working Hours */}
            <motion.div 
              whileHover={{ scale: 1.02, x: 5 }}
              className="card p-6 flex items-center gap-4 group cursor-pointer transition-all hover:shadow-xl"
            >
              <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">ساعات العمل</h3>
                <p className="text-gray-600 font-medium">
                  {settings?.workingHours || 'من 6 صباحاً إلى 2 ليلاً'}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Review Form - Enhanced */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="card p-8 bg-gradient-to-br from-white to-gray-50 shadow-2xl border-2 border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl shadow-lg">
                  <Star className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold">اترك تقييمك</h3>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-700">الاسم</label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all text-lg"
                    placeholder="أدخل اسمك"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-700">التقييم</label>
                  <div className="flex gap-3 justify-center p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="transition-transform"
                      >
                        <Star
                          className={`w-10 h-10 transition-all ${
                            star <= formData.rating
                              ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                              : 'text-gray-300'
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-center mt-3 text-gray-600 font-medium">
                    {formData.rating === 5 && '⭐ ممتاز'}
                    {formData.rating === 4 && '👍 جيد جداً'}
                    {formData.rating === 3 && '😊 جيد'}
                    {formData.rating === 2 && '😐 مقبول'}
                    {formData.rating === 1 && '😞 ضعيف'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-700">تعليقك</label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all resize-none text-lg"
                    rows={5}
                    placeholder="شاركنا تجربتك..."
                    required
                  ></textarea>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-black to-gray-800 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 group"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Star className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                      إرسال التقييم
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Social Media Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold mb-6">تابعنا على</h3>
          <div className="flex justify-center gap-4 flex-wrap">
            {socialLinks.map((social) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 px-6 py-4 card ${social.bgColor} ${social.color} transition-all shadow-lg hover:shadow-2xl group`}
              >
                <social.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">{social.name}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
