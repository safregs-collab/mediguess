import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import type { MetaNode, MetaLink, MetaLayer } from '../types';
import {
  LAYER_ORDER,
  LAYER_COLORS,
  LINK_TYPE_LABELS,
  CAUSAL_LINK_TYPES,
  STATUS_COLORS,
  STATUS_ICONS,
  type Vec2,
  normalize,
  clamp,
  wrapLabel,
  getValueStatus,
} from '../utils';
import { useSvgExport } from '../hooks/useSvgExport';
import { useI18n } from '../i18n';

interface MiniGraphProps {
  nodes: MetaNode[];
  links: MetaLink[];
  focusId: string;
  width?: number;
  height?: number;
  dark?: boolean;
  onExpand?: () => void;
  onNodeClick?: (nodeId: string) => void;
  title?: string;
}

const LAYER_RING_RADIUS: Record<MetaLayer, number> = {
  raw: 160, findings: 90, hypotheses: 0, differential: 220, evidence: 280,
};
const LAYER_RING_SPREAD: Record<MetaLayer, number> = {
  raw: 60, findings: 50, hypotheses: 0, differential: 40, evidence: 50,
};

const NODE_RADIUS = 16;
const LABEL_LINE_HEIGHT = 13;
const MIN_NODE_SPACING = 40;
const PADDING = 30;

