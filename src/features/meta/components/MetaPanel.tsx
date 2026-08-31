/**
 * MetaPanel — панель глубокого разбора диагноза
 *
 * Показывается после завершения кейса (победа или поражение).
 * Отображает: гипотезу, детали, задействованные ноды, сравнение, доказательства, timeline.
 */

import { useState, Suspense, lazy } from 'react';
import type { MetaResolvedData, MetaNode, MetaLayer } from '../types';
import { resolveGraphId } from '../metaIdMap';
import { LAYER_LABELS } from '../data/layer-config';
import { EvidenceBadge } from './EvidenceBadge';
import { DiffTable } from './DiffTable';
import { MiniGraph } from './MiniGraph';
import { ZoomableGraphOverlay } from './ZoomableGraphOverlay';
import { UnifiedGraphOverlay } from './UnifiedGraphOverlay';
import { MetaSkeleton } from './MetaSkeleton';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useI18n } from '../i18n';
import styles from '../meta.module.css';

import { ThreeGraph } from './ThreeGraph';
const AIDescriptionPanel = lazy(() => import('./AIDescriptionPanel').then(m => ({ default: m.AIDescriptionPanel })));

interface MetaPanelProps {
  data: MetaResolvedData | null;
  loading?: boolean;
  onOpenExternal?: () => void;
  onSelectNosology?: (id: string) => void;
}

