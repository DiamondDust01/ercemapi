import React, { useMemo, useState } from 'react';
import { IA_PROMPT_LIBRARY } from '../content/obiContent.js';
import TutorItem from './TutorItem.jsx';
import {
  OPENING_POLL, MISSIONS, REMIX_PROMPTS, REMIX_EXAMPLE, DETECTIVE_CASES, getDetectiveCase, toTutorItem,
  EXPERIMENT_THEMES, THEME_ORDER, QUIZ_ITEMS, CONFIDENCE_LEVELS, MODE_LABELS, WEEKLY_CHALLENGE, getItem
} from './content.js';
import { evaluateRemix, REMIX_CRITERIA } from './remix.js';
import { modeFor, GROUP_LABELS } from './assignment.js';
import { formatReturnCode, parseReturnCode } from './returnCode.js';
import { OPTION_LETTERS } from './tutor.js';
import { buttonPrimary, buttonSecondary, inputClass, Card, Notice } from './ui.jsx';

const Waiting = ({ children }) => (
  <Card><p className="text-lg text-slate-200">{children}</p><p className="mt-2 text-sm text-slate-400">Quando o palestrante avançar, esta tela muda sozinha.</p></Card>
);

const MissionHeader = ({ mission }) => (
  <header className="mb-4">
    <div className="text-xs font-mono uppercase tracking-widest text-green-300">Técnica: {mission.technique}</div>
    <h2 className="mt-1 text-2xl font-black text-white">{mission.title}</h2>
    <p className="mt-1 text-slate-300">{mission.goal}</p>
  </header>
);

// ---------------------------------------------------------------------------
export function PollStage({ record, save }) {
  return (
    <Card>
      <div className="text-xs font-mono uppercase tracking-widest text-green-300">Enquete anônima</div>
      <h2 className="mt-1 text-2xl font-black text-white">{OPENING_POLL.question}</h2>
      <p className="mt-1 text-sm text-slate-400">Ninguém vê o seu voto. O telão mostra só o total da turma.</p>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {OPENING_POLL.options.map((option, index) => (
          <button key={option.id} type="button" aria-pressed={record.poll === option.id} onClick={() => save({ poll: option.id })} className={`min-h-14 rounded-xl border px-4 py-3 text-left text-lg font-semibold transition ${record.poll === option.id ? 'border-green-300 bg-green-500/20 text-white' : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-green-400'}`}>
            <span className="mr-2 font-mono text-green-300">{OPTION_LETTERS[index]}</span>{option.label}
          </button>
        ))}
      </div>
      {record.poll && <div className="mt-3"><Notice tone="success">Voto registrado. Você pode trocar enquanto a enquete estiver aberta.</Notice></div>}
    </Card>
  );
}

// ---------------------------------------------------------------------------
export function TenteStage({ record, save }) {
  const mission = MISSIONS['tente-primeiro'];
  const result = record.missions?.['tente-primeiro'];
  const item = useMemo(() => toTutorItem(mission.itemId), [mission.itemId]);
  return (
    <Card>
      <MissionHeader mission={mission} />
      {result?.done
        ? <Notice tone="success">Missão concluída {result.correct ? `com acerto e ${result.hints} dica(s)` : 'com a explicação'}. Espere o palestrante.</Notice>
        : <TutorItem item={item} mode="ativo" requireChecklist doneLabel="Concluir missão" onDone={(summary) => save({ missions: { 'tente-primeiro': { done: true, correct: summary.correct, hints: summary.hints, attempts: summary.attempts } } })} />}
    </Card>
  );
}

// ---------------------------------------------------------------------------
const REMIX_LIBRARY_EXAMPLES = ['binary', 'debug', 'review'].map((id) => IA_PROMPT_LIBRARY.find((prompt) => prompt.id === id)).filter(Boolean);

