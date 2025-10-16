import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Category } from '../../types';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Plus, X, Coffee, Snowflake, Cake, CircleDot, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    order: 0,
    active: true,
    iconType: 'Layers',
  });

  const iconOptions = [
    { icon: Coffee, name: 'مشروبات ساخنة', color: 'text-amber-600' },
    { icon: Snowflake, name: 'مشروبات باردة', color: 'text-blue-600' },
    { icon: Cake, name: 'حلويات', color: 'text-pink-600' },
    { icon: CircleDot, name: 'كريب', color: 'text-orange-600' },
    { icon: Layers, name: 'عام', color: 'text-gray-600' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('حدث خطأ أثناء جلب الفئات');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        nameEn: category.nameEn || '',
        order: category.order,
        active: category.active,
        iconType: (category as any).iconType || 'Layers',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        nameEn: '',
        order: categories.length,
        active: true,
        iconType: 'Layers',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('الرجاء إدخال اسم الفئة');
      return;
    }

    try {
      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
        toast.success('تم تحديث الفئة بنجاح');
      } else {
        await addDoc(collection(db, 'categories'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success('تم إضافة الفئة بنجاح');
      }

      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('حدث خطأ أثناء حفظ الفئة');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      toast.success('تم حذف الفئة بنجاح');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('حدث خطأ أثناء حذف الفئة');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 skeleton rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Layers className="w-8 h-8 text-blue-600" />
            إدارة الفئات
          </h2>
          <p className="text-gray-600 text-sm mt-1">أضف وعدّل فئات المنتجات</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2 justify-center sm:justify-start whitespace-nowrap shadow-lg hover:shadow-xl group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          إضافة فئة جديدة
        </button>
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-right text-sm font-semibold">الرمز</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">الاسم</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">الاسم بالإنجليزية</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">الترتيب</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">الحالة</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  {(() => {
                    const iconType = (category as any).iconType || 'Layers';
                    const iconOption = iconOptions.find((opt) => opt.icon.name === iconType);
                    const IconComponent = iconOption ? iconOption.icon : Layers;
                    return (
                      <IconComponent
                        className={`w-6 h-6 ${iconOption?.color || 'text-gray-600'}`}
                      />
                    );
                  })()}
                </td>
                <td className="px-6 py-4 font-medium">{category.name}</td>
                <td className="px-6 py-4 text-gray-600">{category.nameEn || '-'}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                    {category.order}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      category.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category.active ? '✅ نشط' : '❌ غير نشط'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(category)}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors group"
                      aria-label="تعديل"
                    >
                      <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors group"
                      aria-label="حذف"
                    >
                      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📁</div>
            <p className="text-gray-500 text-lg">لا توجد فئات</p>
            <p className="text-gray-400 text-sm mt-2">ابدأ بإضافة فئة جديدة من الزر أعلاه!</p>
          </div>
        )}
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="card p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                {(() => {
                  const iconType = (category as any).iconType || 'Layers';
                  const iconOption = iconOptions.find((opt) => opt.icon.name === iconType);
                  const IconComponent = iconOption ? iconOption.icon : Layers;
                  return (
                    <IconComponent className={`w-6 h-6 ${iconOption?.color || 'text-gray-600'}`} />
                  );
                })()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                {category.nameEn && <p className="text-sm text-gray-600 mb-2">{category.nameEn}</p>}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    ترتيب: {category.order}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      category.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category.active ? '✅ نشط' : '❌ غير نشط'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(category)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium group"
                  >
                    <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium group"
                  >
                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">📁</div>
            <p className="text-gray-500 text-lg">لا توجد فئات</p>
            <p className="text-gray-400 text-sm mt-2">ابدأ بإضافة فئة جديدة!</p>
          </div>
        )}
      </div>

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
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">
                    {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
                  </h3>
                  <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Icon Selector */}
                  <div>
                    <label className="block text-sm font-medium mb-3">اختر أيقونة الفئة</label>
                    <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl">
                      {iconOptions.map((iconOption) => (
                        <button
                          key={iconOption.icon.name}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, iconType: iconOption.icon.name })
                          }
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all hover:scale-105 ${
                            formData.iconType === iconOption.icon.name
                              ? 'bg-black text-white scale-105 shadow-lg'
                              : 'hover:bg-white border border-gray-200'
                          }`}
                        >
                          <iconOption.icon
                            className={`w-6 h-6 ${
                              formData.iconType === iconOption.icon.name
                                ? 'text-white'
                                : iconOption.color
                            }`}
                          />
                          <span className="text-xs font-medium">{iconOption.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">اسم الفئة *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      placeholder="مثال: مشروبات ساخنة"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      الاسم بالإنجليزية (اختياري)
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      className="input"
                      placeholder="Hot Drinks"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">الترتيب</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({ ...formData, order: parseInt(e.target.value) })
                      }
                      className="input"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      الفئات ذات الترتيب الأقل تظهر أولاً
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-sm font-medium">
                        {formData.active ? '✅ الفئة نشطة (ستظهر في الموقع)' : '❌ الفئة غير نشطة'}
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="btn-primary flex-1">
                      {editingCategory ? '💾 حفظ التغييرات' : '➕ إضافة الفئة'}
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
