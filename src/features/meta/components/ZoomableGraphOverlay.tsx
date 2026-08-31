import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { MetaNode, MetaLink, MetaLayer, MetaDiagnosisDetail } from '../types';
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
import { NodeDetailPanel } from './NodeDetailPanel';
import { useSvgExport } from '../hooks/useSvgExport';
import { useI18n } from '../i18n';

interface ZoomableGraphOverlayProps {
  nodes: MetaNode[];
  links: MetaLink[];
  focusId: string;
  title?: string;
  details?: Record<string, MetaDiagnosisDetail>;
  onClose: () => void;
}

const LAYER_RING_RADIUS: Record<MetaLayer, number> = {
  raw: 220, findings: 120, hypotheses: 0, differential: 320, evidence: 400,
};
const LAYER_RING_SPREAD: Record<MetaLayer, number> = {
  raw: 80, findings: 70, hypotheses: 0, differential: 60, evidence: 70,
};

const NODE_RADIUS = 18;
const LABEL_LINE_HEIGHT = 14;
const MIN_NODE_SPACING = 50;
const PADDING = 40;

export function ZoomableGraphOverlay({ nodes, links, focusId, title, details, onClose }: ZoomableGraphOverlayProps) {
  const { t } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const { exportSvg } = useSvgExport();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [linkTooltip, setLinkTooltip] = useState<{ link: MetaLink; x: number; y: number } | null>(null);
  const [nodeTooltip, setNodeTooltip] = useState<{ node: MetaNode; x: number; y: number } | null>(null);

  const [devFilterActive, setDevFilterActive] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Set<MetaLayer>>(new Set(LAYER_ORDER));

  const [, setAnimFrame] = useState(0);
  const animTime = useRef(0);
  const animRef = useRef<number | null>(null);

  const width = 1400;
  const height = 900;

  useEffect(() => {
    const loop = (t: number) => {
      animTime.current = t;
      setAnimFrame((f) => f + 1);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const { displayNodes, displayLinks } = useMemo(() => {
    let filteredNodes = nodes.filter((n) => activeLayers.has(n.layer));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filteredNodes = filteredNodes.filter((n) =>
        n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)
      );
    }
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    let filteredLinks = links.filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target));

    if (devFilterActive) {
      const includedIds = new Set<string>([focusId]);
      const includedLinks = new Set<MetaLink>();
      let changed = true;
      while (changed) {
        changed = false;
        for (const link of filteredLinks) {
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
        displayNodes: filteredNodes.filter((n) => includedIds.has(n.id)),
        displayLinks: filteredLinks.filter((l) => includedLinks.has(l)),
      };
    }

    return { displayNodes: filteredNodes, displayLinks: filteredLinks };
  }, [nodes, links, focusId, activeLayers, searchQuery, devFilterActive]);

  const layout = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const nodeMap = new Map<string, MetaNode>();
    displayNodes.forEach((n) => nodeMap.set(n.id, n));

    const byLayer: Record<MetaLayer, MetaNode[]> = {
      raw: [], findings: [], hypotheses: [], differential: [], evidence: [],
    };
    displayNodes.forEach((n) => { if (byLayer[n.layer]) byLayer[n.layer].push(n); });

    const positions = new Map<string, Vec2>();

    LAYER_ORDER.forEach((layer) => {
      const layerNodes = byLayer[layer];
      const count = layerNodes.length;
      if (count === 0) return;
      const radius = LAYER_RING_RADIUS[layer];
      const spread = LAYER_RING_SPREAD[layer];

      if (layer === 'hypotheses') {
        layerNodes.forEach((n) => { positions.set(n.id, { x: cx, y: cy }); });
        return;
      }

      const angleStep = (2 * Math.PI) / Math.max(count, 1);
      const startAngle = layer === 'raw' ? -Math.PI / 2 : layer === 'findings' ? -Math.PI / 2 + 0.3 : -Math.PI / 2 + 0.6;
      layerNodes.forEach((n, i) => {
        const angle = startAngle + i * angleStep + (Math.random() - 0.5) * 0.15;
        const r = radius + (Math.random() - 0.5) * spread;
        positions.set(n.id, { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
      });
    });

    const ITERATIONS = 150;
    for (let iter = 0; iter < ITERATIONS; iter++) {
      const forces = new Map<string, Vec2>();
      displayNodes.forEach((n) => forces.set(n.id, { x: 0, y: 0 }));

      displayNodes.forEach((n) => {
        const pos = positions.get(n.id)!;
        const targetR = LAYER_RING_RADIUS[n.layer];
        const toCenter = { x: cx - pos.x, y: cy - pos.y };
        const d = Math.sqrt(toCenter.x * toCenter.x + toCenter.y * toCenter.y) || 1e-6;
        const diff = d - targetR;
        const f = diff * 0.006;
        const dir = normalize(toCenter);
        forces.get(n.id)!.x += dir.x * f;
        forces.get(n.id)!.y += dir.y * f;
      });

      for (let i = 0; i < displayNodes.length; i++) {
        for (let j = i + 1; j < displayNodes.length; j++) {
          const a = displayNodes[i], b = displayNodes[j];
          const pa = positions.get(a.id)!, pb = positions.get(b.id)!;
          const dx = pb.x - pa.x, dy = pb.y - pa.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1e-6;
          const minD = MIN_NODE_SPACING + (a.layer === b.layer ? 10 : 0);
          if (d < minD) {
            const f = (minD - d) / d * 1.8;
            const fx = (dx / d) * f, fy = (dy / d) * f;
            forces.get(a.id)!.x -= fx; forces.get(a.id)!.y -= fy;
            forces.get(b.id)!.x += fx; forces.get(b.id)!.y += fy;
          }
        }
      }

      displayLinks.forEach((link) => {
        const a = positions.get(link.source), b = positions.get(link.target);
        if (!a || !b) return;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1e-6;
        const ideal = link.type === 'key_marker' ? 90 : link.type === 'supports' ? 120 : 140;
        const f = (d - ideal) / d * 0.035;
        const fx = (dx / d) * f, fy = (dy / d) * f;
        forces.get(link.source)!.x += fx; forces.get(link.source)!.y += fy;
        forces.get(link.target)!.x -= fx; forces.get(link.target)!.y -= fy;
      });

      const hypoNodes = byLayer['hypotheses'];
      hypoNodes.forEach((n) => {
        const pos = positions.get(n.id)!;
        const toCenter = { x: cx - pos.x, y: cy - pos.y };
        forces.get(n.id)!.x += toCenter.x * 0.015;
        forces.get(n.id)!.y += toCenter.y * 0.015;
      });

      const damping = 0.5;
      displayNodes.forEach((n) => {
        const pos = positions.get(n.id)!;
        const f = forces.get(n.id)!;
        pos.x += f.x * damping;
        pos.y += f.y * damping;
        pos.x = clamp(pos.x, PADDING + NODE_RADIUS, width - PADDING - NODE_RADIUS);
        pos.y = clamp(pos.y, PADDING + NODE_RADIUS, height - PADDING - NODE_RADIUS);
      });
    }

    return { positions, nodeMap };
  }, [displayNodes, displayLinks, width, height]);

  const { positions, nodeMap } = layout;

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodeMap.get(selectedNodeId) || null;
  }, [selectedNodeId, nodeMap]);

  const hoveredConnected = useMemo(() => {
    if (!hoveredNodeId) return null;
    const connected = new Set<string>([hoveredNodeId]);
    links.forEach((l) => {
      if (l.source === hoveredNodeId) connected.add(l.target);
      if (l.target === hoveredNodeId) connected.add(l.source);
    });
    return connected;
  }, [hoveredNodeId, links]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => clamp(z * delta, 0.3, 4));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => { setIsDragging(false); }, []);

  const zoomIn = useCallback(() => setZoom((z) => clamp(z * 1.2, 0.3, 4)), []);
  const zoomOut = useCallback(() => setZoom((z) => clamp(z * 0.8, 0.3, 4)), []);
  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  const toggleLayer = useCallback((layer: MetaLayer) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId));
  }, []);

  const focusNode = useCallback((nodeId: string) => {
    const pos = positions.get(nodeId);
    if (!pos) return;
    const areaW = areaRef.current?.clientWidth || width;
    const areaH = areaRef.current?.clientHeight || height;
    setPan({ x: areaW / 2 - pos.x * zoom, y: areaH / 2 - pos.y * zoom });
  }, [positions, zoom, width, height]);

  const focusNodeOnClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setTimeout(() => focusNode(nodeId), 50);
  }, [focusNode]);

  const showLinkTooltip = useCallback((link: MetaLink, clientX: number, clientY: number) => {
    setLinkTooltip({ link, x: clientX, y: clientY });
  }, []);

  const hideLinkTooltip = useCallback(() => setLinkTooltip(null), []);

  const showNodeTooltip = useCallback((node: MetaNode, clientX: number, clientY: number) => {
    setNodeTooltip({ node, x: clientX, y: clientY });
  }, []);

  const hideNodeTooltip = useCallback(() => setNodeTooltip(null), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key === '0') resetView();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, zoomIn, zoomOut, resetView]);

  const bgColor = '#0f172a';
  const textColor = '#e2e8f0';
  const subTextColor = '#94a3b8';
  const gridColor = '#1e293b';

  return (
    <div className="zoomable-graph-overlay">
      <div className="zoomable-graph-header">
        <div className="zoomable-graph-header-left">
          <span className="zoomable-graph-header-icon">🕸️</span>
          <h2 className="zoomable-graph-header-title">{title || t('meta.title')}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="zoomable-graph-filters">
            {LAYER_ORDER.map((layer) => (
              <label key={layer} className="zoomable-graph-filter" title={
                layer === 'raw' ? t('meta.rawData') :
                layer === 'findings' ? t('meta.findings') :
                layer === 'hypotheses' ? t('meta.diagnosis') :
                layer === 'differential' ? t('meta.differential') : t('meta.evidenceBase')
              }>
                <input type="checkbox" checked={activeLayers.has(layer)} onChange={() => toggleLayer(layer)} />
                <span className="zoomable-graph-filter-dot" style={{ background: LAYER_COLORS[layer] }} />
                <span className="zoomable-graph-filter-label">
                  {layer === 'raw' ? t('meta.rawData') : layer === 'findings' ? t('meta.findings') : layer === 'hypotheses' ? t('meta.diagnosis') : layer === 'differential' ? t('meta.differential') : t('meta.evidenceBase')}
                </span>
              </label>
            ))}
          </div>
          <button className={`zoomable-graph-ctrl-btn zoomable-graph-filter-btn ${devFilterActive ? 'active' : ''}`}
            onClick={() => setDevFilterActive((v) => !v)}
            title={devFilterActive ? t('meta.fullGraph') : t('meta.diseaseProgression')}>
            🔍
          </button>
          <div className="zoomable-graph-search">
            <input type="text" placeholder={t('meta.searchNosology')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {searchQuery && <button onClick={() => setSearchQuery('')} title={t('meta.close')}>✕</button>}
          </div>
          <div className="zoomable-graph-controls">
            <button className="zoomable-graph-ctrl-btn" onClick={zoomOut} title={t('meta.zoomOut')}>−</button>
            <span className="zoomable-graph-zoom-label">{Math.round(zoom * 100)}%</span>
            <button className="zoomable-graph-ctrl-btn" onClick={zoomIn} title={t('meta.zoomIn')}>+</button>
            <button className="zoomable-graph-ctrl-btn" onClick={resetView} title={t('meta.resetView')}>⌂</button>
            <button
              className="zoomable-graph-ctrl-btn"
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
          <button className="zoomable-graph-close-btn" onClick={onClose} title={`${t('meta.close')} (Esc)`}>✕</button>
        </div>
      </div>
      <div className="zoomable-graph-hint">
        {t('meta.hint')}
      </div>
      <div className="zoomable-graph-main">
        <div className="zoomable-graph-area" ref={areaRef}
          onWheel={handleWheel} onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`}
            style={{ background: bgColor, transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill={gridColor} opacity="0.3" />
              </pattern>
            </defs>
            <rect width={width} height={height} fill="url(#grid)" />
            {[120, 220, 320, 400].map((r, i) => (
              <circle key={`ring-${i}`} cx={width / 2} cy={height / 2} r={r} fill="none" stroke={gridColor} strokeWidth={1} opacity={0.12} strokeDasharray="6,8" />
            ))}
            {(['findings', 'raw', 'differential', 'evidence'] as MetaLayer[]).map((layer) => {
              const r = LAYER_RING_RADIUS[layer];
              const angle = layer === 'findings' ? -Math.PI / 2 : layer === 'raw' ? -Math.PI / 2 + 0.5 : layer === 'differential' ? Math.PI / 2 - 0.3 : Math.PI / 2 + 0.3;
              const x = width / 2 + Math.cos(angle) * (r + 25);
              const y = height / 2 + Math.sin(angle) * (r + 25);
              const labels: Record<MetaLayer, string> = { raw: t('meta.rawData'), findings: t('meta.findings'), hypotheses: t('meta.diagnosis'), differential: t('meta.differential'), evidence: t('meta.evidenceBase') };
              return (
                <text key={`label-${layer}`} x={x} y={y} textAnchor="middle" fontSize={11} fontWeight={600} fill={LAYER_COLORS[layer]} opacity={0.4}>
                  {labels[layer]}
                </text>
              );
            })}
            {displayLinks.map((link, i) => {
              const src = positions.get(link.source);
              const tgt = positions.get(link.target);
              if (!src || !tgt) return null;
              const midX = (src.x + tgt.x) / 2, midY = (src.y + tgt.y) / 2;
              const d = `M ${src.x} ${src.y} Q ${midX} ${midY} ${tgt.x} ${tgt.y}`;
              return (
                <path key={`hit-${i}`} d={d} stroke="transparent" strokeWidth={18} fill="none" strokeLinecap="round" style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => showLinkTooltip(link, e.clientX, e.clientY)}
                  onMouseMove={(e) => showLinkTooltip(link, e.clientX, e.clientY)}
                  onMouseLeave={hideLinkTooltip} />
              );
            })}
            {displayLinks.map((link, i) => {
              const src = positions.get(link.source);
              const tgt = positions.get(link.target);
              if (!src || !tgt) return null;
              const isFocusLink = link.source === focusId || link.target === focusId;
              const isSelected = selectedNodeId && (link.source === selectedNodeId || link.target === selectedNodeId);
              const isHovered = hoveredNodeId && (link.source === hoveredNodeId || link.target === hoveredNodeId);
              const isConnected = hoveredConnected?.has(link.source) && hoveredConnected?.has(link.target);
              let color = isFocusLink ? '#fbbf24' : '#475569';
              let strokeWidth = isFocusLink ? 2.5 : 1.5;
              let opacity = isFocusLink ? 0.7 : 0.2;
              if (isSelected) { color = '#fbbf24'; strokeWidth = 3; opacity = 1; }
              else if (isHovered) { color = '#fbbf24'; strokeWidth = 3.5; opacity = 1; }
              else if (isConnected) { opacity = isFocusLink ? 0.7 : 0.5; }
              else if (hoveredNodeId || selectedNodeId) { opacity = 0.04; }
              const midX = (src.x + tgt.x) / 2, midY = (src.y + tgt.y) / 2;
              const d = `M ${src.x} ${src.y} Q ${midX} ${midY} ${tgt.x} ${tgt.y}`;
              return (
                <path key={`link-${i}`} d={d} stroke={color} strokeWidth={strokeWidth} opacity={opacity} fill="none"
                  strokeDasharray={link.type === 'discriminates' ? '6,5' : undefined} strokeLinecap="round" />
              );
            })}
            {displayNodes.map((node) => {
              const pos = positions.get(node.id);
              if (!pos) return null;
              const isFocus = node.id === focusId;
              const isSelected = node.id === selectedNodeId;
              const isHovered = node.id === hoveredNodeId;
              const color = LAYER_COLORS[node.layer];
              const r = isFocus ? 24 : isSelected ? 22 : NODE_RADIUS;
              const labelLines = wrapLabel(node.label, isFocus || isSelected ? 18 : 14);
              const labelHeight = labelLines.length * LABEL_LINE_HEIGHT;
              const status = node.layer === 'raw' && node.value !== undefined ? getValueStatus(node.value, node.normal) : 'unknown';
              const statusIcon = STATUS_ICONS[status];
              const statusColor = STATUS_COLORS[status];
              let fill = isFocus ? color : isSelected ? color : '#1e293b';
              let stroke = color;
              let strokeWidth = isFocus ? 3.5 : isSelected ? 3 : 2.5;
              let opacity = 1;
              if (isHovered) { fill = color; stroke = '#fbbf24'; strokeWidth = 4; }
              else if ((hoveredNodeId && !hoveredConnected?.has(node.id)) ||
                (selectedNodeId && !displayLinks.some((l) => (l.source === selectedNodeId || l.target === selectedNodeId) && (l.source === node.id || l.target === node.id)) && node.id !== selectedNodeId)) {
                opacity = 0.12;
              }
              const pulseRadius = isFocus ? r + 8 + Math.sin(animTime.current * 0.003) * 4 : 0;
              return (
                <g key={node.id} style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => { setHoveredNodeId(node.id); showNodeTooltip(node, e.clientX, e.clientY); }}
                  onMouseMove={(e) => showNodeTooltip(node, e.clientX, e.clientY)}
                  onMouseLeave={() => { setHoveredNodeId(null); hideNodeTooltip(); }}
                  onClick={(e) => { e.stopPropagation(); handleNodeClick(node.id); }}
                  opacity={opacity}>
                  {isFocus && pulseRadius > 0 && (
                    <circle cx={pos.x} cy={pos.y} r={pulseRadius} fill="none" stroke={color} strokeWidth={2}
                      opacity={0.25 + Math.sin(animTime.current * 0.003) * 0.15} />
                  )}
                  {(isHovered || isFocus || isSelected) && (
                    <circle cx={pos.x} cy={pos.y} r={r + 10} fill={color} opacity={0.08} />
                  )}
                  <circle cx={pos.x} cy={pos.y} r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                  {node.layer === 'raw' && node.value !== undefined ? (
                    <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                      fontSize={isFocus || isSelected ? 11 : 10} fontWeight={700}
                      fill={isFocus || isHovered || isSelected ? '#0f172a' : statusColor}>
                      {statusIcon}{node.value}
                    </text>
                  ) : node.layer === 'hypotheses' ? (
                    <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                      fontSize={isFocus || isSelected ? 12 : 10} fontWeight={700}
                      fill={isFocus || isHovered || isSelected ? '#0f172a' : color}>?</text>
                  ) : null}
                  <g transform={`translate(${pos.x}, ${pos.y + r + 7})`}>
                    {labelLines.map((line, li) => (
                      <text key={li} x={0} y={(li + 1) * LABEL_LINE_HEIGHT} textAnchor="middle"
                        fontSize={isFocus || isSelected ? 12 : 10}
                        fontWeight={isFocus || isHovered || isSelected ? 600 : 400}
                        fill={isHovered || isSelected ? textColor : subTextColor}>{line}</text>
                    ))}
                  </g>
                  {node.layer === 'raw' && node.unit && (
                    <text x={pos.x} y={pos.y + r + 7 + labelHeight + 11} textAnchor="middle" fontSize={9}
                      fill={subTextColor} opacity={0.5}>{node.unit}</text>
                  )}
                </g>
              );
            })}
          </svg>
          {linkTooltip && areaRef.current && (
            <div className="link-tooltip" style={{
              left: Math.min(linkTooltip.x - areaRef.current.getBoundingClientRect().left + 12, areaRef.current.clientWidth - 240),
              top: Math.max(linkTooltip.y - areaRef.current.getBoundingClientRect().top - 60, 8),
            }}>
              <div className="link-tooltip-header">
                <span className="link-tooltip-src">{nodeMap.get(linkTooltip.link.source)?.label}</span>
                <span className="link-tooltip-arrow">→</span>
                <span className="link-tooltip-tgt">{nodeMap.get(linkTooltip.link.target)?.label}</span>
              </div>
              <div className="link-tooltip-body">
                <span className="link-tooltip-type">{LINK_TYPE_LABELS[linkTooltip.link.type] || linkTooltip.link.type}</span>
                <span className="link-tooltip-weight">{t('meta.weight')}: {(linkTooltip.link.weight * 100).toFixed(0)}%</span>
              </div>
            </div>
          )}
          {nodeTooltip && areaRef.current && nodeTooltip.node.description && (
            <div className="node-tooltip" style={{
              left: Math.min(nodeTooltip.x - areaRef.current.getBoundingClientRect().left + 16, areaRef.current.clientWidth - 300),
              top: Math.max(nodeTooltip.y - areaRef.current.getBoundingClientRect().top - 90, 8),
            }}>
              <div className="node-tooltip-title">{nodeTooltip.node.label}</div>
              <div className="node-tooltip-desc">{nodeTooltip.node.description}</div>
            </div>
          )}
        </div>
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            allNodes={displayNodes}
            allLinks={displayLinks}
            details={details}
            onClose={() => setSelectedNodeId(null)}
            onNodeClick={(nodeId) => focusNodeOnClick(nodeId)}
          />
        )}
      </div>
    </div>
  );
}
