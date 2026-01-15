import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Search, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import Chatbot from '../Chatbot';

export default function ShopLayout() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Untuk menu mobile

  // 1. AMBIL DATA DARI STORE (CART & AUTH)
  const cart = useCartStore((state) => state.cart);
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success("Berhasil Keluar");
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* 1. LOGO */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 group-hover:scale-105 transition">
                C
              </div>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Candy<span className="text-blue-600">Mart.</span>
              </span>
            </Link>


            {/* 3. MENU ICONS & AUTH */}
            <div className="hidden md:flex items-center gap-6">
              
              {/* Ikon Belanja */}
              <div className="flex items-center gap-4">
                <Link to="/wishlist" className="relative p-2 text-gray-400 hover:text-red-500 transition hover:bg-red-50 rounded-full">
                  <Heart size={24} />
                </Link>
                
                <Link to="/cart" className="relative p-2 text-gray-400 hover:text-blue-600 transition hover:bg-blue-50 rounded-full">
                  <ShoppingCart size={24} />
                  {cart.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white">
                      {cart.length}
                    </span>
                  )}
                </Link>
              </div>

              <div className="h-8 w-px bg-gray-200 mx-2"></div>

              {/* LOGIKA AUTH (LOGIN / REGISTER / USER) */}
              {user ? (
                // JIKA SUDAH LOGIN
                <div className="flex items-center gap-4">
                  <div className="text-right hidden lg:block">
                    <p className="text-xs text-gray-500 font-medium">Halo, selamat datang</p>
                    <p className="text-sm font-bold text-gray-900 line-clamp-1 max-w-[100px]">{user.name}</p>
                  </div>

                  {/* Dropdown User */}
                  <div className="relative group">
                    {/* GANTI BUTTON AVATAR LAMA DENGAN INI */}
                  <button className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm overflow-hidden">
                    {user.avatar ? (
                   <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                  </button>
                    
                    {/* Menu Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transform scale-95 opacity-0 invisible group-hover:scale-100 group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right z-50">
                      <div className="px-4 py-3 border-b bg-gray-50">
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      {/* Kalau ADMIN, muncul tombol Dashboard */}
                      {user.role === 'admin' && (
                        <Link to="/admin/dashboard" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                          <LayoutDashboard size={16} /> Dashboard Admin
                        </Link>
                      )}
                      <Link to="/settings" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                          <User size={16} /> Pengaturan Akun
                        </Link>

                      <button 
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut size={16} /> Keluar Akun
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // JIKA BELUM LOGIN (GUEST)
                <div className="flex gap-3">
                  <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-blue-600 transition">
                    Masuk
                  </Link>
                  <Link to="/register" className="px-5 py-2.5 text-sm font-bold bg-gray-900 text-white rounded-full hover:bg-blue-600 transition shadow-lg hover:shadow-blue-200">
                    Daftar
                  </Link>
                </div>
              )}

            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* --- MOBILE MENU (Dropdown Responsive) --- */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 space-y-4 animate-in slide-in-from-top-5">
            <input type="text" placeholder="Cari..." className="w-full p-3 bg-gray-100 rounded-xl text-sm" />
            
            <div className="flex flex-col gap-2">
              <Link to="/cart" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <ShoppingCart size={20} /> Keranjang ({cart.length})
              </Link>
              <Link to="/wishlist" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <Heart size={20} /> Wishlist
              </Link>
            </div>
            
            <div className="border-t pt-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className="block w-full text-center py-2 mb-2 bg-blue-600 text-white rounded-lg font-bold">
                      Dashboard Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-center py-2 bg-red-50 text-red-600 rounded-lg font-bold">
                    Keluar
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/login" className="py-3 text-center border rounded-xl font-bold">Masuk</Link>
                  <Link to="/register" className="py-3 text-center bg-gray-900 text-white rounded-xl font-bold">Daftar</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* --- HALAMAN KONTEN UTAMA --- */}
      <main>
        <Outlet />
      </main>

      {/* --- FOOTER SIMPLE --- */}
      <footer className="bg-white border-t border-gray-200 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">CandyMart.</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Platform belanja modern untuk kebutuhan gaya hidup Anda. Temukan barang impian dengan harga terbaik.</p>
          <div className="flex justify-center gap-6 text-gray-400 mb-8">
            <span className="hover:text-blue-600 cursor-pointer transition">Instagram</span>
            <span className="hover:text-blue-600 cursor-pointer transition">Twitter</span>
            <span className="hover:text-blue-600 cursor-pointer transition">Facebook</span>
          </div>
          <p className="text-xs text-gray-400">© 2025 CandyMart Inc. All rights reserved.</p>
        </div>
      </footer>
      <Chatbot />
    </div>
  );
}