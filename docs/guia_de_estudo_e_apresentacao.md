# OBI Quest: guia de estudo e apresentação

> **Atualizado em 26/10/2026.** O texto descreve a variação OBI Quest na versão 1.4.2. Depois disso:
>
> - **25/10/2026 (1.5.0):** tela de escolha entre OBI Quest e Pensa Comigo; gabaritos das questões 110, 112, 122 e 123 corrigidos.
> - **25/10/2026 (1.6.0):** temas claro e escuro em todas as telas.
> - **25/10/2026 (1.6.1):** rodapé citando a ERCEMAPI e botões dos cartões alinhados.
> - **26/10/2026 (em desenvolvimento):** o app passou a se chamar **ERCEMAPI** ("OBI Quest" segue como nome da variação de treino); fundo do OBI Quest em malha hexagonal azul; Pensa Comigo em verde com chuva de citações sempre inteiras; tema claro revisto, com cartões brancos e botões de cor sólida.

## Para que serve este material

Este guia foi feito para quem precisa estudar o projeto, demonstrá-lo e responder perguntas sem ter participado da programação. Ele explica o propósito, as telas, os fluxos de uso, o que acontece por trás da interface, como a aplicação guarda dados e quais são os limites da versão atual.

Leia primeiro as seções 1 a 6 para formar uma visão geral. Depois estude as seções dos módulos que serão demonstrados. A seção 15 oferece um roteiro curto de apresentação, e a seção 16 reúne respostas para perguntas frequentes.

## 1. O projeto em uma frase

**OBI Quest é um ambiente de treino educacional inspirado nas modalidades da Olimpíada Brasileira de Informática, com exercícios de lógica, desafios introdutórios de programação e ferramentas de reflexão sobre o uso responsável de ajuda.**

Não é o site oficial da OBI, não substitui uma prova oficial e não executa um juiz de programação real. Na apresentação, prefira chamá-lo de simulador ou plataforma de treino.

## 2. Objetivo e público

A aplicação foi concebida para estudantes que desejam praticar raciocínio lógico, começar a programar e refletir sobre estratégias de resolução. Também oferece uma visão para professores conduzirem atividades curtas em grupo.

Ela combina quatro objetivos:

- Praticar lógica e interpretação de enunciados em questões objetivas.
- Experimentar problemas introdutórios de programação em C++ e Python.
- Simular elementos de uma competição, como cronômetro, sala e classificação.
- Incentivar que a ajuda pedagógica seja uma pista para pensar, não uma solução pronta.

## 3. Como descrever a proposta

Uma apresentação breve pode começar assim:

> “O OBI Quest reúne treino de Iniciação e desafios iniciais de Programação em uma interface única. Além de responder questões e escrever código, o estudante pode comparar uma tentativa independente com outra apoiada por pistas, investigar erros e acompanhar sua evolução. O foco é praticar o raciocínio, não substituir a aprendizagem nem os juízes oficiais.”

A ideia principal é mostrar que a plataforma aproxima o estudante de situações comuns em uma olimpíada: ler com atenção, planejar, testar uma hipótese, receber feedback e tentar novamente.

## 4. Mapa da aplicação

A navegação principal contém cinco destinos, disponíveis no cabeçalho em telas largas e na barra inferior em celulares:

- **Início:** apresentação, perfil local, estatísticas resumidas, checklist e atalhos.
- **Iniciação:** questões de múltipla escolha, pontuação e cronômetro.
- **Código:** desafios em C++ ou Python, editor e feedback do juiz simulado.
- **Mentoria:** dez áreas de apoio ao treino, como comparação, depuração, relatórios e professor.
- **Regras:** explicação educativa sobre as modalidades e dicas de preparação.

Na tela Mentoria há uma segunda navegação com estas áreas: Mentoria, Sem IA × com IA, Depuração, Variações, Banca, Trilha, Uso responsável, Relatórios e diário, Professor e Juízes externos.

## 5. O que a pessoa encontra ao abrir

A página inicial apresenta o OBI Quest e resume três partes: Iniciação, Programação e competição com cronômetro. Os cartões levam diretamente aos módulos.

