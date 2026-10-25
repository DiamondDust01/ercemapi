import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createTransport, deepMerge } from './transport.js';
import { assignBalancedGroups } from './assignment.js';
import {
  getStage, isValidRoomCode, normalizeRoomCode, createRoomCode, resolveJoinBaseUrl, readSessionValue,
  writeSessionValue, clearPensaComigoStorage, resolveTutorEngine, experimentContentLocked
} from './session.js';
import { drawNickname, formatParticipantName, isDrawnNickname } from './nicknames.js';
import { createReturnCode } from './returnCode.js';
import { EXPERIMENT_ITEM_IDS, HONESTY_NOTES } from './content.js';
import HostView from './HostView.jsx';
import ChallengePicker from './ChallengePicker.jsx';
import {
  PollStage, TenteStage, RemixStage, MeTesteStage, DetectiveStage, ExperimentStage, QuizStage, ResultStage,
  ClosingStage, RetestStage
} from './StudentStages.jsx';
import { buttonPrimary, buttonSecondary, buttonDanger, inputClass, Card, Notice } from './ui.jsx';
import ThemeToggle from '../ThemeToggle.jsx';

const storage = typeof window !== 'undefined' ? window.sessionStorage : null;

const INITIAL_STATE = {
  stage: 'abertura',
  assignments: {},
  freePlay: false,
  unlocks: { advanced: false, hidden: false },
  manual: { cards: {}, experiment: {} }
};

