// Conteúdo embarcado do modo Pensa Comigo. Tudo aqui vai no build: o experimento e as
// missões funcionam sem rede e sem IA ao vivo.
//
// Itens e textos marcados com `generated: true` ou listados em GENERATED_HINT_IDS foram
// criados para o modo e precisam de revisão humana antes de ir para alunos.

import { INICIACAO_QUESTIONS, RESPONSIBLE_CHECKLIST, PRE_AI_CHECKLIST } from '../content/obiContent.js';

export const REVIEW_LABEL = 'gerado — revisar';

// Itens novos, no mesmo formato do banco de Iniciação.
export const GENERATED_ITEMS = [
  {
    id: 'A-sim', generated: true, year: 1, title: 'Cadeiras numeradas', level: 'Pensa Comigo',
    question: 'Numa fila, as cadeiras são numeradas assim: 5, 8, 11, 14, ... Qual é o número da 7ª cadeira?',
    options: ['17', '20', '23', '26'],
    correct: 2,
    explanation: 'Os números aumentam de 3 em 3: 5, 8, 11, 14, 17, 20, 23. A 7ª cadeira tem o número 23.'
  },
  {
    id: 'B-sim', generated: true, year: 2, title: 'Lanche da turma', level: 'Pensa Comigo',
    question: 'Na cantina, um suco custa 4 reais e um pão de queijo custa 3 reais. A turma comprou 5 sucos e 6 pães de queijo. Quanto gastou?',
    options: ['32', '35', '38', '41'],
    correct: 2,
    explanation: '5 sucos × 4 = 20 reais. 6 pães de queijo × 3 = 18 reais. Total: 20 + 18 = 38 reais.'
  },
  {
    id: 'A-chk-1', generated: true, year: 1, title: 'Dobra de novo', level: 'Pensa Comigo',
    question: 'Qual é o próximo número: 5, 10, 20, 40, ?',
    options: ['45', '60', '80', '90'],
    correct: 2,
    explanation: 'Cada número é o dobro do anterior. 40 × 2 = 80.'
  },
  {
    id: 'A-chk-2', generated: true, year: 1, title: 'De 3 em 3', level: 'Pensa Comigo',
    question: 'Qual número completa a sequência: 1, 4, 7, 10, ?',
    options: ['11', '12', '13', '14'],
    correct: 2,
    explanation: 'A sequência aumenta de 3 em 3. 10 + 3 = 13.'
  }
];

const ITEMS_BY_ID = new Map([...INICIACAO_QUESTIONS, ...GENERATED_ITEMS].map((item) => [String(item.id), item]));

export const getItem = (id) => ITEMS_BY_ID.get(String(id)) || null;

