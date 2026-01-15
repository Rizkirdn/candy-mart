import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit, Loader2, AlertCircle, RefreshCw, Package, Tag, AlertTriangle, FileText, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// IMPORT LIBRARY EXPORT
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // State Modal Hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // FETCH DATA
  const fetchProducts = async () => {
    setLoading(true); setError(null);
    try {
      // Gunakan 127.0.0.1
      const url = `http://127.0.0.1:5000/api/products?search=${search}&limit=100`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Gagal koneksi backend");
      const json = await res.json();
      setProducts(json.data || []);
    } catch (err) {
      setError("Gagal memuat data. Pastikan server menyala.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  // --- FUNGSI EXPORT PDF ---
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Judul
    doc.text("Laporan Stok Produk", 14, 15);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 14, 22);

    // Data Tabel
    const tableColumn = ["Nama Produk", "SKU", "Kategori", "Harga", "Stok"];
    const tableRows = [];

    products.forEach(product => {
      const row = [
        product.name,
        product.sku || '-',
        product.category || 'Umum',
        `Rp ${product.price.toLocaleString('id-ID')}`,
        `${product.stock} Unit`
      ];
      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] } // Warna Biru
    });

    doc.save(`Stok_Produk_${Date.now()}.pdf`);
    toast.success("PDF berhasil diunduh!");
  };

  // --- FUNGSI EXPORT EXCEL ---
  const handleExportExcel = () => {
    const excelData = products.map(p => ({
      "ID": p.id,
      "Nama Produk": p.name,
      "SKU": p.sku || '-',
      "Kategori": p.category || 'Umum',
      "Harga (Rp)": p.price,
      "Stok": p.stock,
      "Status": p.stock < 5 ? "Kritis" : "Aman"
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Produk");

    // Lebar kolom otomatis
    const maxWidth = excelData.reduce((w, r) => Math.max(w, r["Nama Produk"].length), 10);
    worksheet["!cols"] = [ { wch: 5 }, { wch: maxWidth + 5 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 } ];

    XLSX.writeFile(workbook, `Data_Produk_${Date.now()}.xlsx`);
    toast.success("Excel berhasil diunduh!");
  };

  // LOGIC HAPUS
  const confirmDelete = (product) => { setProductToDelete(product); setIsDeleteModalOpen(true); };
  
  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/products/${productToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Produk dihapus");
        fetchProducts();
        setIsDeleteModalOpen(false);
      } else {
        toast.error("Gagal menghapus");
      }
    } catch (err) { toast.error("Error koneksi"); }
    setIsDeleting(false);
  };

  // Helper Warna Stok
  const getStockStyle = (stock) => {
    if (stock === 0) return 'bg-gray-100 text-gray-500 border-gray-200';
    if (stock < 10) return 'bg-red-50 text-red-600 border-red-200';
    if (stock < 20) return 'bg-amber-50 text-amber-600 border-amber-200';
    return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  };

  return (
    <div className="p-6 md:p-8">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk & Inventaris</h1>
          <p className="text-gray-500 mt-1">Cetak laporan stok dan kelola katalog.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari SKU atau Nama..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm"
            />
          </div>

          {/* TOMBOL EXPORT */}
          <div className="flex gap-2">
            <button 
              onClick={handleExportPDF}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition flex items-center gap-2 shadow-sm"
              title="Download PDF"
            >
              <FileText size={18} /> <span className="hidden lg:inline">PDF</span>
            </button>
            <button 
              onClick={handleExportExcel}
              className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-xl font-bold text-sm hover:bg-green-100 transition flex items-center gap-2 shadow-sm"
              title="Download Excel"
            >
              <FileSpreadsheet size={18} /> <span className="hidden lg:inline">Excel</span>
            </button>
          </div>
          
          {/* Tombol Tambah */}
          <Link to="/admin/products/create" className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2 justify-center">
            <Plus size={18} /> <span>Tambah Produk</span>
          </Link>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center mb-6">
          <AlertCircle className="mx-auto text-red-500 mb-2" size={32}/>
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <button onClick={fetchProducts} className="text-sm bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 font-bold flex items-center gap-2 mx-auto">
            <RefreshCw size={14}/> Coba Lagi
          </button>
        </div>
      )}

      {/* TABEL MODERN */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Produk</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Harga</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Stok Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="group hover:bg-gray-50 transition-colors duration-200">
                      
                      {/* GAMBAR & NAMA */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                {product.sku || 'NO-SKU'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* KATEGORI */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Tag size={14} className="text-gray-400"/>
                          {product.category || 'Umum'}
                        </div>
                      </td>

                      {/* HARGA */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-blue-600">
                          Rp {product.price?.toLocaleString('id-ID')}
                        </p>
                      </td>

                      {/* STOK BADGE */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStockStyle(product.stock)}`}>
                          <Package size={12} className="mr-1.5"/>
                          {product.stock} Unit
                        </span>
                      </td>

                      {/* AKSI */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Link to={`/admin/products/edit/${product.id}`} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:border-blue-300 hover:text-blue-600 hover:shadow-sm transition-all" title="Edit">
                            <Edit size={16} />
                          </Link>
                          <button onClick={() => confirmDelete(product)} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:border-red-300 hover:text-red-600 hover:shadow-sm transition-all" title="Hapus">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <Package size={48} className="text-gray-200 mb-4" />
                        <p>Tidak ada produk ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* FOOTER TABEL */}
        {!loading && products.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <p className="text-xs text-gray-500">Menampilkan {products.length} produk</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs border rounded bg-white text-gray-400 cursor-not-allowed">Previous</button>
              <button className="px-3 py-1 text-xs border rounded bg-white text-gray-600 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL KONFIRMASI HAPUS */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Produk?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Produk <span className="font-bold text-gray-800">"{productToDelete.name}"</span> akan dihapus permanen. Stok tersisa: {productToDelete.stock}.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition text-sm">Batal</button>
              <button onClick={executeDelete} disabled={isDeleting} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition text-sm flex items-center justify-center gap-2">
                {isDeleting ? <Loader2 className="animate-spin" size={16}/> : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}