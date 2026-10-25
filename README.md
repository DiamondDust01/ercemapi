# OBI Quest

O OBI Quest é uma plataforma de treino educacional inspirada nas modalidades da
Olimpíada Brasileira de Informática (OBI). Reúne Iniciação, desafios introdutórios
de programação, recursos de reflexão pedagógica e salas demonstrativas de
competição. **Não é um serviço oficial da OBI, não substitui uma prova oficial e
não executa um juiz de programação real.**

Versão atual do código: **1.6.1**. A fonte da numeração é `package.json`; o
histórico de mudanças está em `CHANGELOG.md`.

## O que o aplicativo oferece

Ao abrir, o app pergunta qual variação usar: **OBI Quest** (treino para a OBI) ou
**Pensa Comigo** (palestras sobre estudar com IA). A escolha vale para a aba
aberta e pode ser trocada a qualquer momento pelo botão "Trocar de modo".
As duas variações têm tema claro e escuro (botão de sol e lua); o escuro é o
padrão e a escolha fica salva no aparelho. O Pensa Comigo tem paleta própria,
em âmbar e laranja, com fundo hexagonal.

O tema claro inverte as escalas de cor do Tailwind e fica em
`src/themeLight.css`. Depois de atualizar o Tailwind, gere o arquivo de novo com
`node scripts/generate-light-theme.mjs`; um teste avisa quando ele está
desatualizado.

- **Início:** perfil local, progresso resumido e atalhos para os módulos.
- **Iniciação:** questões objetivas de lógica e interpretação, com faixa,
  dificuldade, pontuação e cronômetro.
- **Código:** exercícios introdutórios em C++ e Python com editor e verificação
  didática local.
- **Mentoria:** pistas e ferramentas locais para comparar tentativas, revisar
  erros, criar variações, registrar reflexões e apoiar atividades de professor.
- **Regras:** material educativo sobre as modalidades e preparação.
- **Competição:** cronômetro e salas com duração configurável, confirmação dos
  parâmetros, quantidade mínima para iniciar e limite máximo de 16 participantes.
- **Pensa Comigo (1.5.0):** modo de palestra para turmas de 11 a 14 anos que
  mostra a IA como tutor, e não como copiador. Tem sala com telão, entrada por
  código ou QR sem cadastro, quatro missões, o experimento "copiar × estudar
  ativamente", modos em duplas e sem celular, kit impresso e "Escolha seu
  desafio". Detalhes na seção própria abaixo.

As abas usam um painel comum de rolagem. Ao navegar para outra aba, o painel
retorna ao início em web, Android e desktop.

## Limites pedagógicos importantes

- O juiz de Programação verifica padrões previstos no código da atividade; não
  inicia um compilador C++ ou Python e não executa os programas enviados.
- A “IA mentora” desta versão seleciona explicações e pistas predefinidas no
  aplicativo. Não chama um modelo generativo nem envia o texto para um provedor.
- A análise de depuração é heurística; ausência de alerta não significa que o
  programa está correto.
- As regras e os rankings exibidos são educativos/demonstrativos, não material ou
  classificação oficial da OBI.
- No Pensa Comigo, o experimento é uma demonstração com uma turma, não uma prova
  científica; o tutor segue regras fixas e não é uma IA generativa.

## Conexão, partidas e dados

O indicador local de rede usa informações fornecidas pelo navegador ou sistema,
quando disponíveis. Ele não envia requisições nem mede ping contra um servidor.
O indicador P2P da sala, quando há pareamento, mede respostas recentes entre
dispositivos pelo canal WebRTC; não é o mesmo indicador e não mede o ping da
Internet.

Com Firebase configurado, as salas e alguns dados de progresso podem ser
sincronizados pelo Firestore. As conexões WebRTC tentam eleger como principal o
participante com menor ping medido e como reserva o seguinte. A sinalização e o
estado oficial da sala continuam dependendo do Firestore. O pareamento usa STUN;
algumas redes exigem TURN e podem impedir uma conexão direta.

