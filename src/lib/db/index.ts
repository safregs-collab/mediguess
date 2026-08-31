import type { IAppDatabase } from './types';
import { WebDatabase } from './web';
import { TauriDatabase } from './tauri';

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function createDatabase(): IAppDatabase {
  if (isTauri()) {
    return new TauriDatabase();
  }
  return new WebDatabase();
}

export type { IAppDatabase };
