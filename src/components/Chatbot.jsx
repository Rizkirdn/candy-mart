import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Halo! 👋 Selamat datang di CandyMart. Ada yang bisa saya bantu? (Tanya: 'Stok', 'Ongkir', atau 'Cara Bayar')", sender: 'bot' }
  ]);
  const messagesEndRef = useRef(null);

  // Auto Scroll ke pesan terbawah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // LOGIKA OTAK BOT (Keyword Matching)
  const getBotResponse = (text) => {
    const lower = text.toLowerCase();
    
    if (lower.includes('halo') || lower.includes('hai') || lower.includes('pagi')) 
      return "Halo kak! Selamat berbelanja. Ada yang ingin ditanyakan?";
    
    if (lower.includes('stok') || lower.includes('ada')) 
      return "Stok produk di website kami selalu update secara Realtime kak. Jika bisa diklik beli, berarti barang ready! 😉";

    if (lower.includes('ongkir') || lower.includes('kirim')) 
      return "Kami mendukung pengiriman via JNE, J&T, SiCepat, dan GoSend Instant. Ongkir dihitung otomatis saat Checkout ya.";

    if (lower.includes('bayar') || lower.includes('payment') || lower.includes('tf')) 
      return "Metode pembayaran tersedia: Transfer Bank (BCA/Mandiri), E-Wallet (Gopay/Dana), dan COD (Bayar di Tempat).";

    if (lower.includes('lama') || lower.includes('sampai')) 
      return "Estimasi pengiriman reguler 2-3 hari kerja. Untuk GoSend Instant bisa sampai di hari yang sama.";

    if (lower.includes('retur') || lower.includes('kembali')) 
      return "Garansi retur 1x24 jam jika barang rusak saat diterima. Wajib sertakan video unboxing ya kak!";

    if (lower.includes('alamat') || lower.includes('lokasi')) 
      return "Toko CandyMart berpusat di Jakarta Selatan. Kami melayani pengiriman ke seluruh Indonesia.";

    return "Maaf kak, saya bot otomatis dan belum mengerti pertanyaan itu. 🙏 Silakan hubungi Admin via WhatsApp di menu Kontak.";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Masukkan Pesan User
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // 2. Bot Menjawab (Simulasi Delay biar natural)
    setTimeout(() => {
      const botReplyText = getBotResponse(userMsg.text);
      const botMsg = { id: Date.now() + 1, text: botReplyText, sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* WINDOW CHAT */}
      {isOpen && (
        <div className="bg-white w-[350px] h-[450px] rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 mb-4">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm">CS CandyMart</h3>
                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition">
              <X size={20} />
            </button>
          </div>

          {/* Body Chat */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
            <input 
              type="text" 
              placeholder="Tulis pesan..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-xl px-4 py-2 text-sm outline-none border transition-all"
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!input.trim()}
            >
              <Send size={18} />
            </button>
          </form>

        </div>
      )}

      {/* FLOATING BUTTON (FAB) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'bg-gray-200 text-gray-600 rotate-90' : 'bg-blue-600 text-white'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>

    </div>
  );
}