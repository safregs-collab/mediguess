import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { XpBar } from '../../features/gamification/components/XpBar';
import { AnimatedIcon } from './AnimatedIcon';

export function Header() {
  const { currentMode, currentScreen, stats, openHowto, openStats, goToHome, goToDaily, goToEndless, goToSimulator, goToArchive, soundEnabled, toggleSound, confettiEnabled, toggleConfetti, fontSize, setFontSize, theme, toggleTheme } = useGameStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  return (
    <header>
      <div className="header-top">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); goToHome(); }} aria-label="DOC — на главную">
          <div className="logo-icon" aria-hidden="true">
            <AnimatedIcon name="book" size={22} color="var(--primary)" />
          </div>
          DOC
        </a>
        <div className="header-actions">
          {currentScreen !== 'home' && (
            <button className="btn-icon" onClick={goToHome} title="Главная" aria-label="Главная">
              <AnimatedIcon name="home" size={18} />
            </button>
          )}
          <button className="btn-icon theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'} aria-label={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {theme === 'dark' ? (
                <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>
              ) : (
                <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>
              )}
            </svg>
          </button>
          <button className="btn-icon" onClick={toggleSound} title={soundEnabled ? 'Выключить звук' : 'Включить звук'} aria-label={soundEnabled ? 'Выключить звук' : 'Включить звук'}>
            <AnimatedIcon name={soundEnabled ? 'sound' : 'mute'} size={18} />
          </button>
          <button className="btn-icon" onClick={toggleConfetti} title={confettiEnabled ? 'Выключить конфетти' : 'Включить конфетти'} aria-label={confettiEnabled ? 'Выключить конфетти' : 'Включить конфетти'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {confettiEnabled ? (
                <><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></>
              ) : (
                <><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><line x1="2" y1="2" x2="22" y2="22"/></>
              )}
            </svg>
          </button>
          <button className="btn-icon" onClick={() => {
            const sizes: Array<'small' | 'normal' | 'large'> = ['small', 'normal', 'large'];
            const idx = sizes.indexOf(fontSize);
            setFontSize(sizes[(idx + 1) % sizes.length]);
          }} title={`Размер шрифта: ${fontSize === 'small' ? 'Мелкий' : fontSize === 'large' ? 'Крупный' : 'Обычный'}`} aria-label={`Размер шрифта: ${fontSize}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 7 4 4 20 4 20 7" />
              <line x1="9" y1="20" x2="15" y2="20" />
              <line x1="12" y1="4" x2="12" y2="20" />
              {fontSize === 'small' && <><line x1="8" y1="10" x2="16" y2="10" strokeWidth="1"/><line x1="9" y1="14" x2="15" y2="14" strokeWidth="1"/></>}
              {fontSize === 'large' && <><line x1="6" y1="10" x2="18" y2="10" strokeWidth="3"/><line x1="7" y1="14" x2="17" y2="14" strokeWidth="3"/></>}
              {fontSize === 'normal' && <><line x1="7" y1="10" x2="17" y2="10" strokeWidth="2"/><line x1="8" y1="14" x2="16" y2="14" strokeWidth="2"/></>}
            </svg>
          </button>
          <button className="btn-icon" onClick={openHowto} title="Как играть" aria-label="Как играть">
            <AnimatedIcon name="help" size={18} />
          </button>
          <button className="streak-badge" onClick={openStats} title="Статистика" aria-label={`Статистика, серия побед: ${stats.currentStreak}`}>
            <AnimatedIcon name="fire" size={16} color="#f59e0b" /> <span>{stats.currentStreak}</span>
          </button>
          <XpBar totalXp={stats.xp?.totalXp ?? 0} compact />
        </div>
      </div>
      <nav>
        <button className={`nav-tab${currentMode === 'daily' ? ' active' : ''}`} onClick={goToDaily}>
          <AnimatedIcon name="calendar" size={16} /> Ежедневный
        </button>
        <button className={`nav-tab${currentMode === 'endless' ? ' active' : ''}`} onClick={goToEndless}>
          <AnimatedIcon name="infinity" size={16} /> Бесконечный
        </button>
        <button className={`nav-tab${currentMode === 'simulator' ? ' active' : ''}`} onClick={goToSimulator}>
          <AnimatedIcon name="simulator" size={16} /> Симулятор
        </button>
        <button className={`nav-tab${currentMode === 'archive' ? ' active' : ''}`} onClick={goToArchive}>
          <AnimatedIcon name="archive" size={16} /> Архив
        </button>
      </nav>
    </header>
  );
}