O painel de perfil permite escolher um nome e um avatar. Esses valores são reaproveitados nas salas. A mesma página mostra o total de pontos de Iniciação, a melhor colocação registrada em salas e um checklist de primeiros passos.

Esse checklist acompanha ações simples: selecionar respostas de Iniciação, concluir um desafio de Programação e abrir a página de regras. Ele serve para orientar a demonstração; não é uma certificação da OBI.

## 6. Modalidade Iniciação

### O que é

É a parte de raciocínio lógico e interpretação, apresentada em formato de múltipla escolha. A interface diferencia Iniciação 1 e Iniciação 2 e permite escolher a dificuldade.

O banco atual contém 24 questões: 12 associadas à faixa Iniciação 1 e 12 à faixa Iniciação 2. A rodada mostra até 10 questões depois de selecionar a faixa e o filtro de dificuldade.

### Como uma rodada funciona

1. Escolha Iniciação 1 ou Iniciação 2.
2. Escolha todas as dificuldades ou um nível específico.
3. Defina o tempo: 10, 15, 20, 25 minutos ou um valor personalizado.
4. Inicie o cronômetro. Enquanto ele estiver parado, as alternativas ficam desabilitadas.
5. Selecione uma alternativa por questão. Depois de responder, a escolha fica bloqueada naquela rodada.
6. Consulte a pontuação e, se desejado, o feedback da resposta.

O cronômetro começa pausado. Iniciar põe o tempo em andamento; pausar suspende a contagem; reiniciar volta ao tempo selecionado. Quando zera, as alternativas deixam de aceitar respostas.

### Pontuação e dificuldade

Quando a questão não especifica dificuldade, o código atribui categorias pela posição dela dentro da faixa: posições iniciais são fáceis, as seguintes médias e as restantes difíceis. A pontuação padrão é 5 pontos para fácil, 8 para médio e 12 para difícil.

A pontuação da rodada soma os pontos das respostas corretas. Respostas incorretas não acrescentam pontos. O máximo mostrado depende das questões que entraram naquela rodada, portanto pode variar com o filtro.

A ordem é embaralhada de forma reproduzível a partir da faixa, do jogador e da dificuldade. Isso significa que os mesmos dados de entrada tendem a produzir a mesma organização, e não que cada recarregamento sorteie uma prova completamente independente.

### Correção imediata

Há uma opção para ocultar a correção imediata. Com ela ativa, a interface confirma que a resposta foi registrada sem indicar logo se está certa nem mostrar a explicação. Sem ela, o sistema apresenta o resultado e a justificativa da questão.

## 7. Modalidade Programação

### O que é

É uma trilha introdutória de dez desafios. Os exercícios cobrem entrada e saída, condicionais, laços, vetores, busca e operações de ordenação. Cada desafio tem objetivo, descrição, exemplos de código inicial e dicas para C++ e Python.

Alguns títulos atuais são “Hello OBI”, “Leitura Veloz”, “Decisão Clássica”, “A Estrutura Suprema”, “Caos Ordenado”, “Soma Direta” e “Contagem Linear”. A página mostra o desafio selecionado, o editor, a saída do juiz e, quando aplicável, uma mensagem de feedback.

### Como usar

1. Escolha a aba Desafios para consultar o problema atual, ou Competição para configurar o cronômetro e a sala.
2. No editor, escolha C++ ou Python.
3. Parta do código inicial e implemente o objetivo descrito.
4. Para enviar, o cronômetro de competição precisa estar ativo.
5. Leia a saída do juiz e use a dica apresentada para revisar a tentativa.
6. Ao obter Accepted, avance para o próximo problema.

O botão de reinício restaura o código inicial do desafio selecionado. O editor aceita Tab para inserir indentação e mantém uma área com linhas numeradas.

### Como funciona o juiz desta versão

É importante explicar isso com precisão: **o juiz atual é uma simulação didática baseada em verificações de texto, não um compilador nem um executor de C++ ou Python.** Cada item de `LEVELS` possui uma função de validação que procura padrões específicos no código, como uma chamada `print`, um `if` ou uma operação de ordenação.

