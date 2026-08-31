/**
 * NodeDetailPanel — боковая панель с детальной информацией о ноде
 *
 * Показывает: свойства ноды, все связи (входящие/исходящие),
 * связанные ноды с возможностью перехода.
 */

import type { MetaNode, MetaLink, MetaDiagnosisDetail } from '../types';
import { LAYER_COLORS, LAYER_LABELS, LINK_TYPE_LABELS } from '../utils';

interface NodeDetailPanelProps {
  node: MetaNode;
  allNodes: MetaNode[];
  allLinks: MetaLink[];
  details?: Record<string, MetaDiagnosisDetail>;
  onClose: () => void;
  onNodeClick?: (nodeId: string) => void;
}

export function NodeDetailPanel({ node, allNodes, allLinks, details, onClose, onNodeClick }: NodeDetailPanelProps) {
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

  // Все связи где нода участвует
  const incoming = allLinks.filter((l) => l.target === node.id);
  const outgoing = allLinks.filter((l) => l.source === node.id);

  // Детали диагноза если есть
  const nodeDetail = details?.[node.id];

  return (
    <div className="node-detail-panel">
      <div className="node-detail-header">
        <div className="node-detail-header-left">
          <span className="node-detail-layer-dot" style={{ background: LAYER_COLORS[node.layer] }} />
          <span className="node-detail-layer-label">{LAYER_LABELS[node.layer]}</span>
        </div>
        <button className="node-detail-close" onClick={onClose}>✕</button>
      </div>

      <div className="node-detail-body">
        {/* Название */}
        <h3 className="node-detail-title">{node.label}</h3>

        {/* Тип */}
        <div className="node-detail-type">{node.type}</div>

        {/* Описание ноды (для всех слоёв) */}
        {node.description && (
          <div className="node-detail-description-box">
            <p className="node-detail-node-desc">{node.description}</p>
          </div>
        )}

        {/* Значения для raw-нод */}
        {node.layer === 'raw' && (
          <div className="node-detail-values">
            {node.value !== undefined && (
              <div className="node-detail-value-row">
                <span className="node-detail-value-label">Значение:</span>
                <span className="node-detail-value-num">{node.value}</span>
                {node.unit && <span className="node-detail-value-unit">{node.unit}</span>}
              </div>
            )}
            {node.normal && (
              <div className="node-detail-value-row">
                <span className="node-detail-value-label">Норма:</span>
                <span className="node-detail-value-normal">{node.normal}</span>
              </div>
            )}
            {node.group && (
              <div className="node-detail-value-row">
                <span className="node-detail-value-label">Группа:</span>
                <span className="node-detail-value-tag">{node.group}</span>
              </div>
            )}
          </div>
        )}

        {/* Severity для findings */}
        {node.severity && (
          <div className="node-detail-severity">
            <span className="node-detail-severity-label">Тяжесть:</span>
            <span className={`node-detail-severity-badge severity-${node.severity}`}>
              {node.severity}
            </span>
          </div>
        )}

        {/* Prevalence / PTP для hypotheses */}
        {node.layer === 'hypotheses' && (
          <div className="node-detail-hypo-props">
            {node.prevalence && (
              <div className="node-detail-prop">
                <span className="node-detail-prop-label">Распространённость:</span>
                <span className="node-detail-prop-value">{node.prevalence}</span>
              </div>
            )}
            {node.ptp && (
              <div className="node-detail-prop">
                <span className="node-detail-prop-label">Предтестовая вероятность:</span>
                <span className={`node-detail-ptp ptp-${node.ptp}`}>{node.ptp}</span>
              </div>
            )}
          </div>
        )}

        {/* Grade / Year / N для evidence */}
        {node.layer === 'evidence' && (
          <div className="node-detail-evidence-props">
            {node.grade && (
              <div className="node-detail-prop">
                <span className="node-detail-prop-label">GRADE:</span>
                <span className={`node-detail-grade grade-${node.grade}`}>{node.grade}</span>
              </div>
            )}
            {node.year && (
              <div className="node-detail-prop">
                <span className="node-detail-prop-label">Год:</span>
                <span className="node-detail-prop-value">{node.year}</span>
              </div>
            )}
            {node.n && (
              <div className="node-detail-prop">
                <span className="node-detail-prop-label">n=</span>
                <span className="node-detail-prop-value">{node.n.toLocaleString('ru')}</span>
              </div>
            )}
          </div>
        )}

        {/* Детали диагноза */}
        {nodeDetail && (
          <div className="node-detail-diagnosis">
            <p className="node-detail-description">{nodeDetail.description}</p>

            {nodeDetail.criteria.length > 0 && (
              <div className="node-detail-section">
                <h4>Критерии диагностики</h4>
                <ul>
                  {nodeDetail.criteria.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}

            {nodeDetail.complications.length > 0 && (
              <div className="node-detail-section">
                <h4>Осложнения</h4>
                <div className="node-detail-tags">
                  {nodeDetail.complications.map((c, i) => (
                    <span key={i} className="node-detail-tag tag-danger">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {nodeDetail.treatment.length > 0 && (
              <div className="node-detail-section">
                <h4>Лечение</h4>
                <ul>
                  {nodeDetail.treatment.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}

            {nodeDetail.followup && (
              <div className="node-detail-section">
                <h4>Наблюдение</h4>
                <p>{nodeDetail.followup}</p>
              </div>
            )}
          </div>
        )}

        {/* Связи — входящие */}
        {incoming.length > 0 && (
          <div className="node-detail-links-section">
            <h4>Входящие связи ({incoming.length})</h4>
            <div className="node-detail-links-list">
              {incoming.map((link, i) => {
                const src = nodeMap.get(link.source);
                if (!src) return null;
                return (
                  <button
                    key={`in-${i}`}
                    className="node-detail-link-item"
                    onClick={() => onNodeClick?.(src.id)}
                  >
                    <span className="node-detail-link-dir">←</span>
                    <span className="node-detail-link-label">{src.label}</span>
                    <span className="node-detail-link-type">{LINK_TYPE_LABELS[link.type] || link.type}</span>
                    <span className="node-detail-link-weight">{(link.weight * 100).toFixed(0)}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Связи — исходящие */}
        {outgoing.length > 0 && (
          <div className="node-detail-links-section">
            <h4>Исходящие связи ({outgoing.length})</h4>
            <div className="node-detail-links-list">
              {outgoing.map((link, i) => {
                const tgt = nodeMap.get(link.target);
                if (!tgt) return null;
                return (
                  <button
                    key={`out-${i}`}
                    className="node-detail-link-item"
                    onClick={() => onNodeClick?.(tgt.id)}
                  >
                    <span className="node-detail-link-dir">→</span>
                    <span className="node-detail-link-label">{tgt.label}</span>
                    <span className="node-detail-link-type">{LINK_TYPE_LABELS[link.type] || link.type}</span>
                    <span className="node-detail-link-weight">{(link.weight * 100).toFixed(0)}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
