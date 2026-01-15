import React, { useEffect, useState } from 'react';
import { ShoppingCart, Search, Filter, Star, Truck, ShieldCheck, Clock, ArrowRight, Heart } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Ambil Store Cart
  const addToCart = useCartStore((state) => state.addToCart);

  // 1. FETCH DATA PRODUK
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/products?limit=100');
        const json = await res.json();
        setProducts(json.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Gagal load produk");
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 2. LOGIC FILTER
  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // Kategori Dummy (Bisa diambil dari data unik produk nanti)
  const categories = ['Semua', 'Sepatu', 'Baju', 'Elektronik', 'Aksesoris'];

  // Fungsi Tambah ke Keranjang
  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} masuk keranjang! 🛒`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* --- 1. HERO SECTION (BANNER ATAS) --- */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 px-4 relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="mb-8 md:mb-0 md:w-1/2">
            <span className="bg-blue-500/30 text-blue-100 px-3 py-1 rounded-full text-xs font-bold border border-blue-400/30 mb-4 inline-block">
              Promo Spesial Tahun Baru 🎉
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Belanja Gaya Hidup <br/> Masa Kini.
            </h1>
            <p className="text-blue-100 mb-8 text-lg max-w-md">
              Temukan koleksi eksklusif dengan harga terbaik. Gratis ongkir untuk pembelian pertama Anda hari ini.
            </p>
            <button className="bg-white text-blue-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg flex items-center gap-2">
              Belanja Sekarang <ArrowRight size={18}/>
            </button>
          </div>
          {/* Ilustrasi/Gambar Hero */}
          <div className="hidden md:block md:w-1/3">
             {/* Placeholder Gambar Hero (Bisa diganti gambar asli) */}
             <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 transform rotate-3 hover:rotate-0 transition duration-500">
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center text-gray-500 font-bold">
                  <img src="data:image/jpeg;base64,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" alt=""/>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* --- 2. FITUR LAYANAN --- */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Truck size={24}/></div>
            <div>
              <h3 className="font-bold text-gray-800">Gratis Ongkir</h3>
              <p className="text-xs text-gray-500">Ke seluruh Indonesia tanpa syarat.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition">
            <div className="bg-green-100 p-3 rounded-full text-green-600"><ShieldCheck size={24}/></div>
            <div>
              <h3 className="font-bold text-gray-800">Jaminan Asli</h3>
              <p className="text-xs text-gray-500">Produk 100% original atau uang kembali.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition">
            <div className="bg-purple-100 p-3 rounded-full text-purple-600"><Clock size={24}/></div>
            <div>
              <h3 className="font-bold text-gray-800">Pengiriman Cepat</h3>
              <p className="text-xs text-gray-500">Sampai di hari yang sama (Sameday).</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* --- 3. FILTER & SEARCH BAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 sticky top-20 z-30 bg-gray-50/90 backdrop-blur-sm py-4">
          
          {/* Kategori Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari produk impian..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm"
            />
          </div>
        </div>

        {/* --- 4. GRID PRODUK --- */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Search size={32} className="text-gray-300"/>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Produk tidak ditemukan</h3>
            <p className="text-gray-500">Coba kata kunci lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative">
                
                {/* Badge New / Sale (Dummy Logic) */}
                {product.id % 3 === 0 && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
                    HOT
                  </span>
                )}

                {/* Wishlist Button (Hiasan) */}
                <button className="absolute top-3 right-3 bg-white/80 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition z-10">
                  <Heart size={16} />
                </button>

                {/* Gambar Produk */}
                <div className="w-full h-48 bg-gray-100 relative overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  {/* Overlay saat hover */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Info Produk */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400"/> 
                    4.8 (120+ Terjual)
                  </div>
                  
                  <h3 className="font-bold text-gray-800 text-sm md:text-base line-clamp-2 mb-2 group-hover:text-blue-600 transition">
                    {product.name}
                  </h3>
                  
                  <div className="mt-auto flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-400 line-through">Rp {(product.price * 1.2).toLocaleString()}</p>
                      <p className="font-extrabold text-blue-600 text-lg">
                        Rp {product.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="bg-gray-900 text-white p-2.5 rounded-xl hover:bg-blue-600 active:scale-95 transition shadow-lg shadow-gray-200"
                      title="Tambah ke Keranjang"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}