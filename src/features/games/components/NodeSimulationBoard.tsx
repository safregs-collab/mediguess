import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { NodeScenario, NodeSimState, NodeSimResult, ScoreCategory, SimHistoryEntry, NodeOption } from '../../../types/nodeSimulation';
import {
  initScenario, selectOption, autoSelectWorstOption,
  calculateFinalScore, checkInventory, filterScenariosByRole
} from '../logic/nodeSimulationEngine';
import { ALL_NODE_SCENARIOS } from '../logic/nodeSimulationCases';

const CATEGORY_LABELS: Record<ScoreCategory, string> = {
  diagnosis: 'Диагностика',
  treatment: 'Лечение',
  docs: 'Документация',
  comm: 'Коммуникация',
};

const RESULT_TEXT: Record<string, { title: string; desc: string }> = {
  good: { title: 'Отличный результат!', desc: 'Вы действовали по протоколу. Пациент спасен.' },
  medium: { title: 'Хороший результат', desc: 'Есть недочеты, но критических ошибок не допущено.' },
  poor: { title: 'Плохой результат', desc: 'Допущены серьезные ошибки. Пациент в опасности.' },
  critical_good: { title: 'Критическая ситуация — спасение!', desc: 'Вы спасли пациента в критической ситуации!' },
  critical_poor: { title: 'Критическая ситуация — провал', desc: 'Пациент спасен, но документация не ведена.' },
  death: { title: 'ТРАГИЧЕСКИЙ ИСХОД', desc: 'Пациент умер. Ваши действия привели к летальному исходу.' },
};

const CONSCIOUSNESS_COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#15803d'];

