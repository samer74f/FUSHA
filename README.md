# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Equipment and packing

Run `npm install`, then `npm run dev`. The equipment guide and guest packing checklist work immediately. Guest checklist changes are saved in the browser.

To enable shared listings and account-based packing lists:

1. For a new database, apply `supabase/migrations/20261121172100_equipment.sql` in Supabase SQL Editor. It creates the three tables, access policies, and built-in English guide and checklist data. The shared FUSHA project already has these tables.
2. Copy `.env.example` to `.env.local`, set the project URL and publishable key, and restart Vite.
3. Enable email sign-in and add the app address to the allowed redirect URLs in Supabase Auth. The app sends a sign-in link by email.

Packing state is saved by trip type, terrain, and duration. Visitors can view listings. Signed-in users can post listings using image URLs and edit or delete their own listings.

The client displays English labels for recognized built-in records from older databases while keeping existing saved item keys. User-entered names and listings keep their original text.
