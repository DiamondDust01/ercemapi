import React from 'react';

// Fundo da tela de escolha: a ponte entre as duas variações. Uma malha de pontos com
// gradiente que vai das cores do OBI Quest (índigo e ciano, à esquerda) às do Pensa
// Comigo (violeta e magenta, à direita), com um brilho atrás de cada lado. É diferente
// da grade quadrada do OBI Quest e dos hexágonos do Pensa Comigo.
// Os pontos são uma máscara sobre um retângulo em gradiente, para o gradiente
// atravessar a tela inteira em vez de se repetir a cada ponto.
const GAP = 26;

export default function SelectorBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 18% 35%, var(--selector-glow-a), transparent 45%), radial-gradient(ellipse at 82% 65%, var(--selector-glow-b), transparent 45%), linear-gradient(180deg, var(--app-bg) 0%, var(--app-bg-end) 100%)' }}
      />
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="selector-dots-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'var(--selector-a)' }} />
            <stop offset="45%" style={{ stopColor: 'var(--selector-b)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--selector-c)' }} />
          </linearGradient>
          {/* A cada 4 pontos, um ponto maior: dá textura sem formar grade. */}
          <pattern id="selector-dots" width={GAP * 4} height={GAP * 4} patternUnits="userSpaceOnUse">
            {Array.from({ length: 16 }, (_, index) => {
              const column = index % 4;
              const row = Math.floor(index / 4);
              const big = column === (row * 2) % 4 && row % 2 === 0;
              return <circle key={index} cx={column * GAP + GAP / 2} cy={row * GAP + GAP / 2} r={big ? 2.2 : 1.1} fill="#ffffff" />;
            })}
          </pattern>
          <mask id="selector-dots-mask">
            <rect width="100%" height="100%" fill="url(#selector-dots)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#selector-dots-gradient)" mask="url(#selector-dots-mask)" style={{ opacity: 'var(--selector-dots-opacity)' }} />
      </svg>
    </div>
  );
}