export function MetaPanel({ data, loading, onOpenExternal, onSelectNosology }: MetaPanelProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useLocalStorage<'overview' | 'graph' | 'evidence' | 'comparison' | 'timeline' | 'ai' | '3d'>('docw-meta-tab', 'overview');
  const [graphExpanded, setGraphExpanded] = useState(false);
  const [unifiedOpen, setUnifiedOpen] = useState(false);

  if (loading) {
    return <MetaSkeleton />;
  }

  if (!data) {
    return (
      <div className={`${styles['meta-panel']} ${styles['meta-panel--empty']}`}>
        <div className={styles['meta-empty-icon']}>📚</div>
        <p>{t('meta.noData')}</p>
      </div>
    );
  }

  const { hypothesis, hypothesisDetail, involvedNodes, involvedLinks, comparison, evidenceList, timeline } = data;
  const layerStyle = LAYER_LABELS[hypothesis.layer];

  const tabs = [
    { id: 'overview' as const, label: t('meta.overview'), icon: '📋' },
    { id: 'graph' as const, label: t('meta.graph'), icon: '🕸️' },
    { id: '3d' as const, label: '3D', icon: '🧊' },
    { id: 'evidence' as const, label: t('meta.evidence'), icon: '📖', count: evidenceList.length },
    ...(comparison ? [{ id: 'comparison' as const, label: t('meta.comparison'), icon: '⚖️' }] : []),
    ...(timeline && timeline.length > 0 ? [{ id: 'timeline' as const, label: 'Timeline', icon: '📈' }] : []),
    { id: 'ai' as const, label: t('meta.aiSummary'), icon: '🤖' },
  ];

  return (
    <>
      <div className={styles['meta-panel']}>
        {/* Header */}
        <div className={styles['meta-header']}>
          <div className={styles['meta-header-badge']} style={{ background: layerStyle.bg, color: layerStyle.color }}>
            {layerStyle.label}
          </div>
          <h3 className={styles['meta-title']}>{hypothesis.label}</h3>
          {hypothesisDetail && (
            <p className={styles['meta-description']}>{hypothesisDetail.description}</p>
          )}
          {onOpenExternal && (
            <button className={styles['meta-external-btn']} onClick={onOpenExternal}>
              🔬 {t('meta.externalStudy')} →
            </button>
          )}
          <button className={`${styles['meta-external-btn']} unified-group-nav-btn`} onClick={() => setUnifiedOpen(true)}>
            🗺️ {t('meta.groupDiagnoses')}
          </button>
        </div>

        {/* Tabs */}
        <div className={styles['meta-tabs']}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles['meta-tab']} ${activeTab === tab.id ? styles['meta-tab--active'] : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles['meta-tab-icon']}>{tab.icon}</span>
              <span className={styles['meta-tab-label']}>{tab.label}</span>
              {'count' in tab && tab.count! > 0 && (
                <span className={styles['meta-tab-count']}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={`${styles['meta-content']} ${styles['meta-content--entering']}`} key={hypothesis.id}>
          <div className={styles['meta-tab-panel']} key={activeTab}>
            {activeTab === 'overview' && (
              <OverviewTab
                detail={hypothesisDetail}
                nodes={involvedNodes}
              />
            )}
            {activeTab === 'graph' && (
              <MiniGraph
                nodes={involvedNodes}
                links={involvedLinks}
                focusId={hypothesis.id}
                title={hypothesis.label}
                dark
                onExpand={() => setGraphExpanded(true)}
              />
            )}
            {activeTab === '3d' && (
              <ThreeGraph
                nodes={involvedNodes}
                links={involvedLinks}
                focusId={hypothesis.id}
                onNodeClick={(id) => onSelectNosology?.(id)}
              />
            )}
            {activeTab === 'evidence' && <EvidenceTab evidenceList={evidenceList} />}
            {activeTab === 'comparison' && comparison && <DiffTable data={comparison} />}
            {activeTab === 'timeline' && timeline && <TimelineTab data={timeline} />}
            {activeTab === 'ai' && (
              <Suspense fallback={<MetaSkeleton />}>
                <AIDescriptionPanel data={data} />
              </Suspense>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Zoomable Graph Overlay */}
      {graphExpanded && (
        <ZoomableGraphOverlay
          nodes={involvedNodes}
          links={involvedLinks}
          focusId={hypothesis.id}
          title={hypothesis.label}
          details={data.graph.details}
          onClose={() => setGraphExpanded(false)}
        />
      )}

      {/* Unified Map Overlay */}
      {unifiedOpen && (
        <UnifiedGraphOverlay
          highlightGroup={groups.find((g) => g.nozologies.includes(data.graph.id))?.id}
          onSelectNosology={(id) => {
            setUnifiedOpen(false);
            onSelectNosology?.(resolveGraphId(id));
          }}
          onClose={() => setUnifiedOpen(false)}
        />
      )}
    </>
  );
}

// Helper to find group for current nosology
const groups = [
  { id: 'cardiovascular', nozologies: ['myocardial-infarction','acute-heart-failure','dvt-pe','aortic-dissection','pericarditis','endocarditis'] },
  { id: 'respiratory', nozologies: ['pneumonia','copd-exacerbation','asthma-status','dvt-pe'] },
  { id: 'infectious', nozologies: ['sepsis','meningitis','endocarditis','pneumonia','pyelonephritis'] },
  { id: 'neurological', nozologies: ['stroke','status-epilepticus','meningitis'] },
  { id: 'endocrine', nozologies: ['diabetic-ketoacidosis','thyroid-storm','adrenal-crisis','hypercalcemia'] },
  { id: 'surgical_abdominal', nozologies: ['appendicitis','cholecystitis','pancreatitis','gastrointestinal-bleeding','ectopic-pregnancy'] },
  { id: 'hematological', nozologies: ['anemia'] },
  { id: 'shock_allergy', nozologies: ['anaphylaxis','sepsis'] },
];

// ===== Overview Tab =====
function OverviewTab({
  detail,
  nodes,
}: {
  detail: MetaResolvedData['hypothesisDetail'];
  nodes: MetaNode[];
}) {
  const { t } = useI18n();
  const grouped = groupByLayer(nodes);

  return (
    <div className={styles['meta-overview']}>
      {detail && (
        <div className={styles['meta-section']}>
          <h4 className={styles['meta-section-title']}>{t('meta.diagnosisCriteria')}</h4>
          <ul className={styles['meta-criteria-list']}>
            {detail.criteria.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {detail && detail.complications.length > 0 && (
        <div className={styles['meta-section']}>
          <h4 className={styles['meta-section-title']}>{t('meta.complications')}</h4>
          <div className={styles['meta-tags']}>
            {detail.complications.map((c, i) => (
              <span key={i} className={`${styles['meta-tag']} ${styles['meta-tag--danger']}`}>{c}</span>
            ))}
          </div>
        </div>
      )}

      {detail && detail.treatment.length > 0 && (
        <div className={styles['meta-section']}>
          <h4 className={styles['meta-section-title']}>{t('meta.treatment')}</h4>
          <ul className={styles['meta-treatment-list']}>
            {detail.treatment.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles['meta-section']}>
        <h4 className={styles['meta-section-title']}>{t('meta.involvedElements')}</h4>
        {(['raw', 'findings', 'hypotheses', 'differential', 'evidence'] as MetaLayer[]).map((layer) => {
          const layerNodes = grouped[layer];
          if (!layerNodes || layerNodes.length === 0) return null;
          const style = LAYER_LABELS[layer];
          return (
            <div key={layer} className={styles['meta-layer-group']}>
              <span className={styles['meta-layer-badge']} style={{ background: style.bg, color: style.color }}>
                {style.label}
              </span>
              <div className={styles['meta-node-chips']}>
                {layerNodes.map((n) => (
                  <span key={n.id} className={styles['meta-chip']} title={n.id}>
                    {n.label}
                    {n.value !== undefined && (
                      <span className={styles['meta-chip-value']}> = {n.value}</span>
                    )}
                    {n.unit && (
                      <span className={styles['meta-chip-unit']}> {n.unit}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== Evidence Tab =====
function EvidenceTab({ evidenceList }: { evidenceList: MetaResolvedData['evidenceList'] }) {
  const { t } = useI18n();
  if (evidenceList.length === 0) {
    return (
      <div className={styles['meta-empty']}>
        <p>{t('meta.noEvidence')}</p>
      </div>
    );
  }

  return (
    <div className={styles['meta-evidence-list']}>
      {evidenceList.map((ev, i) => (
        <div key={i} className={styles['meta-evidence-card']}>
          <div className={styles['meta-evidence-header']}>
            <EvidenceBadge grade={ev.grade} />
            <span className={styles['meta-evidence-year']}>{ev.year}</span>
            {ev.n && <span className={styles['meta-evidence-n']}>n = {ev.n.toLocaleString('ru')}</span>}
          </div>
          <h4 className={styles['meta-evidence-title']}>{ev.title}</h4>
          <p className={styles['meta-evidence-authors']}>{ev.authors} — {ev.journal}</p>
          <p className={styles['meta-evidence-design']}>{ev.design}</p>
          <ul className={styles['meta-evidence-findings']}>
            {ev.key_findings.map((f, j) => (
              <li key={j}>{f}</li>
            ))}
          </ul>
          <p className={styles['meta-evidence-quality']}>{ev.quality}</p>
        </div>
      ))}
    </div>
  );
}

// ===== Timeline Tab =====
function TimelineTab({ data }: { data: NonNullable<MetaResolvedData['timeline']> }) {
  const keys = Object.keys(data[0]).filter((k) => k !== 'time' && k !== 'event');
  const maxTime = Math.max(...data.map((d) => d.time));

  return (
    <div className={styles['meta-timeline']}>
      <div className={styles['meta-timeline-track']}>
        {data.map((point, i) => {
          const left = maxTime > 0 ? (point.time / maxTime) * 100 : 0;
          return (
            <div
              key={i}
              className={styles['meta-timeline-point']}
              style={{ left: `${left}%` }}
              title={point.event}
            >
              <div className={styles['meta-timeline-dot']} />
              <div className={styles['meta-timeline-tooltip']}>
                <strong>{point.event}</strong>
                {keys.map((k) => (
                  <div key={k}>
                    {k}: {point[k]}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles['meta-timeline-events']}>
        {data.map((point, i) => (
          <div key={i} className={styles['meta-timeline-event']}>
            <span className={styles['meta-timeline-time']}>{point.time}</span>
            <span className={styles['meta-timeline-label']}>{point.event}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Helpers =====
function groupByLayer(nodes: MetaNode[]): Record<MetaLayer, MetaNode[]> {
  const result: Partial<Record<MetaLayer, MetaNode[]>> = {};
  nodes.forEach((n) => {
    if (!result[n.layer]) result[n.layer] = [];
    result[n.layer]!.push(n);
  });
  return result as Record<MetaLayer, MetaNode[]>;
}