Ao enviar, o app escreve no console mensagens que lembram uma compilação, aguarda brevemente e executa a verificação local daquele nível. Nenhum processo `g++` ou `python` é iniciado pelo código mostrado na interface.

Por isso, um Accepted significa que os padrões esperados para o exercício foram encontrados; não comprova que qualquer entrada possível foi executada corretamente. Da mesma forma, o feedback não cobre toda classe de erro de programação.

Quando há usuário Firebase e progresso carregado, um desafio concluído pode acrescentar 100 pontos ao progresso do usuário. Em uma sala sincronizada, a aprovação pode atualizar também os pontos do participante.

## 8. Competição em sala

O modo Competição associa um cronômetro a uma sala com código. O organizador escolhe uma duração predefinida ou personalizada, cria a sala e compartilha o código. A interface exibe participantes e os ordena pela pontuação.

Com Firebase configurado, a sala é armazenada no Firestore e pode ser acompanhada em tempo real. O host inicia, pausa e reinicia a partida; os dados de início e duração são compartilhados com os participantes.

Sem Firebase, o app consegue criar uma sala local de demonstração neste dispositivo. Essa sala local não oferece multiplayer entre computadores ou celulares. A opção Entrar em uma sala informa que a sincronização multiplayer exige Firebase.

O painel de recordes locais guarda até oito registros. Eles ficam no armazenamento local do navegador ou da aplicação, e não representam uma classificação oficial da OBI.

## 9. Página Regras

A área Regras apresenta um resumo educativo das modalidades, do objetivo da OBI e de recomendações gerais de preparação. Ela contextualiza por que Iniciação prioriza raciocínio e por que Programação envolve enunciado, algoritmo, código e validação.

Esse conteúdo serve de apoio a uma apresentação e a um minicurso; não deve ser citado como regulamento oficial atualizado. Para regras, datas e categorias de uma edição oficial, consulte os canais da própria OBI.

## 10. Oficina de aprendizagem e mentoria

A oficina está na aba Mentoria. Ela tem dez áreas complementares, organizadas para que o estudante tente resolver, peça ajuda limitada e depois reflita sobre o que aprendeu.

### 10.1 Mentor pedagógico

O mentor seleciona respostas locais com base no tópico, na pergunta e no nível escolhido. Os tópicos disponíveis incluem busca binária, programação dinâmica, grafos, estruturas de dados/STL e Python.

Os quatro níveis são:

- Pergunta socrática: pergunta que direciona o próximo raciocínio.
- Dica conceitual: apresenta uma ideia sem resolver o exercício.
- Exemplo análogo: compara com uma situação diferente.
- Roteiro parcial: enumera etapas abstratas sem fornecer código executável.

A interface exige duas confirmações antes de habilitar a orientação. Há limite de cinco consultas na sessão e, dentro da rodada comparativa assistida, de três pistas. Algumas formulações explícitas que pedem solução ou código completo recebem uma recusa pedagógica.

**Limite importante:** apesar do rótulo “IA mentora”, esta versão não chama um modelo generativo. `buildMentorReply` seleciona textos e padrões programados localmente. O texto digitado não é enviado a um provedor de IA. Esse comportamento é deliberado para a demonstração atual e precisa ser explicado se alguém perguntar sobre inteligência artificial real.

### 10.2 Comparação Sem IA × com IA

A sessão reúne dois problemas equivalentes da mesma técnica, em sequência:

1. O estudante tenta o primeiro problema sem ajuda.
2. O app mede o tempo e conta as tentativas até a rodada ser encerrada.
3. O segundo problema usa outra formulação, mas preserva a técnica.
4. O checklist prévio deve ser confirmado antes de habilitar as pistas.
5. O estudante pode pedir até três pistas durante essa rodada.
6. Ao concluir, o app registra ambas as rodadas e oferece perguntas de reflexão.

A sessão não tem duração máxima automática: quem participa encerra cada rodada. O painel compara duração, tentativas, acerto e dicas. A barra é descritiva; uma sessão não prova que a IA causou melhora. Essa cautela está escrita na própria interface.