// Três dicas por item, em ordem crescente de ajuda. Todas criadas para o modo.
export const ITEM_HINTS = {
  101: ['Desenhe uma reta com o 0 e marque cada movimento do robô.', 'Faça um movimento de cada vez. Depois de andar 3 para frente, onde ele está?', 'Depois de andar 3 e voltar 1, ele está no 2. Agora conte os 4 passos que faltam.'],
  102: ['Compare cada número com o anterior. O que acontece de um para o outro?', 'De 2 para 4 e de 4 para 8 não é somar sempre o mesmo valor.', 'Cada número é o dobro do anterior. Qual é o dobro de 16?'],
  103: ['Imagine que você tem 0 figurinhas, ganha 5 e depois perde 2.', 'Ganhar é somar e perder é subtrair.', 'Faça 5 − 2 e lembre que o resultado é um aumento.'],
  104: ['Pense numa reta numérica: qual número fica mais à direita?', 'Os dois têm 1 na casa das dezenas. Compare as unidades.', 'Compare só o 7 e o 9.'],
  105: ['Dobro é o número somado com ele mesmo.', 'Qual número, somado com ele mesmo, dá 10?', 'Divida 10 em duas partes iguais.'],
  106: ['Um número par pode ser dividido em duas partes iguais, sem sobrar nada.', 'Olhe o último algarismo: 0, 2, 4, 6 e 8 indicam número par.', 'Procure a opção que termina em 1, 3, 5, 7 ou 9.'],
  107: ['Crescente quer dizer que cada número é maior que o anterior.', 'Teste cada opção: o segundo número é maior que o primeiro? E o terceiro?', 'Basta um número menor que o anterior para a opção não ser crescente.'],
  108: ['Use os dedos ou desenhe bolinhas.', 'Comece no 6 e conte mais 4.', 'Conte a partir do 6: sete, oito... continue até contar 4 números.'],
  109: ['Subtrair é tirar. Comece com 13.', 'Tire 3 primeiro para chegar a um número redondo.', '13 − 3 = 10. Ainda faltam tirar 2.'],
  110: ['Escreva a lista começando pelo 2.', 'O próprio 2 já é o 1º número da lista.', 'Escreva 2, 4, ... e conte até chegar ao 4º número.'],
  111: ['São dois grupos de questões. Calcule cada grupo separado.', 'Quanto valem juntas as 15 questões de 4 pontos?', '15 × 4 = 60. Agora calcule 5 × 8 e junte os dois resultados.'],
  112: ['Escreva os termos a partir do 4º, que vale 12.', 'Cada termo seguinte aumenta 3. Quanto vale o 5º?', 'O 5º termo é 15. Falta só um passo até o 6º.'],
  113: ['Quanto tempo a tarefa leva no total?', 'O que falta é o total menos o tempo que já passou.', 'Faça 20 − 8.'],
  114: ['Cuidado: a pergunta é quanto a pessoa andou, não onde ela terminou.', 'Voltar também conta como andar.', 'Some todos os trechos que a pessoa andou.'],
  115: ['Cada caixa tem a mesma quantidade de lápis.', 'Você pode somar 6 + 6 + 6 + 6.', 'Isso é o mesmo que 4 × 6.'],
  116: ['Descubra primeiro quanto custa uma maçã.', 'Se 3 maçãs custam 6 reais, divida 6 por 3.', 'Uma maçã custa 2 reais. Agora multiplique por 5.'],
  117: ['Faça uma mudança de cada vez, na ordem em que acontecem.', 'Quantos alunos ficam depois que 3 saem?', 'Ficam 5 alunos. Agora entram 2.'],
  118: ['Quanto aumenta de um número para o próximo?', 'De 3 para 6 aumenta 3. Isso se repete nos outros?', 'Some 3 ao último número da sequência.'],
  119: ['Multiplicar é somar o mesmo número várias vezes.', '7 × 4 é o mesmo que 7 + 7 + 7 + 7.', '7 + 7 = 14. Agora dobre esse resultado.'],
  120: ['Dividir é repartir em partes iguais.', 'Quantos grupos de 3 dá para formar com 18?', 'Qual número vezes 3 dá 18?'],
  121: ['Quanto a sequência aumenta a cada passo?', 'Ela aumenta de 2 em 2. Continue a lista depois do 7.', 'O 4º termo é 7 e o 5º é 9. Qual é o próximo?'],
  122: ['Você está juntando dois grupos de objetos.', 'Comece pelo 5 e conte mais 3.', 'Faça 5 + 3 e confira contando nos dedos.'],
  123: ['Quantos itens de cada tipo foram comprados?', 'São 2 canetas: calcule quanto elas custam juntas.', '2 × 3 = 6. Agora some o preço do caderno.'],
  124: ['Os parênteses dizem o que fazer primeiro.', 'Calcule 9 + 3 antes de dividir.', '9 + 3 = 12. Agora divida por 2.'],
  'A-sim': ['Quanto aumenta de uma cadeira para a próxima?', 'Aumenta 3. Continue a lista: 5, 8, 11, 14, ...', 'A 5ª cadeira é 17 e a 6ª é 20. Qual é a 7ª?'],
  'B-sim': ['São dois tipos de lanche. Calcule cada tipo separado.', 'Quanto custam os 5 sucos juntos?', '5 × 4 = 20. Agora calcule 6 × 3 e junte os dois.'],
  'A-chk-1': ['Compare cada número com o anterior.', 'De 5 para 10 e de 10 para 20, o número dobra.', 'Qual é o dobro de 40?'],
  'A-chk-2': ['Quanto aumenta de um número para o próximo?', 'Aumenta 3 a cada passo.', 'Some 3 ao 10.']
};

export const getHints = (id) => ITEM_HINTS[id] || ITEM_HINTS[String(id)] || [];

// ---------------------------------------------------------------------------
// Experimento "copiar x estudar ativamente"
// ---------------------------------------------------------------------------
// Os itens do experimento não se repetem nas missões (Detetive usa 110, 112, 122 e 123;
// Me teste e Tente primeiro usam outros itens). Assim, nenhuma missão adianta a
// resposta de uma pergunta do quiz, em qualquer ordem de etapas.
export const EXPERIMENT_THEMES = {
  A: {
    id: 'A',
    title: 'Sequências e padrões',
    intro: 'Descubra a regra que liga os números.',
    activity: [102, 118, 121, 107],
    checks: ['A-chk-1', 'A-chk-2'],
    quiz: { identical: 121, similar: 'A-sim' }
  },
  B: {
    id: 'B',
    title: 'Problemas em duas etapas',
    intro: 'Resolva uma parte de cada vez.',
    activity: [111, 116, 117, 124],
    checks: [103, 114],
    quiz: { identical: 111, similar: 'B-sim' }
  }
};

