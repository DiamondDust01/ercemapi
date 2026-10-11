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

### Alterado

- A interface exibe no canto da tela a versão definida em `package.json`.

## 1.0.0 - 2026-10-03

### Adicionado

- Suporte aos aplicativos Android (Capacitor) e Windows (Electron).
- Trilha de mentoria pedagógica e recursos de variação de problemas e relatórios.

### Corrigido

- Dependências e configuração para execução e empacotamento dos aplicativos.
