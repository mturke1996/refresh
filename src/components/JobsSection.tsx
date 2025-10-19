import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Send,
  User,
  Phone,
  Mail,
  FileText,
  X,
  Upload,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Job } from '../types';
import toast from 'react-hot-toast';
import { notifyNewJobApplication } from '../utils/telegramNotifications';
import { uploadToImgBB } from '../utils/imgbbUpload';

export default function JobsSection() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantPhone: '',
    applicantEmail: '',
    cvUrl: '',
    message: '',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const q = query(
        collection(db, 'jobs'),
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      );
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
    } finally {
      setLoading(false);
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
      return;
    }

    setUploadingCV(true);
    try {
      const cvUrl = await uploadToImgBB(file);
      setFormData({ ...formData, cvUrl });
      toast.success('تم رفع السيرة الذاتية بنجاح');
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast.error('حدث خطأ أثناء رفع الملف');
    } finally {
      setUploadingCV(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedJob || !formData.applicantName || !formData.applicantPhone || !formData.message) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    setIsApplying(true);

    try {
      const applicationData = {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        applicantName: formData.applicantName,
        applicantPhone: formData.applicantPhone,
        applicantEmail: formData.applicantEmail,
        cvUrl: formData.cvUrl,
        message: formData.message,
        status: 'new',
        read: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'jobApplications'), applicationData);

      // Send Telegram notification
      try {
        await notifyNewJobApplication(applicationData, docRef.id);
      } catch (telegramError) {
        console.error('Telegram notification failed:', telegramError);
      }

      toast.success('تم إرسال طلبك بنجاح! سنتواصل معك قريباً 🎉');
      setFormData({
        applicantName: '',
        applicantPhone: '',
        applicantEmail: '',
        cvUrl: '',
        message: '',
      });
      setSelectedJob(null);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsApplying(false);
    }
  };

  const getWorkTypeLabel = (type: Job['workType']) => {
    const labels = {
      'full-time': 'دوام كامل',
      'part-time': 'دوام جزئي',
      temporary: 'مؤقت',
    };
    return labels[type];
  };

  if (jobs.length === 0 && !loading) {
    return null; // Don't show section if no active jobs
  }

  return (
    <section
      id="jobs"
      className="relative py-20 overflow-hidden bg-gradient-to-b from-white to-gray-50"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
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
            className="inline-flex items-center gap-2 mb-4 px-6 py-3 bg-black text-white rounded-full shadow-lg"
          >
            <Briefcase className="w-5 h-5" />
            <span className="font-semibold">فرص عمل</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900">انضم لفريقنا</h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            نبحث عن موظفين متميزين للانضمام إلى فريق Refresh Café
          </p>
        </motion.div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))
            : jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-black cursor-pointer group"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Briefcase className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {getWorkTypeLabel(job.workType)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-black transition-colors">
                    {job.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-green-600" />
                      {job.location}
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4 text-yellow-600" />
                        {job.salary}
                      </div>
                    )}
                  </div>

                  <button className="mt-4 w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors group-hover:scale-105 transform">
                    قدم الآن
                  </button>
                </motion.div>
              ))}
        </div>
      </div>

      {/* Application Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedJob(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-black text-white p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{selectedJob.title}</h3>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {getWorkTypeLabel(selectedJob.workType)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedJob.location}
                    </span>
                    {selectedJob.salary && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {selectedJob.salary}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {/* Job Details */}
                <div className="mb-6">
                  <h4 className="font-bold text-lg mb-3">الوصف الوظيفي</h4>
                  <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-lg mb-3">المتطلبات</h4>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-blue-600 font-bold">✓</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Application Form */}
                <div className="border-t pt-6">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Send className="w-6 h-6 text-blue-600" />
                    قدم طلبك الآن
                  </h4>

                  <form onSubmit={handleApply} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-black" />
                        الاسم الكامل <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.applicantName}
                        onChange={(e) =>
                          setFormData({ ...formData, applicantName: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-4 focus:ring-black/10 transition-all"
                        placeholder="أدخل اسمك الكامل"
                        required
                      />
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-black" />
                          رقم الهاتف <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.applicantPhone}
                          onChange={(e) =>
                            setFormData({ ...formData, applicantPhone: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-4 focus:ring-black/10 transition-all"
                          placeholder="+218 XX XXX XXXX"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-black" />
                          البريد الإلكتروني
                        </label>
                        <input
                          type="email"
                          value={formData.applicantEmail}
                          onChange={(e) =>
                            setFormData({ ...formData, applicantEmail: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-4 focus:ring-black/10 transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    {/* CV Upload */}
                    <div>
                      <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-black" />
                        السيرة الذاتية (اختياري)
                      </label>
                      {formData.cvUrl ? (
                        <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                          <FileText className="w-5 h-5 text-green-600" />
                          <span className="flex-1 text-sm text-green-700 font-medium">
                            تم رفع السيرة الذاتية ✓
                          </span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, cvUrl: '' })}
                            className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-black hover:bg-gray-50 transition-all">
                            {uploadingCV ? (
                              <>
                                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                جاري الرفع...
                              </>
                            ) : (
                              <>
                                <Upload className="w-5 h-5" />
                                رفع السيرة الذاتية (PDF, JPG, PNG)
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleCVUpload}
                            disabled={uploadingCV}
                            className="hidden"
                          />
                        </label>
                      )}
                      <p className="text-xs text-gray-500 mt-2">الحد الأقصى: 5 ميجابايت</p>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                        <Send className="w-4 h-4 text-black" />
                        رسالة التقديم <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-4 focus:ring-black/10 transition-all resize-none"
                        rows={5}
                        placeholder="أخبرنا عن نفسك ولماذا تريد الانضمام لفريقنا..."
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isApplying}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                    >
                      {isApplying ? (
                        <>
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="w-6 h-6" />
                          إرسال الطلب
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
      `}</style>
    </section>
  );
}
