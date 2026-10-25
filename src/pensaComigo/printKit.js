// Kit impresso do Pensa Comigo: um HTML autossuficiente (sem rede, sem scripts) para
// imprimir antes da palestra. Usado no modo sem celular e quando a internet falha.

import {
  EXPERIMENT_THEMES, THEME_ORDER, QUIZ_ITEMS, CONFIDENCE_LEVELS, OPENING_POLL, MODE_LABELS,
  WEEKLY_CHALLENGE, getItem, getHints, HONESTY_NOTES
} from './content.js';
import { GROUPS, GROUP_LABELS, modeFor } from './assignment.js';
import { OPTION_LETTERS } from './tutor.js';

export const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const optionsList = (item) => `<ol class="options">${item.options.map((option, index) => `<li><span class="box"></span> ${OPTION_LETTERS[index]}) ${escapeHtml(option)}</li>`).join('')}</ol>`;

const activityBlock = (item, mode, number) => {
  const head = `<div class="question"><p><strong>${number}.</strong> ${escapeHtml(item.question)}</p>${optionsList(item)}`;
  if (mode === 'copiar') {
    return `${head}<p class="ready">Resposta pronta: <strong>${OPTION_LETTERS[item.correct]}) ${escapeHtml(item.options[item.correct])}</strong>. ${escapeHtml(item.explanation)}</p></div>`;
  }
  const hints = getHints(item.id).map((hint, index) => `<li>Dica ${index + 1}: ${escapeHtml(hint)}</li>`).join('');
  return `${head}<p class="attempt">Minha tentativa: ______________________________</p><p class="fold">Dobre a folha aqui. Só abra uma dica depois de tentar.</p><ol class="hints">${hints}</ol></div>`;
};

const groupSheet = (group) => {
  const parts = THEME_ORDER.map((themeId) => {
    const theme = EXPERIMENT_THEMES[themeId];
    const mode = modeFor(group, themeId);
    const items = theme.activity.map((id, index) => activityBlock(getItem(id), mode, index + 1)).join('');
    return `<h3>Tema ${themeId} · ${escapeHtml(theme.title)} — ${escapeHtml(MODE_LABELS[mode])}</h3>${items}`;
  }).join('');
  return `<section class="page" data-section="atividade-${group}"><h2>Atividade · ${GROUP_LABELS[group]}</h2><p class="small">Siga as instruções de cada tema. No tema "Estudando ativamente", tente antes de abrir as dicas.</p>${parts}</section>`;
};

const confidenceBoxes = () => `<p class="confidence">Quão seguro você está? ${CONFIDENCE_LEVELS.map((level) => `<span class="box"></span> ${escapeHtml(level.label)}`).join(' &nbsp; ')}</p>`;

const quizSheet = (group, title, sectionId) => {
  const questions = QUIZ_ITEMS.map((quizItem, index) => {
    const item = getItem(quizItem.itemId);
    return `<div class="question"><p><strong>${index + 1}.</strong> ${escapeHtml(item.question)}</p>${optionsList(item)}${confidenceBoxes()}</div>`;
  }).join('');
  return `<section class="page" data-section="${sectionId}-${group}"><h2>${escapeHtml(title)} · ${GROUP_LABELS[group]}</h2><p class="small">Sem IA, sem consulta. Marque uma alternativa e quão seguro você está.</p>${questions}</section>`;
};

const cardsPages = () => OPTION_LETTERS.map((letter) => `<section class="page card" data-section="cartao-${letter}"><div class="letter">${letter}</div></section>`).join('');

