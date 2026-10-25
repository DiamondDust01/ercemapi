// Conteúdo pedagógico do OBI Quest, extraído de App.jsx sem alteração de comportamento
// para ser compartilhado com o modo Pensa Comigo e com os testes.

export const INICIACAO_QUESTIONS = [
  {
    id: 101, year: 1, title: "Lógica de Blocos", modality: "iniciacao", level: "Iniciação 1",
    question: "Um robô na OBI executa instruções sequenciais: começa na posição 0, anda 3 para frente, volta 1, e anda mais 4 para frente. Qual a posição final?",
    options: ["6", "7", "8", "5"],
    correct: 0,
    explanation: "Começa em 0. +3 = 3. -1 = 2. +4 = 6."
  },
  {
    id: 102, year: 1, title: "Padrão numérico", modality: "iniciacao", level: "Iniciação 1",
    question: "Qual é o próximo número da sequência: 2, 4, 8, 16, ?",
    options: ["18", "24", "32", "30"],
    correct: 2,
    explanation: "Cada termo dobra. 16 × 2 = 32."
  },
  {
    id: 103, year: 1, title: "Operação mental", modality: "iniciacao", level: "Iniciação 1",
    question: "Se um número é aumentado em 5 e depois diminuído em 2, o efeito líquido é:",
    options: ["-3", "+3", "+2", "-2"],
    correct: 1,
    explanation: "A operação líquida é +5 - 2 = +3."
  },
  {
    id: 104, year: 1, title: "Comparação de itens", modality: "iniciacao", level: "Iniciação 1",
    question: "Qual número é maior entre 17 e 19?",
    options: ["17", "19", "São iguais", "Não dá para saber"],
    correct: 1,
    explanation: "19 é maior que 17 porque está mais à direita na reta numérica."
  },
  {
    id: 105, year: 1, title: "Dobro e metade", modality: "iniciacao", level: "Iniciação 1",
    question: "Se o dobro de um número é 10, qual é esse número?",
    options: ["2", "4", "5", "8"],
    correct: 2,
    explanation: "O número cujo dobro é 10 é 5, porque 5 × 2 = 10."
  },
  {
    id: 106, year: 1, title: "Par ou ímpar", modality: "iniciacao", level: "Iniciação 1",
    question: "Qual das opções abaixo é um número ímpar?",
    options: ["8", "10", "11", "14"],
    correct: 2,
    explanation: "11 é ímpar porque não é divisível por 2."
  },
  {
    id: 107, year: 1, title: "Sequência crescente", modality: "iniciacao", level: "Iniciação 1",
    question: "Qual sequência está em ordem crescente?",
    options: ["5, 2, 7, 1", "1, 3, 5, 7", "9, 8, 7, 6", "4, 8, 3, 10"],
    correct: 1,
    explanation: "A sequência 1, 3, 5, 7 está em ordem crescente."
  },
  {
    id: 108, year: 1, title: "Raciocínio com soma", modality: "iniciacao", level: "Iniciação 1",
    question: "A soma de 6 e 4 é:",
    options: ["8", "9", "10", "12"],
    correct: 2,
    explanation: "6 + 4 = 10."
  },
  {
    id: 109, year: 1, title: "Menos e mais", modality: "iniciacao", level: "Iniciação 1",
    question: "Qual é o resultado de 13 - 5?",
    options: ["6", "7", "8", "9"],
    correct: 2,
    explanation: "13 - 5 = 8."
  },
  {
    id: 110, year: 1, title: "Contagem rápida", modality: "iniciacao", level: "Iniciação 1",
    question: "Se você contar de 2 em 2, qual será o 4º número a partir de 2?",
    options: ["4", "6", "8", "10"],
    correct: 2,
    explanation: "A sequência é 2, 4, 6, 8. Logo, o 4º número é 8."
  },
  {
    id: 111, year: 2, title: "Árvores de Decisão", modality: "iniciacao", level: "Iniciação 2",
    question: "Em uma prova de Iniciação da OBI, 15 questões valem 4 pontos cada e 5 questões valem 8 pontos cada. Qual o total de pontos da prova?",
    options: ["80", "95", "100", "120"],
    correct: 2,
    explanation: "15 * 4 = 60 pontos. 5 * 8 = 40 pontos. Total = 60 + 40 = 100 pontos."
  },
  {
    id: 112, year: 2, title: "Mapa de valores", modality: "iniciacao", level: "Iniciação 2",
    question: "Em uma sequência, o 4º termo vale 12 e cada termo seguinte aumenta 3. Qual é o 6º termo?",
    options: ["15", "18", "21", "24"],
    correct: 1,
    explanation: "O 4º termo é 12, o 5º é 15 e o 6º é 18. Então o 6º termo é 18."
  },
  {
    id: 113, year: 2, title: "Raciocínio com tempo", modality: "iniciacao", level: "Iniciação 2",
    question: "Uma tarefa demora 20 minutos para terminar. Se já se passaram 8 minutos, quanto falta?",
    options: ["10 min", "12 min", "14 min", "16 min"],
    correct: 1,
    explanation: "20 - 8 = 12, então faltam 12 minutos."
  },
  {
    id: 114, year: 2, title: "Retorno de etapas", modality: "iniciacao", level: "Iniciação 2",
    question: "Uma pessoa sai de casa, anda 4 metros, volta 2 e depois anda 3. Qual distância total percorrida?",
    options: ["5 m", "7 m", "9 m", "11 m"],
    correct: 2,
    explanation: "A distância total percorrida é 4 + 2 + 3 = 9 metros."
  },
  {
    id: 115, year: 2, title: "Tabela de valores", modality: "iniciacao", level: "Iniciação 2",
    question: "Se cada caixa contém 6 lápis e você tem 4 caixas, quantos lápis têm ao todo?",
    options: ["20", "22", "24", "26"],
    correct: 2,
    explanation: "4 caixas × 6 lápis = 24 lápis."
  },
  {
    id: 116, year: 2, title: "Extrapolação lógica", modality: "iniciacao", level: "Iniciação 2",
    question: "Se 3 maçãs custam 6 reais, quanto custam 5 maçãs?",
    options: ["8", "10", "12", "15"],
    correct: 1,
    explanation: "Cada maçã custa 2 reais; então 5 maçãs custam 10 reais."
  },
  {
    id: 117, year: 2, title: "Duas etapas", modality: "iniciacao", level: "Iniciação 2",
    question: "Uma fila tem 8 alunos. 3 saem e 2 entram. Quantos alunos ficam?",
    options: ["6", "7", "8", "9"],
    correct: 1,
    explanation: "8 - 3 + 2 = 7 alunos."
  },
  {
    id: 118, year: 2, title: "Lógica simples", modality: "iniciacao", level: "Iniciação 2",
    question: "Qual número completa a regra: 3, 6, 9, 12, ?",
    options: ["13", "14", "15", "16"],
    correct: 2,
    explanation: "A sequência aumenta de 3 em 3; então o próximo é 15."
  },
  {
    id: 119, year: 2, title: "Cálculo rápido", modality: "iniciacao", level: "Iniciação 2",
    question: "Qual é o resultado de 7 × 4?",
    options: ["24", "28", "32", "36"],
    correct: 1,
    explanation: "7 × 4 = 28."
  },
  {
    id: 120, year: 2, title: "Blocos de divisão", modality: "iniciacao", level: "Iniciação 2",
    question: "Qual é o quociente de 18 ÷ 3?",
    options: ["4", "5", "6", "7"],
    correct: 2,
    explanation: "18 ÷ 3 = 6."
  },
  {
    id: 121, year: 1, title: "Sequência de passos", modality: "iniciacao", level: "Iniciação 1",
    question: "Uma sequência de movimentos é 1, 3, 5, 7, ... Qual é o 6º termo?",
    options: ["9", "10", "11", "12"],
    correct: 2,
    explanation: "A sequência aumenta de 2 em 2; o 6º termo é 11."
  },
  {
    id: 122, year: 1, title: "Quantas vezes", modality: "iniciacao", level: "Iniciação 1",
    question: "Se você contar 5 objetos e depois mais 3, quantos objetos terá ao todo?",
    options: ["7", "8", "9", "10"],
    correct: 1,
    explanation: "5 + 3 = 8."
  },
  {
    id: 123, year: 2, title: "Comparação de preços", modality: "iniciacao", level: "Iniciação 2",
    question: "Se uma caneta custa 3 reais e um caderno custa 7 reais, quanto custa um caderno e duas canetas?",
    options: ["10", "11", "12", "13"],
    correct: 3,
    explanation: "7 + 2 × 3 = 13 reais."
  },
  {
    id: 124, year: 2, title: "Operação em cadeia", modality: "iniciacao", level: "Iniciação 2",
    question: "Qual é o resultado de (9 + 3) ÷ 2?",
    options: ["5", "6", "7", "8"],
    correct: 1,
    explanation: "9 + 3 = 12; 12 ÷ 2 = 6."
  }
];