const randomId = () => {
  try {
    return `local-${crypto.randomUUID()}`;
  } catch {
    return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
};

const tutorEngine = resolveTutorEngine({
  flag: import.meta.env.VITE_ENABLE_LLM_TUTOR,
  endpoint: import.meta.env.VITE_LLM_TUTOR_ENDPOINT
});

const STAGE_COMPONENTS = {
  abertura: PollStage,
  'tente-primeiro': TenteStage,
  remix: RemixStage,
  'me-teste': MeTesteStage,
  detetive: DetectiveStage,
  experimento: ExperimentStage,
  quiz: QuizStage,
  resultado: ResultStage,
  fechamento: ClosingStage,
  reteste: RetestStage
};

export default function PensaComigo({ db, user, appId, programming, initialRoomCode = '', onExit }) {
  const transport = useMemo(() => createTransport({ db, appId }), [db, appId]);
  const isLocal = transport.kind === 'local';
  const [localUid] = useState(() => {
    const saved = readSessionValue(storage, 'local-uid', null);
    if (saved) return saved;
    const created = randomId();
    writeSessionValue(storage, 'local-uid', created);
    return created;
  });
  const uid = db ? user?.uid || null : localUid;

  const [host, setHost] = useState(() => readSessionValue(storage, 'host', null));
  const [student, setStudent] = useState(() => readSessionValue(storage, 'student', null));
  const [view, setView] = useState(() => {
    if (initialRoomCode) return 'join';
    if (readSessionValue(storage, 'student', null)?.code) return 'student';
    if (readSessionValue(storage, 'host', null)?.code) return 'host';
    return 'landing';
  });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  // Formulários
  const [joinCode, setJoinCode] = useState(initialRoomCode || '');
  const [nickname, setNickname] = useState(() => drawNickname());
  const [kind, setKind] = useState('solo');
  const [hostTitle, setHostTitle] = useState('Palestra Pensa Comigo');
  const [resumeCode, setResumeCode] = useState('');

  // Dados sincronizados
  const activeCode = view === 'host' ? host?.code : view === 'student' ? student?.code : null;
  const [roomState, setRoomState] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => { writeSessionValue(storage, 'host', host); }, [host]);
  useEffect(() => { writeSessionValue(storage, 'student', student); }, [student]);

  useEffect(() => {
    if (!activeCode) return undefined;
    setRoomState(null);
    return transport.watchState(activeCode, (state) => setRoomState(state), () => setMessage('Sem acesso à sala no momento. Verifique a conexão.'));
  }, [activeCode, transport]);

  // O palestrante acompanha a turma enquanto a sala dele existir neste aparelho,
  // inclusive quando ensaia a visão do aluno na mesma aba.
  useEffect(() => {
    if (!host?.code) return undefined;
    return transport.watchParticipants(host.code, setParticipants, () => setMessage('Não foi possível ler os participantes. Confira as regras do Firestore para o Pensa Comigo.'));
  }, [host?.code, transport]);

  // O palestrante é o único que atribui grupos: sem disputa entre ~30 aparelhos.
  // As atribuições ainda em gravação contam no equilíbrio, para não sortear duas vezes.
  const pendingAssignments = useRef({});
  const hostControls = Boolean(host?.code) && activeCode === host?.code && roomState?.hostUid === uid;
  useEffect(() => {
    if (!hostControls) return;
    const known = { ...(roomState.assignments || {}), ...pendingAssignments.current };
    const entries = Object.entries(assignBalancedGroups(participants, known));
    if (!entries.length) return;
    entries.forEach(([participantUid, assignment]) => { pendingAssignments.current[participantUid] = assignment; });
    const patch = Object.fromEntries(entries.map(([participantUid, assignment]) => [`assignments.${participantUid}`, assignment]));
    transport.updateState(host.code, patch)
      .catch(() => setMessage('Não foi possível gravar os grupos. Verifique a conexão e as regras do Firestore.'))
      .finally(() => entries.forEach(([participantUid]) => { delete pendingAssignments.current[participantUid]; }));
  }, [hostControls, participants, roomState?.assignments, transport, host?.code]);

  // Código de retorno: criado no aparelho quando o grupo chega.
  const group = student && roomState?.assignments?.[uid]?.group;
  useEffect(() => {
    if (view !== 'student' || !group || student?.returnCode) return;
    const returnCode = createReturnCode(group);
    setStudent((previous) => ({ ...previous, returnCode, record: deepMerge(previous.record, { group, returnCode }) }));
    transport.updateParticipant(student.code, uid, { group, returnCode }).catch(() => {});
  }, [view, group, student?.returnCode, student?.code, transport, uid]);

  const saveRecord = (patch) => {
    if (!student?.code || !uid) return;
    setStudent((previous) => ({ ...previous, record: deepMerge(previous.record, patch) }));
    transport.updateParticipant(student.code, uid, patch).catch(() => setMessage('Sem conexão agora. Sua resposta ficou neste aparelho e será enviada quando a rede voltar, se a página continuar aberta.'));
  };

  const endOnDevice = () => {
    const removed = clearPensaComigoStorage(storage);
    if (isLocal && activeCode) transport.forget?.(activeCode);
    setHost(null);
    setStudent(null);
    setRoomState(null);
    setParticipants([]);
    setNickname(drawNickname());
    setJoinCode('');
    setView('landing');
    setMessage(`Pronto: os dados do Pensa Comigo foram apagados deste aparelho (${removed} registro(s)). O restante do OBI Quest não foi alterado.`);
  };

  const requireUid = () => {
    if (uid) return true;
    setMessage('Aguardando a autenticação anônima do Firebase. Tente de novo em alguns segundos.');
    return false;
  };

  const join = async () => {
    const code = normalizeRoomCode(joinCode);
    if (!isValidRoomCode(code)) {
      setMessage('O código tem 6 letras ou números. Confira no telão.');
      return;
    }
    if (!isDrawnNickname(nickname) || !requireUid()) return;
    setBusy(true);
    setMessage('');
    try {
      const info = await transport.sessionInfo(code);
      if (!info.exists) {
        setMessage(isLocal
          ? 'Sala não encontrada. Sem Firebase, a sala só existe no aparelho do palestrante (demonstração local). Peça o modo sem celular.'
          : 'Sala não encontrada. Confira o código com o palestrante.');
        return;
      }
      if (!info.isPensaComigo) {
        setMessage('Este código é de uma turma do Professor, não de uma palestra Pensa Comigo.');
        return;
      }
      const record = { nickname, kind, joinedAt: new Date().toISOString() };
      await transport.updateParticipant(code, uid, record);
      setStudent({ code, title: info.title, nickname, kind, record, returnCode: '' });
      setView('student');
    } catch {
      setMessage('Não foi possível entrar. Verifique a conexão e as regras do Firestore.');
    } finally {
      setBusy(false);
    }
  };

  const createHostRoom = async () => {
    if (!requireUid()) return;
    setBusy(true);
    setMessage('');
    try {
      let code = createRoomCode();
      for (let attempt = 0; attempt < 3 && (await transport.sessionInfo(code)).exists; attempt += 1) code = createRoomCode();
      const title = hostTitle.trim().slice(0, 80) || 'Palestra Pensa Comigo';
      await transport.createSession({ code, title, hostUid: uid, state: INITIAL_STATE });
      setHost({ code, title });
      setView('host');
    } catch {
      setMessage('Não foi possível criar a sala. Verifique a conexão e as regras do Firestore.');
    } finally {
      setBusy(false);
    }
  };

  const resumeHostRoom = async () => {
    const code = normalizeRoomCode(resumeCode);
    if (!isValidRoomCode(code) || !requireUid()) return;
    setBusy(true);
    try {
      const info = await transport.sessionInfo(code);
      if (!info.exists || !info.isPensaComigo) {
        setMessage('Sala Pensa Comigo não encontrada.');
        return;
      }
      setHost({ code, title: info.title });
      setView('host');
    } catch {
      setMessage('Não foi possível retomar a sala.');
    } finally {
      setBusy(false);
    }
  };

  const joinBase = useMemo(() => resolveJoinBaseUrl({
    configuredUrl: import.meta.env.VITE_PUBLIC_APP_URL,
    location: typeof window !== 'undefined' ? window.location : null
  }), []);

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-amber-300">Variação</div>
        <h1 className="bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">Pensa Comigo</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <ThemeToggle variant="label" className={buttonSecondary} />
        <button type="button" className={buttonSecondary} onClick={onExit}>Trocar de modo</button>
      </div>
    </div>
  );

  const hostIsController = host && roomState && roomState.hostUid === uid;

  let body = null;

  if (view === 'landing') {
    body = (
      <div className="space-y-5">
        <Card>
          <p className="text-lg leading-relaxed text-slate-200">A IA pode ser um tutor que ajuda você a pensar, e não uma ferramenta que pensa por você. Neste modo, a turma testa isso na prática, durante a palestra.</p>
          <ul className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            <li>1. Tentar resolver antes de perguntar.</li>
            <li>2. Pedir explicações, não respostas prontas.</li>
            <li>3. Pedir que a IA faça perguntas para testar você.</li>
            <li>4. Conferir as informações recebidas.</li>
          </ul>
        </Card>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="flex flex-col">
            <h2 className="text-xl font-bold text-white">Sou estudante</h2>
            <p className="mt-1 flex-1 text-sm text-slate-400">Entre com o código do telão. Sem cadastro e sem nome.</p>
            <button type="button" className={`${buttonPrimary} mt-4 w-full`} onClick={() => setView('join')}>Entrar numa sala</button>
          </Card>
          <Card className="flex flex-col">
            <h2 className="text-xl font-bold text-white">Sou palestrante</h2>
            <p className="mt-1 flex-1 text-sm text-slate-400">Abra a sala, projete o telão e conduza as etapas.</p>
            <button type="button" className={`${buttonPrimary} mt-4 w-full`} onClick={() => setView('create')}>Abrir sala</button>
          </Card>
          <Card className="flex flex-col">
            <h2 className="text-xl font-bold text-white">Praticar sozinho</h2>
            <p className="mt-1 flex-1 text-sm text-slate-400">Escolha um desafio e estude com o tutor.</p>
            <button type="button" className={`${buttonSecondary} mt-4 w-full`} onClick={() => setView('solo')}>Escolha seu desafio</button>
          </Card>
        </div>
        <Card>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Combinados</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
            {HONESTY_NOTES.map((note) => <li key={note}>{note}</li>)}
            <li>{tutorEngine.notice}</li>
            <li>Neste modo, os dados ficam só enquanto esta aba estiver aberta. O botão "Encerrar neste aparelho" apaga tudo.</li>
          </ul>
        </Card>
      </div>
    );
  }

  if (view === 'join') {
    body = (
      <Card className="mx-auto max-w-xl">
        <h2 className="text-2xl font-black text-white">Entrar na sala</h2>
        <label className="mt-4 block text-sm font-semibold text-slate-200">Código da sala
          <input value={joinCode} onChange={(event) => setJoinCode(normalizeRoomCode(event.target.value))} placeholder="Ex.: K7M2QX" autoCapitalize="characters" autoComplete="off" className={`${inputClass} mt-1 font-mono text-2xl uppercase tracking-[0.3em]`} />
        </label>
        <div className="mt-4">
          <div className="text-sm font-semibold text-slate-200">Seu apelido (sorteado)</div>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="rounded-xl border border-orange-500/50 bg-orange-500/10 px-4 py-2 text-xl font-bold text-white" aria-live="polite">{formatParticipantName(nickname, kind)}</span>
            <button type="button" className={buttonSecondary} onClick={() => setNickname(drawNickname(Math.random, nickname))}>Sortear outro</button>
          </div>
          <p className="mt-1 text-xs text-slate-500">Ninguém digita nome aqui. Assim ninguém fica identificado.</p>
        </div>
        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-slate-200">Neste aparelho</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {[['solo', 'Sou uma pessoa'], ['dupla', 'Somos uma dupla']].map(([value, label]) => (
              <button key={value} type="button" aria-pressed={kind === value} onClick={() => setKind(value)} className={`${buttonSecondary} ${kind === value ? 'border-orange-400 text-orange-100' : ''}`}>{label}</button>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className={buttonPrimary} disabled={busy} onClick={join}>{busy ? 'Entrando…' : 'Entrar'}</button>
          <button type="button" className={buttonSecondary} onClick={() => setView(host ? 'host' : 'landing')}>Voltar</button>
        </div>
      </Card>
    );
  }

  if (view === 'create') {
    body = (
      <Card className="mx-auto max-w-xl">
        <h2 className="text-2xl font-black text-white">Abrir sala</h2>
        {isLocal && <div className="mt-3"><Notice tone="warn">Sem Firebase configurado, a sala é uma demonstração local: funciona neste aparelho (e em outras abas deste navegador). Os celulares da turma não conseguem entrar. Use o modo sem celular e o kit impresso.</Notice></div>}
        <label className="mt-4 block text-sm font-semibold text-slate-200">Nome da palestra
          <input value={hostTitle} onChange={(event) => setHostTitle(event.target.value)} maxLength={80} className={`${inputClass} mt-1`} />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={buttonPrimary} disabled={busy} onClick={createHostRoom}>{busy ? 'Criando…' : 'Criar sala'}</button>
          <button type="button" className={buttonSecondary} onClick={() => setView('landing')}>Voltar</button>
        </div>
        {!isLocal && (
          <div className="mt-6 border-t border-slate-800 pt-4">
            <h3 className="font-bold text-white">Retomar uma sala (ex.: no dia do re-teste)</h3>
            <p className="text-sm text-slate-400">Só o aparelho que criou a sala consegue controlá-la.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <input value={resumeCode} onChange={(event) => setResumeCode(normalizeRoomCode(event.target.value))} placeholder="Código" aria-label="Código da sala para retomar" className={`${inputClass} max-w-[12rem] font-mono uppercase`} />
              <button type="button" className={buttonSecondary} disabled={busy} onClick={resumeHostRoom}>Retomar</button>
            </div>
          </div>
        )}
      </Card>
    );
  }

  if (view === 'solo') {
    body = (
      <div className="space-y-4">
        <button type="button" className={buttonSecondary} onClick={() => setView('landing')}>Voltar</button>
        <ChallengePicker programming={programming} soloPractice />
      </div>
    );
  }

  if (view === 'host' && host) {
    if (!roomState) body = <Card><p className="text-slate-300">Carregando a sala {host.code}…</p></Card>;
    else if (!hostIsController) {
      body = (
        <Card>
          <Notice tone="error" role="alert">Este aparelho não criou a sala {host.code}, então não pode controlá-la.</Notice>
          <button type="button" className={`${buttonDanger} mt-3`} onClick={endOnDevice}>Encerrar neste aparelho</button>
        </Card>
      );
    } else {
      body = (
        <HostView
          transport={transport}
          code={host.code}
          title={host.title}
          state={roomState}
          participants={participants}
          joinBase={joinBase}
          onEnd={endOnDevice}
          onShowAsStudent={() => { setJoinCode(host.code); setView('join'); }}
        />
      );
    }
  }

  if (view === 'student' && student) {
    const stage = getStage(roomState?.stage);
    const StageComponent = STAGE_COMPONENTS[stage.id];
    const freePlay = Boolean(roomState?.freePlay);
    const showPicker = freePlay && student.tab === 'desafio';
    body = (
      <div className="space-y-4">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-mono uppercase tracking-widest text-slate-400">Sala {student.code} · {stage.label}</div>
              <div className="text-xl font-bold text-white">{formatParticipantName(student.nickname, student.kind)}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {host && isLocal && <button type="button" className={buttonSecondary} onClick={() => setView('host')}>Voltar ao painel</button>}
              <button type="button" className={buttonDanger} onClick={endOnDevice}>Encerrar neste aparelho</button>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">{tutorEngine.notice}</p>
          {freePlay && (
            <div className="mt-3 flex gap-2" role="tablist" aria-label="Seções">
              {[['atividade', 'Atividade da palestra'], ['desafio', 'Escolha seu desafio']].map(([id, label]) => (
                <button key={id} type="button" role="tab" aria-selected={(student.tab || 'atividade') === id} onClick={() => setStudent((previous) => ({ ...previous, tab: id }))} className={`${buttonSecondary} ${(student.tab || 'atividade') === id ? 'border-orange-400 text-orange-100' : ''}`}>{label}</button>
              ))}
            </div>
          )}
        </Card>
        {!roomState && <Card><p className="text-slate-300">Conectando à sala…</p></Card>}
        {roomState && showPicker && (
          <ChallengePicker programming={programming} unlocks={roomState.unlocks} excludeSourceIds={experimentContentLocked(stage.id) ? EXPERIMENT_ITEM_IDS : []} />
        )}
        {roomState && !showPicker && StageComponent && (
          <StageComponent key={stage.id} record={student.record || {}} save={saveRecord} group={group || student.record?.group || null} returnCode={student.returnCode} />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-8 md:py-12">
      {header}
      {message && <Notice tone="info">{message}</Notice>}
      {body}
    </div>
  );
}
