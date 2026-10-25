import test from 'node:test';
import assert from 'node:assert/strict';
import { INICIACAO_QUESTIONS } from '../content/obiContent.js';
import {
  EXPERIMENT_THEMES, EXPERIMENT_ITEM_IDS, QUIZ_ITEMS, GENERATED_ITEMS, DETECTIVE_CASES, MISSIONS,
  getItem, getHints, getDetectiveCase, WEEKLY_CHALLENGE, KID_PRE_HINT_CHECKLIST
} from './content.js';

const answerOf = (id) => {
  const item = INICIACAO_QUESTIONS.find((question) => question.id === id);
  return item.options[item.correct];
};

test('gabaritos corrigidos das questões 110, 112, 122 e 123 (D11)', () => {
  assert.equal(answerOf(110), '8');
  assert.equal(answerOf(112), '18');
  assert.equal(answerOf(122), '8');
  assert.equal(answerOf(123), '13');
});

test('banco de Iniciação mantém 24 questões, 12 por faixa, com gabarito válido', () => {
  assert.equal(INICIACAO_QUESTIONS.length, 24);
  assert.equal(INICIACAO_QUESTIONS.filter((question) => question.year === 1).length, 12);
  assert.equal(INICIACAO_QUESTIONS.filter((question) => question.year === 2).length, 12);
  INICIACAO_QUESTIONS.forEach((question) => {
    assert.ok(question.correct >= 0 && question.correct < question.options.length, `questão ${question.id}`);
  });
});

test('itens gerados têm a conta certa marcada', () => {
  const expected = { 'A-sim': '23', 'B-sim': '38', 'A-chk-1': '80', 'A-chk-2': '13' };
  GENERATED_ITEMS.forEach((item) => {
    assert.equal(item.generated, true);
    assert.equal(item.options[item.correct], expected[item.id], item.id);
  });
  assert.equal(5 + 6 * 3, 23);
  assert.equal(5 * 4 + 6 * 3, 38);
});

test('todo item usado no experimento tem três dicas e explicação', () => {
  EXPERIMENT_ITEM_IDS.forEach((id) => {
    const item = getItem(id);
    assert.ok(item, `item ${id} existe`);
    assert.equal(getHints(id).length, 3, `dicas do item ${id}`);
    assert.ok(item.explanation.length > 5);
  });
});

test('quiz usa uma pergunta idêntica e uma parecida por tema', () => {
  Object.values(EXPERIMENT_THEMES).forEach((theme) => {
    assert.ok(theme.activity.includes(theme.quiz.identical), `idêntica do tema ${theme.id} está na atividade`);
    assert.ok(!theme.activity.includes(theme.quiz.similar), `parecida do tema ${theme.id} não está na atividade`);
    assert.ok(!theme.checks.includes(theme.quiz.similar), 'parecida não aparece como checagem');
    assert.ok(!theme.checks.includes(theme.quiz.identical), 'idêntica não aparece como checagem extra');
  });
  assert.equal(QUIZ_ITEMS.length, 4);
  assert.deepEqual(QUIZ_ITEMS.map((item) => `${item.theme}-${item.kind}`).sort(), ['A-identical', 'A-similar', 'B-identical', 'B-similar']);
});

test('missões não reutilizam itens do experimento (integridade do quiz)', () => {
  const experiment = new Set(EXPERIMENT_ITEM_IDS);
  const missionIds = [
    MISSIONS['tente-primeiro'].itemId,
    ...MISSIONS['me-teste'].itemIds,
    ...DETECTIVE_CASES.filter((caseData) => caseData.sourceId).map((caseData) => caseData.sourceId)
  ].map(String);
  missionIds.forEach((id) => assert.ok(!experiment.has(id), `item ${id} não está no experimento`));
});

test('Detetive usa as versões originais com erro e um caso de controle correto', () => {
  const sources = DETECTIVE_CASES.filter((caseData) => caseData.sourceId).map((caseData) => caseData.sourceId);
  [110, 112, 122, 123].forEach((id) => assert.ok(sources.includes(id)));
  DETECTIVE_CASES.map(getDetectiveCase).forEach((caseData) => {
    if (caseData.hasError) assert.notEqual(caseData.aiAnswerIndex, caseData.correct, caseData.id);
    else assert.equal(caseData.aiAnswerIndex, caseData.correct, caseData.id);
  });
  assert.ok(DETECTIVE_CASES.some((caseData) => !caseData.hasError));
});

test('fechamento e checklist de dica reaproveitam os textos da Oficina', () => {
  assert.equal(WEEKLY_CHALLENGE.length, 4);
  WEEKLY_CHALLENGE.forEach((item) => assert.ok(item.source && item.text));
  assert.equal(KID_PRE_HINT_CHECKLIST.length, 2);
});