export const MENTOR_LEVELS = [
  { id: 1, label: 'Pergunta socrática', description: 'Uma pergunta para você construir o próximo passo.' },
  { id: 2, label: 'Dica conceitual', description: 'Uma pista sobre o conceito, sem resolver o exercício.' },
  { id: 3, label: 'Exemplo análogo', description: 'Um exemplo diferente que usa a mesma ideia.' },
  { id: 4, label: 'Roteiro parcial', description: 'Etapas abstratas, sem código executável ou resposta final.' }
];

export const IA_PROMPT_LIBRARY = [
  { id: 'binary', category: 'Busca binária', text: 'Explique o conceito de busca binária sem resolver o exercício.' },
  { id: 'dp', category: 'Programação dinâmica', text: 'Que subproblemas menores podem aparecer aqui?' },
  { id: 'graphs', category: 'Grafos', text: 'Como posso distinguir busca em largura de menor caminho?' },
  { id: 'structures', category: 'Estruturas de dados', text: 'Que operações desta estrutura são importantes para o problema?' },
  { id: 'stl', category: 'STL', text: 'Qual custo das operações da estrutura que estou usando?' },
  { id: 'python', category: 'Python', text: 'Explique este conceito usando recursos idiomáticos de Python.' },
  { id: 'variation', category: 'Variações', text: 'Gere uma variação deste problema mudando uma restrição.' },
  { id: 'debug', category: 'Depuração', text: 'O que meu código pode estar fazendo de errado? Faça perguntas, sem corrigir.' },
  { id: 'review', category: 'Revisão', text: 'Revise minha abordagem e aponte uma hipótese que devo testar.' }
];

