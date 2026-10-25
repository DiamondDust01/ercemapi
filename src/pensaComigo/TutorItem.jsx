import React, { useState } from 'react';
import { MENTOR_LEVELS } from '../content/obiContent.js';
import {
  createTutorState, registerAttempt, canShowHint, showHint, canShowExplanation, showExplanation,
  isFinished, tutorMessage, copyModeAnswer, summarizeTutorItem, OPTION_LETTERS, MAX_HINTS
} from './tutor.js';
import { KID_PRE_HINT_CHECKLIST, REVIEW_LABEL } from './content.js';
import { checkShortAnswer } from './catalog.js';
import { buttonPrimary, buttonSecondary, inputClass, Notice } from './ui.jsx';

const HINT_LABELS = MENTOR_LEVELS.slice(0, MAX_HINTS).map((level) => level.label);

// Um item conduzido pelo tutor local.
// mode 'ativo': tentativa obrigatória → três dicas → explicação.
// mode 'copiar': condição experimental rotulada; a resposta vem pronta (D5).
export default function TutorItem({ item, mode = 'ativo', onDone, requireChecklist = false, doneLabel = 'Continuar', showReviewTag = false }) {
  const [state, setState] = useState(createTutorState);
  const [selected, setSelected] = useState(null);
  const [attemptText, setAttemptText] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [code, setCode] = useState(item.initialCode || '');
  const [feedback, setFeedback] = useState('');
  const [checklist, setChecklist] = useState(KID_PRE_HINT_CHECKLIST.map(() => !requireChecklist));
  const isCopy = mode === 'copiar';
  const ready = isCopy ? copyModeAnswer(item) : null;
  const finished = isFinished(state);
  const checklistOk = checklist.every(Boolean);

  const choose = (index) => {
    if (finished) return;
    const result = registerAttempt(state, { choice: index }, item);
    if (!result.accepted) return;
    setSelected(index);
    setState(result.state);
    if (isCopy) setFeedback(result.correct ? 'Você copiou a resposta pronta.' : 'Essa não é a resposta que a "IA" deu. Confira de novo.');
    else setFeedback(result.correct ? 'Isso! Você acertou.' : `A alternativa ${OPTION_LETTERS[index]} não é a resposta. Tente de novo ou peça uma dica.`);
  };

  const submitText = () => {
    let explicit = null;
    let text = attemptText;
    if (item.type === 'resposta-curta') explicit = checkShortAnswer(item, attemptText);
    if (item.type === 'codigo') {
      text = code;
      try {
        explicit = Boolean(item.validate?.(code, codeLanguage === 'cpp' ? 'cpp' : 'python')?.ok);
      } catch {
        explicit = false;
      }
    }
    const result = registerAttempt(state, { text, correct: explicit }, item);
    if (!result.accepted) {
      setFeedback('Escreva um pouco mais sobre como você pensou.');
      return;
    }
    setState(result.state);
    if (result.correct === true) setFeedback('Isso! Você acertou.');
    else if (result.correct === false) setFeedback('Ainda não. Revise sua ideia ou peça uma dica.');
    else setFeedback('Tentativa registrada. Ela fica só neste aparelho.');
    setAttemptText('');
  };

  const hints = item.hints || [];
  const hasOptions = Array.isArray(item.options) && item.options.length > 0;
  const textAttemptAllowed = !isCopy && item.type !== 'codigo';

  return (
    <article className="space-y-4">
      <header>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-widest text-violet-300">
          <span>{item.title}</span>
          {item.generated && showReviewTag && <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-200">{REVIEW_LABEL}</span>}
        </div>
        <p className="mt-2 text-lg leading-relaxed text-white sm:text-xl">{item.statement}</p>
      </header>

      {isCopy && (
        <div className="rounded-xl border-2 border-fuchsia-500/60 bg-fuchsia-500/10 p-4">
          <div className="text-xs font-bold uppercase tracking-widest text-fuchsia-200">Modo copiar · resposta pronta da "IA"</div>
          <p className="mt-2 text-lg font-bold text-white">{ready.answerText}</p>
          <p className="mt-1 text-sm text-fuchsia-100">{ready.explanation}</p>
        </div>
      )}

      {hasOptions && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="Alternativas">
          {item.options.map((option, index) => {
            const chosen = selected === index;
            const showCorrect = finished && index === item.correct;
            const tone = showCorrect
              ? 'border-emerald-400 bg-emerald-500/15 text-emerald-50'
              : chosen ? 'border-rose-400 bg-rose-500/10 text-rose-50' : 'border-slate-700 bg-slate-950 text-slate-100 hover:border-violet-400';
            return (
              <button key={option} type="button" disabled={finished} onClick={() => choose(index)} aria-pressed={chosen} className={`min-h-12 rounded-xl border px-4 py-3 text-left font-mono text-base transition disabled:cursor-default ${tone}`}>
                <span className="mr-1 font-bold">{OPTION_LETTERS[index]})</span>{' '}{option}
              </button>
            );
          })}
        </div>
      )}

      {item.type === 'codigo' && !finished && (
        <div className="space-y-2">
          <div className="flex gap-2" role="group" aria-label="Linguagem">
            {['python', 'cpp'].map((language) => (
              <button key={language} type="button" aria-pressed={codeLanguage === language} onClick={() => setCodeLanguage(language)} className={`${buttonSecondary} ${codeLanguage === language ? 'border-violet-400 text-violet-200' : ''}`}>{language === 'cpp' ? 'C++' : 'Python'}</button>
            ))}
          </div>
          <textarea value={code} onChange={(event) => setCode(event.target.value)} rows={6} spellCheck={false} aria-label="Seu código" className={`${inputClass} font-mono text-sm text-emerald-200`} />
          <button type="button" onClick={submitText} className={buttonPrimary}>Verificar minha tentativa</button>
          <p className="text-xs text-slate-500">A verificação procura padrões no texto do código; ela não executa o programa.</p>
        </div>
      )}

      {textAttemptAllowed && !finished && (
        <div className="space-y-2">
          <label className="block text-sm text-slate-300">
            {item.type === 'resposta-curta' ? 'Sua resposta' : item.type === 'reflexao' ? 'Seu plano (que passos você faria?)' : 'Ou escreva como você pensou'}
            <textarea value={attemptText} onChange={(event) => setAttemptText(event.target.value)} rows={2} className={`${inputClass} mt-1`} placeholder="Fica só neste aparelho. Não escreva seu nome." />
          </label>
          <button type="button" onClick={submitText} className={buttonSecondary}>Registrar tentativa</button>
        </div>
      )}

      {feedback && <Notice tone={state.solved ? 'success' : 'info'}>{feedback}</Notice>}

      {!isCopy && (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-sm text-violet-100">{tutorMessage(state)}</p>
          {requireChecklist && state.hintsShown === 0 && !finished && (
            <fieldset className="space-y-2">
              <legend className="text-xs font-bold uppercase tracking-widest text-slate-400">Antes da primeira dica</legend>
              {KID_PRE_HINT_CHECKLIST.map((entry, index) => (
                <label key={entry.text} className="flex items-start gap-2 text-sm text-slate-200">
                  <input type="checkbox" className="mt-1 h-4 w-4" checked={checklist[index]} onChange={() => setChecklist((previous) => previous.map((value, position) => (position === index ? !value : value)))} />
                  {entry.text}
                </label>
              ))}
            </fieldset>
          )}
          {state.hintsShown > 0 && (
            <ol className="space-y-2">
              {hints.slice(0, state.hintsShown).map((hint, index) => (
                <li key={hint} className="rounded-lg border-l-4 border-amber-400 bg-amber-500/10 px-3 py-2 text-sm text-amber-50">
                  <span className="block text-xs font-bold uppercase tracking-widest text-amber-300">Dica {index + 1} de {MAX_HINTS} · {HINT_LABELS[index]}</span>
                  {hint}
                </li>
              ))}
            </ol>
          )}
          {!finished && (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setState(showHint(state))} disabled={!canShowHint(state) || !checklistOk || hints.length <= state.hintsShown} className={buttonSecondary}>
                Pedir dica ({state.hintsShown}/{MAX_HINTS})
              </button>
              <button type="button" onClick={() => setState(showExplanation(state))} disabled={!canShowExplanation(state)} className={buttonSecondary}>
                Ver explicação
              </button>
            </div>
          )}
        </div>
      )}

      {finished && !isCopy && (
        <div className="space-y-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-50">
          <p><strong>Explicação:</strong> {item.explanation}</p>
          {item.answer && item.type !== 'multipla-escolha' && <p><strong>Resposta:</strong> {item.answer}</p>}
          {item.checks?.length > 0 && (
            <div>
              <p className="font-bold">Perguntas para checar se você entendeu:</p>
              <ul className="ml-4 list-disc">{item.checks.map((check) => <li key={check}>{check}</li>)}</ul>
            </div>
          )}
          <p>Confira no caderno ou no livro: refaça sem olhar.</p>
        </div>
      )}

      {(finished || (isCopy && state.attempts.length > 0)) && onDone && (
        <button type="button" onClick={() => onDone(summarizeTutorItem(state, mode))} className={buttonPrimary}>{doneLabel}</button>
      )}
    </article>
  );
}
