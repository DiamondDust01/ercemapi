import React, { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';
import { getTheme, subscribeTheme, toggleTheme } from './theme.js';

export const useTheme = () => useSyncExternalStore(subscribeTheme, getTheme, getTheme);

// Botão de tema. `variant="icon"` para cabeçalhos estreitos; `variant="label"` mostra o texto.
export default function ThemeToggle({ variant = 'icon', className = '' }) {
  const theme = useTheme();
  const nextLabel = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
  const Icon = theme === 'dark' ? Sun : Moon;
  if (variant === 'label') {
    return (
      <button type="button" onClick={toggleTheme} aria-label={nextLabel} className={className}>
        <Icon className="h-5 w-5" aria-hidden="true" />
        <span>{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</span>
      </button>
    );
  }
  return (
    <button type="button" onClick={toggleTheme} aria-label={nextLabel} title={nextLabel} className={className || 'flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-800 hover:text-white'}>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
