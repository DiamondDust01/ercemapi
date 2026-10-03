# OBI Quest: funções e mecânicas

## Visão geral

OBI Quest é uma aplicação de treino em React e Vite. A interface principal e as regras do produto ficam concentradas em `src/App.jsx`; `src/main.jsx` monta a aplicação e `src/styles.css` fornece os estilos. O Firebase é usado quando há configuração disponível. Preferências, progresso e registros pedagógicos são mantidos no navegador.

## Mecânicas originais

### Desafios de programação

`LEVELS` contém os desafios, exemplos iniciais de C++ e Python e uma função `validate(code, language)` por nível. `CodeEditor` controla a edição, troca de linguagem, reinício e envio. `handleRunCode` encaminha o código para o validador do nível e atualiza saída, veredito e vitória.

Os validadores são regras didáticas locais; não compilam nem executam código arbitrário. O resultado Accepted indica que as verificações previstas para aquele desafio foram satisfeitas.

### Iniciação

`INICIACAO_QUESTIONS` contém enunciados, alternativas e explicações. `seededShuffle` embaralha a lista de forma reproduzível a partir de uma semente. `getIniciacaoDifficulty` e `getIniciacaoPoints` determinam dificuldade e pontuação quando esses campos não estão definidos na questão. `iniciacaoQuestionsByYear`, `iniciacaoScore` e `iniciacaoMaxScore` preparam a prova e calculam seu resultado.

### Conta, persistência e salas

A aplicação tenta autenticação anônima no Firebase, acompanha a sessão com `onAuthStateChanged` e observa dados com `onSnapshot`. O progresso de usuário e salas é sincronizado quando há Firebase configurado. Nome, avatar, checklist, recordes e preferências ficam no `localStorage` como alternativa local.

As funções de sala criam e ingressam em partidas, atualizam participantes e mostram classificação em tempo real. Os cronômetros de Iniciação e Programação usam efeitos com intervalos e estados independentes.

### Interface e áudio

`BinaryBackdrop` desenha o fundo decorativo. `AudioEngine` cria música procedural com Web Audio API e pode ser iniciado ou pausado pela interface. `formatTime` padroniza a apresentação dos cronômetros.

## Oficina de aprendizagem com IA

A área IA Mentora agrupa dez vistas na própria tela: mentoria, comparação, depuração, variações, banca, trilha, uso responsável, relatórios, professor e juízes externos. Não há novos componentes ou arquivos de código separados para essa variação.

### Mentor não solucionador

`buildMentorReply` seleciona explicações conceituais por tópico e nível. Os níveis são: pergunta socrática, dica conceitual, exemplo análogo e roteiro parcial em linguagem natural. Pedidos explícitos de solução final ou código completo recebem uma recusa pedagógica. O acesso à mentoria exige confirmações de uso responsável, possui limite de cinco consultas por sessão e a rodada comparativa com IA limita-se a três dicas.

A implementação atual é uma mentoria local baseada em regras, não um serviço de modelo generativo. O código do usuário não é enviado a terceiros. O histórico registra pergunta, resposta, nível, tópico e data; `hintCounts` contabiliza as dicas por tópico.

### Sessão comparativa

`COMPARISON_PAIRS` oferece problemas equivalentes por técnica. `startComparison` abre a rodada sem IA; `checkComparisonAnswer` conta tentativas e confere a resposta; `finishComparisonRound` encerra cada etapa, mede duração e abre o problema gêmeo. A segunda etapa habilita pistas após o checklist. Ao final, os dados de ambas as rodadas são salvos para comparação de tempo, tentativas, acerto e dicas.

O relatório mostra os dados da sessão mais recente e mantém o histórico. As perguntas de reflexão registram o que a ajuda esclareceu e o que o aluno faria sem ela.

### Depuração guiada

`DEBUG_GUIDE` traduz Wrong Answer, Runtime Error, Time Limit Exceeded, Compilation Error e Memory Limit. `analyzeDebugCode` procura padrões comuns no texto colado, assinala linhas candidatas e sugere perguntas de investigação. `generateDebugCases` lista entradas-limite relacionadas ao tópico selecionado.

