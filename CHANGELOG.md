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

## Não lançado

## 1.5.0 - 2026-10-25

### Adicionado

- Tela inicial de escolha entre as duas variações do app, **OBI Quest** e
  **Pensa Comigo**, com botão "Trocar de modo" nas duas. A escolha vale para a
  aba aberta; um link `?sala=CÓDIGO` abre direto o Pensa Comigo.
- Modo **Pensa Comigo** para palestras em escolas (11 a 14 anos): sala com telão
  em tempo real, etapas conduzidas pelo palestrante, entrada por código ou QR
  (`?sala=CÓDIGO`) sem cadastro e com apelido sorteado, enquete anônima, modo em
  duplas e modo sem celular com contagem de cartões.
- Quatro mini-missões: Tente primeiro, Remix de prompt (rubrica local, o texto
  não sai do aparelho), Me teste e Detetive de erros.
- Experimento "copiar × estudar ativamente" com distribuição balanceada, quiz sem
  IA com nível de confiança, três medidas no telão, código de retorno e re-teste.
- Tutor local do modo (tentativa, três dicas e explicação), "Escolha seu desafio"
  com o conteúdo existente classificado por faixa etária, kit impresso,
  exportação anonimizada e botão "Encerrar neste aparelho".
- Regras sugeridas do Firestore (`firestore.rules`) e configuração de hospedagem
  (`firebase.json`); conexão opcional aos emuladores do Firebase em desenvolvimento.

### Melhorado

- O empacotamento Windows agora compila o assistente NSIS diretamente a partir
  dos arquivos preparados pelo Electron, sem iniciar um Setup auxiliar
  temporário para gerar o desinstalador; instalação, abertura e desinstalação
  foram verificadas localmente e o Setup está disponível via Git LFS em `app-pc`.

### Corrigido

- Gabaritos das questões 110 (8), 112 (18), 122 (8) e 123 (13) da Iniciação; a
  explicação da 112 também foi corrigida.
- O desafio 7 em C++ aceita `"\n"` e `'\n'`, como a dica sugere.
- A tela inicial informa "Até 10" questões por rodada e 12 no banco por faixa.
- O README da `main` deixa de citar o script do instalador NSIS, que só existe na
  branch `app-pc`, e o
  `requirements.txt` acompanha as versões do `package.json`.
- Ao trocar de aba, o conteúdo volta ao início em web, Android e desktop; a
  rolagem fica restrita ao painel da aplicação em vez de permanecer na página.

### Organização

- Banco de Iniciação e textos do mentor movidos para `src/content/obiContent.js`,
  sem mudança de comportamento, para serem compartilhados com o novo modo.

## 1.4.0 - 2026-10-11

### Adicionado

- Assistente de criação de sala com configuração de duração, mínimo para iniciar
  e máximo de jogadores, seguido de um resumo para confirmar antes de criar.
- Salas mostram a ocupação e o que falta para atingir o mínimo; o início fica
  bloqueado até o limite mínimo ser alcançado e novas entradas são recusadas
  quando a sala está cheia ou a partida já começou.
- Validações transacionais de entrada e início para manter os limites de
  participantes mesmo quando vários aparelhos tentam entrar ao mesmo tempo.

## 1.4.2 - 2026-10-11

### Corrigido

- Removida a regra global que forçava a fonte padrão em todos os botões e
  sobrescrevia os tamanhos tipográficos definidos por tela; os estilos dos
  botões ficam consistentes na web, Android e Windows.

## 1.4.1 - 2026-10-11

### Corrigido

- Ajustado o tamanho e o peso do texto do botão “Cancelar” na configuração de
  sala na versão web, sem alterar os outros botões.

## 1.3.1 - 2026-10-11

### Melhorado

- Interface nativa Android mais compacta, com tipografia e espaçamentos menores e
  menos elementos decorativos; a escala da versão web e do app Windows não muda.
- Opções de competição separadas e explicadas: criar sala, compartilhar/copiar o
  código e entrar com o código recebido. O modo local informa que não é multiplayer.

### Corrigido

- Rótulo do indicador local de rede e texto de ajuda revisados para português.
- Indicador de ping P2P no canto da tela e no painel da sala, separado da
  conexão local. Exibe medições recentes de ida e volta entre aparelhos e
  sinaliza quando não há pareamento ou quando as respostas deixam de chegar.

### Organização

- Branches consolidadas em `main`, `test`, `app-mobile` e `app-pc`; cada branch
  mantém a árvore completa do projeto para poder compilar e testar o aplicativo.

## 1.3.0 - 2026-10-11

### Adicionado

- Indicador local de conectividade em todas as telas, com estimativa de
  qualidade quando o navegador ou sistema fornece esses dados, sem testar ping
  contra servidores.
- Detalhes locais de tipo de rede, taxa estimada e latência quando disponíveis;
  sem estimativas, o app informa apenas o estado de conexão fornecido pelo sistema.

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
