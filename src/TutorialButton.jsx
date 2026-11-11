import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleHelp, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { findTourTarget, placeBalloon } from './tour.js';

// Tutorial guiado (1.8.0). O botão "?" ao lado do botão de tema percorre as funções da
// tela: cada etapa contorna um elemento marcado com `data-tour` e mostra um balão de
// explicação ao lado. Etapas cujo elemento não está visível na tela atual são puladas
// (ex.: a barra de baixo só aparece no celular). Nada é gravado no aparelho.
//
// `target` aceita uma lista de seletores; vale o primeiro visível. Sem `target`, o
// balão aparece no centro, sem destaque.
const tour = (name) => `[data-tour="${name}"]`;

export const TUTORIALS = {
  selector: {
    title: 'Como usar o ERCEMAPI',
    steps: [
      { title: 'Bem-vindo ao ERCEMAPI', text: 'Este passo a passo mostra as funções da tela. Use Próximo e Anterior, ou as setas do teclado. Esc fecha.' },
      { target: tour('mode-obi'), title: 'OBI Quest', text: 'Treino para a Olimpíada Brasileira de Informática: questões de Iniciação com cronômetro, desafios em C++ e Python, mentoria e salas de competição.' },
      { target: tour('mode-pensa'), title: 'Pensa Comigo', text: 'Para palestras com turmas de 11 a 14 anos sobre estudar com IA sem copiar. Os alunos entram pelo código ou pelo QR, sem cadastro.' },
      { target: tour('theme'), title: 'Tema claro ou escuro', text: 'Alterna entre o tema claro e o escuro. A escolha fica salva neste aparelho.' },
      { target: tour('tutorial'), title: 'Rever o tutorial', text: 'Toque aqui sempre que quiser ver este passo a passo de novo. Cada tela tem o seu.' }
    ]
  },
  obi: {
    title: 'Tutorial do OBI Quest',
    steps: [
      { target: tour('obi-home'), title: 'Início', text: 'Toque no nome para voltar ao início, com seu perfil local, o progresso resumido e atalhos para os módulos.' },
      { target: [tour('nav-iniciacao'), tour('nav-iniciacao-mobile')], title: 'Iniciação', text: 'Questões objetivas de lógica e interpretação, com faixa, dificuldade, pontuação e cronômetro.' },
      { target: [tour('nav-programacao'), tour('nav-programacao-mobile')], title: 'Programação', text: 'Exercícios em C++ e Python com editor. A verificação é didática e local: procura padrões no código, sem compilar nem executar.' },
      { target: [tour('nav-mentor'), tour('nav-mentor-mobile')], title: 'IA Mentora', text: 'Pistas e ferramentas para comparar tentativas, revisar erros e registrar reflexões. As explicações são predefinidas; não é uma IA generativa.' },
      { target: [tour('nav-academy'), tour('nav-academy-mobile')], title: 'Regras', text: 'Material educativo sobre as modalidades e a preparação. Não é material oficial da OBI.' },
      { target: tour('obi-competicao'), title: 'Competição em sala', text: 'Crie uma sala, compartilhe o código e use o cronômetro para simular uma rodada, com até 16 participantes.' },
      { target: tour('switch-mode'), title: 'Trocar de modo', text: 'Volta para a tela de escolha entre OBI Quest e Pensa Comigo.' },
      { target: tour('theme'), title: 'Tema', text: 'Alterna entre o tema claro e o escuro.' },
      { target: tour('obi-score'), title: 'Pontos', text: 'Sua pontuação acumulada nos treinos.' },
      { target: tour('obi-audio'), title: 'Som', text: 'Liga ou desliga os efeitos sonoros.' }
    ]
  },
  pensa: {
    title: 'Tutorial do Pensa Comigo',
    steps: [
      { target: tour('pensa-intro'), title: 'A ideia', text: 'A IA pode ser um tutor que ajuda a pensar, e não uma ferramenta que pensa por você. A turma testa isso na prática, durante a palestra.' },
      { target: tour('pensa-student'), title: 'Sou estudante', text: 'Entre com o código do telão (ou pelo QR). O apelido é sorteado; ninguém digita nome.' },
      { target: tour('pensa-host'), title: 'Sou palestrante', text: 'Abre uma sala, projeta o telão e conduz as etapas da palestra.' },
      { target: tour('pensa-solo'), title: 'Praticar sozinho', text: 'Escolha um desafio e estude com o tutor, sem sala.' },
      { target: tour('pensa-quick-config'), title: 'Configuração rápida', text: 'Opcional: escolha o formato, as etapas e as questões da palestra antes de criar a sala.' },
      { target: tour('pensa-create'), title: 'Criar sala', text: 'Gera o código e o QR da sala. Sem configuração, vale a palestra completa.' },
      { target: tour('host-telao'), title: 'Telão', text: 'Abre a tela para o projetor, com letras grandes, o QR de entrada e os resultados da turma.' },
      { target: tour('host-stages'), title: 'Etapas', text: 'Avance, volte ou pule para qualquer etapa. Os aparelhos dos alunos mudam sozinhos.' },
      { target: tour('host-config'), title: 'Configuração da sala', text: 'Mostra o formato escolhido. "Editar" troca etapas e questões durante a palestra.' },
      { target: tour('host-offline'), title: 'Sem celular', text: 'Conte os cartões A, B, C e D levantados pela turma e baixe o kit impresso, para usar sem rede.' },
      { target: tour('switch-mode'), title: 'Trocar de modo', text: 'Volta para a tela de escolha entre OBI Quest e Pensa Comigo.' },
      { target: tour('tutorial'), title: 'Rever o tutorial', text: 'Cada tela tem o seu passo a passo. Abra de novo em "Abrir sala" ou no painel do palestrante para conhecer os controles da sala.' }
    ]
  }
};