const answerKey = () => {
  const rows = QUIZ_ITEMS.map((quizItem, index) => {
    const item = getItem(quizItem.itemId);
    const kind = quizItem.kind === 'identical' ? 'idêntica à atividade' : 'parecida, contexto novo';
    const modes = GROUPS.map((group) => `${GROUP_LABELS[group]}: ${MODE_LABELS[modeFor(group, quizItem.theme)]}`).join(' · ');
    return `<tr><td>${index + 1}</td><td>Tema ${quizItem.theme} (${kind})</td><td>${OPTION_LETTERS[item.correct]}) ${escapeHtml(item.options[item.correct])}</td><td>${escapeHtml(modes)}</td></tr>`;
  }).join('');
  return `<section class="page" data-section="gabarito"><h2>Gabarito do palestrante (não entregue aos alunos)</h2><table><thead><tr><th>Questão</th><th>Tema</th><th>Resposta</th><th>Modo por grupo</th></tr></thead><tbody>${rows}</tbody></table>
<h3>Como contar</h3><ol><li>Separe as folhas por grupo.</li><li>Para cada modo, conte: acertos na atividade, acertos no quiz e respostas "Tenho certeza" que estavam erradas.</li><li>Lance os números no painel do palestrante, em "Modo sem celular".</li></ol>
<h3>O que não afirmar</h3><ul>${HONESTY_NOTES.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul></section>`;
};

const tallySheet = () => {
  const pollRows = OPENING_POLL.options.map((option, index) => `<tr><td>${OPTION_LETTERS[index]}</td><td>${escapeHtml(option.label)}</td><td></td></tr>`).join('');
  const modeRows = Object.entries(MODE_LABELS).map(([, label]) => `<tr><td>${escapeHtml(label)}</td><td></td><td></td><td></td><td></td></tr>`).join('');
  return `<section class="page" data-section="contagem"><h2>Folha de contagem do palestrante</h2><h3>${escapeHtml(OPENING_POLL.question)}</h3><table><thead><tr><th>Cartão</th><th>Opção</th><th>Contagem</th></tr></thead><tbody>${pollRows}</tbody></table>
<h3>Experimento</h3><table><thead><tr><th>Modo</th><th>Participantes</th><th>Acertos na atividade</th><th>Acertos no quiz</th><th>Seguros que erraram</th></tr></thead><tbody>${modeRows}</tbody></table></section>`;
};

const closingSheet = () => `<section class="page" data-section="fechamento"><h2>Desafio da semana</h2><ul class="check">${WEEKLY_CHALLENGE.map((item) => `<li><span class="box"></span> ${escapeHtml(item.text)}</li>`).join('')}</ul><p>No re-teste, use a folha do seu grupo. O grupo já vem impresso.</p></section>`;

export const buildPrintKit = ({ title = 'Palestra Pensa Comigo', roomCode = '' } = {}) => {
  const sections = [
    cardsPages(),
    ...GROUPS.map(groupSheet),
    ...GROUPS.map((group) => quizSheet(group, 'Quiz sem IA', 'quiz')),
    ...GROUPS.map((group) => quizSheet(group, 'Re-teste surpresa', 'reteste')),
    closingSheet(),
    tallySheet(),
    answerKey()
  ];
  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)} — kit impresso</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#111;background:#fff;margin:0;padding:16px;font-size:14px;line-height:1.4}
h1{font-size:22px}h2{font-size:20px;margin:0 0 8px}h3{font-size:16px;margin:16px 0 6px}
.page{page-break-after:always;break-after:page;padding:8px 0;border-bottom:1px dashed #999;margin-bottom:16px}
.card{display:flex;align-items:center;justify-content:center;min-height:90vh}.letter{font-size:420px;font-weight:900;line-height:1}
.question{margin:10px 0 14px;page-break-inside:avoid;break-inside:avoid}.options{list-style:none;padding:0;margin:6px 0;display:grid;grid-template-columns:1fr 1fr;gap:4px}
.box{display:inline-block;width:12px;height:12px;border:1.5px solid #111;vertical-align:middle;margin-right:4px}
.ready{background:#eee;padding:6px}.fold{border-top:2px dashed #111;padding-top:4px;font-size:12px}.hints{font-size:12px}.small{font-size:12px;color:#333}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #333;padding:6px;text-align:left;vertical-align:top}td:empty{height:28px}
.check{list-style:none;padding:0}.check li{margin:6px 0}
</style></head><body><h1>${escapeHtml(title)}${roomCode ? ` · sala ${escapeHtml(roomCode)}` : ''}</h1><p class="small">Kit gerado pelo OBI Quest (modo Pensa Comigo). Imprima em A4. Não há dados de alunos neste arquivo.</p>${sections.join('\n')}</body></html>`;
  return { html, sectionCount: sections.length };
};
