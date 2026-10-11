import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc
} from 'firebase/firestore';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];
const PING_INTERVAL_MS = 1500;
const SCORE_EXPIRY_MS = 6000;

export function selectPeerServers(candidates) {
  const ranked = Object.entries(candidates)
    .filter(([, candidate]) => Number.isFinite(candidate.pingMs) && candidate.pingMs >= 0)
    .sort((left, right) => left[1].pingMs - right[1].pingMs || left[0].localeCompare(right[0]));

  return {
    primaryUid: ranked[0]?.[0] || null,
    backupUid: ranked[1]?.[0] || null
  };
}

function createSessionId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function encodeId(value) {
  return encodeURIComponent(value);
}

export class PeerPairing {
  constructor({ roomRef, uid, onStatus = () => {}, onMessage = () => {} }) {
    this.roomRef = roomRef;
    this.uid = uid;
    this.onStatus = onStatus;
    this.onMessage = onMessage;
    this.sessionId = createSessionId();
    this.peers = new Map();
    this.reportedScores = new Map();
    this.roomUnsubscribe = null;
    this.pingInterval = null;
    this.restartTimer = null;
    this.closed = false;
    this.lastError = '';
    this.leadership = { primaryUid: null, backupUid: null };
  }

  start() {
    if (!globalThis.RTCPeerConnection) {
      this._publishStatus({ error: 'Este dispositivo não oferece suporte a conexões WebRTC.' });
      return;
    }

    this.roomUnsubscribe = onSnapshot(
      this.roomRef,
      (snapshot) => {
        if (snapshot.exists()) this._syncPlayers(snapshot.data().players || {});
      },
      (error) => this._publishStatus({ error: `Falha ao descobrir participantes: ${error.message}` })
    );
    this.pingInterval = setInterval(() => this._sendPings(), PING_INTERVAL_MS);
  }