const ACCENTS = {
  indigo: { ring: '#818cf8', button: 'bg-indigo-600 hover:bg-indigo-500', label: 'text-cyan-300' },
  green: { ring: '#4ade80', button: 'bg-green-700 hover:bg-green-600', label: 'text-green-300' }
};

const PADDING = 6;

function TourOverlay({ tutorial, accent, onClose }) {
  // Só as etapas com o elemento visível nesta tela (ou sem elemento).
  const [steps] = useState(() => tutorial.steps.filter((item) => !item.target || findTourTarget(item.target)));
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [balloon, setBalloon] = useState(null);
  const balloonRef = useRef(null);
  const colors = ACCENTS[accent] || ACCENTS.indigo;
  const step = steps[index];
  const total = steps.length;
  const last = index === total - 1;

  const measure = useCallback(() => {
    const element = step?.target ? findTourTarget(step.target) : null;
    if (!element) { setRect(null); return; }
    const box = element.getBoundingClientRect();
    // Contorno com folga, mas sem passar das bordas da tela (ex.: barra de baixo no celular).
    const top = Math.max(2, box.top - PADDING);
    const left = Math.max(2, box.left - PADDING);
    const bottom = Math.min(window.innerHeight - 2, box.bottom + PADDING);
    const right = Math.min(window.innerWidth - 2, box.right + PADDING);
    setRect({ top, left, width: Math.max(0, right - left), height: Math.max(0, bottom - top) });
  }, [step]);

  // Ao trocar de etapa, traz o elemento para a tela e mede de novo.
  useLayoutEffect(() => {
    const element = step?.target ? findTourTarget(step.target) : null;
    element?.scrollIntoView?.({ block: 'center', inline: 'nearest' });
    measure();
  }, [step, measure]);

  useEffect(() => {
    let frame = 0;
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
    };
  }, [measure]);

  // Posição do balão depende do tamanho dele, então é calculada depois de renderizar.
  useLayoutEffect(() => {
    const node = balloonRef.current;
    if (!node) return;
    setBalloon(placeBalloon({
      target: rect,
      balloon: { width: node.offsetWidth, height: node.offsetHeight },
      viewport: { width: window.innerWidth, height: window.innerHeight }
    }));
  }, [rect, index]);

  useEffect(() => {
    balloonRef.current?.focus();
  }, [index]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') setIndex((value) => Math.min(total - 1, value + 1));
      if (event.key === 'ArrowLeft') setIndex((value) => Math.max(0, value - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, total]);

  if (!step) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80]" role="presentation">
      {/* Camada que bloqueia cliques na página enquanto o tutorial está aberto. */}
      <div className="absolute inset-0" style={rect ? undefined : { background: 'rgba(2, 6, 23, 0.65)' }} />
      {rect && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-xl transition-all duration-200 ease-out"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: `0 0 0 3px ${colors.ring}, 0 0 0 9999px rgba(2, 6, 23, 0.65)`
          }}
        />
      )}
      <div
        ref={balloonRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
        aria-describedby="tour-step-text"
        className="absolute w-[min(22rem,calc(100vw-24px))] rounded-2xl border border-slate-700 bg-slate-900 p-4 text-slate-200 shadow-2xl outline-none"
        style={balloon ? { top: balloon.top, left: balloon.left } : { top: -9999, left: 0 }}
      >
        {balloon?.arrow && (
          <span
            aria-hidden="true"
            className="absolute h-3 w-3 rotate-45 border-slate-700 bg-slate-900"
            style={balloon.arrow.side === 'top'
              ? { top: -7, left: balloon.arrow.offset - 6, borderLeftWidth: 1, borderTopWidth: 1 }
              : { bottom: -7, left: balloon.arrow.offset - 6, borderRightWidth: 1, borderBottomWidth: 1 }}
          />
        )}
        <div className="flex items-start justify-between gap-3">
          <div className={`text-[11px] font-mono uppercase tracking-widest ${colors.label}`}>{index + 1} de {total}</div>
          <button type="button" onClick={onClose} aria-label="Fechar tutorial" className="-m-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <h2 id="tour-step-title" className="mt-1 text-lg font-black text-white">{step.title}</h2>
        <p id="tour-step-text" className="mt-1 text-sm leading-relaxed text-slate-300" aria-live="polite">{step.text}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button type="button" onClick={onClose} className="text-xs font-semibold text-slate-400 underline-offset-2 hover:text-white hover:underline">Pular tutorial</button>
          <div className="flex gap-2">
            <button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)} aria-label="Etapa anterior" className="inline-flex min-h-10 items-center rounded-xl border border-slate-600 px-3 text-sm font-semibold text-slate-100 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => (last ? onClose() : setIndex(index + 1))} className={`inline-flex min-h-10 items-center gap-1 rounded-xl px-4 text-sm font-bold text-white ${colors.button}`}>
              {last ? 'Concluir' : <>Próximo <ChevronRight className="h-4 w-4" aria-hidden="true" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// `variant="label"` mostra o texto "Tutorial", como o ThemeToggle.
export default function TutorialButton({ context = 'selector', accent = 'indigo', variant = 'icon', className = '' }) {
  const [open, setOpen] = useState(false);
  const tutorial = TUTORIALS[context] || TUTORIALS.selector;
  const close = useCallback(() => setOpen(false), []);
  const common = { type: 'button', onClick: () => setOpen(true), 'aria-label': `Abrir o tutorial: ${tutorial.title}`, 'data-tour': 'tutorial' };
  return (
    <>
      {variant === 'label' ? (
        <button {...common} className={className}>
          <CircleHelp className="h-5 w-5" aria-hidden="true" />
          <span>Tutorial</span>
        </button>
      ) : (
        <button {...common} title="Tutorial" className={className || 'flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-800 hover:text-white'}>
          <CircleHelp className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      {open && <TourOverlay tutorial={tutorial} accent={accent} onClose={close} />}
    </>
  );
}
