import { useState } from 'react';
import type { SimulationCase, SimulationState } from '../../../types/simulation';

const GENDER_ICON: Record<string, string> = { male: '👨', female: '👩' };
const GENDER_TEXT: Record<string, string> = { male: 'Мужской', female: 'Женский' };

interface Props {
  c: SimulationCase;
  s: SimulationState;
  askQuestion?: (id: string) => void;
  compact?: boolean;
}

export function PatientSummary({ c, s, askQuestion, compact = false }: Props) {
  const [expanded, setExpanded] = useState(!compact);

  const askedCount = s.askedQuestions.length;
  const totalQuestions = c.historyQuestions.length;
  const hasSignificant = c.historyQuestions.some(
    (q) => q.isClinicallySignificant && s.askedQuestions.includes(q.id)
  );

  if (compact) {
    return (
      <div className="patient-summary-compact">
        <button
          className="patient-summary-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          <span>📋 Данные приёма</span>
          <span className="patient-summary-meta">
            {c.patient.name.split(' ')[0]} · {c.patient.age} лет · {askedCount}/{totalQuestions} вопросов
            {hasSignificant && <span className="patient-summary-badge">!</span>}
          </span>
          <span className={`patient-summary-arrow${expanded ? ' up' : ''}`}>▼</span>
        </button>

        {expanded && (
          <div className="patient-summary-body">
            <div className="patient-summary-section">
              <div className="patient-summary-label">🗣️ Жалоба</div>
              <div className="patient-summary-value">{c.chiefComplaint}</div>
            </div>
            <div className="patient-summary-section">
              <div className="patient-summary-label">📖 Анамнез</div>
              <div className="patient-summary-value">{c.historyOfPresentIllness}</div>
            </div>
            {s.askedQuestions.length > 0 && (
              <div className="patient-summary-section">
                <div className="patient-summary-label">✓ Заданные вопросы</div>
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
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
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
        <div className="sim-section-title">🗣️ Главная жалоба</div>
        <div className="sim-section-content">{c.chiefComplaint}</div>
      </div>

      <div className="sim-section">
        <div className="sim-section-title">📖 Анамнез болезни</div>
        <div className="sim-section-content">{c.historyOfPresentIllness}</div>
      </div>

      {askQuestion && (
        <div className="sim-section">
          <div className="sim-section-title">❓ Уточняющие вопросы</div>
          <div className="question-grid">
            {c.historyQuestions.map((q) => {
              const asked = s.askedQuestions.includes(q.id);
              return (
                <button
                  key={q.id}
                  className={`question-chip${asked ? ' asked' : ''}`}
                  onClick={() => {
                    if (!asked) askQuestion(q.id);
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
      )}
    </div>
  );
}