export function RemixStage({ record, save }) {
  const mission = MISSIONS.remix;
  const [promptId, setPromptId] = useState(REMIX_PROMPTS[0].id);
  const [text, setText] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const saved = record.missions?.remix;
  const original = REMIX_PROMPTS.find((prompt) => prompt.id === promptId);

  const evaluate = () => {
    const result = evaluateRemix(text);
    setEvaluation(result);
    if (result.tooShort) return;
    const best = Math.max(result.score, Number(saved?.score) || 0);
    // Só a pontuação sai do aparelho; o texto do remix fica aqui.
    save({ missions: { remix: { done: true, score: best, stillAsksAnswer: best === result.score ? result.stillAsksAnswer : Boolean(saved?.stillAsksAnswer) } } });
  };

  return (
    <Card>
      <MissionHeader mission={mission} />
      <fieldset className="space-y-2">
        <legend className="text-sm font-bold text-slate-200">1. Escolha um pedido "copiador"</legend>
        {REMIX_PROMPTS.map((prompt) => (
          <label key={prompt.id} className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-slate-200 ${promptId === prompt.id ? 'border-green-400 bg-green-500/10' : 'border-slate-700'}`}>
            <input type="radio" name="remix" className="mt-1" checked={promptId === prompt.id} onChange={() => setPromptId(prompt.id)} />
            “{prompt.text}”
          </label>
        ))}
      </fieldset>
      <label className="mt-4 block text-sm font-bold text-slate-200">
        2. Reescreva para a IA ajudar você a aprender
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} className={`${inputClass} mt-1`} placeholder={`Remix de: ${original.text}`} />
      </label>
      <p className="mt-1 text-xs text-slate-500">O texto fica só neste aparelho. O telão recebe apenas a pontuação de 0 a 3.</p>
      <button type="button" onClick={evaluate} className={`${buttonPrimary} mt-3`}>Avaliar meu remix</button>
      {evaluation && (
        <div className="mt-4 space-y-2">
          <div className="text-xl font-black text-white">{evaluation.score} de 3</div>
          <ul className="space-y-1">
            {REMIX_CRITERIA.map((criterion, index) => (
              <li key={criterion.id} className={`text-sm ${evaluation.criteria[criterion.id] ? 'text-emerald-200' : 'text-amber-200'}`}>
                {evaluation.criteria[criterion.id] ? '✔' : '•'} {criterion.label}: {evaluation.feedback[index]}
              </li>
            ))}
          </ul>
          {evaluation.tooShort && <Notice tone="warn">{evaluation.feedback[0]}</Notice>}
        </div>
      )}
      <details className="mt-4 rounded-xl border border-slate-800 p-3 text-sm text-slate-300">
        <summary className="cursor-pointer font-semibold text-slate-100">Ver exemplos de pedidos que ensinam</summary>
        <p className="mt-2">“{REMIX_EXAMPLE}”</p>
        <p className="mt-2 text-xs text-slate-400">Da biblioteca de prompts da Oficina do OBI Quest:</p>
        <ul className="ml-4 list-disc">{REMIX_LIBRARY_EXAMPLES.map((prompt) => <li key={prompt.id}>{prompt.text}</li>)}</ul>
      </details>
    </Card>
  );
}

// ---------------------------------------------------------------------------
const EXPLANATION_KEYWORDS = /\b(porque|pois|primeiro|depois|entao|somei|subtrai|multipliquei|dividi|contei|calculei|conta|vezes|mais|menos)\b/;

export function MeTesteStage({ record, save }) {
  const mission = MISSIONS['me-teste'];
  const saved = record.missions?.['me-teste'];
  const [answers, setAnswers] = useState({});
  const [peeked, setPeeked] = useState({});
  const [explanations, setExplanations] = useState({});
  const [feedback, setFeedback] = useState({});
  const items = mission.itemIds.map((id) => getItem(id));
  const finished = items.every((item) => answers[item.id] !== undefined || peeked[item.id]);

  const finish = () => {
    const points = items.filter((item) => !peeked[item.id] && answers[item.id] === item.correct).length;
    save({ missions: { 'me-teste': { done: true, points, total: items.length, peeked: Object.values(peeked).filter(Boolean).length } } });
  };

  const explain = (item) => {
    const normalized = String(explanations[item.id] || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    setFeedback((previous) => ({
      ...previous,
      [item.id]: EXPLANATION_KEYWORDS.test(normalized)
        ? 'Boa: você contou os passos que fez. Explicar é um ótimo jeito de testar se entendeu.'
        : 'Tente contar os passos: "primeiro eu..., depois eu...".'
    }));
  };

  if (saved?.done) return <Card><MissionHeader mission={mission} /><Notice tone="success">Você fez {saved.points} de {saved.total} pontos. Espere o palestrante.</Notice></Card>;

  return (
    <Card>
      <MissionHeader mission={mission} />
      <div className="space-y-6">
        {items.map((item, number) => {
          const answered = answers[item.id] !== undefined;
          const sawKey = peeked[item.id];
          return (
            <article key={item.id} className="space-y-2 border-b border-slate-800 pb-4">
              <p className="text-lg text-white"><strong>{number + 1}.</strong> {item.question}</p>
              <div className="grid grid-cols-2 gap-2">
                {item.options.map((option, index) => (
                  <button key={option} type="button" disabled={answered || sawKey} onClick={() => setAnswers((previous) => ({ ...previous, [item.id]: index }))} className={`min-h-11 rounded-xl border px-3 py-2 text-left font-mono ${answers[item.id] === index ? (index === item.correct ? 'border-emerald-400 bg-emerald-500/15' : 'border-rose-400 bg-rose-500/10') : 'border-slate-700 bg-slate-950'} text-slate-100 disabled:cursor-default`}>
                    {OPTION_LETTERS[index]}) {option}
                  </button>
                ))}
              </div>
              {!answered && !sawKey && <button type="button" onClick={() => setPeeked((previous) => ({ ...previous, [item.id]: true }))} className="text-sm text-slate-400 underline">Ver o gabarito sem responder (não vale ponto)</button>}
              {(answered || sawKey) && (
                <Notice tone={answered && answers[item.id] === item.correct ? 'success' : 'info'}>
                  {sawKey && !answered ? 'Você viu o gabarito antes de responder. ' : answers[item.id] === item.correct ? 'Acertou! ' : 'Não foi dessa vez. '}
                  Resposta: {OPTION_LETTERS[item.correct]}) {item.options[item.correct]}. {item.explanation}
                </Notice>
              )}
              {answered && (
                <div className="space-y-1">
                  <label className="block text-sm text-slate-300">Explique em uma frase como você pensou
                    <input value={explanations[item.id] || ''} onChange={(event) => setExplanations((previous) => ({ ...previous, [item.id]: event.target.value }))} className={`${inputClass} mt-1`} />
                  </label>
                  <button type="button" onClick={() => explain(item)} className={buttonSecondary}>Receber retorno</button>
                  {feedback[item.id] && <p className="text-sm text-green-100">{feedback[item.id]}</p>}
                </div>
              )}
            </article>
          );
        })}
      </div>
      <button type="button" disabled={!finished} onClick={finish} className={`${buttonPrimary} mt-4`}>Concluir missão</button>
    </Card>
  );
}

// ---------------------------------------------------------------------------
export function DetectiveStage({ record, save }) {
  const mission = MISSIONS.detetive;
  const cases = useMemo(() => DETECTIVE_CASES.map(getDetectiveCase), []);
  const saved = record.missions?.detetive;
  const [index, setIndex] = useState(() => Object.keys(saved?.results || {}).length);
  const [verdict, setVerdict] = useState(null);
  const [fix, setFix] = useState(null);
  const current = cases[index];

  const storeCase = (caseData, judged, fixedIndex) => {
    const judgedCorrectly = judged === caseData.hasError;
    const fixedCorrectly = caseData.hasError ? fixedIndex === caseData.correct : null;
    save({ missions: { detetive: { results: { [caseData.id]: { judgedCorrectly, fixedCorrectly } }, done: index + 1 >= cases.length } } });
  };

  if (!current || saved?.done) {
    const results = Object.values(saved?.results || {});
    return <Card><MissionHeader mission={mission} /><Notice tone="success">Você conferiu {results.length} respostas e julgou certo {results.filter((result) => result.judgedCorrectly).length}. Lembre: a IA também erra. Conferir é o seu superpoder.</Notice></Card>;
  }

  const revealed = verdict === false || (verdict === true && fix !== null);
  return (
    <Card>
      <MissionHeader mission={mission} />
      <div className="text-xs font-mono text-slate-400">Caso {index + 1} de {cases.length}</div>
      <p className="mt-2 text-lg text-white">{current.question}</p>
      <div className="mt-3 rounded-xl border border-sky-500/50 bg-sky-500/10 p-4">
        <div className="text-xs font-bold uppercase tracking-widest text-sky-200">A "IA" respondeu</div>
        <p className="mt-1 text-lg font-bold text-white">{OPTION_LETTERS[current.aiAnswerIndex]}) {current.options[current.aiAnswerIndex]}</p>
        <p className="text-sm text-sky-100">{current.aiExplanation}</p>
      </div>
      {verdict === null && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setVerdict(false)} className={buttonSecondary}>A resposta está certa</button>
          <button type="button" onClick={() => setVerdict(true)} className={buttonSecondary}>Tem erro aqui</button>
        </div>
      )}
      {verdict === true && fix === null && (
        <div className="mt-3">
          <p className="text-sm text-slate-200">Qual é a resposta certa?</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {current.options.map((option, optionIndex) => (
              <button key={option} type="button" onClick={() => setFix(optionIndex)} className="min-h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-left font-mono text-slate-100 hover:border-green-400">{OPTION_LETTERS[optionIndex]}) {option}</button>
            ))}
          </div>
        </div>
      )}
      {revealed && (
        <div className="mt-3 space-y-3">
          <Notice tone={verdict === current.hasError ? 'success' : 'warn'}>
            {verdict === current.hasError ? 'Boa investigação! ' : 'Olha de novo! '}
            {current.errorNote} Resposta certa: {OPTION_LETTERS[current.correct]}) {current.options[current.correct]}.
          </Notice>
          <button type="button" className={buttonPrimary} onClick={() => { storeCase(current, verdict, fix); setIndex(index + 1); setVerdict(null); setFix(null); }}>
            {index + 1 >= cases.length ? 'Concluir missão' : 'Próximo caso'}
          </button>
        </div>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Experimento: cada aluno faz o Tema A e o Tema B, um em cada modo.
export function ExperimentStage({ record, save, group }) {
  const themes = record.experiment?.themes || {};
  const currentThemeId = THEME_ORDER.find((themeId) => !themes[themeId]?.done);
  const [checkIndex, setCheckIndex] = useState(0);
  const [checkAnswer, setCheckAnswer] = useState(null);

  if (!group) return <Waiting>Aguardando o sorteio do seu grupo. Só um instante.</Waiting>;
  if (!currentThemeId) return <Waiting>Atividade concluída! Agora espere o palestrante abrir o quiz sem IA.</Waiting>;

  const theme = EXPERIMENT_THEMES[currentThemeId];
  const mode = modeFor(group, currentThemeId);
  const items = themes[currentThemeId]?.items || {};
  const nextItemId = theme.activity.find((id) => !items[String(id)]);
  const item = nextItemId ? toTutorItem(nextItemId) : null;

  const saveItem = (summary) => save({ experiment: { group, themes: { [currentThemeId]: { mode, items: { [item.id]: { correct: summary.correct, hints: summary.hints, attempts: summary.attempts } } } } } });
  const finishTheme = () => {
    save({ experiment: { group, themes: { [currentThemeId]: { mode, done: true } } } });
    setCheckIndex(0);
    setCheckAnswer(null);
  };

  const position = nextItemId ? theme.activity.indexOf(nextItemId) + 1 : theme.activity.length;

  return (
    <Card>
      <header className="mb-4">
        <div className="text-xs font-mono uppercase tracking-widest text-green-300">{GROUP_LABELS[group]} · Tema {theme.id} de 2</div>
        <h2 className="mt-1 text-2xl font-black text-white">{theme.title}</h2>
        <div className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-bold ${mode === 'copiar' ? 'bg-fuchsia-500/20 text-fuchsia-100' : 'bg-sky-500/20 text-sky-100'}`}>
          {MODE_LABELS[mode]}
        </div>
        <p className="mt-2 text-sm text-slate-300">
          {mode === 'copiar'
            ? 'Neste tema, a "IA" entrega a resposta pronta. Você só precisa marcar a alternativa que ela deu.'
            : 'Neste tema, você estuda com o tutor: tente primeiro, peça dicas se precisar e só depois veja a explicação.'}
        </p>
      </header>
      {item && (
        <>
          <div className="mb-3 text-xs font-mono text-slate-400">Questão {position} de {theme.activity.length}</div>
          <TutorItem key={`${currentThemeId}-${item.id}`} item={item} mode={mode} onDone={saveItem} doneLabel="Próxima questão" />
        </>
      )}
      {!item && mode === 'ativo' && checkIndex < theme.checks.length && (() => {
        const check = getItem(theme.checks[checkIndex]);
        return (
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-300">Pergunta de checagem {checkIndex + 1} de {theme.checks.length}</div>
            <p className="text-lg text-white">{check.question}</p>
            <div className="grid grid-cols-2 gap-2">
              {check.options.map((option, index) => (
                <button key={option} type="button" disabled={checkAnswer !== null} onClick={() => setCheckAnswer(index)} className={`min-h-11 rounded-xl border px-3 py-2 text-left font-mono text-slate-100 ${checkAnswer === index ? (index === check.correct ? 'border-emerald-400 bg-emerald-500/15' : 'border-rose-400 bg-rose-500/10') : 'border-slate-700 bg-slate-950'}`}>{OPTION_LETTERS[index]}) {option}</button>
              ))}
            </div>
            {checkAnswer !== null && (
              <>
                <Notice tone={checkAnswer === check.correct ? 'success' : 'info'}>{checkAnswer === check.correct ? 'Certo! ' : 'Quase. '}{check.explanation}</Notice>
                <button type="button" className={buttonPrimary} onClick={() => { setCheckIndex(checkIndex + 1); setCheckAnswer(null); }}>Continuar</button>
              </>
            )}
          </div>
        );
      })()}
      {!item && (mode === 'copiar' || checkIndex >= theme.checks.length) && (
        <div className="space-y-3">
          <Notice tone="success">
            {mode === 'ativo' ? 'Tema concluído. Confira no caderno: refaça uma das contas sem olhar.' : 'Tema concluído.'}
          </Notice>
          <button type="button" className={buttonPrimary} onClick={finishTheme}>{currentThemeId === 'A' ? 'Ir para o Tema B' : 'Terminar atividade'}</button>
        </div>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Quiz (e re-teste) sem IA: sem correção até o fim, com nível de confiança.
function ConfidenceQuiz({ group, onSubmit, title, intro }) {
  const [answers, setAnswers] = useState({});
  const [confidence, setConfidence] = useState({});
  const complete = QUIZ_ITEMS.every((quizItem) => answers[quizItem.itemId] !== undefined && confidence[quizItem.itemId]);

  const submit = () => {
    const result = {};
    QUIZ_ITEMS.forEach((quizItem) => {
      const item = getItem(quizItem.itemId);
      result[String(quizItem.itemId)] = {
        theme: quizItem.theme,
        kind: quizItem.kind,
        mode: modeFor(group, quizItem.theme),
        choice: answers[quizItem.itemId],
        correct: answers[quizItem.itemId] === item.correct,
        confidence: confidence[quizItem.itemId]
      };
    });
    onSubmit(result);
  };

  return (
    <Card>
      <h2 className="text-2xl font-black text-white">{title}</h2>
      <p className="mt-1 text-slate-300">{intro}</p>
      <div className="mt-4 space-y-6">
        {QUIZ_ITEMS.map((quizItem, number) => {
          const item = getItem(quizItem.itemId);
          return (
            <article key={quizItem.itemId} className="space-y-2 border-b border-slate-800 pb-4">
              <p className="text-lg text-white"><strong>{number + 1}.</strong> {item.question}</p>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label={`Alternativas da questão ${number + 1}`}>
                {item.options.map((option, index) => (
                  <button key={option} type="button" aria-pressed={answers[quizItem.itemId] === index} onClick={() => setAnswers((previous) => ({ ...previous, [quizItem.itemId]: index }))} className={`min-h-11 rounded-xl border px-3 py-2 text-left font-mono text-slate-100 ${answers[quizItem.itemId] === index ? 'border-green-300 bg-green-500/20' : 'border-slate-700 bg-slate-950'}`}>
                    {OPTION_LETTERS[index]}) {option}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Confiança na questão ${number + 1}`}>
                <span className="text-sm text-slate-400">Quão seguro você está?</span>
                {CONFIDENCE_LEVELS.map((level) => (
                  <button key={level.id} type="button" aria-pressed={confidence[quizItem.itemId] === level.id} onClick={() => setConfidence((previous) => ({ ...previous, [quizItem.itemId]: level.id }))} className={`min-h-10 rounded-full border px-3 py-1 text-sm ${confidence[quizItem.itemId] === level.id ? 'border-amber-300 bg-amber-500/20 text-white' : 'border-slate-700 text-slate-300'}`}>
                    {level.emoji} {level.label}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
      <button type="button" disabled={!complete} onClick={submit} className={`${buttonPrimary} mt-4`}>Enviar respostas</button>
      {!complete && <p className="mt-2 text-xs text-slate-500">Responda todas as questões e marque a confiança em cada uma.</p>}
    </Card>
  );
}

export function QuizStage({ record, save, group }) {
  if (!group) return <Waiting>Aguardando o sorteio do seu grupo.</Waiting>;
  if (record.experiment?.quizDone) return <Waiting>Respostas enviadas! O resultado da turma vai aparecer no telão.</Waiting>;
  return <ConfidenceQuiz group={group} title="Quiz sem IA" intro="Agora é só com você: sem tutor e sem resposta pronta. A correção aparece no fim." onSubmit={(quiz) => save({ experiment: { group, quiz, quizDone: true } })} />;
}

// ---------------------------------------------------------------------------
export function ResultStage({ record }) {
  const quiz = record.experiment?.quiz || {};
  const entries = QUIZ_ITEMS.map((quizItem) => ({ quizItem, answer: quiz[String(quizItem.itemId)], item: getItem(quizItem.itemId) })).filter((entry) => entry.answer);
  const sureWrong = entries.filter((entry) => entry.answer.confidence === 3 && !entry.answer.correct).length;
  if (!entries.length) return <Waiting>Olhe o telão: o resultado da turma está lá.</Waiting>;
  return (
    <Card>
      <h2 className="text-2xl font-black text-white">Seu quiz</h2>
      <p className="mt-1 text-sm text-slate-400">Só você vê esta tela.</p>
      <ul className="mt-4 space-y-3">
        {entries.map(({ quizItem, answer, item }) => (
          <li key={quizItem.itemId} className={`rounded-xl border p-3 ${answer.correct ? 'border-emerald-500/50' : 'border-rose-500/50'}`}>
            <div className="text-xs font-mono text-slate-400">Tema {quizItem.theme} · {MODE_LABELS[answer.mode]} · {quizItem.kind === 'identical' ? 'pergunta igual à da atividade' : 'pergunta parecida, contexto novo'}</div>
            <p className="mt-1 text-white">{item.question}</p>
            <p className={`mt-1 text-sm ${answer.correct ? 'text-emerald-200' : 'text-rose-200'}`}>{answer.correct ? 'Acertou.' : `Resposta certa: ${OPTION_LETTERS[item.correct]}) ${item.options[item.correct]}.`} {item.explanation}</p>
          </li>
        ))}
      </ul>
      {sureWrong > 0 && <div className="mt-3"><Notice tone="warn">Você marcou "Tenho certeza" em {sureWrong} resposta(s) que estavam erradas. Isso acontece muito quando a gente copia sem entender.</Notice></div>}
    </Card>
  );
}

// ---------------------------------------------------------------------------
export function ClosingStage({ returnCode }) {
  const [checked, setChecked] = useState(WEEKLY_CHALLENGE.map(() => false));
  return (
    <Card>
      <h2 className="text-2xl font-black text-white">Desafio da semana</h2>
      <p className="mt-1 text-slate-300">Da próxima vez que usar IA para estudar, marque o que você fez. Fica só neste aparelho.</p>
      <ul className="mt-4 space-y-2">
        {WEEKLY_CHALLENGE.map((item, index) => (
          <li key={item.text}>
            <label className="flex items-start gap-2 text-slate-200">
              <input type="checkbox" className="mt-1 h-5 w-5" checked={checked[index]} onChange={() => setChecked((previous) => previous.map((value, position) => (position === index ? !value : value)))} />
              {item.text}
            </label>
          </li>
        ))}
      </ul>
      {returnCode && (
        <div className="mt-6 rounded-2xl border-2 border-green-400 bg-green-500/10 p-4 text-center">
          <div className="text-sm font-bold uppercase tracking-widest text-green-200">Anote no caderno: seu código de retorno</div>
          <div className="mt-2 font-mono text-4xl font-black tracking-[0.2em] text-white sm:text-5xl">{formatReturnCode(returnCode)}</div>
          <p className="mt-2 text-sm text-slate-300">Ele não tem seu nome. Você vai usar no re-teste surpresa daqui a alguns dias.</p>
        </div>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
export function RetestStage({ record, save, returnCode }) {
  const [codeInput, setCodeInput] = useState(returnCode ? formatReturnCode(returnCode) : '');
  const [parsed, setParsed] = useState(null);
  if (record.retest?.done) return <Waiting>Re-teste enviado. Obrigado! O palestrante vai mostrar o resultado.</Waiting>;
  if (!parsed?.valid) {
    return (
      <Card>
        <h2 className="text-2xl font-black text-white">Re-teste surpresa</h2>
        <p className="mt-1 text-slate-300">Digite o código de retorno que você anotou no caderno.</p>
        <input value={codeInput} onChange={(event) => setCodeInput(event.target.value.toUpperCase())} placeholder="Ex.: K7M2-Q" aria-label="Código de retorno" className={`${inputClass} mt-3 font-mono uppercase tracking-widest`} maxLength={7} />
        <button type="button" className={`${buttonPrimary} mt-3`} onClick={() => setParsed(parseReturnCode(codeInput))}>Começar</button>
        {parsed && !parsed.valid && <div className="mt-3"><Notice tone="error" role="alert">{parsed.error}</Notice></div>}
      </Card>
    );
  }
  return (
    <ConfidenceQuiz
      group={parsed.group}
      title="Re-teste surpresa"
      intro="Sem consulta e sem IA. Responda como lembrar."
      onSubmit={(answers) => save({ retest: { returnCode: parsed.code, group: parsed.group, answers, done: true } })}
    />
  );
}
