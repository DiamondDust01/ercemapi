# Relatório da adaptação — OBI Quest 1.5.0 com o modo Pensa Comigo

Desenvolvido na branch `feat/pensa-comigo`, a partir de `main` (642315f), e
integrado em `test` e `main`. As branches `app-mobile` e `app-pc` receberam a
`main` e os pacotes 1.5.0. Nada foi enviado ao GitHub.

## 1. Diagnóstico: Parte II × código real

A Parte II confere com o código na maior parte. Divergências encontradas:

| # | Onde | O que a Parte II diz | O que o código tinha | Tratamento |
|---|---|---|---|---|
| 1 | `src/App.jsx`, banco de Iniciação | Apêndice A.1 já corrigido | Questões 110, 112, 122 e 123 com gabarito errado | Corrigido (D11) |
| 2 | Desafio 7, `validate` C++ | Aceitar `"\n"` e `'\n'` | Só `"\n"` | Corrigido (D11) |
| 3 | Tela inicial | Texto fiel ao banco | "10 + 10 / Questões por faixa" | "Até 10 · 12 no banco por faixa" |
| 4 | `README.md` | §12 item 7 | Citava `npm run app:windows:installer`, que só existe na `app-pc` | README da `main` passa a apontar para a `app-pc` |
| 5 | `requirements.txt` | §12 item 8 | firebase 11 e vite 5 | Alinhado ao `package.json` |
| 6 | `createClassroom` | Código de 6 caracteres | `Math.random().toString(36).slice(2, 8)` pode gerar menos de 6 | Mantido no Professor; o Pensa Comigo usa gerador próprio de 6 caracteres |
| 7 | Repositório | "configure regras Firestore" | Não havia `firestore.rules` nem `firebase.json` | Criados (D4, D13) |
| 8 | `CHANGELOG.md` | Histórico em ordem | 1.4.0 aparece antes de 1.4.2 | Mantido como está |
| 9 | `docs/README.md` | Lista 01 a 05 | Não lista o 05; o arquivo 05 está fora do Git | Não mexi no 05; 06 adicionado à lista |
| 10 | `index.html` | — | Sem ícone; o navegador pede `favicon.ico` e recebe 404 | Mantido (anterior à adaptação) |

## 2. Matriz de adaptação

| Decisão | Ação | Como ficou |
|---|---|---|
| D1 IA Mentora × tutor ao vivo | Adapta | Tutor local por padrão. `VITE_ENABLE_LLM_TUTOR` desligada. O texto de honestidade vem de `resolveTutorEngine` e muda conforme o motor. Sem backend, a flag ligada continua local e a interface avisa. |
| D2 Nome livre | Adapta só no modo | Apelido sorteado (animal + adjetivo, com concordância) e "Sortear outro". O app só aceita apelidos do sorteio. Professor e perfil não mudaram. |
| D3 Salas de 16 e P2P | Mantém | `competitionRooms.js` e `MAX_ROOM_PLAYERS` intocados. O modo usa só `onSnapshot`. |
| D4 Mapa de participantes | Mantém para o Professor | Dados novos em `pensaComigo/state` e `pensaComigoParticipants/{uid}`. Regras novas testadas no emulador. |
| D5 Mentor recusa solução | Reposiciona | "Modo copiar" só dentro do experimento, rotulado. Mentor e Oficina continuam recusando. |
| D6 Cronômetro obrigatório | Mantém na Iniciação | No modo, as etapas do palestrante substituem o cronômetro. No "Escolha seu desafio", o cronômetro é opcional. |
| D7 localStorage | Adapta só no modo | Tudo do modo em `sessionStorage` com prefixo `obi-quest-pensa-comigo:`. "Encerrar neste aparelho" apaga as chaves. Testado: zero chaves do modo em `localStorage`. |
| D8 Juízes externos | Mantém | Fora da tela do aluno no modo. |
| D9 Identidade escura | Mantém | Telão com tipografia ampliada e contraste reforçado; tema claro opcional. |
| D10 Barra com 5 itens | Mantém | A barra do OBI Quest segue com 5 itens. Por pedido do autor, o app abre numa tela de escolha entre OBI Quest e Pensa Comigo; o Pensa Comigo virou variação com casca própria. Também há entrada pelo Início, pelo Professor e por `?sala=`. |
| D11 Inconsistências | Corrige | Itens 1 a 8 tratados (tabela acima). |
| D12 Backend para LLM | Não criado | Cloud Functions exigem o plano Blaze, pago por uso. Sem backend, a flag fica sem efeito. |
| D13 QR | Cria | QR local com `qrcode-generator`. `?sala=` abre o modo. `firebase.json` hospeda o `dist/`. `VITE_PUBLIC_APP_URL` define o link. |

