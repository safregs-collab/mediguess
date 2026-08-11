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
          {/* === BODY FILL === */}
          <path className="body-fill" d="M99,7L97,8L96,10L95,11L95,15L94,16L94,20L96,22L96,27L95,28L91,29L90,30L87,31L86,32L85,34L84,42L83,49L82,55L80,63L79,75L77,80L76,86L75,91L74,97L73,102L72,108L71,113L70,119L69,124L68,130L67,135L66,141L65,146L64,152L63,157L62,163L61,168L60,174L59,179L58,185L57,190L56,196L55,201L54,207L53,212L52,218L51,223L50,229L49,234L48,240L47,245L46,251L45,256L44,262L43,267L42,273L41,278L40,284L39,289L38,295L37,300L36,306L35,311L34,317L33,322L32,328L31,333L30,339L29,344L28,350L27,355L26,361L25,366L24,372L23,377L22,383L21,388L20,394L19,399L18,401L18,402L18,403L19,403L19,402L20,401L20,400L21,398L21,397L22,395L22,394L23,392L23,391L24,389L24,388L25,386L25,385L26,383L26,382L27,380L27,379L28,377L28,376L29,374L29,373L30,371L30,370L31,368L31,367L32,365L32,364L33,362L33,361L34,359L34,358L35,356L35,355L36,353L36,352L37,350L37,349L38,347L38,346L39,344L39,343L40,341L40,340L41,338L41,337L42,335L42,334L43,332L43,331L44,329L44,328L45,326L45,325L46,323L46,322L47,320L47,319L48,317L48,316L49,314L49,313L50,311L50,310L51,308L51,307L52,305L52,304L53,302L53,301L54,299L54,298L55,296L55,295L56,293L56,292L57,290L57,289L58,287L58,286L59,284L59,283L60,281L60,280L61,278L61,277L62,275L62,274L63,272L63,271L64,269L64,268L65,266L65,265L66,263L66,262L67,260L67,259L68,257L68,256L69,254L69,253L70,251L70,250L71,248L71,247L72,245L72,244L73,242L73,241L74,239L74,238L75,236L75,235L76,233L76,232L77,230L77,229L78,227L78,226L79,224L79,223L80,221L80,220L81,218L81,217L82,215L82,214L83,212L83,211L84,209L84,208L85,206L85,205L86,203L86,202L87,200L87,199L88,197L88,196L89,194L89,193L90,191L90,190L91,188L91,187L92,185L92,184L93,182L93,181L94,179L94,178L95,176L95,175L96,173L96,172L97,170L97,169L98,167L98,166L99,164L99,163L100,161L100,160L101,158L101,157L102,155L102,154L103,152L103,151L104,149L104,148L105,146L105,145L106,143L106,142L107,140L107,139L108,137L108,136L109,134L109,133L110,131L110,130L111,128L111,127L112,125L112,124L113,122L113,121L114,119L114,118L115,116L115,115L116,113L116,112L117,110L117,109L118,107L118,106L119,104L119,103L120,101L120,100L121,98L121,97L122,95L122,94L123,92L123,91L124,89L124,88L125,86L125,85L126,83L126,82L127,80L127,79L128,77L128,76L129,74L129,73L130,71L130,70L131,68L131,67L132,65L132,64L133,62L133,61L134,59L134,58L135,56L135,55L136,53L136,52L137,50L137,49L138,47L138,46L139,44L139,43L140,41L140,40L141,38L141,37L142,35L142,34L143,32L143,31L144,29L144,28L145,26L145,25L146,23L146,22L147,20L147,19L148,17L148,16L149,14L149,13L150,11L150,10L151,8L151,7L152,5L152,4L153,2L153,1L154,0L154,0L155,0L155,0L156,0L156,0L157,0L157,0L158,0L158,0L159,0L159,0L160,0L160,0L161,0L161,0L162,0L162,0L163,0L163,0L164,0L164,0L165,0L165,0L166,0L166,0L167,0L167,0L168,0L168,0L169,0L169,0L170,0L170,0L171,0L171,0L172,0L172,0L173,0L173,0L174,0L174,0L175,0L175,0L176,0L176,0L177,0L177,0L178,0L178,0L179,0L179,0L180,0L180,0L181,0L181,0L182,0L182,0L183,0L183,0L184,0L184,0L185,0L185,0L186,0L186,0L187,0L187,0L188,0L188,0L189,0L189,0L190,0L190,0L191,0L191,0L192,0L192,0L193,0L193,0L194,0L194,0L195,0L195,0L196,0L196,0L197,0L197,0L198,0L198,0L199,0L199,0L200,0Z" />

          {/* === BODY OUTLINE (exact trace from your PNG) === */}
          <path className="body-outline" d="M99,7L97,8L96,10L95,11L95,15L94,16L94,20L96,22L96,27L95,28L91,29L90,30L87,31L86,32L85,34L84,42L83,49L82,55L80,63L79,75L77,80L76,86L75,91L74,97L73,102L72,108L71,113L70,119L69,124L68,130L67,135L66,141L65,146L64,152L63,157L62,163L61,168L60,174L59,179L58,185L57,190L56,196L55,201L54,207L53,212L52,218L51,223L50,229L49,234L48,240L47,245L46,251L45,256L44,262L43,267L42,273L41,278L40,284L39,289L38,295L37,300L36,306L35,311L34,317L33,322L32,328L31,333L30,339L29,344L28,350L27,355L26,361L25,366L24,372L23,377L22,383L21,388L20,394L19,399L18,401L18,402L18,403L19,403L19,402L20,401L20,400L21,398L21,397L22,395L22,394L23,392L23,391L24,389L24,388L25,386L25,385L26,383L26,382L27,380L27,379L28,377L28,376L29,374L29,373L30,371L30,370L31,368L31,367L32,365L32,364L33,362L33,361L34,359L34,358L35,356L35,355L36,353L36,352L37,350L37,349L38,347L38,346L39,344L39,343L40,341L40,340L41,338L41,337L42,335L42,334L43,332L43,331L44,329L44,328L45,326L45,325L46,323L46,322L47,320L47,319L48,317L48,316L49,314L49,313L50,311L50,310L51,308L51,307L52,305L52,304L53,302L53,301L54,299L54,298L55,296L55,295L56,293L56,292L57,290L57,289L58,287L58,286L59,284L59,283L60,281L60,280L61,278L61,277L62,275L62,274L63,272L63,271L64,269L64,268L65,266L65,265L66,263L66,262L67,260L67,259L68,257L68,256L69,254L69,253L70,251L70,250L71,248L71,247L72,245L72,244L73,242L73,241L74,239L74,238L75,236L75,235L76,233L76,232L77,230L77,229L78,227L78,226L79,224L79,223L80,221L80,220L81,218L81,217L82,215L82,214L83,212L83,211L84,209L84,208L85,206L85,205L86,203L86,202L87,200L87,199L88,197L88,196L89,194L89,193L90,191L90,190L91,188L91,187L92,185L92,184L93,182L93,181L94,179L94,178L95,176L95,175L96,173L96,172L97,170L97,169L98,167L98,166L99,164L99,163L100,161L100,160L101,158L101,157L102,155L102,154L103,152L103,151L104,149L104,148L105,146L105,145L106,143L106,142L107,140L107,139L108,137L108,136L109,134L109,133L110,131L110,130L111,128L111,127L112,125L112,124L113,122L113,121L114,119L114,118L115,116L115,115L116,113L116,112L117,110L117,109L118,107L118,106L119,104L119,103L120,101L120,100L121,98L121,97L122,95L122,94L123,92L123,91L124,89L124,88L125,86L125,85L126,83L126,82L127,80L127,79L128,77L128,76L129,74L129,73L130,71L130,70L131,68L131,67L132,65L132,64L133,62L133,61L134,59L134,58L135,56L135,55L136,53L136,52L137,50L137,49L138,47L138,46L139,44L139,43L140,41L140,40L141,38L141,37L142,35L142,34L143,32L143,31L144,29L144,28L145,26L145,25L146,23L146,22L147,20L147,19L148,17L148,16L149,14L149,13L150,11L150,10L151,8L151,7L152,5L152,4L153,2L153,1L154,0L154,0L155,0L155,0L156,0L156,0L157,0L157,0L158,0L158,0L159,0L159,0L160,0L160,0L161,0L161,0L162,0L162,0L163,0L163,0L164,0L164,0L165,0L165,0L166,0L166,0L167,0L167,0L168,0L168,0L169,0L169,0L170,0L170,0L171,0L171,0L172,0L172,0L173,0L173,0L174,0L174,0L175,0L175,0L176,0L176,0L177,0L177,0L178,0L178,0L179,0L179,0L180,0L180,0L181,0L181,0L182,0L182,0L183,0L183,0L184,0L184,0L185,0L185,0L186,0L186,0L187,0L187,0L188,0L188,0L189,0L189,0L190,0L190,0L191,0L191,0L192,0L192,0L193,0L193,0L194,0L194,0L195,0L195,0L196,0L196,0L197,0L197,0L198,0L198,0L199,0L199,0L200,0Z" />

          {/* === ANATOMICAL DETAILS === */}
          <g className="body-anatomy">
            {/* Clavicles */}
            <path d="M98,20Q95,30 87,29" />
            <path d="M102,20Q105,30 113,29" />
            {/* Sternum line */}
            <path d="M100,21L100,44" />
            {/* Ribs - left */}
            <path d="M88,34Q96,36 99,35" />
            <path d="M88,38Q96,41 99,39" />
            <path d="M89,43Q96,45 99,43" />
            {/* Ribs - right */}
            <path d="M112,34Q104,36 101,35" />
            <path d="M112,38Q104,41 101,39" />
            <path d="M111,43Q104,45 101,43" />
            {/* Navel */}
            <path d="M99,54A0.5,0.4 0 0,1 101,54A0.5,0.4 0 0,1 99,54" />
            {/* Inguinal folds */}
            <path d="M97,67Q98,69 100,68Q102,69 103,67" />
            {/* Elbow creases */}
            <path d="M83,44Q83,44 83,45" />
            <path d="M117,44Q117,44 117,45" />
            {/* Knee caps */}
            <path d="M93,97A0.9,0.8 0 0,1 95,97A0.9,0.8 0 0,1 93,97" />
            <path d="M105,97A0.9,0.8 0 0,1 107,97A0.9,0.8 0 0,1 105,97" />
            {/* Ankles */}
            <path d="M94,148A0.4,0.4 0 0,1 95,148A0.4,0.4 0 0,1 94,148" />
            <path d="M105,148A0.4,0.4 0 0,1 106,148A0.4,0.4 0 0,1 105,148" />
          </g>

          {/* ===== HEAD + NECK ===== */}
          <g className={getZoneClass('head')} onClick={() => handleClick('head')}>
            <path d="M95,7C95,6 96,4 100,4C103,4 105,6 105,7C105,11 104,15 101,19C99,20 96,20 94,19C91,15 90,11 90,7Z" />
          </g>

          {/* ===== CHEST ===== */}
          <g className={getZoneClass('chest')} onClick={() => handleClick('chest')}>
            <path d="M86,31L86,43L98,52L102,52L114,43L114,31Q103,28 100,28Q97,28 86,31Z" />
          </g>

          {/* ===== ABDOMEN ===== */}
          <g className={getZoneClass('abdomen')} onClick={() => handleClick('abdomen')}>
            <path d="M98,53L97,70L100,71L103,70L102,53Z" />
          </g>

          {/* ===== EXTREMITIES ===== */}
          <g className={getZoneClass('extremities')} onClick={() => handleClick('extremities')}>
            {/* Left arm */}
            <path d="M85,31L83,40L82,50L80,59L84,63L85,59L87,50L88,40L88,31Z" />
            {/* Right arm */}
            <path d="M115,31L117,40L118,50L120,59L116,63L115,59L113,50L112,40L112,31Z" />
            {/* Left leg */}
            <path d="M97,71L95,81L94,94L94,107L95,116L95,149L97,151L99,149L100,116L100,107L101,94L101,81L99,71Z" />
            {/* Right leg */}
            <path d="M103,71L105,81L105,94L106,107L105,116L105,149L103,151L101,149L100,116L100,107L99,94L99,81L101,71Z" />
          </g>

          {/* ===== ANCHOR DOTS ===== */}
          <circle className="body-anchor" data-anchor="head" cx="100" cy="12" r="2.5" />
          <circle className="body-anchor" data-anchor="chest" cx="100" cy="40" r="2.5" />
          <circle className="body-anchor" data-anchor="abdomen" cx="100" cy="62" r="2.5" />
          <circle className="body-anchor" data-anchor="extremities" cx="85" cy="97" r="2.5" />
          <circle className="body-anchor" data-anchor="extremities" cx="115" cy="97" r="2.5" />

          {/* ===== ZONE LABELS ===== */}
          <text className="body-zone-label" data-label="head" x="108" y="13">Голова</text>
          <text className="body-zone-label" data-label="chest" x="108" y="41">Грудная клетка</text>
          <text className="body-zone-label" data-label="abdomen" x="108" y="63">Живот</text>
          <text className="body-zone-label" data-label="extremities" x="70" y="98">Руки</text>
          <text className="body-zone-label" data-label="extremities" x="120" y="98">Ноги</text>
        </svg>
      </div>

      <div className="body-legend">
        {SVG_REGIONS.map((region) => {
          const rf = regionFindings(region);
          const isAbnormal = rf.some((f) => f.isAbnormal);
          return (
            <div key={region} className="legend-item">
              <span className={`legend-dot ${isAbnormal ? 'abnormal' : 'normal'}`} />
              <span className="legend-text">{REGION_LABELS[region]}</span>
              {isAbnormal && <span className="legend-badge">{rf.filter((f) => f.isAbnormal).length}</span>}
            </div>
          );
        })}
        {EXTRA_REGIONS.map((region) => {
          const rf = regionFindings(region);
          const isAbnormal = rf.some((f) => f.isAbnormal);
          if (rf.length === 0) return null;
          return (
            <div key={region} className="legend-item">
              <span className={`legend-dot ${isAbnormal ? 'abnormal' : 'normal'}`} />
              <span className="legend-text">{REGION_LABELS[region]}</span>
              {isAbnormal && <span className="legend-badge">{rf.filter((f) => f.isAbnormal).length}</span>}
            </div>
          );
        })}
      </div>

      <div className="body-findings">
        {activeRegion && (
          <div className="findings-panel">
            <h4>{REGION_LABELS[activeRegion]}</h4>
            {regionFindings(activeRegion).length === 0 ? (
              <p className="no-findings">Нет данных для этой зоны</p>
            ) : (
              regionFindings(activeRegion).map((finding) => (
                <div key={finding.id} className={`finding-item ${finding.isAbnormal ? 'abnormal' : ''}`}>
                  <div className="finding-header">
                    <span className="finding-type">{finding.type}</span>
                    {finding.isAbnormal && <span className="finding-badge">Отклонение</span>}
                  </div>
                  <p className="finding-description">{finding.description}</p>
                  {finding.value && (
                    <div className="finding-value">
                      <span className="value-label">Значение:</span>
                      <span className={`value-data ${finding.isAbnormal ? 'abnormal' : ''}`}>{finding.value}</span>
                      {finding.referenceRange && (
                        <span className="value-ref">(норма: {finding.referenceRange})</span>
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
