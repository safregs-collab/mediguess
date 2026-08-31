import { useEffect, useRef } from 'react';
import { useGameStore } from '../../../shared/store/gameStore';
import { AnimatedIcon } from '../../../shared/components/AnimatedIcon';
import type { SimStageOption, SimHistoryEntry } from '../../../professions/types';

export function SimulatorBoard() {
  const {
    currentScenario,
    simulatorState,
    simulatorResult,
    selectSimulatorOption,
    handleTimeout,
    resetSimulator,
    goToProfessionSelect,
  } = useGameStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!simulatorState || simulatorState.gameOver) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      if (!simulatorState.gameOver && simulatorState.timeLeft > 0) {
        const newTimeLeft = simulatorState.timeLeft - 1;
        if (newTimeLeft <= 0) {
          handleTimeout();
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [simulatorState, handleTimeout]);

  if (!currentScenario || !simulatorState) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">Симулятор не загружен</p>
          <button className="btn-secondary" onClick={goToProfessionSelect}>
            <AnimatedIcon name="arrowUp" size={16} style={{ transform: 'rotate(-90deg)', display: 'inline-flex', marginRight: '6px' }} />
            Назад
          </button>
        </div>
      </div>
    );
  }

  if (simulatorResult) {
    const resultClass =
      simulatorResult.resultType === 'excellent'
        ? 'win'
        : simulatorResult.resultType === 'good'
        ? 'win'
        : 'lose';

    return (
      <section className="section active">
        <div className="game-card">
          <div className="game-header">
            <div className="game-title">
              <AnimatedIcon name="simulator" size={20} /> Результат симуляции
            </div>
          </div>

          <div className={`result-area ${resultClass}`}>
            <div className="result-title">
              {simulatorResult.resultType === 'excellent' && (
                <><AnimatedIcon name="party" size={20} /> Отлично! {simulatorResult.percent}%</>
              )}
              {simulatorResult.resultType === 'good' && (
                <><AnimatedIcon name="check" size={20} /> Хорошо! {simulatorResult.percent}%</>
              )}
              {simulatorResult.resultType === 'needs-work' && (
                <><AnimatedIcon name="warning" size={20} color="var(--warning)" /> Требуется доработка — {simulatorResult.percent}%</>
              )}
              {simulatorResult.resultType === 'death' && (
                <><AnimatedIcon name="cross" size={20} color="var(--error)" /> Летальный исход</>
              )}
            </div>

            <div className="explanation-box">
              <strong>Оценки по категориям:</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                {Object.entries(simulatorResult.categoryScores).map(([cat, score]: [string, { value: number; max: number; percent: number }]) => (
                  <div key={cat} style={{ padding: '8px', background: 'var(--bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                      {cat === 'assessment' ? 'Оценка' : cat === 'action' ? 'Действие' : cat === 'documentation' ? 'Документация' : 'Коммуникация'}
                    </div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text)' }}>
                      {score.value} / {score.max} ({score.percent}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {simulatorResult.learningOutcomes.length > 0 && (
              <div className="explanation-box" style={{ marginTop: '12px' }}>
                <strong>Рекомендации:</strong>
                <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
                  {simulatorResult.learningOutcomes.map((outcome: string, i: number) => (
                    <li key={i} style={{ marginBottom: '4px', color: 'var(--text-secondary)' }}>{outcome}</li>
                  ))}
                </ul>
              </div>
            )}

            <button className="btn-primary" onClick={resetSimulator}>
              <AnimatedIcon name="refresh" size={16} style={{ marginRight: '6px' }} /> Пройти заново
            </button>
            <button className="btn-secondary" onClick={goToProfessionSelect} style={{ marginLeft: '8px' }}>
              <AnimatedIcon name="arrowUp" size={16} style={{ transform: 'rotate(-90deg)', display: 'inline-flex', marginRight: '6px' }} />
              К выбору режима
            </button>
          </div>
        </div>
      </section>
    );
  }

  const currentStage = currentScenario.stages[simulatorState.currentStage];
  if (!currentStage) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">Ошибка загрузки стадии...</p>
      </div>
    );
  }

  const patient = simulatorState.patient;

  return (
    <section className="section active">
      <div className="game-card">
        <div className="game-header">
          <div className="game-title">
            <AnimatedIcon name="simulator" size={20} /> {currentScenario.title}
          </div>
          <span className={`specialty-tag tag-${currentScenario.specialty}`}>
            {currentScenario.specialtyName}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          padding: '12px',
          background: simulatorState.timeLeft < 30 ? 'rgba(239,68,68,0.1)' : 'var(--primary-light)',
          borderRadius: '12px',
          border: `1px solid ${simulatorState.timeLeft < 30 ? 'var(--error)' : 'var(--primary)'}`
        }}>
          <AnimatedIcon name="timer" size={18} color={simulatorState.timeLeft < 30 ? 'var(--error)' : 'var(--primary)'} />
          <span style={{ fontWeight: 'bold', color: simulatorState.timeLeft < 30 ? 'var(--error)' : 'var(--primary)' }}>
            {Math.floor(simulatorState.timeLeft / 60)}:{String(simulatorState.timeLeft % 60).padStart(2, '0')}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {currentStage.title}
          </span>
        </div>

        {patient && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '8px',
            marginBottom: '16px',
            padding: '12px',
            background: 'var(--bg)',
            borderRadius: '12px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>АД</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{patient.vitals.bp_sys}/{patient.vitals.bp_dia}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Пульс</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{patient.vitals.pulse}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>SpO₂</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{patient.vitals.spo2}%</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ЧДД</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{patient.vitals.rr}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Темп</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{patient.vitals.temp}°C</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Боль</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{patient.vitals.pain}/10</div>
            </div>
          </div>
        )}

        <div className="explanation-box" style={{ marginBottom: '16px' }}>
          <strong>{currentStage.title}</strong>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>{currentStage.description}</p>
          {currentStage.hint && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--primary)', fontStyle: 'italic' }}>
              💡 {currentStage.hint}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentStage.options.map((option: SimStageOption, idx: number) => (
            <button
              key={option.id}
              className="btn-secondary"
              style={{ textAlign: 'left', padding: '16px', justifyContent: 'flex-start' }}
              onClick={() => selectSimulatorOption(idx)}
            >
              <span style={{ fontWeight: 'bold', marginRight: '8px', color: 'var(--primary)' }}>
                {String.fromCharCode(65 + idx)}.
              </span>
              {option.text}
            </button>
          ))}
        </div>

        {simulatorState.history.length > 0 && (
          <div style={{ marginTop: '24px', padding: '12px', background: 'var(--bg)', borderRadius: '12px' }}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>История действий:</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              {simulatorState.history.map((entry: SimHistoryEntry, i: number) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  padding: '6px 10px',
                  background: entry.correct ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  borderRadius: '8px',
                }}>
                  <span>{entry.correct ? '✅' : '❌'}</span>
                  <span style={{ color: 'var(--text)' }}>{entry.stageTitle}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>→ {entry.chosenText}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
