import React, { useMemo, useState } from 'react';
import TutorItem from './TutorItem.jsx';
import { buildChallengeCatalog, visibleCatalog, AGE_FIT_LABELS } from './catalog.js';
import { buttonSecondary, Card, Notice } from './ui.jsx';

// Bloco opcional: o aluno escolhe um desafio extra, sempre conduzido pelo tutor (M4).
// Na prática solo o cronômetro é opcional (D6).
export default function ChallengePicker({ programming, unlocks = {}, excludeSourceIds = [], soloPractice = false }) {
  const catalog = useMemo(() => buildChallengeCatalog({ programming }), [programming]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [solvedIds, setSolvedIds] = useState([]);
  const [timerOn, setTimerOn] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [now, setNow] = useState(Date.now());

  React.useEffect(() => {
    if (!timerOn || !startedAt) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [timerOn, startedAt]);

  const advancedAllowed = soloPractice || unlocks.advanced || unlocks.hidden;
  const items = visibleCatalog(catalog, {
    advanced: advancedAllowed && showAdvanced,
    hidden: Boolean(unlocks.hidden) && showAdvanced,
    excludeSourceIds
  });
  const groups = items.reduce((acc, item) => {
    const key = item.ageFit === 'liberado' ? item.theme : `${AGE_FIT_LABELS[item.ageFit]} · ${item.theme}`;
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});
  const selected = catalog.find((item) => item.id === selectedId);
  const elapsed = timerOn && startedAt ? Math.floor((now - startedAt) / 1000) : 0;

  if (selected) {
    return (
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <button type="button" className={buttonSecondary} onClick={() => setSelectedId(null)}>Voltar ao menu</button>
          {timerOn && <span className="font-mono text-lg text-amber-200" aria-live="off">{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</span>}
        </div>
        <TutorItem
          key={selected.id}
          item={selected}
          mode="ativo"
          doneLabel="Voltar ao menu"
          onDone={(summary) => {
            if (summary.correct) setSolvedIds((previous) => [...new Set([...previous, selected.id])]);
            setSelectedId(null);
          }}
        />
        <p className="mt-4 text-xs text-slate-500">Origem: {selected.source} · {selected.hintsReview || selected.explanationReview ? 'dicas criadas para o modo (em revisão)' : 'conteúdo original'}</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-2xl font-black text-white">Escolha seu desafio</h2>
      <p className="mt-1 text-slate-300">Desafios extras do OBI Quest. O tutor pede sua tentativa antes de qualquer dica.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {advancedAllowed && (
          <button type="button" aria-pressed={showAdvanced} className={`${buttonSecondary} ${showAdvanced ? 'border-orange-400 text-orange-200' : ''}`} onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? 'Esconder desafios avançados' : 'Mostrar desafios avançados'}
          </button>
        )}
        <button type="button" aria-pressed={timerOn} className={buttonSecondary} onClick={() => { setTimerOn(!timerOn); setStartedAt(Date.now()); setNow(Date.now()); }}>
          {timerOn ? 'Desligar cronômetro' : 'Ligar cronômetro (opcional)'}
        </button>
      </div>
      {excludeSourceIds.length > 0 && <div className="mt-3"><Notice>Algumas questões aparecem aqui só depois do resultado do experimento.</Notice></div>}
      <div className="mt-4 space-y-5">
        {Object.entries(groups).map(([title, groupItems]) => (
          <section key={title}>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">{title}</h3>
            <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {groupItems.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => setSelectedId(item.id)} className="flex min-h-14 w-full items-center justify-between gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left text-slate-100 hover:border-orange-400">
                    <span className="min-w-0">
                      <span className="block font-semibold">{item.title}</span>
                      <span className="block text-xs text-slate-400">{item.level}</span>
                    </span>
                    {solvedIds.includes(item.id) && <span className="shrink-0 text-emerald-300" aria-label="resolvido">✔</span>}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Card>
  );
}