export const THEME_ORDER = ['A', 'B'];

// Ordem fixa do quiz, intercalando temas e tipos de pergunta.
export const QUIZ_ITEMS = [
  { itemId: 121, theme: 'A', kind: 'identical' },
  { itemId: 'B-sim', theme: 'B', kind: 'similar' },
  { itemId: 111, theme: 'B', kind: 'identical' },
  { itemId: 'A-sim', theme: 'A', kind: 'similar' }
];

export const EXPERIMENT_ITEM_IDS = [...new Set([
  ...Object.values(EXPERIMENT_THEMES).flatMap((theme) => [...theme.activity, ...theme.checks, theme.quiz.identical, theme.quiz.similar])
].map(String))];

export const CONFIDENCE_LEVELS = [
  { id: 1, label: 'Chutei', emoji: '🎲' },
  { id: 2, label: 'Acho que sim', emoji: '🤔' },
  { id: 3, label: 'Tenho certeza', emoji: '💪' }
];

export const MODE_LABELS = {
  copiar: 'Com a resposta pronta',
  ativo: 'Estudando ativamente'
};

// ---------------------------------------------------------------------------
// Enquete de abertura
// ---------------------------------------------------------------------------
export const OPENING_POLL = {
  question: 'Quem já copiou uma resposta da IA sem entender?',
  options: [
    { id: 'ja', label: 'Já fiz isso' },
    { id: 'nunca', label: 'Nunca fiz' },
    { id: 'sem-ia', label: 'Nunca usei IA' },
    { id: 'prefiro-nao', label: 'Prefiro não responder' }
  ]
};

// ---------------------------------------------------------------------------
// Missões
// ---------------------------------------------------------------------------
// Adaptação do PRE_AI_CHECKLIST da Oficina para a linguagem de 11 a 14 anos.
export const KID_PRE_HINT_CHECKLIST = [
  { source: PRE_AI_CHECKLIST[0], text: 'Li a pergunta inteira e sei o que ela pede.' },
  { source: PRE_AI_CHECKLIST[1], text: 'Quero uma pista, não a resposta pronta.' }
];

export const MISSIONS = {
  'tente-primeiro': {
    id: 'tente-primeiro',
    technique: 'Tentar resolver antes de perguntar',
    title: 'Tente primeiro',
    itemId: 101,
    goal: 'Escreva como você pensou ou escolha uma alternativa. Só depois o tutor libera a primeira dica.'
  },
  remix: {
    id: 'remix',
    technique: 'Pedir explicações em vez de respostas prontas',
    title: 'Remix de prompt',
    goal: 'Transforme um pedido que pede a resposta pronta em um pedido que ajuda você a aprender.'
  },
  'me-teste': {
    id: 'me-teste',
    technique: 'Pedir que a IA faça perguntas para testar o que você aprendeu',
    title: 'Me teste',
    itemIds: [109, 115, 106],
    goal: 'Responda antes de ver o gabarito. Ver o gabarito antes de responder não vale ponto.'
  },
  detetive: {
    id: 'detetive',
    technique: 'Conferir as informações recebidas',
    title: 'Detetive de erros',
    goal: 'Uma "IA" respondeu estas perguntas. Algumas respostas têm erro. Confira cada uma.'
  }
};

export const REMIX_PROMPTS = [
  { id: 'resumo', text: 'Faz meu resumo de ciências sobre o ciclo da água.' },
  { id: 'questao', text: 'Resolve a questão 3 da lista pra mim.' },
  { id: 'resposta', text: 'Qual é a resposta da lição de matemática da página 42?' }
];

export const REMIX_EXAMPLE = 'Eu tentei resumir o ciclo da água, mas não entendi a condensação. Me explica com um exemplo do dia a dia e depois me faz uma pergunta para ver se eu entendi?';