export const DEBUG_GUIDE = {
  Accepted: 'A solução foi aceita pelo juiz. Use este resultado como ponto de partida: explique a ideia e procure uma variação ou caso-limite para consolidar o aprendizado.',
  'Runtime Error': 'O programa iniciou, mas falhou durante a execução. Investigue acesso inválido, divisão por zero e casos em que a entrada está vazia.',
  'Wrong Answer': 'O programa terminou, mas produziu uma resposta diferente da esperada. Compare a lógica com casos pequenos e limites.',
  'Time Limit Exceeded': 'O programa não terminou dentro do tempo. Estime quantas operações crescem com a entrada e procure trabalho repetido.',
  'Compilation Error': 'O compilador não conseguiu montar o programa. Leia a primeira mensagem do compilador e confira sintaxe, nomes e tipos.',
  'Memory Limit': 'O programa excedeu o limite de memória. Verifique estruturas dimensionadas pela entrada e cópias que poderiam ser evitadas.'
};

export const VARIATION_TEMPLATES = {
  'busca-binaria': {
    title: 'Busca em dados ordenados',
    technique: 'Busca binária',
    variant: 'Uma sequência ordenada contém identificadores. Encontre a primeira posição em que o valor é maior ou igual ao alvo e conte as comparações.',
    difficulty: 'médio',
    restrictions: ['A sequência pode ter até 1.000.000 de itens.', 'A sequência pode estar vazia.', 'O alvo pode estar fora do intervalo.'],
    contexts: ['catálogo de livros', 'placar de uma olimpíada', 'sensores ordenados']
  },
  'dp': {
    title: 'Planejamento com capacidade limitada',
    technique: 'Programação dinâmica',
    variant: 'Escolha tarefas com custos e benefícios para maximizar o benefício total sem ultrapassar o orçamento disponível.',
    difficulty: 'difícil',
    restrictions: ['O orçamento pode ser zero.', 'Há tarefas com o mesmo custo.', 'Cada tarefa só pode ser escolhida uma vez.'],
    contexts: ['organização de uma feira', 'seleção de atividades', 'carregamento de equipamentos']
  },
  'grafos': {
    title: 'Rotas entre pontos conectados',
    technique: 'Grafos',
    variant: 'Dado um mapa de conexões, descubra o menor custo para sair de uma origem e chegar a um destino.',
    difficulty: 'difícil',
    restrictions: ['Pode não existir caminho.', 'Há conexões de custo zero.', 'O mapa pode ter até 100.000 conexões.'],
    contexts: ['rede de computadores', 'linhas de transporte', 'salas conectadas']
  },
  'stl': {
    title: 'Frequência de elementos',
    technique: 'Ordenação e estruturas de dados',
    variant: 'Receba uma sequência de códigos e determine quais aparecem mais de uma vez e quantas ocorrências têm.',
    difficulty: 'fácil',
    restrictions: ['A sequência pode estar vazia.', 'Os valores podem ser negativos.', 'A sequência pode conter muitos valores repetidos.'],
    contexts: ['inventário de peças', 'votos de uma enquete', 'registros de acesso']
  }
};