  close() {
    this.closed = true;
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.restartTimer) clearTimeout(this.restartTimer);
    this.roomUnsubscribe?.();
    this.peers.forEach((peer) => this._closePeer(peer));
    this.peers.clear();
  }

  sendTo(uid, message) {
    const channel = this.peers.get(uid)?.channel;
    if (!channel || channel.readyState !== 'open') return false;
    try {
      channel.send(JSON.stringify(message));
      return true;
    } catch (error) {
      this._publishStatus({ error: `Não foi possível enviar ao servidor principal: ${error.message}` });
      return false;
    }
  }

  async _syncPlayers(players) {
    if (this.closed) return;

    const ownPlayer = players[this.uid];
    if (!ownPlayer?.peerSessionId || ownPlayer.peerSessionId !== this.sessionId) {
      try {
        await updateDoc(this.roomRef, {
          [`players.${this.uid}.peerSessionId`]: this.sessionId
        });
      } catch (error) {
        this._publishStatus({ error: `Não foi possível anunciar este dispositivo: ${error.message}` });
      }
      return;
    }

    const currentUids = new Set(Object.keys(players).filter((peerUid) => peerUid !== this.uid));
    for (const [peerUid, peer] of this.peers) {
      if (!currentUids.has(peerUid) || players[peerUid]?.peerSessionId !== peer.remoteSessionId) {
        this._closePeer(peer);
        this.peers.delete(peerUid);
        this.reportedScores.delete(peerUid);
      }
    }

    for (const [peerUid, player] of Object.entries(players)) {
      if (peerUid === this.uid || !player.peerSessionId || this.peers.has(peerUid)) continue;
      try {
        this._connectTo(peerUid, player.peerSessionId);
      } catch (error) {
        this._publishStatus({ error: `Não foi possível iniciar conexão com ${peerUid}: ${error.message}` });
      }
    }
    this._electServers();
  }

  _connectTo(peerUid, remoteSessionId) {
    const isOfferer = this.uid.localeCompare(peerUid) < 0;
    const first = isOfferer
      ? [this.uid, this.sessionId]
      : [peerUid, remoteSessionId];
    const second = isOfferer
      ? [peerUid, remoteSessionId]
      : [this.uid, this.sessionId];
    const signalId = `${encodeId(first[0])}__${encodeId(second[0])}`;
    const signalRef = doc(collection(this.roomRef, 'peerSignals'), signalId);
    const peer = {
      uid: peerUid,
      remoteSessionId,
      isOfferer,
      signalRef,
      connection: new RTCPeerConnection({ iceServers: ICE_SERVERS }),
      channel: null,
      signalUnsubscribe: null,
      remoteCandidateIds: new Set(),
      localCandidates: [],
      signalReady: false,
      remoteDescriptionReady: false,
      answerStarted: false,
      answerApplied: false,
      processing: Promise.resolve(),
      samples: []
    };
    this.peers.set(peerUid, peer);

    peer.connection.onicecandidate = ({ candidate }) => {
      if (candidate) this._publishCandidate(peer, candidate.toJSON());
    };
    peer.connection.onconnectionstatechange = () => {
      this._publishStatus({});
      if (peer.connection.connectionState === 'failed') {
        this.reportedScores.delete(peerUid);
        this._scheduleRestart();
        this._electServers();
      }
    };
    peer.connection.ondatachannel = ({ channel }) => this._attachChannel(peer, channel);
    if (isOfferer) {
      this._attachChannel(peer, peer.connection.createDataChannel('obi-quest-pairing'));
    }

    peer.signalUnsubscribe = onSnapshot(
      signalRef,
      (snapshot) => {
        if (!snapshot.exists()) return;
        peer.processing = peer.processing
          .then(() => this._processSignal(peer, snapshot.data()))
          .catch((error) => this._publishStatus({ error: `Falha na conexão com ${peerUid}: ${error.message}` }));
      },
      (error) => this._publishStatus({ error: `Falha na sinalização com ${peerUid}: ${error.message}` })
    );

    if (isOfferer) {
      this._createOffer(peer).catch((error) => {
        this._publishStatus({ error: `Não foi possível iniciar conexão com ${peerUid}: ${error.message}` });
      });
    }
    this._publishStatus({});
  }

  async _createOffer(peer) {
    const offer = await peer.connection.createOffer();
    await peer.connection.setLocalDescription(offer);
    await setDoc(peer.signalRef, {
      offererUid: this.uid,
      offererSessionId: this.sessionId,
      answererSessionId: peer.remoteSessionId,
      offer: peer.connection.localDescription.toJSON(),
      initiatorCandidates: [],
      responderCandidates: [],
      createdAt: new Date().toISOString()
    });
    peer.signalReady = true;
    await this._flushLocalCandidates(peer);
  }

  async _processSignal(peer, signal) {
    const sessionMatches = signal.offererUid === (peer.isOfferer ? this.uid : peer.uid)
      && signal.offererSessionId === (peer.isOfferer ? this.sessionId : peer.remoteSessionId)
      && signal.answererSessionId === (peer.isOfferer ? peer.remoteSessionId : this.sessionId);
    if (!sessionMatches) return;

    if (peer.isOfferer && signal.answer && !peer.answerApplied) {
      await peer.connection.setRemoteDescription(signal.answer);
      peer.answerApplied = true;
      peer.remoteDescriptionReady = true;
      await this._addRemoteCandidates(peer, signal.responderCandidates || []);
      return;
    }

    if (!peer.isOfferer && signal.offer && !peer.answerStarted) {
      peer.answerStarted = true;
      await peer.connection.setRemoteDescription(signal.offer);
      peer.remoteDescriptionReady = true;
      await this._addRemoteCandidates(peer, signal.initiatorCandidates || []);
      const answer = await peer.connection.createAnswer();
      await peer.connection.setLocalDescription(answer);
      await updateDoc(peer.signalRef, {
        answererUid: this.uid,
        answer: peer.connection.localDescription.toJSON()
      });
      peer.signalReady = true;
      await this._flushLocalCandidates(peer);
      return;
    }

    if (peer.remoteDescriptionReady) {
      await this._addRemoteCandidates(
        peer,
        peer.isOfferer ? signal.responderCandidates || [] : signal.initiatorCandidates || []
      );
    }
  }

  _attachChannel(peer, channel) {
    peer.channel = channel;
    channel.onopen = () => {
      this._publishStatus({});
      this._sendScoreReport();
    };
    channel.onmessage = ({ data }) => {
      try {
        const message = JSON.parse(data);
        if (message.type === 'ping') {
          channel.send(JSON.stringify({ type: 'pong', sentAt: message.sentAt }));
        } else if (message.type === 'pong') {
          peer.samples.push(Math.max(0, Date.now() - message.sentAt));
          peer.samples = peer.samples.slice(-5);
          this._sendScoreReport();
          this._electServers();
        } else if (message.type === 'server-score' && Number.isFinite(message.pingMs)) {
          this.reportedScores.set(peer.uid, { pingMs: message.pingMs, updatedAt: Date.now() });
          this._electServers();
        } else {
          this.onMessage({ fromUid: peer.uid, message });
        }
      } catch (error) {
        this._publishStatus({ error: `Mensagem inválida recebida de ${peer.uid}: ${error.message}` });
      }
    };
    channel.onclose = () => {
      this._publishStatus({});
      this._electServers();
    };
    channel.onerror = () => this._publishStatus({ error: `O canal com ${peer.uid} apresentou uma falha.` });
  }

  _sendPings() {
    for (const peer of this.peers.values()) {
      if (peer.channel?.readyState === 'open') {
        try {
          peer.channel.send(JSON.stringify({ type: 'ping', sentAt: Date.now() }));
        } catch (error) {
          this._publishStatus({ error: `Falha ao medir ping com ${peer.uid}: ${error.message}` });
        }
      }
    }
    this._sendScoreReport();
    this._electServers();
  }

  _sendScoreReport() {
    const openPeers = [...this.peers.values()].filter((peer) => peer.channel?.readyState === 'open');
    const measured = openPeers.flatMap((peer) => peer.samples);
    const candidates = openPeers.length === 0
      ? [0]
      : measured.length > 0 ? measured : [];
    if (candidates.length === 0) return;
    const pingMs = candidates.reduce((total, sample) => total + sample, 0) / candidates.length;
    const report = JSON.stringify({ type: 'server-score', pingMs });
    for (const peer of openPeers) {
      try {
        peer.channel.send(report);
      } catch (error) {
        this._publishStatus({ error: `Falha ao compartilhar a medição de ping: ${error.message}` });
      }
    }
    this.reportedScores.set(this.uid, { pingMs, updatedAt: Date.now() });
    this._electServers();
  }

  _electServers() {
    const now = Date.now();
    const candidates = {};
    for (const [uid, score] of this.reportedScores) {
      if (now - score.updatedAt <= SCORE_EXPIRY_MS) candidates[uid] = score;
    }
    const connectedPeers = [...this.peers.values()].filter((peer) => peer.channel?.readyState === 'open');
    if (!candidates[this.uid] && connectedPeers.length === 0) candidates[this.uid] = { pingMs: 0 };
    const next = selectPeerServers(candidates);
    this.leadership = next;
    this._publishStatus({});
  }

  async _publishCandidate(peer, candidate) {
    if (!peer.signalReady) {
      peer.localCandidates.push(candidate);
      return;
    }
    const field = peer.isOfferer ? 'initiatorCandidates' : 'responderCandidates';
    try {
      await updateDoc(peer.signalRef, { [field]: arrayUnion(candidate) });
    } catch (error) {
      this._publishStatus({ error: `Falha ao encaminhar candidato ICE: ${error.message}` });
    }
  }

  async _flushLocalCandidates(peer) {
    const candidates = peer.localCandidates.splice(0);
    for (const candidate of candidates) await this._publishCandidate(peer, candidate);
  }

  async _addRemoteCandidates(peer, candidates) {
    for (const candidate of candidates) {
      const key = `${candidate.candidate}|${candidate.sdpMid}|${candidate.sdpMLineIndex}`;
      if (peer.remoteCandidateIds.has(key)) continue;
      peer.remoteCandidateIds.add(key);
      await peer.connection.addIceCandidate(candidate);
    }
  }

  _publishStatus(extra) {
    if (extra.error) this.lastError = extra.error;
    const peers = [...this.peers.values()].map((peer) => ({
      uid: peer.uid,
      state: peer.connection.connectionState,
      pingMs: peer.samples.length ? Math.round(peer.samples[peer.samples.length - 1]) : null
    }));
    if (peers.some((peer) => peer.state === 'connected')) this.lastError = '';
    this.onStatus({
      state: this.peers.size === 0 ? 'waiting' : peers.some((peer) => peer.state === 'connected') ? 'connected' : 'connecting',
      peers,
      primaryUid: this.leadership.primaryUid,
      backupUid: this.leadership.backupUid,
      error: this.lastError,
      ...extra
    });
  }

  _scheduleRestart() {
    if (this.closed || this.restartTimer) return;
    this.restartTimer = setTimeout(async () => {
      this.restartTimer = null;
      if (this.closed) return;
      this.sessionId = createSessionId();
      this.peers.forEach((peer) => this._closePeer(peer));
      this.peers.clear();
      this.reportedScores.clear();
      this.leadership = { primaryUid: null, backupUid: null };
      try {
        await updateDoc(this.roomRef, {
          [`players.${this.uid}.peerSessionId`]: this.sessionId
        });
      } catch (error) {
        this._publishStatus({ error: `Não foi possível restabelecer o pareamento: ${error.message}` });
      }
    }, 1500);
  }

  _closePeer(peer) {
    peer.signalUnsubscribe?.();
    peer.channel?.close();
    peer.connection.close();
  }
}
