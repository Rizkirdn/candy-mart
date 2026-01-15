import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  // Cek apakah ada data user tersimpan di browser
  user: JSON.parse(localStorage.getItem('user')) || null,

  // Fungsi Login
  login: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },

  // Fungsi Logout
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  },
  updateUser: (updatedData) => {
    // Update LocalStorage
    localStorage.setItem('user', JSON.stringify(updatedData));
    // Update State
    set({ user: updatedData });
  }
}));