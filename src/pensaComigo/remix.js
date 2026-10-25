// Rubrica por regras da missão "Remix de prompt". Roda no aparelho, sem rede: o texto do
// aluno nunca é enviado; só a pontuação (0 a 3) pode ir para o telão.

import { MENTOR_REFUSAL_PATTERN } from '../content/obiContent.js';

export const normalizeText = (text) => String(text || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

// Atalhos comuns na fala de 11 a 14 anos, além dos pedidos que o mentor já recusa.
const KID_SHORTCUT_PATTERN = /\b(faz (?:pra|para) mim|faz (?:o |a |meu |minha )|faca (?:o |a |meu |minha )|resolve (?:pra|para) mim|resolve (?:a|o|essa|esse|isso)|responde (?:pra|para) mim|me (?:da|de|passa|manda) a resposta|qual (?:e|eh) a resposta|so a resposta|a resposta (?:certa|pronta)|cola (?:pra|para) mim|copia (?:pra|para) mim|escreve (?:pra|para) mim)\b/;

const TRIED_PATTERN = /\b(tentei|ja tentei|ja fiz|eu fiz|fiz assim|pensei|achei que|acho que|cheguei em|cheguei a|meu raciocinio|minha ideia|comecei|consegui ate|travei|nao entendi|entendi ate)\b/;

const LEARN_PATTERN = /\b(explica|explique|explicar|explicacao|por que|porque|pista|dica|me (?:faca|faz) (?:uma |umas |algumas )?perguntas?|me (?:testa|teste)|pergunta|como funciona|me ajuda a entender|me ajude a entender|entender|exemplo|passo a passo|onde eu errei|confere|conferir|corrige meu raciocinio)\b/;

export const REMIX_CRITERIA = [
  { id: 'triedFirst', label: 'Conta o que você já tentou' },
  { id: 'asksToLearn', label: 'Pede explicação, pista ou perguntas' },
  { id: 'avoidsShortcut', label: 'Não pede a resposta pronta' }
];

export const asksForReadyAnswer = (text) => {
  const normalized = normalizeText(text);
  return MENTOR_REFUSAL_PATTERN.test(normalized) || KID_SHORTCUT_PATTERN.test(normalized);
};

export const evaluateRemix = (text) => {
  const normalized = normalizeText(text);
  if (normalized.length < 8) {
    return {
      score: 0,
      criteria: { triedFirst: false, asksToLearn: false, avoidsShortcut: false },
      stillAsksAnswer: false,
      tooShort: true,
      feedback: ['Escreva um pedido completo, com pelo menos uma frase.']
    };
  }
  const stillAsksAnswer = asksForReadyAnswer(normalized);
  const criteria = {
    triedFirst: TRIED_PATTERN.test(normalized),
    asksToLearn: LEARN_PATTERN.test(normalized),
    avoidsShortcut: !stillAsksAnswer
  };
  const feedback = [
    criteria.triedFirst ? 'Boa: você contou o que já tentou.' : 'Conte o que você já tentou ou onde travou. Exemplo: "Eu tentei..., mas travei em...".',
    criteria.asksToLearn ? 'Boa: você pediu explicação, pista ou perguntas.' : 'Peça uma explicação, uma pista ou que a IA faça perguntas para você.',
    criteria.avoidsShortcut ? 'Boa: o pedido não pede a resposta pronta.' : 'Seu pedido ainda pede a resposta pronta. Troque "faz pra mim" por "me ajuda a entender".'
  ];
  return {
    score: Object.values(criteria).filter(Boolean).length,
    criteria,
    stillAsksAnswer,
    tooShort: false,
    feedback
  };
};
