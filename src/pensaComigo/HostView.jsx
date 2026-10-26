import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  STAGES, getStage, nextStageId, previousStageId, buildJoinUrl, toCsv, readSessionValue, writeSessionValue
} from './session.js';
import {
  computeExperimentMetrics, summarizePoll, summarizeMissions, countParticipants, countStageProgress,
  summarizeCards, buildParticipantsCsvRows, CARD_LETTERS, MODES
} from './metrics.js';
import { countGroups, modeFor, GROUP_LABELS, GROUPS } from './assignment.js';
import {
  OPENING_POLL, MODE_LABELS, SPEAKER_CHECKLIST, DEMO_SCRIPT, HONESTY_NOTES, WEEKLY_CHALLENGE,
  DETECTIVE_CASES, getDetectiveCase, QUIZ_ITEMS, getItem, THEME_ORDER, EXPERIMENT_THEMES
} from './content.js';
import { buildPrintKit } from './printKit.js';
import ThemeToggle from '../ThemeToggle.jsx';
import { drawNickname, formatParticipantName } from './nicknames.js';
import { buttonPrimary, buttonSecondary, buttonDanger, Card, Notice, Bar, QrCode, downloadText } from './ui.jsx';

const storage = typeof window !== 'undefined' ? window.sessionStorage : null;