Para habilitar esse modo, configure `__firebase_config` ou `VITE_FIREBASE_CONFIG`
como JSON e, opcionalmente, `VITE_APP_ID`. Habilite autenticação anônima e
configure regras Firestore para as salas e a subcoleção `peerSignals`. Os valores
`VITE_*` são incorporados ao compilar cada distribuição. Sem Firebase, exercícios
individuais funcionam e a interface pode demonstrar uma sala apenas local; não
há multiplayer entre dispositivos.

O perfil, preferências, atividades pedagógicas e recordes locais usam
`localStorage`. Esses dados não sincronizam automaticamente entre navegador,
Android e Windows.

## Modo Pensa Comigo

O Pensa Comigo é escolhido na tela inicial, como variação própria do app, com
cabeçalho e navegação próprios. Também abre pelo cartão do Início do OBI Quest,
pela seção Professor da Mentoria ou direto por um link `?sala=CÓDIGO` (o QR do
telão aponta para esse link). O palestrante cria a
sala, projeta o telão e conduz as etapas: abertura com enquete anônima, quatro
missões (Tente primeiro, Remix de prompt, Me teste, Detetive de erros),
experimento, quiz sem IA, resultado, fechamento e re-teste.

- **Alunos:** entram por código ou QR, recebem um apelido sorteado e não digitam
  nome. Um aparelho pode ser uma dupla. Os dados do modo ficam em
  `sessionStorage` e o botão "Encerrar neste aparelho" apaga tudo. O texto livre
  (tentativas e remix) não sai do aparelho; só pontuações e acertos vão para a sala.
- **Experimento:** cada aluno faz um tema copiando a resposta pronta e o outro
  estudando com o tutor, com grupos alternados pela ordem de entrada. O telão
  compara acertos na atividade, acertos no quiz sem IA e "seguros que erraram".
- **Sem rede ou sem celular:** todo o conteúdo vai no build. O palestrante pode
  contar cartões A/B/C/D, lançar no painel os números das folhas e baixar o kit
  impresso. Sem Firebase, a sala é uma demonstração local neste aparelho.
- **Tutor:** local por padrão. `VITE_ENABLE_LLM_TUTOR` fica desligada; esta
  versão não inclui o backend que o tutor generativo exigiria, então nada é
  enviado a provedores de IA mesmo com a flag ligada.

### Firebase, regras e hospedagem

Os dados do modo ficam em subcoleções da turma:
`artifacts/{appId}/classrooms/{código}/pensaComigo/state` (só o palestrante
escreve) e `.../pensaComigoParticipants/{uid}` (cada aluno escreve o próprio
registro; só o palestrante lê a turma). As regras sugeridas estão em
`firestore.rules` e mantêm o comportamento das salas, `peerSignals` e turmas do
Professor.

Para o QR funcionar nos celulares, publique o `dist/` (por exemplo, no Firebase
Hosting configurado em `firebase.json`) e compile com `VITE_PUBLIC_APP_URL`
apontando para o endereço HTTPS publicado. No app Android e no Windows, os
alunos entram pelo código.

```bash
npm run build
npx firebase-tools deploy --only hosting,firestore:rules --project SEU-PROJETO
```

| Variável | Uso |
|---|---|
| `VITE_FIREBASE_CONFIG` | JSON do Firebase; sem ela, salas e Pensa Comigo são locais |
| `VITE_APP_ID` | prefixo dos caminhos do Firestore (padrão `obi-quest-v1`) |
| `VITE_PUBLIC_APP_URL` | endereço HTTPS publicado, usado no QR |
| `VITE_ENABLE_LLM_TUTOR` | desligada; reservada para um tutor generativo com backend |
| `VITE_FIREBASE_EMULATORS` | `1` liga auth e Firestore aos emuladores, só em `npm run dev` |

Guia completo, com o que não afirmar: `docs/06-pensa-comigo.ignore`.

## Desenvolvimento web

Requisitos: Node.js compatível com Vite e npm.

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

