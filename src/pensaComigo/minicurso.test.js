import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProblemA, validateProblemB, MINICURSO_PROBLEMS, toTutorProblem } from './minicurso.js';
import { summarizeProblem, countStageProgress, buildParticipantsCsvRows } from './metrics.js';
import { applyPreset, DEFAULT_CONFIG, activeStageIds, nextActiveStageId, normalizeConfig } from './quickConfig.js';

const PY_A = `import sys
from bisect import bisect_right
def main():
    data = sys.stdin.read().split()
    n, q = int(data[0]), int(data[1])
    h = sorted(map(int, data[2:2 + n]))
    out = []
    for x in data[2 + n:2 + n + q]:
        out.append(bisect_right(h, int(x)))
    print("\\n".join(map(str, out)))
main()
`;

const PY_A_MANUAL = `import sys
data = sys.stdin.read().split()
n, q = int(data[0]), int(data[1])
h = sorted(map(int, data[2:2 + n]))
for x in map(int, data[2 + n:]):
    lo, hi = 0, n
    while lo < hi:
        mid = (lo + hi) // 2  # divisão inteira, não comentário
        if h[mid] <= x: lo = mid + 1
        else: hi = mid
    print(lo)
`;

const PY_A_NAIVE = `n, q = map(int, input().split())
h = list(map(int, input().split()))
for _ in range(q):
    x = int(input())
    c = 0
    for v in h:
        if v <= x: c += 1
    print(c)
`;

const CPP_A = `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, q; cin >> n >> q;
    vector<int> h(n);
    for (auto &v : h) cin >> v;
    sort(h.begin(), h.end());
    while (q--) { int x; cin >> x; cout << upper_bound(h.begin(), h.end(), x) - h.begin() << '\\n'; }
}
`;

const CPP_A_LOWER = CPP_A.replace('upper_bound', 'lower_bound');

const PY_B = `import sys
from bisect import bisect_left, bisect_right
data = sys.stdin.read().split()
n, q = int(data[0]), int(data[1])
p = sorted(map(int, data[2:2 + n]))
rest = data[2 + n:]
for j in range(q):
    a, b = int(rest[2 * j]), int(rest[2 * j + 1])
    print(bisect_right(p, b) - bisect_left(p, a))
`;

const CPP_B = `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, q; cin >> n >> q;
    vector<long long> p(n);
    for (auto &v : p) cin >> v;
    sort(p.begin(), p.end());
    while (q--) { long long a, b; cin >> a >> b;
        cout << (upper_bound(p.begin(), p.end(), b) - lower_bound(p.begin(), p.end(), a)) << '\\n'; }
}
`;

test('Problema A: soluções certas passam em Python e C++', () => {
  assert.equal(validateProblemA(PY_A, 'python').ok, true);
  assert.equal(validateProblemA(PY_A_MANUAL, 'python').ok, true);
  assert.equal(validateProblemA(CPP_A, 'cpp').ok, true);
});

test('Problema A: laço aninhado e lower_bound não passam, com o motivo', () => {
  const naive = validateProblemA(PY_A_NAIVE, 'python');
  assert.equal(naive.ok, false);
  assert.ok(naive.warnings.some((warning) => warning.includes('TLE')));
  const lower = validateProblemA(CPP_A_LOWER, 'cpp');
  assert.equal(lower.ok, false);
  assert.ok(lower.checks.some((item) => !item.ok && item.tip.includes('upper_bound')));
  assert.equal(validateProblemA('', 'python').ok, false);
  assert.equal(validateProblemA('// só comentário com sort( e cout <<', 'cpp').ok, false);
});

test('Problema B: precisa das duas buscas', () => {
  assert.equal(validateProblemB(PY_B, 'python').ok, true);
  assert.equal(validateProblemB(CPP_B, 'cpp').ok, true);
  // A solução do A não resolve o B.
  assert.equal(validateProblemB(PY_A, 'python').ok, false);
  assert.equal(validateProblemB(CPP_A, 'cpp').ok, false);
});

test('textos do PDF: exemplos e restrições', () => {
  const a = MINICURSO_PROBLEMS['problema-a'];
  const b = MINICURSO_PROBLEMS['problema-b'];
  assert.equal(a.exampleOutput, '2\n4\n0');
  assert.equal(b.exampleOutput, '4\n3\n0');
  assert.equal(a.withAi, false);
  assert.equal(a.hints.length, 0);
  assert.equal(b.withAi, true);
  assert.equal(b.hints.length, 3);
  const item = toTutorProblem(b);
  assert.equal(item.type, 'codigo');
  assert.equal(item.validate(CPP_B, 'cpp').ok, true);
});

