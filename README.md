# OBI Quest

Projeto React/Vite inspirado na Olimpíada Brasileira de Informática com duas modalidades:

- Iniciação: perguntas objetivas de lógica e raciocínio
- Programação: ambiente de códigos em C++ e Python com simulação de juiz automático

## Pareamento direto entre dispositivos

Um indicador de conectividade local permanece disponível em todas as telas.
Quando o navegador ou sistema expõe estimativas de tipo de rede, taxa e RTT, ele
mostra uma qualidade aproximada; caso contrário, informa apenas se o sistema
indica rede conectada. Esse indicador não faz requisições nem testes de ping a
servidores e não representa uma medição do acesso à Internet.

As salas de competição tentam criar conexões WebRTC diretas entre os participantes.
O dispositivo conectado com menor ping médio é eleito principal; o seguinte
torna-se a reserva. O painel da sala mostra a latência média por dispositivo,
faixa de ping, variação recente das amostras e estado da conexão. Pedidos de
pontuação usam o principal quando o canal direto está disponível. O estado
oficial da partida continua persistido no Firestore, que também transporta a
sinalização necessária para estabelecer as conexões.

Esse recurso exige configuração do Firebase no ambiente (`__firebase_config`
ou `VITE_FIREBASE_CONFIG` como JSON e, opcionalmente, `VITE_APP_ID`), autenticação
anônima habilitada e regras do Firestore que permitam aos participantes ler e
atualizar a sala e os documentos da subcoleção `peerSignals`. As variáveis
`VITE_*` são incorporadas ao build, então precisam estar definidas ao compilar
para navegador, Android ou Windows. Sem essa configuração, partidas individuais
continuam disponíveis. O pareamento usa STUN para descoberta de rota; redes que
exigem TURN podem impedir a conexão direta, e nesse caso a sala recorre à
sincronização normal do Firestore. O código funciona no navegador, no WebView
Android e no Electron para Windows.

## Tecnologias

- React
- Vite
- Firebase
- lucide-react

## Como executar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Para gerar o build de produção:
   ```bash
   npm run build
   ```
4. Para executar os testes unitários:
   ```bash
   npm test
   ```

## Aplicativo Android (Capacitor)

O app Android usa o mesmo build React/Vite em uma WebView. Os fontes web continuam sendo a origem da interface; depois de alterá-los, sincronize novamente os assets nativos.

Pré-requisitos: Android Studio, Android SDK e um JDK compatível com a versão do Gradle do projeto.

```bash
npm run android:sync
npm run android:open
```

No Windows, com o SDK e o JDK configurados, gere um APK de depuração com:

```bash
npm run android:apk
```

O APK de depuração fica em `android/app/build/outputs/apk/debug/app-debug.apk`. Para instalar em dispositivos fora do ambiente de desenvolvimento, ainda será necessário configurar assinatura de release.

## Aplicativo Windows (Electron)

O app portátil inclui o executável Electron e a aplicação web em `resources/app.asar`. O shell mantém isolamento de contexto; links HTTPS externos abrem no navegador padrão. O empacotamento requer Node.js 22.12 ou superior.

```bash
npm run app:windows
npm run app:windows:package
```

O segundo comando gera `%LOCALAPPDATA%\OBI-Quest\portable\OBI Quest.exe`. Distribua a pasta `portable` completa; o executável não está assinado digitalmente e não é um instalador.

Os comandos web `npm run dev`, `npm run build` e `npm run preview` permanecem disponíveis e não dependem dos wrappers nativos.

## Estrutura principal

- `src/App.jsx` — aplicação completa
- `src/main.jsx` — bootstrap do React
- `index.html` — entrada HTML do Vite
- `capacitor.config.json` — identidade e pasta web usada pelo Android
- `android/` — projeto Android nativo gerado pelo Capacitor
- `electron/main.cjs` — janela segura do aplicativo Windows
