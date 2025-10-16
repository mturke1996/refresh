# سياسة الأمان - Refresh Cafe

## ⚠️ ملاحظات أمنية حرجة

### 1. الأسرار والمفاتيح

#### ✅ افعل:
- احفظ Telegram Bot Token في Firebase Functions Config فقط
- استخدم Environment Variables لمفاتيح Firebase
- لا تضع أي أسرار في Git أو الكود المصدري

#### ❌ لا تفعل:
- لا تضع Bot Token في Firestore أو أي database
- لا تشارك ملف `.env` أبداً
- لا تعرض المفاتيح في console.log

### 2. Firebase Functions Config

```bash
# إعداد التوكن بشكل صحيح
firebase functions:config:set telegram.token="YOUR_BOT_TOKEN"

# عرض التكوين الحالي (للتحقق فقط)
firebase functions:config:get

# حذف إعداد
firebase functions:config:unset telegram.token
```

### 3. قواعد Firestore Security

#### القواعد الحالية تحمي:
- ✅ المنتجات: القراءة للجميع، الكتابة للمشرفين فقط
- ✅ الطلبات: الإنشاء للجميع، القراءة/التعديل للمشرفين
- ✅ التعليقات: الإنشاء للجميع (يُحفظ كـ غير مُوافَق)، الموافقة للمشرفين
- ✅ الإعدادات: القراءة للجميع، الكتابة للمشرفين

#### اختبار القواعد:
```bash
# في Firebase Console > Firestore > Rules > Rules Playground
# أو استخدم Firebase Emulator Suite
firebase emulators:start
```

### 4. Storage Security Rules

```javascript
// الحماية المطبقة
- حجم الصورة: أقصى 5MB
- نوع الملف: صور فقط (image/*)
- الكتابة: مشرفين فقط
- القراءة: الجميع
```

### 5. Authentication

#### تأمين حسابات المشرفين:
1. استخدم كلمات مرور قوية (16+ حرف)
2. فعّل Multi-Factor Authentication في Firebase Console
3. راجع نشاطات تسجيل الدخول بانتظام
4. غيّر كلمات المرور دورياً

#### Custom Claims (مستقبلي):
```javascript
// يمكن إضافة Custom Claims للمشرفين
admin.auth().setCustomUserClaims(uid, { admin: true });
```

### 6. Rate Limiting

#### حماية ضد الإساءة:
- Functions تتضمن rate limiting أساسي
- يمكن استخدام Firebase App Check للحماية الإضافية

```bash
# تفعيل App Check (اختياري)
firebase appcheck:enable
```

### 7. HTTPS & Headers

#### Headers الأمنية المطبقة (Netlify):
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: ...
```

### 8. البيانات الحساسة

#### ما يُحفظ:
- أسماء العملاء
- أرقام الهواتف
- العناوين (للتوصيل فقط)

#### الحماية:
- لا يتم مشاركة بيانات العملاء مع أطراف ثالثة
- الطلبات محمية ويمكن الوصول إليها من المشرفين فقط
- يُنصح بحذف الطلبات القديمة (30+ يوم) دورياً

### 9. Backup & Recovery

#### النسخ الاحتياطي:
```bash
# تصدير Firestore
gcloud firestore export gs://[BUCKET_NAME]/backups/

# جدولة نسخ احتياطي تلقائي في Firebase Console
# Project Settings > Backups
```

### 10. Monitoring & Logging

#### مراقبة الأمان:
1. راجع Firebase Console > Authentication > Sign-in Methods
2. تحقق من Functions Logs بانتظام:
```bash
firebase functions:log
```
3. راجع Admin Logs في Firestore > admin_logs

### 11. تحديثات الأمان

#### حافظ على تحديث:
```bash
# تحديث الحزم
npm update
npm audit fix

# تحديث Functions
cd functions
npm update
npm audit fix
```

#### Security Audits:
```bash
# فحص الثغرات
npm audit

# إصلاح تلقائي
npm audit fix

# إصلاح يدوي للثغرات الحرجة
npm audit fix --force
```

### 12. الإبلاغ عن الثغرات

إذا اكتشفت ثغرة أمنية:
1. **لا تنشرها علناً**
2. أرسل تقرير مفصل إلى: security@refresh-cafe.com
3. انتظر الرد (عادة خلال 48 ساعة)

التقرير يجب أن يتضمن:
- وصف الثغرة
- خطوات إعادة الإنتاج
- التأثير المحتمل
- اقتراح للإصلاح (إن أمكن)

### 13. Checklist أمان ما قبل الإنتاج

- [ ] تم تغيير جميع كلمات المرور الافتراضية
- [ ] تم تفعيل Firestore & Storage Rules
- [ ] تم حفظ Telegram Token في Functions Config
- [ ] لا يوجد مفاتيح في الكود المصدري
- [ ] تم اختبار قواعد الأمان
- [ ] تم تفعيل HTTPS
- [ ] تم إعداد Security Headers
- [ ] تم مراجعة Admin Users
- [ ] تم إعداد Backup تلقائي
- [ ] تم تفعيل Monitoring & Alerts

### 14. أدوات مساعدة

#### Firebase Security Scanner:
```bash
# فحص قواعد الأمان
firebase emulators:start
# ثم استخدم Rules Playground في Console
```

#### Security Extensions:
- Firebase App Check
- reCAPTCHA Enterprise
- Identity Platform

### 15. الامتثال

#### GDPR Compliance:
- يحق للمستخدمين طلب حذف بياناتهم
- يتم حفظ البيانات فقط للطلبات والتعليقات
- لا يتم مشاركة البيانات مع أطراف ثالثة

#### توثيق الموافقة:
يُنصح بإضافة صفحة Privacy Policy و Terms of Service

---

## 📞 جهات الاتصال

**Security Team:**
- Email: security@refresh-cafe.com
- PGP Key: [يمكن إضافة مفتاح PGP للتشفير]

**Response Time:**
- Critical: 24 hours
- High: 48 hours
- Medium: 1 week
- Low: 2 weeks

---

**آخر تحديث:** 2024-10-16

**Security Version:** 1.0

