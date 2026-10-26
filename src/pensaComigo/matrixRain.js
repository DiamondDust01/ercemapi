// Lógica da chuva de frases do fundo do Pensa Comigo, no estilo Matrix.
// Cada frase é escrita de cima para baixo, uma letra por vez. Para aparecer sempre
// inteira, ela é dividida em pedaços que cabem na altura da tela (sem cortar
// palavras), cada pedaço numa coluna. Um organizador reserva colunas livres para a
// frase toda, sem sobreposição. A frase fica completa por alguns segundos e só então
// apaga. Sem DOM, para poder testar.

import { QUOTES, formatQuote } from './quotes.js';

export const DENSITY = 0.55; // fração máxima das colunas ocupadas ao mesmo tempo
export const FADE_SECONDS = 1.6;

const range = (random, min, max) => min + random() * (max - min);

// Divide o texto em pedaços de até `maxLength` letras, quebrando entre palavras.
export const layoutChunks = (text, maxLength) => {
  const limit = Math.max(4, Math.floor(maxLength));
  const chunks = [];
  let current = '';
  text.split(/\s+/).filter(Boolean).forEach((word) => {
    let rest = word;
    while (rest.length > limit) {
      if (current) {
        chunks.push(current);
        current = '';
      }
      chunks.push(rest.slice(0, limit));
      rest = rest.slice(limit);
    }
    if (!current) current = rest;
    else if (current.length + 1 + rest.length <= limit) current = `${current} ${rest}`;
    else {
      chunks.push(current);
      current = rest;
    }
  });
  if (current) chunks.push(current);
  return chunks;
};

export const chunkLimit = (rows) => Math.max(6, Math.min(rows - 2, 30));

export const createPhrase = (quote, column, rows, random, { delay = 0 } = {}) => {
  const chunks = layoutChunks(formatQuote(quote), chunkLimit(rows));
  const tallest = Math.max(...chunks.map((chunk) => chunk.length));
  return {
    key: quote.text,
    chunks,
    column,
    top: Math.floor(random() * Math.max(1, rows - tallest)),
    total: chunks.reduce((sum, chunk) => sum + chunk.length, 0),
    written: 0,
    speed: range(random, 9, 14), // letras por segundo
    hold: range(random, 2.5, 4.5), // segundos com a frase inteira na tela
    fade: 0,
    delay
  };
};

export const phraseDone = (phrase) => phrase.fade >= FADE_SECONDS;

export const advancePhrase = (phrase, seconds) => {
  if (phrase.delay > 0) return { ...phrase, delay: Math.max(0, phrase.delay - seconds) };
  if (phrase.written < phrase.total) return { ...phrase, written: Math.min(phrase.total, phrase.written + phrase.speed * seconds) };
  if (phrase.hold > 0) return { ...phrase, hold: Math.max(0, phrase.hold - seconds) };
  return { ...phrase, fade: phrase.fade + seconds };
};

// Letras visíveis de uma frase: { char, column, row, alpha, isHead }.
export const phraseCells = (phrase) => {
  if (phrase.delay > 0) return [];
  const written = Math.floor(phrase.written);
  const fading = phrase.written >= phrase.total && phrase.hold <= 0;
  const fadeFactor = fading ? Math.max(0, 1 - phrase.fade / FADE_SECONDS) : 1;
  const cells = [];
  let index = 0;
  phrase.chunks.forEach((chunk, offset) => {
    for (let row = 0; row < chunk.length; row += 1, index += 1) {
      if (index >= written) return;
      const char = chunk[row];
      if (char === ' ') continue;
      const isHead = index === written - 1 && phrase.written < phrase.total;
      // As letras mais novas brilham mais; as antigas ficam visíveis até o fim.
      const recency = Math.max(0.65, 1 - (written - 1 - index) / 40);
      cells.push({ char, column: phrase.column + offset, row: phrase.top + row, alpha: (isHead ? 1 : recency) * fadeFactor, isHead });
    }
  });
  return cells;
};

// Organizador: reserva colunas livres e evita repetir a mesma frase na tela.
export const createRain = (columns, rows) => ({ columns, rows, phrases: [], cooldown: 0 });

const occupied = (phrases, columns) => {
  const used = new Array(columns).fill(false);
  phrases.forEach((phrase) => {
    // Uma coluna de folga de cada lado, para as frases não se encostarem.
    for (let column = phrase.column - 1; column <= phrase.column + phrase.chunks.length; column += 1) {
      if (column >= 0 && column < columns) used[column] = true;
    }
  });
  return used;
};

const usedCount = (phrases) => phrases.reduce((sum, phrase) => sum + phrase.chunks.length, 0);

export const spawnPhrase = (rain, random, { quotes = QUOTES, delay = 0 } = {}) => {
  if (usedCount(rain.phrases) >= rain.columns * DENSITY) return rain;
  const onScreen = new Set(rain.phrases.map((phrase) => phrase.key));
  const candidates = quotes.filter((quote) => !onScreen.has(quote.text));
  if (!candidates.length) return rain;
  const quote = candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
  const width = layoutChunks(formatQuote(quote), chunkLimit(rain.rows)).length;
  if (width > rain.columns) return rain;
  const used = occupied(rain.phrases, rain.columns);
  const starts = [];
  for (let start = 0; start + width <= rain.columns; start += 1) {
    let free = true;
    for (let column = start; column < start + width; column += 1) if (used[column]) free = false;
    if (free) starts.push(start);
  }
  if (!starts.length) return rain;
  const column = starts[Math.min(starts.length - 1, Math.floor(random() * starts.length))];
  return { ...rain, phrases: [...rain.phrases, createPhrase(quote, column, rain.rows, random, { delay })] };
};

export const stepRain = (rain, seconds, random, options) => {
  let next = { ...rain, phrases: rain.phrases.map((phrase) => advancePhrase(phrase, seconds)).filter((phrase) => !phraseDone(phrase)) };
  next.cooldown = Math.max(0, rain.cooldown - seconds);
  if (next.cooldown <= 0) {
    const before = next.phrases.length;
    next = spawnPhrase(next, random, options);
    if (next.phrases.length > before) next.cooldown = range(random, 0.4, 1.4);
  }
  return next;
};

// Começa com a tela parcialmente ocupada, em tempos diferentes.
export const seedRain = (columns, rows, random, options) => {
  let rain = createRain(columns, rows);
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const before = rain.phrases.length;
    rain = spawnPhrase(rain, random, { ...options, delay: rain.phrases.length * range(random, 0.3, 0.9) });
    if (rain.phrases.length === before) break;
  }
  return { ...rain, cooldown: 1 };
};

export const rainCells = (rain) => rain.phrases.flatMap(phraseCells);
