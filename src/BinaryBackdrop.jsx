import React, { useMemo } from 'react';
import useViewportSize from './useViewportSize.js';
import { gridDigitCenters, gridDigitFor } from './squareGrid.js';

// Fundo do OBI Quest: grade quadrada com zeros e uns no centro dos quadrados.
// Linhas e dígitos ficam no mesmo SVG e saem das mesmas contas (squareGrid.js),
// então os dígitos nunca caem em cima das linhas.
const CELL = 24;

export default function BinaryBackdrop() {
  const { width, height } = useViewportSize();
  const digits = useMemo(() => gridDigitCenters(width, height, CELL), [width, height]);
  const fontSize = width < 768 ? 8 : 10;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at top, var(--backdrop-glow), transparent 35%), linear-gradient(180deg, var(--app-bg) 0%, var(--app-bg-end) 100%)' }} />
      <svg className="absolute inset-0" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <pattern id="obi-grid" width={CELL} height={CELL} patternUnits="userSpaceOnUse">
            <path d={`M${CELL} 0.5H0.5V${CELL}`} fill="none" style={{ stroke: 'var(--backdrop-grid)' }} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#obi-grid)" />
        <g
          className="android-binary-decoration select-none fill-cyan-300/30"
          fontFamily="'JetBrains Mono', monospace"
          fontSize={fontSize}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {digits.map((center) => (
            <text key={`${center.column}-${center.row}`} x={center.x} y={center.y}>{gridDigitFor(center)}</text>
          ))}
        </g>
      </svg>
    </div>
  );
}
