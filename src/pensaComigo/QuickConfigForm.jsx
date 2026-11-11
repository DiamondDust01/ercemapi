import React from 'react';
import {
  PRESETS, OPTIONAL_STAGES, MISSION_ITEM_IDS, MAX_ME_TESTE_ITEMS, POLL_QUESTION_MAX, DEFAULT_CONFIG,
  applyPreset, normalizeConfig, activeStages
} from './quickConfig.js';
import { DETECTIVE_CASES, getDetectiveCase, getItem, OPENING_POLL } from './content.js';
import { MINICURSO_PROBLEMS } from './minicurso.js';
import { buttonSecondary, inputClass } from './ui.jsx';

const DETECTIVE_OPTIONS = DETECTIVE_CASES.map(getDetectiveCase);

const itemLabel = (id) => {
  const item = getItem(id);
  return item ? `${item.title} — ${item.question}` : String(id);
};

const chip = (active) => `inline-flex min-h-11 items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${active ? 'border-green-400 bg-green-500/10 text-white' : 'border-slate-700 text-slate-300 hover:border-slate-500'}`;

// Formulário rápido e opcional do palestrante. Controlado: recebe `value` e devolve a
// configuração já normalizada em `onChange`.
export default function QuickConfigForm({ value, onChange }) {
  const config = normalizeConfig(value);
  const set = (patch) => onChange(normalizeConfig({ ...config, preset: 'personalizada', ...patch }));
  const stageOn = (id) => config.stages[id];

  const toggleMeTeste = (id) => {
    const has = config.meTesteItemIds.includes(id);
    if (has && config.meTesteItemIds.length === 1) return;
    if (!has && config.meTesteItemIds.length >= MAX_ME_TESTE_ITEMS) return;
    set({ meTesteItemIds: has ? config.meTesteItemIds.filter((entry) => entry !== id) : [...config.meTesteItemIds, id] });
  };

  const toggleCase = (id) => {
    const has = config.detectiveCaseIds.includes(id);
    if (has && config.detectiveCaseIds.length === 1) return;
    set({ detectiveCaseIds: has ? config.detectiveCaseIds.filter((entry) => entry !== id) : [...config.detectiveCaseIds, id] });
  };

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-sm font-bold text-slate-100">1. Formato da palestra</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {PRESETS.map((preset) => (
            <button key={preset.id} type="button" aria-pressed={config.preset === preset.id} onClick={() => onChange(applyPreset(config, preset.id))} className={`${chip(config.preset === preset.id)} flex-col`}>
              <span className="font-bold">{preset.label}</span>
              <span className="text-xs text-slate-400">{preset.description}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-bold text-slate-100">2. Etapas {config.preset === 'personalizada' && <span className="font-normal text-slate-400">(personalizada)</span>}</legend>
        <p className="text-xs text-slate-500">Abertura e Fechamento sempre aparecem. Ficam {activeStages(config).length} etapa(s).</p>
        <div className="mt-2 grid gap-1 sm:grid-cols-2">
          {OPTIONAL_STAGES.map((stage) => (
            <label key={stage.id} className="flex min-h-9 items-start gap-2 text-sm text-slate-200">
              <input type="checkbox" className="mt-1 h-4 w-4" checked={stageOn(stage.id)} onChange={() => set({ stages: { ...config.stages, [stage.id]: !stageOn(stage.id) } })} />
              {stage.label}
            </label>
          ))}
        </div>
      </fieldset>

      {(stageOn('problema-a') || stageOn('problema-b') || stageOn('tente-primeiro') || stageOn('me-teste') || stageOn('detetive')) && (
        <fieldset className="space-y-4">
          <legend className="text-sm font-bold text-slate-100">3. Questões</legend>
          {(stageOn('problema-a') || stageOn('problema-b')) && (
            <ul className="space-y-1 rounded-xl border border-slate-700 p-3 text-sm text-slate-200">
              {Object.values(MINICURSO_PROBLEMS).filter((problem) => stageOn(problem.id)).map((problem) => (
                <li key={problem.id}><strong>{problem.stageLabel} · {problem.title}</strong> <span className="text-xs text-slate-400">({problem.withAi ? 'com o tutor e 3 dicas' : 'sem IA e sem dicas'})</span></li>
              ))}
              <li className="text-xs text-slate-500">Problemas da atividade prática do minicurso, com enunciado, exemplo e verificação local do código.</li>
            </ul>
          )}
          {(stageOn('tente-primeiro') || stageOn('me-teste') || stageOn('detetive')) && <p className="text-xs text-slate-500">A lista mostra só questões que não aparecem no experimento nem no Detetive, para nenhuma missão adiantar a resposta do quiz.</p>}

          {stageOn('tente-primeiro') && (
            <label className="block text-sm text-slate-200">Tente primeiro (1 questão, com 3 dicas)
              <select value={String(config.tenteItemId)} onChange={(event) => set({ tenteItemId: event.target.value })} className={`${inputClass} mt-1 text-sm`}>
                {MISSION_ITEM_IDS.map((id) => <option key={id} value={String(id)}>{itemLabel(id)}</option>)}
              </select>
            </label>
          )}

          {stageOn('me-teste') && (
            <div>
              <div className="text-sm text-slate-200">Me teste (de 1 a {MAX_ME_TESTE_ITEMS} questões · {config.meTesteItemIds.length} escolhida(s))</div>
              <div className="mt-1 grid gap-2 md:grid-cols-2">
                {MISSION_ITEM_IDS.map((id) => {
                  const on = config.meTesteItemIds.includes(id);
                  const full = !on && config.meTesteItemIds.length >= MAX_ME_TESTE_ITEMS;
                  return (
                    <button key={id} type="button" aria-pressed={on} disabled={full} onClick={() => toggleMeTeste(id)} className={`${chip(on)} disabled:opacity-40`}>
                      <span className="font-mono text-green-300">{on ? '✔' : '+'}</span>
                      <span className="min-w-0">{itemLabel(id)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {stageOn('detetive') && (
            <div>
              <div className="text-sm text-slate-200">Detetive de erros ({config.detectiveCaseIds.length} de {DETECTIVE_OPTIONS.length} casos)</div>
              <div className="mt-1 grid gap-2 md:grid-cols-2">
                {DETECTIVE_OPTIONS.map((caseData) => {
                  const on = config.detectiveCaseIds.includes(caseData.id);
                  return (
                    <button key={caseData.id} type="button" aria-pressed={on} onClick={() => toggleCase(caseData.id)} className={chip(on)}>
                      <span className="font-mono text-green-300">{on ? '✔' : '+'}</span>
                      <span className="min-w-0">{caseData.title} <span className="text-xs text-slate-400">({caseData.hasError ? 'IA errou' : 'IA acertou'})</span></span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </fieldset>
      )}

      <fieldset className="space-y-3">
        <legend className="text-sm font-bold text-slate-100">4. Detalhes</legend>
        <label className="block text-sm text-slate-200">Pergunta da enquete de abertura
          <input value={config.pollQuestion} maxLength={POLL_QUESTION_MAX} onChange={(event) => onChange({ ...config, preset: config.preset, pollQuestion: event.target.value })} placeholder={OPENING_POLL.question} className={`${inputClass} mt-1 text-sm`} />
          <span className="text-xs text-slate-500">Vazio usa a pergunta padrão. As alternativas continuam as mesmas.</span>
        </label>
        <label className="flex items-start gap-2 text-sm text-slate-200">
          <input type="checkbox" className="mt-1 h-4 w-4" checked={config.freePlay} onChange={() => onChange({ ...config, freePlay: !config.freePlay })} />
          <span>
            Liberar "Escolha seu desafio" desde o início
            <span className="mt-0.5 block text-xs text-slate-500">
              Mostra aos alunos uma aba extra com desafios do OBI Quest para treinar com o tutor, no próprio ritmo, além da atividade da palestra. As questões do experimento só aparecem nela depois do resultado. Também dá para liberar ou fechar a aba durante a palestra, em "Liberações".
            </span>
          </span>
        </label>
      </fieldset>

      <button type="button" className={buttonSecondary} onClick={() => onChange(normalizeConfig(DEFAULT_CONFIG))}>Restaurar o padrão</button>
    </div>
  );
}