export const RESPONSIBLE_CHECKLIST = [
  'Eu tentei resolver sozinho antes de pedir ajuda.',
  'Eu entendi a explicação e não apenas copiei a solução.',
  'Eu revisei as partes do código que ainda não entendo.',
  'Eu usei a IA como ferramenta de reflexão, não como atalho.'
];

export const PRE_AI_CHECKLIST = [
  'Tentei identificar entradas, saídas e restrições antes de pedir ajuda.',
  'Quero uma pista ou explicação, não uma solução pronta.'
];

export const COMPARISON_PAIRS = {
  'busca-binaria': [
    { title: 'Catálogo ordenado', statement: 'No vetor [2, 4, 7, 10, 13], qual é o índice (começando em zero) do valor 10?', answer: '3' },
    { title: 'Placar ordenado', statement: 'No vetor [1, 5, 8, 12, 17], qual é o índice (começando em zero) do valor 8?', answer: '2' }
  ],
  dp: [
    { title: 'Escolha de tarefas', statement: 'Tarefas (custo, benefício): (1, 2), (2, 4), (3, 4). Com capacidade 3 e uso único, qual benefício máximo?', answer: '6' },
    { title: 'Mochila de equipamentos', statement: 'Itens (peso, valor): (1, 3), (2, 5), (3, 6). Com capacidade 3 e uso único, qual valor máximo?', answer: '8' }
  ],
  grafos: [
    { title: 'Rotas de salas', statement: 'A→B custa 2, B→D custa 3, A→C custa 1 e C→D custa 7. Qual o custo mínimo de A até D?', answer: '5' },
    { title: 'Rede de estações', statement: 'P→Q custa 4, Q→S custa 2, P→R custa 3 e R→S custa 6. Qual o custo mínimo de P até S?', answer: '6' }
  ],
  stl: [
    { title: 'Contagem de códigos', statement: 'Na sequência [4, 2, 4, 1, 2, 4], quantos valores distintos aparecem repetidos?', answer: '2' },
    { title: 'Contagem de votos', statement: 'Na sequência [7, 7, 3, 5, 3, 9], quantos valores distintos aparecem repetidos?', answer: '2' }
  ]
};

// Pedidos de solução pronta que o mentor recusa (texto normalizado: minúsculas, sem acentos).
export const MENTOR_REFUSAL_PATTERN = /\b(resolva|resolucao completa|solucao (?:completa|final|pronta)|resposta final|codigo completo|codigo final|implemente para mim|faca para mim|me de a solucao|escreva o codigo)\b/;

