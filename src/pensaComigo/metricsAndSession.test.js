import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeExperimentMetrics, summarizePoll, summarizeMissions, countParticipants, countStageProgress,
  buildParticipantsCsvRows, percent
} from './metrics.js';
import {
  parseRoomParam, buildJoinUrl, resolveJoinBaseUrl, createRoomCode, isValidRoomCode, clearPensaComigoStorage,
  readSessionValue, writeSessionValue, STORAGE_PREFIX, toCsv, resolveTutorEngine, nextStageId, previousStageId,
  experimentContentLocked, STAGE_IDS
} from './session.js';
import { buildChallengeCatalog, visibleCatalog, catalogInventory, checkShortAnswer } from './catalog.js';
import { buildPrintKit } from './printKit.js';
import { EXPERIMENT_ITEM_IDS } from './content.js';

const participant = (group, themes, quiz, extra = {}) => ({ uid: group + Math.random(), group, experiment: { themes, quiz, quizDone: true }, ...extra });

test('métricas por modo: atividade, quiz e confiança x acerto', () => {
  const participants = [
    participant('copiar-A',
      { A: { mode: 'copiar', done: true, items: { 102: { correct: true }, 118: { correct: true } } }, B: { mode: 'ativo', done: true, items: { 111: { correct: true, hints: 2 }, 116: { correct: false, hints: 3 } } } },
      { 121: { theme: 'A', kind: 'identical', mode: 'copiar', correct: true, confidence: 3 }, 'A-sim': { theme: 'A', kind: 'similar', mode: 'copiar', correct: false, confidence: 3 }, 111: { theme: 'B', kind: 'identical', mode: 'ativo', correct: true, confidence: 2 }, 'B-sim': { theme: 'B', kind: 'similar', mode: 'ativo', correct: true, confidence: 3 } }),
    { uid: 'vazio', nickname: 'Panda Calmo' }
  ];
  const metrics = computeExperimentMetrics(participants);
  assert.equal(metrics.participantsWithData, 1);
  assert.equal(metrics.copiar.activityPct, 100);
  assert.equal(metrics.ativo.activityPct, 50);
  assert.equal(metrics.ativo.hints, 5);
  assert.equal(metrics.copiar.quizPct, 50);
  assert.equal(metrics.copiar.identicalPct, 100);
  assert.equal(metrics.copiar.similarPct, 0);
  assert.equal(metrics.copiar.confidence.sure, 2);
  assert.equal(metrics.copiar.sureWrongPct, 50);
  assert.equal(metrics.ativo.sureWrongPct, 0);
  assert.equal(metrics.ativo.confidence.byLevel[2].total, 1);
});

test('contagens do modo sem celular somam às dos aparelhos', () => {
  const metrics = computeExperimentMetrics([], { experiment: { copiar: { participants: '10', activityCorrect: 38, activityTotal: 40, quizCorrect: 20, quizTotal: 40, sure: 12, sureWrong: 6 }, ativo: { participants: 10, quizCorrect: 'x' } } });
  assert.equal(metrics.hasManual, true);
  assert.equal(metrics.copiar.participants, 10);
  assert.equal(metrics.copiar.activityPct, 95);
  assert.equal(metrics.copiar.sureWrongPct, 50);
  assert.equal(metrics.ativo.quizPct, null, 'valor inválido vira zero');
  assert.equal(percent(0, 0), null);
});

test('enquete soma votos dos aparelhos e cartões A a D', () => {
  const poll = summarizePoll([{ poll: 'ja' }, { poll: 'ja' }, { poll: 'nunca' }, { poll: 'inventado' }], { A: 3, D: '1' });
  assert.equal(poll.total, 7);
  assert.equal(poll.options[0].count, 5);
  assert.equal(poll.options[3].count, 1);
});

