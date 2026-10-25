import { useEffect, useState } from 'react';

const readViewport = () => ({
  width: typeof window !== 'undefined' ? window.innerWidth : 1366,
  height: typeof window !== 'undefined' ? window.innerHeight : 768
});

// Tamanho da janela, atualizado no redimensionamento (no máximo uma vez por quadro).
export default function useViewportSize() {
  const [viewport, setViewport] = useState(readViewport);
  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setViewport(readViewport()));
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, []);
  return viewport;
}
