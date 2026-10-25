import test from 'node:test';
import assert from 'node:assert/strict';
import { applyFieldPaths, createTransport, deepMerge } from './transport.js';

test('deepMerge preserva respostas anteriores do mesmo aparelho', () => {
  const merged = deepMerge(
    { missions: { remix: { done: true, score: 2 } }, experiment: { themes: { A: { items: { 102: { correct: true } } } } } },
    { missions: { detetive: { done: false } }, experiment: { themes: { A: { items: { 118: { correct: false } } } } } }
  );
  assert.equal(merged.missions.remix.score, 2);
  assert.equal(merged.missions.detetive.done, false);
  assert.deepEqual(Object.keys(merged.experiment.themes.A.items).sort(), ['102', '118']);
});

test('applyFieldPaths aplica caminhos com ponto como o Firestore', () => {
  const state = applyFieldPaths({ stage: 'abertura', assignments: { a: { group: 'copiar-A', order: 1 } } }, {
    'assignments.b': { group: 'ativo-A', order: 2 },
    'manual.cards.abertura.A': 3,
    stage: 'remix'
  });
  assert.equal(state.stage, 'remix');
  assert.equal(state.assignments.a.group, 'copiar-A');
  assert.equal(state.assignments.b.order, 2);
  assert.equal(state.manual.cards.abertura.A, 3);
});

test('sem Firebase, a sala vira demonstração local com etapa e participantes', async () => {
  const transport = createTransport({ db: null, appId: 'teste' });
  assert.equal(transport.kind, 'local');
  const states = [];
  const lists = [];
  const stopState = transport.watchState('ABC234', (state) => states.push(state));
  const stopList = transport.watchParticipants('ABC234', (list) => lists.push(list));
  await transport.createSession({ code: 'ABC234', title: 'Teste', hostUid: 'host', state: { stage: 'abertura', assignments: {} } });
  assert.equal((await transport.sessionInfo('ABC234')).isPensaComigo, true);
  await transport.updateParticipant('ABC234', 'aluno-1', { nickname: 'Panda Calmo', kind: 'solo' });
  await transport.updateParticipant('ABC234', 'aluno-1', { poll: 'ja' });
  await transport.updateState('ABC234', { stage: 'remix', 'assignments.aluno-1': { group: 'ativo-A', order: 1 } });
  const lastList = lists.at(-1);
  assert.equal(lastList.length, 1);
  assert.equal(lastList[0].nickname, 'Panda Calmo');
  assert.equal(lastList[0].poll, 'ja');
  assert.equal(states.at(-1).stage, 'remix');
  assert.equal(states.at(-1).assignments['aluno-1'].group, 'ativo-A');
  stopState();
  stopList();
  transport.forget('ABC234');
  assert.equal((await transport.sessionInfo('ABC234')).exists, false);
});
