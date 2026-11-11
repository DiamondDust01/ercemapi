import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_CONFIG, MISSION_ITEM_IDS, MAX_ME_TESTE_ITEMS, normalizeConfig, applyPreset, activeStageIds,
  nextActiveStageId, previousActiveStageId, pollQuestionFor, detectiveCasesFor, finalizeConfig
} from './quickConfig.js';
import { STAGE_IDS } from './session.js';
import { EXPERIMENT_ITEM_IDS, DETECTIVE_CASES, OPENING_POLL, MISSIONS } from './content.js';

test('sem configuração, a palestra é a mesma de antes', () => {
  const config = normalizeConfig(undefined);
  assert.deepEqual(activeStageIds(config), STAGE_IDS);
  assert.equal(config.tenteItemId, MISSIONS['tente-primeiro'].itemId);
  assert.deepEqual(config.meTesteItemIds, MISSIONS['me-teste'].itemIds);
  assert.equal(detectiveCasesFor(config).length, DETECTIVE_CASES.length);
  assert.equal(pollQuestionFor(config), OPENING_POLL.question);
});

test('questões das missões nunca vêm do experimento nem do Detetive', () => {
  const blocked = new Set([...EXPERIMENT_ITEM_IDS, ...DETECTIVE_CASES.map((caseData) => String(caseData.sourceId))]);
  assert.ok(MISSION_ITEM_IDS.length >= MAX_ME_TESTE_ITEMS);
  MISSION_ITEM_IDS.forEach((id) => assert.ok(!blocked.has(String(id)), `item ${id} vazaria o quiz`));
  [DEFAULT_CONFIG.tenteItemId, ...DEFAULT_CONFIG.meTesteItemIds].forEach((id) => assert.ok(MISSION_ITEM_IDS.includes(id)));
});

test('normalizeConfig descarta valores inválidos vindos da rede', () => {
  const config = normalizeConfig({
    tenteItemId: 121, // do experimento: recusado
    meTesteItemIds: [101, '104', 104, 105, 106, 999],
    detectiveCaseIds: ['det-g1', 'det-110', 'nada'],
    stages: { remix: false, 'me-teste': 'sim' },
    pollQuestion: 'x'.repeat(500),
    preset: 'hackeado'
  });
  assert.equal(config.tenteItemId, DEFAULT_CONFIG.tenteItemId);
  assert.deepEqual(config.meTesteItemIds, [101, 104, 105]);
  assert.deepEqual(config.detectiveCaseIds, ['det-110', 'det-g1']);
  assert.equal(config.stages.remix, false);
  assert.equal(config.stages['me-teste'], true);
  assert.equal(config.pollQuestion.length, 120);
  assert.equal(config.preset, 'completa');
});

test('listas vazias voltam ao padrão', () => {
  const config = normalizeConfig({ meTesteItemIds: [], detectiveCaseIds: [] });
  assert.deepEqual(config.meTesteItemIds, DEFAULT_CONFIG.meTesteItemIds);
  assert.deepEqual(config.detectiveCaseIds, DEFAULT_CONFIG.detectiveCaseIds);
});

test('desligar o experimento tira atividade, quiz e resultado juntos', () => {
  const config = applyPreset(DEFAULT_CONFIG, 'missoes');
  const ids = activeStageIds(config);
  ['experimento', 'quiz', 'resultado', 'reteste'].forEach((id) => assert.ok(!ids.includes(id)));
  assert.equal(ids[0], 'abertura');
  assert.equal(ids.at(-1), 'fechamento');
});

test('próxima e anterior pulam as etapas desligadas', () => {
  const config = applyPreset(DEFAULT_CONFIG, 'curta');
  assert.equal(nextActiveStageId(config, 'tente-primeiro'), 'detetive');
  assert.equal(previousActiveStageId(config, 'detetive'), 'tente-primeiro');
  assert.equal(nextActiveStageId(config, 'fechamento'), 'fechamento');
  assert.equal(previousActiveStageId(config, 'abertura'), 'abertura');
  // Etapa atual desligada: anda a partir da posição dela.
  assert.equal(nextActiveStageId(config, 'remix'), 'detetive');
  assert.equal(previousActiveStageId(config, 'remix'), 'tente-primeiro');
});

test('pergunta da enquete aceita espaços ao digitar e sai limpa ao salvar', () => {
  assert.equal(normalizeConfig({ pollQuestion: 'Você já ' }).pollQuestion, 'Você já ');
  assert.equal(finalizeConfig({ pollQuestion: '  Você já usou IA?  ' }).pollQuestion, 'Você já usou IA?');
  assert.equal(pollQuestionFor({ pollQuestion: '   ' }), OPENING_POLL.question);
});