// ---------------------------------------------------------------------------
// Telão: tipografia ampliada e contraste reforçado para projetor (D9).
// ---------------------------------------------------------------------------
function TelaoContent({ state, participants, joinUrl, code }) {
  const stage = getStage(state.stage);
  const counts = countParticipants(participants);
  const manualCards = state.manual?.cards?.[state.stage];
  const muted = 'text-slate-300';
  const missions = useMemo(() => summarizeMissions(participants), [participants]);
  const metrics = useMemo(() => computeExperimentMetrics(participants, state.manual), [participants, state.manual]);
  const progress = countStageProgress(participants, state.stage);

  const Progress = () => (counts.devices > 0
    ? <p className={`text-2xl ${muted}`}>{progress} de {counts.devices} aparelhos concluíram</p>
    : null);

  const cards = manualCards && Object.values(manualCards).some((value) => Number(value) > 0) && state.stage !== 'abertura' ? (
    <div className="space-y-3">
      <h3 className="text-2xl font-bold">Cartões levantados</h3>
      {summarizeCards(manualCards).map((card) => <Bar key={card.letter} large label={`Cartão ${card.letter} · ${card.count}`} value={card.pct} color="bg-amber-400" />)}
    </div>
  ) : null;

  if (state.stage === 'abertura') {
    const poll = summarizePoll(participants, manualCards);
    return (
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-4 text-center">
          {joinUrl ? <div className="mx-auto w-fit rounded-2xl bg-[#ffffff] p-3"><QrCode value={joinUrl} size={320} /></div> : null}
          <div className="text-2xl font-semibold">Entre com o código</div>
          <div className="font-mono text-6xl font-black tracking-[0.25em] sm:text-7xl">{code}</div>
          {joinUrl && <div className={`break-all text-lg ${muted}`}>{joinUrl}</div>}
          <div className={`text-xl ${muted}`}>Sem cadastro. Você recebe um apelido sorteado.</div>
        </div>
        <div className="space-y-5">
          <h2 className="text-4xl font-black leading-tight sm:text-5xl">{OPENING_POLL.question}</h2>
          {poll.options.map((option, index) => <Bar key={option.id} large label={`${CARD_LETTERS[index]} · ${option.label} (${option.count})`} value={option.pct} color="bg-green-400" />)}
          <p className={`text-xl ${muted}`}>{poll.total} resposta(s) anônima(s)</p>
        </div>
      </div>
    );
  }

  if (state.stage === 'tente-primeiro') {
    return (
      <div className="space-y-6">
        <h2 className="text-5xl font-black">Tente primeiro</h2>
        <Progress />
        <Bar large label="Acertaram" value={missions.tente.correctPct} color="bg-emerald-400" />
        <Bar large label="Acertaram sem nenhuma dica" value={missions.tente.done ? Math.round((100 * missions.tente.withoutHint) / missions.tente.done) : null} color="bg-green-400" />
        <p className="text-3xl">Média de dicas: <strong className="font-mono">{missions.tente.averageHints}</strong> de 3</p>
        {cards}
      </div>
    );
  }

  if (state.stage === 'remix') {
    return (
      <div className="space-y-6">
        <h2 className="text-5xl font-black">Remix de prompt</h2>
        <Progress />
        <Bar large label="Pontuação média" value={missions.remix.averageScore} max={3} suffix=" de 3" color="bg-green-400" />
        <p className="text-3xl">{missions.remix.perfect} remix(es) com 3 de 3</p>
        <p className="text-3xl">{missions.remix.stillAsksAnswer} ainda pedem a resposta pronta</p>
        <p className={`text-xl ${muted}`}>Os textos ficam nos aparelhos. O telão recebe só a pontuação.</p>
        {cards}
      </div>
    );
  }

  if (state.stage === 'me-teste') {
    return (
      <div className="space-y-6">
        <h2 className="text-5xl font-black">Me teste</h2>
        <Progress />
        <Bar large label="Pontos da turma (respondeu antes de ver o gabarito)" value={missions.meTeste.pointsPct} color="bg-emerald-400" />
        <p className="text-3xl">{missions.meTeste.peeked} espiada(s) no gabarito antes de responder</p>
        {cards}
      </div>
    );
  }

  if (state.stage === 'detetive') {
    return (
      <div className="space-y-6">
        <h2 className="text-5xl font-black">Detetive de erros</h2>
        <Progress />
        {missions.detective.cases.map((caseData) => {
          const source = getDetectiveCase(DETECTIVE_CASES.find((entry) => entry.id === caseData.id));
          return <Bar key={caseData.id} large label={`${source.title} · ${source.hasError ? 'tinha erro' : 'estava certa'}`} value={caseData.pct} color={source.hasError ? 'bg-green-400' : 'bg-emerald-400'} />;
        })}
        <p className={`text-xl ${muted}`}>% da turma que julgou certo cada resposta da "IA".</p>
        {cards}
      </div>
    );
  }

  if (state.stage === 'experimento' || state.stage === 'quiz') {
    const groupCounts = countGroups(state.assignments);
    return (
      <div className="space-y-6">
        <h2 className="text-5xl font-black">{state.stage === 'quiz' ? 'Quiz sem IA' : 'Copiar × estudar ativamente'}</h2>
        <Progress />
        <div className="grid gap-4 sm:grid-cols-2">
          {GROUPS.map((group) => (
            <div key={group} className={`rounded-2xl border-2 p-5 border-slate-600`}>
              <div className="text-3xl font-black">{GROUP_LABELS[group]} · {groupCounts[group]}</div>
              <ul className="mt-2 space-y-1 text-2xl">
                {THEME_ORDER.map((themeId) => <li key={themeId}>Tema {themeId} ({EXPERIMENT_THEMES[themeId].title}): {MODE_LABELS[modeFor(group, themeId)]}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <p className={`text-xl ${muted}`}>Todo mundo passa pelos dois modos, em temas diferentes.</p>
      </div>
    );
  }

  if (state.stage === 'resultado' || state.stage === 'reteste') {
    const isRetest = state.stage === 'reteste';
    return (
      <div className="space-y-8">
        <h2 className="text-5xl font-black">{isRetest ? 'Re-teste: o que ficou?' : 'O que aconteceu na nossa turma?'}</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {MODES.map((mode) => {
            const stats = metrics[mode];
            return (
              <div key={mode} className={`space-y-5 rounded-2xl border-2 p-5 ${mode === 'copiar' ? 'border-fuchsia-400' : 'border-sky-400'}`}>
                <div className="text-3xl font-black">{MODE_LABELS[mode]}</div>
                {isRetest ? (
                  <>
                    <Bar large label="Quiz no dia da palestra" value={stats.quizPct} color="bg-green-400" />
                    <Bar large label="Re-teste" value={stats.retestPct} color={mode === 'copiar' ? 'bg-fuchsia-400' : 'bg-sky-400'} />
                  </>
                ) : (
                  <>
                    <Bar large label="1. Acertos na atividade (com IA)" value={stats.activityPct} color="bg-green-400" />
                    <Bar large label="2. Acertos no quiz sem IA" value={stats.quizPct} color={mode === 'copiar' ? 'bg-fuchsia-400' : 'bg-sky-400'} />
                    <p className={`text-xl ${muted}`}>Pergunta igual: {stats.identicalPct ?? '—'}% · pergunta parecida: {stats.similarPct ?? '—'}%</p>
                    <Bar large label="3. Estavam seguros e erraram" value={stats.sureWrongPct} color="bg-amber-400" />
                    <p className={`text-xl ${muted}`}>{stats.confidence.sureWrong} de {stats.confidence.sure} respostas "Tenho certeza"</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <p className={`rounded-2xl border-2 p-4 text-2xl border-amber-400 bg-amber-500/15 text-amber-100`}>
          Isto é uma demonstração com a nossa turma, não uma prova científica. Com poucos alunos o resultado varia muito e pode sair diferente do esperado. Mostramos como veio.
        </p>
        {metrics.hasManual && <p className={`text-xl ${muted}`}>Inclui contagens das folhas de papel.</p>}
      </div>
    );
  }

  if (state.stage === 'fechamento') {
    return (
      <div className="space-y-6">
        <h2 className="text-5xl font-black">Desafio da semana</h2>
        <ol className="space-y-4 text-3xl">
          {WEEKLY_CHALLENGE.map((item, index) => <li key={item.text}><strong>{index + 1}.</strong> {item.text}</li>)}
        </ol>
        <p className="text-3xl font-bold text-green-400">Anote no caderno o código de retorno que aparece no seu aparelho.</p>
      </div>
    );
  }

  return <p className="text-3xl">{stage.label}</p>;
}

function Telao({ state, participants, joinUrl, code, onClose }) {
  const containerRef = useRef(null);
  const counts = countParticipants(participants);
  const simulated = participants.filter((participant) => participant.simulated).length;

  const fullscreen = () => {
    const element = containerRef.current;
    if (!element) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else element.requestFullscreen?.().catch(() => {});
  };

  return createPortal(
    <div ref={containerRef} className={`fixed inset-0 z-[60] overflow-y-auto bg-black text-white`} role="dialog" aria-label="Telão do Pensa Comigo">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        <header className={`mb-8 flex flex-wrap items-center justify-between gap-4 border-b-2 pb-4 border-slate-700`}>
          <div>
            <div className="text-xl font-bold uppercase tracking-widest text-green-500">Pensa Comigo · {getStage(state.stage).label}</div>
            <div className="text-2xl">Sala <span className="font-mono font-black tracking-widest">{code}</span> · {counts.devices} aparelho(s){counts.duplas ? ` · ${counts.duplas} dupla(s)` : ''}</div>
            {simulated > 0 && <div className="text-xl font-bold text-amber-500">Inclui {simulated} participante(s) simulado(s) para ensaio</div>}
          </div>
          <div className="flex flex-wrap gap-2">
            <ThemeToggle variant="label" className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-slate-500 px-4 text-lg font-bold" />
            <button type="button" onClick={fullscreen} className={`min-h-11 rounded-xl border-2 px-4 text-lg font-bold border-slate-500`}>Tela cheia</button>
            <button type="button" onClick={onClose} className="min-h-11 rounded-xl bg-green-700 px-4 text-lg font-bold text-white">Voltar ao painel</button>
          </div>
        </header>
        <TelaoContent state={state} participants={participants} joinUrl={joinUrl} code={code} />
      </div>
    </div>,
    document.body
  );
}

// ---------------------------------------------------------------------------
// Painel do palestrante
// ---------------------------------------------------------------------------
const Stepper = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-700 p-2">
    <span className="text-sm text-slate-200">{label}</span>
    <div className="flex items-center gap-1">
      <button type="button" aria-label={`Diminuir ${label}`} onClick={() => onChange(Math.max(0, (Number(value) || 0) - 1))} className="h-10 w-10 rounded-lg border border-slate-600 text-lg text-white">−</button>
      <input aria-label={label} inputMode="numeric" value={value || 0} onChange={(event) => onChange(Math.max(0, Number.parseInt(event.target.value, 10) || 0))} className="h-10 w-14 rounded-lg border border-slate-700 bg-slate-950 text-center font-mono text-white" />
      <button type="button" aria-label={`Aumentar ${label}`} onClick={() => onChange((Number(value) || 0) + 1)} className="h-10 w-10 rounded-lg border border-slate-600 text-lg text-white">+</button>
    </div>
  </div>
);

const MANUAL_FIELDS = [
  ['participants', 'Participantes'],
  ['activityCorrect', 'Acertos na atividade'],
  ['activityTotal', 'Questões da atividade'],
  ['quizCorrect', 'Acertos no quiz'],
  ['quizTotal', 'Questões do quiz'],
  ['sure', 'Respostas "Tenho certeza"'],
  ['sureWrong', '"Tenho certeza" e erraram'],
  ['retestCorrect', 'Acertos no re-teste'],
  ['retestTotal', 'Questões do re-teste']
];

const seeded = (seed) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 2 ** 32;
  };
};

// Turma simulada para ensaiar o telão (só na demonstração local). As chances de acerto
// são as mesmas nos dois modos: a simulação não fabrica o resultado esperado.
const buildSimulatedParticipants = (count, assignmentsOffset = 0) => {
  const random = seeded(2026 + assignmentsOffset);
  return Array.from({ length: count }, (_, index) => {
    const group = GROUPS[index % 2];
    const pick = (probability) => random() < probability;
    const themes = {};
    THEME_ORDER.forEach((themeId) => {
      const mode = modeFor(group, themeId);
      const items = {};
      EXPERIMENT_THEMES[themeId].activity.forEach((id) => { items[String(id)] = { correct: pick(0.75), hints: mode === 'ativo' ? Math.floor(random() * 4) : 0, attempts: 1 }; });
      themes[themeId] = { mode, done: true, items };
    });
    const quiz = {};
    QUIZ_ITEMS.forEach((quizItem) => {
      quiz[String(quizItem.itemId)] = { theme: quizItem.theme, kind: quizItem.kind, mode: modeFor(group, quizItem.theme), correct: pick(0.65), confidence: 1 + Math.floor(random() * 3) };
    });
    return {
      uid: `sim-${String(index + 1).padStart(2, '0')}`,
      data: {
        simulated: true,
        nickname: drawNickname(random),
        kind: random() < 0.2 ? 'dupla' : 'solo',
        joinedAt: new Date(Date.now() + index).toISOString(),
        group,
        poll: OPENING_POLL.options[Math.floor(random() * OPENING_POLL.options.length)].id,
        missions: {
          'tente-primeiro': { done: true, correct: pick(0.7), hints: Math.floor(random() * 4) },
          remix: { done: true, score: Math.floor(random() * 4), stillAsksAnswer: pick(0.3) },
          'me-teste': { done: true, points: Math.floor(random() * 4), total: 3, peeked: pick(0.2) ? 1 : 0 },
          detetive: { done: true, results: Object.fromEntries(DETECTIVE_CASES.map((caseData) => [caseData.id, { judgedCorrectly: pick(0.6) }])) }
        },
        experiment: { group, themes, quiz, quizDone: true }
      }
    };
  });
};

export default function HostView({ transport, code, title, state, participants, joinBase, onEnd, onShowAsStudent }) {
  const [showTelao, setShowTelao] = useState(false);
  const [message, setMessage] = useState('');
  const [checklist, setChecklist] = useState(() => readSessionValue(storage, 'speaker-checklist', SPEAKER_CHECKLIST.map(() => false)));
  const joinUrl = buildJoinUrl(joinBase.baseUrl, code);
  const counts = countParticipants(participants);
  const groupCounts = countGroups(state.assignments);
  const stage = getStage(state.stage);
  const isLocal = transport.kind === 'local';

  useEffect(() => { writeSessionValue(storage, 'speaker-checklist', checklist); }, [checklist]);

  const update = (patch, okMessage = '') => transport.updateState(code, patch)
    .then(() => okMessage && setMessage(okMessage))
    .catch(() => setMessage('A alteração não foi sincronizada. Ela será reenviada quando a conexão voltar, se possível.'));

  const setStage = (stageId) => update({ stage: stageId });
  const manualCards = state.manual?.cards?.[state.stage] || {};
  const manualExperiment = state.manual?.experiment || {};

  const exportCsv = () => downloadText('pensa-comigo-turma-anonimizado.csv', toCsv(buildParticipantsCsvRows(participants)), 'text/csv;charset=utf-8');
  const downloadKit = () => downloadText('pensa-comigo-kit-impresso.html', buildPrintKit({ title, roomCode: code }).html, 'text/html;charset=utf-8');
  const simulate = async () => {
    const simulatedParticipants = buildSimulatedParticipants(28, participants.length);
    await Promise.all(simulatedParticipants.map((participant) => transport.updateParticipant(code, participant.uid, participant.data)));
    setMessage('Turma simulada criada para ensaio. O telão avisa que há dados simulados.');
  };

  return (
    <div className="space-y-5">
      {showTelao && <Telao state={state} participants={participants} joinUrl={joinUrl} code={code} onClose={() => setShowTelao(false)} />}

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-mono uppercase tracking-widest text-green-300">Painel do palestrante</div>
            <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>
            <div className="mt-2 font-mono text-4xl font-black tracking-[0.25em] text-white">{code}</div>
            <p className="mt-1 text-sm text-slate-400">{isLocal ? 'Demonstração local: só neste aparelho (e em outras abas deste navegador). Configure o Firebase para receber os celulares da turma.' : 'Sala sincronizada pelo Firestore. Sem conexão direta entre aparelhos.'}</p>
            {joinUrl && <p className="mt-1 break-all text-sm text-green-200">{joinUrl}</p>}
            {joinBase.warning && <div className="mt-2"><Notice tone="warn">{joinBase.warning}</Notice></div>}
          </div>
          {joinUrl && <QrCode value={joinUrl} size={160} />}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={buttonPrimary} onClick={() => setShowTelao(true)}>Mostrar telão</button>
          {isLocal && <button type="button" className={buttonSecondary} onClick={onShowAsStudent}>Ensaiar como aluno nesta aba</button>}
          <button type="button" className={buttonDanger} onClick={onEnd}>Encerrar neste aparelho</button>
        </div>
        {message && <div className="mt-3"><Notice>{message}</Notice></div>}
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-white">Etapas</h3>
        <p className="text-sm text-slate-400">Etapa atual: <strong className="text-white">{stage.label}</strong> · {countStageProgress(participants, state.stage)} de {counts.devices} aparelhos concluíram.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={buttonSecondary} onClick={() => setStage(previousStageId(state.stage))}>Etapa anterior</button>
          <button type="button" className={buttonPrimary} onClick={() => setStage(nextStageId(state.stage))}>Próxima etapa</button>
        </div>
        <ol className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {STAGES.map((item, index) => (
            <li key={item.id}>
              <button type="button" aria-current={item.id === state.stage ? 'step' : undefined} onClick={() => setStage(item.id)} className={`flex min-h-11 w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${item.id === state.stage ? 'border-green-400 bg-green-500/15 text-white' : 'border-slate-700 text-slate-300 hover:border-slate-500'}`}>
                <span>{index + 1}. {item.label}</span>
                <span className="font-mono text-xs text-slate-400">{countStageProgress(participants, item.id)}</span>
              </button>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-bold text-white">Participantes</h3>
          <p className="mt-1 text-sm text-slate-300">{counts.devices} aparelho(s) · {counts.duplas} dupla(s) · cerca de {counts.people} pessoa(s)</p>
          <p className="text-sm text-slate-300">{GROUP_LABELS['copiar-A']}: {groupCounts['copiar-A']} · {GROUP_LABELS['ativo-A']}: {groupCounts['ativo-A']} (distribuição alternada pela ordem de entrada)</p>
          <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-sm text-slate-300">
            {participants.map((participant) => (
              <li key={participant.uid} className="flex justify-between gap-2 border-b border-slate-800 py-1">
                <span>{formatParticipantName(participant.nickname || 'Sem apelido', participant.kind)}{participant.simulated ? ' (simulado)' : ''}</span>
                <span className="text-slate-500">{GROUP_LABELS[state.assignments?.[participant.uid]?.group] || 'sorteando…'}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={buttonSecondary} disabled={!participants.length} onClick={exportCsv}>Exportar turma (CSV anonimizado)</button>
            {isLocal && <button type="button" className={buttonSecondary} onClick={simulate}>Simular turma para ensaio</button>}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-white">Liberações</h3>
          {[
            ['freePlay', 'Liberar "Escolha seu desafio" para os alunos'],
            ['unlocks.advanced', 'Mostrar desafios avançados'],
            ['unlocks.hidden', 'Mostrar conteúdo oculto (programação dinâmica e demais desafios)']
          ].map(([path, label]) => {
            const value = path.split('.').reduce((acc, key) => acc?.[key], state);
            return (
              <label key={path} className="mt-2 flex items-start gap-2 text-sm text-slate-200">
                <input type="checkbox" className="mt-1 h-4 w-4" checked={Boolean(value)} onChange={() => update({ [path]: !value })} />
                {label}
              </label>
            );
          })}
          <p className="mt-2 text-xs text-slate-500">As questões do experimento só entram no menu depois do resultado.</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-bold text-white">Modo sem celular</h3>
        <p className="text-sm text-slate-400">Conte os cartões A, B, C e D levantados na etapa atual ({stage.short}). Os números vão para o telão e funcionam mesmo sem rede.</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CARD_LETTERS.map((letter, index) => (
            <Stepper key={letter} label={state.stage === 'abertura' ? `${letter} · ${OPENING_POLL.options[index].label}` : `Cartão ${letter}`} value={manualCards[letter]} onChange={(value) => update({ [`manual.cards.${state.stage}.${letter}`]: value })} />
          ))}
        </div>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-100">Lançar o experimento feito em papel</summary>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            {MODES.map((mode) => (
              <fieldset key={mode} className="space-y-2">
                <legend className="text-sm font-bold text-white">{MODE_LABELS[mode]}</legend>
                {MANUAL_FIELDS.map(([field, label]) => (
                  <Stepper key={field} label={label} value={manualExperiment[mode]?.[field]} onChange={(value) => update({ [`manual.experiment.${mode}.${field}`]: value })} />
                ))}
              </fieldset>
            ))}
          </div>
        </details>
        <button type="button" className={`${buttonSecondary} mt-4`} onClick={downloadKit}>Baixar kit impresso (cartões, folhas por grupo, quiz, re-teste e gabarito)</button>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-bold text-white">Checklist do palestrante</h3>
          <ul className="mt-2 space-y-2">
            {SPEAKER_CHECKLIST.map((item, index) => (
              <li key={item}>
                <label className="flex items-start gap-2 text-sm text-slate-200">
                  <input type="checkbox" className="mt-1 h-4 w-4" checked={Boolean(checklist[index])} onChange={() => setChecklist((previous) => previous.map((value, position) => (position === index ? !value : value)))} />
                  {item}
                </label>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-white">Roteiro: modos de estudo das ferramentas de IA</h3>
          <p className="text-sm text-slate-400">Demonstração feita por você, no telão. Os alunos praticam no tutor do app.</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-200">{DEMO_SCRIPT.map((step) => <li key={step}>{step}</li>)}</ol>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-bold text-white">O que não afirmar</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">{HONESTY_NOTES.map((note) => <li key={note}>{note}</li>)}</ul>
        <details className="mt-3 text-sm text-slate-300">
          <summary className="cursor-pointer font-semibold text-slate-100">Gabarito do quiz</summary>
          <ul className="mt-2 space-y-1">
            {QUIZ_ITEMS.map((quizItem) => {
              const item = getItem(quizItem.itemId);
              return <li key={quizItem.itemId}>Tema {quizItem.theme} ({quizItem.kind === 'identical' ? 'igual' : 'parecida'}): {item.options[item.correct]}</li>;
            })}
          </ul>
        </details>
      </Card>
    </div>
  );
}
