import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Settings } from '../../types';
import toast from 'react-hot-toast';
import {
  Save,
  Plus,
  X,
  Instagram,
  Facebook,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  Settings as SettingsIcon,
} from 'lucide-react';

export default function SettingsManagement() {
  const [settings, setSettings] = useState<Settings>({
    shopName: 'Refresh',
    shopNameEn: 'Refresh',
    logoUrl: '',
    phone: '',
    email: '',
    address: '',
    telegramChatIds: [],
    workingHours: '',
    deliveryFee: 0,
    minOrderAmount: 0,
    socialMedia: {
      instagram: '',
      facebook: '',
      snapchat: '',
      tiktok: '',
      website: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newChatId, setNewChatId] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'general');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSettings(docSnap.data() as Settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('حدث خطأ أثناء جلب الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const addChatId = () => {
    if (!newChatId.trim()) {
      toast.error('الرجاء إدخال معرف المحادثة');
      return;
    }

    if (settings.telegramChatIds.includes(newChatId.trim())) {
      toast.error('هذا المعرف موجود بالفعل');
      return;
    }

    setSettings({
      ...settings,
      telegramChatIds: [...settings.telegramChatIds, newChatId.trim()],
    });
    setNewChatId('');
  };

  const removeChatId = (chatId: string) => {
    setSettings({
      ...settings,
      telegramChatIds: settings.telegramChatIds.filter((id) => id !== chatId),
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
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
            <SettingsIcon className="w-8 h-8 text-blue-600" />
            إعدادات المتجر
          </h2>
          <p className="text-gray-600 text-sm mt-1">إدارة معلومات المتجر والتواصل</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 group"
        >
          <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Shop Info */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-4">معلومات المقهى</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">اسم المقهى (عربي)</label>
              <input
                type="text"
                value={settings.shopName}
                onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">اسم المقهى (إنجليزي)</label>
              <input
                type="text"
                value={settings.shopNameEn || ''}
                onChange={(e) => setSettings({ ...settings, shopNameEn: e.target.value })}
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">رابط الشعار</label>
              <input
                type="url"
                value={settings.logoUrl || ''}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                className="input"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-4">معلومات التواصل</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="input"
                placeholder="+966 XX XXX XXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="input"
                placeholder="info@refresh-cafe.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">العنوان</label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">ساعات العمل</label>
              <input
                type="text"
                value={settings.workingHours || ''}
                onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                className="input"
                placeholder="السبت - الخميس: 8:00 ص - 12:00 م"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            وسائل التواصل الاجتماعي
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-500" />
                إنستقرام
              </label>
              <input
                type="url"
                value={settings.socialMedia?.instagram || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialMedia: {
                      ...settings.socialMedia,
                      instagram: e.target.value,
                    },
                  })
                }
                className="input"
                placeholder="https://instagram.com/refresh_cafe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-600" />
                فيسبوك
              </label>
              <input
                type="url"
                value={settings.socialMedia?.facebook || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialMedia: {
                      ...settings.socialMedia,
                      facebook: e.target.value,
                    },
                  })
                }
                className="input"
                placeholder="https://facebook.com/refresh.cafe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <span className="text-yellow-400">📸</span>
                سناب شات
              </label>
              <input
                type="url"
                value={settings.socialMedia?.snapchat || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialMedia: {
                      ...settings.socialMedia,
                      snapchat: e.target.value,
                    },
                  })
                }
                className="input"
                placeholder="https://snapchat.com/add/refresh_cafe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <span>🎵</span>
                تيك توك
              </label>
              <input
                type="url"
                value={settings.socialMedia?.tiktok || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialMedia: {
                      ...settings.socialMedia,
                      tiktok: e.target.value,
                    },
                  })
                }
                className="input"
                placeholder="https://tiktok.com/@refresh_cafe"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-600" />
                الموقع الإلكتروني
              </label>
              <input
                type="url"
                value={settings.socialMedia?.website || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialMedia: {
                      ...settings.socialMedia,
                      website: e.target.value,
                    },
                  })
                }
                className="input"
                placeholder="https://refresh-cafe.com"
              />
            </div>
          </div>
        </div>

        {/* Telegram Settings */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-4">إعدادات التليجرام</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">معرفات المحادثة (Chat IDs)</label>
            <p className="text-sm text-gray-600 mb-3">
              لاستخراج Chat ID: أرسل رسالة لبوتك على تليجرام، ثم افتح:
              <br />
              <code className="bg-gray-100 px-2 py-1 rounded">
                https://api.telegram.org/bot[YOUR_BOT_TOKEN]/getUpdates
              </code>
            </p>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newChatId}
                onChange={(e) => setNewChatId(e.target.value)}
                className="input flex-1"
                placeholder="أدخل Chat ID"
              />
              <button onClick={addChatId} className="btn-primary px-6">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {settings.telegramChatIds.map((chatId) => (
                <div
                  key={chatId}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <code className="font-mono text-sm">{chatId}</code>
                  <button
                    onClick={() => removeChatId(chatId)}
                    className="p-1 hover:bg-red-100 text-red-500 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              {settings.telegramChatIds.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  لم يتم إضافة أي معرفات محادثة
                </p>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
            <p className="font-medium text-yellow-900 mb-1">⚠️ ملاحظة أمنية مهمة</p>
            <p className="text-yellow-800">
              لا تقم بحفظ Telegram Bot Token في قاعدة البيانات. يجب حفظه في Firebase Functions
              Config فقط باستخدام الأمر:
              <br />
              <code className="bg-yellow-100 px-2 py-1 rounded mt-2 inline-block">
                firebase functions:config:set telegram.token="YOUR_BOT_TOKEN"
              </code>
            </p>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-4">إعدادات التوصيل</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">رسوم التوصيل (ر.س)</label>
              <input
                type="number"
                value={settings.deliveryFee || 0}
                onChange={(e) =>
                  setSettings({ ...settings, deliveryFee: parseFloat(e.target.value) })
                }
                className="input"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">الحد الأدنى للطلب (ر.س)</label>
              <input
                type="number"
                value={settings.minOrderAmount || 0}
                onChange={(e) =>
                  setSettings({ ...settings, minOrderAmount: parseFloat(e.target.value) })
                }
                className="input"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