export const MENTOR_EXPLANATIONS = {
  'busca-binaria': {
    concept: 'Busca binária mantém um intervalo candidato em dados ordenados. Cada comparação com o meio permite descartar uma das metades; por isso, o número de passos cresce aproximadamente com o logaritmo do tamanho da entrada.',
    question: 'O que precisa ser verdade sobre os dados para que descartar metade do intervalo não elimine uma resposta válida?',
    analogy: 'Imagine encontrar uma palavra em um dicionário: você abre perto do meio e escolhe a metade que ainda pode conter a palavra. O exercício não é um dicionário; apenas compartilha essa ideia de descarte.',
    steps: 'Roteiro parcial: definir os limites do intervalo; escolher um ponto central; comparar com o alvo; descartar a metade impossível; repetir enquanto ainda houver candidatos.'
  },
  dp: {
    concept: 'Programação dinâmica organiza subproblemas que se repetem. Uma relação de recorrência descreve como combinar resultados menores, e uma ordem de cálculo garante que os resultados necessários já existam.',
    question: 'Qual é o menor estado do problema que você consegue responder sem resolver o problema inteiro?',
    analogy: 'Ao planejar etapas de uma viagem, você registra o melhor custo para chegar a cada parada e reaproveita esses resultados, sem recalcular todos os caminhos desde o início.',
    steps: 'Roteiro parcial: definir o significado do estado; identificar escolhas possíveis; expressar a transição; definir casos-base; calcular estados em uma ordem válida.'
  },
  grafos: {
    concept: 'Um grafo representa entidades e conexões. A escolha do algoritmo depende do que as arestas significam: conectividade, menor número de passos ou menor custo com pesos.',
    question: 'As conexões têm custos diferentes? O objetivo minimiza passos, custo total ou apenas verifica se existe caminho?',
    analogy: 'Uma rede de estações pode ser desenhada como pontos ligados por rotas. Contar baldeações e minimizar preço são objetivos diferentes, mesmo usando o mesmo mapa.',
    steps: 'Roteiro parcial: modelar vértices e arestas; decidir a métrica; escolher a busca compatível; registrar o estado de cada vértice; verificar o destino.'
  },
  stl: {
    concept: 'Estruturas de dados organizam valores para favorecer operações específicas. Compare custo de acesso, busca, inserção e remoção com o tamanho e a frequência de cada operação.',
    question: 'Qual operação acontece mais vezes no seu problema e qual estrutura a torna mais barata?',
    analogy: 'Uma lista de chamada ordenada facilita procurar nomes; um índice por nome pode acelerar buscas repetidas, mas exige trabalho para ser mantido.',
    steps: 'Roteiro parcial: listar as operações necessárias; estimar quantas vezes ocorrem; escolher uma estrutura; medir o custo total; validar com entradas-limite.'
  },
  python: {
    concept: 'Em Python, listas, conjuntos e dicionários oferecem operações diferentes. A escolha deve refletir se você precisa preservar ordem, evitar repetição ou associar chaves a valores.',
    question: 'Você precisa manter a ordem original, garantir unicidade ou consultar um valor associado a uma chave?',
    analogy: 'Uma lista é como uma fila numerada, um conjunto como uma coleção sem duplicatas e um dicionário como um índice de chave para informação.',
    steps: 'Roteiro parcial: identificar a operação dominante; escolher a estrutura adequada; definir como percorrer os dados; testar vazio, repetido e valor ausente.'
  }
};

export const DEBUG_CASES_BY_TOPIC = {
  'busca-binaria': ['Vetor vazio', 'Um único elemento', 'Alvo menor que todos', 'Alvo maior que todos', 'Valores repetidos'],
  dp: ['Capacidade zero', 'Nenhum item disponível', 'Um item que excede a capacidade', 'Itens com valores iguais'],
  grafos: ['Origem igual ao destino', 'Destino desconectado', 'Aresta de custo zero', 'Grafo com um vértice'],
  stl: ['Sequência vazia', 'Todos os valores iguais', 'Todos os valores distintos', 'Valores negativos']
};
