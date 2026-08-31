/**
 * MetaZoneInlinePanel — inline-панель для просмотра полного графа нозологии
 *
 * Открывается поверх текущего контента (overlay), без перехода на новую страницу.
 * Закрывается по крестику, клику на backdrop или Escape.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { MetaResolvedData } from '../types';
import { loadGraph, loadNosologyIndex } from '../metaResolver';
import { MetaPanel } from './MetaPanel';
import styles from '../meta.module.css';

interface MetaZoneInlinePanelProps {
  nosoId: string;
  focusId?: string;
  onClose: () => void;
}

export function MetaZoneInlinePanel({ nosoId, focusId, onClose }: MetaZoneInlinePanelProps) {
  const [data, setData] = useState<MetaResolvedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nosoLabel, setNosoLabel] = useState('');
  const [currentNosoId, setCurrentNosoId] = useState(nosoId);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleSelectNosology = useCallback((id: string) => {
    setCurrentNosoId(id);
    setLoading(true);
    setError(null);
    setData(null);
  }, []);

  // Загрузка графа
  useEffect(() => {
    async function load() {
      try {
        const [graph, index] = await Promise.all([
          loadGraph(currentNosoId),
          loadNosologyIndex(),
        ]);

        if (!graph) {
          setError(`Граф "${currentNosoId}" не найден`);
          setLoading(false);
          return;
        }

        const nosoItem = index.nosologies.find((n) => n.id === currentNosoId);
        if (nosoItem) setNosoLabel(nosoItem.label);

        const hypothesisId = focusId || graph.nodes.find((n) => n.layer === 'hypotheses')?.id;
        if (!hypothesisId) {
          setError('В графе нет гипотез');
          setLoading(false);
          return;
        }

        const hypothesis = graph.nodes.find((n) => n.id === hypothesisId);
        if (!hypothesis) {
          setError(`Гипотеза "${hypothesisId}" не найдена`);
          setLoading(false);
          return;
        }

        const resolved: MetaResolvedData = {
          graph,
          hypothesis,
          hypothesisDetail: graph.details[hypothesisId] ?? null,
          involvedNodes: graph.nodes,
          involvedLinks: graph.links,
          comparison: Object.values(graph.comparisons)[0] ?? null,
          evidenceList: Object.values(graph.evidence),
          timeline: Object.values(graph.timelines)[0] ?? null,
        };

        setData(resolved);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [currentNosoId, focusId]);

  // Блокировка скролла body
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Закрытие по Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Закрытие по клику на backdrop
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  return (
    <div className={styles['meta-inline-overlay']} onClick={handleBackdropClick}>
      <div className={styles['meta-inline-panel']} ref={panelRef}>
        {/* Header панели */}
        <div className={styles['meta-inline-header']}>
          <div className={styles['meta-inline-header-left']}>
            <span className={styles['meta-inline-header-icon']}>🕸️</span>
            <h2 className={styles['meta-inline-header-title']}>
              {nosoLabel || 'Медицинская Мета-Зона'}
            </h2>
          </div>
          <button className={styles['meta-inline-close-btn']} onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        {/* Контент */}
        <div className={styles['meta-inline-body']}>
          {loading && (
            <div className={styles['meta-inline-loading']}>
              <div className={styles['meta-spinner']} />
              <span>Загрузка графа{nosoLabel ? ` «${nosoLabel}»` : ''}…</span>
            </div>
          )}

          {error && (
            <div className={styles['meta-inline-error']}>
              <h3>⚠️ Ошибка</h3>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && data && (
            <MetaPanel data={data} loading={false} onSelectNosology={handleSelectNosology} />
          )}
        </div>
      </div>
    </div>
  );
}
