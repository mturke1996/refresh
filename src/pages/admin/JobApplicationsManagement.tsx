import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { JobApplication } from '../../types';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Briefcase, Mail, Phone, FileText, Trash2, Eye, Download, Circle } from 'lucide-react';

const statusOptions = [
  { value: 'new', label: 'جديد', color: 'bg-blue-100 text-blue-700' },
  { value: 'reviewing', label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'interviewed', label: 'تمت المقابلة', color: 'bg-purple-100 text-purple-700' },
  { value: 'accepted', label: 'مقبول', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'مرفوض', color: 'bg-red-100 text-red-700' },
];

export default function JobApplicationsManagement() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const q = query(collection(db, 'jobApplications'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as JobApplication[];
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('حدث خطأ أثناء جلب الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId: string, status: JobApplication['status']) => {
    try {
      await updateDoc(doc(db, 'jobApplications', appId), { 
        status,
        read: true,
      });
      toast.success('تم تحديث حالة الطلب');
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('حدث خطأ أثناء تحديث الطلب');
    }
  };

  const markAsRead = async (appId: string) => {
    try {
      await updateDoc(doc(db, 'jobApplications', appId), { read: true });
      fetchApplications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteApplication = async (appId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;

    try {
      await deleteDoc(doc(db, 'jobApplications', appId));
      toast.success('تم حذف الطلب بنجاح');
      fetchApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('حدث خطأ أثناء حذف الطلب');
    }
  };

  const getStatusStyle = (status: JobApplication['status']) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option?.color || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: JobApplication['status']) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option?.label || status;
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-blue-600" />
          طلبات التوظيف
        </h2>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="text-gray-600">
            إجمالي: <span className="font-bold text-gray-900">{applications.length}</span>
          </span>
          <span className="text-blue-600">
            جديد: <span className="font-bold">{applications.filter(a => !a.read).length}</span>
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {applications.map((app, index) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`card p-6 ${!app.read ? 'border-2 border-blue-200 bg-blue-50/30' : ''}`}
            onClick={() => !app.read && markAsRead(app.id)}
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Application Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{app.applicantName}</h3>
                      {!app.read && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full animate-pulse flex items-center gap-1">
                          <Circle className="w-3 h-3 fill-white" />
                          جديد
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      التقديم على: <span className="font-medium text-gray-900">{app.jobTitle}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(app.createdAt)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(app.status)}`}>
                    {getStatusLabel(app.status)}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">الهاتف:</span>
                    <a href={`tel:${app.applicantPhone}`} className="text-blue-600 hover:underline">
                      {app.applicantPhone}
                    </a>
                  </div>
                  {app.applicantEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">البريد:</span>
                      <a href={`mailto:${app.applicantEmail}`} className="text-purple-600 hover:underline">
                        {app.applicantEmail}
                      </a>
                    </div>
                  )}
                  {app.cvUrl && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="font-medium">السيرة الذاتية:</span>
                      <a
                        href={app.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline flex items-center gap-1"
                      >
                        عرض السيرة الذاتية
                        <Eye className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">الرسالة:</p>
                  <p className="text-sm text-gray-700">{app.message}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="lg:w-48 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">تحديث الحالة</label>
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value as JobApplication['status'])}
                    className="input text-sm"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => deleteApplication(app.id)}
                  className="w-full btn-danger flex items-center justify-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف الطلب
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {applications.length === 0 && (
          <div className="card p-12 text-center text-gray-500">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">لا توجد طلبات توظيف حتى الآن</p>
          </div>
        )}
      </div>
    </div>
  );
}