A análise é heurística local, não executa nem corrige o programa e pode não reconhecer erros fora dos padrões previstos. O checklist cobre índices, estouro de inteiros, inicialização e complexidade.

### Variações e reconhecimento de padrões

`VARIATION_TEMPLATES` descreve técnicas, enunciados e restrições para busca binária, programação dinâmica, grafos e estruturas de dados. `generateProblemVariant` altera o eixo escolhido (restrição, formato de entrada/saída ou contexto) e ajusta a dificuldade com base nas sessões registradas. O aluno pode comparar a técnica dos problemas e salvar variações no banco local para reutilização.

### Banca e entrevista

`submitInterviewAnswer` recebe uma explicação em texto e devolve perguntas de revisão sobre etapas da abordagem, complexidade e casos-limite. As respostas e comentários ficam no histórico pedagógico. Esse mecanismo verifica presença de conceitos-chave; não substitui avaliação humana da prova ou da correção do algoritmo.

### Trilha e uso responsável

A trilha acompanha cinco etapas: entender conceito, resolver sem IA, consultar IA, comparar e refazer sem ajuda. O nível de ajuda liberado avança conforme o número de rodadas independentes resolvidas. O checklist pré-sessão é exigido antes de liberar pistas e o checklist pós-sessão registra a autoavaliação.

O painel de autonomia calcula resultados a partir das rodadas salvas. A meta semanal conta problemas pareados resolvidos sem ajuda. Quando há muitas consultas, a interface recomenda rever a teoria e formular uma hipótese própria.

### Biblioteca, relatórios e diário

`IA_PROMPT_LIBRARY` reúne prompts por tema; favoritos e histórico são salvos localmente e favoritos podem ser exportados como texto. A recomendação de prompt muda conforme a etapa ou o veredito selecionado.

Os relatórios mostram duração, tentativas, acertos, dicas e tópicos de cada sessão. O diário registra aprendizados e dificuldades. `exportTrainingReport` baixa o histórico em CSV. Os dados são locais ao navegador e não são compartilhados por padrão.

### Professor e minicurso

O modo professor permite configurar tópico e nome, criar uma sessão com código e acompanhar apelidos anônimos, consultas e tópicos. `joinClassroom` registra participação e `publishStudentMetrics` sincroniza métricas pelo Firestore quando Firebase e regras de acesso estão configurados. `exportClassroomReport` baixa agregados em CSV. Perguntas para debate estruturado ficam disponíveis no painel.

Sem Firebase configurado, o código da turma só funciona naquele dispositivo. A chave interna do documento não é exibida como identidade do estudante; o painel usa apelido e métricas, sem armazenar o código-fonte.

### Juízes externos

O importador valida URLs HTTPS de Codeforces, Beecrowd e OBI e guarda o problema no histórico unificado. Para Codeforces, `syncCodeforcesHistory` consulta o histórico público do handle pela API do serviço e relaciona submissões recentes ao problema importado. Beecrowd e OBI podem ser abertos em seus sites e ter o veredito registrado manualmente.

Por segurança, login e envio de código continuam nos sites oficiais; o OBI Quest não guarda credenciais nem envia submissões em nome do aluno. O histórico permite comparar os resultados registrados no treino local e nos juízes externos, sem afirmar equivalência entre enunciados diferentes.

## Armazenamento e privacidade

O estado da oficina fica em `localStorage` na chave `obi-quest-pedagogy`. Inclui histórico de mentoria, contagem de dicas, sessões pareadas, variações salvas, favoritos, diário, entrevistas, meta semanal, vereditos externos e participação em minicurso. O código digitado na depuração é transitório e não é persistido. Dados de turma só são enviados ao Firestore se houver configuração, autenticação e regras que permitam a operação.

## Verificação

`npm run build` executa a compilação de produção do Vite. Os validadores dos desafios e as análises pedagógicas são simulações locais, não um ambiente de execução de C++/Python nem um juiz completo.
