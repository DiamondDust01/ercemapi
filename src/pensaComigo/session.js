// Etapas, código da sala, link/QR e armazenamento de sessão do Pensa Comigo.

export const STAGES = [
  { id: 'abertura', label: 'Abertura', short: 'Enquete', kind: 'abertura' },
  { id: 'tente-primeiro', label: 'Missão 1 · Tente primeiro', short: 'Tente primeiro', kind: 'missao' },
  { id: 'remix', label: 'Missão 2 · Remix de prompt', short: 'Remix', kind: 'missao' },
  { id: 'me-teste', label: 'Missão 3 · Me teste', short: 'Me teste', kind: 'missao' },
  { id: 'detetive', label: 'Missão 4 · Detetive de erros', short: 'Detetive', kind: 'missao' },
  { id: 'experimento', label: 'Experimento · Atividade', short: 'Atividade', kind: 'experimento' },
  { id: 'quiz', label: 'Experimento · Quiz sem IA', short: 'Quiz', kind: 'experimento' },
  { id: 'resultado', label: 'Resultado', short: 'Resultado', kind: 'resultado' },
  { id: 'fechamento', label: 'Fechamento', short: 'Fechamento', kind: 'fechamento' },
  { id: 'reteste', label: 'Re-teste (outro dia)', short: 'Re-teste', kind: 'reteste' }
];

export const STAGE_IDS = STAGES.map((stage) => stage.id);

export const getStage = (id) => STAGES.find((stage) => stage.id === id) || STAGES[0];

export const stageIndex = (id) => Math.max(0, STAGE_IDS.indexOf(id));

export const nextStageId = (id) => STAGE_IDS[Math.min(STAGE_IDS.length - 1, stageIndex(id) + 1)];

export const previousStageId = (id) => STAGE_IDS[Math.max(0, stageIndex(id) - 1)];

// Itens do experimento ficam fora do "Escolha seu desafio" até o resultado ser mostrado,
// para que ninguém veja antes as perguntas do quiz.
export const experimentContentLocked = (stageId) => stageIndex(stageId) < stageIndex('resultado');

// ---------------------------------------------------------------------------
// Código da sala e link de entrada
// ---------------------------------------------------------------------------
export const ROOM_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const ROOM_CODE_PATTERN = /^[A-Z0-9]{6}$/;

export const createRoomCode = (random = Math.random) => {
  let code = '';
  for (let index = 0; index < 6; index += 1) {
    code += ROOM_CODE_ALPHABET[Math.min(ROOM_CODE_ALPHABET.length - 1, Math.floor(random() * ROOM_CODE_ALPHABET.length))];
  }
  return code;
};

export const normalizeRoomCode = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);

export const isValidRoomCode = (value) => ROOM_CODE_PATTERN.test(String(value || ''));

// Lê `?sala=CÓDIGO` da URL de abertura.
export const parseRoomParam = (search = '') => {
  try {
    const params = new URLSearchParams(search);
    const code = normalizeRoomCode(params.get('sala'));
    return isValidRoomCode(code) ? code : null;
  } catch {
    return null;
  }
};

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']);

// Decide a base do link do QR. Preferência: VITE_PUBLIC_APP_URL (hospedagem HTTPS).
// Sem ela, usa o endereço atual quando é http(s); avisa quando celulares não alcançam.
export const resolveJoinBaseUrl = ({ configuredUrl = '', location = null } = {}) => {
  const configured = String(configuredUrl || '').trim();
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === 'https:') return { baseUrl: url.toString(), warning: '' };
      return { baseUrl: url.toString(), warning: 'O endereço configurado não usa HTTPS. Alguns celulares podem bloquear o link.' };
    } catch {
      return { baseUrl: '', warning: 'VITE_PUBLIC_APP_URL não é um endereço válido. Use a entrada por código.' };
    }
  }
  if (location && /^https?:$/.test(location.protocol || '')) {
    const baseUrl = `${location.origin}${location.pathname}`;
    if (LOCAL_HOSTS.has(location.hostname)) {
      return { baseUrl, warning: 'Este endereço só funciona neste computador. Para o QR funcionar nos celulares, publique o app (ex.: Firebase Hosting) ou abra pelo IP da rede.' };
    }
    return { baseUrl, warning: '' };
  }
  return { baseUrl: '', warning: 'No app instalado não há link público. Os alunos entram digitando o código; para usar o QR, configure VITE_PUBLIC_APP_URL com o endereço publicado.' };
};

export const buildJoinUrl = (baseUrl, code) => {
  if (!baseUrl || !isValidRoomCode(code)) return '';
  try {
    const url = new URL(baseUrl);
    url.search = '';
    url.hash = '';
    url.searchParams.set('sala', code);
    return url.toString();
  } catch {
    return '';
  }
};

// ---------------------------------------------------------------------------
// Armazenamento: só sessionStorage, com prefixo próprio (D7)
// ---------------------------------------------------------------------------
export const STORAGE_PREFIX = 'obi-quest-pensa-comigo:';

export const readSessionValue = (storage, key, fallback) => {
  try {
    const raw = storage?.getItem(STORAGE_PREFIX + key);
    return raw === null || raw === undefined ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const writeSessionValue = (storage, key, value) => {
  try {
    storage?.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

// "Encerrar neste aparelho": remove tudo o que o modo guardou. Retorna quantas chaves saíram.
export const clearPensaComigoStorage = (storage) => {
  try {
    const keys = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key && key.startsWith(STORAGE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => storage.removeItem(key));
    return keys.length;
  } catch {
    return 0;
  }
};

// ---------------------------------------------------------------------------
// Tutor: local por padrão; o generativo depende de flag e de backend (D1, D12)
// ---------------------------------------------------------------------------
export const LOCAL_TUTOR_NOTICE = 'O tutor deste app segue regras fixas, escritas pela equipe. Ele não é uma IA generativa e nada do que você escreve sai deste aparelho.';

export const resolveTutorEngine = ({ flag = '', endpoint = '' } = {}) => {
  const enabled = String(flag).toLowerCase() === 'true';
  if (!enabled) return { engine: 'local', sendsText: false, notice: LOCAL_TUTOR_NOTICE, reason: 'flag-desligada' };
  // Esta versão não inclui o backend exigido pelo D12; com a flag ligada, o modo
  // continua local e diz isso, em vez de chamar um provedor direto do aparelho.
  return {
    engine: 'local',
    sendsText: false,
    notice: `${LOCAL_TUTOR_NOTICE} O tutor generativo foi pedido na configuração, mas não há backend instalado nesta versão.`,
    reason: endpoint ? 'backend-nao-implementado' : 'sem-endpoint'
  };
};

// ---------------------------------------------------------------------------
// CSV no padrão do OBI Quest: BOM UTF-8, CRLF e aspas em todas as células
// ---------------------------------------------------------------------------
export const toCsv = (rows) => `﻿${rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n')}`;
