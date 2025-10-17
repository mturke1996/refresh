import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, MessageCircle, Send, User, Calendar, ThumbsUp, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { notifyNewReview } from '../utils/telegramNotifications';

interface Review {
  id: string;
  userName: string;
  rating: number;
  text: string;
  adminReply?: string;
  createdAt: Date | { toDate: () => Date } | null;
  approved: boolean;
}

const getRatingText = (rating: number) => {
  const texts = {
    5: { text: 'رائع جداً!', emoji: '🌟', color: 'text-green-600' },
    4: { text: 'ممتاز', emoji: '😊', color: 'text-blue-600' },
    3: { text: 'جيد', emoji: '👍', color: 'text-yellow-600' },
    2: { text: 'مقبول', emoji: '😐', color: 'text-orange-600' },
    1: { text: 'يحتاج تحسين', emoji: '😞', color: 'text-red-600' }
  };
  return texts[rating as keyof typeof texts] || texts[5];
};

export default function ReviewsSection() {
  const [formData, setFormData] = useState({
    userName: '',
    rating: 5,
    text: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const q = query(
        collection(db, 'comments'),
        where('approved', '==', true),
        orderBy('createdAt', 'desc'),
        limit(9)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedReviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userName || !formData.text) {
      toast.error('الرجاء إدخال الاسم والتعليق');
      return;
    }

    if (formData.text.length < 10) {
      toast.error('الرجاء كتابة تعليق أطول (على الأقل 10 أحرف)');
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

      // Send Telegram notification
      try {
        await notifyNewReview({ ...formData, approved: false }, docRef.id);
      } catch (telegramError) {
        console.error('Failed to send Telegram notification:', telegramError);
        // Don't fail the review if Telegram fails
      }

      toast.success('شكراً لك! تقييمك قيد المراجعة وسيظهر قريباً 🎉');
      setFormData({ userName: '', rating: 5, text: '' });
      
      setTimeout(() => {
        fetchReviews();
      }, 2000);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('حدث خطأ أثناء إرسال التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: Date | { toDate: () => Date } | null) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : (timestamp as { toDate: () => Date }).toDate();
    return new Intl.DateTimeFormat('ar-LY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const calculateAverageRating = (): string => {
    if (reviews.length === 0) return '0';
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  return (
    <section id="reviews" className="relative py-20 overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="container-custom relative z-10">
        {/* Header with Stats */}
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
            className="inline-flex items-center gap-2 mb-4 px-6 py-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full shadow-lg"
          >
            <Award className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-900 font-semibold">تقييمات معتمدة</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-600 bg-clip-text text-transparent">
            آراء عملائنا
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            تجارب حقيقية من عملاء سعداء بخدماتنا
          </p>

          {/* Rating Summary - Mobile Optimized */}
          {reviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-yellow-100 w-full sm:w-auto max-w-md mx-auto"
            >
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">{calculateAverageRating()}</div>
                <div className="flex gap-1 mb-2 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        i < Math.round(parseFloat(calculateAverageRating()))
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">{reviews.length} تقييم</p>
              </div>
              
              <div className="hidden sm:block border-r-2 border-gray-200 h-20"></div>
              <div className="sm:hidden w-full h-px bg-gray-200"></div>
              
              <div className="space-y-1.5 sm:space-y-2 text-right w-full sm:w-auto">
                {Object.entries(getRatingDistribution()).reverse().map(([rating, count]) => (
                  <div key={rating} className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 w-12 sm:w-12">{rating} نجوم</span>
                    <div className="flex-1 sm:w-24 md:w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600 w-6 sm:w-8">{count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Reviews Display */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-16 text-center shadow-2xl border-2 border-gray-100"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <MessageCircle className="w-12 h-12 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">لا توجد تقييمات بعد</h3>
                <p className="text-gray-600 text-lg mb-6">كن أول من يشارك تجربته الرائعة معنا!</p>
                <ThumbsUp className="w-8 h-8 text-gray-400 mx-auto" />
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {reviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-yellow-200 relative overflow-hidden group"
                    >
                      {/* Decorative corner */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-yellow-100 to-transparent opacity-50"></div>
                      
                      {/* Quote decoration */}
                      <Quote className="absolute bottom-4 left-4 w-16 h-16 text-gray-50 group-hover:text-yellow-50 transition-colors" />
                      
                      <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">{review.userName}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(review.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-full border border-yellow-200">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-bold text-yellow-700">{review.rating}.0</span>
                          </div>
                        </div>
                        
                        {/* Stars */}
                        <div className="flex gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 transition-all ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Review text */}
                        <p className="text-gray-700 leading-relaxed mb-4 text-base">
                          "{review.text}"
                        </p>

                        {/* Admin Reply */}
                        {review.adminReply && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-r-4 border-blue-500"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow">
                                <MessageCircle className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-bold text-blue-900 text-sm">رد الإدارة</span>
                            </div>
                            <p className="text-blue-900 text-sm leading-relaxed font-medium">
                              {review.adminReply}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Review Form - Mobile Optimized */}
          <div className="lg:sticky lg:top-24 h-fit order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border-2 border-gray-100 overflow-hidden relative"
            >
              {/* Gradient header */}
              <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-5 sm:p-6 lg:p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="w-8 h-8 fill-white" />
                    <h3 className="text-2xl font-bold">اترك تقييمك</h3>
                  </div>
                  <p className="text-white/90">شاركنا تجربتك الرائعة</p>
                </div>
                
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
              </div>

              <form onSubmit={handleSubmitReview} className="p-8 space-y-6">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-600" />
                    اسمك <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-lg placeholder:text-gray-400"
                    placeholder="أدخل اسمك"
                    required
                  />
                </div>

                {/* Rating Stars - Mobile Friendly */}
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-700">تقييمك</label>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 border-2 border-gray-200">
                    <div className="flex gap-1 sm:gap-2 justify-center mb-4 touch-manipulation">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          className="transition-transform touch-manipulation p-1 sm:p-0"
                        >
                          <Star
                            className={`w-10 h-10 sm:w-12 sm:h-12 transition-all duration-200 ${
                              star <= (hoveredStar || formData.rating)
                                ? 'text-yellow-400 fill-yellow-400 drop-shadow-xl'
                                : 'text-gray-300'
                            }`}
                          />
                        </motion.button>
                      ))}
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={formData.rating}
                      className="text-center"
                    >
                      <span className={`text-2xl font-bold ${getRatingText(formData.rating).color}`}>
                        {getRatingText(formData.rating).emoji} {getRatingText(formData.rating).text}
                      </span>
                    </motion.div>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-700 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-purple-600" />
                    تعليقك <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all resize-none text-lg placeholder:text-gray-400"
                    rows={5}
                    placeholder="شاركنا تجربتك الرائعة معنا... (على الأقل 10 أحرف)"
                    required
                    minLength={10}
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <span className={formData.text.length >= 10 ? 'text-green-600 font-medium' : ''}>
                      {formData.text.length} / 10 حرف كحد أدنى
                    </span>
                  </p>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting || formData.text.length < 10}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-5 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative z-10 flex items-center gap-3">
                    {isSubmitting ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        إرسال التقييم
                      </>
                    )}
                  </span>
                </motion.button>
                
                <p className="text-xs text-center text-gray-500 mt-4">
                  سيتم مراجعة تقييمك قبل نشره على الموقع
                </p>
              </form>
            </motion.div>
          </div>
        </div>
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
