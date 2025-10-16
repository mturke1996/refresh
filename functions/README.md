# Refresh Cafe - Firebase Cloud Functions

هذا المجلد يحتوي على Firebase Cloud Functions للمشروع.

## الوظائف المتاحة

### 1. sendOrderToTelegram
وظيفة `callable` تُستدعى عند إنشاء طلب جديد. ترسل تفاصيل الطلب إلى بوت التليجرام.

**المدخلات:**
```typescript
{
  orderId: string
}
```

**المخرجات:**
```typescript
{
  success: boolean,
  message: string
}
```

### 2. cleanupOldLogs
وظيفة مجدولة تعمل يومياً لحذف السجلات القديمة (أكثر من 30 يوم).

## الإعداد

### 1. تثبيت الحزم
```bash
cd functions
npm install
```

### 2. إعداد Telegram Bot Token
```bash
firebase functions:config:set telegram.token="YOUR_BOT_TOKEN"
```

للحصول على Bot Token:
1. افتح @BotFather على تليجرام
2. أرسل `/newbot` واتبع التعليمات
3. احفظ الـ Token الذي سيعطيك إياه

### 3. البناء
```bash
npm run build
```

### 4. النشر
```bash
npm run deploy
```

أو لنشر وظيفة واحدة:
```bash
firebase deploy --only functions:sendOrderToTelegram
```

## الاختبار المحلي

لتشغيل Functions محلياً مع المحاكيات:
```bash
npm run serve
```

## الأمان

⚠️ **ملاحظة مهمة:** 
- لا تقم بحفظ Telegram Bot Token في الكود أو قاعدة البيانات
- استخدم `functions:config:set` فقط
- لا تشارك الـ Token مع أي شخص

## معرفات المحادثة (Chat IDs)

لمعرفة Chat ID الخاص بك:
1. أرسل رسالة لبوتك على تليجرام
2. افتح الرابط التالي في المتصفح:
```
https://api.telegram.org/bot[YOUR_BOT_TOKEN]/getUpdates
```
3. ابحث عن `"chat":{"id":123456789}`
4. احفظ هذا الرقم في إعدادات المتجر من لوحة الإدارة

## السجلات

لعرض سجلات Functions:
```bash
npm run logs
```

أو عبر Firebase Console:
https://console.firebase.google.com/project/[PROJECT_ID]/functions

## استكشاف الأخطاء

### الخطأ: "Telegram bot token not configured"
```bash
firebase functions:config:set telegram.token="YOUR_BOT_TOKEN"
firebase deploy --only functions
```

### الخطأ: "No Telegram recipients configured"
أضف Chat IDs من لوحة الإدارة -> الإعدادات -> إعدادات التليجرام

## التطوير

### إضافة وظيفة جديدة
1. افتح `src/index.ts`
2. أضف الوظيفة الجديدة:
```typescript
export const myNewFunction = functions.https.onCall(async (data, context) => {
  // Your code here
});
```
3. قم بالبناء والنشر

### المتغيرات البيئية
```bash
# تعيين متغير
firebase functions:config:set myvar.key="value"

# عرض جميع المتغيرات
firebase functions:config:get

# حذف متغير
firebase functions:config:unset myvar.key
```

## الموارد

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Telegram Bot API](https://core.telegram.org/bots/api)

