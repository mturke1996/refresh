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
  Upload,
  Image as ImageIcon,
  Twitter,
  Youtube,
} from 'lucide-react';
import { uploadToImgBB } from '../../utils/imgbbUpload';

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
      twitter: '',
      youtube: '',
      snapchat: '',
      tiktok: '',
      website: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newChatId, setNewChatId] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('الرجاء اختيار صورة');
      return;
    }

    setUploadingLogo(true);
    try {
      const imageUrl = await uploadToImgBB(file);
      setSettings({ ...settings, logoUrl: imageUrl });
      toast.success('تم رفع الشعار بنجاح');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploadingLogo(false);
    }
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
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                شعار المقهى
              </label>

              {/* Logo Preview */}
              {settings.logoUrl && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">الشعار الحالي:</p>
                  <img
                    src={settings.logoUrl}
                    alt="Logo"
                    className="h-20 w-auto object-contain bg-white p-2 rounded-lg shadow-sm"
                  />
                </div>
              )}

              {/* Upload Button */}
              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {uploadingLogo ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                        جاري الرفع...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        رفع صورة جديدة
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                الحد الأقصى: 5 ميجابايت • الأبعاد المقترحة: 200x200 بكسل
              </p>

              {/* Manual URL Input */}
              <div className="mt-4">
                <label className="block text-xs text-gray-600 mb-2">
                  أو أدخل رابط الشعار يدوياً:
                </label>
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
                <Twitter className="w-4 h-4 text-sky-500" />
                تويتر
              </label>
              <input
                type="url"
                value={settings.socialMedia?.twitter || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialMedia: {
                      ...settings.socialMedia,
                      twitter: e.target.value,
                    },
                  })
                }
                className="input"
                placeholder="https://twitter.com/refresh_cafe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-600" />
                يوتيوب
              </label>
              <input
                type="url"
                value={settings.socialMedia?.youtube || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialMedia: {
                      ...settings.socialMedia,
                      youtube: e.target.value,
                    },
                  })
                }
                className="input"
                placeholder="https://youtube.com/@refresh_cafe"
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
        <div className="card p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">📱</span>
            إعدادات بوت التليجرام
          </h3>

          {/* Bot Info */}
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4">
            <p className="font-medium text-blue-900 mb-2">🤖 معلومات البوت</p>
            <div className="space-y-1 text-sm text-blue-800">
              <p>
                • اسم البوت: <code className="bg-blue-200 px-2 py-0.5 rounded">@Refrehs_bot</code>
              </p>
              <p>
                • الرابط:{' '}
                <a
                  href="https://t.me/Refrehs_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600"
                >
                  https://t.me/Refrehs_bot
                </a>
              </p>
            </div>
          </div>

          {/* How to get Chat ID */}
          <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-4">
            <p className="font-medium text-green-900 mb-2">✅ كيفية الحصول على Chat ID:</p>
            <ol className="text-sm text-green-800 space-y-1 mr-5 list-decimal">
              <li>
                افتح التليجرام وابحث عن:{' '}
                <code className="bg-green-200 px-2 py-0.5 rounded">@Refrehs_bot</code>
              </li>
              <li>
                اضغط على زر <strong>Start</strong> أو اكتب{' '}
                <code className="bg-green-200 px-2 py-0.5 rounded">/start</code>
              </li>
              <li>سيرسل لك البوت رسالة ترحيبية تحتوي على Chat ID الخاص بك</li>
              <li>انسخ Chat ID والصقه في الحقل أدناه</li>
            </ol>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">معرف المحادثة (Chat ID) 🆔</label>
            <p className="text-xs text-gray-600 mb-3">
              ستصلك الإشعارات على الحسابات التي تضيفها هنا
            </p>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newChatId}
                onChange={(e) => setNewChatId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addChatId()}
                className="input flex-1"
                placeholder="أدخل Chat ID (مثال: 123456789)"
              />
              <button onClick={addChatId} className="btn-primary px-6 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                إضافة
              </button>
            </div>

            <div className="space-y-2">
              {settings.telegramChatIds.map((chatId) => (
                <div
                  key={chatId}
                  className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <code className="font-mono text-sm font-medium">{chatId}</code>
                  </div>
                  <button
                    onClick={() => removeChatId(chatId)}
                    className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              {settings.telegramChatIds.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-2xl mb-2">🔔</p>
                  <p className="text-sm text-gray-500 font-medium">لم يتم إضافة أي معرفات محادثة</p>
                  <p className="text-xs text-gray-400 mt-1">ابدأ بإضافة Chat ID لتفعيل الإشعارات</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Features */}
          {settings.telegramChatIds.length > 0 && (
            <div className="bg-purple-50 border border-purple-300 rounded-lg p-4 mb-4">
              <p className="font-medium text-purple-900 mb-2">🔔 الإشعارات المفعلة:</p>
              <ul className="text-sm text-purple-800 space-y-1 mr-5 list-disc">
                <li>🛒 طلب جديد - سيصلك إشعار فوري عند كل طلب</li>
                <li>⭐ تقييم جديد - سيصلك إشعار عند كل تقييم جديد</li>
                <li>💬 رسالة تواصل - سيصلك إشعار عند كل رسالة جديدة</li>
              </ul>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
            <p className="font-medium text-yellow-900 mb-1">⚠️ ملاحظة مهمة</p>
            <p className="text-yellow-800">
              • احفظ هذه الصفحة بعد إضافة Chat ID
              <br />
              • يمكنك إضافة أكثر من Chat ID لإرسال الإشعارات لعدة أشخاص
              <br />• تأكد من نشر Functions أولاً:{' '}
              <code className="bg-yellow-100 px-2 py-0.5 rounded">
                firebase deploy --only functions
              </code>
            </p>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-4">إعدادات التوصيل</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">رسوم التوصيل (د.ل)</label>
              <input
                type="number"
                value={settings.deliveryFee || 0}
                onChange={(e) =>
                  setSettings({ ...settings, deliveryFee: parseFloat(e.target.value) })
                }
                className="input"
                min="0"
                step="0.01"
                placeholder="مثال: 5"
              />
              <p className="text-xs text-gray-500 mt-1">رسوم التوصيل بالدينار الليبي</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">الحد الأدنى للطلب (د.ل)</label>
              <input
                type="number"
                value={settings.minOrderAmount || 0}
                onChange={(e) =>
                  setSettings({ ...settings, minOrderAmount: parseFloat(e.target.value) })
                }
                className="input"
                min="0"
                step="0.01"
                placeholder="مثال: 20"
              />
              <p className="text-xs text-gray-500 mt-1">الحد الأدنى لقبول الطلب</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
