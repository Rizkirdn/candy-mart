import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// --- 1. IMPORT LAYOUT ---
import ShopLayout from './components/layouts/ShopLayout';
import AdminLayout from './components/layouts/AdminLayout'; // Pastikan file ini ada

// --- 2. IMPORT HALAMAN USER ---
import Home from './pages/user/Home';
import Cart from './pages/user/Cart';
import Wishlist from './pages/user/Wishlist';
// login
// AUTH PAGES
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Settings from './pages/user/Settings';
// --- 3. IMPORT HALAMAN ADMIN ---
import Dashboard from './pages/admin/Dashboard';
import ProductList from './pages/admin/ProductList';
import ProductForm from './pages/admin/ProductForm';
import Orders from './pages/admin/Orders';

// --- KOMPONEN PROTEKSI (GUARD) ---
const AdminRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  
  // 1. Jika belum login, tendang ke Login
  if (!user) return <Navigate to="/login" replace />;
  
  // 2. Jika login tapi bukan admin, tendang ke Home
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="settings" element={<Settings />} />
        {/* === JALUR PEMBELI (TOKO) === */}
        <Route path="/" element={<ShopLayout />}>
          <Route index element={<Home />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
        </Route>

        {/* === JALUR ADMIN (DASHBOARD) === */}
        {/* Ini yang tadi hilang, makanya muncul warning "No routes matched" */}
        <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/create" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="orders" element={<Orders />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}