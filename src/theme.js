// Tema claro ou escuro do app inteiro (tela de escolha, OBI Quest e Pensa Comigo).
// O padrão é o escuro, a identidade visual do app. A escolha é uma preferência do
// aparelho, guardada em localStorage; não é dado de aluno.
// O index.html aplica o tema salvo antes do React carregar, para não piscar.

export const THEME_KEY = 'obi-quest-theme';
export const THEMES = ['dark', 'light'];
export const DEFAULT_THEME = 'dark';

const defaultStorage = () => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
};

export const normalizeTheme = (value) => (THEMES.includes(value) ? value : DEFAULT_THEME);

export const readStoredTheme = (storage = defaultStorage()) => {
  try {
    return normalizeTheme(storage?.getItem(THEME_KEY));
  } catch {
    return DEFAULT_THEME;
  }
};

export const writeStoredTheme = (theme, storage = defaultStorage()) => {
  try {
    storage?.setItem(THEME_KEY, normalizeTheme(theme));
    return true;
  } catch {
    return false;
  }
};

export const oppositeTheme = (theme) => (normalizeTheme(theme) === 'dark' ? 'light' : 'dark');

export const applyTheme = (theme, root = typeof document !== 'undefined' ? document.documentElement : null) => {
  if (root) root.dataset.theme = normalizeTheme(theme);
};

// Pequeno estado global para todos os botões de tema ficarem sincronizados.
let current = null;
const listeners = new Set();

export const getTheme = () => {
  if (current === null) {
    const fromDocument = typeof document !== 'undefined' ? document.documentElement.dataset.theme : null;
    current = THEMES.includes(fromDocument) ? fromDocument : readStoredTheme();
  }
  return current;
};

export const setTheme = (theme) => {
  current = normalizeTheme(theme);
  applyTheme(current);
  writeStoredTheme(current);
  listeners.forEach((listener) => listener());
};

export const toggleTheme = () => setTheme(oppositeTheme(getTheme()));

export const subscribeTheme = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
