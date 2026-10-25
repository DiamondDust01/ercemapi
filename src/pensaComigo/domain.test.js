import test from 'node:test';
import assert from 'node:assert/strict';
import { drawNickname, isDrawnNickname, NICKNAME_COMBINATIONS, formatParticipantName } from './nicknames.js';
import { assignBalancedGroups, countGroups, modeFor, GROUPS } from './assignment.js';
import { createReturnCode, parseReturnCode, formatReturnCode } from './returnCode.js';
import { evaluateRemix, asksForReadyAnswer } from './remix.js';
import { REMIX_PROMPTS, REMIX_EXAMPLE } from './content.js';
import {
  createTutorState, registerAttempt, canShowHint, showHint, canShowExplanation, showExplanation,
  copyModeAnswer, summarizeTutorItem, MAX_HINTS
} from './tutor.js';

const sequence = (values) => {
  let index = 0;
  return () => values[index++ % values.length];
};

const seeded = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
};

test('apelido sorteado combina animal e adjetivo com concordância', () => {
  assert.equal(drawNickname(sequence([0, 0])), 'Capivara Curiosa');
  const tucano = drawNickname(sequence([12 / 24, 0]));
  assert.equal(tucano, 'Tucano Curioso');
  assert.ok(NICKNAME_COMBINATIONS >= 300);
});

test('novo sorteio evita repetir o apelido anterior', () => {
  const random = sequence([0, 0, 0, 0, 0.5, 0.5]);
  assert.notEqual(drawNickname(random, 'Capivara Curiosa'), 'Capivara Curiosa');
});

test('somente apelidos do sorteio são aceitos', () => {
  assert.equal(isDrawnNickname('Capivara Curiosa'), true);
  assert.equal(isDrawnNickname('Maria Silva'), false);
  assert.equal(formatParticipantName('Coruja Atenta', 'dupla'), 'Dupla Coruja Atenta');
});

test('distribuição balanceada alterna pela ordem de entrada', () => {
  const participants = Array.from({ length: 30 }, (_, index) => ({ uid: `u${String(index).padStart(2, '0')}`, joinedAt: new Date(1000 + index * 1000).toISOString() }));
  const assigned = assignBalancedGroups(participants, {});
  const counts = countGroups(assigned);
  assert.equal(counts['copiar-A'], 15);
  assert.equal(counts['ativo-A'], 15);
  assert.equal(assigned.u00.group, 'copiar-A');
  assert.equal(assigned.u01.group, 'ativo-A');
  assert.equal(assigned.u00.order, 1);
});

test('atribuições existentes não mudam e novos completam o grupo menor', () => {
  const existing = { a: { group: 'copiar-A', order: 1 }, b: { group: 'copiar-A', order: 2 } };
  const assigned = assignBalancedGroups([
    { uid: 'a', joinedAt: '2026-10-25T10:00:00Z' },
    { uid: 'b', joinedAt: '2026-10-25T10:00:01Z' },
    { uid: 'c', joinedAt: '2026-10-25T10:00:02Z' }
  ], existing);
  assert.deepEqual(Object.keys(assigned), ['c']);
  assert.equal(assigned.c.group, 'ativo-A');
  assert.equal(assigned.c.order, 3);
});

test('cada grupo passa pelos dois modos, em temas trocados', () => {
  assert.equal(modeFor('copiar-A', 'A'), 'copiar');
  assert.equal(modeFor('copiar-A', 'B'), 'ativo');
  assert.equal(modeFor('ativo-A', 'A'), 'ativo');
  assert.equal(modeFor('ativo-A', 'B'), 'copiar');
  assert.equal(modeFor('outro', 'A'), null);
});

test('código de retorno guarda o grupo e detecta erros de digitação', () => {
  const random = seeded(42);
  for (let round = 0; round < 200; round += 1) {
    const group = GROUPS[round % 2];
    const code = createReturnCode(group, random);
    assert.equal(code.length, 5);
    const parsed = parseReturnCode(formatReturnCode(code).toLowerCase());
    assert.equal(parsed.valid, true);
    assert.equal(parsed.group, group);
  }
  const code = createReturnCode('copiar-A', seeded(7));
  const changed = code.slice(0, 4) + (code[4] === '2' ? '3' : '2');
  const result = parseReturnCode(changed);
  assert.ok(!result.valid || result.group !== 'copiar-A');
  assert.equal(parseReturnCode('ABC').valid, false);
  assert.equal(parseReturnCode('OOOO0').valid, false);
});

test('remix: pedidos copiadores pontuam baixo e o exemplo pontua 3', () => {
  REMIX_PROMPTS.forEach((prompt) => {
    const result = evaluateRemix(prompt.text);
    assert.ok(result.score <= 1, prompt.text);
    assert.equal(result.stillAsksAnswer, true, prompt.text);
  });
  const good = evaluateRemix(REMIX_EXAMPLE);
  assert.equal(good.score, 3);
  assert.equal(good.stillAsksAnswer, false);
});

test('remix reaproveita a regra de recusa do mentor', () => {
  assert.equal(asksForReadyAnswer('Me dê a solução completa'), true);
  assert.equal(asksForReadyAnswer('Escreva o código pra mim'), true);
  assert.equal(asksForReadyAnswer('Me explica por que dá esse resultado'), false);
  assert.equal(evaluateRemix('oi').tooShort, true);
});

const item = { id: 1, options: ['1', '2', '3', '4'], correct: 2, explanation: 'Porque sim.' };

test('tutor não libera dica nem explicação antes da tentativa', () => {
  const state = createTutorState();
  assert.equal(canShowHint(state), false);
  assert.equal(canShowExplanation(state), false);
  assert.deepEqual(showHint(state), state);
  assert.equal(registerAttempt(state, {}, item).accepted, false);
});

test('tutor segue tentativa → dica 1 → dica 2 → dica 3 → explicação', () => {
  let state = registerAttempt(createTutorState(), { choice: 0 }, item).state;
  assert.equal(state.solved, false);
  assert.equal(canShowExplanation(state), false);
  for (let hint = 1; hint <= MAX_HINTS; hint += 1) {
    assert.equal(canShowHint(state), true);
    state = showHint(state);
    assert.equal(state.hintsShown, hint);
    if (hint < MAX_HINTS) assert.equal(canShowExplanation(state), false);
  }
  assert.equal(canShowHint(state), false);
  assert.equal(canShowExplanation(state), true);
  state = showExplanation(state);
  assert.equal(registerAttempt(state, { choice: 2 }, item).accepted, false, 'depois da explicação não vale mais acertar');
  assert.equal(summarizeTutorItem(state, 'ativo').correct, false);
});

test('tentativa escrita libera a primeira dica sem contar como acerto', () => {
  const { state, correct } = registerAttempt(createTutorState(), { text: 'acho que é 3' }, item);
  assert.equal(correct, null);
  assert.equal(canShowHint(state), true);
});

test('acertar encerra o item no modo ativo', () => {
  const { state, correct } = registerAttempt(createTutorState(), { choice: 2 }, item);
  assert.equal(correct, true);
  assert.equal(canShowHint(state), false);
  assert.equal(summarizeTutorItem(state, 'ativo').correct, true);
});

test('modo copiar entrega a alternativa correta e a explicação', () => {
  const answer = copyModeAnswer(item);
  assert.equal(answer.answerIndex, 2);
  assert.match(answer.answerText, /C\) 3/);
  assert.equal(answer.explanation, 'Porque sim.');
});
