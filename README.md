# OBI Quest

Projeto React/Vite inspirado na Olimpíada Brasileira de Informática com duas modalidades:

- Iniciação: perguntas objetivas de lógica e raciocínio
- Programação: ambiente de códigos em C++ e Python com simulação de juiz automático

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
