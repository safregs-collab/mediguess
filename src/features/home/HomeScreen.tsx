import { useGameStore } from '../../shared/store/gameStore';

export function HomeScreen() {
  const { goToGames } = useGameStore();

  const gameModes = [
    {
      icon: '📅',
      title: 'Ежедневный кейс',
      desc: 'Один новый диагностический кейс каждый день. Соревнуйтесь с друзьями и следите за серией побед.',
      color: '#0d9488',
      bg: 'rgba(13,148,136,0.08)',
    },
    {
      icon: '♾️',
      title: 'Бесконечный режим',
      desc: 'Тренируйтесь без ограничений. Случайные кейсы из всех специальностей медицины.',
      color: '#0ea5e9',
      bg: 'rgba(14,165,233,0.08)',
    },
    {
      icon: '🎭',
      title: 'Ролевой режим',
      desc: 'Выберите роль: медсестра, интерн, терапевт, хирург. Каждая роль — своя сложность и подсказки.',
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.08)',
    },
    {
      icon: '🏥',
      title: 'Симулятор приёма',
      desc: 'Полноценный приём пациента: анамнез, осмотр, анализы, диагноз, назначение лечения.',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
    },
  ];

  const steps = [
    { num: '1', title: 'Получите кейс', desc: 'Читайте жалобы, анамнез и данные осмотра пациента' },
    { num: '2', title: 'Поставьте диагноз', desc: 'Вводите предположение — система подскажет, близко ли вы' },
    { num: '3', title: 'Узнайте разбор', desc: 'После ответа откроется подробное объяснение с рекомендациями' },
    { num: '4', title: 'Тренируйтесь ежедневно', desc: 'Наращивайте серию, открывайте архив кейсов, повышайте уровень' },
  ];

  const features = [
    { icon: '🧠', title: '100+ кейсов', desc: 'Реальные клинические ситуации' },
    { icon: '🏆', title: 'Статистика', desc: 'Отслеживайте прогресс и серию' },
    { icon: '📚', title: 'Архив', desc: 'Все пройденные кейсы с разборами' },
    { icon: '🌙', title: 'Тёмная тема', desc: 'Комфортно при любом освещении' },
  ];

  return (
    <div className="home-screen">
      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-bg">
          <div className="home-orb home-orb-1" />
          <div className="home-orb home-orb-2" />
          <div className="home-orb home-orb-3" />
        </div>
        <div className="home-hero-content">
          <div className="home-badge">🩺 Образовательный медицинский портал</div>
          <h1 className="home-title">
            Тренируй диагностику
            <br />
            <span className="home-title-accent">как врач</span>
          </h1>
          <p className="home-description">
            MediGuess — это не просто игра. Это тренажёр для медицинских специалистов и студентов,
            где вы разбираете реальные клинические кейсы, ставите диагнозы и получаете
            подробные разборы от экспертов.
          </p>
          <div className="home-cta-group">
            <button className="home-cta-btn" onClick={goToGames}>
              🎮 Начать играть
            </button>
            <span className="home-cta-hint">Бесплатно • Без регистрации</span>
          </div>
          <div className="home-hero-stats">
            <div className="home-hstat">
              <span className="home-hstat-num">100+</span>
              <span className="home-hstat-label">кейсов</span>
            </div>
            <div className="home-hstat">
              <span className="home-hstat-num">4</span>
              <span className="home-hstat-label">режима</span>
            </div>
            <div className="home-hstat">
              <span className="home-hstat-num">8</span>
              <span className="home-hstat-label">ролей</span>
            </div>
            <div className="home-hstat">
              <span className="home-hstat-num">12+</span>
              <span className="home-hstat-label">специальностей</span>
            </div>
          </div>
        </div>
      </section>

      {/* GAME MODES */}
      <section className="home-section">
        <div className="home-section-header">
          <span className="home-section-label">Режимы</span>
          <h2 className="home-section-title">Выбери свой путь в медицине</h2>
          <p className="home-section-desc">
            От быстрых ежедневных кейсов до полноценного симулятора приёма пациента
          </p>
        </div>
        <div className="home-modes-grid">
          {gameModes.map((m) => (
            <div key={m.title} className="home-mode-card" style={{ '--mode-color': m.color, '--mode-bg': m.bg } as React.CSSProperties}>
              <div className="home-mode-icon">{m.icon}</div>
              <h3 className="home-mode-title">{m.title}</h3>
              <p className="home-mode-desc">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="home-section home-section-alt">
        <div className="home-section-header">
          <span className="home-section-label">Как это работает</span>
          <h2 className="home-section-title">Четыре шага к мастерству</h2>
        </div>
        <div className="home-steps">
          {steps.map((s, i) => (
            <div key={s.num} className="home-step">
              <div className="home-step-num">{s.num}</div>
              <div className="home-step-body">
                <h4 className="home-step-title">{s.title}</h4>
                <p className="home-step-desc">{s.desc}</p>
              </div>
              {i < steps.length - 1 && <div className="home-step-arrow">↓</div>}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="home-section">
        <div className="home-section-header">
          <span className="home-section-label">Возможности</span>
          <h2 className="home-section-title">Всё для эффективного обучения</h2>
        </div>
        <div className="home-features-grid">
          {features.map((f) => (
            <div key={f.title} className="home-feature">
              <div className="home-feature-icon">{f.icon}</div>
              <h4 className="home-feature-title">{f.title}</h4>
              <p className="home-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta-section">
        <div className="home-cta-card">
          <h2 className="home-cta-title">Готовы проверить свои навыки?</h2>
          <p className="home-cta-desc">
            Начните с ежедневного кейса или погрузитесь в бесконечный режим тренировки.
            Каждый кейс — это новый опыт.
          </p>
          <button className="home-cta-btn home-cta-btn-lg" onClick={goToGames}>
            🚀 Перейти к играм
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <p>MediGuess © 2026 — Образовательный медицинский портал</p>
        <p className="home-footer-disclaimer">
          ⚠️ Информация предоставлена исключительно в образовательных целях.
          Не используйте для самодиагностики или самолечения.
        </p>
      </footer>
    </div>
  );
}
