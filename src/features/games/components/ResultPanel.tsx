import { useState, useEffect } from 'react';
import { useGameStore } from '../../../shared/store/gameStore';
import type { UnifiedCase, CasesState } from '../../../types';
import type { MetaResolvedData } from '../../meta/types';
import { MetaPanel } from '../../meta/components/MetaPanel';
import { ErrorBoundary } from '../../meta/components/ErrorBoundary';
import { MetaZoneInlinePanel } from '../../meta/components/MetaZoneInlinePanel';
import { resolveMetaCase } from '../../meta/metaResolver';
import { AnimatedIcon } from '../../../shared/components/AnimatedIcon';

interface Props {
  currentCase: UnifiedCase;
  state: CasesState;
}

export function ResultPanel({ currentCase, state }: Props) {
  const { nextCase, showToast } = useGameStore();

  const [metaData, setMetaData] = useState<MetaResolvedData | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaOpen, setMetaOpen] = useState(false);
  const [inlineMeta, setInlineMeta] = useState<{ nosoId: string; focusId: string } | null>(null);

  useEffect(() => {
    if (state.finished && currentCase.metaRef) {
      setMetaLoading(true);
      setMetaOpen(false);
      resolveMetaCase(currentCase.metaRef)
        .then((data) => setMetaData(data))
        .catch((err) => {
          console.warn('[ResultPanel] Meta resolve failed:', err);
          setMetaData(null);
        })
        .finally(() => setMetaLoading(false));
    } else {
      setMetaData(null);
      setMetaLoading(false);
    }
  }, [state.finished, currentCase.metaRef]);

  if (!state.finished) return null;

  const won = state.won;
  const ankiTag = currentCase.diagnosis[0].replace(/[\s\-]/g, '_');

  const handleShare = () => {
    const history = state.history;
    let grid = '';
    for (let i = 0; i < 6; i++) {
      grid += i < history.length ? (history[i] === 'correct' ? '🟩' : '🟥') : '⬜';
    }
    const text = `DOC [${currentCase.specialtyName}]\n${won ? '✅ Угадано с ' + state.attempts + '-й попытки' : '❌ Не угадано'}\n${grid}\nhttps://doc.medical`;
    navigator.clipboard.writeText(text).then(() => showToast('Результат скопирован'));
  };

  const handleCopyAnki = () => {
    navigator.clipboard.writeText(`#${ankiTag}`).then(() => showToast('Anki-тег скопирован'));
  };

  const handleOpenMetaFull = () => {
    if (!currentCase.metaRef) return;
    const { nosoId, hypothesisId } = currentCase.metaRef;
    setInlineMeta({ nosoId, focusId: hypothesisId });
  };

  const handleCloseInlineMeta = () => setInlineMeta(null);
  const hasMeta = !!currentCase.metaRef;

  return (
    <>
      <div className={`result-area ${won ? 'win' : 'lose'}`}>
        <div className="result-title">
          {won ? (
            <><AnimatedIcon name="party" size={20} /> Победа! Диагноз угадан с {state.attempts}-й попытки</>
          ) : (
            <><AnimatedIcon name="cross" size={20} color="var(--error)" /> Поражение. Правильный диагноз: {currentCase.diagnosis[0]}</>
          )}
        </div>

        <div className="explanation-box">
          <strong>Объяснение:</strong><br />
          {currentCase.explanation}
        </div>

        {hasMeta && (
          <button className="btn-meta-deep-dive" onClick={() => setMetaOpen((v) => !v)} disabled={metaLoading}>
            {metaLoading ? (
              <><AnimatedIcon name="refresh" size={16} animation="spin" /> Загрузка...</>
            ) : metaOpen ? (
              <><AnimatedIcon name="arrowUp" size={16} /> Свернуть разбор</>
            ) : (
              <><AnimatedIcon name="microscope" size={16} /> Глубокий разбор</>
            )}
          </button>
        )}

        {metaOpen && hasMeta && (
          <ErrorBoundary onReset={() => setMetaOpen(false)}>
            <MetaPanel data={metaData} loading={metaLoading} onOpenExternal={handleOpenMetaFull} />
          </ErrorBoundary>
        )}

        <div className="anki-tag" onClick={handleCopyAnki}>
          <AnimatedIcon name="clipboard" size={14} style={{ marginRight: '4px' }} /> #{ankiTag}
        </div>

        {won && (
          <button className="btn-primary share-btn" onClick={handleShare}>
            <AnimatedIcon name="copy" size={16} style={{ marginRight: '6px' }} /> Поделиться результатом
          </button>
        )}

        <button className="btn-secondary next-case-btn" onClick={nextCase}>
          <AnimatedIcon name="arrowUp" size={16} style={{ transform: 'rotate(90deg)', display: 'inline-flex', marginRight: '6px' }} /> Следующий кейс
        </button>
      </div>

      {inlineMeta && (
        <MetaZoneInlinePanel nosoId={inlineMeta.nosoId} focusId={inlineMeta.focusId} onClose={handleCloseInlineMeta} />
      )}
    </>
  );
}