Conflitos adicionais encontrados:

| Conflito | Critério | Ação | Motivo |
|---|---|---|---|
| Itens sugeridos para o experimento (110, 112, 123) são os mesmos do Detetive | (e) | Adapta | O Detetive mostra a correção desses itens e vazaria o quiz. O experimento usa itens disjuntos; as perguntas parecidas são novas e marcadas para revisão. |
| "Escolha seu desafio" contém itens do quiz | (e) | Adapta | Esses itens só aparecem no menu depois da etapa Resultado. |
| Linguagem técnica do `PRE_AI_CHECKLIST` e do checklist de Uso responsável | (c) | Adapta | Versões para 11 a 14 anos, ligadas ao texto original no código. |
| Login anônimo do Firebase guarda o uid no IndexedDB | (b) | Mantém | O uid não é dado pessoal e já era assim no app. |
| Telão dentro do `<main>` ficava sob o cabeçalho | — | Adapta | Telão renderizado em portal no `body`. |

Nada foi ocultado ou removido do OBI Quest 1.4.2.

Módulos:

| Parte | Marcação | Base reaproveitada |
|---|---|---|
| M1 Sala e telão | Estende + cria | Turmas do Professor, autenticação anônima, CSV anonimizado, padrão de demonstração local |
| M2 Missões | Estende + cria | `PRE_AI_CHECKLIST`, níveis do mentor, `IA_PROMPT_LIBRARY`, regex de recusa do mentor, feedback por palavras-chave da Banca, versões originais das questões com erro |
| M3 Experimento | Estende + cria | Estrutura da sessão "Sem IA × com IA", correção oculta da Iniciação, padrão de CSV |
| M4 Tutor | Estende | Níveis 1 a 3 do mentor viram as dicas; o campo `explanation` vira a explicação |
| M5 Escola real | Cria | Modo em duplas, modo sem celular, kit impresso, checklist e roteiro do palestrante |

## 3. Inventário de conteúdo ("Escolha seu desafio" e missões)

| Fonte | Total | Aproveitado | Liberado | Avançado | Oculto | Observação |
|---|---|---|---|---|---|---|
| A.1 Iniciação | 24 | 24 | 24 | 0 | 0 | 8 ficam fora do menu até o Resultado; 4 originais com erro alimentam o Detetive |
| A.2 Pares gêmeos | 8 | 8 | 0 | 6 | 2 | Contagem de repetidos entrou como avançado por usar só listas pequenas |
| Programação | 10 | 10 | 0 | 3 | 7 | Desafios 1 a 3 avançados |
| A.4 Respostas do mentor | 5 tópicos | 4 | — | — | — | Viram as três dicas dos pares; Python não usado |
| A.5 Biblioteca de prompts | 9 | 3 | — | — | — | Exemplos no Remix; o resto segue na Oficina |
| A.7 Casos de borda | 4 tópicos | 4 | — | — | — | Viram perguntas de checagem dos pares |
| A.8 Templates | 4 | 4 | 0 | 2 | 2 | Itens de reflexão |

Marcado "gerado — revisar" (precisa de revisão humana antes de ir para alunos):

- 3 dicas para cada um dos 24 itens de Iniciação e dos 4 itens novos.
- 4 itens novos: duas perguntas parecidas do quiz e duas de checagem.
- 3 dicas para cada um dos 10 desafios de Programação.
- 8 explicações dos pares gêmeos.
- 1 caso novo do Detetive (horário de viagem).
- Textos adaptados: checklist antes da dica, desafio da semana, pedidos do Remix.

