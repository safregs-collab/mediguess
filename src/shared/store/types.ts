import type { Stats, AppScreen } from '../../types';
import type { UnifiedCasesSlice } from './slices/unifiedCasesSlice';
import type { UnifiedSimulatorSlice } from './slices/unifiedSimulatorSlice';
import type { ProfessionSlice } from './slices/professionSlice';
import type { FilterSlice } from './slices/filterSlice';
import type { ArchiveSlice } from './slices/archiveSlice';

export interface UISlice {
  toast: string | null;
  statsOpen: boolean;
  howtoOpen: boolean;
  confetti: boolean;
  currentScreen: AppScreen;
  soundEnabled: boolean;
  confettiEnabled: boolean;
  fontSize: 'small' | 'normal' | 'large';
  theme: 'light' | 'dark';
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

export type GameStore = UnifiedCasesSlice & UnifiedSimulatorSlice & ProfessionSlice & FilterSlice & ArchiveSlice & UISlice & { stats: Stats };
