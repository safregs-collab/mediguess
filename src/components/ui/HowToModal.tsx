import { useGameStore } from '../../store/gameStore';

export function HowToModal() {
  const { howToOpen, closeHowTo } = useGameStore();

  if (!howToOpen) return null;

  return (
    <div className="modal-overlay visible" onClick={e => { if (e.target === e.currentTarget) closeHowTo(); }}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">❓ Как играть</div>
          <button className="modal-close" onClick={closeHowTo}>×</button>
        </div>
        <div className="modal-body howto-content">
          <h3>🎯 Цель игры</h3>
          <p>Угадайте диагноз по клиническим подсказкам за 6 попыток.</p>

          <h3>📋 Правила</h3>
          <ul>
            <li>Каждая попытка открывает новую подсказку</li>
            <li>Вводите диагноз и нажимайте «Проверить»</li>
            <li>✅ — верно, ❌ — неверно</li>
            <li>После 6 неправильных попыток игра заканчивается</li>
          </ul>

          <h3>🎮 Режимы</h3>
          <ul>
            <li><strong>📅 Ежедневный</strong> — один кейс в день для всех</li>
            <li><strong>♾️ Бесконечный</strong> — тренируйтесь без ограничений</li>
            <li><strong>📚 Архив</strong> — все кейсы с фильтрами</li>
            <li><strong>🎭 Ролевой</strong> — играйте за медсестру, интерна, хирурга...</li>
            <li><strong>🏥 Симулятор</strong> — полноценный врачебный приём</li>
          </ul>

          <h3>⚠️ Важно</h3>
          <p>MediGuess — образовательная игра. Не используйте для самодиагностики!</p>
        </div>
      </div>
    </div>
  );
}
