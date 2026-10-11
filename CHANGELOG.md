# Notas de versão

Este arquivo registra as mudanças do OBI Quest e serve como referência para manter
a numeração das versões consistente entre o código e os próximos lançamentos.

## Como manter as versões

- A versão oficial do aplicativo fica em `package.json`; a interface a exibe
  automaticamente. Não mantenha outro número de versão manualmente no código.
- Registre mudanças novas em **Não lançado** enquanto ainda não fizerem parte de
  uma versão publicada.
- Ao preparar uma publicação, mova as notas para uma seção com a versão e a data,
  atualize `package.json` e `package-lock.json` juntos e limpe a seção **Não
  lançado**.
- Siga versionamento semântico (`MAJOR.MINOR.PATCH`): aumente MAJOR para mudanças
  incompatíveis, MINOR para funcionalidades compatíveis e PATCH para correções
  compatíveis. Não aumente a versão apenas por mudanças internas ou documentação.
- Escreva notas curtas, em português, agrupadas por funcionalidades, correções e
  mudanças incompatíveis, quando aplicável.

## 1.2.0 - 2026-10-11

### Adicionado

- Mostrador de ping dos dispositivos pareados, com latência média, faixa,
  variação das amostras, estado da conexão e identificação do principal/reserva.
- Atualização periódica das medições de ping P2P usadas na eleição do dispositivo
  principal e de reserva.

## 1.1.0 - 2026-10-11

### Adicionado

- A interface exibe no canto da tela a versão definida em `package.json`.
- Pareamento direto entre participantes da sala por WebRTC, com sinalização via
  Firestore e eleição de dispositivo principal e reserva pelo menor ping médio.
- Solicitações de pontuação passam pelo dispositivo principal quando a conexão
  direta está disponível; o Firestore continua persistindo a partida e servindo
  de fallback quando o canal P2P não estiver conectado.
- Testes automatizados para a seleção determinística dos dispositivos principal
  e reserva.

## 1.0.0 - 2026-10-03

### Adicionado

- Suporte aos aplicativos Android (Capacitor) e Windows (Electron).
- Trilha de mentoria pedagógica e recursos de variação de problemas e relatórios.

### Corrigido

- Dependências e configuração para execução e empacotamento dos aplicativos.
