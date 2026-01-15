import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, Image as ImageIcon, Package, DollarSign, Tag, Barcode } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    image_url: '',
    sku: '',
    category: 'Umum' // Tambahan field kategori
  });

  // 1. Fetch Data jika Edit Mode
  useEffect(() => {
    if (isEditMode) {
      setIsLoading(true);
      // Gunakan 127.0.0.1
      fetch(`http://127.0.0.1:5000/api/products/${id}`)
        .then(res => {
          if (!res.ok) throw new Error("Gagal mengambil data");
          return res.json();
        })
        .then(data => {
          setFormData({
            name: data.name,
            price: data.price,
            stock: data.stock,
            image_url: data.image_url,
            sku: data.sku || '',
            category: data.category || 'Umum'
          });
          setIsLoading(false);
        })
        .catch(err => {
          toast.error("Gagal memuat produk");
          navigate('/admin/products');
        });
    }
  }, [id, isEditMode, navigate]);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...formData,
      price: parseInt(formData.price),
      stock: parseInt(formData.stock),
    };

    try {
      const url = isEditMode 
        ? `http://127.0.0.1:5000/api/products/${id}` 
        : `http://127.0.0.1:5000/api/products`;
      
      const method = isEditMode ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Gagal menyimpan");

      toast.success(isEditMode ? "Produk berhasil diperbarui! ✨" : "Produk berhasil dibuat! 🚀");
      navigate('/admin/products');

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/products')} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Isi detail produk dengan lengkap.</p>
          </div>
        </div>

        {/* Tombol Simpan (Desktop) */}
        <button 
          onClick={handleSubmit}
          disabled={isSaving}
          className="hidden md:flex bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 items-center gap-2 disabled:bg-gray-400"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
          Simpan Perubahan
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: FORM INPUT */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Informasi Utama */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Package className="text-blue-500" size={20}/> Informasi Dasar
            </h3>
            
            <div className="space-y-5">
              {/* Nama Produk */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Produk</label>
                <input 
                  type="text" name="name" required
                  value={formData.name} onChange={handleChange}
                  placeholder="Contoh: Sepatu Nike Air Jordan"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* SKU */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <Barcode size={14}/> Kode SKU
                  </label>
                  <input 
                    type="text" name="sku"
                    value={formData.sku} onChange={handleChange}
                    placeholder="Contoh: NK-001"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono text-sm"
                  />
                </div>
                {/* Kategori */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <Tag size={14}/> Kategori
                  </label>
                  <select 
                    name="category"
                    value={formData.category} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Sepatu">Sepatu</option>
                    <option value="Baju">Baju</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Aksesoris">Aksesoris</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Harga & Stok */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <DollarSign className="text-green-500" size={20}/> Harga & Inventaris
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Harga Jual (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 font-bold">Rp</span>
                  <input 
                    type="number" name="price" required
                    value={formData.price} onChange={handleChange}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Stok Tersedia</label>
                <input 
                  type="number" name="stock" required
                  value={formData.stock} onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-gray-800"
                />
              </div>
            </div>
          </div>

        </div>

        {/* KOLOM KANAN: GAMBAR */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ImageIcon className="text-purple-500" size={20}/> Media Produk
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">URL Gambar</label>
              <input 
                type="text" name="image_url"
                value={formData.image_url} onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm text-gray-600"
              />
            </div>

            {/* PREVIEW IMAGE AREA */}
            <div className="w-full aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
              {formData.image_url ? (
                <>
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = "https://via.placeholder.com/300?text=Error+Image";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </>
              ) : (
                <div className="text-center text-gray-400">
                  <ImageIcon size={48} className="mx-auto mb-2 opacity-50"/>
                  <p className="text-sm font-medium">Preview Gambar</p>
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-400 mt-3 text-center">
              Pastikan URL gambar valid dan dapat diakses publik.
            </p>
          </div>

          {/* TOMBOL SIMPAN (MOBILE) */}
          <button 
            type="submit"
            disabled={isSaving}
            className="w-full md:hidden bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin"/> : "Simpan Produk"}
          </button>
        </div>

      </form>
    </div>
  );
}