test('formato Minicurso: só abertura, problemas e fechamento', () => {
  const config = applyPreset(DEFAULT_CONFIG, 'minicurso');
  assert.deepEqual(activeStageIds(config), ['abertura', 'problema-a', 'problema-b', 'fechamento']);
  assert.equal(nextActiveStageId(config, 'abertura'), 'problema-a');
  assert.equal(nextActiveStageId(config, 'problema-b'), 'fechamento');
  // Nos outros formatos e sem configuração, os problemas ficam de fora.
  ['completa', 'curta', 'missoes', 'experimento'].forEach((preset) => {
    const ids = activeStageIds(applyPreset(DEFAULT_CONFIG, preset));
    assert.ok(!ids.includes('problema-a') && !ids.includes('problema-b'), preset);
  });
  assert.ok(!activeStageIds(normalizeConfig(undefined)).includes('problema-a'));
});

test('telão e exportação dos problemas', () => {
  const participants = [
    { missions: { 'problema-a': { done: true, accepted: true, attempts: 2 }, 'problema-b': { done: true, accepted: true, attempts: 1, hints: 2 } } },
    { missions: { 'problema-a': { done: true, accepted: false, attempts: 4 } } },
    { missions: {} }
  ];
  const a = summarizeProblem(participants, 'problema-a');
  assert.deepEqual([a.done, a.accepted, a.acceptedPct, a.averageAttempts], [2, 1, 50, 3]);
  const b = summarizeProblem(participants, 'problema-b');
  assert.deepEqual([b.done, b.averageHints], [1, 2]);
  assert.equal(countStageProgress(participants, 'problema-a'), 2);
  const rows = buildParticipantsCsvRows(participants);
  assert.deepEqual(rows[0].slice(-3), ['problema_a_verificado', 'problema_b_verificado', 'problema_b_dicas']);
  assert.deepEqual(rows[1].slice(-3), ['sim', 'sim', 2]);
  assert.deepEqual(rows[2].slice(-3), ['nao', '', '']);
  rows.forEach((row) => assert.equal(row.length, rows[0].length));
});

test('mensagem do tutor respeita o tipo da questão', async () => {
  const { createTutorState, registerAttempt, tutorMessage } = await import('./tutor.js');
  const code = { type: 'codigo', options: null };
  const short = { type: 'resposta-curta', options: null };
  const choice = { type: 'multipla-escolha', options: ['1', '2'], correct: 0 };
  const fresh = createTutorState();
  assert.ok(tutorMessage(fresh, code).includes('escreva seu código'));
  assert.ok(!tutorMessage(fresh, short).includes('alternativa'));
  assert.ok(tutorMessage(fresh, choice).includes('alternativa'));
  const wrongCode = registerAttempt(fresh, { text: 'print(1)', correct: false }, code).state;
  assert.ok(tutorMessage(wrongCode, code).startsWith('Ainda não'));
  const idea = registerAttempt(fresh, { text: 'minha ideia', correct: null }, short).state;
  assert.ok(!tutorMessage(idea, short).includes('alternativa'));
});

test('resumo da configuração só cita etapas ligadas', async () => {
  const { describeConfig } = await import('./quickConfig.js');
  const minicurso = describeConfig(applyPreset(DEFAULT_CONFIG, 'minicurso'));
  assert.ok(minicurso.includes('Problemas do minicurso'));
  assert.ok(!minicurso.includes('Me teste') && !minicurso.includes('Detetive'));
  assert.ok(describeConfig(DEFAULT_CONFIG).includes('Detetive'));
});

test('kit impresso segue a configuração da sala', async () => {
  const { buildPrintKit } = await import('./printKit.js');
  const padrao = buildPrintKit({ roomCode: 'ABC234' });
  assert.ok(padrao.html.includes('Gabarito do palestrante'));
  assert.ok(!padrao.html.includes('Brinquedos do parque'));
  const mini = buildPrintKit({
    roomCode: 'ABC234',
    pollQuestion: 'Você já usou IA para estudar?',
    problems: Object.values(MINICURSO_PROBLEMS),
    experiment: false
  });
  assert.ok(mini.html.includes('Você já usou IA para estudar?'));
  assert.ok(mini.html.includes('Brinquedos do parque') && mini.html.includes('Orçamento'));
  assert.ok(mini.html.includes('170 150 180 160 150'));
  assert.ok(!mini.html.includes('Gabarito do palestrante'));
  assert.ok(!mini.html.includes('No re-teste, use a folha'));
  assert.ok(!mini.html.includes('<h3>Experimento</h3>'));
  assert.ok(!/<script/i.test(mini.html));
});
