// Transporte de dados do Pensa Comigo.
//
// Firestore (com Firebase configurado):
//   artifacts/{appId}/classrooms/{código}                       turma (mesmo formato do Professor + mode/hostUid)
//   artifacts/{appId}/classrooms/{código}/pensaComigo/state     etapa, grupos, liberações, contagens manuais (só o palestrante escreve)
//   artifacts/{appId}/classrooms/{código}/pensaComigoParticipants/{uid}  registro de cada aparelho (só o próprio aluno escreve)
// Cada aluno escreve apenas o próprio documento, então ~30 aparelhos não disputam o mesmo
// registro. Não há P2P: todos usam onSnapshot.
//
// Demonstração local (sem Firebase): os dados ficam na memória deste aparelho e são
// espelhados entre abas do mesmo navegador por BroadcastChannel, quando disponível.

import { collection, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const deepMerge = (target, patch) => {
  const output = { ...(target || {}) };
  Object.entries(patch || {}).forEach(([key, value]) => {
    output[key] = isPlainObject(value) && isPlainObject(output[key]) ? deepMerge(output[key], value) : value;
  });
  return output;
};

// Aplica chaves com ponto ("assignments.uid") como o updateDoc do Firestore.
export const applyFieldPaths = (target, patch) => {
  let output = { ...(target || {}) };
  Object.entries(patch || {}).forEach(([path, value]) => {
    const keys = path.split('.');
    if (keys.length === 1) {
      output[path] = value;
      return;
    }
    const nestedPatch = keys.reduceRight((acc, key) => ({ [key]: acc }), value);
    output = deepMerge(output, nestedPatch);
  });
  return output;
};

const createFirestoreTransport = (db, appId) => {
  const classroomRef = (code) => doc(db, 'artifacts', appId, 'classrooms', code);
  const stateRef = (code) => doc(db, 'artifacts', appId, 'classrooms', code, 'pensaComigo', 'state');
  const participantsRef = (code) => collection(db, 'artifacts', appId, 'classrooms', code, 'pensaComigoParticipants');
  const participantRef = (code, uid) => doc(db, 'artifacts', appId, 'classrooms', code, 'pensaComigoParticipants', uid);

  return {
    kind: 'firestore',
    async sessionInfo(code) {
      const snapshot = await getDoc(classroomRef(code));
      if (!snapshot.exists()) return { exists: false, isPensaComigo: false, title: '' };
      const data = snapshot.data();
      return { exists: true, isPensaComigo: data.mode === 'pensa-comigo', title: data.title || '' };
    },
    async createSession({ code, title, hostUid, state }) {
      const createdAt = new Date().toISOString();
      await setDoc(classroomRef(code), { code, title, topic: 'pensa-comigo', mode: 'pensa-comigo', hostUid, createdAt, participants: {} });
      await setDoc(stateRef(code), { ...state, hostUid, createdAt, updatedAt: createdAt });
    },
    watchState(code, onState, onError) {
      return onSnapshot(stateRef(code), (snapshot) => onState(snapshot.exists() ? snapshot.data() : null), onError);
    },
    async updateState(code, patch) {
      await updateDoc(stateRef(code), { ...patch, updatedAt: new Date().toISOString() });
    },
    watchParticipants(code, onList, onError) {
      return onSnapshot(participantsRef(code), (snapshot) => onList(snapshot.docs.map((item) => ({ uid: item.id, ...item.data() }))), onError);
    },
    async updateParticipant(code, uid, patch) {
      await setDoc(participantRef(code, uid), { ...patch, updatedAt: new Date().toISOString() }, { merge: true });
    }
  };
};

// ---------------------------------------------------------------------------
// Demonstração local
// ---------------------------------------------------------------------------
const localSessions = new Map();
const stateListeners = new Map();
const participantListeners = new Map();
let channel = null;

const getChannel = () => {
  if (channel !== null) return channel;
  try {
    channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('obi-quest-pensa-comigo-demo') : false;
  } catch {
    channel = false;
  }
  if (channel) {
    channel.onmessage = (event) => handleRemote(event.data);
    // No Node (testes), o canal não deve segurar o processo aberto.
    channel.unref?.();
  }
  return channel;
};

const ensureSession = (code) => {
  if (!localSessions.has(code)) localSessions.set(code, { info: null, state: null, participants: new Map() });
  return localSessions.get(code);
};

const emitState = (code) => {
  const session = ensureSession(code);
  (stateListeners.get(code) || new Set()).forEach((listener) => listener(session.state));
};

const emitParticipants = (code) => {
  const session = ensureSession(code);
  const list = [...session.participants.entries()].map(([uid, data]) => ({ uid, ...data }));
  (participantListeners.get(code) || new Set()).forEach((listener) => listener(list));
};

const broadcast = (message) => {
  const active = getChannel();
  if (active) {
    try {
      active.postMessage(message);
    } catch {
      // Sem espelhamento entre abas; a demonstração continua nesta aba.
    }
  }
};

function handleRemote(message) {
  if (!message || !message.code) return;
  const session = ensureSession(message.code);
  if (message.type === 'hello') {
    if (session.info) {
      broadcast({ type: 'snapshot', code: message.code, info: session.info, state: session.state, participants: [...session.participants.entries()] });
    }
    return;
  }
  if (message.type === 'snapshot') {
    if (!session.info) session.info = message.info;
    if (message.state && (!session.state || (message.state.updatedAt || '') >= (session.state.updatedAt || ''))) session.state = message.state;
    (message.participants || []).forEach(([uid, data]) => session.participants.set(uid, deepMerge(session.participants.get(uid), data)));
    emitState(message.code);
    emitParticipants(message.code);
    return;
  }
  if (message.type === 'state') {
    session.info = session.info || message.info;
    session.state = message.state;
    emitState(message.code);
    return;
  }
  if (message.type === 'participant') {
    session.participants.set(message.uid, message.data);
    emitParticipants(message.code);
  }
}

const addListener = (registry, code, listener) => {
  if (!registry.has(code)) registry.set(code, new Set());
  registry.get(code).add(listener);
  return () => registry.get(code)?.delete(listener);
};

const createLocalTransport = () => ({
  kind: 'local',
  async sessionInfo(code) {
    const session = localSessions.get(code);
    if (!session?.info) {
      broadcast({ type: 'hello', code });
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    const current = localSessions.get(code);
    if (!current?.info) return { exists: false, isPensaComigo: false, title: '' };
    return { exists: true, isPensaComigo: true, title: current.info.title };
  },
  async createSession({ code, title, hostUid, state }) {
    const session = ensureSession(code);
    const now = new Date().toISOString();
    session.info = { code, title, hostUid };
    session.state = { ...state, hostUid, createdAt: now, updatedAt: now };
    broadcast({ type: 'state', code, info: session.info, state: session.state });
    emitState(code);
  },
  watchState(code, onState) {
    const unsubscribe = addListener(stateListeners, code, onState);
    const session = ensureSession(code);
    if (session.state) onState(session.state);
    else broadcast({ type: 'hello', code });
    return unsubscribe;
  },
  async updateState(code, patch) {
    const session = ensureSession(code);
    session.state = applyFieldPaths(session.state, { ...patch, updatedAt: new Date().toISOString() });
    broadcast({ type: 'state', code, info: session.info, state: session.state });
    emitState(code);
  },
  watchParticipants(code, onList) {
    const unsubscribe = addListener(participantListeners, code, onList);
    emitParticipants(code);
    return unsubscribe;
  },
  async updateParticipant(code, uid, patch) {
    const session = ensureSession(code);
    const data = deepMerge(session.participants.get(uid), { ...patch, updatedAt: new Date().toISOString() });
    session.participants.set(uid, data);
    broadcast({ type: 'participant', code, uid, data });
    emitParticipants(code);
  },
  // Só na demonstração local: limpa a sessão desta aba.
  forget(code) {
    localSessions.delete(code);
  }
});

export const createTransport = ({ db, appId }) => (db ? createFirestoreTransport(db, appId) : createLocalTransport());
