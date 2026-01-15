import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';

export default function ProductModal({ product, isOpen, onClose, onConfirm }) {
  const [qty, setQty] = useState(1);

  if (!isOpen || !product) return null;

  const handleConfirm = () => {
    onConfirm(product, qty);
    setQty(1); // Reset qty setelah confirm
  };

  return (
    // Overlay Hitam Transparan
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      
      {/* Box Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header: Tombol Close */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Masukkan Keranjang</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body: Info Produk */}
        <div className="p-5">
          <div className="flex gap-4 mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
              <img src={product.image_url} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h4>
              <p className="text-blue-600 font-bold mt-1">
                Rp {product.price.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-gray-500 mt-1">Stok Tersedia: {product.stock}</p>
            </div>
          </div>

          {/* Counter Jumlah */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
            <span className="text-sm font-medium text-gray-600 ml-2">Jumlah Beli</span>
            
            <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100">
              <button 
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Minus size={16} />
              </button>
              
              <span className="w-8 text-center font-bold text-gray-900">{qty}</span>
              
              <button 
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer: Total & Tombol Aksi */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Total Harga</span>
            <span className="text-lg font-bold text-gray-900">
              Rp {(product.price * qty).toLocaleString('id-ID')}
            </span>
          </div>
          
          <button 
            onClick={handleConfirm}
            className="flex-1 bg-blue-600 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} />
            Masuk Keranjang
          </button>
        </div>

      </div>
    </div>
  );
}