test('resumo das missões e contagem de participantes e duplas', () => {
  const participants = [
    { kind: 'dupla', missions: { 'tente-primeiro': { done: true, correct: true, hints: 0 }, remix: { done: true, score: 3 }, detetive: { done: true, results: { 'det-110': { judgedCorrectly: true } } } } },
    { kind: 'solo', missions: { 'tente-primeiro': { done: true, correct: false, hints: 3 }, remix: { done: true, score: 1, stillAsksAnswer: true }, 'me-teste': { done: true, points: 2, total: 3, peeked: 1 } } }
  ];
  const missions = summarizeMissions(participants);
  assert.equal(missions.tente.withoutHint, 1);
  assert.equal(missions.tente.averageHints, 1.5);
  assert.equal(missions.remix.averageScore, 2);
  assert.equal(missions.remix.stillAsksAnswer, 1);
  assert.equal(missions.meTeste.pointsPct, 67);
  assert.equal(missions.detective.cases.find((caseData) => caseData.id === 'det-110').pct, 100);
  assert.deepEqual(countParticipants(participants), { devices: 2, duplas: 1, people: 3 });
  assert.equal(countStageProgress(participants, 'remix'), 2);
  assert.equal(countStageProgress(participants, 'me-teste'), 1);
});

test('exportação anonimizada não inclui texto livre', () => {
  const rows = buildParticipantsCsvRows([{ nickname: 'Coruja Atenta', kind: 'solo', group: 'ativo-A', missions: { remix: { done: true, score: 2, text: 'segredo' } } }]);
  assert.equal(rows.length, 2);
  assert.equal(rows[0][0], 'apelido_sorteado');
  assert.ok(!rows.flat().includes('segredo'));
  const csv = toCsv(rows);
  assert.ok(csv.startsWith('﻿"apelido_sorteado"'));
  assert.ok(csv.includes('\r\n'));
  assert.equal(toCsv([['a"b']]), '﻿"a""b"');
});

test('parâmetro ?sala= e link de entrada', () => {
  assert.equal(parseRoomParam('?sala=abc234'), 'ABC234');
  assert.equal(parseRoomParam('?sala=ABC'), null);
  assert.equal(parseRoomParam(''), null);
  assert.equal(buildJoinUrl('https://obi.web.app/app/?x=1#y', 'ABC234'), 'https://obi.web.app/app/?sala=ABC234');
  assert.equal(buildJoinUrl('', 'ABC234'), '');
  const code = createRoomCode(() => 0.5);
  assert.equal(isValidRoomCode(code), true);
});

test('base do QR: hospedagem configurada, endereço local e app instalado', () => {
  assert.deepEqual(resolveJoinBaseUrl({ configuredUrl: 'https://obi.web.app/' }), { baseUrl: 'https://obi.web.app/', warning: '' });
  const local = resolveJoinBaseUrl({ location: { protocol: 'http:', origin: 'http://localhost:3000', pathname: '/', hostname: 'localhost' } });
  assert.equal(local.baseUrl, 'http://localhost:3000/');
  assert.match(local.warning, /só funciona neste computador/);
  const lan = resolveJoinBaseUrl({ location: { protocol: 'http:', origin: 'http://192.168.0.10:3000', pathname: '/', hostname: '192.168.0.10' } });
  assert.equal(lan.warning, '');
  const installed = resolveJoinBaseUrl({ location: { protocol: 'file:', origin: 'null', pathname: '/index.html', hostname: '' } });
  assert.equal(installed.baseUrl, '');
});

const fakeStorage = () => {
  const map = new Map();
  return {
    get length() { return map.size; },
    key: (index) => [...map.keys()][index] ?? null,
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    map
  };
};

