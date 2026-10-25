import React, { useMemo } from 'react';
import { hexCenters, hexPolygon, digitFor } from './hexGrid.js';
import useViewportSize from '../useViewportSize.js';

// Fundo próprio do Pensa Comigo: malha hexagonal (no lugar da grade quadrada do
// OBI Quest) com um zero ou um no centro de cada hexágono, em gradiente violeta →
// magenta → ciano. Contornos e dígitos saem da mesma geometria (hexGrid.js), dentro
// do mesmo SVG, então ficam sempre alinhados. As cores vêm das variáveis --pensa-*.
const SIDE = 22;

export default function PensaBackdrop() {
  const { width, height } = useViewportSize();
  const centers = useMemo(() => hexCenters(width, height, SIDE), [width, height]);
  const outline = useMemo(() => centers.map(({ x, y }) => `M${hexPolygon(x, y, SIDE).replaceAll(' ', 'L')}Z`).join(''), [centers]);
  const fontSize = width < 768 ? 9 : 11;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 12% 0%, var(--pensa-glow-a), transparent 40%), radial-gradient(circle at 95% 100%, var(--pensa-glow-b), transparent 45%), linear-gradient(180deg, var(--app-bg) 0%, var(--app-bg-end) 100%)' }}
      />
      <svg className="absolute inset-0" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="pensa-digit-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={width} y2={height}>
            <stop offset="0%" style={{ stopColor: 'var(--pensa-digit-a)' }} />
            <stop offset="50%" style={{ stopColor: 'var(--pensa-digit-b)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--pensa-digit-c)' }} />
          </linearGradient>
        </defs>
        <path d={outline} fill="none" style={{ stroke: 'var(--pensa-hex)' }} strokeWidth="1" />
        <g
          className="android-binary-decoration select-none"
          fill="url(#pensa-digit-gradient)"
          fontFamily="'JetBrains Mono', monospace"
          fontSize={fontSize}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ opacity: 'var(--pensa-digits-opacity)' }}
        >
          {centers.map((center) => (
            <text key={`${center.column}-${center.row}`} x={center.x} y={center.y}>{digitFor(center)}</text>
          ))}
        </g>
      </svg>
    </div>
  );
}
