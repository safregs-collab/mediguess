import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { InteractiveBody } from './InteractiveBody';
import type { SimulationState } from '../types/simulation';

const GENDER_ICON: Record<string, string> = { male: '👨', female: '👩' };
const GENDER_TEXT: Record<string, string> = { male: 'Мужской', female: 'Женский' };

const STAGES: SimulationState['stage'][] = ['patient', 'vitals', 'exam', 'tests', 'diagnosis', 'treatment', 'result'];

export function SimulationBoard() {
  const {
    simulationCase,
    simulationState,
    loadSimulationCase,
    resetSimulationState,
    askSimulationQuestion,
    orderSimulationTest,
    setSimulationDiagnosis,
    setSimulationTreatment,
    checkSimulationResult,
    nextSimulationStage,
    prevSimulationStage,
  } = useGameStore();

  const [testInput, setTestInput] = useState('');
  const [testError, setTestError] = useState('');
  const [visitedRegions, setVisitedRegions] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const s = simulationState;
  const c = simulationCase;

  // При смене текущего этапа автоматически разворачиваем его
  useEffect(() => {
    if (s) {
      setExpanded((prev) => new Set([...prev, s.stage]));
    }
  }, [s?.stage]);

  if (!c || !s) {
    return (
      <section id="simulation" className="section active">
        <div className="game-card">
          <div className="game-header">
            <div className="game-title">🏥 Виртуальная клиника</div>
          </div>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
            Полноценный процесс приёма пациента: от жалоб до лечения
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={loadSimulationCase}>
              🩺 Принять пациента
            </button>
          </div>
        </div>
      </section>
    );
  }

  const stageIdx = STAGES.indexOf(s.stage);
  const isFirst = stageIdx === 0;
  const isLast = stageIdx === STAGES.length - 1;

  const nextLabel = isLast ? '' : stageLabel(STAGES[stageIdx + 1]);
  const prevLabel = isFirst ? '' : stageLabel(STAGES[stageIdx - 1]);

  const elapsedMinutes = stageIdx * 15;
  const totalMinutes = (STAGES.length - 1) * 15;
  const timePercent = Math.min((elapsedMinutes / totalMinutes) * 100, 100);
  const isUrgent = elapsedMinutes > 60;
  const isWarning = elapsedMinutes > 45;

  const toggleStage = (stage: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(stage)) {
        // Не даём свернуть текущий этап (чтобы не было пустоты)
        if (stage !== s.stage) next.delete(stage);
      } else {
        next.add(stage);
      }
      return next;
    });
  };

  const handleOrderTest = () => {
    if (!testInput.trim()) return;
    const lower = testInput.toLowerCase().trim();
    const found = c.availableTests.find(
      (t) =>
        t.name.toLowerCase().includes(lower) ||
        t.synonyms.some((syn) => lower.includes(syn.toLowerCase()))
    );
    if (found) {
      orderSimulationTest(found.id);
      setTestInput('');
      setTestError('');
    } else {
      setTestError('Анализ не найден. Попробуйте уточнить категорию: лаборатория, ЭКГ, визуализация (УЗИ, КТ, МРТ), другие.');
    }
  };

  return (
    <section id="simulation" className="section active">
      <div className="game-card">
        <div className="game-header">
          <div className="game-title">🏥 Кейс #{c.id}</div>
          <span className="sim-stage-badge">{stageLabel(s.stage)}</span>
        </div>

        {/* Временная шкала */}
        <div className="sim-timeline">
          <span className="sim-timeline-icon">⏱️</span>
          <span className="sim-timeline-label">Время приёма:</span>
          <span className="sim-timeline-value">{elapsedMinutes} мин</span>
          <div className="sim-timeline-bar">
            <div
              className={`sim-timeline-fill${isUrgent ? ' urgent' : isWarning ? ' warning' : ''}`}
              style={{ width: `${timePercent}%` }}
            />
          </div>
        </div>

        {/* Прогресс-бар этапов */}
        <div className="sim-stage-progress">
          {STAGES.map((st, i) => (
            <div
              key={st}
              className={`sim-stage-dot${i <= stageIdx ? ' active' : ''}${i === stageIdx ? ' current' : ''}`}
            />
          ))}
        </div>

        {/* === ЭТАП 1: ПРИЁМ + АНАМНЕЗ === */}
        <StagePanel
          stage="patient"
          title="🗣️ Приём и анамнез"
          stageIndex={0}
          currentIndex={stageIdx}
          expanded={expanded}
          onToggle={toggleStage}
        >
          <div className="patient-card">
            <div className="patient-avatar">{GENDER_ICON[c.patient.gender]}</div>
            <div className="patient-info">
              <div className="patient-name">{c.patient.name}</div>
              <div className="patient-meta">
                {c.patient.age} лет · {GENDER_TEXT[c.patient.gender]} · {c.patient.occupation}
              </div>
            </div>
          </div>

          <div className="sim-section">
            <div className="sim-section-title">Главная жалоба</div>
            <div className="sim-section-content">{c.chiefComplaint}</div>
          </div>

          <div className="sim-section">
            <div className="sim-section-title">Анамнез болезни</div>
            <div className="sim-section-content">{c.historyOfPresentIllness}</div>
          </div>

          <div className="sim-section">
            <div className="sim-section-title">Уточняющие вопросы</div>
            <div className="question-grid">
              {c.historyQuestions.map((q) => {
                const asked = s.askedQuestions.includes(q.id);
                return (
                  <button
                    key={q.id}
                    className={`question-chip${asked ? ' asked' : ''}`}
                    onClick={() => {
                      if (!asked) askSimulationQuestion(q.id);
                    }}
                    disabled={asked}
                  >
                    {asked ? '✓ ' : '+ '}{q.question}
                  </button>
                );
              })}
            </div>
            {s.askedQuestions.length > 0 && (
              <div className="answers-list">
                {c.historyQuestions
                  .filter((q) => s.askedQuestions.includes(q.id))
                  .map((q) => (
                    <div key={q.id} className="answer-item">
                      <span className="answer-q">{q.question}</span>
                      <span className="answer-a">{q.answer}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </StagePanel>

        {/* === ЭТАП 2: ВИТАЛЬНЫЕ ПРИЗНАКИ === */}
        <StagePanel
          stage="vitals"
          title="🩺 Витальные признаки"
          stageIndex={1}
          currentIndex={stageIdx}
          expanded={expanded}
          onToggle={toggleStage}
        >
          <div className="vitals-grid">
            <div className="vital-item">
              <span className="vital-label">Температура</span>
              <span className="vital-value">{c.vitals.temperature}°C</span>
            </div>
            <div className="vital-item">
              <span className="vital-label">ЧСС</span>
              <span className="vital-value">{c.vitals.heartRate} уд/мин</span>
            </div>
            <div className="vital-item">
              <span className="vital-label">АД</span>
              <span className="vital-value">{c.vitals.bloodPressure} мм рт.ст.</span>
            </div>
            <div className="vital-item">
              <span className="vital-label">ЧДД</span>
              <span className="vital-value">{c.vitals.respiratoryRate} в мин</span>
            </div>
            <div className="vital-item">
              <span className="vital-label">SpO₂</span>
              <span className="vital-value">{c.vitals.spo2}%</span>
            </div>
            <div className="vital-item">
              <span className="vital-label">ИМТ</span>
              <span className="vital-value">
                {((c.vitals.weight / (c.vitals.height / 100) ** 2)).toFixed(1)} кг/м²
              </span>
            </div>
          </div>
        </StagePanel>

        {/* === ЭТАП 3: ОБЪЕКТИВНЫЙ ОСМОТР === */}
        <StagePanel
          stage="exam"
          title="🔍 Объективный осмотр"
          stageIndex={2}
          currentIndex={stageIdx}
          expanded={expanded}
          onToggle={toggleStage}
        >
          <InteractiveBody
            findings={c.physicalExam}
            onRegionClick={(region) => setVisitedRegions((prev) => new Set(prev).add(region))}
          />
          {c.physicalExam.map((item, idx) => {
            if (!visitedRegions.has(item.region)) return null;
            return (
              <div key={idx} className={`exam-item${item.isAbnormal ? ' abnormal' : ''}`}>
                <span className="exam-region">{regionLabel(item.region)}</span>
                <span className="exam-finding">{item.finding}</span>
                {item.isAbnormal && <span className="exam-tag">Отклонение</span>}
              </div>
            );
          })}
          {visitedRegions.size === 0 && (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic', marginTop: '12px' }}>
              Нажмите на часть тела, чтобы увидеть находки осмотра
            </p>
          )}
        </StagePanel>

        {/* === ЭТАП 4: АНАЛИЗЫ === */}
        <StagePanel
          stage="tests"
          title="🧪 Анализы и исследования"
          stageIndex={3}
          currentIndex={stageIdx}
          expanded={expanded}
          onToggle={toggleStage}
        >
          <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Введите название анализа или исследования. Система распознает его и выдаст результат.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              className="diagnosis-input"
              placeholder="Например: ЭКГ, тропонин, УЗИ..."
              value={testInput}
              onChange={(e) => { setTestInput(e.target.value); setTestError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleOrderTest()}
            />
            <button className="btn-primary" onClick={handleOrderTest}>
              Назначить
            </button>
          </div>
          {testError && <div className="sim-error">{testError}</div>}

          {s.orderedTests.length > 0 && (
            <div className="test-results">
              <div className="sim-section-title" style={{ marginTop: '16px' }}>📋 Результаты</div>
              {s.orderedTests.map((ordered) => {
                const test = c.availableTests.find((t) => t.id === ordered.testId);
                if (!test) return null;
                return (
                  <div key={ordered.testId} className="test-result-card">
                    <div className="test-result-header">
                      <span className="test-name">{test.name}</span>
                      <span className={`test-category cat-${test.category}`}>{categoryLabel(test.category)}</span>
                    </div>
                    <div className="test-result-body">
                      {test.results.map((r, i) => (
                        <div key={i} className={`test-result-row${r.isAbnormal ? ' abnormal' : ''}`}>
                          <span className="test-param">{r.parameter}</span>
                          <span className="test-value">{r.value}</span>
                          <span className="test-range">Норма: {r.normalRange}</span>
                          <span className="test-interp">{r.interpretation}</span>
                        </div>
                      ))}
                    </div>
                    {test.image && (
                      <img src={test.image} alt={test.name} className="test-image" loading="lazy" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </StagePanel>

        {/* === ЭТАП 5: ДИАГНОЗ === */}
        <StagePanel
          stage="diagnosis"
          title="🧠 Дифференциальный диагноз"
          stageIndex={4}
          currentIndex={stageIdx}
          expanded={expanded}
          onToggle={toggleStage}
        >
          <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
            На основе собранных данных введите предполагаемый диагноз:
          </p>
          <input
            type="text"
            className="diagnosis-input"
            placeholder="Введите диагноз..."
            value={s.diagnosis}
            onChange={(e) => setSimulationDiagnosis(e.target.value)}
          />
        </StagePanel>

        {/* === ЭТАП 6: ЛЕЧЕНИЕ === */}
        <StagePanel
          stage="treatment"
          title="💊 Назначение лечения"
          stageIndex={5}
          currentIndex={stageIdx}
          expanded={expanded}
          onToggle={toggleStage}
        >
          <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Опишите план лечения: препараты, дозировки, режим, диета, процедуры.
          </p>
          <textarea
            className="diagnosis-input"
            rows={5}
            placeholder="Например:
• Аторвастатин 40 мг 1 р/день
• Бисопролол 5 мг 1 р/день
• Постельный режим, щадящая диета..."
            value={s.treatmentInput}
            onChange={(e) => setSimulationTreatment(e.target.value)}
          />
          <button
            className="btn-primary"
            style={{ marginTop: '12px', width: '100%' }}
            onClick={() => {
              checkSimulationResult();
              nextSimulationStage();
            }}
          >
            ✅ Завершить приём и оценить
          </button>
        </StagePanel>

        {/* === ЭТАП 7: ИТОГ === */}
        <StagePanel
          stage="result"
          title="📋 Результат приёма"
          stageIndex={6}
          currentIndex={stageIdx}
          expanded={expanded}
          onToggle={toggleStage}
        >
          <div className="score-card">
            <div className="score-value">{s.score.total}<span>/100</span></div>
            <div className="score-label">Оценка приёма</div>
            <div className="score-breakdown">
              <div className={`score-item${s.score.diagnosisCorrect ? ' ok' : ''}`}>
                {s.score.diagnosisCorrect ? '✅' : '❌'} Диагноз
              </div>
              <div className={`score-item${s.score.treatmentCorrect ? ' ok' : ''}`}>
                {s.score.treatmentCorrect ? '✅' : '❌'} Лечение
              </div>
              <div className="score-item">
                {s.score.missedKeyTests > 0 ? `⚠️ Пропущено ключевых анализов: ${s.score.missedKeyTests}` : '✅ Все ключевые анализы назначены'}
              </div>
              {s.score.unnecessaryTests > 0 && (
                <div className="score-item warn">
                  ⚠️ Лишние анализы: {s.score.unnecessaryTests}
                </div>
              )}
            </div>
          </div>

          <div className="sim-section-title" style={{ marginTop: '20px' }}>⭐ Рейтинг «Как врач»</div>
          <div className="rating-grid">
            <div className={`rating-item${s.score.diagnosisCorrect ? ' stars' : ''}`}>
              <div className="rating-stars">{s.score.diagnosisCorrect ? '⭐⭐⭐⭐⭐' : '⭐⭐'}</div>
              <div className="rating-name">Диагност</div>
              <div className="rating-score">{s.score.diagnosisCorrect ? 'Отлично' : 'Требует улучшения'}</div>
            </div>
            <div className={`rating-item${s.score.treatmentCorrect ? ' stars' : ''}`}>
              <div className="rating-stars">{s.score.treatmentCorrect ? '⭐⭐⭐⭐⭐' : '⭐⭐'}</div>
              <div className="rating-name">Терапевт</div>
              <div className="rating-score">{s.score.treatmentCorrect ? 'Отлично' : 'Требует улучшения'}</div>
            </div>
            <div className={`rating-item${s.score.unnecessaryTests === 0 ? ' stars' : ''}`}>
              <div className="rating-stars">{s.score.unnecessaryTests === 0 ? '⭐⭐⭐⭐⭐' : s.score.unnecessaryTests <= 2 ? '⭐⭐⭐' : '⭐⭐'}</div>
              <div className="rating-name">Экономист</div>
              <div className="rating-score">
                {s.score.unnecessaryTests === 0 ? 'Идеально' : s.score.unnecessaryTests <= 2 ? 'Хорошо' : 'Много лишних анализов'}
              </div>
            </div>
            <div className={`rating-item${s.score.missedKeyTests === 0 ? ' stars' : ''}`}>
              <div className="rating-stars">{s.score.missedKeyTests === 0 ? '⭐⭐⭐⭐⭐' : s.score.missedKeyTests <= 1 ? '⭐⭐⭐' : '⭐⭐'}</div>
              <div className="rating-name">Коммуникатор</div>
              <div className="rating-score">
                {s.score.missedKeyTests === 0 ? 'Всё учтено' : s.score.missedKeyTests <= 1 ? 'Почти всё' : 'Много упущено'}
              </div>
            </div>
          </div>

          <div className="sim-section-title" style={{ marginTop: '20px' }}>🧠 Ваш диагноз</div>
          <div className="sim-section-content" style={{ marginBottom: '16px' }}>
            {s.diagnosis || '(не указан)'}
          </div>

          <div className="sim-section-title">✅ Правильный диагноз</div>
          <div className="sim-section-content" style={{ borderLeftColor: 'var(--success)' }}>
            {c.correctDiagnosis.join(' / ')}
          </div>

          <div className="sim-section-title" style={{ marginTop: '16px' }}>💊 Рекомендуемое лечение</div>
          <div className="sim-section-content">
            <strong>Режим:</strong> {c.correctTreatment.regimen === 'bed' ? 'Постельный' : c.correctTreatment.regimen === 'semi-bed' ? 'Палатный' : 'Общий'}<br />
            {c.correctTreatment.diet && <><strong>Диета:</strong> {c.correctTreatment.diet}<br /></>}
            <strong>Препараты:</strong>
            <ul style={{ margin: '8px 0 0 20px' }}>
              {c.correctTreatment.drugs.map((d, i) => (
                <li key={i}>{d.name} {d.dose}, {d.route}, {d.duration}</li>
              ))}
            </ul>
            {c.correctTreatment.procedures && c.correctTreatment.procedures.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <strong>Процедуры:</strong>
                <ul style={{ margin: '4px 0 0 20px' }}>
                  {c.correctTreatment.procedures.map((proc, i) => (
                    <li key={i}>{proc}</li>
                  ))}
                </ul>
              </div>
            )}
            {c.correctTreatment.contraindications && (
              <>
                <strong style={{ color: 'var(--error)' }}>⚠️ Противопоказания:</strong>
                <ul style={{ margin: '4px 0 0 20px', color: 'var(--error)' }}>
                  {c.correctTreatment.contraindications.map((ci, i) => (
                    <li key={i}>{ci}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="sim-section-title" style={{ marginTop: '16px' }}>📖 Обоснование</div>
          <div className="sim-section-content">{c.explanation}</div>

          {c.complications && (
            <>
              <div className="sim-section-title" style={{ marginTop: '16px', color: 'var(--error)' }}>
                ⚠️ Возможные осложнения при неправильном лечении
              </div>
              <div className="sim-section-content" style={{ borderLeftColor: 'var(--error)' }}>
                <ul style={{ margin: '0 0 0 20px' }}>
                  {c.complications.map((comp, i) => (
                    <li key={i}>{comp}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </StagePanel>

        {/* Навигация по этапам */}
        <div className="sim-nav">
          {!isFirst ? (
            <button className="btn-secondary" onClick={prevSimulationStage}>
              ← {prevLabel}
            </button>
          ) : (
            <button className="btn-secondary" onClick={resetSimulationState}>
              ← Завершить приём
            </button>
          )}

          {!isLast && s.stage !== 'treatment' && (
            <button className="btn-primary" onClick={nextSimulationStage}>
              {nextLabel} →
            </button>
          )}

          {isLast && (
            <button className="btn-primary" onClick={resetSimulationState}>
              🔄 Новый пациент
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ======= Компонент панели этапа (аккордеон) ======= */
interface StagePanelProps {
  stage: string;
  title: string;
  stageIndex: number;
  currentIndex: number;
  expanded: Set<string>;
  onToggle: (stage: string) => void;
  children: React.ReactNode;
}

function StagePanel({ stage, title, stageIndex, currentIndex, expanded, onToggle, children }: StagePanelProps) {
  const isPassed = currentIndex >= stageIndex;
  const isCurrent = currentIndex === stageIndex;
  const isExpanded = expanded.has(stage) || isCurrent;

  if (!isPassed) return null;

  return (
    <div className={`sim-stage-panel${isCurrent ? ' current' : ''}`}>
      <button
        type="button"
        className="sim-stage-header"
        onClick={() => onToggle(stage)}
      >
        <div className="sim-stage-header-left">
          <span className="sim-stage-header-icon">{isExpanded ? '▼' : '▶'}</span>
          <span className="sim-stage-header-title">{title}</span>
        </div>
        {isCurrent && <span className="sim-stage-header-badge">текущий</span>}
      </button>
      {isExpanded && (
        <div className="sim-stage-body">
          {children}
        </div>
      )}
    </div>
  );
}

function stageLabel(stage: SimulationState['stage']): string {
  const labels: Record<string, string> = {
    patient: 'Приём',
    vitals: 'Витальные',
    exam: 'Осмотр',
    tests: 'Анализы',
    diagnosis: 'Диагноз',
    treatment: 'Лечение',
    result: 'Итог',
  };
  return labels[stage] || stage;
}

function regionLabel(region: string): string {
  const labels: Record<string, string> = {
    general: 'Общий',
    head: 'Голова',
    chest: 'Грудная клетка',
    abdomen: 'Живот',
    skin: 'Кожа',
    neuro: 'Неврология',
    extremities: 'Конечности',
    back: 'Спина',
  };
  return labels[region] || region;
}

function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    lab: 'Лаборатория',
    imaging: 'Визуализация',
    ecg: 'ЭКГ',
    other: 'Другое',
  };
  return labels[cat] || cat;
}
