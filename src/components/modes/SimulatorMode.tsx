import { useGameStore } from '../../store/gameStore';
import { getSimulatorCaseById } from '../../data/simulator';

export function SimulatorMode() {
  const { simulatorState, initSimulator, updateSimulator, finishSimulator } = useGameStore();

  if (!simulatorState) {
    return (
      <section id="simulator" className="section active">
        <div className="game-card">
          <div className="game-header">
            <div className="game-title">🏥 Симулятор врачебного приёма</div>
          </div>
          <p className="sim-intro">
            Проведите полноценный приём: соберите анамнез, назначьте анализы, 
            поставьте диагноз и назначьте лечение.
          </p>
          <button className="btn-primary" onClick={initSimulator}>
            Начать приём
          </button>
        </div>
      </section>
    );
  }

  const scenario = getSimulatorCaseById(simulatorState.caseId);
  if (!scenario) return <div className="loading">Сценарий не найден</div>;

  const stage = simulatorState.stageIndex;

  if (simulatorState.finished) {
    const s = simulatorState.score;
    return (
      <section id="simulator" className="section active">
        <div className="game-card">
          <div className="game-header">
            <div className="game-title">📋 Результат приёма</div>
          </div>
          <div className="score-card">
            <div className="score-value">{s.total}<span>/100</span></div>
            <div className="score-label">Оценка приёма</div>
            <div className="score-breakdown">
              <div className={`score-item${s.diagnosisCorrect ? ' ok' : ''}`}>
                {s.diagnosisCorrect ? '✅' : '❌'} Диагноз
              </div>
              <div className={`score-item${s.treatmentCorrect ? ' ok' : ''}`}>
                {s.treatmentCorrect ? '✅' : '❌'} Лечение
              </div>
              <div className="score-item">
                {s.missedKeyTests > 0 
                  ? `⚠️ Пропущено ключевых анализов: ${s.missedKeyTests}`
                  : '✅ Все ключевые анализы назначены'}
              </div>
              {s.unnecessaryTests > 0 && (
                <div className="score-item warn">
                  ⚠️ Лишние анализы: {s.unnecessaryTests}
                </div>
              )}
            </div>
          </div>
          <div className="explanation-box">
            <strong>Правильный диагноз:</strong> {scenario.correctDiagnosis[0]}
            <br /><br />
            <strong>Лечение:</strong><br />
            {scenario.correctTreatment.drugs.map((d, i) => (
              <div key={i}>• {d.name} {d.dose} ({d.route}) — {d.duration}</div>
            ))}
            {scenario.correctTreatment.procedures && scenario.correctTreatment.procedures.length > 0 && (
              <><br /><strong>Процедуры:</strong> {scenario.correctTreatment.procedures.join(', ')}</>
            )}
            <br /><strong>Режим:</strong> {scenario.correctTreatment.regimen === 'bed' ? 'Постельный' : scenario.correctTreatment.regimen === 'general' ? 'Общий' : scenario.correctTreatment.regimen}
            <br /><strong>Диета:</strong> {scenario.correctTreatment.diet}
            <br /><strong>Противопоказания:</strong> {scenario.correctTreatment.contraindications.join(', ')}
            <br /><br />
            <strong>Объяснение:</strong><br />
            {scenario.explanation}
          </div>
          <button className="btn-secondary" onClick={initSimulator}>
            ➡️ Следующий приём
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="simulator" className="section active">
      <div className="game-card">
        <div className="game-header">
          <div className="game-title">🏥 Симулятор</div>
          <span className="specialty-tag">{scenario.patient.name}, {scenario.patient.age} лет</span>
        </div>

        {stage === 0 && (
          <div className="sim-stage">
            <h3>📝 Жалобы и анамнез</h3>
            <div className="sim-section">
              <strong>Главная жалоба:</strong> {scenario.chiefComplaint}
            </div>
            <div className="sim-section">
              <strong>Анамнез:</strong> {scenario.historyOfPresentIllness}
            </div>
            <button className="btn-primary" onClick={() => updateSimulator({ stageIndex: 1 })}>
              Далее →
            </button>
          </div>
        )}

        {stage === 1 && (
          <div className="sim-stage">
            <h3>🩺 Физикальный осмотр</h3>
            {scenario.vitals.map(v => (
              <div key={v.parameter} className={`sim-vital${v.isAbnormal ? ' abnormal' : ''}`}>
                <strong>{v.parameter}:</strong> {v.value} 
                <span className="normal-range">(норма: {v.normalRange})</span>
                {v.isAbnormal && <span className="interpretation"> — {v.interpretation}</span>}
              </div>
            ))}
            {scenario.physicalExam.map((pe, i) => (
              <div key={i} className={`sim-exam${pe.isAbnormal ? ' abnormal' : ''}`}>
                {pe.finding}
              </div>
            ))}
            <button className="btn-primary" onClick={() => updateSimulator({ stageIndex: 2 })}>
              Далее →
            </button>
          </div>
        )}

        {stage === 2 && (
          <div className="sim-stage">
            <h3>🔬 Назначьте анализы</h3>
            <div className="sim-tests">
              {scenario.availableTests.map(t => {
                const ordered = simulatorState.selectedTests.includes(t.id);
                return (
                  <label key={t.id} className={`sim-test${ordered ? ' ordered' : ''}`}>
                    <input
                      type="checkbox"
                      checked={ordered}
                      onChange={e => {
                        const tests = e.target.checked
                          ? [...simulatorState.selectedTests, t.id]
                          : simulatorState.selectedTests.filter(id => id !== t.id);
                        updateSimulator({ selectedTests: tests });
                      }}
                    />
                    {t.name}
                  </label>
                );
              })}
            </div>
            <button className="btn-primary" onClick={() => updateSimulator({ stageIndex: 3 })}>
              Далее →
            </button>
          </div>
        )}

        {stage === 3 && (
          <div className="sim-stage">
            <h3>🔍 Поставьте диагноз</h3>
            <input
              type="text"
              className="diagnosis-input"
              placeholder="Ваш диагноз..."
              value={simulatorState.diagnosisInput}
              onChange={e => updateSimulator({ diagnosisInput: e.target.value })}
            />
            <button className="btn-primary" onClick={() => updateSimulator({ stageIndex: 4 })}>
              Далее →
            </button>
          </div>
        )}

        {stage === 4 && (
          <div className="sim-stage">
            <h3>💊 Назначьте лечение</h3>
            <textarea
              className="diagnosis-input"
              rows={4}
              placeholder="Введите план лечения..."
              value={simulatorState.treatmentInput}
              onChange={e => updateSimulator({ treatmentInput: e.target.value })}
            />
            <button className="btn-primary" onClick={finishSimulator}>
              ✅ Завершить приём и оценить
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
