import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        
        // INI BAGIAN PENTING: Manipulasi class HTML
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        return { theme: newTheme };
      }),

      initTheme: () => {
        const storage = JSON.parse(localStorage.getItem('theme-storage'));
        const savedTheme = storage?.state?.theme || 'light';
        
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }),
    { name: 'theme-storage' }
  )
);