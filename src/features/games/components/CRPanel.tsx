import { useState } from 'react';
import { getCRByNumber, type CRDocument, type CRRecommendation, type CRTable } from '../services/crService';

interface CRPanelProps {
  crNumber: string;
  visible: boolean;
  highlightRecId?: string;
}

function RecommendationCard({ rec }: { rec: CRRecommendation }) {
  const uddClass = `evidence-tag evidence-${rec.udd}`;
  const uurClass = `evidence-tag evidence-${rec.uur.toLowerCase()}`;
  return (
    <div className="cr-recommendation">
      <div className="cr-recommendation-text">{rec.text}</div>
      <div className="cr-recommendation-meta">
        <span className={uddClass}>{rec.udd.toUpperCase()}</span>
        <span className={uurClass}>{rec.uur.toUpperCase()}</span>
        {rec.source && <span className="cr-recommendation-source">📖 {rec.source}</span>}
      </div>
    </div>
  );
}

function TableCard({ table }: { table: CRTable }) {
  return (
    <div className="cr-table-container">
      <div className="cr-table-title">{table.title}</div>
      <table className="cr-table">
        <thead>
          <tr>
            {table.headers.map((h, i) => <th key={i}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CRPanel({ crNumber, visible, highlightRecId }: CRPanelProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const cr = getCRByNumber(crNumber);

  if (!visible || !cr) return null;

  return (
    <div className="cr-panel-container">
      <div className="cr-panel-header">
        <div>
          <div className="cr-panel-title">📋 Клиническая рекомендация</div>
          <div className="cr-panel-subtitle">
            КР №{cr.number} v.{cr.version} | {cr.title}
          </div>
        </div>
        <a
          href={cr.url}
          target="_blank"
          rel="noopener noreferrer"
          className="cr-panel-link"
        >
          Открыть на cr.minzdrav.gov.ru ↗
        </a>
      </div>

      <div className="cr-panel-content">
        {cr.sections.map(section => (
          <div key={section.id} className="cr-section">
            <button
              className={`cr-section-header${activeSection === section.id ? ' active' : ''}`}
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
            >
              <span>{section.title}</span>
              <span className="cr-section-toggle">{activeSection === section.id ? '−' : '+'}</span>
            </button>

            {activeSection === section.id && (
              <div className="cr-section-body">
                {section.content && (
                  <p className="cr-section-content">{section.content}</p>
                )}

                {section.tables?.map(table => (
                  <TableCard key={table.id} table={table} />
                ))}

                {section.recommendations?.map(rec => (
                  <RecommendationCard
                    key={rec.id}
                    rec={rec}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="cr-panel-footer">
        <span>МКБ-10: {cr.mkb}</span>
        <span>Специальность: {cr.specialty}</span>
      </div>
    </div>
  );
}
