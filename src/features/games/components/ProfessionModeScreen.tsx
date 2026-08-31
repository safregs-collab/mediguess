import { useGameStore } from '../../../shared/store/gameStore';
import { PROFESSIONS } from '../../../professions/types';
import type { Profession } from '../../../types';

const levelLabel: Record<string, string> = {
  basic: 'Базовый',
  intermediate: 'Средний',
  advanced: 'Высокий',
};

export function ProfessionModeScreen() {
  const {
    currentProfession,
    goToDaily,
    goToEndless,
    goToSimulator,
    goToArchive,
    clearProfession,
    professionCases,
    loadDailyCase,
    loadEndlessCase,
    loadSimulatorScenario,
    toggleTheme,
    theme,
  } = useGameStore();

  const isDark = theme === 'dark';

  if (!currentProfession) return null;

  const config = PROFESSIONS[currentProfession as Profession];
  const cases = professionCases[currentProfession as Profession] || [];

  const modes = [
    {
      id: 'daily',
      icon: 'fa-calendar-day',
      title: 'Ежедневный',
      subtitle: 'Новый кейс каждый день',
      desc: `Один общий кейс на день для всех профессий. Соревнуйтесь с коллегами — кто угадает быстрее?${
        config.level === 'basic' ? ' Фокус на наблюдении и распознавании.' :
        config.level === 'intermediate' ? ' Фокус на диагностике и стабилизации.' :
        ' Полный цикл: анамнез, диагностика, диагноз, лечение.'
      }`,
      features: config.caseFocus.slice(0, 3),
      action: () => { loadDailyCase(currentProfession); goToDaily(); },
      badge: 'Новый каждый день',
    },
    {
      id: 'endless',
      icon: 'fa-infinity',
      title: 'Бесконечный',
      subtitle: cases.length > 0 ? `${cases.length}+ кейсов` : 'Загрузка...',
      desc: `Проходите кейсы без ограничений. Каждый новый — случайный из архива.${
        config.level === 'basic' ? ' Фокус на наблюдении и распознавании.' :
        config.level === 'intermediate' ? ' Фокус на диагностике и стабилизации.' :
        ' Полный цикл: анамнез, диагностика, диагноз, лечение.'
      }`,
      features: config.caseFocus.slice(0, 3),
      action: () => { loadEndlessCase(currentProfession); goToEndless(); },
      badge: 'Безлимит',
    },
    {
      id: 'simulator',
      icon: 'fa-clinic-medical',
      title: 'Симулятор',
      subtitle: 'Древовидные сценарии',
      desc: `Проходите древовидные клинические сценарии с динамикой виталов и таймером.${
        config.level === 'basic' ? ' Палатные ситуации: мониторинг, неотложная помощь.' :
        config.level === 'intermediate' ? ' Экстренные вызовы: ДТП, ОКС, травма.' :
        ' Сложные цепочки: дифдиагностика, осложнения.'
      }`,
      features: config.simFocus.slice(0, 3),
      action: () => { loadSimulatorScenario(currentProfession); goToSimulator(); },
      badge: 'Реалистично',
    },
    {
      id: 'archive',
      icon: 'fa-archive',
      title: 'Архив',
      subtitle: 'Пройденные кейсы',
      desc: 'Просматривайте и повторяйте ранее пройденные кейсы и симуляторы.',
      features: ['История', 'Повторение'],
      action: goToArchive,
      badge: 'Архив',
    },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: 'var(--bg)', color: 'var(--text)', lineHeight: 1.5, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .mode-card { background:var(--card); border-radius:24px; padding:32px 28px; box-shadow:0 8px 24px rgba(0,0,0,0.05); transition:0.3s ease; border:1px solid rgba(0,0,0,0.02); text-decoration:none; color:inherit; display:flex; flex-direction:column; height:100%; cursor:pointer; }
        .mode-card:hover { transform:translateY(-8px); box-shadow:0 20px 48px rgba(0,0,0,0.10); }
        .mode-card-icon { font-size:2.8rem; color:#2bae66; margin-bottom:16px; }
        .mode-card h3 { font-weight:700; margin-bottom:4px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; font-size:1.4rem; }
        .mode-badge { display:inline-block; background:var(--primary-light); color:var(--primary-dark); font-size:0.75rem; font-weight:600; padding:4px 12px; border-radius:30px; margin-top:12px; }
        .mode-desc { color:var(--text-secondary); margin:12px 0 16px; font-size:0.95rem; }
        .mode-list { list-style:none; padding:0; margin:8px 0 16px; flex:1; }
        .mode-list li { padding:4px 0 4px 24px; position:relative; font-size:0.92rem; color:var(--text-secondary); }
        .mode-list li::before { content:'✓'; position:absolute; left:0; color:#2bae66; font-weight:700; }
        .mode-btn { background:#2bae66; color:white; border:none; padding:12px 24px; border-radius:60px; font-weight:600; font-size:0.95rem; cursor:pointer; transition:0.25s; align-self:flex-start; margin-top:8px; display:inline-flex; align-items:center; gap:8px; }
        .mode-btn:hover { background:#229954; transform:scale(1.02); }
        .mode-prof-info { background:var(--card); border-radius:24px; padding:24px 28px; margin:0 auto 32px; max-width:1200; box-shadow:0 8px 24px rgba(0,0,0,0.04); display:flex; align-items:center; gap:20px; flex-wrap:wrap; }
        .mode-prof-icon { width:64px; height:64px; border-radius:20px; background:rgba(43,174,102,0.1); display:flex; align-items:center; justify-content:center; font-size:2rem; color:#2bae66; flex-shrink:0; }
        .mode-footer { background:var(--card); border-radius:28px 28px 0 0; padding:28px 32px 20px; marginTop:20px; text-align:center; }
        .mode-footer p { font-size:0.9rem; color:var(--text-secondary); }
        .mode-footer .small-note { font-size:0.8rem; opacity:0.7; margin-top:8px; }
        @media (max-width:768px) {
          .mode-card { padding:24px; }
          .mode-card h3 { font-size:1.2rem; }
          .mode-prof-info { padding:20px; }
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
              onClick={clearProfession}
              style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 500, transition: '0.2s', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
            >
              <i className="fas fa-arrow-left" style={{ fontSize: '0.9rem' }}></i> Все профессии
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
            Выберите режим
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', marginBottom: '2rem' }}>
            {config.title} — {levelLabel[config.level]} уровень. Каждый режим адаптирован под вашу профессию.
          </p>
        </div>

        {/* PROFESSION INFO */}
        <div className="mode-prof-info">
          <div className="mode-prof-icon"><i className={"fas " + (config.icon === 'nurse' ? 'fa-user-nurse' : config.icon === 'ambulance' ? 'fa-ambulance' : 'fa-user-md')}></i></div>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>{config.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{config.description}</p>
          </div>
        </div>

        {/* MODE CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, margin: '30px 0 40px' }}>
          {modes.map((m) => (
            <div
              key={m.id}
              className="mode-card"
              onClick={m.action}
            >
              <div className="mode-card-icon"><i className={"fas " + m.icon}></i></div>
              <h3>
                {m.title}
                <span className="mode-badge">{m.badge}</span>
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>{m.subtitle}</div>
              <div className="mode-desc">{m.desc}</div>
              <ul className="mode-list">
                {m.features.map((f: string) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <span className="mode-btn"><i className="fas fa-arrow-right"></i> Начать</span>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mode-footer">
        <p>DOCW © 2026 — Игровая медицинская платформа</p>
        <p className="small-note">Информация предоставлена исключительно в образовательных целях.</p>
      </footer>
    </div>
  );
}