`npm run build` gera `dist/`; `npm run preview` serve esse build para revisão.

## Pacotes Android

O Android usa Capacitor e exibe o mesmo build web numa WebView. Requer Android
SDK e JDK compatível com o Gradle.

```bash
npm run android:sync
npm run android:open
npm run android:apk
```

O APK de depuração gerado localmente fica em
`android/app/build/outputs/apk/debug/app-debug.apk`. O APK 1.6.1 pronto para
teste está na branch `app-mobile`:
[baixar OBI Quest 1.6.1 para Android](https://github.com/DiamondDust01/obi-quest/raw/refs/heads/app-mobile/installers/android/OBI-Quest-1.6.1-android.apk).
Ele usa a chave de depuração (`versionCode` 11), não é um pacote assinado para
publicação na Play Store e não foi testado em aparelho físico nesta rodada.

## Pacotes Windows

O app de desktop usa Electron com sandbox, isolamento de contexto e abertura de
links HTTPS no navegador externo. Requer Node.js 22.12 ou superior para
empacotamento.

```bash
npm run app:windows
npm run app:windows:package
```

`app:windows:package` gera a aplicação portátil completa em
`%LOCALAPPDATA%\OBI-Quest\portable`; distribua a pasta completa, não apenas o
executável. O instalador assistido (NSIS) é gerado na branch `app-pc`, que
acrescenta o script `npm run app:windows:installer`.

O pacote portátil 1.6.1 está na branch `app-pc`:
[baixar OBI Quest 1.6.1 para Windows x64](https://github.com/DiamondDust01/obi-quest/raw/refs/heads/app-pc/installers/windows/OBI-Quest-1.6.1-Windows-x64.7z).
Extraia com 7-Zip ou NanaZip e execute `OBI Quest.exe` na pasta extraída. O
arquivo comprimido tem cerca de 99,9 MB (95,30 MiB); o GitHub recomenda manter
arquivos abaixo de 50 MB. O instalador assistido 1.6.1 (Setup, via Git LFS)
também está em `installers/windows/` na branch `app-pc`. A aplicação e os
pacotes não têm assinatura digital, e políticas de segurança do Windows podem
bloquear a execução.

## Branches e distribuição

- `main`: versão integrada e fontes completos.
- `test`: validação antes da integração em `main`.
- `app-mobile`: árvore completa do projeto e APK Android de teste.
- `app-pc`: árvore completa do projeto e pacote portátil Windows.

As branches de plataforma mantêm os fontes compartilhados e acrescentam os
artefatos daquela plataforma; não são versões com os fontes removidos. Os
READMEs específicos e os artefatos ficam em `installers/android/` na branch
`app-mobile` e em `installers/windows/` na branch `app-pc`.

## Documentação para estudo e NotebookLM

`docs/guia_de_estudo_e_apresentacao.md` contém uma explicação longa dos módulos,
fluxos, armazenamento, limites e roteiro de demonstração. Para fontes temáticas
mais curtas em texto simples, consulte [`docs/README.md`](docs/README.md) e os
arquivos `.ignore` da pasta `docs/`.

## Estrutura do projeto

- `src/App.jsx`: interface, telas e fluxos principais.
- `src/content/obiContent.js`: banco de Iniciação, textos do mentor, pares e
  templates, compartilhados com o Pensa Comigo.
- `src/pensaComigo/`: modo Pensa Comigo (telas, conteúdo, regras puras e testes).
- `firestore.rules` e `firebase.json`: regras sugeridas e hospedagem do `dist/`.
- `src/competitionRooms.js`: regras e validação das salas.
- `src/peerPairing.js`: pareamento P2P e resumo das medições recentes.
- `src/localConnection.js`: indicadores locais de conectividade.
- `src/styles.css`: estilos globais.
- `android/`: projeto nativo Gradle/Capacitor.
- `electron/main.cjs`: inicialização da janela Electron.
- `scripts/package-windows.cjs`: empacotamento portátil Windows.
- `CHANGELOG.md`: notas e numeração de versão.
