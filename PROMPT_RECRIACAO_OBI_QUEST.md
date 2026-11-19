# Prompt de recriação — OBI Quest (engenharia reversa da versão 1.4.2)

> Cole tudo abaixo da linha em uma IA de programação (Claude Code, Cursor, Copilot etc.). O prompt foi obtido por engenharia reversa do código existente (`src/App.jsx`, módulos de domínio, testes, configs, docs e CHANGELOG) e descreve a aplicação com fidelidade suficiente para gerar uma cópia funcional equivalente.

---

## 0. Papel e objetivo

Você é um engenheiro front-end sênior. Crie do zero uma aplicação chamada **OBI Quest**, versão **1.4.2**: uma plataforma educacional de treino inspirada nas modalidades da Olimpíada Brasileira de Informática (OBI), em **português do Brasil**, com tema escuro "cyber/terminal", que roda na **web**, no **Android** (Capacitor) e no **Windows** (Electron) a partir do mesmo build React.

Reproduza **todas** as telas, fluxos, regras, textos, limites numéricos e dados descritos aqui. Quando este prompt fixar um valor (minutos, pontos, limites, chaves de armazenamento, caminhos do Firestore), use exatamente esse valor. Você pode dividir a interface em componentes e arquivos (o original concentra tudo em um `App.jsx` de ~3.500 linhas), desde que o comportamento observável seja idêntico.

## 1. Princípios de honestidade (inegociáveis)

A interface e a documentação devem deixar claro, sem exageros:

1. **Não é serviço oficial da OBI**, não substitui prova oficial, rankings não são classificação oficial. Use "plataforma de treino", "simulador educacional", "inspirado na OBI".
2. **O "juiz" não compila nem executa código**: cada desafio tem uma função `validate(code, lang)` que testa padrões textuais (regex). "Accepted" significa "a verificação didática prevista foi satisfeita".
3. **A "IA Mentora" não chama modelo generativo**: respostas vêm de regras e textos locais; nada é enviado a provedores de IA. A interface diz isso explicitamente.
4. **Depuração é heurística**: ausência de alerta não prova que o código está correto (e a tela diz isso).
5. **Multiplayer só existe com Firebase configurado**; sem ele, salas são demonstração local.
6. O indicador de rede local **não faz ping a servidor**; o indicador P2P mede ida-e-volta real pelo canal WebRTC e é distinto.

## 2. Stack, estrutura e scripts

**Dependências** (`package.json`, `"type": "module"`, `"private": true`, `"name": "obi-quest-v1"`, `"version": "1.4.2"`, `"main": "electron/main.cjs"`, descrição "Plataforma de treino para as modalidades da Olimpíada Brasileira de Informática", autor "OBI Quest"):

- dependencies: `firebase ^12.19.0`, `lucide-react ^0.525.0`, `react ^18.3.1`, `react-dom ^18.3.1`
- devDependencies: `@capacitor/android ^8.4.3`, `@capacitor/cli ^8.4.3`, `@capacitor/core ^8.4.3`, `@electron/asar ^4.3.1`, `@tailwindcss/vite ^4.3.3`, `@vitejs/plugin-react ^4.3.1`, `electron ^44.5.1`, `tailwindcss ^4.3.3`, `vite ^6.4.3`
- overrides: `"@grpc/grpc-js": "^1.14.5"`

**Scripts:**

```json
"dev": "vite",
"build": "vite build",
"test": "node --test",
"preview": "vite preview",
"android:sync": "npm run build && cap sync android",
"android:open": "cap open android",
"android:apk": "npm run android:sync && cd android && .\\gradlew.bat assembleDebug",
"app:windows": "npm run build && electron .",
"app:windows:package": "npm run build && node scripts/package-windows.cjs"
```

**Estrutura:**

```
index.html                 lang="pt-BR", <title>OBI Quest</title>, meta description "OBI Quest - Simulador de modalidades da Olimpíada Brasileira de Informática", body class="bg-slate-950", #root, script /src/main.jsx
vite.config.js             base './', plugins react() + tailwindcss(), server host 0.0.0.0 porta 3000
capacitor.config.json      appId "com.obique.quest", appName "OBI Quest", webDir "dist", bundledWebRuntime false
src/main.jsx               monta <App/> em StrictMode; se Capacitor.getPlatform()==='android' adiciona classe 'android-app' ao <html>
src/App.jsx                telas e fluxos
src/styles.css             estilos globais
src/competitionRooms.js (+ .test.js)
src/localConnection.js  (+ .test.js)
src/peerPairing.js      (+ .test.js)
electron/main.cjs
scripts/package-windows.cjs
scripts/diagnose_app_jsx.js   (utilitário de diagnóstico de JSX; opcional)
run.cjs / run.js / run.py     atalhos que executam "npm run dev" no diretório do projeto, avisando para rodar "npm install" e tratando erro de npm ausente
requirements.txt              comentário explicando que o projeto usa npm (lista de pacotes apenas informativa)
android/                      projeto Gradle/Capacitor (versionName 1.4.2, versionCode 8)
docs/                         fontes de estudo (ver seção 11)
README.md, CHANGELOG.md, BRANCH_STATUS.md, .gitignore
```

## 3. Identidade visual

- Tema escuro fixo (`color-scheme: dark`). Fundo base `#020408`; texto `#e2e8f0` / `slate-300`.
- Fontes Google: **Inter** (400/500/700/800/900) para interface e **JetBrains Mono** (400/700) para código e rótulos técnicos.
- `styles.css`: importa as fontes e `tailwindcss`; `box-sizing: border-box`; `html, body, #root` sem margem e `min-height: 100%`; `body` com `radial-gradient(circle at top, rgba(99,102,241,0.12), transparent 20%)` sobre `#020408`; `html.android-app { font-size: 14px }` e `html.android-app .android-binary-decoration { display: none }` (Android mais compacto, sem decoração binária); `main, header, section, article, div { min-width: 0 }`; scrollbar de 10px com thumb `#1f2937` arredondado; `::selection` índigo 45%.
- Paleta Tailwind: índigo/ciano para ação e destaque, esmeralda para sucesso/AC, âmbar para alerta/tempo, rosa para erro/WA. Cartões `rounded-2xl`/`rounded-[28px]`, bordas `slate-800`, `bg-slate-900/70`, `backdrop-blur`. Título do header com gradiente `from-indigo-400 to-cyan-400`.
- Seção Mentoria usa visual mais editorial: sem cantos arredondados, divisórias `border-l`/`border-b`, cabeçalhos em caixa alta com tracking.
- **BinaryBackdrop** (fixo, `pointer-events-none`, z-0): gradiente radial ciano no topo + grade de linhas ciano 10% de 24×24px + grade 28 colunas × 16 linhas de caracteres "0"/"1" alternados em mono ciano 30% (essa camada tem a classe `android-binary-decoration`).
- Ícones: `lucide-react` (Trophy, Home, BookOpen, Code, Bot, GraduationCap, Activity, Volume2/VolumeX, Clock3, Play, Pause, RotateCcw, CheckSquare, Download, Wifi/WifiOff, Cpu, Info, ChevronRight, Loader2 etc.).

## 4. Layout global e navegação

