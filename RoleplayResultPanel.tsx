import { useState } from 'react';
import type { PhysicalFinding } from '../types/simulation';

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

const ZONE_MAP: Record<string, PhysicalFinding['region']> = {
  head: 'head',
  chest: 'chest',
  abdomen: 'abdomen',
  'left-arm': 'extremities',
  'right-arm': 'extremities',
  'left-leg': 'extremities',
  'right-leg': 'extremities',
};

const EXTRA_REGIONS = ['skin', 'neuro', 'general', 'back'] as const;

export function InteractiveBody({ findings, onRegionClick }: Props) {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [visitedRegions, setVisitedRegions] = useState<Set<string>>(new Set());

  const regionFindings = (region: string) =>
    findings.filter((f) => f.region === region);

  const hasAbnormal = (region: string) =>
    regionFindings(region).some((f) => f.isAbnormal);

  const handleZoneClick = (zone: string) => {
    const region = ZONE_MAP[zone];
    if (!region) return;
    setActiveRegion(region);
    setVisitedRegions((prev) => new Set(prev).add(region));
    onRegionClick?.(region);
  };

  const getZoneClass = (zone: string) => {
    const region = ZONE_MAP[zone];
    if (!region) return 'zone';
    const isActive = activeRegion === region;
    const isVisited = visitedRegions.has(region);
    const isAbnormal = hasAbnormal(region);
    let cls = 'zone';
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

        <svg viewBox="0 0 1500 1000" className="body-svg">
          {/* === BODY FILL === */}
          <path
            className="body-fill"
            d="M 742,46 L 726,52 L 718,60 L 713,71 L 710,92 L 703,100 L 705,125 L 718,139 L 720,170 L 714,175 L 686,185 L 672,195 L 649,203 L 640,212 L 634,224 L 630,264 L 619,305 L 616,341 L 598,394 L 593,468 L 571,496 L 555,530 L 564,532 L 573,522 L 575,523 L 567,562 L 569,566 L 574,567 L 576,575 L 580,576 L 584,572 L 590,574 L 596,568 L 603,567 L 614,524 L 619,467 L 655,389 L 659,336 L 666,317 L 669,316 L 677,356 L 678,387 L 660,472 L 658,572 L 663,613 L 672,649 L 668,700 L 660,728 L 660,757 L 678,835 L 682,872 L 681,893 L 670,930 L 670,943 L 682,951 L 695,953 L 714,952 L 717,946 L 719,893 L 710,851 L 710,831 L 720,766 L 717,707 L 723,690 L 725,662 L 737,618 L 749,532 L 761,617 L 773,661 L 775,689 L 781,706 L 778,738 L 779,777 L 788,829 L 788,853 L 779,896 L 781,943 L 785,952 L 804,953 L 828,943 L 827,926 L 817,891 L 817,860 L 839,748 L 838,726 L 830,698 L 831,683 L 826,657 L 840,575 L 838,470 L 820,384 L 822,350 L 829,316 L 832,317 L 839,335 L 841,376 L 845,395 L 879,466 L 885,529 L 895,567 L 903,568 L 908,574 L 914,572 L 922,575 L 924,568 L 931,563 L 924,523 L 934,532 L 941,532 L 943,528 L 929,499 L 905,467 L 900,392 L 882,340 L 880,310 L 868,263 L 867,237 L 862,218 L 848,202 L 826,195 L 813,185 L 779,171 L 781,139 L 783,134 L 793,127 L 796,101 L 788,92 L 787,74 L 781,59 L 766,48 Z"
          />

          {/* === BODY OUTLINE === */}
          <path
            className="body-outline"
            d="M 742,46 L 726,52 L 718,60 L 713,71 L 710,92 L 703,100 L 705,125 L 718,139 L 720,170 L 714,175 L 686,185 L 672,195 L 649,203 L 640,212 L 634,224 L 630,264 L 619,305 L 616,341 L 598,394 L 593,468 L 571,496 L 555,530 L 564,532 L 573,522 L 575,523 L 567,562 L 569,566 L 574,567 L 576,575 L 580,576 L 584,572 L 590,574 L 596,568 L 603,567 L 614,524 L 619,467 L 655,389 L 659,336 L 666,317 L 669,316 L 677,356 L 678,387 L 660,472 L 658,572 L 663,613 L 672,649 L 668,700 L 660,728 L 660,757 L 678,835 L 682,872 L 681,893 L 670,930 L 670,943 L 682,951 L 695,953 L 714,952 L 717,946 L 719,893 L 710,851 L 710,831 L 720,766 L 717,707 L 723,690 L 725,662 L 737,618 L 749,532 L 761,617 L 773,661 L 775,689 L 781,706 L 778,738 L 779,777 L 788,829 L 788,853 L 779,896 L 781,943 L 785,952 L 804,953 L 828,943 L 827,926 L 817,891 L 817,860 L 839,748 L 838,726 L 830,698 L 831,683 L 826,657 L 840,575 L 838,470 L 820,384 L 822,350 L 829,316 L 832,317 L 839,335 L 841,376 L 845,395 L 879,466 L 885,529 L 895,567 L 903,568 L 908,574 L 914,572 L 922,575 L 924,568 L 931,563 L 924,523 L 934,532 L 941,532 L 943,528 L 929,499 L 905,467 L 900,392 L 882,340 L 880,310 L 868,263 L 867,237 L 862,218 L 848,202 L 826,195 L 813,185 L 779,171 L 781,139 L 783,134 L 793,127 L 796,101 L 788,92 L 787,74 L 781,59 L 766,48 Z"
          />

          {/* === ANATOMY DETAILS === */}
          <g className="body-anatomy">
            <path d="M 734,126 Q 709,186 649,183" />
            <path d="M 764,126 Q 789,186 849,183" />
            <path d="M 749,131 L 749,276" />
            <path d="M 659,216 Q 719,226 739,221" />
            <path d="M 839,216 Q 779,226 759,221" />
            <path d="M 664,241 Q 714,256 739,246" />
            <path d="M 834,241 Q 784,256 759,246" />
            <path d="M 669,266 Q 719,281 739,271" />
            <path d="M 829,266 Q 779,281 759,271" />
            <path d="M 745,336 A 4,3 0 0,1 753,336 A 4,3 0 0,1 745,336" />
            <path d="M 724,416 Q 739,431 749,426 Q 759,431 774,416" />
            <path d="M 619,275 Q 624,278 619,281" />
            <path d="M 879,275 Q 874,278 879,281" />
            <path d="M 694,606 A 7,6 0 0,1 708,606 A 7,6 0 0,1 694,606" />
            <path d="M 790,606 A 7,6 0 0,1 804,606 A 7,6 0 0,1 790,606" />
            <path d="M 704,923 A 3,3 0 0,1 710,923 A 3,3 0 0,1 704,923" />
            <path d="M 788,923 A 3,3 0 0,1 794,923 A 3,3 0 0,1 788,923" />
          </g>

          {/* ===== HEAD ===== */}
          <path
            className={getZoneClass('head')}
            data-zone="head"
            onClick={() => handleZoneClick('head')}
            d="M 742,46 L 726,52 L 718,60 L 713,71 L 710,92 L 703,100 L 705,125 L 718,139 L 720,170 L 714,175 L 749,180 L 779,171 L 781,139 L 783,134 L 793,127 L 796,101 L 788,92 L 787,74 L 781,59 L 766,48 Z"
          />

          {/* ===== CHEST ===== */}
          <path
            className={getZoneClass('chest')}
            data-zone="chest"
            onClick={() => handleZoneClick('chest')}
            d="M 714,175 L 686,185 L 672,195 L 649,203 L 640,212 L 634,224 L 749,230 L 862,218 L 848,202 L 826,195 L 813,185 L 779,171 Z"
          />

          {/* ===== ABDOMEN (large, by contour) ===== */}
          <path
            className={getZoneClass('abdomen')}
            data-zone="abdomen"
            onClick={() => handleZoneClick('abdomen')}
            d="M 634,224 L 630,264 L 619,305 L 616,341 L 749,341 L 882,340 L 880,310 L 868,263 L 867,237 L 862,218 Z"
          />

          {/* ===== LEFT ARM ===== */}
          <path
            className={getZoneClass('left-arm')}
            data-zone="left-arm"
            onClick={() => handleZoneClick('left-arm')}
            d="M 714,175 L 686,185 L 672,195 L 649,203 L 640,212 L 634,224 L 619,305 L 616,341 L 630,264 L 634,224 Z"
          />

          {/* ===== RIGHT ARM ===== */}
          <path
            className={getZoneClass('right-arm')}
            data-zone="right-arm"
            onClick={() => handleZoneClick('right-arm')}
            d="M 779,171 L 813,185 L 826,195 L 848,202 L 862,218 L 867,237 L 880,310 L 882,340 L 868,263 L 862,218 Z"
          />

          {/* ===== LEFT LEG (by contour) ===== */}
          <path
            className={getZoneClass('left-leg')}
            data-zone="left-leg"
            onClick={() => handleZoneClick('left-leg')}
            d="M 616,341 L 598,394 L 593,468 L 571,496 L 555,530 L 564,532 L 573,522 L 575,523 L 567,562 L 569,566 L 574,567 L 576,575 L 580,576 L 584,572 L 590,574 L 596,568 L 603,567 L 614,524 L 619,467 L 655,389 L 659,336 L 666,317 L 669,316 Z"
          />

          {/* ===== RIGHT LEG (by contour) ===== */}
          <path
            className={getZoneClass('right-leg')}
            data-zone="right-leg"
            onClick={() => handleZoneClick('right-leg')}
            d="M 882,340 L 900,392 L 905,467 L 929,499 L 943,528 L 941,532 L 934,532 L 924,523 L 931,563 L 924,568 L 922,575 L 914,572 L 908,574 L 903,568 L 895,567 L 885,529 L 879,466 L 845,395 L 841,376 L 839,335 L 832,317 L 829,316 Z"
          />

          {/* ===== ANCHOR DOTS ===== */}
          <circle className="body-anchor" data-anchor="head" cx="749" cy="71" r="8" />
          <circle className="body-anchor" data-anchor="chest" cx="749" cy="263" r="8" />
          <circle className="body-anchor" data-anchor="abdomen" cx="749" cy="336" r="8" />
          <circle className="body-anchor" data-anchor="left-arm" cx="619" cy="278" r="8" />
          <circle className="body-anchor" data-anchor="right-arm" cx="879" cy="278" r="8" />
          <circle className="body-anchor" data-anchor="left-leg" cx="719" cy="606" r="8" />
          <circle className="body-anchor" data-anchor="right-leg" cx="779" cy="606" r="8" />

          {/* ===== ZONE LABELS ===== */}
          <text className="body-zone-label" data-label="head" x="799" y="76">Голова</text>
          <text className="body-zone-label" data-label="chest" x="799" y="263">Грудная клетка</text>
          <text className="body-zone-label" data-label="abdomen" x="799" y="336">Живот</text>
          <text className="body-zone-label" data-label="left-arm" x="559" y="278">Левая рука</text>
          <text className="body-zone-label" data-label="right-arm" x="909" y="278">Правая рука</text>
          <text className="body-zone-label" data-label="left-leg" x="669" y="606">Левая нога</text>
          <text className="body-zone-label" data-label="right-leg" x="799" y="606">Правая нога</text>
        </svg>

        <div className="body-legend">
          {(['head', 'chest', 'abdomen', 'extremities'] as const).map((region) => {
            const rf = regionFindings(region);
            const isAbnormal = rf.some((f) => f.isAbnormal);
            const isActive = activeRegion === region;
            return (
              <button
                key={region}
                className={`body-legend-item${isActive ? ' active' : ''}${isAbnormal ? ' abnormal' : ''}`}
                onClick={() => {
                  setActiveRegion(region);
                  setVisitedRegions((prev) => new Set(prev).add(region));
                  onRegionClick?.(region);
                }}
              >
                <span className="body-legend-dot" />
                {REGION_LABELS[region]}
                {isAbnormal && (
                  <span className="body-legend-badge">
                    {rf.filter((f) => f.isAbnormal).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="body-extra-legend">
          {EXTRA_REGIONS.map((region) => {
            const rf = regionFindings(region);
            const isAbnormal = rf.some((f) => f.isAbnormal);
            if (rf.length === 0) return null;
            const isActive = activeRegion === region;
            return (
              <button
                key={region}
                className={`body-legend-item body-extra-item${isActive ? ' active' : ''}${isAbnormal ? ' abnormal' : ''}`}
                onClick={() => {
                  setActiveRegion(region);
                  setVisitedRegions((prev) => new Set(prev).add(region));
                  onRegionClick?.(region);
                }}
              >
                <span className="body-legend-dot" />
                {REGION_LABELS[region]}
                {isAbnormal && (
                  <span className="body-legend-badge">
                    {rf.filter((f) => f.isAbnormal).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="body-findings">
        {activeRegion && (
          <div className="findings-panel">
            <h4>{REGION_LABELS[activeRegion]}</h4>
            {regionFindings(activeRegion).length === 0 ? (
              <p className="no-findings">Находок не выявлено</p>
            ) : (
              regionFindings(activeRegion).map((f, i) => (
                <div
                  key={f.id ?? f.finding ?? i}
                  className={`finding-item ${f.isAbnormal ? 'abnormal' : ''}`}
                >
                  <div className="finding-header">
                    <span className="finding-type">{f.type}</span>
                    {f.isAbnormal && <span className="finding-badge">Отклонение</span>}
                  </div>
                  <p className="finding-description">{f.description}</p>
                  {f.value && (
                    <div className="finding-value">
                      <span className="value-label">Значение:</span>
                      <span className={`value-data ${f.isAbnormal ? 'abnormal' : ''}`}>
                        {f.value}
                      </span>
                      {f.referenceRange && (
                        <span className="value-ref">(норма: {f.referenceRange})</span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
