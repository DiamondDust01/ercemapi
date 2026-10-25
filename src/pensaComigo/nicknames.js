// Apelidos sorteados (animal + adjetivo, com concordância de gênero em pt-BR).
// O aluno não digita nome no Pensa Comigo; só pode sortear outro apelido.

export const NICKNAME_ANIMALS = [
  { name: 'Capivara', gender: 'f' }, { name: 'Coruja', gender: 'f' }, { name: 'Tartaruga', gender: 'f' },
  { name: 'Arara', gender: 'f' }, { name: 'Onça', gender: 'f' }, { name: 'Baleia', gender: 'f' },
  { name: 'Formiga', gender: 'f' }, { name: 'Raposa', gender: 'f' }, { name: 'Lontra', gender: 'f' },
  { name: 'Girafa', gender: 'f' }, { name: 'Abelha', gender: 'f' }, { name: 'Ararinha', gender: 'f' },
  { name: 'Tucano', gender: 'm' }, { name: 'Tatu', gender: 'm' }, { name: 'Golfinho', gender: 'm' },
  { name: 'Jabuti', gender: 'm' }, { name: 'Lobo-guará', gender: 'm' }, { name: 'Mico-leão', gender: 'm' },
  { name: 'Panda', gender: 'm' }, { name: 'Polvo', gender: 'm' }, { name: 'Pinguim', gender: 'm' },
  { name: 'Quati', gender: 'm' }, { name: 'Boto', gender: 'm' }, { name: 'Camaleão', gender: 'm' }
];

export const NICKNAME_ADJECTIVES = [
  { m: 'Curioso', f: 'Curiosa' }, { m: 'Atento', f: 'Atenta' }, { m: 'Esperto', f: 'Esperta' },
  { m: 'Criativo', f: 'Criativa' }, { m: 'Corajoso', f: 'Corajosa' }, { m: 'Paciente', f: 'Paciente' },
  { m: 'Investigador', f: 'Investigadora' }, { m: 'Sabido', f: 'Sabida' }, { m: 'Focado', f: 'Focada' },
  { m: 'Pensador', f: 'Pensadora' }, { m: 'Calmo', f: 'Calma' }, { m: 'Veloz', f: 'Veloz' },
  { m: 'Detetive', f: 'Detetive' }, { m: 'Brilhante', f: 'Brilhante' }, { m: 'Questionador', f: 'Questionadora' },
  { m: 'Estudioso', f: 'Estudiosa' }
];

export const NICKNAME_COMBINATIONS = NICKNAME_ANIMALS.length * NICKNAME_ADJECTIVES.length;

const pick = (list, random) => list[Math.min(list.length - 1, Math.floor(random() * list.length))];

export const buildNickname = (animal, adjective) => `${animal.name} ${adjective[animal.gender]}`;

// Sorteia um apelido diferente de `previous` (quando possível).
export const drawNickname = (random = Math.random, previous = '') => {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const nickname = buildNickname(pick(NICKNAME_ANIMALS, random), pick(NICKNAME_ADJECTIVES, random));
    if (nickname !== previous) return nickname;
  }
  const fallbackAnimal = NICKNAME_ANIMALS.find((animal) => !previous.startsWith(animal.name)) || NICKNAME_ANIMALS[0];
  return buildNickname(fallbackAnimal, NICKNAME_ADJECTIVES[0]);
};

export const formatParticipantName = (nickname, kind) => (kind === 'dupla' ? `Dupla ${nickname}` : nickname);

const ALL_NICKNAMES = new Set(NICKNAME_ANIMALS.flatMap((animal) => NICKNAME_ADJECTIVES.map((adjective) => buildNickname(animal, adjective))));

// Só aceita apelidos que o próprio sorteio pode gerar (impede texto livre, como nomes).
export const isDrawnNickname = (nickname) => ALL_NICKNAMES.has(nickname);