- Contêiner raiz `h-[100dvh] overflow-hidden flex flex-col`. **Header fixo** (h-14 / md:h-16) e **`<main>` como único painel de rolagem** (`overflow-y-auto`, `pt-14 pb-20 md:pt-16 md:pb-0`). Ao trocar de aba, um `useLayoutEffect` zera `scrollTop` do `<main>` (web, Android e desktop).
- **Header:** botão-logo (Trophy + "OBI Quest" + " (Modalidades)" visível só ≥ sm) que volta ao Início; em ≥ md, navegação textual: Início, Iniciação (Papel), Programação (PC), IA Mentora, Regulamento (ativo em `indigo-400`); à direita, pílula esmeralda com pontuação do usuário (`userData.score`, "pts" visível ≥ sm) e botão de áudio (Volume2/VolumeX, aria-label "Ativar/Desativar áudio").
- **Barra inferior** (somente < md, fixa, respeitando `safe-area-inset-bottom`): 5 botões ícone+rótulo — Início, Iniciação, Código, Mentoria, Regras; `aria-current="page"` no ativo (ciano, stroke 2.5).
- IDs das abas: `menu`, `iniciacao`, `programacao`, `mentor`, `academy`.
- **Elementos flutuantes** (z-40, acima da barra inferior no mobile, cantos no desktop):
  - Canto inferior esquerdo: **LocalConnectionIndicator** (`<details>`/`<summary>` em pílula: ícone Wifi/WifiOff + "Conexão: {rótulo}" + tipo de rede ≥ sm). Painel expandido: "Qualidade estimada neste dispositivo", estado da rede "conectada/desconectada, segundo o sistema", tipo, categoria (`effectiveType` maiúsculo), "Taxa estimada: X Mbps", "Latência estimada pelo sistema: X ms", aviso quando o navegador não fornece estimativas, e rodapé: "Indicador local baseado no estado e nas estimativas de rede do dispositivo. Não envia tráfego de teste nem mede a latência até um servidor." Cor: rosa offline/poor, esmeralda good, âmbar fair, slate unknown. Atualiza em `online`, `offline` e `navigator.connection` `change`.
  - Canto inferior direito, acima da versão: **PeerConnectionIndicator** (somente com sala online ativa): "Ping P2P: {X ms | Sem resposta | Medindo… | Conectando… | Desconectado | Aguardando par}". Cores por média: ≤50 esmeralda, ≤100 ciano, ≤200 âmbar, >200 rosa. Painel lista cada par com nome e ms/estado e explica que é medição real pelo canal WebRTC, não ping de servidor.
  - **AppVersion**: pílula mono `v{package.json.version}` (importar `package.json` no React; nunca escrever a versão à mão no código).
- **Tela de carregamento** (enquanto autentica): fundo preto, Loader2 girando e "CARREGANDO OBI QUEST..." pulsando.
- **Áudio procedural** (`AudioEngine`, Web Audio API, começa desligado): ganho mestre 0,12; agendador com lookahead de 0,1s a cada 25ms; tempo 140 BPM (colcheias), baseHz 50; kick a cada 4 passos (150Hz→0,01 em 0,3s), hat a cada 2 (ruído 20ms), snare no passo 2 de 4 (ruído 100ms com passa-altas 1200Hz); camadas trocam a cada 8 passos num ciclo de 24: A = serra com notas ×[1,1.2,1.5,1,1.8,1,0.9,2]; B = triângulo grave ×0,5×[1,1,0.8,0.8,1.2,1.2,0.5,0.5]; C = seno agudo ×[4,6,3,5,8,4,2,7] com passa-banda 3000Hz. O botão alterna suspend/resume. Ao obter AC: tempo 160/baseHz 60; ao obter WA: tempo 120/baseHz 40.

## 5. Telas

### 5.1 Início (`menu`)

Grade em 2 colunas (lg: 1.4fr / 0.9fr).

**Coluna principal:** cabeçalho com ícone Cpu, "OBI Quest" em mono ciano e "Plataforma de treino e competição"; título grande "Olimpíada Brasileira de **Informática**" (destaque índigo); parágrafo "Treine lógica, raciocínio e programação em uma experiência completa, com módulos de Iniciação, desafios de Programação e um ambiente de competição mais profissional."; caixa "Dica de preparação" ("Comece pelos problemas mais simples, mantenha a leitura do enunciado precisa e revise o que errou para melhorar em sequência."); 3 tiles: Iniciação "10 + 10 / Questões por faixa", Programação "10 / Desafios práticos", Competição "Timer / Modo sala + cronômetro"; 3 cartões clicáveis → Iniciação ("Pratique raciocínio lógico e matemática em uma sequência organizada por faixa." / "Abrir módulo"), Programação ("Resolva desafios em Python/C++ com estrutura de juiz, feedback e cronômetro de prova." / "Ir para o juiz"), Regulamento ("Entenda o formato da prova, o papel de cada modalidade e a lógica de preparação." / "Abrir guia").

