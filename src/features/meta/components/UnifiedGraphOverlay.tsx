import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import unifiedData from '../data/unified-graph.json';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface UnifiedGraphOverlayProps {
  highlightGroup?: string;
  onSelectNosology?: (id: string) => void;
  onClose: () => void;
}

interface UnifiedGroup {
  id: string;
  label: string;
  color: string;
  description: string;
  territory: { x: number; y: number; radius: number };
  nodeIds: string[];
}

interface UnifiedNode {
  id: string;
  label: string;
  group: string;
  x: number;
  y: number;
  radius: number;
  size: number;
  shared_symptoms: string[];
  shared_labs: string[];
}

interface UnifiedLink {
  source: string;
  target: string;
  type: string;
  weight: number;
  shared: string[];
}

type Vec2 = { x: number; y: number };

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

const NODE_RADIUS = 42;
const MIN_NODE_SPACING = 110;
const PADDING = 60;

export function UnifiedGraphOverlay({ highlightGroup, onSelectNosology, onClose }: UnifiedGraphOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const width = 1600;
  const height = 1000;

  const groups: UnifiedGroup[] = unifiedData.groups;
  const nodes: UnifiedNode[] = unifiedData.nodes;
  const links: UnifiedLink[] = unifiedData.links;

  const [zoom, setZoomRaw] = useLocalStorage('docw-meta-zoom', 1);
  const [pan, setPan] = useLocalStorage<{ x: number; y: number }>('docw-meta-pan', { x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [nodeTooltip, setNodeTooltip] = useState<{ node: UnifiedNode; x: number; y: number } | null>(null);
  const [linkTooltip, setLinkTooltip] = useState<{ link: UnifiedLink; srcLabel: string; tgtLabel: string; x: number; y: number } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [visibleGroupIds, setVisibleGroupIds] = useLocalStorage<string[]>('docw-meta-groups', groups.map((g) => g.id));
  const visibleGroups = useMemo(() => new Set(visibleGroupIds), [visibleGroupIds]);

  const setZoom = useCallback((fn: ((z: number) => number) | number) => {
    setZoomRaw(typeof fn === 'function' ? fn(zoom) : fn);
  }, [zoom, setZoomRaw]);

  // Filter by search and visible groups
  const displayNodes = useMemo(() => {
    let result = nodes.filter((n) => visibleGroups.has(n.group));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((n) => n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q));
    }
    return result;
  }, [nodes, searchQuery, visibleGroups]);

  const displayLinks = useMemo(() => {
    const nodeIds = new Set(displayNodes.map((n) => n.id));
    return links.filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target));
  }, [displayNodes, links]);

  // Force layout
  const layout = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const nodeMap = new Map<string, UnifiedNode>();
    displayNodes.forEach((n) => nodeMap.set(n.id, n));

    const groupMap = new Map<string, UnifiedGroup>();
    groups.forEach((g) => groupMap.set(g.id, g));

    const byGroup = new Map<string, UnifiedNode[]>();
    displayNodes.forEach((n) => {
      if (!byGroup.has(n.group)) byGroup.set(n.group, []);
      byGroup.get(n.group)!.push(n);
    });

    // Predefined group centers from JSON territories
    const groupCenters = new Map<string, Vec2>();
    groups.forEach((g) => {
      groupCenters.set(g.id, { x: g.territory.x, y: g.territory.y });
    });

    const positions = new Map<string, Vec2>();

    // Initial positions: around group center using JSON x/y as hints
    byGroup.forEach((groupNodes) => {
      groupNodes.forEach((n) => {
        positions.set(n.id, { x: n.x + (Math.random() - 0.5) * 20, y: n.y + (Math.random() - 0.5) * 20 });
      });
    });

    // Force simulation
    const ITERATIONS = 120;
    for (let iter = 0; iter < ITERATIONS; iter++) {
      const forces = new Map<string, Vec2>();
      displayNodes.forEach((n) => forces.set(n.id, { x: 0, y: 0 }));

      // 1. Group attraction
      displayNodes.forEach((n) => {
        const pos = positions.get(n.id)!;
        const center = groupCenters.get(n.group) || { x: cx, y: cy };
        const toCenter = { x: center.x - pos.x, y: center.y - pos.y };
        const d = Math.sqrt(toCenter.x * toCenter.x + toCenter.y * toCenter.y) || 1e-6;
        const f = d * 0.012;
        forces.get(n.id)!.x += (toCenter.x / d) * f;
        forces.get(n.id)!.y += (toCenter.y / d) * f;
      });

      // 2. Node repulsion
      for (let i = 0; i < displayNodes.length; i++) {
        for (let j = i + 1; j < displayNodes.length; j++) {
          const a = displayNodes[i], b = displayNodes[j];
          const pa = positions.get(a.id)!, pb = positions.get(b.id)!;
          const dx = pb.x - pa.x, dy = pb.y - pa.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1e-6;
          const minD = MIN_NODE_SPACING;
          if (d < minD) {
            const f = (minD - d) / d * 2.5;
            const fx = (dx / d) * f, fy = (dy / d) * f;
            forces.get(a.id)!.x -= fx; forces.get(a.id)!.y -= fy;
            forces.get(b.id)!.x += fx; forces.get(b.id)!.y += fy;
          }
        }
      }

      // 3. Link spring
      displayLinks.forEach((link) => {
        const a = positions.get(link.source), b = positions.get(link.target);
        if (!a || !b) return;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1e-6;
        const ideal = 200;
        const f = (d - ideal) / d * 0.025;
        const fx = (dx / d) * f, fy = (dy / d) * f;
        forces.get(link.source)!.x += fx; forces.get(link.source)!.y += fy;
        forces.get(link.target)!.x -= fx; forces.get(link.target)!.y -= fy;
      });

      // 4. Center gravity (weak)
      displayNodes.forEach((n) => {
        const pos = positions.get(n.id)!;
        const toCenter = { x: cx - pos.x, y: cy - pos.y };
        forces.get(n.id)!.x += toCenter.x * 0.003;
        forces.get(n.id)!.y += toCenter.y * 0.003;
      });

      // Apply
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

    return { positions, nodeMap, groupCenters, groupMap };
  }, [displayNodes, displayLinks, width, height, groups]);

  const { positions, nodeMap, groupCenters } = layout;

  // Pan / zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => clamp(z * delta, 0.2, 4));
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

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const zoomIn = useCallback(() => setZoom((z) => clamp(z * 1.2, 0.2, 4)), []);
  const zoomOut = useCallback(() => setZoom((z) => clamp(z * 0.8, 0.2, 4)), []);
  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  // Hover connected
  const hoveredConnected = useMemo(() => {
    if (!hoveredNodeId) return null;
    const connected = new Set<string>([hoveredNodeId]);
    links.forEach((l) => {
      if (l.source === hoveredNodeId) connected.add(l.target);
      if (l.target === hoveredNodeId) connected.add(l.source);
    });
    return connected;
  }, [hoveredNodeId, links]);

  // Tooltips
  const showNodeTooltip = useCallback((node: UnifiedNode, clientX: number, clientY: number) => {
    setNodeTooltip({ node, x: clientX, y: clientY });
  }, []);
  const hideNodeTooltip = useCallback(() => setNodeTooltip(null), []);

  const showLinkTooltip = useCallback((link: UnifiedLink, clientX: number, clientY: number) => {
    const src = nodeMap.get(link.source);
    const tgt = nodeMap.get(link.target);
    if (!src || !tgt) return;
    setLinkTooltip({ link, srcLabel: src.label, tgtLabel: tgt.label, x: clientX, y: clientY });
  }, [nodeMap]);
  const hideLinkTooltip = useCallback(() => setLinkTooltip(null), []);

  // Keyboard
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

  const bgColor = '#020617';
  const gridColor = '#1e293b';
  const subTextColor = '#94a3b8';

  return (
    <div className="unified-graph-overlay">
      {/* Header */}
      <div className="unified-graph-header">
        <div className="unified-graph-header-left">
          <span className="unified-graph-header-icon">🗺️</span>
          <h2 className="unified-graph-header-title">Карта нозологий DOC-W</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search */}
          <div className="zoomable-graph-search">
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Поиск нозологий"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} title="Очистить">✕</button>
            )}
          </div>
          {/* Zoom controls */}
          <div className="zoomable-graph-controls">
            <button className="zoomable-graph-ctrl-btn" onClick={zoomOut} title="Уменьшить" aria-label="Уменьшить масштаб">−</button>
            <span className="zoomable-graph-zoom-label" aria-live="polite" aria-atomic="true">{Math.round(zoom * 100)}%</span>
            <button className="zoomable-graph-ctrl-btn" onClick={zoomIn} title="Увеличить" aria-label="Увеличить масштаб">+</button>
            <button className="zoomable-graph-ctrl-btn" onClick={resetView} title="Сбросить вид" aria-label="Сбросить вид">⌂</button>
          </div>
          <button className="zoomable-graph-close-btn" onClick={onClose} title="Закрыть (Esc)" aria-label="Закрыть карту нозологий">✕</button>
        </div>
      </div>

      <div className="zoomable-graph-hint">
        Колёсико — масштаб · Перетаскивание — панорама · Клик по нозологии — открыть граф · Esc — закрыть
      </div>

      {/* Main area */}
      <div className="zoomable-graph-main">
        {/* Legend / Filter Panel */}
        <div className="unified-legend-panel">
          <h4 className="unified-legend-title">Группы</h4>
          <div className="unified-legend-list">
            {groups.map((group) => {
              const isVisible = visibleGroups.has(group.id);
              const count = nodes.filter((n) => n.group === group.id).length;
              const isHighlighted = highlightGroup === group.id;
              return (
                <button
                  key={group.id}
                  className={`unified-legend-item ${isVisible ? 'active' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                  onClick={() => {
                    const next = new Set(visibleGroupIds);
                    if (next.has(group.id)) next.delete(group.id);
                    else next.add(group.id);
                    setVisibleGroupIds(Array.from(next));
                  }}
                  title={group.description}
                  aria-label={`${group.label} (${count} нозологий)${isVisible ? ', видимая' : ', скрытая'}`}
                  aria-pressed={isVisible}
                >
                  <span className="unified-legend-dot" style={{ background: group.color }} />
                  <span className="unified-legend-label">{group.label}</span>
                  <span className="unified-legend-count">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="unified-legend-actions">
            <button
              className="unified-legend-action-btn"
              onClick={() => setVisibleGroupIds(groups.map((g) => g.id))}
              aria-label="Показать все группы"
            >
              Все
            </button>
            <button
              className="unified-legend-action-btn"
              onClick={() => setVisibleGroupIds([])}
              aria-label="Скрыть все группы"
            >
              Ни одной
            </button>
          </div>
        </div>

        <div
          className="zoomable-graph-area unified-graph-area"
          ref={areaRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            ref={svgRef}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{
              background: bgColor,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {/* Grid */}
            <defs>
              <pattern id="unified-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <circle cx="25" cy="25" r="1" fill={gridColor} opacity="0.25" />
              </pattern>
            </defs>
            <rect width={width} height={height} fill="url(#unified-grid)" />

            {/* Group territories */}
            {groups.map((group) => {
              const center = groupCenters.get(group.id);
              if (!center) return null;
              const isHighlighted = highlightGroup === group.id;
              return (
                <g key={`group-${group.id}`}>
                  <circle
                    cx={center.x}
                    cy={center.y}
                    r={group.territory.radius}
                    fill={group.color}
                    opacity={isHighlighted ? 0.08 : 0.04}
                    stroke={group.color}
                    strokeWidth={isHighlighted ? 2 : 1}
                    strokeDasharray="8,6"
                    strokeOpacity={isHighlighted ? 0.4 : 0.2}
                  />
                  <text
                    x={center.x}
                    y={center.y - group.territory.radius + 20}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={700}
                    fill={group.color}
                    opacity={0.7}
                    letterSpacing={1}
                  >
                    {group.label.toUpperCase()}
                  </text>
                </g>
              );
            })}

            {/* Links — hit detection */}
            {displayLinks.map((link, i) => {
              const src = positions.get(link.source);
              const tgt = positions.get(link.target);
              if (!src || !tgt) return null;
              return (
                <line
                  key={`hit-${i}`}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke="transparent"
                  strokeWidth={16}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => showLinkTooltip(link, e.clientX, e.clientY)}
                  onMouseMove={(e) => showLinkTooltip(link, e.clientX, e.clientY)}
                  onMouseLeave={hideLinkTooltip}
                />
              );
            })}

            {/* Visible links */}
            {displayLinks.map((link, i) => {
              const src = positions.get(link.source);
              const tgt = positions.get(link.target);
              if (!src || !tgt) return null;
              const isHovered = hoveredNodeId && (link.source === hoveredNodeId || link.target === hoveredNodeId);
              const isConnected = hoveredConnected?.has(link.source) && hoveredConnected?.has(link.target);
              let color = '#475569';
              let strokeWidth = link.weight * 3;
              let opacity = 0.15;
              if (isHovered) { color = '#fbbf24'; strokeWidth = 4; opacity = 1; }
              else if (isConnected) { opacity = 0.5; }
              else if (hoveredNodeId) { opacity = 0.03; }
              return (
                <line
                  key={`link-${i}`}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Nodes */}
            {displayNodes.map((node) => {
              const pos = positions.get(node.id);
              if (!pos) return null;
              const isHovered = node.id === hoveredNodeId;
              const group = groups.find((g) => g.id === node.group);
              const color = group?.color || '#94a3b8';
              let opacity = 1;
              if (hoveredNodeId && !hoveredConnected?.has(node.id)) opacity = 0.15;
              return (
                <g
                  key={node.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${node.label}, ${group?.label || ''}. Нажмите Enter для открытия.`}
                  style={{ cursor: onSelectNosology ? 'pointer' : 'default' }}
                  onMouseEnter={(e) => { setHoveredNodeId(node.id); showNodeTooltip(node, e.clientX, e.clientY); }}
                  onMouseMove={(e) => showNodeTooltip(node, e.clientX, e.clientY)}
                  onMouseLeave={() => { setHoveredNodeId(null); hideNodeTooltip(); }}
                  onClick={(e) => { e.stopPropagation(); onSelectNosology?.(node.id); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectNosology?.(node.id);
                    }
                  }}
                  opacity={opacity}
                >
                  {/* Glow */}
                  {isHovered && (
                    <circle cx={pos.x} cy={pos.y} r={NODE_RADIUS + 12} fill={color} opacity={0.12} />
                  )}
                  {/* Main circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={NODE_RADIUS}
                    fill={isHovered ? color : '#0f172a'}
                    stroke={color}
                    strokeWidth={isHovered ? 4 : 2.5}
                  />
                  {/* Label inside */}
                  <text
                    x={pos.x}
                    y={pos.y - 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={isHovered ? 12 : 10}
                    fontWeight={700}
                    fill={isHovered ? '#0f172a' : color}
                  >
                    {node.label.length > 14 ? node.label.slice(0, 13) + '…' : node.label}
                  </text>
                  {/* Group badge */}
                  <text
                    x={pos.x}
                    y={pos.y + 14}
                    textAnchor="middle"
                    fontSize={8}
                    fill={isHovered ? '#0f172a' : subTextColor}
                    opacity={0.7}
                  >
                    {group?.label || ''}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Link Tooltip */}
          {linkTooltip && areaRef.current && (
            <div
              className="link-tooltip"
              style={{
                left: Math.min(linkTooltip.x - areaRef.current.getBoundingClientRect().left + 12,
                  areaRef.current.clientWidth - 240),
                top: Math.max(linkTooltip.y - areaRef.current.getBoundingClientRect().top - 60, 8),
              }}
            >
              <div className="link-tooltip-header">
                <span className="link-tooltip-src">{linkTooltip.srcLabel}</span>
                <span className="link-tooltip-arrow">↔</span>
                <span className="link-tooltip-tgt">{linkTooltip.tgtLabel}</span>
              </div>
              <div className="link-tooltip-body">
                <span className="link-tooltip-type">Общие проявления</span>
                <span className="link-tooltip-weight">
                  {linkTooltip.link.shared.length} совпадений
                </span>
              </div>
            </div>
          )}

          {/* Node Tooltip */}
          {nodeTooltip && areaRef.current && (
            <div
              className="node-tooltip"
              style={{
                left: Math.min(nodeTooltip.x - areaRef.current.getBoundingClientRect().left + 16,
                  areaRef.current.clientWidth - 260),
                top: Math.max(nodeTooltip.y - areaRef.current.getBoundingClientRect().top - 70, 8),
              }}
            >
              <div className="node-tooltip-title">{nodeTooltip.node.label}</div>
              <div className="node-tooltip-desc">
                {groups.find((g) => g.id === nodeTooltip.node.group)?.description || ''}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
