// Configuração rápida do palestrante (1.8.0): formulário opcional, preenchido ao abrir a
// sala, que escolhe as etapas e as questões da palestra. Fica em `state.config` na sala,
// então todos os aparelhos usam a mesma escolha. Sem configuração, vale o padrão (palestra
// completa), que é exatamente o comportamento anterior.

import { STAGES } from './session.js';
import { MISSIONS, DETECTIVE_CASES, EXPERIMENT_ITEM_IDS, OPENING_POLL, getItem, getHints } from './content.js';

// Etapas que o palestrante pode tirar. Abertura e Fechamento ficam sempre.
// "experimento" liga ou desliga o bloco inteiro: Atividade, Quiz sem IA e Resultado.
// `on` é o padrão: os problemas do minicurso só entram quando alguém os liga.
export const OPTIONAL_STAGES = [
  { id: 'problema-a', label: 'Minicurso · Etapa 1 · Problema A (sem IA)', on: false },
  { id: 'problema-b', label: 'Minicurso · Etapa 2 · Problema B (com IA)', on: false },
  { id: 'tente-primeiro', label: 'Missão 1 · Tente primeiro', on: true },
  { id: 'remix', label: 'Missão 2 · Remix de prompt', on: true },
  { id: 'me-teste', label: 'Missão 3 · Me teste', on: true },
  { id: 'detetive', label: 'Missão 4 · Detetive de erros', on: true },
  { id: 'experimento', label: 'Experimento (atividade, quiz sem IA e resultado)', on: true },
  { id: 'reteste', label: 'Re-teste (outro dia)', on: true }
];

const EXPERIMENT_BLOCK = ['experimento', 'quiz', 'resultado'];

// Questões que podem entrar nas missões 1 e 3: não fazem parte do experimento nem do
// Detetive, para que nenhuma missão adiante a resposta de uma pergunta do quiz.
const DETECTIVE_SOURCE_IDS = DETECTIVE_CASES.filter((caseData) => caseData.sourceId).map((caseData) => String(caseData.sourceId));
const BLOCKED_IDS = new Set([...EXPERIMENT_ITEM_IDS, ...DETECTIVE_SOURCE_IDS]);
export const MISSION_ITEM_IDS = Array.from({ length: 24 }, (_, index) => 101 + index)
  .filter((id) => !BLOCKED_IDS.has(String(id)) && getItem(id) && getHints(id).length === 3);

export const MAX_ME_TESTE_ITEMS = 3;
export const POLL_QUESTION_MAX = 120;

export const DEFAULT_CONFIG = Object.freeze({
  preset: 'completa',
  stages: Object.freeze(Object.fromEntries(OPTIONAL_STAGES.map((stage) => [stage.id, stage.on]))),
  tenteItemId: MISSIONS['tente-primeiro'].itemId,
  meTesteItemIds: Object.freeze([...MISSIONS['me-teste'].itemIds]),
  detectiveCaseIds: Object.freeze(DETECTIVE_CASES.map((caseData) => caseData.id)),
  pollQuestion: '',
  freePlay: false
});

export const PRESETS = [
  { id: 'completa', label: 'Palestra completa', description: 'As 4 missões, o experimento e o re-teste.', stages: {} },
  { id: 'curta', label: 'Palestra curta', description: 'Tente primeiro, Detetive e o experimento.', stages: { remix: false, 'me-teste': false, reteste: false } },
  { id: 'missoes', label: 'Só as missões', description: 'As 4 missões, sem o experimento.', stages: { experimento: false, reteste: false } },
  { id: 'experimento', label: 'Só o experimento', description: 'Abertura, experimento e fechamento.', stages: { 'tente-primeiro': false, remix: false, 'me-teste': false, detetive: false, reteste: false } },
  {
    id: 'minicurso',
    label: 'Minicurso: Problemas A e B',
    description: 'Etapa 1 · Problema A sem IA e Etapa 2 · Problema B com o tutor (XIV ERCEMAPI 2026).',
    stages: { 'problema-a': true, 'problema-b': true, 'tente-primeiro': false, remix: false, 'me-teste': false, detetive: false, experimento: false, reteste: false }
  }
];

export const applyPreset = (config, presetId) => {
  const preset = PRESETS.find((entry) => entry.id === presetId);
  if (!preset) return normalizeConfig(config);
  return normalizeConfig({
    ...config,
    preset: preset.id,
    stages: { ...DEFAULT_CONFIG.stages, ...preset.stages }
  });
};

const uniqueValid = (values, isValid) => [...new Set((Array.isArray(values) ? values : []).map(String))].filter(isValid);