Os pares atuais praticam busca binária, programação dinâmica, grafos e estruturas de dados. A resposta é conferida por comparação local com uma resposta esperada.

### 10.3 Depuração guiada

O tradutor apresenta explicações para Accepted, Wrong Answer, Runtime Error, Time Limit Exceeded, Compilation Error e Memory Limit. A pessoa pode escolher um tópico, selecionar um veredito e colar um trecho de código para receber perguntas orientadoras.

A análise percorre as linhas em busca de alguns padrões comuns, como acesso a vetores com determinados índices, condições de laço potencialmente fora do limite e variáveis declaradas sem inicialização. O gerador de casos de borda escolhe exemplos predefinidos para o tópico.

Isso é uma análise heurística de texto. O sistema não compila, executa, corrige nem entende semanticamente o programa. Ausência de alertas não quer dizer que o código está correto.

### 10.4 Variações e padrões

O estudante pode escolher um problema de origem, uma técnica e o eixo que deseja transformar: restrições, entrada/saída ou contexto. Os modelos cobrem busca binária, programação dinâmica, grafos e estruturas de dados/STL.

A dificuldade é ajustada com base nas sessões recentes daquela técnica: sucesso independente tende a propor desafio maior; pouca evidência tende a sugerir prática guiada. Variações podem ser salvas em um banco local e reutilizadas.

O exercício de reconhecimento pede que o aluno identifique a técnica que liga a variação ao problema-base. Os enunciados são formados a partir de modelos e opções pré-escritas; não são gerados por um modelo de linguagem.

### 10.5 Banca e entrevista

A pessoa descreve sua abordagem em texto e recebe um comentário sobre três aspectos: se mencionou passos da estratégia, complexidade e casos-limite. A resposta e o feedback são mantidos no histórico local.

O sistema procura palavras-chave. Não verifica se a explicação é logicamente correta, não executa a solução e não substitui a avaliação de um professor ou de um juiz.

### 10.6 Trilha de uso estratégico

A trilha exibe cinco etapas: entender o conceito, resolver sem IA, consultar uma pista, comparar estratégias e refazer sem ajuda. Conceito e refação podem ser marcados manualmente; consulta e comparação se relacionam a ações registradas. As sessões resolvidas sem IA também determinam os níveis de ajuda liberados: a cada duas vitórias independentes, o nível máximo aumenta, até o quarto nível.

Se houver várias consultas, a interface recomenda revisar a teoria e formular uma hipótese antes de pedir outra pista. O estado das etapas fica no armazenamento local.

### 10.7 Uso responsável e autonomia

Antes de uma sessão assistida, o aluno confirma que tentou entender a tarefa e quer uma pista, não uma solução pronta. Depois, um checklist registra se tentou resolver sozinho, entendeu a explicação e usou a ferramenta para refletir.

O painel permite definir uma meta semanal de problemas resolvidos sem IA. A contagem considera vitórias independentes registradas nos últimos sete dias. A taxa de autonomia é calculada a partir de rodadas registradas, contando como independente apenas uma rodada resolvida sem dicas.

Esses indicadores são ferramentas de autorreflexão; não são medidas clínicas, notas oficiais nem prova de autoria.

### 10.8 Relatórios e diário

O relatório lista sessões pareadas com data, técnica, tempo, tentativas, acertos e dicas. Um gráfico resume as dicas da rodada assistida em cada sessão. O diário permite anotar aprendizados e erros para rever depois.

O botão de exportação cria um CSV com dados das sessões e reflexões. Os dados ficam no perfil local até que a pessoa exporte; não são automaticamente enviados a um professor.

### 10.9 Professor e minicurso

O professor pode definir título e tópico e criar uma sala com código. Um estudante pode tentar entrar com o código e um apelido. Quando Firebase e regras de acesso estão configurados, métricas de dicas, sessões e tópicos podem ser sincronizadas e visualizadas por apelido.

O painel inclui perguntas para discussão em grupo e exporta resultados anonimizados em CSV. Sem Firebase, a sessão é local e não conecta dispositivos diferentes. O compartilhamento depende de configuração de backend e permissões do Firestore; não é uma sala pública aberta.

