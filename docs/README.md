# Fontes explicativos para estudo e NotebookLM

Esta pasta contém materiais de apoio do OBI Quest. Os arquivos com extensão
`.ignore` foram escritos como documentos de texto simples em UTF-8 para poderem
ser usados como fontes temáticas no NotebookLM. Apesar da extensão incomum, não
são regras do Git nem arquivos que devam ser executados: são explicações legíveis
por pessoas.

## Ordem recomendada de leitura e importação

1. `01-visao-geral.ignore` — propósito, público, telas e linguagem precisa para
   apresentar o projeto.
2. `02-recursos-e-uso.ignore` — como usar Iniciação, Programação, competição,
   mentoria e ferramentas de aprendizagem.
3. `03-arquitetura-e-dados.ignore` — tecnologias, persistência, Firebase,
   conectividade local e pareamento WebRTC.
4. `04-plataformas-e-limites.ignore` — web, Android, Windows, branches, pacotes,
   instalação e limitações conhecidas.

Os documentos podem ser carregados todos juntos ou individualmente. Para uma
apresentação, comece pelos arquivos 01 e 02; para perguntas técnicas, acrescente
03 e 04. Se o NotebookLM não aceitar a extensão `.ignore`, copie o conteúdo para
um arquivo `.txt` ou cole o texto como fonte.

## Como interpretar as fontes

- São materiais explicativos, não especificações legais da Olimpíada Brasileira
  de Informática nem documentação oficial da OBI.
- Descrevem a versão 1.4.2 do aplicativo e as distribuições preparadas em
  11/10/2026. A versão oficial do código está em `package.json`; alterações
  posteriores podem tornar números, arquivos e estados de publicação obsoletos.
- Os instaladores ficam nas branches `app-mobile` e `app-pc`, não nesta cópia
  de `main`; os links de download estão no README principal e em cada fonte
  temática.
- A seção “limites” de cada tema é deliberada: não transforme simulações locais
  em alegações de compilação real, IA generativa, ranking oficial ou multiplayer
  disponível sem Firebase.
- Para confirmar uma informação que possa mudar, priorize o código e o README
  atual da branch pertinente; use estas fontes para contexto e explicação.
- O guia [`guia_de_estudo_e_apresentacao.md`](guia_de_estudo_e_apresentacao.md)
  oferece uma leitura longa com roteiro de demonstração, perguntas frequentes e
  glossário.
- `descricao_funcoes_e_mecanicas.md` é uma leitura complementar voltada à
  implementação e às funções. Como nomes e detalhes internos podem mudar, use
  o código atual como fonte de verdade para perguntas sobre implementação.
