import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const menus = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Produk', path: '/admin/products', icon: Package },
    { name: 'Pesanan', path: '/admin/orders', icon: ShoppingCart },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="text-xl font-bold text-blue-600 tracking-tight">AdminPanel</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menus.map((menu) => {
            const isActive = location.pathname.startsWith(menu.path);
            const Icon = menu.icon;
            return (
              <Link 
                key={menu.name} 
                to={menu.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                  ? 'bg-blue-50 text-blue-700 shadow-sm translate-x-1' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                {menu.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={20} />
            Keluar
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Konten Halaman akan dirender di sini oleh React Router */}
        <div className="flex-1 overflow-auto">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}