### 10.10 Juízes externos

O estudante pode registrar um link HTTPS permitido de Codeforces, Beecrowd ou OBI. O histórico unificado guarda problema, origem e veredito.

Para Codeforces, é possível informar um handle público e buscar até 100 submissões recentes para o problema importado por meio da API pública. Beecrowd e OBI permanecem no site oficial: abrir o problema e registrar o veredito são ações manuais.

O OBI Quest não recolhe senha, não faz login e não envia o código para os juízes externos. Essa área organiza o acompanhamento, não substitui as plataformas oficiais.

## 11. Perfil, pontuação e som

O perfil de nome e avatar é usado em algumas telas e na criação de sala. A área inicial mostra uma pontuação de usuário quando ela está disponível no Firebase e recordes locais de sala.

A música e os sons são produzidos pela Web Audio API. O controle de áudio habilita ou silencia o mecanismo procedural; ele não reproduz uma trilha musical baixada.

O fundo com dígitos binários é decorativo. Não representa dados, código executado, velocidade ou resultado do usuário.

## 12. Como os dados são guardados

### No navegador ou aplicativo

O `localStorage` guarda dados ligados à instalação/origem atual. Entre eles estão nome, avatar, recordes, checklist inicial e a chave `obi-quest-pedagogy`, que reúne sessões, diário, favoritos, variações, histórico da mentoria e registros externos.

Esses dados não migram automaticamente do navegador para o app Windows ou Android: cada instalação tem seu próprio armazenamento. A opção exportar CSV/TXT permite levar alguns registros manualmente.

### No Firebase, quando configurado

A configuração Firebase é fornecida pelo ambiente por `__firebase_config`; o identificador do app vem de `__app_id`. Sem esses valores, autenticação e Firestore não são inicializados.

Com Firebase, a aplicação tenta login anônimo e observa dados de usuário e salas. Os caminhos principais são `artifacts/{appId}/users/{uid}` para progresso e `artifacts/{appId}/rooms/{codigo}` para salas de competição. As salas de minicurso ficam em `artifacts/{appId}/classrooms/{codigo}`.

Uma conta anônima não equivale a uma conta institucional com identidade verificada. A sincronização só funciona se o Firebase e as regras de segurança do projeto permitirem as operações.

## 13. Como o software está organizado

- `src/App.jsx` concentra telas, estados, dados de exercícios e a maioria das regras de interação.
- `src/main.jsx` cria a raiz React e monta `App`.
- `src/styles.css` fornece estilos gerais; a maior parte do layout usa classes Tailwind.
- `index.html` é o ponto de entrada do Vite e define o viewport para dispositivos móveis.
- `vite.config.js` configura React, Tailwind e caminhos relativos para a mesma build poder ser carregada em web, WebView e Electron.
- `capacitor.config.json` define o identificador Android e a pasta `dist` usada pelo Capacitor.
- `android/` contém o projeto Gradle nativo gerado pelo Capacitor.
- `electron/main.cjs` abre a janela Windows com sandbox e isolamento de contexto; links HTTPS são encaminhados ao navegador externo.
- `scripts/package-windows.cjs` cria a pasta portátil Electron e o arquivo `app.asar`.
- `electron-builder`, configurado em `package.json`, prepara o instalador assistido NSIS para Windows.

## 14. Formas de executar e empacotar

### Web

`npm install` instala dependências. `npm run dev` inicia o servidor Vite, `npm run build` cria `dist` e `npm run preview` serve o build para revisão.

As abas compartilham a mesma tela rolável, e ao trocar de destino a visualização volta ao início. Esse comportamento foi corrigido no build usado pelos pacotes abaixo.

### Android

`npm run android:sync` cria a build web e sincroniza os arquivos com o projeto nativo. `npm run android:open` abre o projeto no Android Studio. `npm run android:apk` tenta gerar o APK de depuração.

