import { useState } from 'react';
import type { PhysicalFinding } from '../../../types/simulation';

interface Props {
  findings: PhysicalFinding[];
  onRegionClick?: (region: PhysicalFinding['region']) => void;
}

const REGION_LABELS: Record<string, string> = {
  general: 'Общий осмотр',
  head: 'Голова / шея',
  chest: 'Грудная клетка',
  abdomen: 'Живот',
  skin: 'Кожные покровы',
  neuro: 'Неврология',
  extremities: 'Конечности',
  back: 'Спина',
};

const SVG_REGIONS = ['head', 'chest', 'abdomen', 'extremities'] as const;
const EXTRA_REGIONS = ['skin', 'neuro', 'general', 'back'] as const;

export function InteractiveBody({ findings, onRegionClick }: Props) {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [visitedRegions, setVisitedRegions] = useState<Set<string>>(new Set());

  const regionFindings = (region: string) =>
    findings.filter((f) => f.region === region);

  const hasAbnormal = (region: string) =>
    regionFindings(region).some((f) => f.isAbnormal);

  const handleClick = (region: PhysicalFinding['region']) => {
    setActiveRegion(region);
    setVisitedRegions((prev) => new Set(prev).add(region));
    onRegionClick?.(region);
  };

  const getZoneClass = (region: string) => {
    const isActive = activeRegion === region;
    const isVisited = visitedRegions.has(region);
    const isAbnormal = hasAbnormal(region);
    let cls = 'body-zone';
    if (isActive) cls += ' active';
    else if (isVisited) {
      if (isAbnormal) cls += ' visited-abnormal';
      else cls += ' visited-normal';
    }
    return cls;
  };

  return (
    <div className="interactive-body-wrapper">
      <div className="body-svg-container">
        <div className="body-hint">Кликните на часть тела для осмотра</div>

        <svg viewBox="0 0 200 400" className="body-svg">
          {/* ===== ГОЛОВА + ШЕЯ ===== */}
          <g className={getZoneClass('head')} onClick={() => handleClick('head')}>
            {/* Волосы */}
            <path d="M 78 28 C 78 10, 88 2, 100 2 C 112 2, 122 10, 122 28 C 122 22, 118 18, 112 16 C 106 14, 94 14, 88 16 C 82 18, 78 22, 78 28 Z" />
            {/* Голова */}
            <ellipse cx="100" cy="44" rx="21" ry="26" />
            {/* Шея */}
            <path d="M 88 68 L 86 86 C 86 90, 92 92, 100 92 C 108 92, 114 90, 114 86 L 112 68 Z" />
            {/* Кадык */}
            <ellipse cx="100" cy="82" rx="3" ry="2" className="body-feature" />
            {/* Глаза */}
            <ellipse cx="94" cy="40" rx="3.5" ry="2.2" className="body-feature" />
            <ellipse cx="106" cy="40" rx="3.5" ry="2.2" className="body-feature" />
            {/* Зрачки */}
            <circle cx="94" cy="40" r="1.2" className="body-feature-dot" />
            <circle cx="106" cy="40" r="1.2" className="body-feature-dot" />
            {/* Брови */}
            <path d="M 90 34 Q 94 32, 98 34" className="body-feature" />
            <path d="M 102 34 Q 106 32, 110 34" className="body-feature" />
            {/* Нос */}
            <path d="M 100 40 L 97 50 L 103 50 Z" className="body-feature" />
            {/* Ноздри */}
            <ellipse cx="98" cy="51" rx="1" ry="0.6" className="body-feature-dot" />
            <ellipse cx="102" cy="51" rx="1" ry="0.6" className="body-feature-dot" />
            {/* Рот */}
            <path d="M 95 58 Q 100 61, 105 58" className="body-feature" />
            {/* Уши с раковиной */}
            <path d="M 77 40 C 73 36, 73 48, 77 48 C 79 46, 79 42, 77 40" className="body-feature" />
            <path d="M 123 40 C 127 36, 127 48, 123 48 C 121 46, 121 42, 123 40" className="body-feature" />
            {/* Раковина левая */}
            <path d="M 76 42 Q 74 44, 76 46" className="body-feature" />
            {/* Раковина правая */}
            <path d="M 124 42 Q 126 44, 124 46" className="body-feature" />
          </g>

          {/* ===== ГРУДНАЯ КЛЕТКА ===== */}
          <g className={getZoneClass('chest')} onClick={() => handleClick('chest')}>
            {/* Основной контур */}
            <path d="M 90 90 L 68 96 C 56 102, 50 114, 50 130 L 50 168 L 62 168 L 62 138 C 62 150, 66 162, 72 172 L 128 172 C 134 162, 138 150, 138 138 L 138 168 L 150 168 L 150 130 C 150 114, 144 102, 132 96 L 110 90 Z" />
            {/* Подмышечные впадины */}
            <path d="M 62 112 Q 56 118, 58 126" className="body-feature" />
            <path d="M 138 112 Q 144 118, 142 126" className="body-feature" />
            {/* Ключицы */}
            <path d="M 80 104 Q 100 110, 120 104" className="body-feature" />
            {/* Грудные мышцы — верх */}
            <path d="M 84 118 Q 100 126, 116 118" className="body-feature" />
            {/* Грудные мышцы — низ */}
            <path d="M 86 132 Q 100 140, 114 132" className="body-feature" />
            {/* Соски */}
            <circle cx="88" cy="126" r="1.5" className="body-feature" />
            <circle cx="112" cy="126" r="1.5" className="body-feature" />
            {/* Ареолы */}
            <ellipse cx="88" cy="126" rx="4" ry="3" className="body-feature" />
            <ellipse cx="112" cy="126" rx="4" ry="3" className="body-feature" />
            {/* Рёбра — левые */}
            <path d="M 74 144 Q 70 150, 74 156" className="body-feature" />
            <path d="M 76 152 Q 72 158, 76 164" className="body-feature" />
            {/* Рёбра — правые */}
            <path d="M 126 144 Q 130 150, 126 156" className="body-feature" />
            <path d="M 124 152 Q 128 158, 124 164" className="body-feature" />
            {/* Мечевидный отросток */}
            <path d="M 98 152 L 100 162 L 102 152" className="body-feature" />
            {/* Плечевые суставы (акромиальные выступы) */}
            <ellipse cx="64" cy="98" rx="4" ry="3" className="body-feature" />
            <ellipse cx="136" cy="98" rx="4" ry="3" className="body-feature" />
          </g>

          {/* ===== ЖИВОТ ===== */}
          <g className={getZoneClass('abdomen')} onClick={() => handleClick('abdomen')}>
            {/* Основной контур */}
            <path d="M 72 172 C 68 186, 66 202, 68 218 L 70 246 L 130 246 L 132 218 C 134 202, 132 186, 128 172 Z" />
            {/* Талия */}
            <path d="M 72 200 Q 68 208, 72 216" className="body-feature" />
            <path d="M 128 200 Q 132 208, 128 216" className="body-feature" />
            {/* Пупок */}
            <ellipse cx="100" cy="214" rx="2.5" ry="1.5" className="body-feature" />
            {/* Пупочное кольцо */}
            <ellipse cx="100" cy="214" rx="5" ry="3" className="body-feature" />
            {/* Пресс — вертикальная линия */}
            <line x1="100" y1="180" x2="100" y2="246" className="body-feature-dash" />
            {/* Пресс — горизонтальные линии */}
            <line x1="76" y1="196" x2="124" y2="196" className="body-feature-dash" />
            <line x1="74" y1="212" x2="126" y2="212" className="body-feature-dash" />
            <line x1="76" y1="228" x2="124" y2="228" className="body-feature-dash" />
            {/* Паховые линии */}
            <path d="M 76 236 Q 82 244, 90 246" className="body-feature" />
            <path d="M 124 236 Q 118 244, 110 246" className="body-feature" />
            {/* Тазовые кости (верхушки) */}
            <path d="M 82 246 Q 88 252, 96 246" className="body-feature" />
            <path d="M 118 246 Q 112 252, 104 246" className="body-feature" />
          </g>

          {/* ===== ЛЕВАЯ РУКА ===== */}
          <g className={getZoneClass('extremities')} onClick={() => handleClick('extremities')}>
            {/* Плечо (бицепс) */}
            <path d="M 50 130 L 46 176 C 44 192, 42 206, 44 222 L 56 222 C 58 206, 56 192, 55 176 L 58 138 Z" />
            {/* Бицепс */}
            <path d="M 48 158 Q 52 162, 48 166" className="body-feature" />
            {/* Локоть */}
            <ellipse cx="50" cy="184" rx="3" ry="2.5" className="body-feature" />
            {/* Предплечье */}
            <path d="M 44 222 L 42 262 C 40 278, 42 292, 44 306 L 56 306 C 58 292, 56 278, 54 262 L 56 222 Z" />
            {/* Локтевая ямка */}
            <path d="M 46 226 Q 50 228, 46 230" className="body-feature" />
            {/* Запястье */}
            <ellipse cx="50" cy="304" rx="3" ry="2" className="body-feature" />
            {/* Кисть */}
            <ellipse cx="50" cy="314" rx="7" ry="5" className="body-feature" />
            {/* Пальцы левой руки */}
            <ellipse cx="44" cy="320" rx="1.5" ry="3" className="body-feature" />
            <ellipse cx="47" cy="322" rx="1.5" ry="3.5" className="body-feature" />
            <ellipse cx="50" cy="323" rx="1.5" ry="4" className="body-feature" />
            <ellipse cx="53" cy="322" rx="1.5" ry="3.5" className="body-feature" />
            <ellipse cx="56" cy="320" rx="1.5" ry="3" className="body-feature" />
            {/* Большой палец */}
            <ellipse cx="42" cy="312" rx="3" ry="1.5" className="body-feature" transform="rotate(-30 42 312)" />
          </g>

          {/* ===== ПРАВАЯ РУКА ===== */}
          <g className={getZoneClass('extremities')} onClick={() => handleClick('extremities')}>
            {/* Плечо (бицепс) */}
            <path d="M 150 130 L 154 176 C 156 192, 158 206, 156 222 L 144 222 C 142 206, 144 192, 145 176 L 142 138 Z" />
            {/* Бицепс */}
            <path d="M 152 158 Q 148 162, 152 166" className="body-feature" />
            {/* Локоть */}
            <ellipse cx="150" cy="184" rx="3" ry="2.5" className="body-feature" />
            {/* Предплечье */}
            <path d="M 156 222 L 158 262 C 160 278, 158 292, 156 306 L 144 306 C 142 292, 144 278, 146 262 L 144 222 Z" />
            {/* Локтевая ямка */}
            <path d="M 154 226 Q 150 228, 154 230" className="body-feature" />
            {/* Запястье */}
            <ellipse cx="150" cy="304" rx="3" ry="2" className="body-feature" />
            {/* Кисть */}
            <ellipse cx="150" cy="314" rx="7" ry="5" className="body-feature" />
            {/* Пальцы правой руки */}
            <ellipse cx="144" cy="320" rx="1.5" ry="3" className="body-feature" />
            <ellipse cx="147" cy="322" rx="1.5" ry="3.5" className="body-feature" />
            <ellipse cx="150" cy="323" rx="1.5" ry="4" className="body-feature" />
            <ellipse cx="153" cy="322" rx="1.5" ry="3.5" className="body-feature" />
            <ellipse cx="156" cy="320" rx="1.5" ry="3" className="body-feature" />
            {/* Большой палец */}
            <ellipse cx="158" cy="312" rx="3" ry="1.5" className="body-feature" transform="rotate(30 158 312)" />
          </g>

          {/* ===== ЛЕВАЯ НОГА ===== */}
          <g className={getZoneClass('extremities')} onClick={() => handleClick('extremities')}>
            {/* Бедро (квадрицепс) */}
            <path d="M 70 246 L 68 296 C 66 318, 68 340, 70 362 L 84 362 C 86 340, 88 318, 86 296 L 88 246 Z" />
            {/* Квадрицепс */}
            <path d="M 72 276 Q 76 282, 72 288" className="body-feature" />
            {/* Бедренная складка */}
            <path d="M 72 250 Q 78 254, 84 250" className="body-feature" />
            {/* Колено */}
            <ellipse cx="77" cy="298" rx="4" ry="3" className="body-feature" />
            {/* Коленная чашечка */}
            <ellipse cx="77" cy="298" rx="2.5" ry="2" className="body-feature" />
            {/* Голень (икра) */}
            <path d="M 70 362 L 68 392 C 66 406, 68 418, 70 428 L 82 428 C 84 418, 86 406, 84 392 L 86 362 Z" />
            {/* Икра */}
            <path d="M 72 388 Q 76 394, 72 400" className="body-feature" />
            {/* Лодыжка */}
            <ellipse cx="76" cy="426" rx="3" ry="2" className="body-feature" />
            {/* Стопа */}
            <ellipse cx="76" cy="436" rx="8" ry="4" className="body-feature" />
            {/* Пятка */}
            <ellipse cx="70" cy="436" rx="3" ry="2" className="body-feature" />
            {/* Пальцы левой ноги */}
            <ellipse cx="70" cy="440" rx="1.2" ry="2.5" className="body-feature" />
            <ellipse cx="73" cy="441" rx="1.2" ry="2.8" className="body-feature" />
            <ellipse cx="76" cy="442" rx="1.2" ry="3" className="body-feature" />
            <ellipse cx="79" cy="441" rx="1.2" ry="2.8" className="body-feature" />
            <ellipse cx="82" cy="440" rx="1.2" ry="2.5" className="body-feature" />
          </g>

          {/* ===== ПРАВАЯ НОГА ===== */}
          <g className={getZoneClass('extremities')} onClick={() => handleClick('extremities')}>
            {/* Бедро (квадрицепс) */}
            <path d="M 130 246 L 132 296 C 134 318, 132 340, 130 362 L 116 362 C 114 340, 112 318, 114 296 L 112 246 Z" />
            {/* Квадрицепс */}
            <path d="M 128 276 Q 124 282, 128 288" className="body-feature" />
            {/* Бедренная складка */}
            <path d="M 128 250 Q 122 254, 116 250" className="body-feature" />
            {/* Колено */}
            <ellipse cx="123" cy="298" rx="4" ry="3" className="body-feature" />
            {/* Коленная чашечка */}
            <ellipse cx="123" cy="298" rx="2.5" ry="2" className="body-feature" />
            {/* Голень (икра) */}
            <path d="M 130 362 L 132 392 C 134 406, 132 418, 130 428 L 118 428 C 116 418, 114 406, 116 392 L 114 362 Z" />
            {/* Икра */}
            <path d="M 128 388 Q 124 394, 128 400" className="body-feature" />
            {/* Лодыжка */}
            <ellipse cx="124" cy="426" rx="3" ry="2" className="body-feature" />
            {/* Стопа */}
            <ellipse cx="124" cy="436" rx="8" ry="4" className="body-feature" />
            {/* Пятка */}
            <ellipse cx="130" cy="436" rx="3" ry="2" className="body-feature" />
            {/* Пальцы правой ноги */}
            <ellipse cx="118" cy="440" rx="1.2" ry="2.5" className="body-feature" />
            <ellipse cx="121" cy="441" rx="1.2" ry="2.8" className="body-feature" />
            <ellipse cx="124" cy="442" rx="1.2" ry="3" className="body-feature" />
            <ellipse cx="127" cy="441" rx="1.2" ry="2.8" className="body-feature" />
            <ellipse cx="130" cy="440" rx="1.2" ry="2.5" className="body-feature" />
          </g>
        </svg>

        {/* Легенда телесных областей — только посещённые */}
        {visitedRegions.size > 0 && (
          <div className="body-legend">
            {SVG_REGIONS.filter((r) => visitedRegions.has(r)).map((region) => {
              const abnormal = hasAbnormal(region);
              return (
                <button
                  key={region}
                  className={`body-legend-item${activeRegion === region ? ' active' : ''}${abnormal ? ' abnormal' : ''}`}
                  onClick={() => handleClick(region)}
                >
                  <span className="body-legend-dot" />
                  {REGION_LABELS[region]}
                  {abnormal && <span className="body-legend-badge">!</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Отдельные кнопки: кожа, неврология, общий, спина */}
        <div className="body-extra-legend">
          {EXTRA_REGIONS.map((region) => {
            const count = regionFindings(region).length;
            const abnormal = hasAbnormal(region);
            if (count === 0) return null;
            return (
              <button
                key={region}
                className={`body-legend-item body-extra-item${activeRegion === region ? ' active' : ''}${abnormal ? ' abnormal' : ''}`}
                onClick={() => handleClick(region)}
              >
                <span className="body-legend-dot" />
                {REGION_LABELS[region]}
                {abnormal && <span className="body-legend-badge">!</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Панель находок */}
      {activeRegion && (
        <div className="body-findings-panel">
          <div className="body-findings-header">
            {REGION_LABELS[activeRegion]}
            <button className="body-findings-close" onClick={() => setActiveRegion(null)}>
              ✕
            </button>
          </div>
          <div className="body-findings-list">
            {regionFindings(activeRegion).length === 0 ? (
              <p className="body-findings-empty">Находок не выявлено</p>
            ) : (
              regionFindings(activeRegion).map((f, i) => (
                <div key={i} className={`body-finding${f.isAbnormal ? ' abnormal' : ''}`}>
                  <span className="body-finding-status">{f.isAbnormal ? '⚠️' : '✅'}</span>
                  {f.finding}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
