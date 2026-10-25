// "Escolha seu desafio": camada de mapeamento que normaliza o conteúdo existente do
// OBI Quest sem alterar os originais. Cada item guarda a origem, o tipo, o gabarito, a
// explicação, três dicas e a adequação à faixa de 11 a 14 anos:
// - 'liberado': aparece para todos;
// - 'avancado': aparece como "desafio avançado" quando o palestrante libera (ou na prática solo);
// - 'oculto': fica escondido até o palestrante liberar.

import {
  INICIACAO_QUESTIONS, COMPARISON_PAIRS, MENTOR_EXPLANATIONS, DEBUG_CASES_BY_TOPIC, VARIATION_TEMPLATES
} from '../content/obiContent.js';
import { ITEM_HINTS, REVIEW_LABEL } from './content.js';

export const AGE_FIT_LABELS = {
  liberado: 'Liberado',
  avancado: 'Desafio avançado',
  oculto: 'Oculto por padrão'
};

const TOPIC_LABELS = {
  'busca-binaria': 'Busca binária',
  dp: 'Programação dinâmica',
  grafos: 'Grafos',
  stl: 'Contagem e estruturas'
};

// Busca binária, grafos e contagem de repetidos usam só contas e listas pequenas: entram
// como avançados. Programação dinâmica pede abstração além da faixa: fica oculta.
const PAIR_AGE_FIT = { 'busca-binaria': 'avancado', grafos: 'avancado', stl: 'avancado', dp: 'oculto' };
const TEMPLATE_AGE_FIT = { 'busca-binaria': 'avancado', stl: 'avancado', grafos: 'oculto', dp: 'oculto' };

// Explicações dos pares gêmeos (o banco original só tem a resposta).
export const PAIR_EXPLANATIONS = {
  'busca-binaria-0': 'Contando as posições a partir de zero: 2 está na 0, 4 na 1, 7 na 2 e 10 na 3.',
  'busca-binaria-1': 'Contando as posições a partir de zero: 1 está na 0, 5 na 1 e 8 na 2.',
  'dp-0': 'Com capacidade 3, a melhor escolha é pegar as tarefas (1, 2) e (2, 4): custo 3 e benefício 6.',
  'dp-1': 'Com capacidade 3, a melhor escolha é pegar os itens (1, 3) e (2, 5): peso 3 e valor 8.',
  'grafos-0': 'A→B→D custa 2 + 3 = 5. A→C→D custa 1 + 7 = 8. O menor é 5.',
  'grafos-1': 'P→Q→S custa 4 + 2 = 6. P→R→S custa 3 + 6 = 9. O menor é 6.',
  'stl-0': 'O 4 aparece três vezes e o 2 aparece duas vezes. O 1 aparece só uma. São 2 valores repetidos.',
  'stl-1': 'O 7 aparece duas vezes e o 3 também. O 5 e o 9 aparecem uma vez. São 2 valores repetidos.'
};

// Dicas dos desafios de Programação (o original só tem a dica de sintaxe, que é quase a resposta).
export const PROGRAMMING_HINTS = {
  1: ['O programa precisa mostrar um texto na tela.', 'Em Python, o comando que mostra texto é print. Em C++, é cout.', 'O texto tem que ser exatamente OBI! (com ponto de exclamação) e entre aspas.'],
  2: ['O programa precisa receber um número digitado.', 'Em Python, input() lê o que foi digitado. Em C++, cin faz isso.', 'Em Python, o que input() lê é texto. Use int() para virar número.'],
  3: ['Um número é par quando o resto da divisão por 2 é zero.', 'O operador % calcula o resto da divisão.', 'Use um if comparando n % 2 com 0 e mostre "PAR".'],
  4: ['Você precisa colocar um valor no fim da lista.', 'Em Python, listas têm um comando para acrescentar no fim.', 'Em Python é append; em C++, push_back.'],
  5: ['A lista precisa ficar em ordem crescente.', 'Não precisa ordenar à mão: a linguagem já tem um comando pronto.', 'Em Python, v.sort(); em C++, sort com o começo e o fim do vetor.'],
  6: ['São dois números na mesma linha.', 'Leia os dois e depois some.', 'Em Python, split() separa os números; map(int, ...) transforma em números.'],
  7: ['Você precisa repetir uma ação várias vezes.', 'Um laço for conta de um número até outro.', 'Em Python, range(1, n + 1) vai de 1 até n.'],
  8: ['Você precisa descobrir em que posição o 7 está.', 'As posições começam em zero.', 'Em Python, listas têm o comando index; em C++, use find.'],
  9: ['Compare os dois números.', 'Use um if para decidir qual mostrar.', 'Se a for maior que b, mostre a; se não, mostre b.'],
  10: ['Os múltiplos de 2 são 2, 4, 6...', 'Um laço pode andar de 2 em 2.', 'Em Python, range tem um terceiro número que diz o tamanho do passo.']
};

