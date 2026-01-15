import React, { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, Package, AlertTriangle, Loader2, TrendingUp, User, FileText, FileSpreadsheet, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

// IMPORT LIBRARY EXPORT
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]); // Data Transaksi Terbaru
  const [loading, setLoading] = useState(true);

  // FETCH DATA GABUNGAN
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil Statistik
        const resStats = await fetch('http://127.0.0.1:5000/api/dashboard/stats');
        const dataStats = await resStats.json();
        setStats(dataStats);

        // 2. Ambil Data Grafik
        const resChart = await fetch('http://127.0.0.1:5000/api/dashboard/chart');
        const dataChart = await resChart.json();
        setChartData(dataChart);

        // 3. Ambil 5 Transaksi Terakhir (Realtime)
        const resOrders = await fetch('http://127.0.0.1:5000/api/orders');
        const dataOrders = await resOrders.json();
        // Ambil 5 teratas saja
        setRecentOrders(dataOrders.slice(0, 5));

        setLoading(false);
      } catch (error) {
        console.error("Gagal ambil data dashboard", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- FUNGSI EXPORT PDF (Laporan Eksekutif) ---
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Judul & Tanggal
    doc.setFontSize(18);
    doc.text("Laporan Eksekutif Dashboard", 14, 20);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 14, 28);
    doc.line(14, 32, 196, 32); // Garis pemisah

    // BAGIAN 1: RINGKASAN STATISTIK
    doc.setFontSize(14);
    doc.text("1. Ringkasan Performa", 14, 45);
    
    const statsData = [
      ["Total Pendapatan", `Rp ${stats?.total_revenue?.toLocaleString('id-ID')}`],
      ["Total Aset Gudang", `Rp ${stats?.total_asset?.toLocaleString('id-ID')}`],
      ["Total Produk Aktif", `${stats?.total_products} Item`],
      ["Stok Perlu Restock", `${stats?.low_stock} Item`]
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Metrik', 'Nilai']],
      body: statsData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      columnStyles: { 0: { fontStyle: 'bold' } }
    });

    // BAGIAN 2: TRANSAKSI TERAKHIR
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text("2. 5 Transaksi Terakhir", 14, finalY);

    const orderRows = recentOrders.map(o => [
      o.date,
      o.customer_name,
      `Rp ${parseInt(o.total).toLocaleString('id-ID')}`,
      o.status
    ]);

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Tanggal', 'Pelanggan', 'Total', 'Status']],
      body: orderRows,
      theme: 'striped',
      headStyles: { fillColor: [50, 50, 50] }
    });

    doc.save(`Laporan_Dashboard_${Date.now()}.pdf`);
    toast.success("Laporan PDF berhasil diunduh!");
  };

  // --- FUNGSI EXPORT EXCEL (Multi Sheet) ---
  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new();

    // SHEET 1: RINGKASAN UTAMA
    const summaryData = [
      { Metrik: "Total Pendapatan", Nilai: stats?.total_revenue },
      { Metrik: "Total Aset", Nilai: stats?.total_asset },
      { Metrik: "Jumlah Produk", Nilai: stats?.total_products },
      { Metrik: "Stok Menipis", Nilai: stats?.low_stock },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, wsSummary, "Ringkasan");

    // SHEET 2: DATA GRAFIK (Untuk diolah jadi grafik di Excel)
    const wsChart = XLSX.utils.json_to_sheet(chartData);
    XLSX.utils.book_append_sheet(workbook, wsChart, "Data Bulanan");

    // SHEET 3: TRANSAKSI TERBARU
    const wsOrders = XLSX.utils.json_to_sheet(recentOrders.map(o => ({
      ID: o.id,
      Tanggal: o.date,
      Pelanggan: o.customer_name,
      Total: o.total,
      Status: o.status
    })));
    XLSX.utils.book_append_sheet(workbook, wsOrders, "Transaksi Terakhir");

    XLSX.writeFile(workbook, `Data_Dashboard_${Date.now()}.xlsx`);
    toast.success("Data Excel berhasil diunduh!");
  };

  if (loading) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  // Konfigurasi Kartu Statistik
  const statCards = [
    { title: 'Pendapatan', value: `Rp ${stats?.total_revenue?.toLocaleString('id-ID')}`, icon: <DollarSign className="text-green-600" />, color: 'bg-green-100', trend: 'Total akumulasi' },
    { title: 'Aset Gudang', value: `Rp ${stats?.total_asset?.toLocaleString('id-ID')}`, icon: <ShoppingBag className="text-blue-600" />, color: 'bg-blue-100', trend: 'Nilai inventaris' },
    { title: 'Total Produk', value: stats?.total_products, icon: <Package className="text-orange-600" />, color: 'bg-orange-100', trend: 'Item aktif' },
    { title: 'Stok Menipis', value: stats?.low_stock, icon: <AlertTriangle className="text-red-600" />, color: 'bg-red-100', trend: 'Perlu Restock!' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* HEADER & TOMBOL EXPORT */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500">Pantau performa toko Anda secara realtime.</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition shadow-sm"
          >
            <FileText size={18}/> PDF Report
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-xl font-bold text-sm hover:bg-green-100 transition shadow-sm"
          >
            <FileSpreadsheet size={18}/> Export Excel
          </button>
        </div>
      </div>
      
      {/* 1. KARTU STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 line-clamp-1" title={stat.value}>{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-gray-400 gap-1">
              <TrendingUp size={14} className="text-gray-400" />
              <span>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. BAGIAN TENGAH: GRAFIK & LIST TRANSAKSI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRAFIK PENJUALAN (KIRI) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Tren Pendapatan</h3>
            <select className="text-xs border rounded-lg px-2 py-1 bg-gray-50 text-gray-600 outline-none">
              <option>6 Bulan Terakhir</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `${value/1000000}jt`} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                />
                <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TRANSAKSI TERBARU (KANAN) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Pesanan Terbaru</h3>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {recentOrders.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">Belum ada transaksi</p>
            ) : (
              recentOrders.map((order, i) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                    {order.customer_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">{order.date} • {order.items?.length || 1} Item</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">Rp {(order.total/1000).toFixed(0)}rb</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      order.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}