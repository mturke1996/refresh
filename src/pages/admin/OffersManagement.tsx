import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Star, 
  Clock, 
  Calendar,
  Eye,
  EyeOff,
  Percent,
  Tag,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Offer {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  discountPercent: number;
  originalPrice?: number;
  offerPrice?: number;
  imageUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId?: string;
  itemIds?: string[];
  linkUrl?: string;
  createdAt?: Date | { toDate: () => Date };
  updatedAt?: Date | { toDate: () => Date };
}

export default function OffersManagement() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    discountPercent: 0,
    originalPrice: 0,
    offerPrice: 0,
    imageUrl: '',
    startDate: '',
    endDate: '',
    isActive: true,
    isFeatured: false,
    categoryId: '',
    itemIds: [] as string[],
    linkUrl: '',
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'offers'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const offersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Offer[];
      setOffers(offersData);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('حدث خطأ أثناء جلب العروض');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        title: offer.title,
        titleEn: offer.titleEn || '',
        description: offer.description,
        descriptionEn: offer.descriptionEn || '',
        discountPercent: offer.discountPercent,
        originalPrice: offer.originalPrice || 0,
        offerPrice: offer.offerPrice || 0,
        imageUrl: offer.imageUrl,
        startDate: offer.startDate,
        endDate: offer.endDate,
        isActive: offer.isActive,
        isFeatured: offer.isFeatured,
        categoryId: offer.categoryId || '',
        itemIds: offer.itemIds || [],
        linkUrl: offer.linkUrl || '',
      });
    } else {
      setEditingOffer(null);
      setFormData({
        title: '',
        titleEn: '',
        description: '',
        descriptionEn: '',
        discountPercent: 0,
        originalPrice: 0,
        offerPrice: 0,
        imageUrl: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true,
        isFeatured: false,
        categoryId: '',
        itemIds: [],
        linkUrl: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOffer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const offerData = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      if (editingOffer) {
        await updateDoc(doc(db, 'offers', editingOffer.id), offerData);
        toast.success('تم تحديث العرض بنجاح');
      } else {
        await addDoc(collection(db, 'offers'), {
          ...offerData,
          createdAt: serverTimestamp(),
        });
        toast.success('تم إضافة العرض بنجاح');
      }

      handleCloseModal();
      fetchOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
      toast.error('حدث خطأ أثناء حفظ العرض');
    }
  };

  const handleDelete = async (offerId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;

    try {
      await deleteDoc(doc(db, 'offers', offerId));
      toast.success('تم حذف العرض بنجاح');
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('حدث خطأ أثناء حذف العرض');
    }
  };

  const toggleActive = async (offer: Offer) => {
    try {
      await updateDoc(doc(db, 'offers', offer.id), {
        isActive: !offer.isActive,
        updatedAt: serverTimestamp(),
      });
      toast.success(`تم ${offer.isActive ? 'إلغاء تفعيل' : 'تفعيل'} العرض`);
      fetchOffers();
    } catch (error) {
      console.error('Error updating offer status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة العرض');
    }
  };

  const toggleFeatured = async (offer: Offer) => {
    try {
      await updateDoc(doc(db, 'offers', offer.id), {
        isFeatured: !offer.isFeatured,
        updatedAt: serverTimestamp(),
      });
      toast.success(`تم ${offer.isFeatured ? 'إلغاء التمييز' : 'تمييز'} العرض`);
      fetchOffers();
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة التمييز');
    }
  };

  const isOfferExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const isOfferActive = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 skeleton rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Tag className="w-8 h-8 text-orange-600" />
            إدارة العروض
          </h2>
          <p className="text-gray-600 text-sm mt-1">أضف وعدّل عروض المطعم</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn-primary flex items-center gap-2 justify-center sm:justify-start whitespace-nowrap shadow-lg hover:shadow-xl group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          إضافة عرض جديد
        </button>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => {
          const expired = isOfferExpired(offer.endDate);
          const active = isOfferActive(offer.startDate, offer.endDate);
          
          return (
            <div key={offer.id} className="card overflow-hidden group hover:shadow-lg transition-all">
              <div className="relative aspect-video">
                <img
                  src={offer.imageUrl}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {!offer.isActive && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      غير مفعل
                    </span>
                  )}
                  {expired && (
                    <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      منتهي
                    </span>
                  )}
                  {!expired && active && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      نشط
                    </span>
                  )}
                  {offer.isFeatured && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      مميز
                    </span>
                  )}
                </div>

                {/* Discount Badge */}
                <div className="absolute top-3 right-3">
                  <div className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    -{offer.discountPercent}%
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(offer)}
                      className={`p-2 rounded-full text-white shadow-lg transition-colors ${
                        offer.isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                      }`}
                      title={offer.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                    >
                      {offer.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => toggleFeatured(offer)}
                      className={`p-2 rounded-full text-white shadow-lg transition-colors ${
                        offer.isFeatured ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-500 hover:bg-gray-600'
                      }`}
                      title={offer.isFeatured ? 'إلغاء التمييز' : 'تمييز'}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{offer.title}</h3>
                {offer.titleEn && (
                  <p className="text-sm text-gray-500 mb-2">{offer.titleEn}</p>
                )}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{offer.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {offer.originalPrice && offer.offerPrice && (
                      <>
                        <span className="text-lg font-bold text-green-600">{offer.offerPrice} ر.س</span>
                        <span className="text-sm text-gray-400 line-through">{offer.originalPrice} ر.س</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>من: {new Date(offer.startDate).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>إلى: {new Date(offer.endDate).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(offer)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium group/btn"
                  >
                    <Edit2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium group/btn"
                  >
                    <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {offers.length === 0 && (
        <div className="card p-12 text-center text-gray-500">
          <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">لا توجد عروض</h3>
          <p className="text-gray-400 mb-4">ابدأ بإضافة عرض جديد لجذب العملاء!</p>
          <button 
            onClick={() => handleOpenModal()} 
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            إضافة عرض جديد
          </button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Tag className="w-6 h-6 text-orange-600" />
                    {editingOffer ? 'تعديل العرض' : 'إضافة عرض جديد'}
                  </h3>
                  <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium mb-2">رابط الصورة *</label>
                    <div className="relative">
                      <ImageIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium mb-2">عنوان العرض *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="عرض خاص"
                        required
                      />
                    </div>

                    {/* Title English */}
                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان بالإنجليزية</label>
                      <input
                        type="text"
                        value={formData.titleEn}
                        onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Special Offer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2">وصف العرض *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent h-20 resize-none"
                        placeholder="احصل على خصم خاص..."
                        required
                      />
                    </div>

                    {/* Description English */}
                    <div>
                      <label className="block text-sm font-medium mb-2">الوصف بالإنجليزية</label>
                      <textarea
                        value={formData.descriptionEn}
                        onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent h-20 resize-none"
                        placeholder="Get a special discount..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Discount Percent */}
                    <div>
                      <label className="block text-sm font-medium mb-2">نسبة الخصم (%) *</label>
                      <div className="relative">
                        <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.discountPercent}
                          onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) || 0 })}
                          className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {/* Original Price */}
                    <div>
                      <label className="block text-sm font-medium mb-2">السعر الأصلي</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>

                    {/* Offer Price */}
                    <div>
                      <label className="block text-sm font-medium mb-2">سعر العرض</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.offerPrice}
                        onChange={(e) => setFormData({ ...formData, offerPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium mb-2">تاريخ البداية *</label>
                      <div className="relative">
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-sm font-medium mb-2">تاريخ النهاية *</label>
                      <div className="relative">
                        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Link URL */}
                  <div>
                    <label className="block text-sm font-medium mb-2">رابط إضافي (اختياري)</label>
                    <div className="relative">
                      <LinkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="url"
                        value={formData.linkUrl}
                        onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                        className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  {/* Status Toggles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 rounded text-orange-500"
                      />
                      <span className="text-sm font-medium">
                        {formData.isActive ? '✅ العرض مفعل' : '❌ العرض غير مفعل'}
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="w-5 h-5 rounded text-orange-500"
                      />
                      <span className="text-sm font-medium">
                        {formData.isFeatured ? '⭐ عرض مميز' : '📌 عرض عادي'}
                      </span>
                    </label>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                      <Tag className="w-5 h-5" />
                      {editingOffer ? '💾 حفظ التغييرات' : '➕ إضافة العرض'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="btn-secondary flex-1"
                    >
                      ✖️ إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
