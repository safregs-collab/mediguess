import { useGameStore } from '../../shared/store/gameStore';

export function HomeScreen() {
  const { goToGames, goToMetaZone, toggleTheme, theme } = useGameStore();
  const isDark = theme === 'dark';

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: 'var(--bg)', color: 'var(--text)', lineHeight: 1.5, minHeight: '100vh' }}>
      <style>{`
        .home-btn-primary { background:#2bae66;color:white;border-radius:60px;padding:14px 32px;font-weight:600;display:inline-flex;align-items:center;gap:10px;border:2px solid transparent;cursor:pointer;transition:.25s;box-shadow:0 8px 20px rgba(43,174,102,.35);text-decoration:none;font-size:1rem; }
        .home-btn-primary:hover { background:#229954;transform:translateY(-2px);box-shadow:0 12px 28px rgba(43,174,102,.45); }
        .home-btn-outline { background:transparent;border-color:rgba(255,255,255,.5);color:white;border-radius:60px;padding:14px 32px;font-weight:600;display:inline-flex;align-items:center;gap:10px;cursor:pointer;transition:.25s;text-decoration:none;font-size:1rem;border-width:2px;border-style:solid; }
        .home-btn-outline:hover { background:rgba(255,255,255,.1);border-color:white; }
        .home-btn-ghost { background:transparent;color:white;padding:14px 20px;font-weight:500;display:inline-flex;align-items:center;gap:8px;cursor:pointer;transition:.25s;border:none;text-decoration:none;font-size:1rem; }
        .home-card { background:var(--card);border-radius:20px;padding:28px 24px;box-shadow:0 8px 24px rgba(0,0,0,.04);transition:.3s;border:1px solid var(--border);cursor:pointer; }
        .home-card:hover { transform:translateY(-6px);box-shadow:0 16px 40px rgba(0,0,0,.08); }
        .home-card .card-icon { font-size:2.4rem;color:#2bae66;margin-bottom:16px; }
        .home-badge { display:inline-block;background:var(--primary-light);color:var(--primary-dark);font-size:.75rem;font-weight:600;padding:4px 12px;border-radius:30px;margin-top:12px; }
        .home-step-num { width:50px;height:50px;border-radius:50%;background:#2bae66;color:white;font-weight:700;font-size:1.3rem;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;box-shadow:0 6px 16px rgba(43,174,102,.25); }
        .home-stat-num { font-size:2.8rem;font-weight:700;color:var(--primary); }
        .home-stat-icon { font-size:2rem;color:#2bae66;margin-bottom:6px; }
        .home-feature-icon { font-size:2.8rem;color:#2bae66;margin-bottom:12px; }
        @media (max-width:768px) {
          .home-hero { padding:40px 24px !important;flex-direction:column !important;text-align:center !important; }
          .home-hero p { margin-left:auto !important;margin-right:auto !important; }
          .home-hero-btns { justify-content:center !important; }
          .home-steps::before { display:none !important; }
        }
      `}</style>

      {/* HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'transparent', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, maxWidth: 1200, margin: '0 auto', paddingLeft: 24, paddingRight: 24, borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 700, fontSize: '1.6rem', color: isDark ? '#7fc1e0' : '#0a2f44' }}>
          DOC<span style={{ color: '#2bae66' }}>W</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <a href="#" onClick={e => e.preventDefault()} style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 500, transition: '0.2s' }}>О проекте</a>
          <a href="#" onClick={e => e.preventDefault()} style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 500, transition: '0.2s' }}>Режимы</a>
          <a href="#" onClick={e => e.preventDefault()} style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 500, transition: '0.2s' }}>Статистика</a>
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 30,
              padding: '8px 16px',
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

      {/* HERO */}
      <section
        className="home-hero"
        style={{
          background: 'linear-gradient(135deg, #0a2f44, #1b4b66)',
          borderRadius: 32,
          padding: '60px 48px',
          margin: '20px auto 40px',
          maxWidth: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 40,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: -60, top: -60, width: 400, height: 400, background: 'rgba(43,174,102,0.15)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ flex: '1 1 300px', position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3rem)', lineHeight: 1.2, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.01em' }}>
            Тренируй диагностику как врач
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: 500, marginBottom: 28 }}>
            DOCW — это тренажёр для медицинских специалистов и студентов, где вы разбираете реальные клинические кейсы, ставите диагнозы и получаете подробные разборы.
          </p>
          <div className="home-hero-btns" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            <button className="home-btn-primary" onClick={goToGames}>
              <i className="fas fa-play"></i> Начать играть
            </button>
            <button className="home-btn-outline" onClick={goToGames}>
              <i className="fas fa-user-md"></i> Симулятор приёма
            </button>
            <button className="home-btn-ghost" onClick={goToMetaZone}>
              Перейти в мета-зону <i className="fas fa-arrow-right" style={{ transition: '0.2s' }}></i>
            </button>
          </div>
        </div>
        <div style={{ flex: '0 0 200px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <i className="fas fa-heartbeat" style={{ fontSize: '8rem', color: 'rgba(255,255,255,0.15)' }}></i>
        </div>
      </section>

      {/* STATS */}
      <div
        style={{
          background: 'var(--card)',
          borderRadius: 24,
          padding: '40px 32px',
          margin: '40px auto',
          maxWidth: 1200,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 24,
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        }}
      >
        {[
          { icon: 'fa-folder-open', num: '100+', label: 'Кейсов' },
          { icon: 'fa-layer-group', num: '4', label: 'Режима' },
          { icon: 'fa-user-tag', num: '8', label: 'Ролей' },
          { icon: 'fa-stethoscope', num: '12+', label: 'Специальностей' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="home-stat-icon"><i className={"fas " + s.icon}></i></div>
            <div className="home-stat-num">{s.num}</div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* MODES */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Режимы</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.25rem' }}>Выбери свой путь в медицине</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 30, margin: '30px 0 50px' }}>
          {[
            { icon: 'fa-calendar-day', title: 'Ежедневный кейс', desc: 'Один новый диагностический кейс каждый день. Соревнуйтесь с друзьями и следите за серией.', badge: 'Новый каждый день' },
            { icon: 'fa-infinity', title: 'Бесконечный режим', desc: 'Тренируйтесь без ограничений. Случайные кейсы из всех специальностей медицины.', badge: 'Безлимит' },
            { icon: 'fa-users', title: 'Ролевой режим', desc: 'Выберите роль: медсестра, интерн, терапевт, хирург. Своя сложность и подсказки.', badge: '8 ролей' },
            { icon: 'fa-clinic-medical', title: 'Симулятор приёма', desc: 'Полноценный приём пациента: анамнез, осмотр, анализ, диагноз, лечение.', badge: 'Реалистично' },
          ].map(m => (
            <div key={m.title} className="home-card" onClick={goToGames}>
              <div className="card-icon"><i className={"fas " + m.icon}></i></div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>{m.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{m.desc}</p>
              <span className="home-badge">{m.badge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STEPS */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Четыре шага к мастерству</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.25rem' }}>От кейса до диагноза за несколько минут</p>
        </div>
        <div className="home-steps" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 20, margin: '30px 0 50px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 25, left: '10%', right: '10%', height: 3, background: isDark ? '#2a3f55' : '#d0dce8', zIndex: 0 }} />
          {[
            { num: '1', title: 'Получите кейс', desc: 'Читайте жалобы, анамнез и данные осмотра' },
            { num: '2', title: 'Поставьте диагноз', desc: 'Вводите предположение — система подскажет' },
            { num: '3', title: 'Узнайте разбор', desc: 'Подробное объяснение с рекомендациями' },
            { num: '4', title: 'Тренируйтесь ежедневно', desc: 'Наращивайте серию, открывайте архив' },
          ].map(s => (
            <div key={s.num} style={{ flex: '1 1 180px', textAlign: 'center', position: 'relative', zIndex: 1, background: 'transparent' }}>
              <div className="home-step-num">{s.num}</div>
              <h4 style={{ fontWeight: 600, marginBottom: 4 }}>{s.title}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ background: '#0a2f44', color: 'white', borderRadius: 32, padding: '50px 40px', margin: '40px auto', maxWidth: 1200 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>Всё для эффективного обучения</h2>
          <p style={{ color: '#aac3d4', fontSize: '1.1rem', marginTop: '0.25rem' }}>Инструменты, которые помогут вам расти</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 30, marginTop: 20 }}>
          {[
            { icon: 'fa-book-medical', title: '100+ кейсов', desc: 'Реальные клинические ситуации' },
            { icon: 'fa-chart-line', title: 'Статистика', desc: 'Отслеживайте прогресс и серию' },
            { icon: 'fa-archive', title: 'Архив', desc: 'Все пройденные кейсы с разборами' },
            { icon: 'fa-moon', title: 'Тёмная тема', desc: 'Комфортно при любом освещении' },
          ].map(f => (
            <div key={f.title} style={{ textAlign: 'center' }}>
              <div className="home-feature-icon"><i className={"fas " + f.icon}></i></div>
              <h4 style={{ fontWeight: 600, marginBottom: 4 }}>{f.title}</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: 'linear-gradient(135deg, #2bae66, #1f8a4a)', borderRadius: 28, padding: '40px 32px', textAlign: 'center', color: 'white', margin: '30px auto 40px', maxWidth: 1200 }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: 8 }}>Готовы проверить свои навыки?</h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: 24 }}>Начните с ежедневного кейса или погрузитесь в бесконечный режим тренировки.</p>
        <button
          className="home-btn-primary"
          style={{ background: 'white', color: '#0a2f44', boxShadow: 'none' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f0f7fa'; e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'scale(1)'; }}
          onClick={goToMetaZone}
        >
          <i className="fas fa-play"></i> Перейти в мета-зону
        </button>
      </div>

      {/* FOOTER */}
      <footer style={{ background: isDark ? '#0d1b26' : '#eef2f6', borderRadius: '28px 28px 0 0', padding: '40px 32px 24px', marginTop: 40, transition: 'background 0.3s', maxWidth: 1200, margin: '40px auto 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <a href="#" onClick={e => e.preventDefault()} style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 500 }}>О DOCW</a>
            <a href="#" onClick={e => e.preventDefault()} style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 500 }}>Помощь</a>
            <a href="#" onClick={e => e.preventDefault()} style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 500 }}>Контакты</a>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--text)', fontSize: '1.3rem', textDecoration: 'none' }}><i className="fab fa-telegram"></i></a>
            <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--text)', fontSize: '1.3rem', textDecoration: 'none' }}><i className="fab fa-youtube"></i></a>
            <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--text)', fontSize: '1.3rem', textDecoration: 'none' }}><i className="fab fa-vk"></i></a>
          </div>
        </div>
        <div style={{ marginTop: 20, fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', width: '100%' }}>
          © 2026 DOCW. Тренируй диагностику как врач.
        </div>
      </footer>
    </div>
  );
}