export function MiniGraph({
  nodes, links, focusId, width: propWidth, height: propHeight, dark = true, onExpand, onNodeClick, title,
}: MiniGraphProps) {
  const { t } = useI18n();
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { exportSvg } = useSvgExport();

  const [containerSize, setContainerSize] = useState({
    width: propWidth ?? 900,
    height: propHeight ?? 520,
  });

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setContainerSize({
          width: cr.width,
          height: Math.min(propHeight ?? 520, cr.width * 0.6),
        });
      }
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [propHeight]);

  const { width, height } = containerSize;
  const [linkTooltip, setLinkTooltip] = useState<{
    link: MetaLink; srcLabel: string; tgtLabel: string; x: number; y: number;
  } | null>(null);
  const [nodeTooltip, setNodeTooltip] = useState<{
    node: MetaNode; x: number; y: number;
  } | null>(null);
  const [devFilterActive, setDevFilterActive] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressPos = useRef({ x: 0, y: 0 });

  const { displayNodes, displayLinks } = useMemo(() => {
    if (!devFilterActive) return { displayNodes: nodes, displayLinks: links };
    const includedIds = new Set<string>([focusId]);
    const includedLinks = new Set<MetaLink>();
    let changed = true;
    while (changed) {
      changed = false;
      for (const link of links) {
        if (!CAUSAL_LINK_TYPES.has(link.type)) continue;
        if (includedIds.has(link.target) && !includedIds.has(link.source)) {
          includedIds.add(link.source); includedLinks.add(link); changed = true;
        }
        if (includedIds.has(link.source) && includedIds.has(link.target) && !includedLinks.has(link)) {
          includedLinks.add(link); changed = true;
        }
      }
    }
    return {
      displayNodes: nodes.filter((n) => includedIds.has(n.id)),
      displayLinks: links.filter((l) => includedLinks.has(l)),
    };
  }, [devFilterActive, focusId, nodes, links]);

  const layout = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const nodeMap = new Map<string, MetaNode>();
    displayNodes.forEach((n) => nodeMap.set(n.id, n));

    const byLayer: Record<MetaLayer, MetaNode[]> = {
      raw: [], findings: [], hypotheses: [], differential: [], evidence: [],
    };
    displayNodes.forEach((n) => { if (byLayer[n.layer]) byLayer[n.layer].push(n); });

    const positions = new Map<string, Vec2>();
    const velocities = new Map<string, Vec2>();

    // Initial positions: ring layout around center
    LAYER_ORDER.forEach((layer) => {
      const layerNodes = byLayer[layer];
      const count = layerNodes.length;
      if (count === 0) return;
      const radius = LAYER_RING_RADIUS[layer];
      const spread = LAYER_RING_SPREAD[layer];

      if (layer === 'hypotheses') {
        layerNodes.forEach((n) => {
          positions.set(n.id, { x: cx, y: cy });
          velocities.set(n.id, { x: 0, y: 0 });
        });
        return;
      }

      const angleStep = (2 * Math.PI) / Math.max(count, 1);
      const startAngle = layer === 'raw' ? -Math.PI / 2 : layer === 'findings' ? -Math.PI / 2 + 0.3 : -Math.PI / 2 + 0.6;
      layerNodes.forEach((n, i) => {
        const angle = startAngle + i * angleStep + (Math.random() - 0.5) * 0.15;
        const r = radius + (Math.random() - 0.5) * spread;
        positions.set(n.id, { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
        velocities.set(n.id, { x: 0, y: 0 });
      });
    });

    // Force simulation
    const ITERATIONS = 120;
    for (let iter = 0; iter < ITERATIONS; iter++) {
      const forces = new Map<string, Vec2>();
      displayNodes.forEach((n) => forces.set(n.id, { x: 0, y: 0 }));

      // 1. Ring attraction (pull to layer ring)
      displayNodes.forEach((n) => {
        const pos = positions.get(n.id)!;
        const targetR = LAYER_RING_RADIUS[n.layer];
        const toCenter = { x: cx - pos.x, y: cy - pos.y };
        const d = Math.sqrt(toCenter.x * toCenter.x + toCenter.y * toCenter.y) || 1e-6;
        const diff = d - targetR;
        const f = diff * 0.008;
        const dir = normalize(toCenter);
        forces.get(n.id)!.x += dir.x * f;
        forces.get(n.id)!.y += dir.y * f;
      });

      // 2. Node repulsion
      for (let i = 0; i < displayNodes.length; i++) {
        for (let j = i + 1; j < displayNodes.length; j++) {
          const a = displayNodes[i], b = displayNodes[j];
          const pa = positions.get(a.id)!, pb = positions.get(b.id)!;
          const dx = pb.x - pa.x, dy = pb.y - pa.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1e-6;
          const minD = MIN_NODE_SPACING + (a.layer === b.layer ? 8 : 0);
          if (d < minD) {
            const f = (minD - d) / d * 1.5;
            const fx = (dx / d) * f, fy = (dy / d) * f;
            forces.get(a.id)!.x -= fx; forces.get(a.id)!.y -= fy;
            forces.get(b.id)!.x += fx; forces.get(b.id)!.y += fy;
          }
        }
      }

      // 3. Link spring (attract connected nodes)
      displayLinks.forEach((link) => {
        const a = positions.get(link.source), b = positions.get(link.target);
        if (!a || !b) return;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1e-6;
        const ideal = link.type === 'key_marker' ? 70 : link.type === 'supports' ? 90 : 110;
        const f = (d - ideal) / d * 0.04;
        const fx = (dx / d) * f, fy = (dy / d) * f;
        forces.get(link.source)!.x += fx; forces.get(link.source)!.y += fy;
        forces.get(link.target)!.x -= fx; forces.get(link.target)!.y -= fy;
      });

      // 4. Center gravity for hypotheses
      const hypoNodes = byLayer['hypotheses'];
      hypoNodes.forEach((n) => {
        const pos = positions.get(n.id)!;
        const toCenter = { x: cx - pos.x, y: cy - pos.y };
        forces.get(n.id)!.x += toCenter.x * 0.02;
        forces.get(n.id)!.y += toCenter.y * 0.02;
      });

      // Apply forces with damping
      const damping = 0.55;
      displayNodes.forEach((n) => {
        const pos = positions.get(n.id)!;
        const f = forces.get(n.id)!;
        pos.x += f.x * damping;
        pos.y += f.y * damping;
        // Keep in bounds
        pos.x = clamp(pos.x, PADDING + NODE_RADIUS, width - PADDING - NODE_RADIUS);
        pos.y = clamp(pos.y, PADDING + NODE_RADIUS, height - PADDING - NODE_RADIUS);
      });
    }

    return { positions, nodeMap, byLayer };
  }, [displayNodes, displayLinks, width, height]);

  const { positions, nodeMap } = layout;

  const showLinkTooltip = useCallback((link: MetaLink, clientX: number, clientY: number) => {
    const src = nodeMap.get(link.source);
    const tgt = nodeMap.get(link.target);
    if (!src || !tgt) return;
    setLinkTooltip({ link, srcLabel: src.label, tgtLabel: tgt.label, x: clientX, y: clientY });
  }, [nodeMap]);

  const hideLinkTooltip = useCallback(() => setLinkTooltip(null), []);

  const showNodeTooltip = useCallback((node: MetaNode, clientX: number, clientY: number) => {
    setNodeTooltip({ node, x: clientX, y: clientY });
  }, []);

  const hideNodeTooltip = useCallback(() => setNodeTooltip(null), []);

  const handleLinkTouchStart = useCallback((e: React.TouchEvent, link: MetaLink) => {
    const touch = e.touches[0];
    longPressPos.current = { x: touch.clientX, y: touch.clientY };
    longPressTimer.current = setTimeout(() => {
      showLinkTooltip(link, touch.clientX, touch.clientY);
    }, 500);
  }, [showLinkTooltip]);

  const handleLinkTouchEnd = useCallback(() => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }, []);

  const handleLinkTouchMove = useCallback((e: React.TouchEvent) => {
    if (!longPressTimer.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - longPressPos.current.x;
    const dy = touch.clientY - longPressPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 15) {
      clearTimeout(longPressTimer.current); longPressTimer.current = null;
    }
  }, []);

  const bgColor = dark ? '#0f172a' : '#ffffff';
  const textColor = dark ? '#e2e8f0' : '#1e293b';
  const subTextColor = dark ? '#94a3b8' : '#64748b';
  const gridColor = dark ? '#1e293b' : '#f1f5f9';

  // Get connected ids for hover
  const hoveredConnected = useMemo(() => {
    if (!hoveredNodeId) return null;
    const connected = new Set<string>([hoveredNodeId]);
    links.forEach((l) => {
      if (l.source === hoveredNodeId) connected.add(l.target);
      if (l.target === hoveredNodeId) connected.add(l.source);
    });
    return connected;
  }, [hoveredNodeId, links]);

  if (displayNodes.length === 0) {
    return (
      <div className="mini-graph mini-graph--empty" style={{ color: subTextColor }}>
        <p>{t('meta.noGraphData')}</p>
      </div>
    );
  }

  return (
    <div className="mini-graph">
      <div className="mini-graph-toolbar">
        <button
          className={`mini-graph-filter-btn ${devFilterActive ? 'active' : ''}`}
          onClick={() => setDevFilterActive((v) => !v)}
          title={devFilterActive ? t('meta.fullGraph') : t('meta.diseaseProgression')}
        >
          {devFilterActive ? t('meta.fullGraph') : t('meta.diseaseProgression')}
        </button>
        <div className="mini-graph-toolbar-right">
          {onExpand && (
            <button className="mini-graph-expand-btn" onClick={onExpand} title={t('meta.expandGraph')}>
              ⛶
            </button>
          )}
          <button
            className="mini-graph-export-btn"
            onClick={() => {
              if (svgRef.current) {
                const safeTitle = (title || 'graph').replace(/[^a-zA-Z0-9\-_]/g, '_');
                exportSvg(svgRef.current, `${safeTitle}.png`);
              }
            }}
            title={t('meta.exportPng')}
          >
            💾
          </button>
        </div>
      </div>

      <div className="mini-graph-svg-wrap" ref={wrapRef}>
        <svg
          ref={svgRef}
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="mini-graph-svg"
          style={{ background: bgColor, borderRadius: 12 }}
        >
          {/* Subtle ring backgrounds */}
          {[160, 90, 220, 280].map((r, i) => (
            <circle
              key={`ring-${i}`}
              cx={width / 2}
              cy={height / 2}
              r={r}
              fill="none"
              stroke={gridColor}
              strokeWidth={1}
              opacity={0.15}
              strokeDasharray="4,6"
            />
          ))}

          {/* Layer labels around rings */}
          {(['findings', 'raw', 'differential', 'evidence'] as MetaLayer[]).map((layer) => {
            const r = LAYER_RING_RADIUS[layer];
            const angle = layer === 'findings' ? -Math.PI / 2
              : layer === 'raw' ? -Math.PI / 2 + 0.5
              : layer === 'differential' ? Math.PI / 2 - 0.3
              : Math.PI / 2 + 0.3;
            const x = width / 2 + Math.cos(angle) * (r + 20);
            const y = height / 2 + Math.sin(angle) * (r + 20);
            const labels: Record<MetaLayer, string> = {
              raw: t('meta.rawData'), findings: t('meta.findings'), hypotheses: t('meta.diagnosis'),
              differential: t('meta.differential'), evidence: t('meta.evidenceBase'),
            };
            return (
              <text
                key={`label-${layer}`}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize={9}
                fontWeight={600}
                fill={LAYER_COLORS[layer]}
                opacity={0.5}
              >
                {labels[layer]}
              </text>
            );
          })}

          {/* Links — hit detection */}
          {displayLinks.map((link, i) => {
            const src = positions.get(link.source);
            const tgt = positions.get(link.target);
            if (!src || !tgt) return null;
            const midX = (src.x + tgt.x) / 2, midY = (src.y + tgt.y) / 2;
            const d = `M ${src.x} ${src.y} Q ${midX} ${midY} ${tgt.x} ${tgt.y}`;
            return (
              <path
                key={`hit-${i}`}
                d={d}
                stroke="transparent"
                strokeWidth={14}
                fill="none"
                strokeLinecap="round"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => showLinkTooltip(link, e.clientX, e.clientY)}
                onMouseMove={(e) => showLinkTooltip(link, e.clientX, e.clientY)}
                onMouseLeave={hideLinkTooltip}
                onTouchStart={(e) => handleLinkTouchStart(e, link)}
                onTouchEnd={handleLinkTouchEnd}
                onTouchMove={handleLinkTouchMove}
              />
            );
          })}

          {/* Visible links */}
          {displayLinks.map((link, i) => {
            const src = positions.get(link.source);
            const tgt = positions.get(link.target);
            if (!src || !tgt) return null;
            const isFocusLink = link.source === focusId || link.target === focusId;
            const isHovered = hoveredNodeId && (link.source === hoveredNodeId || link.target === hoveredNodeId);
            const isConnected = hoveredConnected?.has(link.source) && hoveredConnected?.has(link.target);
            let color = isFocusLink ? '#fbbf24' : dark ? '#475569' : '#cbd5e1';
            let strokeWidth = isFocusLink ? 2.5 : 1.2;
            let opacity = isFocusLink ? 0.8 : dark ? 0.25 : 0.35;
            if (isHovered) {
              color = '#fbbf24'; strokeWidth = 3; opacity = 1;
            } else if (isConnected) {
              opacity = isFocusLink ? 0.8 : 0.5;
            } else if (hoveredNodeId) {
              opacity = 0.06;
            }
            const midX = (src.x + tgt.x) / 2, midY = (src.y + tgt.y) / 2;
            const d = `M ${src.x} ${src.y} Q ${midX} ${midY} ${tgt.x} ${tgt.y}`;
            return (
              <path
                key={`link-${i}`}
                d={d}
                stroke={color}
                strokeWidth={strokeWidth}
                opacity={opacity}
                fill="none"
                strokeDasharray={link.type === 'discriminates' ? '5,4' : undefined}
                strokeLinecap="round"
              />
            );
          })}

          {/* Nodes */}
          {displayNodes.map((node) => {
            const pos = positions.get(node.id);
            if (!pos) return null;
            const isFocus = node.id === focusId;
            const isHovered = node.id === hoveredNodeId;
            const color = LAYER_COLORS[node.layer];
            const r = isFocus ? 20 : NODE_RADIUS;
            const labelLines = wrapLabel(node.label, isFocus ? 16 : 12);
            const labelHeight = labelLines.length * LABEL_LINE_HEIGHT;
            const status = node.layer === 'raw' && node.value !== undefined
              ? getValueStatus(node.value, node.normal) : 'unknown';
            const statusIcon = STATUS_ICONS[status];
            const statusColor = STATUS_COLORS[status];
            let fill = isFocus ? color : dark ? '#1e293b' : '#fff';
            let stroke = color;
            let strokeWidth = isFocus ? 3 : 2;
            let opacity = 1;
            if (isHovered) {
              fill = color;
              stroke = '#fbbf24';
              strokeWidth = 4;
            } else if (hoveredNodeId && !hoveredConnected?.has(node.id)) {
              opacity = 0.15;
            }
            return (
              <g
                key={node.id}
                className={`mini-graph-node ${isFocus ? 'mini-graph-node--focus' : ''}`}
                style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
                tabIndex={onNodeClick ? 0 : -1}
                role="button"
                aria-label={`${node.label}${node.description ? ': ' + node.description : ''}`}
                onMouseEnter={(e) => { setHoveredNodeId(node.id); showNodeTooltip(node, e.clientX, e.clientY); }}
                onMouseMove={(e) => showNodeTooltip(node, e.clientX, e.clientY)}
                onMouseLeave={() => { setHoveredNodeId(null); hideNodeTooltip(); }}
                onClick={(e) => { e.stopPropagation(); onNodeClick?.(node.id); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNodeClick?.(node.id);
                  }
                }}
                opacity={opacity}
              >
                {/* Pulse ring for focus */}
                {isFocus && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={r + 6}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.5}
                    opacity={0.3}
                  >
                    <animate attributeName="r" values={`${r + 3};${r + 9};${r + 3}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.45;0.15;0.45" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Glow */}
                {(isHovered || isFocus) && (
                  <circle cx={pos.x} cy={pos.y} r={r + 8} fill={color} opacity={0.1} />
                )}
                {/* Main circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                />
                {/* Value or status icon inside */}
                {node.layer === 'raw' && node.value !== undefined ? (
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isFocus ? 10 : 9}
                    fontWeight={700}
                    fill={isFocus || isHovered ? '#0f172a' : statusColor}
                  >
                    {statusIcon}{node.value}
                  </text>
                ) : node.layer === 'hypotheses' ? (
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isFocus ? 11 : 9}
                    fontWeight={700}
                    fill={isFocus || isHovered ? '#0f172a' : color}
                  >
                    ?
                  </text>
                ) : null}
                {/* Label */}
                <g transform={`translate(${pos.x}, ${pos.y + r + 6})`}>
                  {labelLines.map((line, li) => (
                    <text
                      key={li}
                      x={0}
                      y={(li + 1) * LABEL_LINE_HEIGHT}
                      textAnchor="middle"
                      fontSize={isFocus ? 11 : 9}
                      fontWeight={isFocus || isHovered ? 600 : 400}
                      fill={isHovered ? textColor : subTextColor}
                    >
                      {line}
                    </text>
                  ))}
                </g>
                {/* Unit */}
                {node.layer === 'raw' && node.unit && (
                  <text
                    x={pos.x}
                    y={pos.y + r + 6 + labelHeight + 10}
                    textAnchor="middle"
                    fontSize={8}
                    fill={subTextColor}
                    opacity={0.6}
                  >
                    {node.unit}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Link Tooltip */}
        {linkTooltip && wrapRef.current && (
          <div
            className="link-tooltip"
            style={{
              left: Math.min(linkTooltip.x - wrapRef.current.getBoundingClientRect().left + 12,
                wrapRef.current.clientWidth - 220),
              top: Math.max(linkTooltip.y - wrapRef.current.getBoundingClientRect().top - 60, 8),
            }}
          >
            <div className="link-tooltip-header">
              <span className="link-tooltip-src">{linkTooltip.srcLabel}</span>
              <span className="link-tooltip-arrow">→</span>
              <span className="link-tooltip-tgt">{linkTooltip.tgtLabel}</span>
            </div>
            <div className="link-tooltip-body">
              <span className="link-tooltip-type">
                {LINK_TYPE_LABELS[linkTooltip.link.type] || linkTooltip.link.type}
              </span>
              <span className="link-tooltip-weight">
                {t('meta.weight')}: {(linkTooltip.link.weight * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {/* Node Tooltip */}
        {nodeTooltip && wrapRef.current && nodeTooltip.node.description && (
          <div
            className="node-tooltip"
            style={{
              left: Math.min(nodeTooltip.x - wrapRef.current.getBoundingClientRect().left + 16,
                wrapRef.current.clientWidth - 280),
              top: Math.max(nodeTooltip.y - wrapRef.current.getBoundingClientRect().top - 80, 8),
            }}
          >
            <div className="node-tooltip-title">{nodeTooltip.node.label}</div>
            <div className="node-tooltip-desc">{nodeTooltip.node.description}</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mini-graph-legend" style={{ background: dark ? '#1e293b' : '#f8fafc' }}>
        {LAYER_ORDER.map((layer) => (
          <div key={layer} className="mini-graph-legend-item">
            <span className="mini-graph-legend-dot" style={{ background: LAYER_COLORS[layer] }} />
            <span className="mini-graph-legend-label" style={{ color: subTextColor }}>
              {layer === 'raw' && t('meta.rawData')}
              {layer === 'findings' && t('meta.findings')}
              {layer === 'hypotheses' && t('meta.diagnosis')}
              {layer === 'differential' && t('meta.differential')}
              {layer === 'evidence' && t('meta.evidenceBase')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
