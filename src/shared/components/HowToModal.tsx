import { useGameStore } from '../store/gameStore';

export function HowToModal() {
  const { howtoOpen, closeHowto } = useGameStore();
  if (!howtoOpen) return null;

  return (
    <div className="modal-overlay visible" onClick={(e) => { if (e.target === e.currentTarget) closeHowto(); }}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">❓ Как играть</div>
          <button className="modal-close" onClick={closeHowto}>×</button>
        </div>
        <div className="modal-body howto-content">
          <p>MediGuess — это ежедневная медицинская игра в стиле Wordle, где вы угадываете диагноз по клиническим подсказкам.</p>
          <h3>Правила</h3>
          <ul>
            <li>У вас есть <strong>6 попыток</strong>, чтобы угадать диагноз.</li>
            <li>После каждой неправильной попытки открывается <strong>новая подсказка</strong>.</li>
            <li>Подсказки идут от общих симптомов к конкретным лабораторным и инструментальным данным.</li>
            <li>Программа понимает синонимы и различные варианты названия диагноза.</li>
          </ul>
          <h3>Режимы</h3>
          <div className="howto-step"><div className="step-num">1</div><div className="step-text"><strong>Ежедневный:</strong> Новый кейс каждый день. Результаты сохраняются и влияют на статистику и серию.</div></div>
          <div className="howto-step"><div className="step-num">2</div><div className="step-text"><strong>Бесконечный:</strong> Тренируйтесь без ограничений. Результаты не влияют на общую статистику.</div></div>
          <div className="howto-step"><div className="step-num">3</div><div className="step-text"><strong>Архив:</strong> Просматривайте все кейсы и повторяйте их в бесконечном режиме.</div></div>
          <div className="howto-step"><div className="step-num">4</div><div className="step-text"><strong>🏥 Виртуальная клиника:</strong> Полноценный симулятор приёма пациента — от жалоб до лечения. Интерактивное тело, витальные признаки, назначение анализов, диагноз и лечение. Рейтинг «Как врач» оценивает ваши навыки диагноста, терапевта, экономиста и коммуникатора.</div></div>
          <h3>Советы</h3>
          <ul>
            <li>Читайте подсказки внимательно — каждая содержит ключевую информацию.</li>
            <li>Используйте автодополнение при вводе — оно появляется после 2 символов.</li>
            <li>После победы вы можете скопировать Anki-тег для повторения.</li>
            <li>Серия сбрасывается, если вы пропустите день.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