// Aceita qualquer coisa (vem do Firestore) e devolve uma configuração válida.
export const normalizeConfig = (raw) => {
  const input = raw && typeof raw === 'object' ? raw : {};
  const stages = Object.fromEntries(OPTIONAL_STAGES.map((stage) => [
    stage.id,
    typeof input.stages?.[stage.id] === 'boolean' ? input.stages[stage.id] : stage.on
  ]));

  const validMissionId = (id) => MISSION_ITEM_IDS.some((allowed) => String(allowed) === String(id));
  const toId = (id) => MISSION_ITEM_IDS.find((allowed) => String(allowed) === String(id));

  const tenteItemId = validMissionId(input.tenteItemId) ? toId(input.tenteItemId) : DEFAULT_CONFIG.tenteItemId;
  let meTesteItemIds = uniqueValid(input.meTesteItemIds, validMissionId).slice(0, MAX_ME_TESTE_ITEMS).map(toId);
  if (!meTesteItemIds.length) meTesteItemIds = [...DEFAULT_CONFIG.meTesteItemIds];

  const knownCases = new Set(DETECTIVE_CASES.map((caseData) => caseData.id));
  // Mantém a ordem original dos casos, para o telão e os alunos verem a mesma sequência.
  const chosenCases = new Set(uniqueValid(input.detectiveCaseIds, (id) => knownCases.has(id)));
  let detectiveCaseIds = DETECTIVE_CASES.map((caseData) => caseData.id).filter((id) => chosenCases.has(id));
  if (!detectiveCaseIds.length) detectiveCaseIds = [...DEFAULT_CONFIG.detectiveCaseIds];

  // Sem trim aqui: o formulário normaliza a cada tecla e precisa aceitar espaços.
  const pollQuestion = typeof input.pollQuestion === 'string' ? input.pollQuestion.slice(0, POLL_QUESTION_MAX) : '';
  const preset = PRESETS.some((entry) => entry.id === input.preset) || input.preset === 'personalizada' ? input.preset : 'completa';

  return { preset, stages, tenteItemId, meTesteItemIds, detectiveCaseIds, pollQuestion, freePlay: Boolean(input.freePlay) };
};

// Etapas ativas, na ordem da palestra.
export const activeStages = (config) => {
  const { stages } = normalizeConfig(config);
  return STAGES.filter((stage) => {
    if (EXPERIMENT_BLOCK.includes(stage.id)) return stages.experimento;
    if (stage.id in stages) return stages[stage.id];
    return true;
  });
};

export const activeStageIds = (config) => activeStages(config).map((stage) => stage.id);

// Próxima e anterior pulando as etapas desligadas. Se a etapa atual foi desligada,
// anda a partir da posição dela na lista completa.
const stepStage = (config, currentId, direction) => {
  const active = activeStageIds(config);
  const order = STAGES.map((stage) => stage.id);
  const position = Math.max(0, order.indexOf(currentId));
  const candidates = direction > 0
    ? order.slice(position + 1).filter((id) => active.includes(id))
    : order.slice(0, position).filter((id) => active.includes(id)).reverse();
  return candidates[0] || (active.includes(currentId) ? currentId : active[direction > 0 ? active.length - 1 : 0]);
};

export const nextActiveStageId = (config, currentId) => stepStage(config, currentId, 1);
export const previousActiveStageId = (config, currentId) => stepStage(config, currentId, -1);

export const pollQuestionFor = (config) => normalizeConfig(config).pollQuestion.trim() || OPENING_POLL.question;

// Versão gravada na sala: pergunta sem espaços sobrando.
export const finalizeConfig = (config) => {
  const normalized = normalizeConfig(config);
  return { ...normalized, pollQuestion: normalized.pollQuestion.trim() };
};

export const detectiveCasesFor = (config) => {
  const ids = new Set(normalizeConfig(config).detectiveCaseIds);
  return DETECTIVE_CASES.filter((caseData) => ids.has(caseData.id));
};

// Resumo de uma linha para o painel.
export const describeConfig = (config) => {
  const normalized = normalizeConfig(config);
  const preset = PRESETS.find((entry) => entry.id === normalized.preset);
  const parts = [preset ? preset.label : 'Personalizada', `${activeStages(normalized).length} etapa(s)`];
  // Só cita as questões das etapas que estão ligadas.
  if (normalized.stages['problema-a'] || normalized.stages['problema-b']) parts.push('Problemas do minicurso');
  if (normalized.stages['me-teste']) parts.push(`${normalized.meTesteItemIds.length} questão(ões) no Me teste`);
  if (normalized.stages.detetive) parts.push(`${normalized.detectiveCaseIds.length} caso(s) no Detetive`);
  return parts.join(' · ');
};