// Versões ORIGINAIS (com erro) das questões corrigidas no OBI Quest 1.5.0. São erros
// reais, com explicação convincente, usados como "respostas de IA" no Detetive.
// A questão 119 entra como controle: a resposta está certa.
export const DETECTIVE_CASES = [
  { id: 'det-110', sourceId: 110, aiAnswerIndex: 1, aiExplanation: 'A sequência é 2, 4, 6, 8. Logo, o 4º número é 8.', hasError: true, errorNote: 'A explicação diz 8, mas a resposta marcada é 6. A própria explicação desmente a resposta.' },
  { id: 'det-112', sourceId: 112, aiAnswerIndex: 2, aiExplanation: 'A sequência é 12, 15, 18, 21. Então o 6º termo é 21.', hasError: true, errorNote: 'O 12 já é o 4º termo. Contando a partir dele: 12 (4º), 15 (5º), 18 (6º).' },
  { id: 'det-119', sourceId: 119, aiAnswerIndex: 1, aiExplanation: '7 × 4 = 28.', hasError: false, errorNote: 'Esta resposta está certa. Conferir também serve para confirmar.' },
  { id: 'det-122', sourceId: 122, aiAnswerIndex: 0, aiExplanation: '5 + 3 = 8.', hasError: true, errorNote: 'A explicação faz a conta certa (8), mas a resposta marcada é 7.' },
  { id: 'det-123', sourceId: 123, aiAnswerIndex: 2, aiExplanation: '7 + 2 × 3 = 13 reais.', hasError: true, errorNote: 'A conta dá 13, mas a resposta marcada é 12.' },
  {
    id: 'det-g1', generated: true, hasError: true,
    question: 'Uma viagem começa às 8h40 e dura 35 minutos. A que horas termina?',
    options: ['9h05', '9h10', '9h15', '9h25'],
    correct: 2,
    aiAnswerIndex: 0,
    aiExplanation: 'Termina às 9h05, porque 8h40 + 35 minutos = 9h05.',
    errorNote: 'De 8h40 até 9h00 são 20 minutos. Faltam 15 minutos: a viagem termina às 9h15.'
  }
];

export const getDetectiveCase = (caseData) => {
  if (!caseData.sourceId) return { ...caseData, title: 'Horário da viagem' };
  const source = getItem(caseData.sourceId);
  return { ...caseData, title: source.title, question: source.question, options: source.options, correct: source.correct };
};

// ---------------------------------------------------------------------------
// Fechamento: desafio da semana a partir do checklist de Uso responsável
// ---------------------------------------------------------------------------
export const WEEKLY_CHALLENGE = [
  { source: RESPONSIBLE_CHECKLIST[0], text: 'Tentei resolver sozinho antes de pedir ajuda.' },
  { source: RESPONSIBLE_CHECKLIST[1], text: 'Pedi explicação e entendi, em vez de só copiar a resposta.' },
  { source: RESPONSIBLE_CHECKLIST[2], text: 'Pedi para a IA me fazer perguntas sobre o que eu ainda não entendia.' },
  { source: RESPONSIBLE_CHECKLIST[3], text: 'Conferi a resposta no caderno, no livro ou com o professor.' }
];

// ---------------------------------------------------------------------------
// Painel do palestrante
// ---------------------------------------------------------------------------
export const SPEAKER_CHECKLIST = [
  'Combinei a atividade com o professor da turma. O uso de celular pelos alunos depende de autorização pedagógica (Lei 15.100/2025).',
  'A escola autorizou a atividade e os responsáveis foram informados. Dados de crianças e adolescentes pedem cuidado extra na LGPD.',
  'Testei a rede da sala. Tenho o kit impresso e o modo sem celular como plano B.',
  'Conferi se o código e o QR ficam legíveis no projetor, do fundo da sala.',
  'Vou demonstrar ferramentas de IA só no meu computador, no telão. Os alunos não criam contas externas.',
  'Combinei com a turma: ninguém escreve nome, telefone ou outro dado pessoal no app.'
];

export const DEMO_SCRIPT = [
  'Abra a ferramenta de IA no seu computador, com a sua conta de adulto. Não peça que os alunos façam login.',
  'Faça um pedido "copiador", como "resolve esta conta pra mim". Mostre que a resposta vem pronta e pergunte à turma o que eles aprenderam.',
  'Se a ferramenta tiver um modo de estudo ou de aprendizado guiado, ative-o. Se não tiver, escreva no pedido: "não me dê a resposta; me faça perguntas e me dê uma pista por vez".',
  'Repita o mesmo problema. Mostre que agora a IA pergunta o que você já tentou e vai dando pistas.',
  'Peça: "me faça 3 perguntas para ver se eu entendi". Responda uma errada de propósito e mostre a correção.',
  'Termine conferindo a resposta numa fonte confiável, como o livro. Lembre que a IA também erra.'
];

export const HONESTY_NOTES = [
  'O experimento é uma demonstração com esta turma, não uma prova científica.',
  'O tutor do app segue regras fixas escritas pela equipe; ele não é uma IA generativa.',
  'O Pensa Comigo é um modo do OBI Quest e não é um serviço oficial da OBI.'
];

// Formato único usado pelo componente do tutor (itens do banco, gerados ou do catálogo).
export const toTutorItem = (id) => {
  const item = getItem(id);
  if (!item) return null;
  return {
    id: String(item.id),
    title: item.title,
    statement: item.question,
    type: 'multipla-escolha',
    options: item.options,
    correct: item.correct,
    answer: item.options[item.correct],
    explanation: item.explanation,
    hints: getHints(item.id),
    checks: [],
    generated: Boolean(item.generated)
  };
};
