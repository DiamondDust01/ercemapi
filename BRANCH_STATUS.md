# Organização das branches

## Branches ativas

- `main`: versão integrada e completa do produto, incluindo os fontes web e as
  configurações de empacotamento Android e Windows.
- `test`: integração e validação antes de atualizar `main`.
- `app-mobile`: trabalho de distribuição Android. Contém a árvore completa do
  projeto, inclusive os fontes comuns necessários para gerar o APK.
- `app-pc`: trabalho de distribuição Windows/Electron. Também contém a árvore
  completa necessária para compilar o aplicativo.

As branches de plataforma não são cópias com fontes removidos: builds Android e
Windows precisam dos mesmos arquivos React/Vite, dependências e recursos. As
pastas específicas são `android/` e `electron/`, com os comandos documentados no
`README.md`.

## Fluxo de integração

1. Desenvolver e validar alterações em `test`.
2. Integrar as alterações verificadas em `main`.
3. Atualizar `app-mobile` e `app-pc` a partir de `main` antes de tarefas de
   distribuição específicas.
4. Integrar correções feitas nas branches de plataforma de volta a `test` e
   `main`; não manter funcionalidades exclusivas sem revisão.

## Consolidação

A antiga `feature/variacao-projeto` continha a implementação mais completa do
aplicativo e foi integrada em `main`. As alterações de `prototype` já estavam na
ancestralidade dessa implementação. `feature/ia-mentora` não continha handlers
exclusivos; seu commit adicional era de documentação, substituída pela versão
atualizada que está em `main`. Depois de publicar e verificar `main`, `test`,
`app-mobile` e `app-pc`, as branches antigas foram retiradas para manter apenas
as quatro branches planejadas.
