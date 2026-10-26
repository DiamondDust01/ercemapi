import React, { useMemo } from 'react';
import useViewportSize from './useViewportSize.js';
import { hexCenters, hexPolygon, digitFor } from './hexGrid.js';

// Fundo do OBI Quest: malha hexagonal em azul, com um zero ou um no centro de cada
// hexágono. Contornos e dígitos ficam no mesmo SVG e saem da mesma geometria
// (hexGrid.js), então os dígitos nunca caem em cima das linhas.
const SIDE = 20;

export default function BinaryBackdrop() {
  const { width, height } = useViewportSize();
  const centers = useMemo(() => hexCenters(width, height, SIDE), [width, height]);
  const outline = useMemo(() => centers.map(({ x, y }) => `M${hexPolygon(x, y, SIDE).replaceAll(' ', 'L')}Z`).join(''), [centers]);
  const fontSize = width < 768 ? 8 : 10;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at top, var(--backdrop-glow), transparent 35%), linear-gradient(180deg, var(--app-bg) 0%, var(--app-bg-end) 100%)' }} />
      <svg className="absolute inset-0" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <path d={outline} fill="none" style={{ stroke: 'var(--backdrop-grid)' }} strokeWidth="1" />
        <g
          className="android-binary-decoration select-none"
          fontFamily="'JetBrains Mono', monospace"
          fontSize={fontSize}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fill: 'var(--backdrop-digits)' }}
        >
          {centers.map((center) => (
            <text key={`${center.column}-${center.row}`} x={center.x} y={center.y}>{digitFor(center)}</text>
          ))}
        </g>
      </svg>
    </div>
  );
}
