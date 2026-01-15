import React, { useEffect, useState } from 'react';
import { Eye, Trash2, X, Loader2, CreditCard, Truck, MapPin, AlertTriangle, Calendar, Search, FileText, FileSpreadsheet, Download } from 'lucide-react';
import toast from 'react-hot-toast';

// IMPORT LIBRARY EXPORT
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [statusInput, setStatusInput] = useState('');

  // 1. Fetch Data
  const fetchOrders = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/orders');
      if (!res.ok) throw new Error("Gagal");
      setOrders(await res.json());
      setLoading(false);
    } catch (error) { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Filter Pencarian
  const filteredOrders = orders.filter(order => 
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- FUNGSI EXPORT PDF ---
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Judul Dokumen
    doc.text("Laporan Pesanan Toko", 14, 15);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 14, 22);

    // Siapkan Data Tabel
    const tableColumn = ["ID Order", "Pelanggan", "Tanggal", "Total", "Status", "Pembayaran"];
    const tableRows = [];

    filteredOrders.forEach(order => {
      const orderData = [
        order.id,
        order.customer_name,
        order.date,
        `Rp ${parseInt(order.total).toLocaleString('id-ID')}`,
        order.status,
        order.payment_method || 'Manual'
      ];
      tableRows.push(orderData);
    });

    // Generate Tabel
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] } // Warna Biru Header
    });

    doc.save(`Laporan_Pesanan_${Date.now()}.pdf`);
    toast.success("PDF berhasil diunduh!");
  };

  // --- FUNGSI EXPORT EXCEL ---
  const handleExportExcel = () => {
    // Format data agar rapi di Excel
    const excelData = filteredOrders.map(order => ({
      "ID Order": order.id,
      "Nama Pelanggan": order.customer_name,
      "Tanggal": order.date,
      "Total Belanja": parseInt(order.total),
      "Status": order.status,
      "Metode Bayar": order.payment_method || 'Manual',
      "Kurir": order.courier || '-',
      "Alamat": order.address || '-'
    }));

    // Buat Worksheet & Workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Pesanan");

    // Atur lebar kolom otomatis (biar ga sempit)
    const maxWidth = excelData.reduce((w, r) => Math.max(w, r["Nama Pelanggan"].length), 10);
    worksheet["!cols"] = [ { wch: 15 }, { wch: maxWidth + 5 }, { wch: 15 }, { wch: 15 }, { wch: 10 } ];

    // Download File
    XLSX.writeFile(workbook, `Laporan_Pesanan_${Date.now()}.xlsx`);
    toast.success("Excel berhasil diunduh!");
  };

  // Helper & Logic Lainnya (Sama seperti sebelumnya)
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Selesai': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Dikirim': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Proses': return 'bg-violet-100 text-violet-700 border-violet-200';
      case 'Batal': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : '??';
  const confirmDelete = (id) => { setOrderToDelete(id); setIsDeleteModalOpen(true); };
  const executeDelete = async () => {
    setIsDeleting(true);
    await fetch(`http://127.0.0.1:5000/api/orders/${orderToDelete}`, { method: 'DELETE' });
    toast.success("Pesanan dihapus"); fetchOrders(); setIsDeleteModalOpen(false); setIsDeleting(false);
  };
  const handleOpenDetail = (order) => { setSelectedOrder(order); setStatusInput(order.status); setIsModalOpen(true); };
  const handleUpdateStatus = async () => {
    await fetch(`http://127.0.0.1:5000/api/orders/${selectedOrder.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: statusInput })
    });
    setIsModalOpen(false); fetchOrders(); toast.success("Status Diperbarui");
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="p-6 md:p-8">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesanan Masuk</h1>
          <p className="text-gray-500 mt-1">Kelola dan unduh laporan transaksi.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* SEARCH BAR */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari ID atau Nama..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm"
            />
          </div>

          {/* TOMBOL EXPORT (BARU) */}
          <div className="flex gap-2">
            <button 
              onClick={handleExportPDF}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition flex items-center gap-2 shadow-sm"
            >
              <FileText size={18} /> <span className="hidden sm:inline">PDF</span>
            </button>
            <button 
              onClick={handleExportExcel}
              className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-xl font-bold text-sm hover:bg-green-100 transition flex items-center gap-2 shadow-sm"
            >
              <FileSpreadsheet size={18} /> <span className="hidden sm:inline">Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABEL (SAMA SEPERTI SEBELUMNYA) */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {getInitials(order.customer_name)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{order.customer_name}</p>
                          <p className="text-xs text-gray-400">{order.items?.length || 0} Item</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-sm">Rp {parseInt(order.total).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenDetail(order)} className="p-2 border rounded-lg hover:text-blue-600 hover:bg-blue-50 transition"><Eye size={16}/></button>
                        <button onClick={() => confirmDelete(order.id)} className="p-2 border rounded-lg hover:text-red-600 hover:bg-red-50 transition"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">Tidak ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL & DELETE (SAMA SEPERTI SEBELUMNYA) */}
      {/* ... (Kode Modal tidak berubah, tetap ada di bawah sini) ... */}
      
      {/* --- COPY PASTE BAGIAN MODAL DARI KODE SEBELUMNYA KE SINI JIKA INGIN LENGKAP --- */}
      {/* Agar kode tidak terlalu panjang, saya asumsikan bagian Modal (isModalOpen & isDeleteModalOpen) Anda sudah punya. 
          Jika belum, Anda bisa copy bagian return Modal dari jawaban sebelumnya. */}
          
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900">Rincian Pesanan</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-gray-100 p-1 rounded-full"><X size={18}/></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                <div><p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Status</p><p className="text-lg font-bold text-gray-900">{selectedOrder.status}</p></div>
                <Truck className="text-blue-300" size={32} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border p-3 rounded-xl"><p className="text-xs text-gray-400 font-bold uppercase mb-2">Pembayaran</p><p className="font-semibold text-gray-800 text-sm">{selectedOrder.payment_method || 'Manual'}</p></div>
                <div className="border p-3 rounded-xl"><p className="text-xs text-gray-400 font-bold uppercase mb-2">Alamat</p><p className="font-semibold text-gray-800 text-sm line-clamp-2">{selectedOrder.address || '-'}</p></div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-3">Item Dipesan</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span>{item.name} x{item.quantity}</span><span className="font-bold text-gray-700">Rp {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t">
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Update Status</label>
                <div className="flex gap-2">
                  <select value={statusInput} onChange={(e) => setStatusInput(e.target.value)} className="border border-gray-300 p-2.5 rounded-xl flex-1 text-sm outline-none">
                    <option value="Pending">Pending</option><option value="Proses">Proses</option><option value="Dikirim">Dikirim</option><option value="Selesai">Selesai</option><option value="Batal">Batal</option>
                  </select>
                  <button onClick={handleUpdateStatus} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition">Simpan</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto"><AlertTriangle size={28} className="text-red-500" /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Pesanan?</h3>
            <p className="text-gray-500 text-sm mb-6">Data akan hilang permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold transition text-sm">Batal</button>
              <button onClick={executeDelete} disabled={isDeleting} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition text-sm flex items-center justify-center gap-2">{isDeleting ? <Loader2 className="animate-spin" size={16}/> : "Hapus"}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}