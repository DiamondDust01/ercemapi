import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRoomPlayerCount,
  getRoomStartState,
  validateRoomSettings
} from './competitionRooms.js';

test('accepts valid room duration and player limits', () => {
  assert.deepEqual(validateRoomSettings({
    timeMinutes: 45,
    minPlayers: 2,
    maxPlayers: 8
  }), { valid: true, error: '' });
});

test('rejects invalid time and inconsistent player limits', () => {
  assert.equal(validateRoomSettings({ timeMinutes: 0, minPlayers: 2, maxPlayers: 8 }).valid, false);
  assert.equal(validateRoomSettings({ timeMinutes: 481, minPlayers: 2, maxPlayers: 8 }).valid, false);
  assert.equal(validateRoomSettings({ timeMinutes: 30, minPlayers: 0, maxPlayers: 8 }).valid, false);
  assert.equal(validateRoomSettings({ timeMinutes: 30, minPlayers: 9, maxPlayers: 8 }).valid, false);
  assert.equal(validateRoomSettings({ timeMinutes: 30, minPlayers: 2, maxPlayers: 17 }).valid, false);
});

test('reports room count, remaining players and capacity', () => {
  const room = {
    status: 'lobby',
    minPlayers: 3,
    maxPlayers: 3,
    players: { host: {}, guest: {} }
  };
  assert.equal(getRoomPlayerCount(room.players), 2);
  assert.deepEqual(getRoomStartState(room), {
    canStart: false,
    playerCount: 2,
    minPlayers: 3,
    maxPlayers: 3,
    playersNeeded: 1,
    isFull: false
  });
  assert.equal(getRoomStartState({
    ...room,
    players: { host: {}, guest: {}, third: {} }
  }).canStart, true);
  assert.equal(getRoomStartState({
    ...room,
    players: { host: {}, guest: {}, third: {}, fourth: {} }
  }).canStart, false);
});

test('keeps previously created rooms without player limits compatible', () => {
  assert.deepEqual(getRoomStartState({
    status: 'lobby',
    players: { host: {} }
  }), {
    canStart: true,
    playerCount: 1,
    minPlayers: 1,
    maxPlayers: 16,
    playersNeeded: 0,
    isFull: false
  });
});
