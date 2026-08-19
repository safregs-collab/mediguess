import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { XpBar } from '../../features/gamification/components/XpBar';

export function Header() {
  const { currentMode, switchMode, stats, openHowto, openStats, goToHome } = useGameStore();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mg_theme');
    const isDark = saved ? saved === 'dark' : true; // по умолчанию тёмная тема
    setDark(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('mg_theme', next ? 'dark' : 'light');
  };

  return (
    <header>
      <div className="header-top">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); goToHome(); }}>
          <div className="logo-icon">🩺</div>
          MediGuess
        </a>
        <div className="header-actions">
          <button className="btn-icon theme-toggle" onClick={toggleTheme} title={dark ? 'Светлая тема' : 'Тёмная тема'}>
            {dark ? '☀️' : '🌙'}
          </button>
          <button className="btn-icon" onClick={openHowto} title="Как играть">❓</button>
          <button className="streak-badge" onClick={openStats} title="Статистика">
            🔥 <span>{stats.currentStreak}</span>
          </button>
          <XpBar totalXp={stats.xp?.totalXp ?? 0} compact />
        </div>
      </div>
      <nav>
        <button className={`nav-tab${currentMode === 'daily' ? ' active' : ''}`} onClick={() => switchMode('daily')}>📅 Ежедневный</button>
        <button className={`nav-tab${currentMode === 'endless' ? ' active' : ''}`} onClick={() => switchMode('endless')}>♾️ Бесконечный</button>
        <button className={`nav-tab${currentMode === 'archive' ? ' active' : ''}`} onClick={() => switchMode('archive')}>📚 Архив</button>
        <button className={`nav-tab${currentMode === 'roleplay' || currentMode === 'roleplayArchive' ? ' active' : ''}`} onClick={() => switchMode('roleplay')}>🎭 Ролевой</button>
        <button className={`nav-tab${currentMode === 'simulation' ? ' active' : ''}`} onClick={() => switchMode('simulation')}>🏥 Симулятор</button>
      </nav>
    </header>
  );
}