## 4. Itens [NOVO]

| Item | Prioridade | Justificativa |
|---|---|---|
| Tela inicial de escolha entre OBI Quest e Pensa Comigo | Essencial | Pedido do autor: o Pensa Comigo como variação, não como submodo |
| Código de retorno com verificador que guarda o grupo | Essencial | Liga o re-teste ao grupo sem dado pessoal nem consulta |
| Retomar sala pelo código | Essencial | Permite o re-teste dias depois no mesmo aparelho do palestrante |
| Caso de controle correto no Detetive | Desejável | Evita que "sempre tem erro" vire regra |
| Gabarito e "o que não afirmar" no painel | Desejável | Apoio ao palestrante |
| Turma simulada para ensaio | Desejável | Ensaiar o telão. Só na demonstração local, com chances iguais nos dois modos e aviso no telão |
| Tema claro do telão | Opcional | Previsto no D9 |
| "Ensaiar como aluno nesta aba" | Opcional | Só na demonstração local |
| Emuladores do Firebase em `npm run dev` | Opcional | Testar a sala com dezenas de aparelhos sem tocar em produção |

## 5. Como testar

```bash
npm test       # 59 testes, 41 novos
npm run build
```

Verificações feitas nesta rodada, fora do repositório:

- Fluxo completo em Edge a 360 px, sem Firebase: entrada por `?sala=`, apelido,
  dupla, enquete, Tente primeiro, Remix, experimento nos dois modos, quiz,
  resultado no telão, código de retorno e "Encerrar neste aparelho".
- 30 aparelhos contra os emuladores de Auth e Firestore: grupos 15 × 15, todos os
  votos no telão e troca de etapa em todos os aparelhos em cerca de 0,1 a 0,2 s.
- 22 verificações das regras no emulador, incluindo Professor, salas e
  `peerSignals`.

Para repetir a sala real: configure `VITE_FIREBASE_CONFIG`, publique as regras,
abra a sala num computador e entre por dois celulares.

## 6. Riscos e pendências

- **Revisão de conteúdo:** o conteúdo marcado precisa de revisão humana.
- **Tutor generativo:** não implementado, por falta de backend (D12).
- **Regras do Firestore:** são uma sugestão. Compare com as regras já publicadas
  no seu projeto antes de substituí-las.
- **Hospedagem:** não publiquei nada. O QR nos celulares depende de publicar o
  `dist/` e compilar com `VITE_PUBLIC_APP_URL`.
- **Pacotes:** o APK 1.5.0 foi compilado e conferido com o `aapt`, mas não foi
  instalado num aparelho. O pacote portátil do Windows abriu num teste
  automatizado. O Setup 1.5.0 foi compilado, mas não foi executado. O download
  do kit impresso no WebView do Android não foi testado.
- **Offline:** o Firestore guarda escritas sem rede só enquanto a página está
  aberta. Fechar a aba descarta o progresso do aluno, como pede o D7.
- **Código de retorno:** um erro de digitação tem chance pequena de cair no outro
  grupo em vez de ser recusado.
- **Leis:** as menções à Lei 15.100/2025 e à LGPD são lembretes, não orientação
  jurídica.

## 7. Como reverter

- Tudo está na branch `feat/pensa-comigo`. Voltar para `main` desfaz a adaptação.
- Para tirar só o modo: em `App.jsx`, remova a tela de escolha e o retorno
  `appMode === 'pensa'`, o cartão no Início e o botão na seção Professor; depois
  apague `src/pensaComigo/`, `src/ModeSelector.jsx` e `src/appMode.js`.
- A extração para `src/content/obiContent.js` não muda comportamento e pode
  ficar.
- Nenhuma chave de `localStorage` nem caminho existente do Firestore mudou. Os
  dados do modo ficam em subcoleções novas, que podem ser apagadas sem afetar
  as turmas do Professor.
