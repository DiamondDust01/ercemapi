// Regras do tutorial guiado: achar o elemento destacado e posicionar o balão.

// Primeiro elemento visível entre os seletores (string ou lista).
export const findTourTarget = (selectors, root = typeof document !== 'undefined' ? document : null) => {
  if (!root) return null;
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const selector of list) {
    const found = [...root.querySelectorAll(selector)].find((element) => {
      const box = element.getBoundingClientRect();
      return box.width > 0 && box.height > 0;
    });
    if (found) return found;
  }
  return null;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));

// Coloca o balão abaixo do elemento; se não couber, acima; se o elemento ocupa quase a
// tela toda, encosta o balão na parte de baixo da tela, sem seta. Sem elemento, centraliza.
export const placeBalloon = ({ target, balloon, viewport, margin = 12, gap = 12 }) => {
  const { width: bw, height: bh } = balloon;
  const { width: vw, height: vh } = viewport;
  if (!target) {
    return { top: Math.max(margin, (vh - bh) / 2), left: Math.max(margin, (vw - bw) / 2), arrow: null };
  }
  const centerX = target.left + target.width / 2;
  const left = clamp(centerX - bw / 2, margin, vw - bw - margin);
  const arrowOffset = clamp(centerX - left, 18, bw - 18);
  const bottom = target.top + target.height;

  if (vh - bottom >= bh + gap + margin) {
    return { top: Math.max(margin, bottom + gap), left, arrow: { side: 'top', offset: arrowOffset } };
  }
  if (target.top >= bh + gap + margin) {
    return { top: target.top - gap - bh, left, arrow: { side: 'bottom', offset: arrowOffset } };
  }
  return { top: Math.max(margin, vh - bh - margin), left, arrow: null };
};
