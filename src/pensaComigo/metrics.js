// Métricas agregadas do Pensa Comigo, calculadas a partir dos registros dos participantes
// (subcoleção do Firestore ou demonstração local) e das contagens lançadas à mão pelo
// palestrante no modo sem celular. Nenhuma métrica usa texto livre dos alunos.

import { OPENING_POLL, DETECTIVE_CASES } from './content.js';

export const MODES = ['copiar', 'ativo'];

export const percent = (correct, total) => (total > 0 ? Math.round((100 * correct) / total) : null);

const counter = () => ({ correct: 0, total: 0 });

const emptyModeStats = () => ({
  participants: 0,
  activity: counter(),
  hints: 0,
  quiz: { ...counter(), identical: counter(), similar: counter() },
  confidence: { sure: 0, sureWrong: 0, byLevel: { 1: counter(), 2: counter(), 3: counter() } },
  retest: counter()
});

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
};

export const computeExperimentMetrics = (participants = [], manual = null) => {
  const stats = { copiar: emptyModeStats(), ativo: emptyModeStats() };
  let participantsWithData = 0;

  participants.forEach((participant) => {
    const experiment = participant?.experiment;
    let hasData = false;
    Object.values(experiment?.themes || {}).forEach((theme) => {
      const modeStats = stats[theme?.mode];
      if (!modeStats) return;
      const items = Object.values(theme.items || {});
      if (!items.length) return;
      hasData = true;
      modeStats.participants += 1;
      items.forEach((item) => {
        modeStats.activity.total += 1;
        if (item.correct) modeStats.activity.correct += 1;
        modeStats.hints += toNumber(item.hints);
      });
    });
    Object.values(experiment?.quiz || {}).forEach((answer) => {
      const modeStats = stats[answer?.mode];
      if (!modeStats) return;
      hasData = true;
      modeStats.quiz.total += 1;
      if (answer.correct) modeStats.quiz.correct += 1;
      const kind = modeStats.quiz[answer.kind];
      if (kind) {
        kind.total += 1;
        if (answer.correct) kind.correct += 1;
      }
      const level = modeStats.confidence.byLevel[Number(answer.confidence)];
      if (level) {
        level.total += 1;
        if (answer.correct) level.correct += 1;
      }
      if (Number(answer.confidence) === 3) {
        modeStats.confidence.sure += 1;
        if (!answer.correct) modeStats.confidence.sureWrong += 1;
      }
    });
    Object.values(participant?.retest?.answers || {}).forEach((answer) => {
      const modeStats = stats[answer?.mode];
      if (!modeStats) return;
      modeStats.retest.total += 1;
      if (answer.correct) modeStats.retest.correct += 1;
    });
    if (hasData) participantsWithData += 1;
  });

  const manualExperiment = manual?.experiment || {};
  MODES.forEach((mode) => {
    const entry = manualExperiment[mode];
    if (!entry) return;
    const modeStats = stats[mode];
    modeStats.participants += toNumber(entry.participants);
    modeStats.activity.correct += toNumber(entry.activityCorrect);
    modeStats.activity.total += toNumber(entry.activityTotal);
    modeStats.quiz.correct += toNumber(entry.quizCorrect);
    modeStats.quiz.total += toNumber(entry.quizTotal);
    modeStats.confidence.sure += toNumber(entry.sure);
    modeStats.confidence.sureWrong += toNumber(entry.sureWrong);
    modeStats.retest.correct += toNumber(entry.retestCorrect);
    modeStats.retest.total += toNumber(entry.retestTotal);
  });

  const summarize = (modeStats) => ({
    ...modeStats,
    activityPct: percent(modeStats.activity.correct, modeStats.activity.total),
    quizPct: percent(modeStats.quiz.correct, modeStats.quiz.total),
    identicalPct: percent(modeStats.quiz.identical.correct, modeStats.quiz.identical.total),
    similarPct: percent(modeStats.quiz.similar.correct, modeStats.quiz.similar.total),
    sureWrongPct: percent(modeStats.confidence.sureWrong, modeStats.confidence.sure),
    retestPct: percent(modeStats.retest.correct, modeStats.retest.total)
  });

  return {
    copiar: summarize(stats.copiar),
    ativo: summarize(stats.ativo),
    participantsWithData,
    hasManual: MODES.some((mode) => manualExperiment[mode] && Object.values(manualExperiment[mode]).some((value) => toNumber(value) > 0))
  };
};

// Enquete de abertura: votos dos aparelhos + cartões contados pelo palestrante.
// Cartão A = 1ª opção, B = 2ª, C = 3ª, D = 4ª.
export const CARD_LETTERS = ['A', 'B', 'C', 'D'];

export const summarizePoll = (participants = [], manualCards = null) => {
  const counts = Object.fromEntries(OPENING_POLL.options.map((option) => [option.id, 0]));
  participants.forEach((participant) => {
    if (participant?.poll && participant.poll in counts) counts[participant.poll] += 1;
  });
  OPENING_POLL.options.forEach((option, index) => {
    counts[option.id] += toNumber(manualCards?.[CARD_LETTERS[index]]);
  });
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return {
    total,
    options: OPENING_POLL.options.map((option) => ({ ...option, count: counts[option.id], pct: percent(counts[option.id], total) }))
  };
};

