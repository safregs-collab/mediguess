/**
 * MetaZonePage — standalone страница для просмотра графа нозологии
 *
 * Открывается по URL: /medical-meta-zone/?noso=<id>&focus=<hypothesisId>
 * Показывает полный граф нозологии через MetaPanel.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { MetaResolvedData } from '../types';
import { loadGraph, loadNosologyIndex, preloadAllGraphs } from '../metaResolver';
import { resolveGraphId } from '../metaIdMap';
import { MetaPanel } from './MetaPanel';
import { useI18n } from '../i18n';
import styles from '../meta.module.css';

export function MetaZonePage() {
  const { t, lang, setLang } = useI18n();
  const [data, setData] = useState<MetaResolvedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nosoLabel, setNosoLabel] = useState('');
  const [switching, setSwitching] = useState(false);
  const [copied, setCopied] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchSelected, setSearchSelected] = useState(0);
  const [allNosologies, setAllNosologies] = useState<Array<{ id: string; label: string }>>([]);

  // Navigation history
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyRef = useRef(history);
  const historyIndexRef = useRef(historyIndex);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { historyIndexRef.current = historyIndex; }, [historyIndex]);

  const navigateToNosology = useCallback((id: string, addToHistory: boolean = true) => {
    const graphId = resolveGraphId(id);
    const params = new URLSearchParams(window.location.search);
    params.set('noso', graphId);
    params.delete('focus');
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    if (addToHistory) {
      const currentIndex = historyIndexRef.current;
      const currentHistory = historyRef.current;
      const newHist = currentHistory.slice(0, currentIndex + 1);
      if (newHist[newHist.length - 1] !== graphId) {
        newHist.push(graphId);
      }
      setHistory(newHist);
      setHistoryIndex(newHist.length - 1);
    }
    setSwitching(true);
    setLoading(true);
    setError(null);
    setData(null);
    window.dispatchEvent(new Event('popstate'));
    setTimeout(() => setSwitching(false), 350);
  }, []);

  const handleSelectNosology = useCallback((id: string) => {
    navigateToNosology(id, true);
  }, [navigateToNosology]);

  const copyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const filteredNosologies = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allNosologies.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.id.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery, allNosologies]);

  // Reset selection when filtered results change
  useEffect(() => {
    setSearchSelected(0);
  }, [filteredNosologies]);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateHistory = useCallback((delta: number) => {
    const currentIndex = historyIndexRef.current;
    const currentHistory = historyRef.current;
    const newIndex = currentIndex + delta;
    if (newIndex < 0 || newIndex >= currentHistory.length) return;
    setHistoryIndex(newIndex);
    navigateToNosology(currentHistory[newIndex], false);
  }, [navigateToNosology]);

  // Listen for URL changes (from handleSelectNosology or browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const nosoId = resolveGraphId(params.get('noso') || '');
      const focusId = params.get('focus');
      if (!nosoId) {
        setError('Не указана нозология');
        setLoading(false);
        return;
      }
      loadData(nosoId, focusId);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  async function loadData(nosoId: string, focusId: string | null) {
    try {
      const [graph, index] = await Promise.all([
        loadGraph(nosoId),
        loadNosologyIndex(),
      ]);

      if (!graph) {
        setError(`Граф "${nosoId}" не найден`);
        setLoading(false);
        return;
      }

      const nosoItem = index.nosologies.find((n) => n.id === nosoId);
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let nosoId = resolveGraphId(params.get('noso') || '');
    const focusId = params.get('focus');

    if (!nosoId) {
      // Автовыбор первой доступной нозологии
      loadNosologyIndex().then((index) => {
        const first = index.nosologies.find((n) => n.status === 'complete');
        if (first) {
          nosoId = first.id;
          params.set('noso', nosoId);
          window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
          setHistory([nosoId]);
          setHistoryIndex(0);
          loadData(nosoId, focusId);
        } else {
          setError('Нет доступных нозологий');
          setLoading(false);
        }
      });
    } else {
      setHistory([nosoId]);
      setHistoryIndex(0);
      loadData(nosoId, focusId);
    }

    preloadAllGraphs(); // предзагрузка всех графов в фоне

    // Load all nosologies for search
    loadNosologyIndex().then((index) => {
      setAllNosologies(
        index.nosologies
          .filter((n) => n.status === 'complete')
          .map((n) => ({ id: n.id, label: n.label }))
      );
    });
  }, []);

  if (loading) {
    return (
      <div className={`${styles['meta-zone-page']} ${styles['meta-zone-page--loading']}`}>
        <div className={styles['meta-spinner']} />
        <span>{t('meta.title')}{nosoLabel ? ` «${nosoLabel}»…` : '…'}</span>
      </div>
    );
  }

  if (error) {
    const params = new URLSearchParams(window.location.search);
    const currentNoso = resolveGraphId(params.get('noso') || '');

    return (
      <div className={`${styles['meta-zone-page']} ${styles['meta-zone-page--error']}`}>
        <h2>⚠️ {t('meta.noData')}</h2>
        <p>{error}</p>
        <div className={styles['meta-zone-error-actions']}>
          {currentNoso && (
            <button
              className={styles['meta-zone-retry-btn']}
              onClick={() => {
                setError(null);
                setLoading(true);
                loadData(currentNoso, params.get('focus'));
              }}
            >
              🔄 Повторить загрузку
            </button>
          )}
          <a href="./" onClick={(e) => { if (window.history.length > 1) { e.preventDefault(); window.history.back(); } }} className={styles['meta-zone-back-link']}>{t('meta.back')}</a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['meta-zone-page']}>
      <header className={styles['meta-zone-header']}>
        <a href="./" onClick={(e) => { if (window.history.length > 1) { e.preventDefault(); window.history.back(); } }} className={styles['meta-zone-back-link']}>{t('meta.back')}</a>
        <h1 className={styles['meta-zone-title']}>
          {nosoLabel || t('meta.title')}
        </h1>
        <div className={styles['meta-zone-lang-switcher']}>
          <button
            className={`meta-zone-lang-btn ${lang === 'ru' ? 'active' : ''}`}
            onClick={() => setLang('ru')}
          >
            RU
          </button>
          <button
            className={`meta-zone-lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >
            EN
          </button>
        </div>
        <div className={styles['meta-zone-search']} ref={searchRef}>
          <input
            type="text"
            className={styles['meta-zone-search-input']}
            placeholder={t('meta.searchNosology')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(e) => {
              if (!searchOpen || filteredNosologies.length === 0) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSearchSelected((prev) =>
                  Math.min(prev + 1, filteredNosologies.length - 1)
                );
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSearchSelected((prev) => Math.max(prev - 1, 0));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                const selected = filteredNosologies[searchSelected];
                if (selected) {
                  setSearchQuery('');
                  setSearchOpen(false);
                  handleSelectNosology(selected.id);
                }
              } else if (e.key === 'Escape') {
                setSearchOpen(false);
              }
            }}
            aria-label={t('meta.searchNosology')}
            aria-expanded={searchOpen}
            aria-activedescendant={
              searchOpen && filteredNosologies[searchSelected]
                ? `search-item-${filteredNosologies[searchSelected].id}`
                : undefined
            }
          />
          {searchOpen && filteredNosologies.length > 0 && (
            <div className={styles['meta-zone-search-dropdown']}>
              {filteredNosologies.map((n, idx) => (
                <button
                  key={n.id}
                  id={`search-item-${n.id}`}
                  className={`meta-zone-search-item ${idx === searchSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setSearchQuery('');
                    setSearchOpen(false);
                    handleSelectNosology(n.id);
                  }}
                  onMouseEnter={() => setSearchSelected(idx)}
                >
                  {n.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={styles['meta-zone-nav-history']}>
          <button
            className={styles['meta-zone-nav-btn']}
            disabled={historyIndex <= 0}
            onClick={() => navigateHistory(-1)}
            title={t('meta.navBack')}
          >
            {t('meta.back')}
          </button>
          <span className={styles['meta-zone-nav-counter']}>
            {historyIndex + 1} / {history.length}
          </span>
          <button
            className={styles['meta-zone-nav-btn']}
            disabled={historyIndex >= history.length - 1}
            onClick={() => navigateHistory(1)}
            title={t('meta.navForward')}
          >
            {t('meta.navForward')}
          </button>
          <button
            className={`meta-zone-share-btn ${copied ? 'copied' : ''}`}
            onClick={copyShareLink}
            title={t('meta.share')}
          >
            {copied ? `✓ ${t('meta.copied')}` : `🔗 ${t('meta.share')}`}
          </button>
        </div>
      </header>
      <main className={styles['meta-zone-main']}>
        <MetaPanel
          data={data}
          loading={switching}
          onSelectNosology={handleSelectNosology}
        />
      </main>
    </div>
  );
}
