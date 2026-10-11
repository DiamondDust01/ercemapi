import test from 'node:test';
import assert from 'node:assert/strict';
import { getLocalConnectionQuality, readLocalConnectionQuality } from './localConnection.js';

test('reports disconnected state from the device network indicator', () => {
  assert.deepEqual(getLocalConnectionQuality({ onLine: false }), {
    online: false,
    quality: 'poor',
    label: 'Sem rede',
    typeLabel: '',
    effectiveType: '',
    downlinkMbps: null,
    rttMs: null
  });
});

test('uses the browser effective connection type for an approximate local quality', () => {
  assert.equal(getLocalConnectionQuality({ effectiveType: '4g' }).label, 'Boa');
  assert.equal(getLocalConnectionQuality({ effectiveType: '3g' }).label, 'Regular');
  assert.equal(getLocalConnectionQuality({ effectiveType: '2g' }).label, 'Limitada');
});

test('downgrades quality when locally estimated RTT or throughput is poor', () => {
  assert.equal(getLocalConnectionQuality({ effectiveType: '4g', rttMs: 550 }).label, 'Limitada');
  assert.equal(getLocalConnectionQuality({ effectiveType: '4g', downlinkMbps: 1 }).label, 'Regular');
});

test('does not claim to know connection quality when the browser exposes no estimates', () => {
  assert.deepEqual(getLocalConnectionQuality({ onLine: true, connectionType: 'wifi' }), {
    online: true,
    quality: 'unknown',
    label: 'Ativa',
    typeLabel: 'Wi-Fi',
    effectiveType: '',
    downlinkMbps: null,
    rttMs: null
  });
});

test('reads local navigator indicators without sending network requests', () => {
  assert.deepEqual(readLocalConnectionQuality({
    onLine: true,
    connection: { effectiveType: '3g', downlink: 2.4, rtt: 180, type: 'wifi' }
  }), {
    online: true,
    quality: 'fair',
    label: 'Regular',
    typeLabel: 'Wi-Fi',
    effectiveType: '3g',
    downlinkMbps: 2.4,
    rttMs: 180
  });
});

test('uses the system online flag when no connection quality API is available', () => {
  assert.deepEqual(readLocalConnectionQuality({ onLine: true }), {
    online: true,
    quality: 'unknown',
    label: 'Ativa',
    typeLabel: '',
    effectiveType: '',
    downlinkMbps: null,
    rttMs: null
  });
});