export const summarizeMissions = (participants = []) => {
  const tente = { done: 0, correct: 0, withoutHint: 0, hints: 0 };
  const remix = { done: 0, scoreSum: 0, perfect: 0, stillAsksAnswer: 0 };
  const meTeste = { done: 0, points: 0, maxPoints: 0, peeked: 0 };
  const detective = Object.fromEntries(DETECTIVE_CASES.map((caseData) => [caseData.id, { answered: 0, judgedCorrectly: 0 }]));
  let detectiveDone = 0;

  participants.forEach((participant) => {
    const missions = participant?.missions || {};
    const t = missions['tente-primeiro'];
    if (t?.done) {
      tente.done += 1;
      if (t.correct) tente.correct += 1;
      if (t.correct && !toNumber(t.hints)) tente.withoutHint += 1;
      tente.hints += toNumber(t.hints);
    }
    const r = missions.remix;
    if (r?.done) {
      remix.done += 1;
      remix.scoreSum += toNumber(r.score);
      if (toNumber(r.score) === 3) remix.perfect += 1;
      if (r.stillAsksAnswer) remix.stillAsksAnswer += 1;
    }
    const m = missions['me-teste'];
    if (m?.done) {
      meTeste.done += 1;
      meTeste.points += toNumber(m.points);
      meTeste.maxPoints += toNumber(m.total);
      meTeste.peeked += toNumber(m.peeked);
    }
    const d = missions.detetive;
    if (d?.done) detectiveDone += 1;
    Object.entries(d?.results || {}).forEach(([caseId, result]) => {
      if (!detective[caseId]) return;
      detective[caseId].answered += 1;
      if (result?.judgedCorrectly) detective[caseId].judgedCorrectly += 1;
    });
  });

  return {
    tente: { ...tente, correctPct: percent(tente.correct, tente.done), averageHints: tente.done ? Number((tente.hints / tente.done).toFixed(1)) : 0 },
    remix: { ...remix, averageScore: remix.done ? Number((remix.scoreSum / remix.done).toFixed(1)) : 0 },
    meTeste: { ...meTeste, pointsPct: percent(meTeste.points, meTeste.maxPoints) },
    detective: {
      done: detectiveDone,
      cases: DETECTIVE_CASES.map((caseData) => ({ id: caseData.id, ...detective[caseData.id], pct: percent(detective[caseData.id].judgedCorrectly, detective[caseData.id].answered) }))
    }
  };
};

export const summarizeCards = (cards = {}) => {
  const total = CARD_LETTERS.reduce((sum, letter) => sum + toNumber(cards?.[letter]), 0);
  return CARD_LETTERS.map((letter) => ({ letter, count: toNumber(cards?.[letter]), pct: percent(toNumber(cards?.[letter]), total) }));
};

export const countParticipants = (participants = []) => ({
  devices: participants.length,
  duplas: participants.filter((participant) => participant?.kind === 'dupla').length,
  people: participants.reduce((sum, participant) => sum + (participant?.kind === 'dupla' ? 2 : 1), 0)
});

// Progresso numa etapa: quantos aparelhos já concluíram.
export const countStageProgress = (participants = [], stageId) => participants.filter((participant) => {
  if (stageId === 'abertura') return Boolean(participant?.poll);
  if (stageId === 'experimento') return ['A', 'B'].every((theme) => participant?.experiment?.themes?.[theme]?.done);
  if (stageId === 'quiz') return Boolean(participant?.experiment?.quizDone);
  if (stageId === 'reteste') return Boolean(participant?.retest?.done);
  return Boolean(participant?.missions?.[stageId]?.done);
}).length;

// Linhas da exportação anonimizada (mesmo padrão do Professor): só apelido sorteado,
// grupo e contagens. Nenhum texto livre.
export const buildParticipantsCsvRows = (participants = []) => {
  const header = [
    'apelido_sorteado', 'tipo', 'grupo', 'enquete',
    'atividade_copiar_acertos', 'atividade_copiar_total', 'atividade_ativo_acertos', 'atividade_ativo_total', 'dicas_modo_ativo',
    'quiz_copiar_acertos', 'quiz_copiar_total', 'quiz_ativo_acertos', 'quiz_ativo_total', 'seguros_que_erraram',
    'reteste_acertos', 'reteste_total', 'remix_pontos', 'detetive_acertos'
  ];
  const rows = participants.map((participant) => {
    const per = { copiar: { a: 0, t: 0, q: 0, qt: 0 }, ativo: { a: 0, t: 0, q: 0, qt: 0 } };
    let hints = 0;
    let sureWrong = 0;
    Object.values(participant?.experiment?.themes || {}).forEach((theme) => {
      if (!per[theme?.mode]) return;
      Object.values(theme.items || {}).forEach((item) => {
        per[theme.mode].t += 1;
        if (item.correct) per[theme.mode].a += 1;
        if (theme.mode === 'ativo') hints += toNumber(item.hints);
      });
    });
    Object.values(participant?.experiment?.quiz || {}).forEach((answer) => {
      if (!per[answer?.mode]) return;
      per[answer.mode].qt += 1;
      if (answer.correct) per[answer.mode].q += 1;
      if (Number(answer.confidence) === 3 && !answer.correct) sureWrong += 1;
    });
    const retest = Object.values(participant?.retest?.answers || {});
    const detective = Object.values(participant?.missions?.detetive?.results || {});
    return [
      participant?.nickname || '', participant?.kind || 'solo', participant?.group || '', participant?.poll || '',
      per.copiar.a, per.copiar.t, per.ativo.a, per.ativo.t, hints,
      per.copiar.q, per.copiar.qt, per.ativo.q, per.ativo.qt, sureWrong,
      retest.filter((answer) => answer.correct).length, retest.length,
      participant?.missions?.remix?.score ?? '', detective.filter((result) => result?.judgedCorrectly).length
    ];
  });
  return [header, ...rows];
};
