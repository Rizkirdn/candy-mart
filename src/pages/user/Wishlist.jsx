import React from 'react';
import { useFavoriteStore } from '../../store/favoriteStore';
import { useCartStore } from '../../store/cartStore';
import { ShoppingBag, Trash2, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { favorites, toggleFavorite } = useFavoriteStore();
  const addToCart = useCartStore((state) => state.addToCart);

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    toggleFavorite(product); // Hapus dari wishlist setelah masuk keranjang
    toast.success('Berhasil dipindahkan ke Keranjang!');
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Heart size={48} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Wishlist Kosong</h2>
        <p className="text-gray-500 mt-2 mb-8">Simpan barang impianmu di sini.</p>
        <Link to="/" className="bg-gray-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition">
          Cari Barang Dulu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 font-sans">Barang Impian ({favorites.length})</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {favorites.map((product) => (
          <div key={product.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
            
            {/* Gambar */}
            <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Tombol Hapus */}
              <button 
                onClick={() => toggleFavorite(product)}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-red-500 hover:bg-red-50 transition-colors"
                title="Hapus dari favorit"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Info */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-medium text-gray-900 truncate text-sm">{product.name}</h3>
                <p className="text-lg font-bold text-blue-600 mt-2">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
              </div>
              
              <button 
                onClick={() => handleMoveToCart(product)}
                className="mt-4 w-full bg-blue-600 text-white font-medium py-2 rounded-lg shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <ShoppingBag size={16} /> + Keranjang
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}