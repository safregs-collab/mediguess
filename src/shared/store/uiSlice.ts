import type { StateCreator } from 'zustand';
import type { AppScreen } from '../../types';
import type { GameStore } from './types';

const SOUND_KEY = 'docw_sound_enabled';
const CONFETTI_KEY = 'docw_confetti_enabled';
const FONT_SIZE_KEY = 'docw_font_size';
const THEME_KEY = 'docw_theme';

type FontSize = 'small' | 'normal' | 'large';
type Theme = 'light' | 'dark';

function loadTheme(): Theme {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === 'dark') return 'dark';
    return 'light';
  } catch {
    return 'light';
  }
}

function saveTheme(value: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, value);
  } catch { /* ignore */ }
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

function loadSoundEnabled(): boolean {
  try {
    const raw = localStorage.getItem(SOUND_KEY);
    return raw === null ? true : JSON.parse(raw);
  } catch {
    return true;
  }
}

function saveSoundEnabled(value: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, JSON.stringify(value));
  } catch { /* ignore */ }
}

function loadConfettiEnabled(): boolean {
  try {
    const raw = localStorage.getItem(CONFETTI_KEY);
    return raw === null ? true : JSON.parse(raw);
  } catch {
    return true;
  }
}

function saveConfettiEnabled(value: boolean): void {
  try {
    localStorage.setItem(CONFETTI_KEY, JSON.stringify(value));
  } catch { /* ignore */ }
}

function loadFontSize(): FontSize {
  try {
    const raw = localStorage.getItem(FONT_SIZE_KEY);
    if (raw === 'small' || raw === 'large') return raw;
    return 'normal';
  } catch {
    return 'normal';
  }
}

function saveFontSize(value: FontSize): void {
  try {
    localStorage.setItem(FONT_SIZE_KEY, value);
  } catch { /* ignore */ }
}

export interface UISlice {
  toast: string | null;
  statsOpen: boolean;
  howtoOpen: boolean;
  confetti: boolean;
  currentScreen: AppScreen;
  soundEnabled: boolean;
  confettiEnabled: boolean;
  fontSize: 'small' | 'normal' | 'large';
  theme: Theme;

  showToast: (msg: string) => void;
  dismissToast: () => void;
  openStats: () => void;
  closeStats: () => void;
  openHowto: () => void;
  closeHowto: () => void;
  dismissConfetti: () => void;
  goToMetaHome: () => void;
  goToHome: () => void;
  goToGames: () => void;
  goToMetaZone: () => void;
  toggleSound: () => void;
  toggleConfetti: () => void;
  setFontSize: (size: 'small' | 'normal' | 'large') => void;
  toggleTheme: () => void;
}

const initialTheme = loadTheme();
applyTheme(initialTheme);

export const createUISlice: StateCreator<GameStore, [], [], UISlice> = (set) => ({
  toast: null,
  statsOpen: false,
  howtoOpen: false,
  confetti: false,
  currentScreen: 'home',
  soundEnabled: loadSoundEnabled(),
  confettiEnabled: loadConfettiEnabled(),
  fontSize: loadFontSize(),
  theme: initialTheme,

  showToast: (msg) => set({ toast: msg }),
  dismissToast: () => set({ toast: null }),
  openStats: () => set({ statsOpen: true }),
  closeStats: () => set({ statsOpen: false }),
  openHowto: () => set({ howtoOpen: true }),
  closeHowto: () => set({ howtoOpen: false }),
  dismissConfetti: () => set({ confetti: false }),
  goToMetaHome: () => set({ currentScreen: 'home' }),
  goToHome: () => set({ currentScreen: 'home' }),
  goToGames: () => set({ currentScreen: 'games', currentMode: 'professionSelect' }),
  goToMetaZone: () => { window.location.href = './medical-meta-zone/'; },
  toggleSound: () => {
    set((state) => {
      const next = !state.soundEnabled;
      saveSoundEnabled(next);
      return { soundEnabled: next };
    });
  },
  toggleConfetti: () => {
    set((state) => {
      const next = !state.confettiEnabled;
      saveConfettiEnabled(next);
      return { confettiEnabled: next };
    });
  },
  setFontSize: (size) => {
    saveFontSize(size);
    set({ fontSize: size });
  },
  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      saveTheme(next);
      applyTheme(next);
      return { theme: next };
    });
  },
});
