// Variação do app escolhida na tela inicial: 'obi' (OBI Quest) ou 'pensa' (Pensa Comigo).
// Fica só na aba atual (sessionStorage): ao abrir o app de novo, a escolha aparece outra vez,
// o que também evita que um aparelho compartilhado da escola "lembre" o modo do usuário anterior.

export const APP_MODES = ['obi', 'pensa'];
export const APP_MODE_KEY = 'obi-quest-app-mode';

export const isAppMode = (value) => APP_MODES.includes(value);

export const readAppMode = (storage = typeof window !== 'undefined' ? window.sessionStorage : null) => {
  try {
    const value = storage?.getItem(APP_MODE_KEY);
    return isAppMode(value) ? value : null;
  } catch {
    return null;
  }
};

export const writeAppMode = (mode, storage = typeof window !== 'undefined' ? window.sessionStorage : null) => {
  try {
    if (isAppMode(mode)) storage?.setItem(APP_MODE_KEY, mode);
    else storage?.removeItem(APP_MODE_KEY);
    return true;
  } catch {
    return false;
  }
};
