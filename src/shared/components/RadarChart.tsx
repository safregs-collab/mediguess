import { useMemo } from 'react';

interface RadarData {
  label: string;
  value: number; // 0-100
}

interface RadarChartProps {
  data: RadarData[];
  size?: number;
}

export function RadarChart({ data, size = 200 }: RadarChartProps) {
  const center = size / 2;
  const radius = size * 0.38;
  const levels = 4;

  const axes = useMemo(() => {
    const count = data.length;
    return data.map((d, i) => {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      return {
        ...d,
        angle,
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      };
    });
  }, [data, center, radius]);

  const gridPolygons = useMemo(() => {
    const polygons: string[] = [];
    for (let level = 1; level <= levels; level++) {
      const r = (radius * level) / levels;
      const points = axes.map((a) => {
        const x = center + r * Math.cos(a.angle);
        const y = center + r * Math.sin(a.angle);
        return `${x},${y}`;
      });
      polygons.push(points.join(' '));
    }
    return polygons;
  }, [axes, center, radius]);

  const dataPolygon = useMemo(() => {
    const points = axes.map((a) => {
      const r = (radius * a.value) / 100;
      const x = center + r * Math.cos(a.angle);
      const y = center + r * Math.sin(a.angle);
      return `${x},${y}`;
    });
    return points.join(' ');
  }, [axes, center, radius]);

  if (data.length === 0) return null;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: '100%' }}>
      {/* Grid */}
      {gridPolygons.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
          opacity={0.5}
        />
      ))}
      {/* Axes */}
      {axes.map((a, i) => (
        <line
          key={i}
          x1={center}
          y1={center}
          x2={a.x}
          y2={a.y}
          stroke="var(--border)"
          strokeWidth="1"
          opacity={0.3}
        />
      ))}
      {/* Data area */}
      <polygon
        points={dataPolygon}
        fill="var(--primary)"
        fillOpacity={0.2}
        stroke="var(--primary)"
        strokeWidth="2"
      />
      {/* Data points */}
      {axes.map((a, i) => {
        const r = (radius * a.value) / 100;
        const x = center + r * Math.cos(a.angle);
        const y = center + r * Math.sin(a.angle);
        return (
          <circle key={i} cx={x} cy={y} r="3" fill="var(--primary)" />
        );
      })}
      {/* Labels */}
      {axes.map((a, i) => {
        const labelR = radius + 18;
        const x = center + labelR * Math.cos(a.angle);
        const y = center + labelR * Math.sin(a.angle);
        return (
          <text
            key={`label-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill="var(--text-secondary)"
          >
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}
