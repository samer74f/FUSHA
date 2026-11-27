# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## المعدات والتجهيز

شغّل `npm install` ثم `npm run dev`. يظهر دليل المعدات وقائمة تجهيز الضيف مباشرةً، وتُحفظ تعديلات الضيف في المتصفح.

لتفعيل الإعلانات المشتركة وحفظ قائمة التجهيز في الحساب:

1. طبّق ملف `supabase/migrations/20261121172100_equipment.sql` على مشروع Supabase من خلال محرّر SQL. ينشئ الملف الجداول الثلاثة وسياسات الوصول ويضيف بيانات الدليل وقوالب التجهيز.
2. انسخ `.env.example` إلى `.env.local` واملأ عنوان مشروع Supabase ومفتاحه القابل للنشر. أعد تشغيل Vite بعد حفظ الملف.
3. فعّل تسجيل الدخول بالبريد الإلكتروني وأضف عنوان تشغيل التطبيق إلى عناوين إعادة التوجيه المسموح بها في Supabase Auth. يُرسل التطبيق رابط دخول بالبريد.

تُحفظ حالة التجهيز لكل مجموعة من نوع الرحلة ومدتها وطبيعتها. يستطيع الزائر عرض الإعلانات، ويستطيع المستخدم المسجّل نشر إعلان بصورة من رابط وتعديل إعلاناته وحذفها.