**Coluna lateral:**
- **Perfil do competidor:** avatar grande, nome exibido (vazio → "Visitante"), "Nome e avatar reutilizados na criação da sala.", input "Configurar nome do jogador" e 7 avatares emoji: 🧠 ⚡ 🎯 💻 🚀 🔥 😎 (padrão 🧠).
- **Estatísticas do usuário:** "Pontos de iniciação" (pontuação atual da rodada) e "Melhor colocação" (#N; padrão 99).
- **Competição em sala:** texto explicativo sobre criar sala, compartilhar código e usar cronômetro.
- **Checklist** (persistido): "Resolver 3 questões de iniciação" (marca ao haver ≥ 3 respostas), "Completar um problema de programação" (marca ao obter AC; não desmarca), "Revisar as regras do regulamento" (marca ao abrir a aba Regras). Cada item mostra "Concluído" ou a dica de como concluir.

### 5.2 Iniciação (`iniciacao`)

Título "Modalidade Iniciação (Papel e Lógica)", subtítulo "Questões objetivas simulando as provas I1 (6º/7º ano) e I2 (8º/9º ano).", e badge "Pontuação: X pts / Y pts".

**Cronômetro** (cartão cuja cor muda: ciano normal, âmbar quando ≤ 60s, rosa quando 0): rótulo "Tempo para responder", status "EM ANDAMENTO / PAUSADO / ENCERRADO", tempo `MM:SS` grande, barra de progresso (`role="progressbar"`, rosa ≤ 60s), frase de estado; botões Iniciar/Pausar (esmeralda/âmbar) e Reiniciar. Durações: 10, 15, 20 (padrão), 25 min + "Personalizado" (inteiro positivo, botão "Definir", erro "Digite um número inteiro positivo."). Mudar a duração reinicia e pausa o cronômetro. Ao chegar a 0 para e alerta.

**Regras de resposta:** só é possível responder com o cronômetro ativo e > 0; cada questão aceita **uma única resposta** (fica travada). Checkbox "Ocultar correção imediata após responder": se marcado, a opção escolhida fica ciano neutro e aparece "Resposta registrada." + "A correção imediata está oculta."; se desmarcado, a escolhida fica verde/vermelha, a correta é realçada e a explicação aparece ("Resposta correta!" ou "Resposta registrada."). Enquanto o cronômetro estiver parado, cada questão mostra o aviso para retomar o tempo.

**Filtros:** "Iniciação 1" / "Iniciação 2" e "Todas as dificuldades" / "Nível fácil" / "Nível médio" / "Nível difícil".

**Montagem da rodada:** filtra o banco pela faixa; atribui dificuldade pela posição no banco filtrado (índices 0–2 fácil, 3–6 médio, ≥ 7 difícil, salvo se a questão definir `difficulty`) e pontos (fácil 5, médio 8, difícil 12, salvo `points`); embaralha com `seededShuffle` determinístico (hash estilo Java `(h<<5)-h+c` sobre a semente `${faixa}-${nomeDoJogador||uid||'visitante'}-${dificuldade}` e Fisher–Yates com LCG `h = (h*1664525 + 1013904223) >>> 0`); aplica o filtro de dificuldade; mostra no máximo 10. Cada cartão: badge da faixa, "{dificuldade} · {pontos} pts", "Questão N · {título}", enunciado numerado e 4 alternativas em grade 2×2 (fonte mono).

### 5.3 Programação (`programacao`)

Layout em 2 painéis (md+): **lateral** (1/3 ou 1/4) e **editor** (restante).

**Painel lateral:** abas-pílula "Desafios" / "Competição"; etiqueta "PROGRAMAÇÃO - PROBLEMA {id}"; título, objetivo (`missionGoal`) e descrição do nível. Em **Desafios**: caixa "Modo Desafios — Resolva o problema atual usando o editor. Envie o código e veja o feedback do juiz automático." Em **Competição**: o bloco de competição (5.3.1) e, no rodapé, a dica de sintaxe do nível na linguagem atual (caixa âmbar mono).

**CodeEditor** (memoizado): moldura `rounded-3xl` com borda esmeralda quando aceito; barra superior com 3 "luzes" de janela, alternador **C++** (índigo) / **Python** (âmbar), botão reset (volta ao código inicial e limpa console) e botão **SUBMIT** (desabilitado se já aceito ou se o cronômetro não estiver ativo); coluna de números de linha; `textarea` mono verde-esmeralda, sem spellcheck, Tab insere 2 espaços. Ao aceitar: overlay "ACCEPTED (AC) — Juiz Automático OBI" com ícone CheckSquare.

**Envio (`handleRunCode`):** exige cronômetro de competição ativo; caso contrário escreve no console "O cronômetro está pausado ou zerado. Retome o tempo para enviar código.". Limpa o console e imprime `> g++ -O2 main.cpp` ou `> python3 solution.py` e "> Executando casos de teste do Juiz..."; após 600ms chama `validate`. AC → "> RESULTADO: AC (Accepted) - {msg}", vitória, +100 pontos e `completedLevels` no Firestore (uma vez por nível), e, se em sala, +100 na sala (fluxo P2P em 5.3.1) e registro de recorde local. WA → "> RESULTADO: WA (Wrong Answer)" e cartão "Feedback do Juiz:" com a mensagem (`roast`) entre aspas e a dica (`hint`) em mono. Console "Console do Juiz Automático" guarda as últimas 12 linhas (info cinza, success verde, error rosa). Após AC aparece "Aprovado (AC)!" e "Próximo Problema" (avança até o 10º). Sem envio: "Envie seu código em C++ ou Python para validação.".

**Os 10 desafios** (todos `modality: "programacao"`; cada um tem `title`, `category`, `bossName`, ícone lucide, `bgColor`, `missionGoal`, `description`, `syntaxTipCpp`, `syntaxTipPython`, `initialCodeCpp`, `initialCodePython` e `validate`). Validação = regex sobre o texto, com tolerância a espaços:

| # | Título / categoria / boss | Objetivo | Aceita em C++ | Aceita em Python |
|---|---|---|---|---|
| 1 | Hello OBI / I/O / Juiz Automático | Imprima 'OBI!' | `cout << "OBI!";` | `print("OBI!")` ou aspas simples |
| 2 | Leitura Veloz / I/O / Time Limit | Leia inteiro em `n` | `cin >> n;` | `int(input())` ou `input()` |
| 3 | Decisão Clássica / Lógica / O Par ou Ímpar | Se n par, imprima 'PAR' | `if (n % 2 == 0)` e o texto "PAR" | `if n % 2 == 0:` e "PAR" |
| 4 | A Estrutura Suprema / STL / Vector Prime | Adicione 10 ao vetor v | `v.push_back(10);` | `v.append(10)` |
| 5 | Caos Ordenado / STL / Sorter | Ordene v | `sort(v.begin(), v.end());` | `v.sort()` ou `sorted(v)` |
| 6 | Soma Direta / I/O / Adição | Leia dois inteiros e imprima a soma | `cin >> a >> b;` e `cout << a + b;` | `a, b = map(int, input().split())` e `print(a + b)` |
| 7 | Contagem Linear / Loop / Loop Boss | Imprima 1..n em linhas | `for (int i = 1; i <= n; i++)` e `cout << i << "\n"` | `for i in range(1, n + 1):` e `print(i)` |
| 8 | Busca Ordenada / STL / Scanner | Posição do 7 em v | `find(v.begin(), v.end(), 7)` | `v.index(7)` |
| 9 | Maior entre Dois / Lógica / Comparador | Imprima o maior | `if (a > b)` e `cout << a;` | `print(a if a > b else b)` |
| 10 | Multiplos de 2 / Loop / Paradox | Múltiplos de 2 até 10 | `for (int i = 2; i <= 10; i += 2)` | `for i in range(2, 11, 2):` |

Códigos iniciais: C++ com `#include <iostream>` (+ `<vector>`/`<algorithm>` quando necessário), `using namespace std;`, `int main()` e as variáveis pré-declaradas pelo enunciado (ex.: `int n = 4;`, `vector<int> v = {3, 1, 4};`, `int a = 5, b = 9;`); Python com comentário-guia (ex.: `n = 4\n# Seu if aqui`). Mensagens de sucesso curtas e técnicas (ex.: "Elemento anexado em O(1) amortizado.", "Ordenação O(N log N) concluída."); WA com provocação leve (ex.: "As setas estão apontando para o lado errado?", "Vai dar TLE se ordenar manualmente.") e a dica com o código esperado.

#### 5.3.1 Competição e salas

**Timer de competição** (mesma lógica de cores; texto de estado: "Tempo esgotado — finalize a rodada." / "Últimos minutos — pressione com foco." / "Modo competição sincronizado." / "Modo competição ativo."). Durações 15, 30, 45 (padrão), 60 + Personalizado. Botões **Iniciar / Pausar / Reset** (esmeralda/âmbar/rosa), desabilitados quando este aparelho não controla a partida; Iniciar mostra "Em andamento" ou "Aguardando N" quando aplicável.

**Bloco "Partida multiplayer":** "Você participa como {nome}" com avatar; sem Firebase, aviso âmbar de que criar sala é só demonstração local.

- **Criar uma partida** (assistente em 2 passos, estados `closed → configure → confirm`):
  1. "Configure a partida": tempo 15/30/45/60 ou personalizado (1–480), "Mínimo para iniciar" e "Máximo de jogadores" (1–16; padrões 2 e 8 com Firebase, 1 e 1 sem), nota "A sala só inicia ao atingir o mínimo. Depois de alcançar o máximo, novos jogadores não poderão entrar. Limite máximo: 16.", botões Cancelar / "Revisar partida" (desabilitado se inválido).
  2. "Confirme os dados": Duração, "Participantes agora: 1 — você", Mínimo, Máximo, frase sobre quantos jogadores faltam, botões "Voltar e editar" / "Confirmar e criar sala" ("Criando sala…").
- **Entrar em uma partida:** input do código (maiúsculas, placeholder "Ex.: ABC123") + "Entrar".
- **Resumo da sala:** código selecionável e "Copiar código" (clipboard; falha mostra o código na mensagem), nº de jogadores, Duração, Jogadores x/max, Mínimo, Máximo, e "Mínimo atingido: a partida pode começar." ou "Aguardando N jogador(es) para atingir o mínimo.".
- **Painel P2P** (salas online): "Conexão direta entre aparelhos: {ativa · X ms | canal aberto · medindo latência | conectando | sem resposta recente | desconectada | aguardando aparelhos}", "Principal (menor ping médio)", "Reserva", e um cartão por par com nome, papel e estado, média em ms colorida, barra `role="meter"` (escala 0–200ms), "N medições" e "mín–máx ms · var. X ms". Rodapé explicando que a conexão direta exige Firebase para sinalização e rede compatível com WebRTC.
- **Placar de colocados:** jogadores ordenados por pontos, avatar, "#posição nome" (ouro, prata, bronze para os 3 primeiros) e pontos.
- **Records locais:** top 5 de até 8 registros `{player, score, room, createdAt}` ordenados por pontos.

**Regras de sala:**
- Código da sala: 5 caracteres base36 em maiúsculas; documento `artifacts/{appId}/rooms/{código}` = `{code, hostUid, status:'lobby', createdAt, startedAt:null, durationMinutes, timeLimit (s), minPlayers, maxPlayers, players:{[uid]:{uid,name,avatar,score:0,joinedAt}}}`.
- Sem Firebase: sala local `{..., signal:'local'}` só neste aparelho; "Demonstração local criada. Os limites definidos continuam valendo para iniciar a rodada."; entrar por código responde "A sincronização multiplayer precisa de Firebase disponível neste ambiente.".
- **Entrada via `runTransaction`:** sala inexistente → "Sala não encontrada. Verifique o código."; status ≠ lobby e jogador novo → "Esta partida já começou e não aceita novos jogadores."; cheia → "A sala está cheia (N jogadores no máximo)."; quem já está na sala reentra sem duplicar.
- **Início via `runTransaction`:** revalida `getRoomStartState`; erros "A sala não existe mais.", "Esta partida já foi iniciada.", "A partida ainda não pode começar: x/y jogadores mínimos."; grava `status:'running'`, `startedAt` ISO, `durationMinutes`, `timeLimit`.
- **Pausar:** `status:'paused'`, `timeLimit` = tempo restante, `startedAt:null`. **Reset:** `status:'lobby'`, duração original.
- Só o **dispositivo principal** (eleito por P2P; fallback `hostUid`) controla a partida: "Somente o dispositivo principal da sala pode controlar a partida.". Quando este aparelho é eleito principal e não é o `hostUid`, grava `hostUid` e `backupUid` na sala.
- Todos os clientes observam a sala com `onSnapshot` e recalculam o tempo restante a cada segundo a partir de `startedAt` e `timeLimit`.
- **Pontuação em sala:** se este aparelho é o principal ou o canal falhar, faz `updateDoc` com `increment(100)` em `players.{uid}.score`; caso contrário envia `{type:'score-request', requestId}` ao principal pelo DataChannel, que aplica o incremento e responde `score-accepted`; se não houver confirmação em 8s e o placar não tiver subido, o próprio cliente grava o incremento (fallback). Atualização otimista local do placar.
- O jogador acompanha sua melhor colocação e melhor pontuação em sala (localStorage).

### 5.4 Mentoria (`mentor`) — "Oficina de aprendizagem"

Cabeçalho: "OFICINA DE APRENDIZAGEM", título "Treinar, comparar, refletir", texto "A mentoria é local e guiada por regras pedagógicas. Ela não envia seu código para um modelo externo e nunca entrega uma solução completa." e 3 métricas: Sessões pareadas, Dicas pedidas (soma de `hintCounts`) e Autonomia % (rodadas resolvidas com 0 dicas ÷ total de rodadas; 100% sem dados). Sub-navegação horizontal rolável com 10 seções:

`mentoria` Mentoria · `comparar` Sem IA × com IA · `depuracao` Depuração · `variacoes` Variações · `banca` Banca · `trilha` Trilha · `etica` Uso responsável · `relatorios` Relatórios e diário · `professor` Professor · `juizes` Juízes externos.

**Tópicos** usados nos seletores: `busca-binaria` (Busca binária), `dp` (Programação dinâmica), `grafos` (Grafos), `stl` (Estruturas / STL) e, só no mentor, `python` (Python).

#### Mentoria
- Aviso âmbar: "**Modo "só explique, não resolva".** As respostas são construídas por regras locais. Não cole credenciais ou dados pessoais."
- Gate "Antes da sessão com orientação" com 2 confirmações (PRE_AI_CHECKLIST): "Tentei identificar entradas, saídas e restrições antes de pedir ajuda." e "Quero uma pista ou explicação, não uma solução pronta." → botão "Iniciar orientação limitada" ("Orientação habilitada para esta sessão. O limite é de cinco consultas, com no máximo três pistas na rodada comparativa.").
- Painel "Mentor pedagógico": "Nível máximo liberado: N · x/5 consultas nesta sessão", seletor de tópico, 4 níveis (MENTOR_LEVELS): 1 Pergunta socrática, 2 Dica conceitual, 3 Exemplo análogo, 4 Roteiro parcial (com descrições; níveis acima do liberado ficam desabilitados com tooltip). **Nível liberado = min(4, 1 + ⌊rodadas solo resolvidas ÷ 2⌋).**
- "Sugestão para agora": prompt recomendado (rodada assistida em curso → "review"; veredito selecionado Accepted → "variation"; senão "debug").
- Textarea (padrão "Explique o conceito de busca binária sem resolver o exercício.") e "Pedir uma pista". Bloqueios em ordem: rodada solo em andamento ("A primeira rodada é sem IA..."), sem consentimento, texto vazio, 5 consultas na sessão ("Limite de cinco consultas atingido..."), 3 pistas na rodada assistida.
- Biblioteca de prompts (IA_PROMPT_LIBRARY) como chips clicáveis com estrela de favorito: Busca binária, Programação dinâmica, Grafos, Estruturas de dados, STL, Python, Variações, Depuração, Revisão (textos no apêndice A.5). "Exportar favoritos" baixa `obi-quest-prompts.txt` no formato `[categoria] texto`.
- Coluna "Histórico por tópico" com contador, filtro textual e cards (tópico · nível · data, pergunta, resposta). Histórico limitado a 100.
- **`buildMentorReply(query, level, topic)`**: normaliza (minúsculas, sem acentos). Se casar `resolva|resolucao completa|solucao (completa|final|pronta)|resposta final|codigo completo|codigo final|implemente para mim|faca para mim|me de a solucao|escreva o codigo` → recusa pedagógica ("Não vou fornecer a solução final nem código completo. Posso ajudar com uma pergunta, uma pista conceitual, um exemplo diferente ou um roteiro parcial. Qual parte você já tentou?"). Se contiver "varia" → orientação para a seção Variações; se contiver "codigo", "debug" ou "errado" → orientação para Depuração guiada com pergunta socrática. Senão devolve, para o tópico, nível 1 `question`, 2 `concept`, 3 `analogy`, 4 `steps` + " Não transforme essas etapas em uma implementação sem antes justificar cada uma." (textos no apêndice A.4). Cada consulta grava histórico, incrementa `hintCounts[tópico]` (ou `"tópico: título do problema"` durante a comparação), marca a etapa `consult` da trilha e publica métricas da turma. Aviso final: "Orientação local registrada. A resposta é guiada por regras pedagógicas e não envia seu código a um serviço externo."

#### Sem IA × com IA (sessão comparativa)
- "Sessão dupla cronometrada — Problemas gêmeos, mesma técnica e ordem sem IA → com apoio limitado." com cronômetro crescente `MM:SS`.
- Ocioso: escolher "Técnica pareada" → "Começar sem IA" (zera consultas da sessão e o consentimento).
- Rodada 1 "sem IA": enunciado do problema 1 do par, campo de resposta + "Verificar" (comparação textual sem diferenciar maiúsculas; conta tentativas; "Resposta correta. Registre o raciocínio..." / "Ainda não. Revise a estratégia..."), "Encerrar rodada e abrir gêmeo" e "Descartar".
- Rodada 2 "apoio limitado": problema gêmeo; exige as 2 confirmações ("Ativar até 3 pistas"); seletor de nível (até o liberado) e "Pedir pista (x/3)" que consulta o mentor com "Ajude-me a pensar neste problema de {técnica}."; "Concluir sessão".
- Cada rodada guarda `{seconds, attempts, solved, hints}`; a sessão `{id:'session-<ts>', topic, date, rounds:{solo, ai}}` entra no início de `sessions` (máx. 200) e marca a etapa `compare`.
- "Reflexão pós-sessão": "O que a pista ajudou a perceber?" e "O que você teria feito sozinho?" → "Salvar reflexão" (anexa à sessão mais recente, marca `reflect` e `retry`).
- Coluna "Comparação mais recente": barras de tempo Sem IA (rosa) × Com apoio (esmeralda) com tentativas, acertos e dicas; "Diferença observada: ... Isso descreve esta sessão, não prova causalidade."; aviso de que uma tentativa não demonstra que a IA causou a diferença.

#### Depuração
- "Tradutor de vereditos e assistente de depuração": seletor de tópico e de veredito (Accepted, Wrong Answer, Runtime Error, Time Limit Exceeded, Compilation Error, Memory Limit) com a explicação do DEBUG_GUIDE (apêndice A.6).
- Textarea mono "Cole o trecho que quer investigar" (placeholder "Seu código fica apenas neste navegador."; não é persistido).
- "Analisar pontos suspeitos": por linha, sinaliza (a) acesso `arr|vetor|v|nums[i|n|size|length]` → possível índice igual ao tamanho; (b) `for(...; ... <= n|.size()|.length)` → laço passando do último índice; (c) declaração `int|long|float|double x;` sem valor inicial. Acrescenta 2 perguntas por veredito. Sem achados: "Nenhum padrão simples foi reconhecido. Isso não prova que o código esteja correto."
- "Gerar casos de borda" por tópico (apêndice A.7). Checklist fixo de erros comuns (índice fora dos limites, estouro de inteiro, variável não inicializada, complexidade alta).

#### Variações
- Campos: "Problema resolvido de origem", "Eixo da transformação" (Restrições / Entrada e saída / Tema e contexto), "Técnica".
- "Gerar variação adaptativa": usa o template do tópico (apêndice A.8). Dificuldade adaptativa pelas 3 sessões mais recentes do tópico: ≥ 2 solos resolvidos e ≤ 3 dicas → "desafio"; 0 resolvidos → "prática guiada"; senão a do template. Eixo restrição → "Nova restrição: ..."; entrada/saída → "Formato alterado: a entrada contém vários casos de teste e a saída registra um resultado por linha."; contexto → "Novo contexto: ...". Escolhas rotacionam pelo número de sessões do tópico. Próximo passo: "Explique por que a técnica combina com o problema e identifique uma entrada-limite antes de codificar."
- "Salvar" no "Banco salvo" (máx. 50; "Reutilizar variação").
- "Qual padrão se repete?": escolher a técnica correta → feedback e etapa `pattern` registrada.

#### Banca
- "Entrevista de solução": pergunta "Por que você escolheu essa estrutura de dados? Qual é a complexidade da sua solução?"; textarea → "Receber perguntas de banca". Feedback por palavras-chave: abordagem (`passos, estratégia, abordagem, primeiro, depois`), complexidade (`O(, complexidade, linear, logarítmica, quadrática`), caso-limite (`limite, borda, vazio, zero, caso`) — elogia o que existe ou pede o que falta. Histórico (máx. 50).

#### Trilha
- "Trilha: uso estratégico de IA" com 5 etapas (Entender o conceito, Resolver sem IA, Consultar uma pista, Comparar estratégias, Refazer sem ajuda; ids `concept, solo, consult, compare, retry`) mostradas como "ETAPA 0N" Concluída/Pendente, com botões "Marcar conceito estudado" e "Marcar refação independente" (este só após alguma sessão). Aviso: com ≥ 4 consultas → sugere pausa para revisar teoria; senão informa o nível liberado. Botões "Iniciar etapa sem IA" e "Ver evolução".

#### Uso responsável
- "Checklist depois da sessão" (persistido e copiado para a sessão mais recente): "Eu tentei resolver sozinho antes de pedir ajuda.", "Eu entendi a explicação e não apenas copiei a solução.", "Eu revisei as partes do código que ainda não entendo.", "Eu usei a IA como ferramenta de reflexão, não como atalho."
- "Meta de autonomia": input 1–50 (padrão 5) de problemas sem IA na semana; progresso = sessões dos últimos 7 dias com solo resolvido; nota de transparência.

#### Relatórios e diário
- "Relatório de evolução": contadores Resolvido sem IA / com apoio; últimas 8 sessões (técnica, data, tempos e tentativas de cada rodada, acertos x/2, dicas, reflexão); **Exportar CSV** `obi-quest-relatorio.csv` (BOM UTF-8, CRLF, todas as células entre aspas) com colunas `data, topico, tempo_sem_ia_s, tentativas_sem_ia, acerto_sem_ia, tempo_com_ia_s, tentativas_com_ia, acerto_com_ia, dicas, reflexao_ia, reflexao_independente`.
- "Diário de treino": "O que aprendeu? O que errou e quer tentar diferente?" → "Registrar no diário" (máx. 200; data e tópico).
- "Recomendação": tópico com mais dicas → sugerir começar a próxima sessão sem ajuda.
- Gráfico de barras horizontais "Dependência de dicas ao longo do tempo" (dicas da rodada assistida por sessão, barras âmbar).

#### Professor (minicurso)
- "Criar sessão docente" com Nome da sessão (padrão "Minicurso de resolução estratégica") e Tópico: código de 6 caracteres base36 maiúsculos; grava `artifacts/{appId}/classrooms/{código}` = `{code, title, topic, createdAt, participants:{}}`; o criador vira "Professor". Sem Firebase, só local, com mensagem explicando.
- "Entrar como estudante": código + apelido opcional (vazio → `Aluno-XXXX`); exige Firebase; grava em `participants[uid]` = `{alias, hints, sessions, topics, hintsByTopic, updatedAt}` (merge) e ajusta o tópico das variações ao da turma.
- Métricas do aluno são republicadas automaticamente quando `hintCounts`, `sessions` ou o código mudam (nunca publica código-fonte).
- Painel: participantes, média de dicas, lista por apelido com dicas por tópico, "Exportar turma" `obi-quest-turma-anonimizado.csv` (`apelido_anonimo, dicas_solicitadas, sessoes_pareadas, topicos`) e "Perguntas para debate" (3 perguntas: o que mudou entre tentar sozinho e receber pista; qual pista ajudou a formular hipótese sem entregar o caminho; que caso de teste você criaria).

#### Juízes externos
- Importar problema: juiz (Codeforces / Beecrowd / OBI), título, URL. Aceita somente **HTTPS** nos hosts `codeforces.com`, `www.codeforces.com`; `beecrowd.com.br`, `www.beecrowd.com.br`, `judge.beecrowd.com.br`; `olimpiada.ic.unicamp.br`, `www.olimpiada.ic.unicamp.br`. Título padrão = último segmento do caminho. Entra no "Histórico unificado" com veredito "Pendente" (máx. 200).
- Para Codeforces: campo "Handle público" + "Sincronizar vereditos públicos" → `GET https://codeforces.com/api/user.status?handle=...&from=1&count=100`, filtra pelo `contestId`/`index` extraído de `contest/{id}/problem/{X}` ou `problemset/problem/{id}/{X}` e mapeia OK→Accepted, WRONG_ANSWER→Wrong Answer, TIME_LIMIT_EXCEEDED→Time Limit Exceeded, RUNTIME_ERROR→Runtime Error, COMPILATION_ERROR→Compilation Error, MEMORY_LIMIT_EXCEEDED→Memory Limit, TESTING/IN_QUEUE→Em avaliação; sem duplicar ids.
- Cada item: título, juiz, seletor manual de veredito, link "Abrir juiz oficial" (nova aba) e data. Nunca armazena credenciais nem submete em nome do aluno.
- Rodapé com "Concluídos no OBI Quest" (`completedLevels`) e "Accepted nos juízes externos".

### 5.5 Regras (`academy`) — "Regulamento e Formato OBI"

Conteúdo educativo estático: "Objetivo da competição"; "Formato geral" (Iniciação e Programação); "Modalidade Iniciação" (I1 6º/7º ano, I2 8º/9º ano, prova objetiva, foco em leitura cuidadosa, mistura de lógica, sequências e interpretação); "Modalidade Programação" (no computador, juiz automático, linguagens comuns Python, C, C++, Java e Pascal; ler o enunciado como especificação, testar casos simples primeiro, erros comuns de E/S); 3 cartões Como estudar / Como competir / Como melhorar; "Regra prática de preparação": 1. Leia o enunciado inteiro antes de começar. 2. Faça pelo menos 3 exercícios de treino por sessão. 3. Revise lógica, sintaxe e tempo de execução após cada tentativa.

## 6. Módulos de domínio (com testes `node:test`)

### `src/competitionRooms.js`
```js
export const MAX_ROOM_PLAYERS = 16;
validateRoomSettings({ timeMinutes, minPlayers, maxPlayers })
// inteiros; tempo 1–480; mín 1–16; máx ≥ mín e ≤ 16 → { valid, error } com mensagens em PT-BR
getRoomPlayerCount(players)            // Object.keys(players || {}).length
getRoomStartState(room)                // { canStart, playerCount, minPlayers(def 1), maxPlayers(def 16), playersNeeded, isFull }
// canStart = status em {undefined, 'lobby', 'paused'} && mín ≤ jogadores ≤ máx
```

### `src/localConnection.js`
- `getLocalConnectionQuality({onLine, effectiveType, downlinkMbps, rttMs, connectionType})`: offline ou tipo `none` → `{online:false, quality:'poor', label:'Sem rede'}`. Senão qualidade por `effectiveType` (slow-2g/2g poor, 3g fair, 4g good, outro unknown) e rebaixamento: RTT ≥ 500 ou downlink < 0,5 → poor; RTT ≥ 250 ou downlink < 1,5 → fair. Rótulos: Boa, Regular, Limitada, Ativa. Tipos: Bluetooth, Dados móveis, Ethernet, Sem rede, Outra rede, Tipo desconhecido, Wi-Fi, WiMAX. Valores não finitos viram `null`.
- `readLocalConnectionQuality(navigator)` lê `connection | mozConnection | webkitConnection`.

### `src/peerPairing.js`
- Constantes: STUN `stun:stun.l.google.com:19302`, ping a cada 1500ms, expiração de pontuação de eleição 6000ms, últimas 5 amostras por par, medição "recente" ≤ 5000ms.
- `selectPeerServers(candidates)`: ignora ping não finito ou negativo; ordena por ping e desempata por uid → `{primaryUid, backupUid}`.
- `summarizePing(samples)`: `{average, minimum, maximum, jitter (média das diferenças absolutas consecutivas), latest}` arredondados; vazio → nulls.
- `summarizePeerConnection(peers, now)`: estados `measured | unresponsive | measuring | connecting | disconnected | waiting` e `averagePing` dos pares conectados com canal aberto e medição recente.
- `class PeerPairing({roomRef, uid, onStatus, onMessage})` com `start()`, `close()`, `sendTo(uid, msg)`:
  - Gera `sessionId` (`crypto.randomUUID` ou fallback) e o anuncia em `players.{uid}.peerSessionId`; observa a sala para descobrir/remover pares (sessões trocadas são fechadas).
  - Para cada par, quem tem uid lexicograficamente menor é o **offerer** e cria o DataChannel `obi-quest-pairing`. Sinalização no documento `rooms/{código}/peerSignals/{uidA}__{uidB}` (ids com `encodeURIComponent`) = `{offererUid, offererSessionId, answererSessionId, offer, answer, answererUid, initiatorCandidates[], responderCandidates[], createdAt}`; candidatos ICE via `arrayUnion`, enfileirados até o documento existir e deduplicados ao aplicar; processamento serializado por promessa; descarta sinais de sessões diferentes.
  - Mensagens: `ping {sentAt}` → `pong`; `pong` gera amostra; `server-score {pingMs}` (média das amostras do aparelho, difundida a todos) alimenta a eleição; outras mensagens vão para `onMessage`.
  - Eleição contínua de principal/reserva pelo menor ping médio reportado; sozinho, o próprio aparelho é candidato com 0.
  - Conexão `failed` → reinício em 1,5s com nova sessão. Sem `RTCPeerConnection` → erro "Este dispositivo não oferece suporte a conexões WebRTC.".
  - `onStatus({state:'waiting'|'connecting'|'connected', peers:[{uid, state, channelState, lastPingAt, average, minimum, maximum, jitter, latest, sampleCount}], primaryUid, backupUid, error})`.

**Testes obrigatórios:** eleição pelo menor ping e reserva; desempate estável por uid; ignorar medições inválidas; nenhum eleito sem medições; resumo de ping e de estado P2P; validação de sala (limites, mínimo/máximo, mensagens) e estado de início (bloqueio pelo mínimo, sala cheia, status running); qualidade local (offline, mapeamento por effectiveType, rebaixamento por RTT/downlink, leitura do navigator). `npm test` deve passar.

## 7. Dados e persistência

### Firebase (opcional)
- Config: global `__firebase_config` ou `import.meta.env.VITE_FIREBASE_CONFIG` (JSON). `appId`: global `__app_id`, `VITE_APP_ID` ou padrão `obi-quest-v1`. Sem config, `app/auth/db = null` e tudo funciona localmente.
- Auth: `signInWithCustomToken(__initial_auth_token)` se existir, senão `signInAnonymously`; `onAuthStateChanged`.
- Caminhos: `artifacts/{appId}/users/{uid}` = `{completedLevels:[], score:0, iniciacaoSolved:[]}` (criado se não existir; ouvido por `onSnapshot`); `artifacts/{appId}/rooms/{código}` (+ subcoleção `peerSignals`); `artifacts/{appId}/classrooms/{código}`.
- Mensagens de erro sempre em português e exibidas na interface, sem quebrar o app.

### localStorage (sempre com try/catch na leitura)
| Chave | Conteúdo |
|---|---|
| `obi-quest-player-name` | nome do jogador |
| `obi-quest-player-avatar` | emoji |
| `obi-quest-records` | até 8 recordes |
| `obi-quest-best-room-placement` | melhor colocação (padrão 99) |
| `obi-quest-best-room-score` | melhor pontuação em sala |
| `obi-quest-checklist` | `{iniciacao, programacao, regulamento}` |
| `obi-quest-pedagogy` | objeto pedagógico abaixo (mesclado sobre o padrão) |

```js
INITIAL_PEDAGOGY_DATA = {
  mentorHistory: [], hintCounts: {}, mentorSessionHints: 0, sessions: [], savedVariants: [],
  favoritePrompts: [], diary: [], weeklyGoal: 5, trainingStep: 0, completedTrainingSteps: [],
  interviewHistory: [], externalSubmissions: [], usageChecklist: [false, false, false, false],
  importedProblem: null, classroomCode: '', classroomAlias: '', classroomData: null
}
```
Os dados não sincronizam entre navegador, Android e Windows.

## 8. Plataformas

- **Android:** Capacitor empacota `dist/` numa WebView; `applicationId` `com.obique.quest`, versionName 1.4.2, versionCode 8; APK de depuração em `android/app/build/outputs/apk/debug/app-debug.apk`. Interface compacta (14px, sem decoração binária).
- **Windows (`electron/main.cjs`):** janela 1280×860 (mín. 360×640), fundo `#020408`, `autoHideMenuBar`, `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`; `setWindowOpenHandler` abre apenas `https://` no navegador externo e nega o resto; carrega `dist/index.html`; encerra ao fechar todas as janelas (exceto macOS) e recria no `activate`.
- **`scripts/package-windows.cjs`:** saída em `%LOCALAPPDATA%\OBI-Quest\portable` (fallback `release/`); copia `node_modules/electron/dist`; monta staging com `dist/`, `electron/` e um `package.json` mínimo (`name obi-quest`, versão do projeto, `main electron/main.cjs`, `type commonjs`); gera `resources/app.asar` com `@electron/asar`; renomeia `electron.exe` para `OBI Quest.exe`; escreve `LEIA-ME.txt` ("Execute OBI Quest.exe. Mantenha esta pasta completa..."); limpa o staging; erros saem com `exitCode = 1`.
- Distribuições não assinadas devem ser documentadas como tal (APK debug ≠ Play Store; Windows sem assinatura digital).

## 9. Acessibilidade e responsividade

Rótulos `aria-label` em botões só com ícone, `role="status"`/`aria-live` em mensagens, `role="alert"` em erros de formulário, `role="progressbar"`/`role="meter"` com valores, `aria-current` na navegação, `aria-pressed` nas durações, `focus-visible` nos controles do cronômetro. Funcional de 360px a desktop largo, sem rolagem horizontal da página (só a sub-navegação da Mentoria rola no eixo x).

## 10. Versionamento e repositório

- Versão única em `package.json` (exibida automaticamente). `CHANGELOG.md` em português, SemVer, seção "Não lançado", grupos Adicionado / Corrigido / Melhorado / Organização. Histórico a reproduzir: 1.0.0 (Android/Windows, mentoria), 1.1.0 (versão na tela, WebRTC, eleição principal/reserva, testes), 1.2.0 (mostrador de ping P2P), 1.3.0 (indicador local de conectividade), 1.3.1 (interface Android compacta, opções de competição separadas), 1.4.0 (assistente de sala, mínimo/máximo, validações transacionais), 1.4.1 e 1.4.2 (ajustes tipográficos de botões); em "Não lançado": retorno ao topo ao trocar de aba.
- Branches: `main` (integrada), `test` (validação), `app-mobile` (+ APK em `installers/android/`), `app-pc` (+ pacote em `installers/windows/`); todas com a árvore completa. Documentar isso em `BRANCH_STATUS.md`.
- `.gitignore`: `node_modules`, `dist`, `.vite`, `release`, artefatos de build do Android, e `docs/*` exceto `docs/README.md`, `docs/guia_de_estudo_e_apresentacao.md` e `docs/*.ignore`.

## 11. Documentação

- `README.md`: o que o app oferece, limites pedagógicos, conexão e dados (Firebase, regras do Firestore para salas e `peerSignals`, autenticação anônima), comandos web/Android/Windows, branches e estrutura.
- `docs/`: fontes de estudo em texto simples UTF-8 com extensão `.ignore` (para NotebookLM) — `01-visao-geral`, `02-recursos-e-uso`, `03-arquitetura-e-dados`, `04-plataformas-e-limites`, `05-instalador-windows-e-git-lfs` — cada uma com seção explícita "o que não afirmar"; `docs/README.md` com ordem de leitura; `guia_de_estudo_e_apresentacao.md` (guia longo com roteiro de demonstração, FAQ e glossário); `descricao_funcoes_e_mecanicas.md` (funções e mecânicas).

## 12. Inconsistências do original (corrija na cópia ou replique conscientemente)

1. Questão 110: a resposta marcada é "6", mas a explicação diz que o 4º número contando de 2 em 2 a partir de 2 é 8 → a correta é **"8"** (índice 2).
2. Questão 112: com 4º termo 12 e razão 3, o 6º termo é **18** (índice 1); o original marca 21 e a explicação conta errado.
3. Questão 122: 5 + 3 = **8** (índice 1); o original marca "7".
4. Questão 123: 7 + 2×3 = **13** (índice 3); o original marca "12".
5. Desafio 7 (C++): a regex exige `"\n"` com aspas duplas, mas a dica sugere `'\n'` → aceite as duas formas.
6. A tela inicial diz "10 + 10" questões por faixa, mas o banco tem 12 por faixa (a rodada mostra até 10).
7. O README cita `npm run app:windows:installer` (NSIS), mas o script não existe no `package.json` → adicione o script com electron-builder/NSIS x64 saindo em `release/windows/` ou remova a menção.
8. `requirements.txt` lista versões antigas (firebase 11, vite 5) diferentes do `package.json`.

## 13. Ordem de execução e critérios de aceite

1. Scaffold Vite + React + Tailwind 4, `styles.css`, `index.html`, `main.jsx`.
2. Módulos de domínio + testes (`npm test` verde).
3. Layout global, navegação, indicadores, versão, fundo e áudio.
4. Início → Iniciação → Programação (desafios) → Competição/salas → Mentoria (10 seções) → Regras.
5. Firebase opcional, P2P, Capacitor, Electron e empacotamento.
6. README, CHANGELOG, BRANCH_STATUS, docs.

**Aceite:** `npm run build` sem erros; `npm test` passa; sem Firebase todas as telas funcionam e as salas aparecem como demonstração local; com Firebase, dois aparelhos entram na mesma sala, o início respeita o mínimo, a sala recusa entradas acima do máximo ou após o início, o ping P2P aparece e o principal/reserva são eleitos; responder Iniciação só com cronômetro ativo; SUBMIT só com timer de competição ativo; mentor recusa pedidos de solução completa e respeita os limites 5/3; CSVs abrem no Excel com acentos corretos; trocar de aba volta ao topo; a interface nunca afirma compilar código, usar IA generativa ou ser oficial da OBI.

---

## Apêndice A — Conteúdo (dados a reproduzir)

### A.1 Banco de Iniciação (24 questões; `modality: "iniciacao"`; `correct` é o índice 0-based; os itens marcados com * estão corrigidos conforme a seção 12)

| id | faixa | título | enunciado | alternativas | correta | explicação |
|---|---|---|---|---|---|---|
| 101 | I1 | Lógica de Blocos | Um robô na OBI executa instruções sequenciais: começa na posição 0, anda 3 para frente, volta 1, e anda mais 4 para frente. Qual a posição final? | 6 / 7 / 8 / 5 | 0 | Começa em 0. +3 = 3. -1 = 2. +4 = 6. |
| 102 | I1 | Padrão numérico | Qual é o próximo número da sequência: 2, 4, 8, 16, ? | 18 / 24 / 32 / 30 | 2 | Cada termo dobra. 16 × 2 = 32. |
| 103 | I1 | Operação mental | Se um número é aumentado em 5 e depois diminuído em 2, o efeito líquido é: | -3 / +3 / +2 / -2 | 1 | A operação líquida é +5 - 2 = +3. |
| 104 | I1 | Comparação de itens | Qual número é maior entre 17 e 19? | 17 / 19 / São iguais / Não dá para saber | 1 | 19 é maior que 17 porque está mais à direita na reta numérica. |
| 105 | I1 | Dobro e metade | Se o dobro de um número é 10, qual é esse número? | 2 / 4 / 5 / 8 | 2 | O número cujo dobro é 10 é 5, porque 5 × 2 = 10. |
| 106 | I1 | Par ou ímpar | Qual das opções abaixo é um número ímpar? | 8 / 10 / 11 / 14 | 2 | 11 é ímpar porque não é divisível por 2. |
| 107 | I1 | Sequência crescente | Qual sequência está em ordem crescente? | 5, 2, 7, 1 / 1, 3, 5, 7 / 9, 8, 7, 6 / 4, 8, 3, 10 | 1 | A sequência 1, 3, 5, 7 está em ordem crescente. |
| 108 | I1 | Raciocínio com soma | A soma de 6 e 4 é: | 8 / 9 / 10 / 12 | 2 | 6 + 4 = 10. |
| 109 | I1 | Menos e mais | Qual é o resultado de 13 - 5? | 6 / 7 / 8 / 9 | 2 | 13 - 5 = 8. |
| 110* | I1 | Contagem rápida | Se você contar de 2 em 2, qual será o 4º número a partir de 2? | 4 / 6 / 8 / 10 | 2 | A sequência é 2, 4, 6, 8. Logo, o 4º número é 8. |
| 111 | I2 | Árvores de Decisão | Em uma prova de Iniciação da OBI, 15 questões valem 4 pontos cada e 5 questões valem 8 pontos cada. Qual o total de pontos da prova? | 80 / 95 / 100 / 120 | 2 | 15 * 4 = 60 pontos. 5 * 8 = 40 pontos. Total = 60 + 40 = 100 pontos. |
| 112* | I2 | Mapa de valores | Em uma sequência, o 4º termo vale 12 e cada termo seguinte aumenta 3. Qual é o 6º termo? | 15 / 18 / 21 / 24 | 1 | 4º = 12, 5º = 15, 6º = 18. |
| 113 | I2 | Raciocínio com tempo | Uma tarefa demora 20 minutos para terminar. Se já se passaram 8 minutos, quanto falta? | 10 min / 12 min / 14 min / 16 min | 1 | 20 - 8 = 12, então faltam 12 minutos. |
| 114 | I2 | Retorno de etapas | Uma pessoa sai de casa, anda 4 metros, volta 2 e depois anda 3. Qual distância total percorrida? | 5 m / 7 m / 9 m / 11 m | 2 | A distância total percorrida é 4 + 2 + 3 = 9 metros. |
| 115 | I2 | Tabela de valores | Se cada caixa contém 6 lápis e você tem 4 caixas, quantos lápis têm ao todo? | 20 / 22 / 24 / 26 | 2 | 4 caixas × 6 lápis = 24 lápis. |
| 116 | I2 | Extrapolação lógica | Se 3 maçãs custam 6 reais, quanto custam 5 maçãs? | 8 / 10 / 12 / 15 | 1 | Cada maçã custa 2 reais; então 5 maçãs custam 10 reais. |
| 117 | I2 | Duas etapas | Uma fila tem 8 alunos. 3 saem e 2 entram. Quantos alunos ficam? | 6 / 7 / 8 / 9 | 1 | 8 - 3 + 2 = 7 alunos. |
| 118 | I2 | Lógica simples | Qual número completa a regra: 3, 6, 9, 12, ? | 13 / 14 / 15 / 16 | 2 | A sequência aumenta de 3 em 3; então o próximo é 15. |
| 119 | I2 | Cálculo rápido | Qual é o resultado de 7 × 4? | 24 / 28 / 32 / 36 | 1 | 7 × 4 = 28. |
| 120 | I2 | Blocos de divisão | Qual é o quociente de 18 ÷ 3? | 4 / 5 / 6 / 7 | 2 | 18 ÷ 3 = 6. |
| 121 | I1 | Sequência de passos | Uma sequência de movimentos é 1, 3, 5, 7, ... Qual é o 6º termo? | 9 / 10 / 11 / 12 | 2 | A sequência aumenta de 2 em 2; o 6º termo é 11. |
| 122* | I1 | Quantas vezes | Se você contar 5 objetos e depois mais 3, quantos objetos terá ao todo? | 7 / 8 / 9 / 10 | 1 | 5 + 3 = 8. |
| 123* | I2 | Comparação de preços | Se uma caneta custa 3 reais e um caderno custa 7 reais, quanto custa um caderno e duas canetas? | 10 / 11 / 12 / 13 | 3 | 7 + 2 × 3 = 13 reais. |
| 124 | I2 | Operação em cadeia | Qual é o resultado de (9 + 3) ÷ 2? | 5 / 6 / 7 / 8 | 1 | 9 + 3 = 12; 12 ÷ 2 = 6. |

`level` é "Iniciação 1" ou "Iniciação 2"; `year` é 1 ou 2.

### A.2 Pares da sessão comparativa (rodada 1 / rodada 2 → resposta)
- **busca-binaria:** Catálogo ordenado — "No vetor [2, 4, 7, 10, 13], qual é o índice (começando em zero) do valor 10?" → 3 / Placar ordenado — "No vetor [1, 5, 8, 12, 17], qual é o índice (começando em zero) do valor 8?" → 2
- **dp:** Escolha de tarefas — "Tarefas (custo, benefício): (1, 2), (2, 4), (3, 4). Com capacidade 3 e uso único, qual benefício máximo?" → 6 / Mochila de equipamentos — "Itens (peso, valor): (1, 3), (2, 5), (3, 6). Com capacidade 3 e uso único, qual valor máximo?" → 8
- **grafos:** Rotas de salas — "A→B custa 2, B→D custa 3, A→C custa 1 e C→D custa 7. Qual o custo mínimo de A até D?" → 5 / Rede de estações — "P→Q custa 4, Q→S custa 2, P→R custa 3 e R→S custa 6. Qual o custo mínimo de P até S?" → 6
- **stl:** Contagem de códigos — "Na sequência [4, 2, 4, 1, 2, 4], quantos valores distintos aparecem repetidos?" → 2 / Contagem de votos — "Na sequência [7, 7, 3, 5, 3, 9], quantos valores distintos aparecem repetidos?" → 2

### A.3 Níveis do mentor
1 Pergunta socrática — "Uma pergunta para você construir o próximo passo." · 2 Dica conceitual — "Uma pista sobre o conceito, sem resolver o exercício." · 3 Exemplo análogo — "Um exemplo diferente que usa a mesma ideia." · 4 Roteiro parcial — "Etapas abstratas, sem código executável ou resposta final."

### A.4 Respostas do mentor por tópico (question / concept / analogy / steps)
- **busca-binaria** — Q: "O que precisa ser verdade sobre os dados para que descartar metade do intervalo não elimine uma resposta válida?" · C: "Busca binária mantém um intervalo candidato em dados ordenados. Cada comparação com o meio permite descartar uma das metades; por isso, o número de passos cresce aproximadamente com o logaritmo do tamanho da entrada." · A: "Imagine encontrar uma palavra em um dicionário: você abre perto do meio e escolhe a metade que ainda pode conter a palavra. O exercício não é um dicionário; apenas compartilha essa ideia de descarte." · S: "Roteiro parcial: definir os limites do intervalo; escolher um ponto central; comparar com o alvo; descartar a metade impossível; repetir enquanto ainda houver candidatos."
- **dp** — Q: "Qual é o menor estado do problema que você consegue responder sem resolver o problema inteiro?" · C: "Programação dinâmica organiza subproblemas que se repetem. Uma relação de recorrência descreve como combinar resultados menores, e uma ordem de cálculo garante que os resultados necessários já existam." · A: "Ao planejar etapas de uma viagem, você registra o melhor custo para chegar a cada parada e reaproveita esses resultados, sem recalcular todos os caminhos desde o início." · S: "Roteiro parcial: definir o significado do estado; identificar escolhas possíveis; expressar a transição; definir casos-base; calcular estados em uma ordem válida."
- **grafos** — Q: "As conexões têm custos diferentes? O objetivo minimiza passos, custo total ou apenas verifica se existe caminho?" · C: "Um grafo representa entidades e conexões. A escolha do algoritmo depende do que as arestas significam: conectividade, menor número de passos ou menor custo com pesos." · A: "Uma rede de estações pode ser desenhada como pontos ligados por rotas. Contar baldeações e minimizar preço são objetivos diferentes, mesmo usando o mesmo mapa." · S: "Roteiro parcial: modelar vértices e arestas; decidir a métrica; escolher a busca compatível; registrar o estado de cada vértice; verificar o destino."
- **stl** — Q: "Qual operação acontece mais vezes no seu problema e qual estrutura a torna mais barata?" · C: "Estruturas de dados organizam valores para favorecer operações específicas. Compare custo de acesso, busca, inserção e remoção com o tamanho e a frequência de cada operação." · A: "Uma lista de chamada ordenada facilita procurar nomes; um índice por nome pode acelerar buscas repetidas, mas exige trabalho para ser mantido." · S: "Roteiro parcial: listar as operações necessárias; estimar quantas vezes ocorrem; escolher uma estrutura; medir o custo total; validar com entradas-limite."
- **python** — Q: "Você precisa manter a ordem original, garantir unicidade ou consultar um valor associado a uma chave?" · C: "Em Python, listas, conjuntos e dicionários oferecem operações diferentes. A escolha deve refletir se você precisa preservar ordem, evitar repetição ou associar chaves a valores." · A: "Uma lista é como uma fila numerada, um conjunto como uma coleção sem duplicatas e um dicionário como um índice de chave para informação." · S: "Roteiro parcial: identificar a operação dominante; escolher a estrutura adequada; definir como percorrer os dados; testar vazio, repetido e valor ausente."

Respostas especiais: com "varia" → "Uma variação deve preservar a técnica central e alterar apenas um eixo por vez. Gere uma versão na seção Variações e tente identificar a invariante que continua igual."; com "codigo/debug/errado" → "Posso ajudar a investigar sem corrigir por você. Abra Depuração guiada, informe o veredito e examine a linha suspeita. Que valor essa variável tem na primeira iteração?"

### A.5 Biblioteca de prompts (id — categoria — texto)
binary — Busca binária — Explique o conceito de busca binária sem resolver o exercício. · dp — Programação dinâmica — Que subproblemas menores podem aparecer aqui? · graphs — Grafos — Como posso distinguir busca em largura de menor caminho? · structures — Estruturas de dados — Que operações desta estrutura são importantes para o problema? · stl — STL — Qual custo das operações da estrutura que estou usando? · python — Python — Explique este conceito usando recursos idiomáticos de Python. · variation — Variações — Gere uma variação deste problema mudando uma restrição. · debug — Depuração — O que meu código pode estar fazendo de errado? Faça perguntas, sem corrigir. · review — Revisão — Revise minha abordagem e aponte uma hipótese que devo testar.

### A.6 Guia de vereditos
- Accepted: "A solução foi aceita pelo juiz. Use este resultado como ponto de partida: explique a ideia e procure uma variação ou caso-limite para consolidar o aprendizado."
- Runtime Error: "O programa iniciou, mas falhou durante a execução. Investigue acesso inválido, divisão por zero e casos em que a entrada está vazia."
- Wrong Answer: "O programa terminou, mas produziu uma resposta diferente da esperada. Compare a lógica com casos pequenos e limites."
- Time Limit Exceeded: "O programa não terminou dentro do tempo. Estime quantas operações crescem com a entrada e procure trabalho repetido."
- Compilation Error: "O compilador não conseguiu montar o programa. Leia a primeira mensagem do compilador e confira sintaxe, nomes e tipos."
- Memory Limit: "O programa excedeu o limite de memória. Verifique estruturas dimensionadas pela entrada e cópias que poderiam ser evitadas."

Perguntas por veredito: Accepted → "Você consegue justificar por que a abordagem funciona?", "Qual variação poderia mudar a escolha da estrutura?"; Runtime Error → "Qual entrada mínima reproduz a falha?", "Há divisão por zero ou acesso sem elemento?"; Wrong Answer → "Qual caso pequeno diferencia sua hipótese do resultado esperado?", "O enunciado inclui igualdade ou valores repetidos?"; Time Limit Exceeded → "Quantas vezes cada laço executa?", "Há uma busca linear dentro de outra repetição?"; demais → "Qual é a primeira mensagem do compilador?", "Os tipos e nomes usados foram declarados?"

### A.7 Casos de borda por tópico
busca-binaria: Vetor vazio, Um único elemento, Alvo menor que todos, Alvo maior que todos, Valores repetidos · dp: Capacidade zero, Nenhum item disponível, Um item que excede a capacidade, Itens com valores iguais · grafos: Origem igual ao destino, Destino desconectado, Aresta de custo zero, Grafo com um vértice · stl: Sequência vazia, Todos os valores iguais, Todos os valores distintos, Valores negativos

### A.8 Templates de variação
- **busca-binaria** — "Busca em dados ordenados", técnica Busca binária, médio: "Uma sequência ordenada contém identificadores. Encontre a primeira posição em que o valor é maior ou igual ao alvo e conte as comparações." Restrições: até 1.000.000 de itens; pode estar vazia; alvo fora do intervalo. Contextos: catálogo de livros, placar de uma olimpíada, sensores ordenados.
- **dp** — "Planejamento com capacidade limitada", Programação dinâmica, difícil: "Escolha tarefas com custos e benefícios para maximizar o benefício total sem ultrapassar o orçamento disponível." Restrições: orçamento pode ser zero; tarefas com o mesmo custo; cada tarefa uma vez. Contextos: organização de uma feira, seleção de atividades, carregamento de equipamentos.
- **grafos** — "Rotas entre pontos conectados", Grafos, difícil: "Dado um mapa de conexões, descubra o menor custo para sair de uma origem e chegar a um destino." Restrições: pode não existir caminho; conexões de custo zero; até 100.000 conexões. Contextos: rede de computadores, linhas de transporte, salas conectadas.
- **stl** — "Frequência de elementos", Ordenação e estruturas de dados, fácil: "Receba uma sequência de códigos e determine quais aparecem mais de uma vez e quantas ocorrências têm." Restrições: pode estar vazia; valores negativos; muitos repetidos. Contextos: inventário de peças, votos de uma enquete, registros de acesso.
