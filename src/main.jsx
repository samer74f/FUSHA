import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider.jsx";
import { supabase } from "./components/auth/supabaseClient.js";
import { CartProvider } from "./components/store/CartProvider.jsx";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {supabase ? (
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    ) : (
      <main className="site-content">
        <h1>FUSHA</h1>
        <p role="status">Set the Supabase project URL and publishable key to connect FUSHA.</p>
      </main>
    )}
  </StrictMode>,
);
