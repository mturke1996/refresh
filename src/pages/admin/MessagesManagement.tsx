import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { Mail, Trash2, Check, Clock, User, Phone, MessageSquare, Eye, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  message: string;
  read: boolean;
  createdAt: any;
}

export default function MessagesManagement() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('حدث خطأ أثناء جلب الرسائل');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        read: true,
      });
      toast.success('تم تحديد الرسالة كمقروءة');
      fetchMessages();
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('حدث خطأ');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    try {
      await deleteDoc(doc(db, 'messages', messageId));
      toast.success('تم حذف الرسالة بنجاح');
      fetchMessages();
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'unread') return !msg.read;
    if (filter === 'read') return msg.read;
    return true;
  });

  const unreadCount = messages.filter(m => !m.read).length;

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Mail className="w-8 h-8 text-purple-600" />
            الرسائل الواردة
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full animate-pulse">
                {unreadCount} جديد
              </span>
            )}
          </h2>
          <p className="text-gray-600 text-sm mt-1">رسائل العملاء والاستفسارات</p>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              filter === 'all' 
                ? 'bg-purple-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            الكل ({messages.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              filter === 'unread' 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            غير مقروء ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              filter === 'read' 
                ? 'bg-green-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            مقروء ({messages.length - unreadCount})
          </button>
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className="card p-16 text-center">
          <Mail className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {filter === 'all' ? 'لا توجد رسائل' : `لا توجد رسائل ${filter === 'unread' ? 'غير مقروءة' : 'مقروءة'}`}
          </h3>
          <p className="text-gray-500">سيتم عرض الرسائل الواردة هنا</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setSelectedMessage(message);
                  if (!message.read) markAsRead(message.id);
                }}
                className={`card p-6 cursor-pointer transition-all hover:shadow-xl ${
                  !message.read ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200' : 'hover:border-gray-300'
                } ${selectedMessage?.id === message.id ? 'ring-4 ring-purple-500/30 border-purple-500' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !message.read ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gray-200'
                    }`}>
                      <User className={`w-6 h-6 ${!message.read ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{message.name}</h3>
                        {!message.read && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
                            جديد
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                        {message.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {message.email}
                          </span>
                        )}
                        {message.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {message.phone}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 line-clamp-2 leading-relaxed">
                        {message.message}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDate(message.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Message Details / Preview */}
          <div className="lg:sticky lg:top-24 h-fit">
            <AnimatePresence mode="wait">
              {selectedMessage ? (
                <motion.div
                  key={selectedMessage.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="card p-8 bg-gradient-to-br from-white to-purple-50 shadow-2xl border-2 border-purple-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Eye className="w-6 h-6 text-purple-600" />
                      تفاصيل الرسالة
                    </h3>
                    {!selectedMessage.read && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        تم وضع علامة مقروء
                      </span>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Sender Info */}
                    <div className="p-4 bg-white rounded-2xl border-2 border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <User className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">{selectedMessage.name}</h4>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(selectedMessage.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {selectedMessage.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <a href={`mailto:${selectedMessage.email}`} className="text-purple-600 hover:underline">
                              {selectedMessage.email}
                            </a>
                          </div>
                        )}
                        {selectedMessage.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <a href={`tel:${selectedMessage.phone}`} className="text-purple-600 hover:underline">
                              {selectedMessage.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl border-2 border-purple-100">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                        <span className="font-bold text-gray-900">الرسالة:</span>
                      </div>
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {!selectedMessage.read && (
                        <button
                          onClick={() => markAsRead(selectedMessage.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 font-medium group"
                        >
                          <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          تحديد كمقروء
                        </button>
                      )}
                      <button
                        onClick={() => deleteMessage(selectedMessage.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-medium group"
                      >
                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        حذف
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card p-12 text-center"
                >
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">اختر رسالة</h3>
                  <p className="text-gray-500 text-sm">اضغط على أي رسالة لعرض التفاصيل</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

