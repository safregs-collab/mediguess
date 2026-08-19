import { useState, useEffect } from 'react';
import type { SimulationCase, SimulationCaseStage, SimulationCaseOption, PlayerLevel, EvidenceLevel, RecommendationLevel } from '../../../types/simulation';
import { SIMULATION_CASES, CLINICAL_ALGORITHMS } from '../logic/simulationCases';
import { EvidencePanel } from './EvidencePanel';
import { CRPanel } from './CRPanel';
import { getTopicForCase } from '../services/pubmedService';

const GENDER_ICON: Record<string, string> = { male: '👨', female: '👩' };
const DIFFICULTY_LABELS: Record<string, string> = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный' };
const DIFFICULTY_BADGE: Record<string, string> = { easy: 'badge-green', medium: 'badge-orange', hard: 'badge-red' };

interface StageAnswer {
  stageId: string;
  selectedIds: string[];
  score: number;
  maxScore: number;
}

interface CaseProgress {
  caseId: string;
  attempts: number;
  bestScore: number;
  completed: boolean;
}

function loadProgress(): Record<string, CaseProgress> {
  try {
    const raw = localStorage.getItem('docw_sim_progress');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveProgress(progress: Record<string, CaseProgress>) {
  localStorage.setItem('docw_sim_progress', JSON.stringify(progress));
}

function EvidenceTag({ udd, uur }: { udd?: EvidenceLevel; uur?: RecommendationLevel }) {
  if (!udd && !uur) return null;
  const uddClass = udd ? `evidence-tag evidence-${udd}` : '';
  const uurClass = uur ? `evidence-tag evidence-${uur.toLowerCase()}` : '';
  return (
    <span className="evidence-tag-row">
      {udd && <span className={uddClass}>{udd.toUpperCase()}</span>}
      {uur && <span className={uurClass}>{uur.toUpperCase()}</span>}
    </span>
  );
}

export function SimulationBoard() {
  const [view, setView] = useState<'list' | 'case' | 'algorithm' | 'scales'>('list');
  const [selectedCase, setSelectedCase] = useState<SimulationCase | null>(null);
  const [playerLevel, setPlayerLevel] = useState<PlayerLevel>('student');
  const [currentStage, setCurrentStage] = useState(0);
  const [answers, setAnswers] = useState<StageAnswer[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [stageFeedback, setStageFeedback] = useState<{ score: number; messages: string[]; show: boolean } | null>(null);
  const [finished, setFinished] = useState(false);
  const [progress, setProgress] = useState<Record<string, CaseProgress>>(loadProgress);
  const [showHint, setShowHint] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [showCR, setShowCR] = useState(false);

  const startCase = (c: SimulationCase) => {
    setSelectedCase(c);
    setCurrentStage(0);
    setAnswers([]);
    setSelectedOptions(new Set());
    setStageFeedback(null);
    setFinished(false);
    setShowHint(playerLevel === 'student');
    setView('case');
  };

  const resetToList = () => {
    setView('list');
    setSelectedCase(null);
    setCurrentStage(0);
    setAnswers([]);
    setSelectedOptions(new Set());
    setStageFeedback(null);
    setFinished(false);
  };

  const toggleOption = (optId: string, stageType: string) => {
    if (stageType === 'single') {
      setSelectedOptions(new Set([optId]));
    } else {
      setSelectedOptions(prev => {
        const next = new Set(prev);
        if (next.has(optId)) next.delete(optId);
        else next.add(optId);
        return next;
      });
    }
  };

  const confirmStage = () => {
    if (!selectedCase) return;
    const stage = selectedCase.stages[currentStage];
    const selectedIds = Array.from(selectedOptions);

    const correctIds = stage.options.filter(o => o.correct).map(o => o.id);
    const requiredIds = stage.options.filter(o => o.required).map(o => o.id);
    const penaltyIds = stage.options.filter(o => o.penalty).map(o => o.id);

    let score = 0;
    const messages: string[] = [];

    if (stage.type === 'multiselect') {
      const missedRequired = requiredIds.filter(id => !selectedIds.includes(id));
      if (missedRequired.length === 0) score += 40;
      else messages.push(`❌ Пропущены обязательные: ${missedRequired.length}`);

      const correctSelected = selectedIds.filter(id => correctIds.includes(id));
      score += (correctSelected.length / Math.max(correctIds.length, 1)) * 40;

      const wrongSelected = selectedIds.filter(id => !correctIds.includes(id));
      const penalties = stage.options.filter(o => penaltyIds.includes(o.id) && selectedIds.includes(o.id));
      if (penalties.length > 0) {
        messages.push(`⚠️ Избыточные назначения: ${penalties.map(p => p.text).join(', ')}`);
        score -= penalties.length * 15;
      }
    } else {
      const selectedOpt = stage.options.find(o => o.id === selectedIds[0]);
      if (selectedOpt?.correct) score = 100;
      else {
        const correctOpt = stage.options.find(o => o.correct);
        if (correctOpt) messages.push(`Правильно: ${correctOpt.text}`);
      }
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    const answer: StageAnswer = {
      stageId: stage.id,
      selectedIds,
      score,
      maxScore: 100
    };

    setAnswers(prev => [...prev, answer]);
    setStageFeedback({ score, messages, show: true });
  };

  const nextStage = () => {
    if (!selectedCase) return;
    if (currentStage + 1 >= selectedCase.stages.length) {
      setFinished(true);
      const totalScore = Math.round(answers.reduce((s, a) => s + a.score, 0) / answers.length);
      const newProgress = { ...progress };
      const existing = newProgress[selectedCase.id] || { caseId: selectedCase.id, attempts: 0, bestScore: 0, completed: false };
      existing.attempts += 1;
      if (totalScore > existing.bestScore) existing.bestScore = totalScore;
      if (totalScore >= 70) existing.completed = true;
      newProgress[selectedCase.id] = existing;
      setProgress(newProgress);
      saveProgress(newProgress);
    } else {
      setCurrentStage(prev => prev + 1);
      setSelectedOptions(new Set());
      setStageFeedback(null);
      setShowHint(playerLevel === 'student');
    }
  };

  const totalScore = answers.length > 0
    ? Math.round(answers.reduce((s, a) => s + a.score, 0) / answers.length)
    : 0;

  // === VIEW: CASE LIST ===
  if (view === 'list') {
    return (
      <section id="simulation" className="section active">
        <div className="game-card">
          <div className="game-header">
            <div className="game-title">🏥 Мета-Зона: Клиническое мышление</div>
          </div>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '20px', fontSize: '0.95rem' }}>
            Интерактивные кейсы на основе КР Минздрава РФ. Каждое решение проверяется по доказательной базе.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {(['student', 'resident', 'specialist'] as PlayerLevel[]).map(lvl => (
              <button
                key={lvl}
                className={`level-btn${playerLevel === lvl ? ' active' : ''}`}
                onClick={() => setPlayerLevel(lvl)}
              >
                {lvl === 'student' ? '🟢 Студент' : lvl === 'resident' ? '🟡 Ординатор' : '🔴 Специалист'}
              </button>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {playerLevel === 'student' ? 'Подсказки видны, доступны объяснения УДД/УУР' :
             playerLevel === 'resident' ? 'Подсказки частично скрыты, добавлены коморбидности' :
             'Без подсказок, требуется работа с международными гайдлайнами'}
          </p>

          <div className="cases-grid">
            {SIMULATION_CASES.map(c => {
              const prog = progress[c.id] || { attempts: 0, bestScore: 0, completed: false };
              return (
                <div key={c.id} className="case-card" onClick={() => startCase(c)}>
                  <div className="case-card-header">
                    <span className={`case-badge ${DIFFICULTY_BADGE[c.difficulty]}`}>{DIFFICULTY_LABELS[c.difficulty]}</span>
                    {prog.completed && <span className="case-badge badge-green">✓ Пройден</span>}
                  </div>
                  <h3 className="case-card-title">{c.title}</h3>
                  <p className="case-card-meta">{c.specialty}</p>
                  <p className="case-card-mkb">МКБ-10: {c.mkb}</p>
                  <div className="case-card-footer">
                    <span>Попыток: {prog.attempts}</span>
                    <span>Лучший: {prog.bestScore}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <button className="btn-secondary" onClick={() => setView('algorithm')}>
              🔄 Алгоритмы врача
            </button>
            <button className="btn-secondary" onClick={() => setView('scales')}>
              📏 Шкалы и калькуляторы
            </button>
          </div>
        </div>
      </section>
    );
  }

  // === VIEW: ALGORITHMS ===
  if (view === 'algorithm') {
    return (
      <section id="simulation" className="section active">
        <div className="game-card">
          <div className="game-header">
            <div className="game-title">🔄 Алгоритмы врача</div>
            <button className="btn-secondary" onClick={resetToList}>← Назад</button>
          </div>
          <div className="algo-list">
            {CLINICAL_ALGORITHMS.map(algo => (
              <div key={algo.id} className="algo-card">
                <h3>{algo.title}</h3>
                <p className="algo-cr">{algo.cr}</p>
                <div className="algo-steps">
                  {algo.steps.map((step, i) => (
                    <div key={step.id} className={`algo-step algo-${step.type}`}>
                      <span className="algo-step-num">{i + 1}</span>
                      <span className="algo-step-text">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // === VIEW: SCALES ===
  if (view === 'scales') {
    return <ScalesPanel onBack={resetToList} />;
  }

  // === VIEW: ACTIVE CASE ===
  if (!selectedCase) return null;
  const stage = selectedCase.stages[currentStage];
  const isLastStage = currentStage === selectedCase.stages.length - 1;

  return (
    <section id="simulation" className="section active">
      <div className="game-card">
        {/* Header */}
        <div className="game-header">
          <div>
            <div className="game-title">{selectedCase.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              МКБ-10: {selectedCase.mkb} | 
              <a href={selectedCase.crUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', marginLeft: '4px' }}>
                КР №{selectedCase.crNumber} v.{selectedCase.crVersion} ↗
              </a>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>
              {answers.length > 0 ? Math.round(answers.reduce((s, a) => s + a.score, 0) / answers.length) : 0}%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Текущий балл
            </div>
          </div>
        </div>

        {/* Toggle buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            onClick={() => setShowCR(v => !v)}
          >
            {showCR ? '📋 Скрыть КР' : '📋 Показать КР Минздрава'}
          </button>
          <button
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            onClick={() => setShowEvidence(v => !v)}
          >
            {showEvidence ? '📚 Скрыть PubMed' : '📚 Показать PubMed'}
          </button>
        </div>

        {/* CR Panel */}
        <CRPanel
          crNumber={selectedCase.crNumber}
          visible={showCR}
        />

        {/* PubMed Evidence Panel */}
        <EvidencePanel
          topic={getTopicForCase(selectedCase.id)}
          visible={showEvidence}
        />

        {/* Progress */}
        <div className="sim-stage-progress" style={{ marginBottom: '16px' }}>
          {selectedCase.stages.map((s, i) => (
            <div
              key={s.id}
              className={`sim-stage-dot${i < currentStage ? ' active' : ''}${i === currentStage ? ' current' : ''}`}
              title={s.title}
            />
          ))}
        </div>

        {/* Patient Card */}
        <div className="patient-card" style={{ marginBottom: '16px' }}>
          <div className="patient-avatar">{GENDER_ICON[selectedCase.patient.gender]}</div>
          <div className="patient-info">
            <div className="patient-name">{selectedCase.patient.name}, {selectedCase.patient.age} лет</div>
            <div className="patient-meta">{selectedCase.patient.occupation}</div>
          </div>
        </div>

        {/* Vitals */}
        <div className="vitals-grid" style={{ marginBottom: '16px' }}>
          {Object.entries(selectedCase.patient.vitals).map(([key, v]) => {
            const labels: Record<string, string> = {
              ad: 'АД', hr: 'ЧСС', rr: 'ЧДД', temp: 'Темп.',
              height: 'Рост', weight: 'Вес', bmi: 'ИМТ', waist: 'ОТ',
              glucose: 'Глюкоза', hba1c: 'HbA1c', spo2: 'SpO₂'
            };
            return (
              <div key={key} className={`vital-item${v.alert ? ' alert' : ''}`}>
                <span className="vital-label">{labels[key] || key}</span>
                <span className="vital-value">{v.value} <small>{v.unit}</small></span>
              </div>
            );
          })}
        </div>

        {/* Physical Exam */}
        {selectedCase.patient.physicalExam && (
          <div className="sim-section" style={{ marginBottom: '16px' }}>
            <div className="sim-section-title">Объективный осмотр</div>
            <div className="sim-section-content" style={{ fontSize: '0.9rem' }}>
              <p><strong>Общее:</strong> {selectedCase.patient.physicalExam.general}</p>
              <p><strong>Сердце:</strong> {selectedCase.patient.physicalExam.heart}</p>
              <p><strong>Лёгкие:</strong> {selectedCase.patient.physicalExam.lungs}</p>
            </div>
          </div>
        )}

        {/* Stage */}
        {!finished ? (
          <div className="sim-stage-panel current">
            <div className="sim-stage-header" style={{ cursor: 'default' }}>
              <div className="sim-stage-header-left">
                <span className="sim-stage-header-title">{currentStage + 1}. {stage.title}</span>
              </div>
              <span className="sim-stage-header-badge">Текущий этап</span>
            </div>
            <div className="sim-stage-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{stage.description}</p>

              {/* Hint */}
              {showHint && stage.hint && playerLevel !== 'specialist' && (
                <div className="evidence-bar" style={{ marginBottom: '16px' }}>
                  <strong>💡 Подсказка:</strong> {stage.hint}
                </div>
              )}

              {/* Options */}
              <div className="option-list">
                {stage.options.map(opt => {
                  const isSelected = selectedOptions.has(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className={`option-item${isSelected ? ' selected' : ''}`}
                      onClick={() => toggleOption(opt.id, stage.type)}
                    >
                      <input
                        type={stage.type === 'multiselect' ? 'checkbox' : 'radio'}
                        checked={isSelected}
                        onChange={() => toggleOption(opt.id, stage.type)}
                        style={{ marginRight: '10px' }}
                      />
                      <span style={{ flex: 1 }}>{opt.text}</span>
                      {opt.evidence?.udd && (
                        <span className={`evidence-tag evidence-${opt.evidence.udd}`}>{opt.evidence.udd.toUpperCase()}</span>
                      )}
                      {opt.evidence?.uur && (
                        <span className={`evidence-tag evidence-${opt.evidence.uur.toLowerCase()}`}>{opt.evidence.uur.toUpperCase()}</span>
                      )}
                    </label>
                  );
                })}
              </div>

              {/* Evidence for stage */}
              {stage.evidence && playerLevel !== 'specialist' && (
                <div className="evidence-bar" style={{ marginTop: '12px' }}>
                  <strong>📖 {stage.evidence.cr || 'КР Минздрава РФ'}</strong>
                  <EvidenceTag udd={stage.evidence.udd} uur={stage.evidence.uur} />
                </div>
              )}

              {/* Confirm button */}
              {!stageFeedback?.show && (
                <button
                  className="btn-primary"
                  style={{ marginTop: '16px', width: '100%' }}
                  onClick={confirmStage}
                  disabled={selectedOptions.size === 0}
                >
                  Подтвердить выбор →
                </button>
              )}

              {/* Feedback */}
              {stageFeedback?.show && (
                <div className={`evidence-bar ${stageFeedback.score >= 70 ? 'success' : stageFeedback.score >= 40 ? 'warning' : 'danger'}`} style={{ marginTop: '16px' }}>
                  <strong>
                    {stageFeedback.score >= 70 ? '✅ Хороший результат' :
                     stageFeedback.score >= 40 ? '⚠️ Есть ошибки' : '❌ Требуется доработка'}
                  </strong>
                  <p style={{ marginTop: '6px' }}>Балл этапа: {stageFeedback.score}/100</p>
                  {stageFeedback.messages.length > 0 && (
                    <p style={{ marginTop: '6px' }}>{stageFeedback.messages.join('<br>')}</p>
                  )}
                  {stage.options.find(o => o.id === Array.from(selectedOptions)[0])?.explanation && (
                    <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                      {stage.options.find(o => o.id === Array.from(selectedOptions)[0])?.explanation}
                    </p>
                  )}
                  {stage.options.find(o => o.correct)?.explanation && !stage.options.find(o => o.id === Array.from(selectedOptions)[0])?.correct && (
                    <p style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--success)' }}>
                      <strong>Правильный ответ:</strong> {stage.options.find(o => o.correct)?.explanation}
                    </p>
                  )}
                  <button
                    className="btn-primary"
                    style={{ marginTop: '12px', width: '100%' }}
                    onClick={nextStage}
                  >
                    {isLastStage ? 'Завершить кейс →' : 'Следующий этап →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* RESULTS */
          <div className="sim-stage-panel current">
            <div className="sim-stage-header" style={{ cursor: 'default' }}>
              <span className="sim-stage-header-title">📋 Результат кейса</span>
            </div>
            <div className="sim-stage-body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
                {totalScore >= 70 ? '🎉' : totalScore >= 40 ? '📝' : '📚'}
              </div>
              <h2 style={{ marginBottom: '8px' }}>
                {totalScore >= selectedCase.results.excellent.minScore ? selectedCase.results.excellent.title :
                 totalScore >= selectedCase.results.good.minScore ? selectedCase.results.good.title :
                 selectedCase.results.needsWork.title}
              </h2>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', margin: '12px 0' }}>
                {totalScore}%
              </div>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 20px' }}>
                {totalScore >= selectedCase.results.excellent.minScore ? selectedCase.results.excellent.text :
                 totalScore >= selectedCase.results.good.minScore ? selectedCase.results.good.text :
                 selectedCase.results.needsWork.text}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={() => startCase(selectedCase)}>
                  🔄 Пройти снова
                </button>
                <button className="btn-secondary" onClick={resetToList}>
                  ← К списку кейсов
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ======= SCALES PANEL ======= */
function ScalesPanel({ onBack }: { onBack: () => void }) {
  const [bmiHeight, setBmiHeight] = useState('');
  const [bmiWeight, setBmiWeight] = useState('');
  const [gfrCr, setGfrCr] = useState('');
  const [gfrAge, setGfrAge] = useState('');
  const [gfrGender, setGfrGender] = useState('male');

  const bmi = bmiHeight && bmiWeight
    ? (parseFloat(bmiWeight) / ((parseFloat(bmiHeight) / 100) ** 2)).toFixed(1)
    : null;

  const gfr = gfrCr && gfrAge
    ? Math.round(
        gfrGender === 'female'
          ? 142 * Math.min(parseFloat(gfrCr) / 88.4 / 0.7, 1) ** -0.241 * Math.max(parseFloat(gfrCr) / 88.4 / 0.7, 1) ** -1.2 * 0.9938 ** parseFloat(gfrAge) * 1.012
          : 142 * Math.min(parseFloat(gfrCr) / 88.4 / 0.9, 1) ** -0.302 * Math.max(parseFloat(gfrCr) / 88.4 / 0.9, 1) ** -1.2 * 0.9938 ** parseFloat(gfrAge)
      )
    : null;

  return (
    <section id="simulation" className="section active">
      <div className="game-card">
        <div className="game-header">
          <div className="game-title">📏 Шкалы и калькуляторы</div>
          <button className="btn-secondary" onClick={onBack}>← Назад</button>
        </div>

        <div className="scale-card">
          <h3>⚖️ Индекс массы тела (ИМТ)</h3>
          <p className="scale-cr">КР №62 v.3, КР №102 v.2 — оценка факторов риска</p>
          <div className="scale-inputs">
            <div className="scale-field">
              <label>Рост (см)</label>
              <input type="number" value={bmiHeight} onChange={e => setBmiHeight(e.target.value)} placeholder="175" />
            </div>
            <div className="scale-field">
              <label>Вес (кг)</label>
              <input type="number" value={bmiWeight} onChange={e => setBmiWeight(e.target.value)} placeholder="70" />
            </div>
          </div>
          {bmi && (
            <div className="scale-result">
              <div className="scale-value">{bmi}</div>
              <div className="scale-unit">кг/м²</div>
              <div className="scale-interpretation">
                {parseFloat(bmi) < 18.5 ? 'Дефицит массы тела' :
                 parseFloat(bmi) < 25 ? 'Нормальная масса тела' :
                 parseFloat(bmi) < 30 ? 'Избыточная масса тела' :
                 parseFloat(bmi) < 35 ? 'Ожирение I степени' :
                 parseFloat(bmi) < 40 ? 'Ожирение II степени' : 'Ожирение III степени'}
              </div>
            </div>
          )}
        </div>

        <div className="scale-card">
          <h3>🫘 СКФ (CKD-EPI 2021)</h3>
          <p className="scale-cr">КР №62 v.3, КР №102 v.2 — оценка функции почек</p>
          <div className="scale-inputs">
            <div className="scale-field">
              <label>Креатинин (мкмоль/л)</label>
              <input type="number" value={gfrCr} onChange={e => setGfrCr(e.target.value)} placeholder="80" />
            </div>
            <div className="scale-field">
              <label>Возраст (лет)</label>
              <input type="number" value={gfrAge} onChange={e => setGfrAge(e.target.value)} placeholder="50" />
            </div>
            <div className="scale-field">
              <label>Пол</label>
              <select value={gfrGender} onChange={e => setGfrGender(e.target.value)}>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>
          </div>
          {gfr && (
            <div className="scale-result">
              <div className="scale-value">{gfr}</div>
              <div className="scale-unit">мл/мин/1.73м²</div>
              <div className="scale-interpretation">
                {gfr >= 90 ? 'Норма (G1)' :
                 gfr >= 60 ? 'Незначительное снижение (G2)' :
                 gfr >= 45 ? 'Умеренное снижение (G3a)' :
                 gfr >= 30 ? 'Выраженное снижение (G3b)' :
                 gfr >= 15 ? 'Тяжёлое снижение (G4)' : 'Терминальная стадия (G5)'}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
