# Status das branches

Auditoria realizada em 2026-10-11. Este registro compara os ponteiros remotos
observados durante a revisão; os commits de status posteriores não alteram a
comparação funcional.

| Branch remota | Commit observado | Situação em relação a `main` |
| --- | --- | --- |
| `main` | `827f887` | Base |
| `prototype` | `1099c00` | 3 commits à frente |
| `feature/ia-mentora` | `a600c6b` | 6 commits à frente |
| `feature/variacao-projeto` | `ce87e86` | 8 commits à frente; branch ativa |

## Comparação funcional

- As alterações de `prototype` fazem parte da ancestralidade das duas branches
  de funcionalidades, incluindo os ajustes da iniciação e do fluxo de competição.
- `feature/ia-mentora` compartilha a implementação de mentoria, variações e
  acompanhamento pedagógico. Seu commit mais recente, `a600c6b`, adiciona
  documentação, sem código de aplicação exclusivo.
- `feature/variacao-projeto` contém a evolução mais recente da aplicação,
  inclusive a trilha pedagógica, relatórios, suporte a Android e Windows e a
  exibição da versão. A comparação das declarações de funções e callbacks de
  `src/App.jsx` não encontrou funções exclusivas da branch `feature/ia-mentora`;
  a branch ativa contém handlers adicionais.
- Não foi identificada função das outras branches que esteja ausente da
  `feature/variacao-projeto`. Por isso, a versão do app permanece `1.0.0` e não
  foi necessário alterar as notas de versão.

## Validação

- `npm run build`: concluído com sucesso.
- O projeto não define scripts de testes ou lint no `package.json`; as funções
  individuais não têm uma suíte automatizada configurada.
- A branch local `prototype` tem um commit (`07c60ef`) à frente de
  `origin/prototype`; esse commit já está incluído nas branches de funcionalidades.
