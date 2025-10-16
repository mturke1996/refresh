# ☕ Refresh Cafe - موقع المقهى الإلكتروني

> موقع إلكتروني احترافي متكامل لمقهى Refresh في طرابلس، ليبيا

[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7-orange.svg)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-cyan.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ المميزات

### 🏠 للعملاء
- ✅ **Hero Section** احترافي مع carousel للصور
- ✅ **قائمة المنتجات** التفاعلية مع الفئات
- ✅ **سلة تسوق** متقدمة
- ✅ **نظام العروض** المميزة
- ✅ **التقييمات والمراجعات** مع عرض مباشر
- ✅ **نظام الرسائل** للتواصل مع الإدارة
- ✅ **وسائل التواصل الاجتماعي** متكاملة
- ✅ **تصميم متجاوب** 100% للجوال

### ⚙️ لوحة الإدارة
- ✅ **Dashboard** مع إحصائيات شاملة
- ✅ **إدارة الفئات** مع أيقونات احترافية
- ✅ **إدارة المنتجات** المتقدمة (بحث، فلترة، تفعيل سريع)
- ✅ **نظام العروض** مع تواريخ وحالات
- ✅ **إدارة الطلبات** الواردة
- ✅ **إدارة الرسائل** من العملاء
- ✅ **إدارة التقييمات** مع إمكانية الرد
- ✅ **الإعدادات الشاملة** (معلومات المقهى، السوشيال ميديا، Telegram)

## 🚀 التقنيات المستخدمة

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS + Framer Motion
- **Backend:** Firebase (Firestore, Auth, Functions, Storage)
- **State Management:** Zustand
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Image Upload:** ImgBB API
- **Deployment:** Netlify

## 📦 التثبيت والتشغيل

### المتطلبات
- Node.js 16+ و npm
- حساب Firebase
- حساب ImgBB (للصور)
- حساب Telegram Bot (اختياري)

### خطوات التثبيت

1. **استنساخ المشروع**
```bash
git clone https://github.com/mturke1996/refresh.git
cd refresh
```

2. **تثبيت التبعيات**
```bash
npm install
```

3. **إعداد ملف البيئة**

أنشئ ملف `.env` في المجلد الرئيسي:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# ImgBB API Key
VITE_IMGBB_API_KEY=your-imgbb-api-key

# Telegram Bot (Optional)
VITE_TELEGRAM_BOT_TOKEN=your-bot-token
VITE_TELEGRAM_CHAT_ID=your-chat-id
```

4. **تشغيل المشروع**
```bash
npm run dev
```

5. **الوصول للموقع**
- الصفحة الرئيسية: `http://localhost:5173`
- لوحة الإدارة: `http://localhost:5173/admin`

## 🔧 إعداد Firebase

### قواعد Firestore
نشر القواعد الأمنية:
```bash
firebase deploy --only firestore:rules
```

### تفعيل Authentication
1. اذهب إلى Firebase Console → Authentication
2. فعّل Email/Password
3. أضف مستخدم إداري

## 🎨 التصميم

- **Glassmorphism** - تأثيرات زجاجية عصرية
- **Gradient Colors** - ألوان متدرجة احترافية
- **Smooth Animations** - حركات سلسة مع Framer Motion
- **Professional Icons** - أيقونات من Lucide React
- **Mobile-First** - تصميم يبدأ من الجوال
- **RTL Support** - دعم كامل للعربية

## 📱 السوشيال ميديا

المشروع يدعم:
- 📸 Instagram
- 👥 Facebook
- 👻 Snapchat
- 🎵 TikTok

## 🌍 معلومات المقهى

- 📍 **الموقع:** طرابلس، ليبيا
- ⏰ **ساعات العمل:** من 6 صباحاً إلى 2 ليلاً
- 💰 **العملة:** دينار ليبي (د.ل)
- 📱 **الهاتف:** +218 91 123 4567
- ✉️ **البريد:** info@refresh-cafe.ly

## 📊 البنية

```
refresh/
├── src/
│   ├── components/          # React components
│   ├── pages/              # Pages & Routes
│   │   └── admin/          # Admin panel
│   ├── store/              # Zustand stores
│   ├── utils/              # Utilities
│   ├── hooks/              # Custom hooks
│   ├── types/              # TypeScript types
│   └── firebase.ts         # Firebase config
├── functions/              # Cloud Functions
├── firestore.rules         # Security rules
└── public/                 # Static files
```

## 🔐 الأمان

- ✅ Firebase Security Rules
- ✅ Environment Variables
- ✅ Input Validation
- ✅ XSS Protection
- ✅ CORS Configuration
- ✅ Rate Limiting (Functions)

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 🤝 المساهمة

المساهمات مرحب بها! افتح issue أو pull request.

## 📞 الدعم

للدعم الفني، تواصل عبر:
- Email: info@refresh-cafe.ly
- GitHub Issues: [Create Issue](https://github.com/mturke1996/refresh/issues)

---

**صُنع بـ ❤️ في ليبيا** 🇱🇾

