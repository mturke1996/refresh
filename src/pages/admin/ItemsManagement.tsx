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
import { MenuItem, Category } from '../../types';
import { compressImage } from '../../utils/imageOptimization';
import { uploadToImgBB } from '../../utils/imgbbUpload';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Plus, X, Upload, Eye, EyeOff, Grid, Filter, Search, Layers, Star, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ItemsManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable' | 'on-offer'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    price: 0,
    discountPercent: 0,
    categoryId: '',
    imageUrl: '',
    available: true,
    isNew: false,
    isOnOffer: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsSnapshot, categoriesSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'items'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'categories'), orderBy('order', 'asc'))),
      ]);

      setItems(
        itemsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as MenuItem[]
      );
      setCategories(
        categoriesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Category[]
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('الرجاء اختيار صورة صالحة');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Compress image before upload
      const compressedBlob = await compressImage(file);
      
      // Convert blob to file
      const compressedFile = new File(
        [compressedBlob], 
        file.name, 
        { type: 'image/jpeg' }
      );
      
      // Upload to ImgBB
      const url = await uploadToImgBB(compressedFile, `item-${Date.now()}`);
      
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('فشل رفع الصورة');
    }
  };

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        nameEn: item.nameEn || '',
        description: item.description,
        descriptionEn: item.descriptionEn || '',
        price: item.price,
        discountPercent: item.discountPercent || 0,
        categoryId: item.categoryId,
        imageUrl: item.imageUrl,
        available: item.available,
        isNew: item.isNew || false,
        isOnOffer: item.isOnOffer || false,
      });
      setImagePreview(item.imageUrl);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        nameEn: '',
        description: '',
        descriptionEn: '',
        price: 0,
        discountPercent: 0,
        categoryId: categories[0]?.id || '',
        imageUrl: '',
        available: true,
        isNew: false,
        isOnOffer: false,
      });
      setImagePreview('');
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.categoryId) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    if (!editingItem && !imageFile) {
      toast.error('الرجاء اختيار صورة للمنتج');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = formData.imageUrl;

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const itemData = {
        ...formData,
        imageUrl,
        price: Number(formData.price),
        discountPercent: Number(formData.discountPercent),
      };

      if (editingItem) {
        await updateDoc(doc(db, 'items', editingItem.id), {
          ...itemData,
          updatedAt: serverTimestamp(),
        });
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await addDoc(collection(db, 'items'), {
          ...itemData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success('تم إضافة المنتج بنجاح');
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('حدث خطأ أثناء حفظ المنتج');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      // Delete item document
      await deleteDoc(doc(db, 'items', item.id));
      
      // Optionally delete image from storage
      // (Note: you might want to keep images for order history)
      
      toast.success('تم حذف المنتج بنجاح');
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('حدث خطأ أثناء حذف المنتج');
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await updateDoc(doc(db, 'items', item.id), {
        available: !item.available,
        updatedAt: serverTimestamp(),
      });
      toast.success(`تم ${item.available ? 'إلغاء تفعيل' : 'تفعيل'} المنتج`);
      fetchData();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('حدث خطأ أثناء تحديث حالة المنتج');
    }
  };

  const toggleOffer = async (item: MenuItem) => {
    try {
      await updateDoc(doc(db, 'items', item.id), {
        isOnOffer: !item.isOnOffer,
        updatedAt: serverTimestamp(),
      });
      toast.success(`تم ${item.isOnOffer ? 'إلغاء العرض' : 'تفعيل العرض'} للمنتج`);
      fetchData();
    } catch (error) {
      console.error('Error updating offer status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة العرض');
    }
  };

  // Filter and search logic
  const filteredItems = items.filter(item => {
    // Category filter
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
      return false;
    }

    // Search filter
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.nameEn?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Status filter
    switch (statusFilter) {
      case 'available':
        return item.available;
      case 'unavailable':
        return !item.available;
      case 'on-offer':
        return item.isOnOffer;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 skeleton rounded-xl" />
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
            <Grid className="w-8 h-8 text-blue-600" />
            إدارة المنتجات
          </h2>
          <p className="text-gray-600 text-sm mt-1">أضف وعدّل منتجات القائمة</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn-primary flex items-center gap-2 justify-center sm:justify-start whitespace-nowrap shadow-lg hover:shadow-xl group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          إضافة منتج جديد
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="card p-4 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث في المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الفئات</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="available">متوفر</option>
              <option value="unavailable">غير متوفر</option>
              <option value="on-offer">في عرض</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Layers className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          عرض {filteredItems.length} من أصل {items.length} منتج
        </div>
      </div>

      {/* Products Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const category = categories.find(cat => cat.id === item.categoryId);
              return (
                <div key={item.id} className="card overflow-hidden group hover:shadow-lg transition-all">
                  <div className="relative aspect-product">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {!item.available && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          غير متوفر
                        </span>
                      )}
                      {item.isOnOffer && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          عرض
                        </span>
                      )}
                      {item.isNew && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          جديد
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => toggleAvailability(item)}
                          className={`p-2 rounded-full text-white shadow-lg transition-colors ${
                            item.available ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                          }`}
                          title={item.available ? 'إلغاء التفعيل' : 'تفعيل'}
                        >
                          {item.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => toggleOffer(item)}
                          className={`p-2 rounded-full text-white shadow-lg transition-colors ${
                            item.isOnOffer ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-500 hover:bg-gray-600'
                          }`}
                          title={item.isOnOffer ? 'إلغاء العرض' : 'تفعيل العرض'}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {category?.name || 'غير محدد'}
                      </span>
                    </div>
                    
                    {item.nameEn && (
                      <p className="text-sm text-gray-500 mb-2">{item.nameEn}</p>
                    )}
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{item.price} د.ل</span>
                        {item.discountPercent && item.discountPercent > 0 && (
                          <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full">
                            خصم {item.discountPercent}%
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium group/btn"
                      >
                        <Edit2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
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
        ) : (
          // List View
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const category = categories.find(cat => cat.id === item.categoryId);
              return (
                <div key={item.id} className="card p-4 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4">
                    {/* Image */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {!item.available && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <EyeOff className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          {item.nameEn && (
                            <p className="text-sm text-gray-500">{item.nameEn}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{item.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {item.isOnOffer && (
                            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                              عرض
                            </span>
                          )}
                          {item.isNew && (
                            <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                              جديد
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-4">
                          <span className="font-bold">{item.price} د.ل</span>
                          <span className="text-sm text-gray-500">{category?.name || 'غير محدد'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleAvailability(item)}
                            className={`p-2 rounded-lg transition-colors ${
                              item.available 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                            }`}
                            title={item.available ? 'متوفر' : 'غير متوفر'}
                          >
                            {item.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => toggleOffer(item)}
                            className={`p-2 rounded-lg transition-colors ${
                              item.isOnOffer 
                                ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={item.isOnOffer ? 'في عرض' : 'ليس في عرض'}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      {filteredItems.length === 0 && items.length > 0 && (
        <div className="card p-12 text-center text-gray-500">
          <Filter className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">لم يتم العثور على منتجات</h3>
          <p className="text-gray-400">جرب تغيير معايير البحث أو التصفية</p>
        </div>
      )}

      {items.length === 0 && (
        <div className="card p-12 text-center text-gray-500">
          <Grid className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">لا توجد منتجات</h3>
          <p className="text-gray-400 mb-4">ابدأ بإضافة منتج جديد!</p>
          <button 
            onClick={() => handleOpenModal()} 
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            إضافة منتج جديد
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
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto"
            >
              <div
                className="card p-6 w-full max-w-2xl my-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">
                    {editingItem ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                  </h3>
                  <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">صورة المنتج *</label>
                    <div className="flex items-start gap-4">
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      )}
                      <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-black transition-colors">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <span className="text-sm text-gray-600">اختر صورة أو اسحبها هنا</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">اسم المنتج *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">الاسم بالإنجليزية</label>
                      <input
                        type="text"
                        value={formData.nameEn}
                        onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">الوصف *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input resize-none"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">الوصف بالإنجليزية</label>
                    <textarea
                      value={formData.descriptionEn}
                      onChange={(e) =>
                        setFormData({ ...formData, descriptionEn: e.target.value })
                      }
                      className="input resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">السعر *</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: parseFloat(e.target.value) })
                        }
                        className="input"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">نسبة الخصم %</label>
                      <input
                        type="number"
                        value={formData.discountPercent}
                        onChange={(e) =>
                          setFormData({ ...formData, discountPercent: parseFloat(e.target.value) })
                        }
                        className="input"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">الفئة *</label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="input"
                        required
                      >
                        <option value="">اختر الفئة</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.available}
                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">متوفر</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isNew}
                        onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">جديد</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isOnOffer}
                        onChange={(e) => setFormData({ ...formData, isOnOffer: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">عرض خاص</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      {uploading ? 'جاري الحفظ...' : editingItem ? 'حفظ التغييرات' : 'إضافة'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="btn-secondary flex-1"
                    >
                      إلغاء
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

