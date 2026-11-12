import { create } from 'zustand';

export type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem('shortlet_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

const applyThemeToDOM = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
  try {
    localStorage.setItem('shortlet_theme', theme);
  } catch {
    // Ignore localStorage errors (e.g. private mode)
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark', // default SSR safe initial state
  setTheme: (theme) => {
    applyThemeToDOM(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    applyThemeToDOM(next);
    set({ theme: next });
  },
}));

// Initialize client theme after hydration
if (typeof window !== 'undefined') {
  const initial = getInitialTheme();
  useThemeStore.getState().setTheme(initial);
}
