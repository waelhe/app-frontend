# نبض (Nabd) - Mobile App

تحويل تطبيق نبض إلى تطبيق جوال باستخدام Capacitor.

## المتطلبات

- Node.js 18+
- Bun
- Android Studio (لتطوير Android)
- JDK 17+

## الإعداد السريع

### 1. تثبيت التبعيات
```bash
bun install
```

### 2. بناء التطبيق للموبايل
```bash
bun run mobile:build
```

### 3. فتح المشروع في Android Studio
```bash
bun run mobile:open:android
```

### 4. تشغيل على الجهاز/المحاكي
```bash
bun run mobile:run:android
```

## أوامر التطوير

| الأمر | الوصف |
|-------|-------|
| `bun run mobile:build` | بناء نسخة ثابتة ونسخها لـ Android |
| `bun run mobile:dev` | تشغيل مع إعادة تحميل مباشرة |
| `bun run mobile:open:android` | فتح في Android Studio |
| `bun run mobile:run:android` | تشغيل على جهاز متصل |
| `bun run mobile:sync` | مزامنة الملفات مع Android |
| `bun run mobile:copy` | نسخ الملفات فقط بدون مزامنة |

## هيكل المشروع

```
├── android/                    # مشروع Android الأصلي
│   ├── app/
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── res/            # أيقونات، ألوان، سلاش
│   │       └── java/           # MainActivity
│   └── build.gradle
├── capacitor.config.ts         # إعدادات Capacitor
├── scripts/
│   ├── mobile-build.sh         # سكربت البناء
│   └── mobile-dev.sh           # سكربت التطوير
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   └── icons/                  # أيقونات التطبيق
└── src/
    ├── lib/
    │   ├── mobile-detect.ts    # كشف بيئة الموبايل
    │   ├── capacitor-plugins.ts # واجهة الإضافات
    │   └── api.ts              # API (يدعم Web + Mobile)
    ├── hooks/
    │   └── useMobileApp.ts     # React hook للموبايل
    └── components/
        └── system/
            └── CapacitorInitializer.tsx  # تهيئة الموبايل
```

## إضافات Capacitor المتاحة

| الإضافة | الوصف |
|---------|-------|
| **Haptics** | اهتزاز وتغذية راجعة |
| **Camera** | التقاط صور / اختيار من المعرض |
| **Geolocation** | تحديد الموقع الجغرافي |
| **Network** | مراقبة حالة الاتصال |
| **Share** | مشاركة المحتوى |
| **Local Notifications** | إشعارات محلية |
| **Keyboard** | التحكم بلوحة المفاتيح |
| **Status Bar** | شريط الحالة |
| **Splash Screen** | شاشة البدء |
| **Preferences** | تخزين محلي آمن |
| **Filesystem** | قراءة/كتابة الملفات |
| **App** | دورة حياة التطبيق |

## التطوير مع إعادة التحميل المباشر

1. حدد عنوان IP المحلي في `capacitor.config.ts`:
```typescript
server: {
  url: 'http://192.168.1.100:3000',
}
```

2. شغّل خادم التطوير:
```bash
bun run dev
```

3. شغّل على الجهاز:
```bash
npx cap run android --livereload
```

## ملاحظات مهمة

- **API**: في الموبايل، يتصل التطبيق مباشرة بالخلفية (بدون proxy)
- **RTL**: التطبيق يدعم العربية بالكامل (android:supportsRtl="true")
- **الصلاحيات**: كاميرا، موقع، إشعارات، تخزين
- **البناء**: يتم تحويل Next.js لملفات ثابتة (output: 'export')

## نشر التطبيق

### إنشاء APK للتجربة
```bash
cd android
./gradlew assembleDebug
```
الملف: `android/app/build/outputs/apk/debug/app-debug.apk`

### إنشاء نسخة الإنتاج
```bash
cd android
./gradlew assembleRelease
```
يحتاج ملف توقيع (keystore).
