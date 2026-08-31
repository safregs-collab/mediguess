import { useGameStore } from '../../../shared/store/gameStore';
import { PROFESSIONS } from '../../../professions/types';
import type { Profession } from '../../../types';

const professionCards: { id: Profession; icon: string }[] = [
  { id: 'nurse', icon: 'fa-user-nurse' },
  { id: 'paramedic', icon: 'fa-ambulance' },
  { id: 'doctor', icon: 'fa-user-md' },
];

const levelLabel: Record<string, string> = {
  basic: 'Базовый',
  intermediate: 'Средний',
  advanced: 'Высокий',
};

const badgeClass: Record<string, string> = {
  basic: 'badge-basic',
  intermediate: 'badge-middle',
  advanced: 'badge-high',
};

export function ProfessionScreen() {
  const { selectProfession, goToHome, toggleTheme, theme } = useGameStore();
  const isDark = theme === 'dark';

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: 'var(--bg)', color: 'var(--text)', lineHeight: 1.5, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .prof-card { background:var(--card); border-radius:24px; padding:32px 28px; box-shadow:0 8px 24px rgba(0,0,0,0.05); transition:0.3s ease; border:1px solid rgba(0,0,0,0.02); text-decoration:none; color:inherit; display:flex; flex-direction:column; height:100%; cursor:pointer; }
        .prof-card:hover { transform:translateY(-8px); box-shadow:0 20px 48px rgba(0,0,0,0.10); }
        .prof-card-icon { font-size:2.8rem; color:#2bae66; margin-bottom:16px; }
        .prof-card h3 { font-weight:700; margin-bottom:4px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; font-size:1.4rem; }
        .level-badge { font-size:0.7rem; font-weight:600; padding:4px 14px; border-radius:30px; text-transform:uppercase; letter-spacing:0.03em; }
        .badge-basic { background:#e4f4ea; color:#1f7a4a; }
        .badge-middle { background:#f4edda; color:#a67c2e; }
        .badge-high { background:#f4e0e0; color:#b33c3c; }
        [data-theme="dark"] .badge-basic { background:#1a3a2a; color:#7fc1a0; }
        [data-theme="dark"] .badge-middle { background:#3a3a1a; color:#e8d080; }
        [data-theme="dark"] .badge-high { background:#3a1a2a; color:#e8a0a0; }
        .prof-desc { color:var(--text-secondary); margin:12px 0 16px; font-size:0.95rem; }
        .prof-list { list-style:none; padding:0; margin:8px 0 16px; flex:1; }
        .prof-list li { padding:4px 0 4px 24px; position:relative; font-size:0.92rem; color:var(--text-secondary); }
        .prof-list li::before { content:'✓'; position:absolute; left:0; color:#2bae66; font-weight:700; }
        .prof-btn { background:#2bae66; color:white; border:none; padding:12px 24px; border-radius:60px; font-weight:600; font-size:0.95rem; cursor:pointer; transition:0.25s; align-self:flex-start; margin-top:8px; display:inline-flex; align-items:center; gap:8px; }
        .prof-btn:hover { background:#229954; transform:scale(1.02); }
        .prof-info { background:var(--card); border-radius:24px; padding:36px 32px; margin:20px auto 40px; max-width:1200; box-shadow:0 8px 24px rgba(0,0,0,0.04); }
        .prof-info h2 { font-size:1.6rem; margin-bottom:12px; }
        .prof-info p { color:var(--text-secondary); font-size:1.02rem; max-width:800px; }
        .prof-footer { background:var(--card); border-radius:28px 28px 0 0; padding:28px 32px 20px; margin-top:20px; text-align:center; }
        .prof-footer p { font-size:0.9rem; color:var(--text-secondary); }
        .prof-footer .small-note { font-size:0.8rem; opacity:0.7; margin-top:8px; }
        @media (max-width:768px) {
          .prof-card { padding:24px; }
          .prof-card h3 { font-size:1.2rem; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', flex: 1, width: '100%' }}>
        {/* HEADER */}
        <header style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'transparent', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: '1.6rem', color: isDark ? '#7fc1e0' : '#0a2f44' }}>
            DOC<span style={{ color: '#2bae66' }}>W</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button
              onClick={goToHome}
              style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 500, transition: '0.2s', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
            >
              <i className="fas fa-home" style={{ fontSize: '0.9rem' }}></i> На главную
            </button>
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 30,
                padding: '8px 18px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: '0.3s',
                color: 'var(--text)',
              }}
            >
              <i className={isDark ? 'fas fa-sun' : 'fas fa-moon'} style={{ fontSize: '1rem' }}></i>
              {isDark ? 'Светлая' : 'Тёмная'}
            </button>
          </div>
        </header>

        {/* PAGE TITLE */}
        <div style={{ textAlign: 'center', padding: '30px 0 10px' }}>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 2.8rem)', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 8 }}>
            Выберите профессию
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', marginBottom: '2rem' }}>
            Каждая профессия имеет свои кейсы и симуляторы, адаптированные под уровень ответственности и компетенций
          </p>
        </div>

        {/* CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, margin: '30px 0 40px' }}>
          {professionCards.map(({ id, icon }) => {
            const config = PROFESSIONS[id];
            return (
              <div
                key={id}
                className="prof-card"
                onClick={() => selectProfession(id)}
              >
                <div className="prof-card-icon"><i className={"fas " + icon}></i></div>
                <h3>
                  {config.title}
                  <span className={"level-badge " + badgeClass[config.level]}>
                    {levelLabel[config.level]}
                  </span>
                </h3>
                <div className="prof-desc">{config.description}</div>
                <ul className="prof-list">
                  {config.features.map((f: string) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <span className="prof-btn"><i className="fas fa-arrow-right"></i> Выбрать</span>
              </div>
            );
          })}
        </div>

        {/* INFO BLOCK */}
        <div className="prof-info">
          <h2><i className="fas fa-database" style={{ color: '#2bae66', marginRight: 12 }}></i>Как формируются кейсы?</h2>
          <p>Платформа собирает данные из Клинических Рекомендаций Минздрава (КР) и структурирует их через Meta Zone. Каждая профессия получает адаптированный набор: медсестра — наблюдение и базовая помощь, фельдшер — диагностика и стабилизация, врач — полный цикл с дифференциальной диагностикой.</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="prof-footer">
        <p>DOCW © 2026 — Игровая медицинская платформа</p>
        <p className="small-note">Информация предоставлена исключительно в образовательных целях.</p>
      </footer>
    </div>
  );
}
