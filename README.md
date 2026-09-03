# حِصن — Hissn

تطبيق أذكار الصباح والمساء (React + Vite + Capacitor).

## خطوات البناء على GitHub

1. ارفع هذا المجلد إلى مستودع جديد على GitHub (الفرع `main`).
2. سير العمل `.github/workflows/build-apk.yml` سيبني الـ APK تلقائيًا عند الدفع.
3. افتح **Actions** → اختر آخر تشغيل → قسم **Artifacts** → نزّل `hissn-apk`.

الاسم يظهر «حِصن» بالعربية و «Hissn» تلقائيًا عندما يكون لغة الهاتف إنجليزية.

## محليًا

```bash
npm install
npm run dev          # اختبار الويب
npm run build        # بناء الويب
npx cap add android  # إضافة منصة أندرويد
npx cap sync android
npx capacitor-assets generate --android
cd android && ./gradlew assembleRelease
```