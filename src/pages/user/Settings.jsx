import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { User, Lock, Mail, Camera, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  
  // State Tab Aktif
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'security'
  const [loading, setLoading] = useState(false);

  // Form State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load data awal user
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || '' // Kita akan simpan URL gambar disini
      });
    }
  }, [user]);

  // Handle Input Change
  const handleProfileChange = (e) => setProfileData({...profileData, [e.target.name]: e.target.value});
  const handlePassChange = (e) => setPasswordData({...passwordData, [e.target.name]: e.target.value});

  // 1. UPDATE PROFIL
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      updateUser(data.user); // Update Store
      toast.success("Profil berhasil disimpan! ✨");

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. GANTI PASSWORD
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Konfirmasi password tidak cocok!");
    }
    setLoading(true);

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Password berhasil diubah! 🔒");
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Reset form

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Pengaturan Akun</h1>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR MENU TAB */}
        <div className="md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <User size={20}/> Edit Profil
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <Lock size={20}/> Keamanan
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1">
          
          {/* --- TAB 1: EDIT PROFIL --- */}
          {activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Informasi Pribadi</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                
                {/* Avatar Preview */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-white shadow-md overflow-hidden flex items-center justify-center">
                    {profileData.avatar ? (
                      <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">URL Foto Profil</label>
                    <input 
                      type="text" name="avatar" 
                      placeholder="https://..."
                      value={profileData.avatar} onChange={handleProfileChange}
                      className="w-full px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">Tempel link gambar dari internet untuk foto profil.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
                    <input 
                      type="text" name="name" required
                      value={profileData.name} onChange={handleProfileChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input 
                      type="email" name="email" required
                      value={profileData.email} onChange={handleProfileChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <button type="submit" disabled={loading} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition flex items-center gap-2 disabled:bg-gray-400">
                    {loading ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Simpan Profil
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* --- TAB 2: KEAMANAN (PASSWORD) --- */}
          {activeTab === 'security' && (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Ganti Password</h2>
              
              <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Password Saat Ini</label>
                  <input 
                    type="password" name="currentPassword" required
                    placeholder="••••••••"
                    value={passwordData.currentPassword} onChange={handlePassChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                
                <hr className="border-gray-100"/>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Password Baru</label>
                  <input 
                    type="password" name="newPassword" required
                    placeholder="••••••••"
                    value={passwordData.newPassword} onChange={handlePassChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Konfirmasi Password Baru</label>
                  <input 
                    type="password" name="confirmPassword" required
                    placeholder="••••••••"
                    value={passwordData.confirmPassword} onChange={handlePassChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="pt-4 border-t">
                  <button type="submit" disabled={loading} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition flex items-center gap-2 disabled:bg-gray-400">
                    {loading ? <Loader2 className="animate-spin"/> : <Lock size={18}/>} Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}