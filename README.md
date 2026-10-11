# OBI Quest

O OBI Quest é uma plataforma de treino educacional inspirada nas modalidades da
Olimpíada Brasileira de Informática (OBI). Reúne Iniciação, desafios introdutórios
de programação, recursos de reflexão pedagógica e salas demonstrativas de
competição. **Não é um serviço oficial da OBI, não substitui uma prova oficial e
não executa um juiz de programação real.**

Versão atual do código: **1.4.2**. A fonte da numeração é `package.json`; o
histórico de mudanças está em `CHANGELOG.md`.

## O que o aplicativo oferece

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
`android/app/build/outputs/apk/debug/app-debug.apk`. O APK 1.4.2 pronto para
teste está na branch `app-mobile`:
[baixar OBI Quest 1.4.2 para Android](https://github.com/DiamondDust01/obi-quest/raw/refs/heads/app-mobile/installers/android/OBI-Quest-1.4.2-android.apk).
Ele usa a chave de depuração (`versionCode` 8), não é um pacote assinado para
publicação na Play Store e não foi testado em aparelho físico nesta rodada.

## Pacotes Windows

O app de desktop usa Electron com sandbox, isolamento de contexto e abertura de
links HTTPS no navegador externo. Requer Node.js 22.12 ou superior para
empacotamento.

```bash
npm run app:windows
npm run app:windows:package
npm run app:windows:installer
```

`app:windows:package` gera a aplicação portátil completa em
`%LOCALAPPDATA%\OBI-Quest\portable`; distribua a pasta completa, não apenas o
executável. `app:windows:installer` primeiro prepara os arquivos do aplicativo e compila um
instalador assistido NSIS x64 diretamente em `release/windows/`, sem executar
um instalador auxiliar temporário. Ele permite escolher a pasta de instalação,
cria atalhos no menu Iniciar e na área de trabalho, e inclui um desinstalador.
O instalador não tem assinatura digital; políticas de segurança ainda podem
bloquear sua compilação ou execução. Não desative proteções do Windows para
contornar esses bloqueios. O Setup gerado localmente não foi executado neste
ambiente e, com cerca de 110 MB, não foi incluído na branch porque ultrapassa
o limite de 100 MiB por arquivo do GitHub; use um ambiente de teste autorizado
e publique-o como ativo de Release ou em outro armazenamento apropriado.

O pacote portátil 1.4.2 está na branch `app-pc`:
[baixar OBI Quest 1.4.2 para Windows x64](https://github.com/DiamondDust01/obi-quest/raw/refs/heads/app-pc/installers/windows/OBI-Quest-1.4.2-Windows-x64.7z).
Extraia com 7-Zip ou NanaZip e execute `OBI Quest.exe` na pasta extraída. O
arquivo comprimido tem cerca de 98,8 MB (94,25 MiB); o GitHub recomenda manter
arquivos abaixo de 50 MB. A aplicação e o pacote não têm assinatura digital, e
políticas de segurança do Windows podem bloquear a execução. O assistente
Setup.exe ainda não foi publicado. A compilação local gera um arquivo de cerca
de 110 MB, acima do limite de 100 MiB por arquivo no GitHub; além disso, ele
não foi executado neste ambiente e precisa ser validado em um ambiente de teste
autorizado antes da distribuição.

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
- `src/competitionRooms.js`: regras e validação das salas.
- `src/peerPairing.js`: pareamento P2P e resumo das medições recentes.
- `src/localConnection.js`: indicadores locais de conectividade.
- `src/styles.css`: estilos globais.
- `android/`: projeto nativo Gradle/Capacitor.
- `electron/main.cjs`: inicialização da janela Electron.
- `scripts/package-windows.cjs`: empacotamento portátil Windows.
- `CHANGELOG.md`: notas e numeração de versão.
