// Distribuição balanceada do experimento. Cada participante passa pelos dois modos:
// - grupo "copiar-A": Tema A copiando a resposta pronta e Tema B estudando ativamente;
// - grupo "ativo-A":  Tema A estudando ativamente e Tema B copiando.
// O palestrante (um único escritor) atribui os grupos pela ordem de entrada, sempre
// completando o grupo com menos pessoas; empates alternam pela posição na fila.

export const GROUPS = ['copiar-A', 'ativo-A'];

export const GROUP_LABELS = {
  'copiar-A': 'Grupo 1',
  'ativo-A': 'Grupo 2'
};

export const isValidGroup = (group) => GROUPS.includes(group);

export const modeFor = (group, theme) => {
  if (!isValidGroup(group)) return null;
  const copiesA = group === 'copiar-A';
  if (theme === 'A') return copiesA ? 'copiar' : 'ativo';
  if (theme === 'B') return copiesA ? 'ativo' : 'copiar';
  return null;
};

export const countGroups = (assignments = {}) => {
  const counts = Object.fromEntries(GROUPS.map((group) => [group, 0]));
  Object.values(assignments).forEach((assignment) => {
    if (assignment && isValidGroup(assignment.group)) counts[assignment.group] += 1;
  });
  return counts;
};

const byJoinOrder = (left, right) => {
  const leftTime = Date.parse(left.joinedAt || '') || 0;
  const rightTime = Date.parse(right.joinedAt || '') || 0;
  if (leftTime !== rightTime) return leftTime - rightTime;
  return String(left.uid).localeCompare(String(right.uid));
};

// Retorna somente as novas atribuições: { [uid]: { group, order } }.
// Atribuições existentes nunca mudam.
export const assignBalancedGroups = (participants = [], existing = {}) => {
  const counts = countGroups(existing);
  let order = Object.values(existing).reduce((max, assignment) => Math.max(max, Number(assignment?.order) || 0), 0);
  const pending = participants
    .filter((participant) => participant?.uid && !existing[participant.uid])
    .sort(byJoinOrder);
  const assigned = {};
  pending.forEach((participant) => {
    order += 1;
    const [first, second] = GROUPS;
    let group;
    if (counts[first] < counts[second]) group = first;
    else if (counts[second] < counts[first]) group = second;
    else group = order % 2 === 1 ? first : second;
    counts[group] += 1;
    assigned[participant.uid] = { group, order };
  });
  return assigned;
};
