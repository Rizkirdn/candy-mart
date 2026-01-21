import React, { useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2, MapPin, Truck, CreditCard, X, User, Wallet, Banknote, Building2, ChevronRight, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // State Form Checkout
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    courier: 'JNE Regular',
    payment: 'Transfer Bank'
  });
  
  // Store Cart
  const cartStore = useCartStore();
  const cart = cartStore?.cart || [];
  const addToCart = cartStore?.addToCart;
  const removeFromCart = cartStore?.removeFromCart;
  const clearCart = cartStore?.clearCart;

  // Hitung Total
  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper untuk memilih opsi (Payment/Courier)
  const selectOption = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.phone) {
      toast.error("Mohon lengkapi data penerima!");
      return;
    }

    setIsProcessing(true);

    const payload = {
      customer_name: formData.name,
      address: `${formData.address} (Telp: ${formData.phone})`,
      courier: formData.courier,
      payment_method: formData.payment,
      total: total,
      items: cart
    };

    try {
      const res = await fetch('http://127.0.0.1:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Gagal Checkout");

      clearCart();
      toast.success("Pesanan Berhasil! Terima kasih 🎉");
      setIsCheckoutOpen(false);
      navigate('/'); 
      
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsProcessing(false);
    }
  };

  // Tampilan Keranjang Kosong
  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <ShoppingBag size={40} className="text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Keranjang Kosong</h2>
        <p className="text-gray-500 mt-2 mb-6">Wah, sepertinya Anda belum memilih barang apapun.</p>
        <Link to="/" className="bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-200">
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight">Keranjang Belanja</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* List Produk */}
        <div className="flex-1 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 line-clamp-1 text-lg">{item.name}</h3>
                  {/* --- UBAH DISINI: Menampilkan Varian Warna & Ukuran --- */}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {item.selectedColor && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                        Warna: {item.selectedColor}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-blue-600 mt-2">Rp {item.price.toLocaleString('id-ID')}</p>
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                    <button onClick={() => item.quantity > 1 && addToCart(item, -1)} className="w-8 h-8 flex items-center justify-center bg-white shadow-sm hover:bg-gray-100 rounded-md transition">-</button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => addToCart(item, 1)} className="w-8 h-8 flex items-center justify-center bg-white shadow-sm text-blue-600 hover:bg-gray-100 rounded-md transition">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"><Trash2 size={20}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ringkasan Harga */}
        <div className="lg:w-96">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl sticky top-24">
            <h3 className="text-xl font-bold mb-6 text-gray-900">Ringkasan Pesanan</h3>
            <div className="space-y-4 text-sm mb-8 text-gray-600">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between"><span>Pajak (11%)</span><span className="font-medium">Rp {tax.toLocaleString('id-ID')}</span></div>
              <div className="h-px bg-gray-100 my-2"></div>
              <div className="flex justify-between text-lg font-bold text-gray-900"><span>Total Tagihan</span><span>Rp {total.toLocaleString('id-ID')}</span></div>
            </div>
            
            <button 
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              Lanjut Checkout <ChevronRight size={20}/>
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL CHECKOUT PREMIUM --- */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="bg-white px-8 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="font-extrabold text-xl text-gray-900">Checkout Pengiriman</h3>
                <p className="text-xs text-gray-500 mt-1">Lengkapi data untuk menyelesaikan pesanan.</p>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition"><X size={20}/></button>
            </div>

            {/* Isi Form (Scrollable) */}
            <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar bg-gray-50/50">
              <form id="checkoutForm" onSubmit={handleConfirmPayment}>
                
                {/* 1. SECTION: DATA PENERIMA */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                  <h4 className="font-bold text-sm text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MapPin size={16}/> Alamat Penerima
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-3.5 text-gray-400"/>
                      <input 
                        type="text" name="name" placeholder="Nama Lengkap" required
                        value={formData.name} onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                    <div className="relative">
                      {/* UBAH DISINI: Ganti icon CreditCard jadi Phone */}
                      <Phone size={18} className="absolute left-4 top-3.5 text-gray-400"/> 
                      <input 
                        type="text" name="phone" placeholder="Nomor WhatsApp" required
                        value={formData.phone} onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <textarea 
                    name="address" placeholder="Alamat Lengkap (Nama Jalan, No. Rumah, Kecamatan, Kota, Kode Pos)" required rows="3"
                    value={formData.address} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                  ></textarea>
                </div>

                {/* 2. SECTION: KURIR */}
                <div className="mb-6">
                  <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2 px-1">
                    <Truck size={16}/> Pilih Kurir
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {['JNE Regular', 'J&T Express', 'SiCepat', 'GoSend Instant'].map((courier) => (
                      <div 
                        key={courier} 
                        onClick={() => selectOption('courier', courier)}
                        className={`cursor-pointer p-4 rounded-xl border flex items-center gap-3 transition-all duration-200 ${
                          formData.courier === courier 
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-sm' 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.courier === courier ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                          {formData.courier === courier && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <span className="text-sm font-bold text-gray-700">{courier}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. SECTION: PEMBAYARAN */}
                <div>
                  <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2 px-1">
                    <Wallet size={16}/> Metode Pembayaran
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Bank Transfer */}
                    <div 
                      onClick={() => selectOption('payment', 'Transfer Bank')}
                      className={`cursor-pointer p-4 rounded-xl border flex items-center gap-3 transition-all ${formData.payment === 'Transfer Bank' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Building2 size={20}/></div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">Transfer Bank</p>
                        <p className="text-xs text-gray-500">BCA / Mandiri / BRI</p>
                      </div>
                      {formData.payment === 'Transfer Bank' && <div className="w-4 h-4 rounded-full bg-blue-500"></div>}
                    </div>

                    {/* E-Wallet */}
                    <div 
                      onClick={() => selectOption('payment', 'E-Wallet')}
                      className={`cursor-pointer p-4 rounded-xl border flex items-center gap-3 transition-all ${formData.payment === 'E-Wallet' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Wallet size={20}/></div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">E-Wallet / QRIS</p>
                        <p className="text-xs text-gray-500">Gopay / Dana / OVO</p>
                      </div>
                      {formData.payment === 'E-Wallet' && <div className="w-4 h-4 rounded-full bg-blue-500"></div>}
                    </div>

                    {/* COD */}
                    <div 
                      onClick={() => selectOption('payment', 'COD')}
                      className={`cursor-pointer p-4 rounded-xl border flex items-center gap-3 transition-all sm:col-span-2 ${formData.payment === 'COD' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Banknote size={20}/></div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">Bayar di Tempat (COD)</p>
                        <p className="text-xs text-gray-500">Bayar tunai saat kurir datang</p>
                      </div>
                      {formData.payment === 'COD' && <div className="w-4 h-4 rounded-full bg-blue-500"></div>}
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* Footer Modal (Sticky) */}
            <div className="p-6 border-t bg-white sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-medium">Total Pembayaran</span>
                <span className="text-2xl font-extrabold text-blue-600">Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <button 
                type="submit" form="checkoutForm"
                disabled={isProcessing}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg shadow-gray-200"
              >
                {isProcessing ? <><Loader2 className="animate-spin"/> Memproses Pesanan...</> : "Konfirmasi & Bayar Sekarang"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}