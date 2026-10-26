import React, { useEffect, useRef } from 'react';
import useViewportSize from '../useViewportSize.js';
import { useTheme } from '../ThemeToggle.jsx';
import { seedRain, stepRain, rainCells } from './matrixRain.js';

// Fundo do Pensa Comigo: frases, pensamentos e citações caindo em colunas, letra por
// letra, no estilo do filme Matrix. Cada frase aparece inteira (ver matrixRain.js).
// Cores em --matrix-* (styles.css), que mudam no tema claro. Limita a 30 quadros por
// segundo e, com "reduzir movimento" ligado no sistema, mostra só um quadro parado.
const FRAME_MS = 1000 / 30;

const readColors = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    text: style.getPropertyValue('--matrix-text').trim() || '#22c55e',
    head: style.getPropertyValue('--matrix-head').trim() || '#dcfce7',
    opacity: Number.parseFloat(style.getPropertyValue('--matrix-opacity')) || 0.5
  };
};

export default function MatrixBackdrop() {
  const canvasRef = useRef(null);
  const { width, height } = useViewportSize();
  const theme = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const fontSize = width < 768 ? 13 : 15;
    const columnWidth = Math.round(fontSize * 1.6);
    const rowHeight = Math.round(fontSize * 1.3);
    const columnCount = Math.max(1, Math.floor(width / columnWidth));
    const rows = Math.max(1, Math.floor(height / rowHeight));
    const colors = readColors();
    const random = Math.random;
    let rain = seedRain(columnCount, rows, random);

    context.font = `${fontSize}px 'JetBrains Mono', monospace`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    const draw = () => {
      context.clearRect(0, 0, width, height);
      rainCells(rain).forEach((cell) => {
        context.globalAlpha = cell.alpha * colors.opacity;
        context.fillStyle = cell.isHead ? colors.head : colors.text;
        context.fillText(cell.char, cell.column * columnWidth + columnWidth / 2, cell.row * rowHeight + rowHeight / 2);
      });
      context.globalAlpha = 1;
    };

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      // Quadro parado: frases inteiras, sem animação.
      rain = { ...rain, phrases: rain.phrases.map((phrase) => ({ ...phrase, delay: 0, written: phrase.total, hold: Infinity })) };
      draw();
      return undefined;
    }

    let frame = 0;
    let last = 0;
    const tick = (time) => {
      frame = requestAnimationFrame(tick);
      if (time - last < FRAME_MS) return;
      // Ao voltar de outra aba, não "pula" tudo de uma vez.
      const seconds = last ? Math.min(0.25, (time - last) / 1000) : 0;
      last = time;
      rain = stepRain(rain, seconds, random);
      draw();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [width, height, theme]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 15% 0%, var(--pensa-glow-a), transparent 45%), radial-gradient(circle at 90% 100%, var(--pensa-glow-b), transparent 45%), linear-gradient(180deg, var(--app-bg) 0%, var(--app-bg-end) 100%)' }}
      />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
