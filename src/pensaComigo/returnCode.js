// Código de retorno do re-teste: 4 caracteres sorteados + 1 verificador.
// O verificador também guarda o grupo do experimento, então o re-teste (no app ou
// em papel) volta para o grupo certo sem nenhum dado pessoal e sem consulta ao servidor.
// O alfabeto evita caracteres confundíveis (0/O, 1/I/L).

import { GROUPS } from './assignment.js';

export const RETURN_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const BASE = RETURN_CODE_ALPHABET.length; // 31, primo
const GROUP_OFFSET = { 'copiar-A': 0, 'ativo-A': 13 };

const checksum = (body, group) => {
  const weighted = [...body].reduce((sum, char, index) => sum + (index + 1) * RETURN_CODE_ALPHABET.indexOf(char), 0);
  return RETURN_CODE_ALPHABET[(weighted + GROUP_OFFSET[group]) % BASE];
};

export const createReturnCode = (group, random = Math.random) => {
  if (!GROUPS.includes(group)) throw new Error('Grupo inválido para o código de retorno.');
  let body = '';
  for (let index = 0; index < 4; index += 1) {
    body += RETURN_CODE_ALPHABET[Math.min(BASE - 1, Math.floor(random() * BASE))];
  }
  return body + checksum(body, group);
};

export const normalizeReturnCode = (value) => String(value || '').toUpperCase().replace(/[\s-]/g, '');

export const formatReturnCode = (code) => {
  const normalized = normalizeReturnCode(code);
  return normalized.length === 5 ? `${normalized.slice(0, 4)}-${normalized.slice(4)}` : normalized;
};

// { valid, group, code, error }
export const parseReturnCode = (value) => {
  const code = normalizeReturnCode(value);
  if (code.length !== 5) return { valid: false, group: null, code, error: 'O código tem 5 caracteres, como K7M2-Q.' };
  if (![...code].every((char) => RETURN_CODE_ALPHABET.includes(char))) {
    return { valid: false, group: null, code, error: 'O código só usa números de 2 a 9 e letras (sem I, L e O).' };
  }
  const body = code.slice(0, 4);
  const group = GROUPS.find((candidate) => checksum(body, candidate) === code[4]);
  if (!group) return { valid: false, group: null, code, error: 'Código não reconhecido. Confira o que você anotou no caderno.' };
  return { valid: true, group, code, error: '' };
};
