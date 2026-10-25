// Tutor local do Pensa Comigo (regras fixas, sem IA generativa).
// Ordem obrigatória no modo ativo: tentativa → dica 1 → dica 2 → dica 3 → explicação.
// O "modo copiar" do experimento é o mesmo item com essas regras desligadas: a resposta
// e a explicação aparecem logo de início.

export const MAX_HINTS = 3;
export const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const createTutorState = () => ({
  attempts: [],
  hintsShown: 0,
  explanationShown: false,
  solved: false
});

// Registra uma tentativa. `choice` é o índice da alternativa (opcional) e `text`, a
// tentativa escrita (opcional). Só a escolha decide se acertou; o texto nunca sai daqui.
// `correct` (opcional) vem de fora quando a correção não é por alternativa
// (resposta curta ou código no "Escolha seu desafio").
export const registerAttempt = (state, { choice = null, text = '', correct: explicitCorrect = null } = {}, item = null) => {
  const hasChoice = Number.isInteger(choice) && choice >= 0;
  const hasText = String(text || '').trim().length >= 3;
  if (!hasChoice && !hasText) return { state, accepted: false, correct: null };
  if (state.solved || state.explanationShown) return { state, accepted: false, correct: null };
  let correct = null;
  if (typeof explicitCorrect === 'boolean') correct = explicitCorrect;
  else if (hasChoice && item) correct = choice === item.correct;
  const nextState = {
    ...state,
    attempts: [...state.attempts, { choice: hasChoice ? choice : null, wrote: hasText }],
    solved: state.solved || correct === true
  };
  return { state: nextState, accepted: true, correct };
};

export const hasAttempted = (state) => state.attempts.length > 0;

export const canShowHint = (state) => hasAttempted(state) && !state.solved && !state.explanationShown && state.hintsShown < MAX_HINTS;

export const showHint = (state) => (canShowHint(state) ? { ...state, hintsShown: state.hintsShown + 1 } : state);

export const canShowExplanation = (state) => hasAttempted(state) && (state.solved || state.hintsShown >= MAX_HINTS);

export const showExplanation = (state) => (canShowExplanation(state) ? { ...state, explanationShown: true } : state);

export const isFinished = (state) => state.solved || state.explanationShown;

// Mensagem do tutor para o próximo passo, em linguagem para 11 a 14 anos.
export const tutorMessage = (state) => {
  if (!hasAttempted(state)) return 'Antes de qualquer dica, mostre como você pensou: escolha uma alternativa ou escreva sua ideia.';
  if (state.solved) return 'Você chegou lá! Explique para você mesmo por que essa é a resposta. Depois confira no caderno ou no livro.';
  if (state.explanationShown) return 'Leia a explicação com calma e refaça a conta no caderno, sem olhar.';
  if (state.hintsShown >= MAX_HINTS) return 'Você já viu as três dicas. Tente mais uma vez ou abra a explicação.';
  const last = state.attempts[state.attempts.length - 1];
  if (last?.choice === null) return 'Boa, você escreveu sua ideia. Agora escolha uma alternativa ou peça a primeira dica.';
  return 'Ainda não. Que tal uma dica? Ela não entrega a resposta.';
};

export const formatOption = (item, index) => `${OPTION_LETTERS[index]}) ${item.options[index]}`;

export const copyModeAnswer = (item) => ({
  answerIndex: item.correct,
  answerText: `A resposta é ${formatOption(item, item.correct)}.`,
  explanation: item.explanation
});

// Resultado gravado por item (sem texto livre).
export const summarizeTutorItem = (state, mode) => ({
  mode,
  correct: state.solved,
  attempts: state.attempts.length,
  hints: state.hintsShown,
  sawExplanation: state.explanationShown
});
