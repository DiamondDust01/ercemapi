import test from 'node:test';
import assert from 'node:assert/strict';
import { selectPeerServers, summarizePing } from './peerPairing.js';

test('elects the device with the lowest measured ping and next-lowest as reserve', () => {
  assert.deepEqual(selectPeerServers({
    'device-a': { pingMs: 42 },
    'device-b': { pingMs: 18 },
    'device-c': { pingMs: 27 }
  }), {
    primaryUid: 'device-b',
    backupUid: 'device-c'
  });
});

test('uses a stable uid order when measured pings are equal', () => {
  assert.deepEqual(selectPeerServers({
    'device-z': { pingMs: 20 },
    'device-a': { pingMs: 20 }
  }), {
    primaryUid: 'device-a',
    backupUid: 'device-z'
  });
});

test('ignores missing and invalid ping measurements', () => {
  assert.deepEqual(selectPeerServers({
    'device-a': { pingMs: Number.NaN },
    'device-b': { pingMs: -1 },
    'device-c': { pingMs: 32 }
  }), {
    primaryUid: 'device-c',
    backupUid: null
  });
});

test('returns no elected devices when no valid measurements exist', () => {
  assert.deepEqual(selectPeerServers({}), {
    primaryUid: null,
    backupUid: null
  });
});

test('summarizes average, range, jitter and latest ping sample', () => {
  assert.deepEqual(summarizePing([20, 30, 25, 25]), {
    average: 25,
    minimum: 20,
    maximum: 30,
    jitter: 5,
    latest: 25
  });
});

test('ignores invalid samples and represents an empty measurement as unavailable', () => {
  assert.deepEqual(summarizePing([Number.NaN, -1, 41]), {
    average: 41,
    minimum: 41,
    maximum: 41,
    jitter: 0,
    latest: 41
  });
  assert.deepEqual(summarizePing([]), {
    average: null,
    minimum: null,
    maximum: null,
    jitter: null,
    latest: null
  });
});
