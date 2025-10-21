import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Job } from '../../types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, Edit, Trash2, Save, X, MapPin, DollarSign, Clock, Eye, EyeOff } from 'lucide-react';

export default function JobsManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [''],
    salary: '',
    workType: 'full-time' as Job['workType'],
    location: '',
    active: true,
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Job[];
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('حدث خطأ أثناء جلب الوظائف');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements.filter(r => r.trim() !== ''),
        createdAt: editingJob ? editingJob.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (editingJob) {
        await updateDoc(doc(db, 'jobs', editingJob.id), jobData);
        toast.success('تم تحديث الوظيفة بنجاح');
      } else {
        await addDoc(collection(db, 'jobs'), jobData);
        toast.success('تم إضافة الوظيفة بنجاح');
      }

      resetForm();
      fetchJobs();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('حدث خطأ أثناء حفظ الوظيفة');
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      requirements: job.requirements.length > 0 ? job.requirements : [''],
      salary: job.salary || '',
      workType: job.workType,
      location: job.location,
      active: job.active,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) return;

    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      toast.success('تم حذف الوظيفة بنجاح');
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('حدث خطأ أثناء حذف الوظيفة');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      requirements: [''],
      salary: '',
      workType: 'full-time',
      location: '',
      active: true,
    });
    setEditingJob(null);
    setIsFormOpen(false);
  };

  const addRequirement = () => {
    setFormData({ ...formData, requirements: [...formData.requirements, ''] });
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const getWorkTypeLabel = (type: Job['workType']) => {
    const labels = {
      'full-time': 'دوام كامل',
      'part-time': 'دوام جزئي',
      'temporary': 'مؤقت',
    };
    return labels[type];
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 skeleton rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-blue-600" />
            إدارة الوظائف
          </h2>
          <p className="text-gray-600 mt-1">إضافة وإدارة إعلانات التوظيف ({jobs.length})</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-primary flex items-center justify-center gap-2 text-sm px-4 py-2.5"
        >
          <Plus className="w-4 h-4" />
          إضافة وظيفة
        </button>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${job.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {job.active ? (
                      <>
                        <Eye className="w-3 h-3" />
                        نشط
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        غير نشط
                      </>
                    )}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {getWorkTypeLabel(job.workType)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  {job.salary && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {job.salary}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-700 mb-3">{job.description}</p>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-sm mb-2">المتطلبات:</p>
                  <ul className="space-y-1">
                    {job.requirements.map((req, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => handleEdit(job)}
                  className="p-2.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors border border-blue-200 hover:border-blue-400"
                  title="تعديل"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="p-2.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors border border-red-200 hover:border-red-400"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {jobs.length === 0 && (
          <div className="card p-12 text-center text-gray-500">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">لا توجد وظائف معلنة حالياً</p>
          </div>
        )}
      </div>

      {/* Add/Edit Job Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-black text-white border-b border-gray-700 p-5 flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  {editingJob ? 'تعديل وظيفة' : 'إضافة وظيفة جديدة'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    المسمى الوظيفي <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input text-sm"
                    placeholder="مثال: باريستا"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    الوصف الوظيفي <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input resize-none text-sm"
                    rows={3}
                    placeholder="اكتب وصف تفصيلي عن الوظيفة..."
                    required
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    المتطلبات <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {formData.requirements.map((req, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={req}
                          onChange={(e) => updateRequirement(index, e.target.value)}
                          className="input text-sm"
                          placeholder={`المتطلب ${index + 1}`}
                        />
                        {formData.requirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRequirement(index)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="text-xs px-3 py-2 border-2 border-gray-300 hover:border-black rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      إضافة متطلب
                    </button>
                  </div>
                </div>

                {/* Work Type, Location, Salary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">نوع الدوام</label>
                    <select
                      value={formData.workType}
                      onChange={(e) => setFormData({ ...formData, workType: e.target.value as Job['workType'] })}
                      className="input text-sm"
                    >
                      <option value="full-time">دوام كامل</option>
                      <option value="part-time">دوام جزئي</option>
                      <option value="temporary">مؤقت</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">الموقع</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="input text-sm"
                      placeholder="مثال: طرابلس"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">الراتب (اختياري)</label>
                    <input
                      type="text"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="input text-sm"
                      placeholder="1000-1500 د.ل"
                    />
                  </div>
                </div>

                {/* Active */}
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    نشط (سيظهر في الموقع للزوار)
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-3 border-t">
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
                    <Save className="w-4 h-4" />
                    {editingJob ? 'تحديث' : 'حفظ'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary flex-1 text-sm py-2.5"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

