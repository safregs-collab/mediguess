import { useGameStore } from '../../store/gameStore';

export function Header() {
  const { stats, openStats, openHowTo, goToHome } = useGameStore();

  return (
    <header>
      <div className="header-top">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); goToHome(); }}>
          <span className="logo-icon">🩺</span>
          <span>MediGuess</span>
        </a>
        <div className="header-actions">
          <button className="btn-icon theme-toggle" title="Тема">🌙</button>
          <button className="btn-icon" onClick={openHowTo} title="Как играть">❓</button>
          <button className="streak-badge" title="Серия побед">
            <span>🔥</span>
            <span>{stats.currentStreak}</span>
          </button>
          <button className="btn-icon" onClick={openStats} title="Статистика">📊</button>
        </div>
      </div>
    </header>
  );
}
