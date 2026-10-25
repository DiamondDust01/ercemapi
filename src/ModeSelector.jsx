import React from 'react';
import { Trophy, Lightbulb, ChevronRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle.jsx';
import SelectorBackdrop from './SelectorBackdrop.jsx';

const MODES = [
  {
    id: 'obi',
    icon: Trophy,
    title: 'OBI Quest',
    subtitle: 'Treino para a Olimpíada Brasileira de Informática',
    points: [
      'Questões de Iniciação com cronômetro',
      'Desafios de Programação em C++ e Python',
      'Competição em sala e Oficina de aprendizagem'
    ],
    action: 'Entrar no OBI Quest',
    tone: {
      card: 'border-indigo-500/40 hover:border-indigo-400 focus-within:border-indigo-400',
      icon: 'bg-indigo-500/15 text-indigo-300',
      title: 'from-indigo-300 to-cyan-300',
      button: 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-300',
      bullet: 'text-indigo-300'
    }
  },
  {
    id: 'pensa',
    icon: Lightbulb,
    title: 'Pensa Comigo',
    subtitle: 'Aprender a estudar com IA, sem copiar',
    points: [
      'Palestras em escolas, com telão e etapas',
      'Entrada por código ou QR, sem cadastro',
      'Para estudantes de 11 a 14 anos'
    ],
    action: 'Entrar no Pensa Comigo',
    tone: {
      card: 'border-orange-500/40 hover:border-orange-400 focus-within:border-orange-400',
      icon: 'bg-orange-500/15 text-amber-300',
      title: 'from-amber-300 to-orange-500',
      button: 'bg-orange-700 hover:bg-orange-600 focus-visible:outline-amber-300',
      bullet: 'text-orange-300'
    }
  }
];

// Tela inicial: o usuário escolhe a variação do app. Pode trocar a qualquer momento.
export default function ModeSelector({ onSelect, version, backdrop = <SelectorBackdrop /> }) {
  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[var(--app-bg)] font-sans text-slate-300">
      {backdrop}
      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div className="absolute right-3 top-3 z-20 sm:right-5 sm:top-5"><ThemeToggle /></div>
        <div className="mx-auto flex min-h-full max-w-5xl flex-col justify-center px-4 py-5 md:py-16">
          <div className="mb-5 text-center md:mb-8">
            <div className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-300">Bem-vindo</div>
            <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-white sm:text-5xl">Como você quer usar o app hoje?</h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-400 sm:text-lg">Escolha uma das duas variações. Você pode trocar de modo a qualquer momento.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 md:gap-6">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <article key={mode.id} className={`flex flex-col rounded-[28px] border bg-slate-900/80 p-4 backdrop-blur-sm transition-colors sm:p-6 md:p-8 ${mode.tone.card}`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl sm:h-14 sm:w-14 ${mode.tone.icon}`}>
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
                  </div>
                  <h2 className={`mt-3 bg-gradient-to-r bg-clip-text text-2xl sm:mt-5 sm:text-3xl font-black tracking-tight text-transparent ${mode.tone.title}`}>{mode.title}</h2>
                  <p className="mt-1 text-base font-semibold text-white sm:text-lg">{mode.subtitle}</p>
                  <ul className="mt-2 flex-1 space-y-1 text-sm text-slate-300 sm:mt-4 sm:space-y-2 sm:text-base">
                    {mode.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className={mode.tone.bullet} aria-hidden="true">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => onSelect(mode.id)}
                    className={`mt-4 inline-flex min-h-12 w-full sm:mt-6 items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-bold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${mode.tone.button}`}
                  >
                    {mode.action} <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>

          <div className="mt-5 space-y-1 text-center text-xs text-slate-500 md:mt-8">
            <p>Projeto para a ERCEMAPI · Escola Regional de Computação Ceará, Maranhão e Piauí.</p>
            <p>
              Inspirado na OBI, sem vínculo oficial com a OBI.
              {version ? <span className="ml-2 font-mono">v{version}</span> : null}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