const iniciacaoTheme = (question) => (/sequ[eê]ncia|pr[oó]ximo n[uú]mero|termo|de 2 em 2|completa a regra/i.test(question.question) ? 'Sequências e padrões' : 'Contas e raciocínio');

export const buildChallengeCatalog = ({ programming = [] } = {}) => {
  const items = [];

  INICIACAO_QUESTIONS.forEach((question) => {
    items.push({
      id: `iniciacao-${question.id}`,
      source: 'A.1 Iniciação',
      sourceId: question.id,
      theme: iniciacaoTheme(question),
      level: question.level,
      type: 'multipla-escolha',
      statement: question.question,
      title: question.title,
      options: question.options,
      correct: question.correct,
      answer: question.options[question.correct],
      explanation: question.explanation,
      hints: ITEM_HINTS[question.id] || [],
      hintsReview: REVIEW_LABEL,
      checks: [],
      tags: ['iniciacao', question.year === 1 ? 'I1' : 'I2'],
      ageFit: 'liberado',
      generated: false
    });
  });

  Object.entries(COMPARISON_PAIRS).forEach(([topic, pair]) => {
    const explanation = MENTOR_EXPLANATIONS[topic];
    pair.forEach((problem, index) => {
      items.push({
        id: `par-${topic}-${index}`,
        source: 'A.2 Problemas gêmeos',
        sourceId: `${topic}-${index}`,
        theme: TOPIC_LABELS[topic],
        level: 'Avançado',
        type: 'resposta-curta',
        statement: problem.statement,
        title: problem.title,
        options: null,
        correct: null,
        answer: problem.answer,
        explanation: PAIR_EXPLANATIONS[`${topic}-${index}`],
        explanationReview: REVIEW_LABEL,
        // Dicas reaproveitadas das respostas do mentor (A.4), níveis 1 a 3.
        hints: explanation ? [explanation.question, explanation.concept, explanation.analogy] : [],
        checks: (DEBUG_CASES_BY_TOPIC[topic] || []).slice(0, 3).map((edgeCase) => `E se fosse este caso: ${edgeCase.toLowerCase()}? O que mudaria?`),
        tags: ['par-gemeo', topic],
        ageFit: PAIR_AGE_FIT[topic] || 'oculto',
        generated: false
      });
    });
  });

  programming.forEach((challenge) => {
    items.push({
      id: `programacao-${challenge.id}`,
      source: 'Programação',
      sourceId: challenge.id,
      theme: `Programação · ${challenge.category}`,
      level: 'Avançado',
      type: 'codigo',
      statement: challenge.missionGoal,
      title: challenge.title,
      options: null,
      correct: null,
      answer: null,
      explanation: `${challenge.syntaxTipPython} · ${challenge.syntaxTipCpp}`,
      hints: PROGRAMMING_HINTS[challenge.id] || [],
      hintsReview: REVIEW_LABEL,
      checks: [],
      validate: challenge.validate,
      initialCode: challenge.initialCodePython,
      tags: ['programacao', challenge.category],
      ageFit: challenge.id <= 3 ? 'avancado' : 'oculto',
      generated: false
    });
  });

  Object.entries(VARIATION_TEMPLATES).forEach(([topic, template]) => {
    items.push({
      id: `variacao-${topic}`,
      source: 'A.8 Templates de variação',
      sourceId: topic,
      theme: TOPIC_LABELS[topic],
      level: 'Avançado',
      type: 'reflexao',
      statement: `${template.variant} Antes de resolver, escreva um plano: que passos você faria?`,
      title: template.title,
      options: null,
      correct: null,
      answer: null,
      explanation: `A ideia central deste problema é: ${template.technique}. Compare com o seu plano.`,
      hints: template.restrictions.map((restriction) => `Pense neste caso: ${restriction}`),
      checks: template.contexts.map((context) => `Como seria o mesmo problema num contexto de ${context}?`),
      tags: ['variacao', topic],
      ageFit: TEMPLATE_AGE_FIT[topic] || 'oculto',
      generated: false
    });
  });

  return items;
};

export const visibleCatalog = (catalog, { advanced = false, hidden = false, excludeSourceIds = [] } = {}) => {
  const excluded = new Set(excludeSourceIds.map(String));
  return catalog.filter((item) => {
    if (item.source === 'A.1 Iniciação' && excluded.has(String(item.sourceId))) return false;
    if (item.ageFit === 'liberado') return true;
    if (item.ageFit === 'avancado') return advanced || hidden;
    return hidden;
  });
};

export const checkShortAnswer = (item, value) => String(value || '').trim().toLowerCase() === String(item.answer || '').trim().toLowerCase();

export const catalogInventory = (catalog) => {
  const bySource = {};
  catalog.forEach((item) => {
    const entry = bySource[item.source] || { total: 0, liberado: 0, avancado: 0, oculto: 0, withHints: 0 };
    entry.total += 1;
    entry[item.ageFit] += 1;
    if (item.hints.length >= 3) entry.withHints += 1;
    bySource[item.source] = entry;
  });
  return bySource;
};
