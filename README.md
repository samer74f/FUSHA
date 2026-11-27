# FUSHA

FUSHA helps people discover outdoor activities, plan trips, and shop for gear. The `feature/store-auth` branch contains Youssef's work on accounts, profiles, the store, the cart, and orders.

## Run the project

1. Install the dependencies.

   ```bash
   npm install
   ```

2. Create a local configuration file.

   ```bash
   cp .env.example .env.local
   ```

3. Add the Supabase project URL and publishable key to `.env.local`.

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

4. Start the development server.

   ```bash
   npm run dev
   ```

Keep the `service_role` key and any other secret out of variables prefixed with `VITE_` and out of GitHub.

## Branch features

- Sign up, sign in, sign out, and restore Supabase Auth sessions after a refresh.
- Require a signed-in account to access the store, cart, orders, and profile pages.
- View and edit the name on your own profile.
- Browse product details, search, and filter by category or price.
- Sync the user's cart and keep a local copy when Supabase sync fails.
- Place orders without online payment. The `place_order` function checks stock and prices, saves the order details, and updates inventory.
- View past orders and manage the store.

## Database and permissions

The store schema is applied to the shared FUSHA project. The [store migration](supabase/migrations/20261120000100_store_cart_orders.sql) reuses `profiles` and creates `products`, `cart_items`, `orders`, and `order_items` with row-level security (RLS).

The `/admin/store` page checks for `app_metadata.role = "admin"` or an `admin` entry in `app_metadata.roles`. The Supabase organization **Developer** role grants organization access. Store administration uses the app role, which regular users cannot grant themselves through the browser. To set up the first store admin, the project owner uses the Supabase Auth Admin API from a trusted server-side environment and keeps the service key out of the frontend. After the update, the admin signs out and back in to refresh the session.

The store starts without sample products. After setting up an administrator, use `/admin/store` to add products, prices, images, and stock.

## Routes

| Route | Purpose |
| --- | --- |
| `/register` and `/login` | Create an account and sign in |
| `/profile` | Your profile |
| `/store` and `/store/:productId` | Store catalog and product details |
| `/cart` and `/checkout` | Cart and checkout |
| `/orders` | Orders placed by the signed-in user |
| `/admin/store` | Product and order management for store administrators |

## Local checks

```bash
npm run lint
npm run build
```

To test checkout, sign in and add products from a store administrator account. Add a product to the cart, place an order, and verify that the order appears and stock decreases.
