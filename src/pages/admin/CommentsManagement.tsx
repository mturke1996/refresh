import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Comment } from '../../types';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { Trash2, Check, X, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CommentsManagement() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Comment[];
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('حدث خطأ أثناء جلب التعليقات');
    } finally {
      setLoading(false);
    }
  };

  const approveComment = async (commentId: string, approved: boolean) => {
    try {
      await updateDoc(doc(db, 'comments', commentId), { approved });
      toast.success(approved ? 'تم قبول التعليق' : 'تم رفض التعليق');
      fetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('حدث خطأ أثناء تحديث التعليق');
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;

    try {
      await deleteDoc(doc(db, 'comments', commentId));
      toast.success('تم حذف التعليق');
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('حدث خطأ أثناء حذف التعليق');
    }
  };

  const submitReply = async (commentId: string) => {
    const reply = replyText[commentId]?.trim();
    if (!reply) {
      toast.error('الرجاء كتابة رد');
      return;
    }

    try {
      await updateDoc(doc(db, 'comments', commentId), {
        adminReply: reply,
        approved: true, // Auto-approve when replying
      });
      toast.success('تم إضافة الرد');
      setReplyText({ ...replyText, [commentId]: '' });
      fetchComments();
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('حدث خطأ أثناء إضافة الرد');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 skeleton rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">إدارة التعليقات</h2>
        <p className="text-gray-600 mt-1">
          إجمالي التعليقات: {comments.length} | غير مراجعة:{' '}
          {comments.filter((c) => !c.approved).length}
        </p>
      </div>

      <div className="space-y-4">
        {comments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`card p-6 ${!comment.approved ? 'border-2 border-orange-200' : ''}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{comment.userName}</h3>
                  {renderStars(comment.rating)}
                  {!comment.approved && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                      قيد المراجعة
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{formatDate(comment.createdAt)}</p>
              </div>
              
              <div className="flex gap-2">
                {!comment.approved && (
                  <>
                    <button
                      onClick={() => approveComment(comment.id, true)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                      title="قبول"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => approveComment(comment.id, false)}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                      title="رفض"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  title="حذف"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{comment.text}</p>

            {/* Admin Reply */}
            {comment.adminReply ? (
              <div className="bg-blue-50 rounded-lg p-4 border-r-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm text-blue-900">رد الإدارة</span>
                </div>
                <p className="text-sm text-blue-800">{comment.adminReply}</p>
              </div>
            ) : (
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="اكتب ردك هنا..."
                    value={replyText[comment.id] || ''}
                    onChange={(e) =>
                      setReplyText({ ...replyText, [comment.id]: e.target.value })
                    }
                    className="input flex-1"
                  />
                  <button
                    onClick={() => submitReply(comment.id)}
                    className="btn-primary px-6"
                  >
                    إرسال
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="card p-12 text-center text-gray-500">
          لا توجد تعليقات حتى الآن
        </div>
      )}
    </div>
  );
}

