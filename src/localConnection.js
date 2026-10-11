const QUALITY_LABELS = {
  good: 'Boa',
  fair: 'Regular',
  poor: 'Limitada',
  unknown: 'Ativa'
};

const CONNECTION_TYPES = {
  bluetooth: 'Bluetooth',
  cellular: 'Dados móveis',
  ethernet: 'Ethernet',
  none: 'Sem rede',
  other: 'Outra rede',
  unknown: 'Tipo desconhecido',
  wifi: 'Wi-Fi',
  wimax: 'WiMAX'
};

export function getLocalConnectionQuality({
  onLine = true,
  effectiveType = '',
  downlinkMbps = null,
  rttMs = null,
  connectionType = ''
} = {}) {
  const normalizedType = effectiveType.toLowerCase();
  const typeLabel = CONNECTION_TYPES[connectionType] || '';

  if (!onLine || connectionType === 'none') {
    return {
      online: false,
      quality: 'poor',
      label: 'Sem rede',
      typeLabel,
      effectiveType: normalizedType,
      downlinkMbps: null,
      rttMs: null
    };
  }

  let quality = ({
    'slow-2g': 'poor',
    '2g': 'poor',
    '3g': 'fair',
    '4g': 'good'
  })[normalizedType] || 'unknown';

  if (Number.isFinite(rttMs) && rttMs >= 500 || Number.isFinite(downlinkMbps) && downlinkMbps < 0.5) {
    quality = 'poor';
  } else if (Number.isFinite(rttMs) && rttMs >= 250 || Number.isFinite(downlinkMbps) && downlinkMbps < 1.5) {
    quality = 'fair';
  }

  return {
    online: true,
    quality,
    label: QUALITY_LABELS[quality],
    typeLabel,
    effectiveType: normalizedType,
    downlinkMbps: Number.isFinite(downlinkMbps) ? downlinkMbps : null,
    rttMs: Number.isFinite(rttMs) ? rttMs : null
  };
}

export function readLocalConnectionQuality(navigatorObject = globalThis.navigator) {
  const connection = navigatorObject?.connection
    || navigatorObject?.mozConnection
    || navigatorObject?.webkitConnection;

  return getLocalConnectionQuality({
    onLine: navigatorObject?.onLine !== false,
    effectiveType: connection?.effectiveType || '',
    downlinkMbps: connection?.downlink ?? null,
    rttMs: connection?.rtt ?? null,
    connectionType: connection?.type || ''
  });
}