É necessário ter Android Studio, Android SDK e Java/JDK compatível com o Gradle instalado e configurado. Foi gerado o APK Android 1.4.2 (`versionCode` 8), assinado com a chave de depuração do Android. Ele está em `installers/android/OBI-Quest-1.4.2-android.apk` na branch `app-mobile` ([baixar APK](https://github.com/DiamondDust01/obi-quest/blob/app-mobile/installers/android/OBI-Quest-1.4.2-android.apk)). Transfira o arquivo ao aparelho e abra-o para instalar; talvez seja necessário autorizar a instalação por essa origem. É uma versão de teste, não assinada para publicação na Play Store, e não foi validada em um aparelho físico nesta rodada.

### Windows

`npm run app:windows` compila o web app e abre o shell Electron. `npm run app:windows:package` gera uma pasta portátil para Windows. O executável e todos os recursos devem permanecer juntos; copiar apenas `OBI Quest.exe` não funciona. Para compilar um instalador assistido NSIS x64, o projeto também oferece `npm run app:windows:installer`.

O pacote portátil Windows x64 1.4.2 foi validado e está em `installers/windows/OBI-Quest-1.4.2-Windows-x64.7z` na branch `app-pc` (cerca de 94 MiB; [baixar pacote Windows](https://github.com/DiamondDust01/obi-quest/blob/app-pc/installers/windows/OBI-Quest-1.4.2-Windows-x64.7z)). Extraia com 7-Zip ou NanaZip e abra `OBI Quest.exe` na pasta extraída. O app e o instalador não têm assinatura digital; além de avisos do Windows, políticas de Controle de Aplicativos podem bloquear a execução. A geração do Setup.exe está configurada, mas não foi concluída neste ambiente devido ao bloqueio da política de segurança sobre um auxiliar do empacotador.

As branches `app-mobile` e `app-pc` mantêm, respectivamente, esses pacotes prontos para download; os arquivos de instalação não ficam na `main`.

## 15. Roteiro de demonstração de sete minutos

### Minuto 0 a 1: contexto

Explique que a aplicação é um simulador de treino inspirado na OBI, não uma plataforma oficial. Mostre a página inicial e as áreas principais.

### Minuto 1 a 2: Iniciação

Escolha uma faixa, explique o filtro de dificuldade e mostre o cronômetro. Inicie a rodada, responda uma questão e compare o feedback com a opção de ocultar a correção imediata.

### Minuto 2 a 4: Programação

Abra um desafio, explique o objetivo e troque entre C++ e Python. Mostre o editor e faça uma submissão simples com cronômetro ativo. Ao receber feedback, deixe explícito que a validação atual é simulada e baseada em padrões de texto.

### Minuto 4 a 5: comparação pedagógica

Abra Mentoria → Sem IA × com IA. Comece sem ajuda, resolva o primeiro problema gêmeo, encerre a rodada, confirme o checklist e use uma pista na segunda etapa. Mostre tempo, tentativas e a reflexão.

### Minuto 5 a 6: depuração e variações

Mostre como um veredito gera perguntas e casos-limite. Depois escolha uma técnica e um eixo para criar e salvar uma variação.

### Minuto 6 a 7: evolução e limites

Mostre relatório, diário ou painel docente. Encerre explicando o que depende de Firebase e o que ainda é local ou simulado.

Se houver pouco tempo, priorize Iniciação, um desafio de Programação e a comparação sem/com apoio.

## 16. Perguntas que podem surgir

### “É a aplicação oficial da OBI?”

Não. É um projeto educacional inspirado nas modalidades e no formato de treino. Para regras e informações oficiais, consulte os canais da OBI.

### “A aplicação compila o código?”

Não nesta versão. O juiz é uma simulação local que procura estruturas textuais associadas ao exercício. Ele não compila nem executa as submissões.

### “A mentoria usa ChatGPT ou outro modelo?”

Não. As respostas são selecionadas por regras e textos predefinidos dentro do app. Não há uma chamada a serviço de IA generativa e o código colado na depuração não é enviado a um modelo.

### “A IA pode entregar a resposta?”

A intenção da mentoria é não solucionar: ela oferece perguntas, conceitos, analogias e roteiros parciais. Há bloqueio por frases conhecidas, mas como a implementação é local e baseada em padrões, não deve ser apresentada como sistema infalível de segurança.

### “Posso competir com outra pessoa?”

Sim, se o Firebase estiver configurado e as regras do Firestore permitirem. Sem isso, é possível demonstrar uma sala local, mas não sincronizar jogadores em dispositivos separados.

### “Os dados ficam na nuvem?”

A maior parte dos registros pedagógicos fica no armazenamento local. Algumas informações de usuário e sala podem ir para Firestore quando Firebase está configurado. O histórico local não sincroniza automaticamente entre web, Windows e Android.

### “O histórico de juízes externos envia meu código?”

Não. Ele registra links e pode consultar submissões públicas do Codeforces. Login e envio de código continuam nos sites oficiais. OBI e Beecrowd têm vereditos registrados manualmente.

### “O APK já está pronto?”

Sim. Há um APK de depuração Android 1.4.2, assinado com chave de depuração, em `installers/android/OBI-Quest-1.4.2-android.apk` na branch `app-mobile` ([baixar APK](https://github.com/DiamondDust01/obi-quest/blob/app-mobile/installers/android/OBI-Quest-1.4.2-android.apk)). Ele pode ser instalado para teste, mas não é um pacote de publicação da Play Store e ainda não foi testado em aparelho físico.

### “Como instalo no Windows?”

O pacote disponível é portátil, não um Setup.exe: baixe o arquivo `.7z` da branch `app-pc` ([baixar pacote](https://github.com/DiamondDust01/obi-quest/blob/app-pc/installers/windows/OBI-Quest-1.4.2-Windows-x64.7z)), extraia com 7-Zip ou NanaZip e execute `OBI Quest.exe`. Mantenha todos os arquivos extraídos juntos. O projeto tem um comando para gerar um instalador NSIS, mas esse Setup ainda não foi publicado.

## 17. O que não afirmar durante a apresentação

- Não diga que o código foi compilado ou testado em casos reais pelo juiz local.
- Não chame o mentor de modelo de IA conectado à internet.
- Não prometa multiplayer quando Firebase não estiver configurado.
- Não diga que os registros locais aparecem automaticamente em outro dispositivo.
- Não apresente o ranking como classificação oficial da OBI.
- Não afirme que importar um problema envia uma submissão ao Codeforces, Beecrowd ou OBI.
- Não chame o pacote Windows portátil de Setup.exe ou instalador.
- Não apresente o APK de depuração como versão pronta para Play Store ou como testado em aparelho físico.

## 18. Glossário para apresentação

- **Iniciação:** modalidade de questões objetivas com foco em lógica e raciocínio.
- **Programação:** modalidade de desafios em que a pessoa escreve código.
- **Accepted (AC):** resultado positivo. No juiz local do OBI Quest, significa que a verificação textual prevista passou.
- **Wrong Answer (WA):** resultado incorreto segundo o juiz; na simulação, o padrão textual esperado não foi encontrado.
- **Runtime Error (RE):** erro durante a execução de um programa em um juiz real; o OBI Quest apenas explica o significado do veredito.
- **Time Limit Exceeded (TLE):** execução além do tempo permitido em um juiz real.
- **Firestore:** banco de dados Firebase usado para sincronizar alguns dados quando configurado.
- **localStorage:** armazenamento do navegador ou WebView restrito àquela instalação/origem.
- **WebView:** janela nativa que exibe a aplicação web dentro do Android.
- **Electron:** runtime que permite empacotar a aplicação web como programa de desktop.
- **ASAR:** arquivo que agrupa o código e os assets da aplicação Electron.
- **Build:** arquivos finais gerados para executar ou distribuir a aplicação.

## 19. Referência rápida para o apresentador

**Mensagem central:** treinar raciocínio, código e autonomia em uma experiência organizada.

**Demonstração mais forte:** resolver uma etapa sem ajuda, pedir uma pista limitada na etapa equivalente e refletir sobre a diferença.

**Limite técnico mais importante:** o juiz de Programação e a mentoria são simulações locais, não serviços de execução de código ou modelos generativos.

**Dependência mais importante:** salas entre dispositivos e sincronização dependem de Firebase configurado; APK depende de JDK e Android SDK.