test('"Encerrar neste aparelho" apaga só as chaves do modo', () => {
  const storage = fakeStorage();
  storage.setItem('obi-quest-pedagogy', '{}');
  writeSessionValue(storage, 'student', { nickname: 'Panda Calmo' });
  writeSessionValue(storage, 'host', { code: 'ABC234' });
  assert.deepEqual(readSessionValue(storage, 'student', null), { nickname: 'Panda Calmo' });
  assert.equal(clearPensaComigoStorage(storage), 2);
  assert.equal(readSessionValue(storage, 'student', null), null);
  assert.equal(storage.getItem('obi-quest-pedagogy'), '{}');
  assert.ok([...storage.map.keys()].every((key) => !key.startsWith(STORAGE_PREFIX)));
  assert.equal(readSessionValue(null, 'x', 'padrão'), 'padrão');
});

test('tutor generativo desligado por padrão e nenhum texto sai do aparelho', () => {
  assert.equal(resolveTutorEngine({}).engine, 'local');
  assert.equal(resolveTutorEngine({}).sendsText, false);
  const flagged = resolveTutorEngine({ flag: 'true', endpoint: 'https://exemplo.invalid' });
  assert.equal(flagged.sendsText, false);
  assert.match(flagged.notice, /não há backend/);
});

test('etapas e bloqueio do conteúdo do experimento', () => {
  assert.equal(nextStageId('abertura'), 'tente-primeiro');
  assert.equal(previousStageId('abertura'), 'abertura');
  assert.equal(nextStageId('reteste'), 'reteste');
  assert.equal(experimentContentLocked('quiz'), true);
  assert.equal(experimentContentLocked('resultado'), false);
  assert.equal(STAGE_IDS.length, 10);
});

test('catálogo "Escolha seu desafio" normaliza origens e respeita a faixa', () => {
  const programming = Array.from({ length: 10 }, (_, index) => ({ id: index + 1, title: `D${index + 1}`, category: 'I/O', missionGoal: 'x', syntaxTipPython: 'p', syntaxTipCpp: 'c', initialCodePython: '', validate: () => ({ ok: true }) }));
  const catalog = buildChallengeCatalog({ programming });
  const inventory = catalogInventory(catalog);
  assert.equal(inventory['A.1 Iniciação'].total, 24);
  assert.equal(inventory['A.1 Iniciação'].liberado, 24);
  assert.equal(inventory['A.2 Problemas gêmeos'].avancado, 6);
  assert.equal(inventory['A.2 Problemas gêmeos'].oculto, 2);
  assert.equal(inventory['Programação'].avancado, 3);
  assert.equal(inventory['Programação'].oculto, 7);
  catalog.forEach((item) => assert.ok(item.hints.length >= 3, `${item.id} tem três dicas`));

  const basic = visibleCatalog(catalog, { excludeSourceIds: EXPERIMENT_ITEM_IDS });
  assert.ok(basic.every((item) => item.ageFit === 'liberado'));
  assert.ok(!basic.some((item) => String(item.sourceId) === '121'));
  assert.equal(visibleCatalog(catalog, { advanced: true }).filter((item) => item.ageFit === 'oculto').length, 0);
  assert.ok(visibleCatalog(catalog, { hidden: true }).some((item) => item.id === 'par-dp-0'));
  const pair = catalog.find((item) => item.id === 'par-grafos-0');
  assert.equal(checkShortAnswer(pair, ' 5 '), true);
});

test('kit impresso: grupos, resposta pronta só na folha de copiar e sem dados de alunos', () => {
  const { html, sectionCount } = buildPrintKit({ roomCode: 'ABC234' });
  assert.ok(sectionCount >= 10);
  assert.ok(html.includes('Grupo 1') && html.includes('Grupo 2'));
  assert.ok(html.includes('Resposta pronta'));
  const quizStart = html.indexOf('data-section="quiz-copiar-A"');
  const quizEnd = html.indexOf('data-section="quiz-ativo-A"');
  assert.ok(quizStart > 0 && quizEnd > quizStart);
  assert.ok(!html.slice(quizStart, quizEnd).includes('Resposta pronta'));
  assert.ok(!/<script/i.test(html));
});
