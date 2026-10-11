export const MAX_ROOM_PLAYERS = 16;

export function validateRoomSettings({ timeMinutes, minPlayers, maxPlayers }) {
  if (!Number.isInteger(timeMinutes) || timeMinutes < 1 || timeMinutes > 480) {
    return { valid: false, error: 'O tempo deve ser um número inteiro entre 1 e 480 minutos.' };
  }
  if (!Number.isInteger(minPlayers) || minPlayers < 1 || minPlayers > MAX_ROOM_PLAYERS) {
    return { valid: false, error: `O mínimo deve ficar entre 1 e ${MAX_ROOM_PLAYERS} jogadores.` };
  }
  if (!Number.isInteger(maxPlayers) || maxPlayers < minPlayers || maxPlayers > MAX_ROOM_PLAYERS) {
    return { valid: false, error: `O máximo deve ser igual ou maior que o mínimo e não pode passar de ${MAX_ROOM_PLAYERS}.` };
  }
  return { valid: true, error: '' };
}

export function getRoomPlayerCount(players) {
  return Object.keys(players || {}).length;
}

export function getRoomStartState(room) {
  const playerCount = getRoomPlayerCount(room?.players);
  const minPlayers = Number.isInteger(room?.minPlayers) ? room.minPlayers : 1;
  const maxPlayers = Number.isInteger(room?.maxPlayers) ? room.maxPlayers : MAX_ROOM_PLAYERS;
  const isLobby = !room?.status || room.status === 'lobby' || room.status === 'paused';
  const canStart = isLobby && playerCount >= minPlayers && playerCount <= maxPlayers;

  return {
    canStart,
    playerCount,
    minPlayers,
    maxPlayers,
    playersNeeded: Math.max(0, minPlayers - playerCount),
    isFull: playerCount >= maxPlayers
  };
}