export default function NodeSimulationBoard() {
  const [phase, setPhase] = useState<'select' | 'playing' | 'result'>('select');
  const [roleFilter, setRoleFilter] = useState<'nurse' | 'doctor' | 'both'>('both');
  const [selectedScenario, setSelectedScenario] = useState<NodeScenario | null>(null);
  const [simState, setSimState] = useState<NodeSimState | null>(null);
  const [result, setResult] = useState<NodeSimResult | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [timer, setTimer] = useState(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scenarios = filterScenariosByRole(ALL_NODE_SCENARIOS, roleFilter);

  // Таймер
  useEffect(() => {
    if (phase === 'playing' && simState && !simState.gameOver) {
      const node = simState.scenario!.nodes[simState.currentNode];
      if (node.timeLimit && node.timeLimit > 0) {
        setTimer(node.timeLimit);
        timerRef.current = setInterval(() => {
          setTimer(prev => {
            if (prev <= 1) {
              // Автовыбор худшего варианта
              handleAutoSelect();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, simState?.currentNode]);

  const handleAutoSelect = useCallback(() => {
    if (!simState || simState.gameOver) return;
    const worstIdx = autoSelectWorstOption(simState);
    handleOptionSelect(worstIdx);
  }, [simState]);

  const startScenario = (scenario: NodeScenario) => {
    const state = initScenario(scenario);
    setSelectedScenario(scenario);
    setSimState(state);
    setSelectedItems([]);
    setFeedback('');
    setShowFeedback(false);
    setShowHint(false);
    setPhase('playing');
  };

  const handleItemToggle = (item: string) => {
    setSelectedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (!simState || simState.gameOver) return;
    const node = simState.scenario!.nodes[simState.currentNode];
    const option = node.options[optionIndex];

    // Проверка инвентаря
    if (!checkInventory({ ...simState, selectedItems }, option)) {
      setFeedback('⚠️ Недостаточно предметов! Выберите нужные из инвентаря.');
      setShowFeedback(true);
      return;
    }

    const newState = selectOption(simState, optionIndex);
    setSimState(newState);
    setFeedback(option.feedback);
    setShowFeedback(true);

    if (newState.gameOver) {
      const res = calculateFinalScore(newState);
      setResult(res);
      setTimeout(() => setPhase('result'), 2000);
    }
  };

  const getVitalColor = (value: number, type: string): string => {
    switch (type) {
      case 'bp_sys': return value < 90 ? '#dc2626' : value > 160 ? '#ea580c' : '#16a34a';
      case 'spo2': return value < 90 ? '#dc2626' : value < 95 ? '#ca8a04' : '#16a34a';
      case 'pulse': return value > 120 ? '#dc2626' : value > 100 ? '#ca8a04' : '#16a34a';
      case 'temp': return value > 38.5 ? '#dc2626' : value > 37.5 ? '#ca8a04' : '#16a34a';
      default: return '#16a34a';
    }
  };

  // ========== ЭКРАН ВЫБОРА СЦЕНАРИЯ ==========
  if (phase === 'select') {
    return (
      <div className="sim-board">
        <div className="sim-header">
          <h2>🩺 Экстренные клинические сценарии</h2>
          <p className="sim-subtitle">Ветвящиеся симуляции с динамическими витальными показателями</p>
        </div>

        <div className="role-filter">
          <button className={roleFilter === 'both' ? 'active' : ''} onClick={() => setRoleFilter('both')}>Все</button>
          <button className={roleFilter === 'nurse' ? 'active' : ''} onClick={() => setRoleFilter('nurse')}>Медсестра</button>
          <button className={roleFilter === 'doctor' ? 'active' : ''} onClick={() => setRoleFilter('doctor')}>Врач</button>
        </div>

        <div className="scenario-grid">
          {scenarios.map(sc => (
            <div key={sc.id} className={`scenario-card ${sc.difficulty}`} onClick={() => startScenario(sc)}>
              <div className="scenario-role">{sc.role === 'nurse' ? '👩‍⚕️ Медсестра' : '👨‍⚕️ Врач'}</div>
              <h3>{sc.title}</h3>
              <p className="scenario-desc">{sc.description}</p>
              <div className="scenario-tags">
                {sc.tags.map((t: string) => <span key={t} className="tag">{t}</span>)}
              </div>
              <div className="scenario-difficulty">
                Сложность: {sc.difficulty === 'easy' ? 'Легкая' : sc.difficulty === 'medium' ? 'Средняя' : 'Сложная'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ========== ЭКРАН ИГРЫ ==========
  if (phase === 'playing' && simState) {
    const scenario = simState.scenario!;
    const node = scenario.nodes[simState.currentNode];
    const patient = simState.patient;

    return (
      <div className="sim-board node-sim-layout">
        {/* Панель пациента */}
        <div className="patient-panel">
          <div className="patient-header">
            <span className="patient-avatar">{patient.avatar}</span>
            <div>
              <h3>{patient.name}</h3>
              <p>{patient.age} • {patient.skin}</p>
            </div>
            <div className={`patient-status ${patient.status}`}>
              {patient.status === 'stable' ? 'Стабильно' : patient.status === 'warning' ? 'Внимание' : 'Критично'}
            </div>
          </div>

          <div className="vitals-grid">
            <div className="vital-item" style={{ borderColor: getVitalColor(patient.vitals.bp_sys, 'bp_sys') }}>
              <span className="vital-label">АД</span>
              <span className="vital-value" style={{ color: getVitalColor(patient.vitals.bp_sys, 'bp_sys') }}>
                {patient.vitals.bp_sys}/{patient.vitals.bp_dia}
              </span>
            </div>
            <div className="vital-item" style={{ borderColor: getVitalColor(patient.vitals.pulse, 'pulse') }}>
              <span className="vital-label">Пульс</span>
              <span className="vital-value" style={{ color: getVitalColor(patient.vitals.pulse, 'pulse') }}>
                {patient.vitals.pulse}
              </span>
            </div>
            <div className="vital-item" style={{ borderColor: getVitalColor(patient.vitals.spo2, 'spo2') }}>
              <span className="vital-label">SpO₂</span>
              <span className="vital-value" style={{ color: getVitalColor(patient.vitals.spo2, 'spo2') }}>
                {patient.vitals.spo2}%
              </span>
            </div>
            <div className="vital-item" style={{ borderColor: getVitalColor(patient.vitals.rr, 'rr') }}>
              <span className="vital-label">ЧДД</span>
              <span className="vital-value">{patient.vitals.rr}</span>
            </div>
            <div className="vital-item" style={{ borderColor: getVitalColor(patient.vitals.temp, 'temp') }}>
              <span className="vital-label">Темп</span>
              <span className="vital-value" style={{ color: getVitalColor(patient.vitals.temp, 'temp') }}>
                {patient.vitals.temp.toFixed(1)}°C
              </span>
            </div>
            <div className="vital-item">
              <span className="vital-label">Боль</span>
              <span className="vital-value">{patient.vitals.pain}/10</span>
            </div>
          </div>

          <div className="consciousness-bar">
            <span>Сознание:</span>
            <div className="consciousness-levels">
              {['Кома', 'Сопор', 'Спутанное', 'Заторможенное', 'Ясное'].map((label, i) => (
                <span key={label} className={i <= patient.consciousness ? 'active' : ''} style={{ background: i <= patient.consciousness ? CONSCIOUSNESS_COLORS[i] : '#e5e7eb' }}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Таймер */}
        {node.timeLimit && node.timeLimit > 0 && (
          <div className={`time-bar ${timer < 10 ? 'critical' : timer < 20 ? 'warning' : ''}`}>
            <div className="time-fill" style={{ width: `${(timer / node.timeLimit) * 100}%` }} />
            <span>⏱️ {timer} сек</span>
          </div>
        )}

        {/* Инвентарь */}
        <div className="inventory-panel">
          <h4>🎒 Инвентарь (выберите нужное):</h4>
          <div className="inventory-grid">
            {simState.inventory.map((item: string) => (
              <button
                key={item}
                className={`inventory-item ${selectedItems.includes(item) ? 'selected' : ''}`}
                onClick={() => handleItemToggle(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Ситуация */}
        <div className="scenario-area">
          <h3>{node.title}</h3>
          <p className="scenario-text">{node.text}</p>

          {node.hint && (
            <button className="hint-btn" onClick={() => setShowHint(!showHint)}>
              💡 {showHint ? 'Скрыть подсказку' : 'Показать подсказку'} (-0.5 балла)
            </button>
          )}
          {showHint && node.hint && <div className="hint-text">{node.hint}</div>}

          {/* Варианты ответа */}
          <div className="options-list">
            {node.options.map((opt: NodeOption, idx: number) => (
              <button
                key={idx}
                className="option-btn"
                onClick={() => handleOptionSelect(idx)}
                disabled={showFeedback}
              >
                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="option-text">{opt.text}</span>
                {opt.requires && opt.requires.length > 0 && (
                  <span className="option-requires">Требуется: {opt.requires.join(', ')}</span>
                )}
              </button>
            ))}
          </div>

          {/* Фидбек */}
          {showFeedback && (
            <div className={`feedback-box ${feedback.startsWith('✅') ? 'correct' : feedback.startsWith('⚠️') ? 'partial' : 'wrong'}`}>
              <p>{feedback}</p>
              {!simState.gameOver && (
                <button className="continue-btn" onClick={() => { setShowFeedback(false); setShowHint(false); }}>
                  Продолжить →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Журнал */}
        <div className="event-log">
          <h4>📋 Журнал событий</h4>
          {simState.history.length === 0 ? (
            <p className="log-empty">Нет записей</p>
          ) : (
            simState.history.map((entry: SimHistoryEntry, i: number) => (
              <div key={i} className={`log-entry ${entry.correct ? 'correct' : 'wrong'}`}>
                <span className="log-time">{i + 1}.</span>
                <span className="log-text">{entry.chosenText}</span>
                <span className={`log-badge ${entry.correct ? 'correct' : 'wrong'}`}>
                  {entry.correct ? '✓' : '✗'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ========== ЭКРАН РЕЗУЛЬТАТОВ ==========
  if (phase === 'result' && result) {
    const resInfo = RESULT_TEXT[result.resultType] || RESULT_TEXT.poor;

    return (
      <div className="sim-board result-screen">
        <div className="result-header">
          <h2>{resInfo.title}</h2>
          <p>{resInfo.desc}</p>
        </div>

        <div className="score-circle" style={{ '--score-percent': `${result.percent}%` } as React.CSSProperties}>
          <div className="score-inner">
            <span className="score-value">{result.percent}%</span>
            <span className="score-label">{result.totalScore}/{result.maxTotalScore}</span>
          </div>
        </div>

        <div className="category-scores">
          {(Object.keys(result.categoryScores) as ScoreCategory[]).map(cat => {
            const c = result.categoryScores[cat];
            return (
              <div key={cat} className="category-item">
                <span className="category-name">{CATEGORY_LABELS[cat]}</span>
                <div className="category-bar">
                  <div className="category-fill" style={{ width: `${c.percent}%` }} />
                </div>
                <span className="category-value">{c.value}/{c.max}</span>
              </div>
            );
          })}
        </div>

        <div className="history-review">
          <h3>📋 Разбор действий</h3>
          {result.history.map((entry: SimHistoryEntry, i: number) => (
            <div key={i} className={`review-entry ${entry.correct ? 'correct' : 'wrong'}`}>
              <h4>{entry.nodeTitle}</h4>
              <p><strong>Ваш выбор:</strong> {entry.chosenText}</p>
              <p className="review-feedback">{entry.feedback}</p>
              <div className="review-score">
                {(Object.keys(entry.score) as ScoreCategory[]).map(cat => (
                  <span key={cat} className={entry.score[cat]! > 0 ? 'positive' : 'negative'}>
                    {CATEGORY_LABELS[cat]}: {entry.score[cat]! > 0 ? '+' : ''}{entry.score[cat]}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="result-actions">
          <button className="sim-btn" onClick={() => { setPhase('select'); setResult(null); setSimState(null); }}>
            🔄 Выбрать другой сценарий
          </button>
          {selectedScenario && (
            <button className="sim-btn secondary" onClick={() => startScenario(selectedScenario)}>
              🔁 Повторить этот сценарий
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
