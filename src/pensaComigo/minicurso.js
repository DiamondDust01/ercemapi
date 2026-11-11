// Formato customizado "Minicurso: Problemas A e B" (1.8.0).
// Fonte: folha da atividade prática do minicurso "IA como assistente no treinamento para
// maratonas e olimpíadas", XIV ERCEMAPI 2026, IFCE Campus Crato, 11/11/2026.
// Etapa 1 · Problema A (sem IA) e Etapa 2 · Problema B (com IA). A ficha de registro da
// folha não faz parte do app.
//
// Como no resto do app, a verificação é local e didática: procura padrões no texto do
// código (leitura, ordenação, busca binária, saída). Não compila nem executa o programa.

// Tira comentários conforme a linguagem: em Python, "//" é divisão inteira, não comentário.
const strip = (code, language) => {
  const text = String(code || '');
  if (language === 'cpp') return text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ');
  return text.replace(/#.*$/gm, ' ');
};

const count = (text, pattern) => (text.match(pattern) || []).length;

const PY = {
  reads: /\binput\s*\(|sys\.stdin/,
  sorts: /\bsorted\s*\(|\.sort\s*\(/,
  prints: /\bprint\s*\(|sys\.stdout\.write/,
  manualSearch: /\bwhile\b[^\n:]*[<>]=?[^\n:]*:/,
  mid: /\bmid\b|\bmeio\b|\bm\s*=\s*\(?\s*\w+\s*\+\s*\w+\s*\)?\s*\/\/\s*2/,
  loops: /^\s*for\b/gm
};

const CPP = {
  reads: /\bcin\s*>>|\bscanf\s*\(/,
  sorts: /\bsort\s*\(/,
  prints: /\bcout\s*<<|\bprintf\s*\(/,
  manualSearch: /\bwhile\s*\([^)]*[<>]=?[^)]*\)/,
  mid: /\bmid\b|\bmeio\b|\bm\s*=\s*\(?\s*\w+\s*\+\s*\w+\s*\)?\s*\/\s*2|>>\s*1/,
  loops: /\bfor\s*\(/g
};

const check = (label, ok, tip) => ({ label, ok: Boolean(ok), tip });

// Problema A: quantos h_i ≤ x. Precisa de ordenação + "quantos ≤ x" (upper_bound).
export const validateProblemA = (code, language = 'python') => {
  const isCpp = language === 'cpp';
  const text = strip(code, isCpp ? 'cpp' : 'python');
  const p = isCpp ? CPP : PY;
  const upper = isCpp ? /\bupper_bound\s*\(/.test(text) : /\bbisect_right\s*\(|\bbisect\s*\(/.test(text);
  const lowerOnly = isCpp ? /\blower_bound\s*\(/.test(text) && !upper : /\bbisect_left\s*\(/.test(text) && !upper;
  const manual = p.manualSearch.test(text) && p.mid.test(text);
  const binary = upper || manual;
  const nested = count(text, p.loops) >= 2 && !binary;
  const checks = [
    check('Lê N, Q, as alturas e as consultas', p.reads.test(text), isCpp ? 'Use cin >> para ler os números.' : 'Leia com input() ou sys.stdin.'),
    check('Ordena as alturas', p.sorts.test(text), 'Com as alturas em ordem, dá para achar a resposta sem olhar todos os visitantes.'),
    check('Conta "altura ≤ x" com busca binária', binary && !lowerOnly, lowerOnly
      ? (isCpp ? 'lower_bound conta só as alturas menores que x. Para incluir as iguais, use upper_bound.' : 'bisect_left conta só as alturas menores que x. Para incluir as iguais, use bisect_right.')
      : (isCpp ? 'Procure upper_bound ou escreva uma busca binária.' : 'Procure bisect_right ou escreva uma busca binária.')),
    check('Imprime uma resposta por consulta', p.prints.test(text), 'Cada consulta gera uma linha na saída.')
  ];
  const warnings = [];
  if (nested) warnings.push('Dois laços aninhados (um por consulta, outro pelos visitantes) fazem até 4 × 10¹⁰ comparações: tempo excedido (TLE).');
  if (!isCpp && p.reads.test(text) && !/sys\.stdin/.test(text)) warnings.push('Com até 2 × 10⁵ linhas, input() pode ficar lento. sys.stdin é mais rápido.');
  return { ok: checks.every((item) => item.ok) && !nested, checks, warnings };
};

// Problema B: quantos p_i em [a, b] = (quantos ≤ b) − (quantos < a).
export const validateProblemB = (code, language = 'python') => {
  const isCpp = language === 'cpp';
  const text = strip(code, isCpp ? 'cpp' : 'python');
  const p = isCpp ? CPP : PY;
  const upper = isCpp ? /\bupper_bound\s*\(/.test(text) : /\bbisect_right\s*\(|\bbisect\s*\(/.test(text);
  const lower = isCpp ? /\blower_bound\s*\(/.test(text) : /\bbisect_left\s*\(/.test(text);
  const manual = p.manualSearch.test(text) && p.mid.test(text);
  const bothBounds = (upper && lower) || manual;
  const subtracts = /-/.test(text);
  const nested = count(text, p.loops) >= 2 && !(upper || lower || manual);
  const checks = [
    check('Lê N, Q, os preços e os orçamentos', p.reads.test(text), isCpp ? 'Use cin >> para ler os números.' : 'Leia com input() ou sys.stdin.'),
    check('Ordena os preços', p.sorts.test(text), 'Numa lista ordenada, os preços de um intervalo ficam juntos.'),
    check('Acha as duas pontas do intervalo', bothBounds, isCpp
      ? 'Você precisa de duas buscas: upper_bound para b e lower_bound para a.'
      : 'Você precisa de duas buscas: bisect_right para b e bisect_left para a.'),
    check('Subtrai as duas posições', subtracts, 'A resposta é (quantos ≤ b) − (quantos < a).'),
    check('Imprime uma resposta por cliente', p.prints.test(text), 'Cada cliente gera uma linha na saída.')
  ];
  const warnings = [];
  if (nested) warnings.push('Dois laços aninhados (um por cliente, outro pelos produtos) fazem até 4 × 10¹⁰ comparações: tempo excedido (TLE).');
  if (manual && !(upper && lower)) warnings.push('Com busca binária própria, confira as duas versões: uma para "≤ b" e outra para "< a". A verificação local não testa as pontas.');
  return { ok: checks.every((item) => item.ok) && !nested, checks, warnings };
};

const PYTHON_START = `import sys

def main():
    data = sys.stdin.read().split()
    # seu código aqui

main()
`;

const CPP_START = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // seu código aqui
    return 0;
}
`;

export const MINICURSO_SOURCE = 'XIV ERCEMAPI 2026 · Minicurso IA como assistente no treinamento para maratonas e olimpíadas · IFCE Campus Crato · 11/11/2026';

export const MINICURSO_PROBLEMS = {
  'problema-a': {
    id: 'problema-a',
    stageLabel: 'Etapa 1 · Problema A',
    letter: 'A',
    title: 'Brinquedos do parque',
    withAi: false,
    statement: 'Um parque tem N visitantes, cada um com altura hᵢ. Para Q brinquedos, cada um com altura máxima permitida xⱼ, informe quantos visitantes podem entrar no brinquedo, isto é, quantos têm hᵢ ≤ xⱼ.',
    input: 'A primeira linha contém dois inteiros, N e Q. A segunda linha contém N inteiros h₁, h₂, …, h_N, as alturas dos visitantes. Cada uma das Q linhas seguintes contém um inteiro xⱼ, a altura máxima permitida no brinquedo j.',
    output: 'Imprima Q linhas. A j-ésima linha deve conter um inteiro: quantos visitantes têm altura menor ou igual a xⱼ.',
    constraints: ['1 ≤ N, Q ≤ 2 × 10⁵', '1 ≤ hᵢ, xⱼ ≤ 10⁹'],
    exampleInput: '5 3\n170 150 180 160 150\n150\n175\n100',
    exampleOutput: '2\n4\n0',
    exampleExplanation: 'As alturas são 170, 150, 180, 160 e 150. No brinquedo com limite 150, entram os dois visitantes de altura 150. Com limite 175, entram quatro: todos, menos o de 180. Com limite 100, ninguém entra.',
    explanation: 'Ordene as alturas uma vez. Para cada brinquedo, a resposta é a posição do primeiro visitante mais alto que xⱼ: em Python, bisect_right(h, x); em C++, upper_bound(h.begin(), h.end(), x) − h.begin(). Isso dá O((N + Q) log N), em vez de O(N · Q).',
    hints: [],
    validate: validateProblemA
  },
  'problema-b': {
    id: 'problema-b',
    stageLabel: 'Etapa 2 · Problema B',
    letter: 'B',
    title: 'Orçamento',
    withAi: true,
    statement: 'Uma loja tem N produtos, cada um com preço pᵢ. Para Q clientes, cada um com orçamento mínimo aⱼ e máximo bⱼ, informe quantos produtos têm preço no intervalo [aⱼ, bⱼ], incluindo as pontas.',
    input: 'A primeira linha contém dois inteiros, N e Q. A segunda linha contém N inteiros p₁, p₂, …, p_N, os preços dos produtos. Cada uma das Q linhas seguintes contém dois inteiros, aⱼ e bⱼ, o orçamento mínimo e o máximo do cliente j.',
    output: 'Imprima Q linhas. A j-ésima linha deve conter um inteiro: quantos produtos têm preço pᵢ com aⱼ ≤ pᵢ ≤ bⱼ.',
    constraints: ['1 ≤ N, Q ≤ 2 × 10⁵', '1 ≤ pᵢ ≤ 10⁹', '1 ≤ aⱼ ≤ bⱼ ≤ 10⁹'],
    exampleInput: '6 3\n30 10 50 20 40 10\n10 30\n15 45\n60 100',
    exampleOutput: '4\n3\n0',
    exampleExplanation: 'Os preços são 30, 10, 50, 20, 40 e 10. O cliente de 10 a 30 pode comprar quatro produtos: os de preço 10, 10, 20 e 30. O de 15 a 45, três: 20, 30 e 40. O de 60 a 100, nenhum.',
    explanation: 'Ordene os preços. A quantidade no intervalo é (quantos ≤ bⱼ) − (quantos < aⱼ): em Python, bisect_right(p, b) − bisect_left(p, a); em C++, upper_bound(..., b) − lower_bound(..., a). É o Problema A com duas buscas em vez de uma.',
    // Ajuda gradual, da menor para a maior, sem entregar o código.
    hints: [
      'Para cada cliente, conte os preços entre a e b, incluindo as pontas. Com N e Q até 2 × 10⁵, testar todos os preços para cada cliente faz até 4 × 10¹⁰ comparações.',
      'Depois de ordenar os preços, os que cabem no orçamento ficam juntos, num bloco contínuo. Você já resolveu algo parecido no Problema A.',
      'Quantidade = (quantos preços são ≤ b) − (quantos preços são < a). Cada parte é uma busca binária na lista ordenada.'
    ],
    validate: validateProblemB
  }
};

export const MINICURSO_STAGE_IDS = Object.keys(MINICURSO_PROBLEMS);

export const getMinicursoProblem = (stageId) => MINICURSO_PROBLEMS[stageId] || null;

// Formato aceito pelo TutorItem (Problema B, com o tutor).
export const toTutorProblem = (problem) => ({
  id: problem.id,
  title: `Problema ${problem.letter} · ${problem.title}`,
  statement: 'Escreva o programa e verifique. Depois da primeira tentativa, o tutor libera dicas, uma de cada vez.',
  type: 'codigo',
  options: null,
  correct: null,
  answer: null,
  explanation: problem.explanation,
  hints: problem.hints,
  checks: ['E se todos os preços forem iguais a a?', 'E se nenhum preço couber no orçamento?'],
  validate: (code, language) => problem.validate(code, language),
  initialCode: PYTHON_START,
  starterCode: { python: PYTHON_START, cpp: CPP_START },
  generated: false
});

export const STARTER_CODE = { python: PYTHON_START, cpp: CPP_START };
