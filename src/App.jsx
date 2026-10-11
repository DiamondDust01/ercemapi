import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import packageJson from '../package.json';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, getDoc, updateDoc, increment } from 'firebase/firestore';
import { PeerPairing, summarizePeerConnection } from './peerPairing.js';
import {
  Terminal, Shield, Sword, Code, Cpu, Sparkles,
  ArrowRight, BookOpen, Crosshair, Coins, Glasses, Bot, BrainCircuit,
  Volume2, VolumeX, Activity, Trophy, Lightbulb, Target as TargetIcon,
  Home, Play, Book, History, Save, Layout, ChevronRight, Lock, Unlock,
  Star, Zap, Loader2, RotateCcw, Database, Binary, Network, Layers, Clock3, Pause,
  Trash2, Box, Hash, Infinity as InfinityIcon, Share2, GitBranch, GitMerge,
  MousePointer2, Key, ChevronLeft, Search, ListPlus, Combine, Info,
  BookMarked, HelpCircle, FileJson, Layers3, MoveRight, Music, CheckSquare,
  Skull, Flame, AlertTriangle, Radio, Percent, Parentheses, Calculator,
  FastForward, CircleDashed, Fingerprint, Microchip, HardDrive, Unlink,
  GitPullRequest, Waypoints, TreeDeciduous, TerminalSquare, MemoryStick,
  Cloud, Download, Upload, Copy, GraduationCap, Map as MapIcon, Compass, Wifi, WifiOff,
  Plus, Repeat2
} from 'lucide-react';
import { readLocalConnectionQuality } from './localConnection.js';

const firebaseConfigValue = typeof __firebase_config !== 'undefined'
  ? __firebase_config
  : import.meta.env.VITE_FIREBASE_CONFIG;
const firebaseConfig = firebaseConfigValue ? JSON.parse(firebaseConfigValue) : null;
const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : import.meta.env.VITE_APP_ID || 'obi-quest-v1';

function AppVersion() {
  return (
    <span
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] right-3 z-40 rounded-full border border-slate-800 bg-slate-950/80 px-2 py-1 font-mono text-[10px] text-slate-500 backdrop-blur-sm md:bottom-3"
      aria-label={`Versão ${packageJson.version}`}
    >
      v{packageJson.version}
    </span>
  );
}

function LocalConnectionIndicator() {
  const [connection, setConnection] = useState(() => readLocalConnectionQuality());

  useEffect(() => {
    const refresh = () => setConnection(readLocalConnectionQuality());
    const browserConnection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    browserConnection?.addEventListener?.('change', refresh);
    return () => {
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', refresh);
      browserConnection?.removeEventListener?.('change', refresh);
    };
  }, []);

  const tone = !connection.online
    ? 'text-rose-300'
    : connection.quality === 'good' ? 'text-emerald-300'
      : connection.quality === 'fair' ? 'text-amber-300'
        : connection.quality === 'poor' ? 'text-rose-300' : 'text-slate-300';
  const ConnectionIcon = connection.online ? Wifi : WifiOff;

  return (
    <details className="fixed bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] left-3 z-40 md:bottom-3">
      <summary
        className={`flex max-w-[calc(100vw-6rem)] cursor-pointer list-none items-center gap-2 rounded-full border border-slate-800 bg-slate-950/90 px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur-sm marker:hidden ${tone}`}
        title="Estado da rede detectado localmente; nenhum teste é enviado a servidores."
      >
        <ConnectionIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">Conexão: {connection.label}</span>
        {connection.typeLabel && <span className="hidden truncate text-slate-500 sm:inline">· {connection.typeLabel}</span>}
      </summary>
      <div className="absolute bottom-full left-0 mb-2 w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border border-slate-700 bg-slate-950/95 p-4 text-xs text-slate-300 shadow-2xl backdrop-blur-md">
        <div className={`font-bold ${tone}`}>Qualidade estimada neste dispositivo: {connection.label}</div>
        <div className="mt-2 space-y-1 text-slate-400">
          <div>Estado da rede: {connection.online ? 'conectada, segundo o sistema' : 'desconectada, segundo o sistema'}</div>
          {connection.typeLabel && <div>Tipo: {connection.typeLabel}</div>}
          {connection.effectiveType && <div>Categoria local: {connection.effectiveType.toUpperCase()}</div>}
          {connection.downlinkMbps !== null && <div>Taxa estimada: {connection.downlinkMbps} Mbps</div>}
          {connection.rttMs !== null && <div>Latência estimada pelo sistema: {connection.rttMs} ms</div>}
          {connection.quality === 'unknown' && <div>Este navegador não fornece estimativas locais de qualidade.</div>}
        </div>
        <p className="mt-3 border-t border-slate-800 pt-2 text-[10px] leading-relaxed text-slate-500">
          Indicador local baseado no estado e nas estimativas de rede do dispositivo. Não envia tráfego de teste nem mede a latência até um servidor.
        </p>
      </div>
    </details>
  );
}

function PeerConnectionIndicator({ roomCode, peers, players }) {
  if (!roomCode) return null;

  const pingStatus = summarizePeerConnection(peers);
  const label = pingStatus.averagePing !== null
    ? `${pingStatus.averagePing} ms`
    : ({
      unresponsive: 'Sem resposta',
      measuring: 'Medindo…',
      connecting: 'Conectando…',
      disconnected: 'Desconectado',
      waiting: 'Aguardando par'
    })[pingStatus.state];
  const tone = pingStatus.averagePing === null
    ? 'text-slate-300'
    : pingStatus.averagePing <= 50 ? 'text-emerald-300'
      : pingStatus.averagePing <= 100 ? 'text-cyan-300'
        : pingStatus.averagePing <= 200 ? 'text-amber-300' : 'text-rose-300';

  return (
    <details className="fixed bottom-[calc(env(safe-area-inset-bottom)+7rem)] right-3 z-40 md:bottom-14">
      <summary className={`flex max-w-[calc(100vw-6rem)] cursor-pointer list-none items-center gap-2 rounded-full border border-slate-800 bg-slate-950/90 px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur-sm marker:hidden ${tone}`}>
        <Activity className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">Ping P2P: {label}</span>
      </summary>
      <div className="absolute bottom-full right-0 mb-2 w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border border-slate-700 bg-slate-950/95 p-4 text-xs text-slate-300 shadow-2xl backdrop-blur-md">
        <div className={`font-bold ${tone}`}>Conexão direta da partida: {label}</div>
        <p className="mt-2 text-slate-400">
          Sala {roomCode}. Medição real de ida e volta pelo canal WebRTC entre os aparelhos; não é a qualidade geral da internet nem o ping de um servidor.
        </p>
        {peers.length > 0 && (
          <ul className="mt-3 space-y-1 border-t border-slate-800 pt-2 text-slate-400">
            {peers.map((peer) => (
              <li key={peer.uid} className="flex justify-between gap-3">
                <span className="truncate">{players?.[peer.uid]?.name || peer.uid}</span>
                <span className="shrink-0">
                  {pingStatus.measuredPeers.includes(peer)
                    ? `${peer.average} ms`
                    : peer.channelState !== 'open' ? peer.state : peer.lastPingAt ? 'sem resposta' : 'medindo'}
                </span>
              </li>
            ))}
          </ul>
        )}
        {peers.length === 0 && <p className="mt-2 text-slate-500">Entre na sala com outro aparelho para medir a latência P2P.</p>}
      </div>
    </details>
  );
}

const Filter = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const LEVELS = [
  {
    id: 1, title: "Hello OBI", modality: "programacao", category: "I/O", bossName: "Juiz Automático", bossIcon: TerminalSquare, bossColor: "text-slate-100", bgColor: "from-slate-950 via-slate-900 to-black",
    missionGoal: "Imprima a frase 'OBI!' na tela.",
    description: "Na OBI você pode usar C++ ou Python. Em C++ usamos 'cout'; em Python usamos 'print()'.",
    syntaxTipCpp: "C++ DICA: cout << \"Seu Texto\";",
    syntaxTipPython: "Python DICA: print(\"Seu Texto\")",
    initialCodeCpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  \n  return 0;\n}",
    initialCodePython: "# Escreva seu código Python aqui\n",
    validate: (code, lang) => {
      if (lang === 'cpp') {
        return /cout\s*<<\s*"OBI!"\s*;/.test(code) ? { ok: true, msg: "Saída validada pelo Juiz (Accepted)." } : { ok: false, roast: "Wrong Answer. O texto exato deve ser impresso.", hint: "Use cout << \"OBI!\";" };
      } else {
        return /print\s*\(\s*["']OBI!["']\s*\)/.test(code) ? { ok: true, msg: "Saída validada em Python." } : { ok: false, roast: "Wrong Answer em Python.", hint: "Use print(\"OBI!\")" };
      }
    }
  },
  {
    id: 2, title: "Leitura Veloz", modality: "programacao", category: "I/O", bossName: "Time Limit", bossIcon: Zap, bossColor: "text-yellow-400", bgColor: "from-yellow-900/20 via-black to-slate-950",
    missionGoal: "Leia um número inteiro na variável 'n'.",
    description: "A captura rápida de dados é essencial para evitar Time Limit Exceeded (TLE).",
    syntaxTipCpp: "C++ DICA: cin >> n;",
    syntaxTipPython: "Python DICA: n = int(input())",
    initialCodeCpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  int n;\n  \n  return 0;\n}",
    initialCodePython: "# Leia n\n",
    validate: (code, lang) => {
      if (lang === 'cpp') {
        return /cin\s*>>\s*n\s*;/.test(code) ? { ok: true, msg: "Dados capturados com sucesso." } : { ok: false, roast: "As setas estão apontando para o lado errado?", hint: "cin usa >>. Ex: cin >> n;" };
      } else {
        return /int\s*\(\s*input\s*\(\s*\)\s*\)/.test(code) || /input\s*\(\s*\)/.test(code) ? { ok: true, msg: "Input capturado em Python." } : { ok: false, roast: "Faltou ler o input.", hint: "Use n = int(input())" };
      }
    }
  },
  {
    id: 3, title: "Decisão Clássica", modality: "programacao", category: "Lógica", bossName: "O Par ou Ímpar", bossIcon: GitBranch, bossColor: "text-blue-400", bgColor: "from-blue-900/20 via-black to-slate-950",
    missionGoal: "Se 'n' for par, imprima 'PAR'.",
    description: "Estruturas condicionais avaliam se o resto da divisão por 2 é zero.",
    syntaxTipCpp: "C++ DICA: if (n % 2 == 0) { ... }",
    syntaxTipPython: "Python DICA: if n % 2 == 0:",
    initialCodeCpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  int n = 4;\n  \n  return 0;\n}",
    initialCodePython: "n = 4\n# Seu if aqui\n",
    validate: (code, lang) => {
      if (lang === 'cpp') {
        return /if\s*\(\s*n\s*%\s*2\s*==\s*0\s*\)/.test(code) && code.includes("PAR") ? { ok: true, msg: "Lógica condicional correta." } : { ok: false, roast: "Bug na matriz condicional.", hint: "Use if(n % 2 == 0) { cout << \"PAR\"; }" };
      } else {
        return /if\s+n\s*%\s*2\s*==\s*0\s*:/.test(code) && code.includes("PAR") ? { ok: true, msg: "Condicional Python correta." } : { ok: false, roast: "Erro de sintaxe ou indentação no if.", hint: "if n % 2 == 0: print('PAR')" };
      }
    }
  },
  {
    id: 4, title: "A Estrutura Suprema", modality: "programacao", category: "STL", bossName: "Vector Prime", bossIcon: Database, bossColor: "text-emerald-400", bgColor: "from-emerald-900/20 via-black to-slate-950",
    missionGoal: "Adicione o valor 10 ao vetor 'v'.",
    description: "Em C++ usamos vector com push_back(). Em Python usamos listas com append().",
    syntaxTipCpp: "C++ DICA: v.push_back(10);",
    syntaxTipPython: "Python DICA: v.append(10)",
    initialCodeCpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n  vector<int> v;\n  \n  return 0;\n}",
    initialCodePython: "v = []\n# Adicione 10\n",
    validate: (code, lang) => {
      if (lang === 'cpp') {
        return /v\.push_back\(\s*10\s*\)\s*;/.test(code) ? { ok: true, msg: "Elemento anexado em O(1) amortizado." } : { ok: false, roast: "Tamanho insuficiente.", hint: "Chame v.push_back(10);" };
      } else {
        return /v\.append\(\s*10\s*\)/.test(code) ? { ok: true, msg: "Adicionado à lista Python." } : { ok: false, roast: "Use append em listas Python.", hint: "v.append(10)" };
      }
    }
  },
  {
    id: 5, title: "Caos Ordenado", modality: "programacao", category: "STL", bossName: "Sorter", bossIcon: ListPlus, bossColor: "text-indigo-400", bgColor: "from-indigo-900/20 via-black to-slate-950",
    missionGoal: "Ordene o vetor 'v'.",
    description: "Na modalidade Programação, eficiência de ordenação é vital. sort() roda em O(N log N).",
    syntaxTipCpp: "C++ DICA: sort(v.begin(), v.end());",
    syntaxTipPython: "Python DICA: v.sort()",
    initialCodeCpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n  vector<int> v = {3, 1, 4};\n  \n  return 0;\n}",
    initialCodePython: "v = [3, 1, 4]\n# Ordene\n",
    validate: (code, lang) => {
      if (lang === 'cpp') {
        return /sort\s*\(\s*v\.begin\(\)\s*,\s*v\.end\(\)\s*\)\s*;/.test(code) ? { ok: true, msg: "Ordenação O(N log N) concluída." } : { ok: false, roast: "Vai dar TLE se ordenar manualmente.", hint: "sort(v.begin(), v.end());" };
      } else {
        return /v\.sort\(\)/.test(code) || /sorted\s*\(\s*v\s*\)/.test(code) ? { ok: true, msg: "Lista ordenada em Python." } : { ok: false, roast: "Use .sort() ou sorted().", hint: "v.sort()" };
      }
    }
  },
  {
    id: 6, title: "Soma Direta", modality: "programacao", category: "I/O", bossName: "Adição", bossIcon: Plus, bgColor: "from-cyan-900/20 via-black to-slate-950",
    missionGoal: "Leia dois inteiros e imprima a soma.",
    description: "Em problemas de entrada e saída, a leitura e a composição da resposta são essenciais.",
    syntaxTipCpp: "C++ DICA: int a, b; cin >> a >> b; cout << a + b;",
    syntaxTipPython: "Python DICA: a, b = map(int, input().split()); print(a + b)",
    initialCodeCpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  int a, b;\n  \n  return 0;\n}",
    initialCodePython: "a, b = map(int, input().split())\n# Some e imprima\n",
    validate: (code, lang) => {
      if (lang === 'cpp') {
        return /cin\s*>>\s*a\s*>>\s*b\s*;/.test(code) && /cout\s*<<\s*a\s*\+\s*b\s*;/.test(code) ? { ok: true, msg: "Soma válida." } : { ok: false, roast: "Faltou capturar ou somar os valores.", hint: "cin >> a >> b; cout << a + b;" };
      } else {
        return /a\s*,\s*b\s*=\s*map\(int\s*,\s*input\(\)\.split\(\)\)/.test(code) && /print\s*\(\s*a\s*\+\s*b\s*\)/.test(code) ? { ok: true, msg: "Soma correta em Python." } : { ok: false, roast: "Leia os dois números e imprima a soma.", hint: "a, b = map(int, input().split()); print(a + b)" };
      }
    }
  },
  {
    id: 7, title: "Contagem Linear", modality: "programacao", category: "Loop", bossName: "Loop Boss", bossIcon: Repeat2, bgColor: "from-fuchsia-900/20 via-black to-slate-950",
    missionGoal: "Imprima os números de 1 até n em linhas separadas.",
    description: "Laços são vitais para repetir ações com eficiência e clareza.",
    syntaxTipCpp: "C++ DICA: for (int i = 1; i <= n; i++) { cout << i << '\\n'; }",
    syntaxTipPython: "Python DICA: for i in range(1, n + 1): print(i)",
    initialCodeCpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  int n = 5;\n  \n  return 0;\n}",
    initialCodePython: "n = 5\n# Conte de 1 até n\n",
    validate: (code, lang) => {
      if (lang === 'cpp') {
        return /for\s*\(\s*int\s+i\s*=\s*1\s*;\s*i\s*<=\s*n\s*;\s*i\+\+\s*\)/.test(code) && /cout\s*<<\s*i\s*<<\s*"\\n"/.test(code) ? { ok: true, msg: "Loop correto." } : { ok: false, roast: "Você precisa percorrer de 1 até n.", hint: "for (int i = 1; i <= n; i++) { cout << i << '\\n'; }" };
      } else {
        return /for\s+i\s+in\s+range\s*\(\s*1\s*,\s*n\s*\+\s*1\s*\)\s*:/.test(code) && /print\s*\(\s*i\s*\)/.test(code) ? { ok: true, msg: "Laço Python correto." } : { ok: false, roast: "Use range(1, n + 1) e print(i).", hint: "for i in range(1, n + 1): print(i)" };
      }
    }
  },
  {
    id: 8, title: "Busca Ordenada", modality: "programacao", category: "STL", bossName: "Scanner", bossIcon: Search, bgColor: "from-rose-900/20 via-black to-slate-950",
    missionGoal: "Encontre a posição do valor 7 no vetor 'v'.",
    description: "Buscar elementos em estruturas ordenadas exige atenção à indexação e às comparações.",
    syntaxTipCpp: "C++ DICA: auto it = find(v.begin(), v.end(), 7);",
    syntaxTipPython: "Python DICA: v.index(7)",
    initialCodeCpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n  vector<int> v = {1, 3, 7, 9};\n  \n  return 0;\n}",
    initialCodePython: "v = [1, 3, 7, 9]\n# Encontre o índice de 7\n",
    validate: (code, lang) => {
      if (lang === 'cpp') {
        return /find\s*\(\s*v\.begin\(\)\s*,\s*v\.end\(\)\s*,\s*7\s*\)/.test(code) ? { ok: true, msg: "Busca correta." } : { ok: false, roast: "Use find para localizar o valor.", hint: "auto it = find(v.begin(), v.end(), 7);" };
      } else {
        return /v\.index\s*\(\s*7\s*\)/.test(code) ? { ok: true, msg: "Índice localizado em Python." } : { ok: false, roast: "Use v.index(7).", hint: "v.index(7)" };
      }
    }
  },
  {
    id: 9, title: "Maior entre Dois", modality: "programacao", category: "Lógica", bossName: "Comparador", bossIcon: TargetIcon, bgColor: "from-orange-900/20 via-black to-slate-950",
    missionGoal: "Leia dois inteiros e imprima o maior deles.",
    description: "Comparações condicionais são fundamentais para decidir entre alternativas.",
    syntaxTipCpp: "C++ DICA: if (a > b) cout << a; else cout << b;",
    syntaxTipPython: "Python DICA: print(a if a > b else b)",
    initialCodeCpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  int a = 5, b = 9;\n  \n  return 0;\n}",
    initialCodePython: "a, b = 5, 9\n# Imprima o maior\n",
    validate: (code, lang) => {
      if (lang === 'cpp') {
        return /if\s*\(\s*a\s*>\s*b\s*\)/.test(code) && /cout\s*<<\s*a\s*;/.test(code) ? { ok: true, msg: "Comparação correta." } : { ok: false, roast: "Compare a e b e escolha o maior.", hint: "if (a > b) cout << a; else cout << b;" };
      } else {
        return /print\s*\(\s*a\s+if\s+a\s*>\s*b\s+else\s+b\s*\)/.test(code) ? { ok: true, msg: "Expressão Python válida." } : { ok: false, roast: "Use condição ternária para escolher o maior.", hint: "print(a if a > b else b)" };
      }
    }
  },
  {
    id: 10, title: "Multiplos de 2", modality: "programacao", category: "Loop", bossName: "Paradox", bossIcon: Flame, bgColor: "from-lime-900/20 via-black to-slate-950",
    missionGoal: "Imprima os múltiplos de 2 até 10.",
    description: "Laços simples ajudam a automatizar sequências repetitivas.",
    syntaxTipCpp: "C++ DICA: for (int i = 2; i <= 10; i += 2) cout << i << '\\n';",
    syntaxTipPython: "Python DICA: for i in range(2, 11, 2): print(i)",
    initialCodeCpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  \n  return 0;\n}",
    initialCodePython: "# Imprima múltiplos de 2 até 10\n",
    validate: (code, lang) => {
      if (lang === 'cpp') {
        return /for\s*\(\s*int\s+i\s*=\s*2\s*;\s*i\s*<=\s*10\s*;\s*i\s*\+=\s*2\s*\)/.test(code) ? { ok: true, msg: "Sequência correta." } : { ok: false, roast: "Use um loop com passo 2.", hint: "for (int i = 2; i <= 10; i += 2) cout << i << '\\n';" };
      } else {
        return /for\s+i\s+in\s+range\s*\(\s*2\s*,\s*11\s*,\s*2\s*\)\s*:/.test(code) ? { ok: true, msg: "Loop com passo 2 válido." } : { ok: false, roast: "Use range(2, 11, 2).", hint: "for i in range(2, 11, 2): print(i)" };
      }
    }
  }
];

const INICIACAO_QUESTIONS = [
  {
    id: 101, year: 1, title: "Lógica de Blocos", modality: "iniciacao", level: "Iniciação 1",
    question: "Um robô na OBI executa instruções sequenciais: começa na posição 0, anda 3 para frente, volta 1, e anda mais 4 para frente. Qual a posição final?",
    options: ["6", "7", "8", "5"],
    correct: 0,
    explanation: "Começa em 0. +3 = 3. -1 = 2. +4 = 6."
  },
  {
    id: 102, year: 1, title: "Padrão numérico", modality: "iniciacao", level: "Iniciação 1",
    question: "Qual é o próximo número da sequência: 2, 4, 8, 16, ?",
    options: ["18", "24", "32", "30"],
    correct: 2,
    explanation: "Cada termo dobra. 16 × 2 = 32."
  },
  {
    id: 103, year: 1, title: "Operação mental", modality: "iniciacao", level: "Iniciação 1",
    question: "Se um número é aumentado em 5 e depois diminuído em 2, o efeito líquido é:",
    options: ["-3", "+3", "+2", "-2"],
    correct: 1,
    explanation: "A operação líquida é +5 - 2 = +3."
  },
  {
    id: 104, year: 1, title: "Comparação de itens", modality: "iniciacao", level: "Iniciação 1",
    question: "Qual número é maior entre 17 e 19?",
    options: ["17", "19", "São iguais", "Não dá para saber"],
    correct: 1,
    explanation: "19 é maior que 17 porque está mais à direita na reta numérica."
  },
  {
    id: 105, year: 1, title: "Dobro e metade", modality: "iniciacao", level: "Iniciação 1",
    question: "Se o dobro de um número é 10, qual é esse número?",
    options: ["2", "4", "5", "8"],
    correct: 2,
    explanation: "O número cujo dobro é 10 é 5, porque 5 × 2 = 10."
  },
  {
    id: 106, year: 1, title: "Par ou ímpar", modality: "iniciacao", level: "Iniciação 1",
    question: "Qual das opções abaixo é um número ímpar?",
    options: ["8", "10", "11", "14"],
    correct: 2,
    explanation: "11 é ímpar porque não é divisível por 2."
  },
  {
    id: 107, year: 1, title: "Sequência crescente", modality: "iniciacao", level: "Iniciação 1",
    question: "Qual sequência está em ordem crescente?",
    options: ["5, 2, 7, 1", "1, 3, 5, 7", "9, 8, 7, 6", "4, 8, 3, 10"],
    correct: 1,
    explanation: "A sequência 1, 3, 5, 7 está em ordem crescente."
  },
  {
    id: 108, year: 1, title: "Raciocínio com soma", modality: "iniciacao", level: "Iniciação 1",
    question: "A soma de 6 e 4 é:",
    options: ["8", "9", "10", "12"],
    correct: 2,
    explanation: "6 + 4 = 10."
  },
  {
    id: 109, year: 1, title: "Menos e mais", modality: "iniciacao", level: "Iniciação 1",
    question: "Qual é o resultado de 13 - 5?",
    options: ["6", "7", "8", "9"],
    correct: 2,
    explanation: "13 - 5 = 8."
  },
  {
    id: 110, year: 1, title: "Contagem rápida", modality: "iniciacao", level: "Iniciação 1",
    question: "Se você contar de 2 em 2, qual será o 4º número a partir de 2?",
    options: ["4", "6", "8", "10"],
    correct: 1,
    explanation: "A sequência é 2, 4, 6, 8. Logo, o 4º número é 8."
  },
  {
    id: 111, year: 2, title: "Árvores de Decisão", modality: "iniciacao", level: "Iniciação 2",
    question: "Em uma prova de Iniciação da OBI, 15 questões valem 4 pontos cada e 5 questões valem 8 pontos cada. Qual o total de pontos da prova?",
    options: ["80", "95", "100", "120"],
    correct: 2,
    explanation: "15 * 4 = 60 pontos. 5 * 8 = 40 pontos. Total = 60 + 40 = 100 pontos."
  },
  {
    id: 112, year: 2, title: "Mapa de valores", modality: "iniciacao", level: "Iniciação 2",
    question: "Em uma sequência, o 4º termo vale 12 e cada termo seguinte aumenta 3. Qual é o 6º termo?",
    options: ["15", "18", "21", "24"],
    correct: 2,
    explanation: "A sequência é 12, 15, 18, 21. Então o 6º termo é 21."
  },
  {
    id: 113, year: 2, title: "Raciocínio com tempo", modality: "iniciacao", level: "Iniciação 2",
    question: "Uma tarefa demora 20 minutos para terminar. Se já se passaram 8 minutos, quanto falta?",
    options: ["10 min", "12 min", "14 min", "16 min"],
    correct: 1,
    explanation: "20 - 8 = 12, então faltam 12 minutos."
  },
  {
    id: 114, year: 2, title: "Retorno de etapas", modality: "iniciacao", level: "Iniciação 2",
    question: "Uma pessoa sai de casa, anda 4 metros, volta 2 e depois anda 3. Qual distância total percorrida?",
    options: ["5 m", "7 m", "9 m", "11 m"],
    correct: 2,
    explanation: "A distância total percorrida é 4 + 2 + 3 = 9 metros."
  },
  {
    id: 115, year: 2, title: "Tabela de valores", modality: "iniciacao", level: "Iniciação 2",
    question: "Se cada caixa contém 6 lápis e você tem 4 caixas, quantos lápis têm ao todo?",
    options: ["20", "22", "24", "26"],
    correct: 2,
    explanation: "4 caixas × 6 lápis = 24 lápis."
  },
  {
    id: 116, year: 2, title: "Extrapolação lógica", modality: "iniciacao", level: "Iniciação 2",
    question: "Se 3 maçãs custam 6 reais, quanto custam 5 maçãs?",
    options: ["8", "10", "12", "15"],
    correct: 1,
    explanation: "Cada maçã custa 2 reais; então 5 maçãs custam 10 reais."
  },
  {
    id: 117, year: 2, title: "Duas etapas", modality: "iniciacao", level: "Iniciação 2",
    question: "Uma fila tem 8 alunos. 3 saem e 2 entram. Quantos alunos ficam?",
    options: ["6", "7", "8", "9"],
    correct: 1,
    explanation: "8 - 3 + 2 = 7 alunos."
  },
  {
    id: 118, year: 2, title: "Lógica simples", modality: "iniciacao", level: "Iniciação 2",
    question: "Qual número completa a regra: 3, 6, 9, 12, ?",
    options: ["13", "14", "15", "16"],
    correct: 2,
    explanation: "A sequência aumenta de 3 em 3; então o próximo é 15."
  },
  {
    id: 119, year: 2, title: "Cálculo rápido", modality: "iniciacao", level: "Iniciação 2",
    question: "Qual é o resultado de 7 × 4?",
    options: ["24", "28", "32", "36"],
    correct: 1,
    explanation: "7 × 4 = 28."
  },
  {
    id: 120, year: 2, title: "Blocos de divisão", modality: "iniciacao", level: "Iniciação 2",
    question: "Qual é o quociente de 18 ÷ 3?",
    options: ["4", "5", "6", "7"],
    correct: 2,
    explanation: "18 ÷ 3 = 6."
  },
  {
    id: 121, year: 1, title: "Sequência de passos", modality: "iniciacao", level: "Iniciação 1",
    question: "Uma sequência de movimentos é 1, 3, 5, 7, ... Qual é o 6º termo?",
    options: ["9", "10", "11", "12"],
    correct: 2,
    explanation: "A sequência aumenta de 2 em 2; o 6º termo é 11."
  },
  {
    id: 122, year: 1, title: "Quantas vezes", modality: "iniciacao", level: "Iniciação 1",
    question: "Se você contar 5 objetos e depois mais 3, quantos objetos terá ao todo?",
    options: ["7", "8", "9", "10"],
    correct: 0,
    explanation: "5 + 3 = 8."
  },
  {
    id: 123, year: 2, title: "Comparação de preços", modality: "iniciacao", level: "Iniciação 2",
    question: "Se uma caneta custa 3 reais e um caderno custa 7 reais, quanto custa um caderno e duas canetas?",
    options: ["10", "11", "12", "13"],
    correct: 2,
    explanation: "7 + 2 × 3 = 13 reais."
  },
  {
    id: 124, year: 2, title: "Operação em cadeia", modality: "iniciacao", level: "Iniciação 2",
    question: "Qual é o resultado de (9 + 3) ÷ 2?",
    options: ["5", "6", "7", "8"],
    correct: 1,
    explanation: "9 + 3 = 12; 12 ÷ 2 = 6."
  }
];

const MENTOR_LEVELS = [
  { id: 1, label: 'Pergunta socrática', description: 'Uma pergunta para você construir o próximo passo.' },
  { id: 2, label: 'Dica conceitual', description: 'Uma pista sobre o conceito, sem resolver o exercício.' },
  { id: 3, label: 'Exemplo análogo', description: 'Um exemplo diferente que usa a mesma ideia.' },
  { id: 4, label: 'Roteiro parcial', description: 'Etapas abstratas, sem código executável ou resposta final.' }
];

const IA_PROMPT_LIBRARY = [
  { id: 'binary', category: 'Busca binária', text: 'Explique o conceito de busca binária sem resolver o exercício.' },
  { id: 'dp', category: 'Programação dinâmica', text: 'Que subproblemas menores podem aparecer aqui?' },
  { id: 'graphs', category: 'Grafos', text: 'Como posso distinguir busca em largura de menor caminho?' },
  { id: 'structures', category: 'Estruturas de dados', text: 'Que operações desta estrutura são importantes para o problema?' },
  { id: 'stl', category: 'STL', text: 'Qual custo das operações da estrutura que estou usando?' },
  { id: 'python', category: 'Python', text: 'Explique este conceito usando recursos idiomáticos de Python.' },
  { id: 'variation', category: 'Variações', text: 'Gere uma variação deste problema mudando uma restrição.' },
  { id: 'debug', category: 'Depuração', text: 'O que meu código pode estar fazendo de errado? Faça perguntas, sem corrigir.' },
  { id: 'review', category: 'Revisão', text: 'Revise minha abordagem e aponte uma hipótese que devo testar.' }
];

const DEBUG_GUIDE = {
  Accepted: 'A solução foi aceita pelo juiz. Use este resultado como ponto de partida: explique a ideia e procure uma variação ou caso-limite para consolidar o aprendizado.',
  'Runtime Error': 'O programa iniciou, mas falhou durante a execução. Investigue acesso inválido, divisão por zero e casos em que a entrada está vazia.',
  'Wrong Answer': 'O programa terminou, mas produziu uma resposta diferente da esperada. Compare a lógica com casos pequenos e limites.',
  'Time Limit Exceeded': 'O programa não terminou dentro do tempo. Estime quantas operações crescem com a entrada e procure trabalho repetido.',
  'Compilation Error': 'O compilador não conseguiu montar o programa. Leia a primeira mensagem do compilador e confira sintaxe, nomes e tipos.',
  'Memory Limit': 'O programa excedeu o limite de memória. Verifique estruturas dimensionadas pela entrada e cópias que poderiam ser evitadas.'
};

const VARIATION_TEMPLATES = {
  'busca-binaria': {
    title: 'Busca em dados ordenados',
    technique: 'Busca binária',
    variant: 'Uma sequência ordenada contém identificadores. Encontre a primeira posição em que o valor é maior ou igual ao alvo e conte as comparações.',
    difficulty: 'médio',
    restrictions: ['A sequência pode ter até 1.000.000 de itens.', 'A sequência pode estar vazia.', 'O alvo pode estar fora do intervalo.'],
    contexts: ['catálogo de livros', 'placar de uma olimpíada', 'sensores ordenados']
  },
  'dp': {
    title: 'Planejamento com capacidade limitada',
    technique: 'Programação dinâmica',
    variant: 'Escolha tarefas com custos e benefícios para maximizar o benefício total sem ultrapassar o orçamento disponível.',
    difficulty: 'difícil',
    restrictions: ['O orçamento pode ser zero.', 'Há tarefas com o mesmo custo.', 'Cada tarefa só pode ser escolhida uma vez.'],
    contexts: ['organização de uma feira', 'seleção de atividades', 'carregamento de equipamentos']
  },
  'grafos': {
    title: 'Rotas entre pontos conectados',
    technique: 'Grafos',
    variant: 'Dado um mapa de conexões, descubra o menor custo para sair de uma origem e chegar a um destino.',
    difficulty: 'difícil',
    restrictions: ['Pode não existir caminho.', 'Há conexões de custo zero.', 'O mapa pode ter até 100.000 conexões.'],
    contexts: ['rede de computadores', 'linhas de transporte', 'salas conectadas']
  },
  'stl': {
    title: 'Frequência de elementos',
    technique: 'Ordenação e estruturas de dados',
    variant: 'Receba uma sequência de códigos e determine quais aparecem mais de uma vez e quantas ocorrências têm.',
    difficulty: 'fácil',
    restrictions: ['A sequência pode estar vazia.', 'Os valores podem ser negativos.', 'A sequência pode conter muitos valores repetidos.'],
    contexts: ['inventário de peças', 'votos de uma enquete', 'registros de acesso']
  }
};

const RESPONSIBLE_CHECKLIST = [
  'Eu tentei resolver sozinho antes de pedir ajuda.',
  'Eu entendi a explicação e não apenas copiei a solução.',
  'Eu revisei as partes do código que ainda não entendo.',
  'Eu usei a IA como ferramenta de reflexão, não como atalho.'
];

const PRE_AI_CHECKLIST = [
  'Tentei identificar entradas, saídas e restrições antes de pedir ajuda.',
  'Quero uma pista ou explicação, não uma solução pronta.'
];

const COMPARISON_PAIRS = {
  'busca-binaria': [
    { title: 'Catálogo ordenado', statement: 'No vetor [2, 4, 7, 10, 13], qual é o índice (começando em zero) do valor 10?', answer: '3' },
    { title: 'Placar ordenado', statement: 'No vetor [1, 5, 8, 12, 17], qual é o índice (começando em zero) do valor 8?', answer: '2' }
  ],
  dp: [
    { title: 'Escolha de tarefas', statement: 'Tarefas (custo, benefício): (1, 2), (2, 4), (3, 4). Com capacidade 3 e uso único, qual benefício máximo?', answer: '6' },
    { title: 'Mochila de equipamentos', statement: 'Itens (peso, valor): (1, 3), (2, 5), (3, 6). Com capacidade 3 e uso único, qual valor máximo?', answer: '8' }
  ],
  grafos: [
    { title: 'Rotas de salas', statement: 'A→B custa 2, B→D custa 3, A→C custa 1 e C→D custa 7. Qual o custo mínimo de A até D?', answer: '5' },
    { title: 'Rede de estações', statement: 'P→Q custa 4, Q→S custa 2, P→R custa 3 e R→S custa 6. Qual o custo mínimo de P até S?', answer: '6' }
  ],
  stl: [
    { title: 'Contagem de códigos', statement: 'Na sequência [4, 2, 4, 1, 2, 4], quantos valores distintos aparecem repetidos?', answer: '2' },
    { title: 'Contagem de votos', statement: 'Na sequência [7, 7, 3, 5, 3, 9], quantos valores distintos aparecem repetidos?', answer: '2' }
  ]
};

const TRAINING_STEPS = [
  'Entender o conceito',
  'Resolver sem IA',
  'Consultar uma pista',
  'Comparar estratégias',
  'Refazer sem ajuda'
];

const DEBUG_CHECKLIST = [
  'Índice fora dos limites do vetor',
  'Estouro de inteiro ou tipo inadequado',
  'Variável usada antes de ser inicializada',
  'Complexidade alta para o tamanho da entrada'
];

const INITIAL_PEDAGOGY_DATA = {
  mentorHistory: [],
  hintCounts: {},
  mentorSessionHints: 0,
  sessions: [],
  savedVariants: [],
  favoritePrompts: [],
  diary: [],
  weeklyGoal: 5,
  trainingStep: 0,
  completedTrainingSteps: [],
  interviewHistory: [],
  externalSubmissions: [],
  usageChecklist: [false, false, false, false],
  importedProblem: null,
  classroomCode: '',
  classroomAlias: '',
  classroomData: null
};

const BinaryBackdrop = () => {
  const columns = 28;
  const rows = 16;
  const cells = Array.from({ length: columns * rows }, (_, index) => (index % 2 === 0 ? '0' : '1'));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_35%),linear-gradient(180deg,#020408_0%,#030712_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.10)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div
        className="android-binary-decoration absolute inset-0 p-3 md:p-6 grid gap-1 md:gap-2 text-[8px] md:text-[10px] font-mono text-cyan-300/30"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((cell, index) => (
          <div key={index} className="text-center select-none">{cell}</div>
        ))}
      </div>
    </div>
  );
};

const AudioEngine = {
  ctx: null, masterGain: null, isRunning: false,
  settings: { tempo: 140, baseHz: 50 },
  currentLayer: 'A',
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.12;
    this.masterGain.connect(this.ctx.destination);
    this.isRunning = true;
    this.playLoop();
  },
  setSettings(s) { if (s) this.settings = s; },
  toggle() {
    if (!this.ctx) { this.init(); return true; }
    if (this.ctx.state === 'suspended') { this.ctx.resume(); this.isRunning = true; return true; }
    else { this.ctx.suspend(); this.isRunning = false; return false; }
  },
  playLoop() {
    let nextNoteTime = this.ctx.currentTime;
    let beat = 0;
    const schedule = () => {
      while (nextNoteTime < this.ctx.currentTime + 0.1) {
        const cyclePosition = beat % 24;
        if (cyclePosition === 0) this.currentLayer = 'A';
        else if (cyclePosition === 8) this.currentLayer = 'B';
        else if (cyclePosition === 16) this.currentLayer = 'C';

        if (beat % 4 === 0) this.kick(nextNoteTime);
        if (beat % 2 === 0) this.hat(nextNoteTime, 0.04);
        if (beat % 4 === 2) this.snare(nextNoteTime);

        if (this.currentLayer === 'A') this.synthA(nextNoteTime, beat);
        else if (this.currentLayer === 'B') this.synthB(nextNoteTime, beat);
        else this.synthC(nextNoteTime, beat);

        nextNoteTime += 60.0 / (this.settings.tempo * 2);
        beat = (beat + 1) % 48;
      }
      setTimeout(schedule, 25);
    };
    schedule();
  },
  kick(t) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(0.01, t + 0.3);
    g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g); g.connect(this.masterGain); o.start(t); o.stop(t + 0.3);
  },
  snare(t) {
    if (!this.ctx) return;
    const n = this.ctx.createBufferSource();
    const b = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
    const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    n.buffer = b; const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    const filter = this.ctx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 1200;
    n.connect(filter); filter.connect(g); g.connect(this.masterGain); n.start(t);
  },
  hat(t, vol) {
    if (!this.ctx) return;
    const n = this.ctx.createBufferSource();
    const b = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.02, this.ctx.sampleRate);
    const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    n.buffer = b; const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.02);
    n.connect(g); g.connect(this.masterGain); n.start(t);
  },
  synthA(t, beat) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    const notes = [1, 1.2, 1.5, 1, 1.8, 1, 0.9, 2];
    o.type = 'sawtooth'; o.frequency.setValueAtTime(this.settings.baseHz * notes[beat % 8], t);
    g.gain.setValueAtTime(0.04, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.connect(g); g.connect(this.masterGain); o.start(t); o.stop(t + 0.12);
  },
  synthB(t, beat) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    const bass = [1, 1, 0.8, 0.8, 1.2, 1.2, 0.5, 0.5];
    o.type = 'triangle'; o.frequency.setValueAtTime(this.settings.baseHz * 0.5 * bass[beat % 8], t);
    g.gain.setValueAtTime(0.1, t); g.gain.linearRampToValueAtTime(0.001, t + 0.2);
    o.connect(g); g.connect(this.masterGain); o.start(t); o.stop(t + 0.2);
  },
  synthC(t, beat) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    const high = [4, 6, 3, 5, 8, 4, 2, 7];
    o.type = 'sine'; o.frequency.setValueAtTime(this.settings.baseHz * high[beat % 8], t);
    g.gain.setValueAtTime(0.02, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    const filter = this.ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 3000;
    o.connect(filter); filter.connect(g); g.connect(this.masterGain); o.start(t); o.stop(t + 0.4);
  }
};

const CodeEditor = memo(({ initialValueCpp, initialValuePython, language, onRun, onReset, isVictory, onLangChange, canSubmit }) => {
  const [localCode, setLocalCode] = useState(language === 'cpp' ? initialValueCpp : initialValuePython);
  const textareaRef = useRef(null);

  useEffect(() => {
    setLocalCode(language === 'cpp' ? initialValueCpp : initialValuePython);
  }, [initialValueCpp, initialValuePython, language]);

  const handleChange = (e) => setLocalCode(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = localCode.substring(0, start) + "  " + localCode.substring(end);
      setLocalCode(newValue);
      setTimeout(() => {
        if (textareaRef.current) textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className={`bg-[#05070a] rounded-3xl border-2 ${isVictory ? 'border-emerald-500' : 'border-slate-800'} flex flex-col h-[400px] overflow-hidden shadow-2xl relative`}>
      <div className="bg-slate-900/80 px-6 py-3 border-b border-slate-800 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
          </div>
          <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
            <button
              onClick={() => onLangChange('cpp')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${language === 'cpp' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              C++
            </button>
            <button
              onClick={() => onLangChange('python')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${language === 'python' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Python
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setLocalCode(language === 'cpp' ? initialValueCpp : initialValuePython); onReset(); }} className="p-2 text-slate-400 hover:text-rose-400 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRun(localCode, language)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm tracking-wide transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] active:scale-95 disabled:opacity-50"
            disabled={isVictory || !canSubmit}
          >
            <Play className="w-4 h-4 fill-current" /> SUBMIT
          </button>
        </div>
      </div>
      <div className="flex-1 relative bg-[#0a0f18] p-4">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-900/50 border-r border-slate-800/50 flex flex-col items-end pt-4 pr-2 text-slate-600 font-mono text-sm select-none">
          {localCode.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea
          ref={textareaRef}
          value={localCode}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          disabled={isVictory}
          className="w-full h-full bg-transparent text-emerald-400 font-mono text-sm resize-none focus:outline-none pl-12 leading-relaxed"
          style={{ tabSize: 2 }}
        />
        {isVictory && (
          <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[2px] flex items-center justify-center z-20">
            <div className="bg-black/90 p-6 rounded-2xl border border-emerald-500/30 flex flex-col items-center animate-bounce-slow shadow-[0_0_50px_rgba(16,185,129,0.2)]">
              <CheckSquare className="w-12 h-12 text-emerald-400 mb-3" />
              <span className="text-emerald-400 font-bold tracking-widest text-xl">ACCEPTED (AC)</span>
              <span className="text-slate-400 text-sm mt-1">Juiz Automático OBI</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default function App() {
  const mainScrollRef = useRef(null);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('menu');
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [language, setLanguage] = useState('cpp');
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [showRoast, setShowRoast] = useState(null);
  const [isVictory, setIsVictory] = useState(false);

  const [selectedIniciacaoAnswers, setSelectedIniciacaoAnswers] = useState({});
  const [selectedAno, setSelectedAno] = useState(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState('todos');
  const [selectedMode, setSelectedMode] = useState('mista');
  const [programSubTab, setProgramSubTab] = useState('desafios');
  const [iniciacaoMinutes, setIniciacaoMinutes] = useState(20);
  const [iniciacaoCustomSelected, setIniciacaoCustomSelected] = useState(false);
  const [iniciacaoCustomMinutes, setIniciacaoCustomMinutes] = useState('');
  const [iniciacaoCustomError, setIniciacaoCustomError] = useState('');
  const [hideIniciacaoCorrectness, setHideIniciacaoCorrectness] = useState(false);
  const [iniciacaoTimeLeft, setIniciacaoTimeLeft] = useState(20 * 60);
  const [iniciacaoTimerRunning, setIniciacaoTimerRunning] = useState(false);
  const [iniciacaoTimerAlert, setIniciacaoTimerAlert] = useState(false);
  const [competitionMinutes, setCompetitionMinutes] = useState(45);
  const [programacaoCustomSelected, setProgramacaoCustomSelected] = useState(false);
  const [programacaoCustomMinutes, setProgramacaoCustomMinutes] = useState('');
  const [programacaoCustomError, setProgramacaoCustomError] = useState('');
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerAlert, setTimerAlert] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeRoomCode, setActiveRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerAvatar, setPlayerAvatar] = useState('🧠');
  const [roomInfo, setRoomInfo] = useState(null);
  const [roomMessage, setRoomMessage] = useState('');
  const [peerStatus, setPeerStatus] = useState({ state: 'waiting', peers: [], primaryUid: null, backupUid: null });
  const peerPairingRef = useRef(null);
  const roomInfoRef = useRef(null);
  const peerStatusRef = useRef(peerStatus);
  const pendingScoreRequestsRef = useRef(new Map());
  const [records, setRecords] = useState([]);
  const [bestRoomPlacement, setBestRoomPlacement] = useState(99);
  const [bestRoomScore, setBestRoomScore] = useState(0);
  const [homeChecklist, setHomeChecklist] = useState({
    iniciacao: false,
    programacao: false,
    regulamento: false
  });
  const [pedagogy, setPedagogy] = useState(() => {
    try {
      return { ...INITIAL_PEDAGOGY_DATA, ...JSON.parse(window.localStorage.getItem('obi-quest-pedagogy') || '{}') };
    } catch {
      return INITIAL_PEDAGOGY_DATA;
    }
  });
  const [mentorLevel, setMentorLevel] = useState(1);
  const [mentorQuery, setMentorQuery] = useState('Explique o conceito de busca binária sem resolver o exercício.');
  const [mentorTopic, setMentorTopic] = useState('busca-binaria');
  const [mentorHistorySearch, setMentorHistorySearch] = useState('');
  const [mentorSection, setMentorSection] = useState('mentoria');
  const [mentorConsent, setMentorConsent] = useState(false);
  const [beforeAiChecklist, setBeforeAiChecklist] = useState([false, false]);
  const [mentorNotice, setMentorNotice] = useState('');
  const [mentorStats, setMentorStats] = useState({ totalQueries: 0, hintsUsed: pedagogy.mentorSessionHints || 0 });
  const [judgeVerdict, setJudgeVerdict] = useState('Wrong Answer');
  const [variantTopic, setVariantTopic] = useState('busca-binaria');
  const [generatedVariant, setGeneratedVariant] = useState(null);
  const [variantSource, setVariantSource] = useState('');
  const [variantAxis, setVariantAxis] = useState('restriction');
  const [patternGuess, setPatternGuess] = useState('');
  const [patternFeedback, setPatternFeedback] = useState('');
  const [debugCode, setDebugCode] = useState('');
  const [debugFeedback, setDebugFeedback] = useState(null);
  const [debugCases, setDebugCases] = useState([]);
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const [interviewFeedback, setInterviewFeedback] = useState('');
  const [diaryDraft, setDiaryDraft] = useState('');
  const [comparison, setComparison] = useState({ status: 'idle', topic: 'busca-binaria', phase: 'solo', startedAt: null, attempts: 0, solved: false, hints: 0, rounds: {} });
  const [comparisonAnswer, setComparisonAnswer] = useState('');
  const [comparisonFeedback, setComparisonFeedback] = useState('');
  const [comparisonNow, setComparisonNow] = useState(Date.now());
  const [comparisonReflection, setComparisonReflection] = useState({ helped: '', alone: '' });
  const [teacherTitle, setTeacherTitle] = useState('Minicurso de resolução estratégica');
  const [teacherTopic, setTeacherTopic] = useState('busca-binaria');
  const [teacherJoinCode, setTeacherJoinCode] = useState('');
  const [teacherAlias, setTeacherAlias] = useState('');
  const [teacherMessage, setTeacherMessage] = useState('');
  const [externalProvider, setExternalProvider] = useState('Codeforces');
  const [externalUrl, setExternalUrl] = useState('');
  const [externalTitle, setExternalTitle] = useState('');
  const [externalHandle, setExternalHandle] = useState('');
  const [externalMessage, setExternalMessage] = useState('');
  const [externalLoading, setExternalLoading] = useState(false);

  const updatePedagogy = (updater) => setPedagogy((previous) => ({
    ...previous,
    ...(typeof updater === 'function' ? updater(previous) : updater)
  }));

  useEffect(() => {
    window.localStorage.setItem('obi-quest-pedagogy', JSON.stringify(pedagogy));
  }, [pedagogy]);

  useEffect(() => {
    if (comparison.status !== 'running') return undefined;
    const interval = setInterval(() => setComparisonNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [comparison.status]);

  useEffect(() => {
    if (!comparison.status || comparison.status === 'idle') return;
    const timer = window.setTimeout(() => {
      if (comparison.phase === 'ai') setMentorConsent(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [comparison.phase, comparison.status]);

  const activeComparisonPair = COMPARISON_PAIRS[comparison.topic] || COMPARISON_PAIRS['busca-binaria'];
  const activeComparisonProblem = activeComparisonPair[comparison.phase === 'ai' ? 1 : 0];
  const comparisonElapsed = comparison.status === 'running' && comparison.startedAt
    ? Math.max(0, Math.floor((comparisonNow - comparison.startedAt) / 1000))
    : 0;
  const teacherSession = pedagogy.classroomData || { title: '', topic: '', participants: {} };

  const seededShuffle = (items, seed) => {
    const copy = [...items];
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }

    for (let index = copy.length - 1; index > 0; index -= 1) {
      hash = (hash * 1664525 + 1013904223) >>> 0;
      const swapIndex = hash % (index + 1);
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }

    return copy;
  };

  const getIniciacaoDifficulty = (question, index) => {
    if (question.difficulty) return question.difficulty;
    if (index < 3) return 'fácil';
    if (index < 7) return 'médio';
    return 'difícil';
  };

  const getIniciacaoPoints = (question, index) => {
    if (typeof question.points === 'number') return question.points;
    const difficulty = getIniciacaoDifficulty(question, index);
    const pointsByDifficulty = { fácil: 5, médio: 8, difícil: 12 };
    return pointsByDifficulty[difficulty] || 5;
  };

  const iniciacaoQuestionsByYear = useMemo(() => {
    const questions = INICIACAO_QUESTIONS.filter((question) => question.year === selectedAno)
      .map((question, index) => ({
        ...question,
        difficulty: getIniciacaoDifficulty(question, index),
        points: getIniciacaoPoints(question, index)
      }));

    const seed = `${selectedAno}-${playerName || user?.uid || 'visitante'}-${selectedDifficulty}`;
    const shuffled = seededShuffle(questions, seed);
    const filtered = selectedDifficulty === 'todos'
      ? shuffled
      : shuffled.filter((question) => question.difficulty === selectedDifficulty);

    return filtered.slice(0, 10);
  }, [selectedAno, selectedDifficulty, playerName, user]);

  const iniciacaoScore = useMemo(() => {
    return iniciacaoQuestionsByYear.reduce((score, question) => {
      const selectedKey = selectedIniciacaoAnswers[question.id];
      const selectedOption = selectedKey ? Number(selectedKey.split('-')[1]) : -1;
      return score + (selectedOption === question.correct ? getIniciacaoPoints(question) : 0);
    }, 0);
  }, [selectedIniciacaoAnswers, iniciacaoQuestionsByYear]);

  const iniciacaoMaxScore = useMemo(() => {
    return iniciacaoQuestionsByYear.reduce((score, question) => score + getIniciacaoPoints(question), 0);
  }, [iniciacaoQuestionsByYear]);

  useEffect(() => {
    const initAuth = async () => {
      if (!auth) {
        setLoading(false);
        return;
      }

      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth Error:", error);
        setLoading(false);
      }
    };

    initAuth();

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    const savedName = window.localStorage.getItem('obi-quest-player-name');
    const savedAvatar = window.localStorage.getItem('obi-quest-player-avatar');
    const savedRecords = window.localStorage.getItem('obi-quest-records');
    const savedBestPlacement = window.localStorage.getItem('obi-quest-best-room-placement');
    const savedBestScore = window.localStorage.getItem('obi-quest-best-room-score');

    if (savedName) setPlayerName(savedName);
    if (savedAvatar) setPlayerAvatar(savedAvatar);
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch {
        setRecords([]);
      }
    }
    if (savedBestPlacement) setBestRoomPlacement(Number(savedBestPlacement) || 99);
    if (savedBestScore) setBestRoomScore(Number(savedBestScore) || 0);
  }, []);

  useEffect(() => {
    if (playerName) {
      window.localStorage.setItem('obi-quest-player-name', playerName);
    }
  }, [playerName]);

  useEffect(() => {
    if (playerAvatar) {
      window.localStorage.setItem('obi-quest-player-avatar', playerAvatar);
    }
  }, [playerAvatar]);

  useEffect(() => {
    window.localStorage.setItem('obi-quest-records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    window.localStorage.setItem('obi-quest-best-room-placement', String(bestRoomPlacement));
  }, [bestRoomPlacement]);

  useEffect(() => {
    window.localStorage.setItem('obi-quest-best-room-score', String(bestRoomScore));
  }, [bestRoomScore]);

  useEffect(() => {
    const storedChecklist = window.localStorage.getItem('obi-quest-checklist');
    if (storedChecklist) {
      try {
        setHomeChecklist(JSON.parse(storedChecklist));
      } catch (error) {
        console.warn('Falha ao carregar checklist do localStorage', error);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('obi-quest-checklist', JSON.stringify(homeChecklist));
  }, [homeChecklist]);

  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        const initialData = { completedLevels: [], score: 0, iniciacaoSolved: [] };
        setDoc(userRef, initialData, { merge: true });
        setUserData(initialData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!timerRunning) return undefined;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimerRunning(false);
          setTimerAlert(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (!iniciacaoTimerRunning) return undefined;

    const interval = setInterval(() => {
      setIniciacaoTimeLeft(prev => {
        if (prev <= 1) {
          setIniciacaoTimerRunning(false);
          setIniciacaoTimerAlert(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [iniciacaoTimerRunning]);

  useEffect(() => {
    if (!activeRoomCode || !db) return undefined;

    const roomRef = doc(db, 'artifacts', appId, 'rooms', activeRoomCode);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setRoomInfo(data);
        if (data.status === 'running' && data.startedAt) {
          const elapsed = Math.floor((Date.now() - new Date(data.startedAt).getTime()) / 1000);
          const remaining = Math.max(0, data.timeLimit - elapsed);
          setTimeLeft(remaining);
          setTimerRunning(remaining > 0);
          setTimerAlert(remaining <= 60 && remaining > 0);
        }
      }
    });

    return () => unsubscribe();
  }, [activeRoomCode]);

  useEffect(() => {
    roomInfoRef.current = roomInfo;
  }, [roomInfo]);

  useEffect(() => {
    peerStatusRef.current = peerStatus;
  }, [peerStatus]);

  useEffect(() => {
    if (!activeRoomCode || !db || !user || roomInfo?.code !== activeRoomCode || !roomInfo.players?.[user.uid]) {
      return undefined;
    }

    const roomRef = doc(db, 'artifacts', appId, 'rooms', activeRoomCode);
    const pairing = new PeerPairing({
      roomRef,
      uid: user.uid,
      onStatus: (status) => setPeerStatus(status),
      onMessage: ({ fromUid, message }) => {
        if (message.type === 'score-accepted') {
          const timeout = pendingScoreRequestsRef.current.get(message.requestId);
          if (timeout) clearTimeout(timeout);
          pendingScoreRequestsRef.current.delete(message.requestId);
          return;
        }
        const currentRoom = roomInfoRef.current;
        if (message.type !== 'score-request'
          || peerStatusRef.current.primaryUid !== user.uid
          || !currentRoom?.players?.[fromUid]) return;

        updateDoc(roomRef, {
          [`players.${fromUid}.score`]: increment(100),
          updatedAt: new Date().toISOString()
        }).then(() => {
          peerPairingRef.current?.sendTo(fromUid, { type: 'score-accepted', requestId: message.requestId });
        }).catch((error) => {
          setRoomMessage(`Falha ao atualizar a pontuação recebida do dispositivo pareado: ${error.message}`);
        });
      }
    });
    peerPairingRef.current = pairing;
    pairing.start();

    return () => {
      pairing.close();
      pendingScoreRequestsRef.current.forEach((timeout) => clearTimeout(timeout));
      pendingScoreRequestsRef.current.clear();
      if (peerPairingRef.current === pairing) peerPairingRef.current = null;
      setPeerStatus({ state: 'waiting', peers: [], primaryUid: null, backupUid: null });
    };
  }, [activeRoomCode, user?.uid, roomInfo?.code]);

  useEffect(() => {
    if (!db || !user || !activeRoomCode || roomInfo?.code !== activeRoomCode
      || peerStatus.primaryUid !== user.uid || roomInfo.hostUid === user.uid) return;

    updateDoc(doc(db, 'artifacts', appId, 'rooms', activeRoomCode), {
      hostUid: user.uid,
      backupUid: peerStatus.backupUid || null
    }).catch((error) => {
      setRoomMessage(`O pareamento elegeu este dispositivo, mas não foi possível registrar a liderança: ${error.message}`);
    });
  }, [activeRoomCode, user?.uid, roomInfo?.code, roomInfo?.hostUid, peerStatus.primaryUid, peerStatus.backupUid]);

  useEffect(() => {
    if (!roomInfo || !roomInfo.startedAt || roomInfo.status !== 'running') return undefined;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(roomInfo.startedAt).getTime()) / 1000);
      const remaining = Math.max(0, roomInfo.timeLimit - elapsed);
      setTimeLeft(remaining);
      setTimerRunning(remaining > 0);
      setTimerAlert(remaining <= 60 && remaining > 0);
      if (remaining === 0) {
        setTimerRunning(false);
        setTimerAlert(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roomInfo]);

  useEffect(() => {
    setTimeLeft(competitionMinutes * 60);
    setTimerRunning(false);
    setTimerAlert(false);
  }, [competitionMinutes]);

  useEffect(() => {
    setIniciacaoTimeLeft(iniciacaoMinutes * 60);
    setIniciacaoTimerRunning(false);
    setIniciacaoTimerAlert(false);
  }, [iniciacaoMinutes]);

  useEffect(() => {
    setTimerAlert(timeLeft <= 60 && timeLeft > 0);
  }, [timeLeft]);

  useEffect(() => {
    setIniciacaoTimerAlert(iniciacaoTimeLeft <= 60 && iniciacaoTimeLeft > 0);
  }, [iniciacaoTimeLeft]);

  const toggleAudio = () => {
    const isPlaying = AudioEngine.toggle();
    setAudioEnabled(isPlaying);
  };

  const formatTime = (value) => {
    const minutes = Math.floor(value / 60).toString().padStart(2, '0');
    const seconds = (value % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const buildMentorReply = (query, level, topic) => {
    const normalized = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (/\b(resolva|resolucao completa|solucao (?:completa|final|pronta)|resposta final|codigo completo|codigo final|implemente para mim|faca para mim|me de a solucao|escreva o codigo)\b/.test(normalized)) {
      return 'Não vou fornecer a solução final nem código completo. Posso ajudar com uma pergunta, uma pista conceitual, um exemplo diferente ou um roteiro parcial. Qual parte você já tentou?';
    }
    if (normalized.includes('varia')) return 'Uma variação deve preservar a técnica central e alterar apenas um eixo por vez. Gere uma versão na seção Variações e tente identificar a invariante que continua igual.';
    if (normalized.includes('codigo') || normalized.includes('debug') || normalized.includes('errado')) return 'Posso ajudar a investigar sem corrigir por você. Abra Depuração guiada, informe o veredito e examine a linha suspeita. Que valor essa variável tem na primeira iteração?';

    const explanations = {
      'busca-binaria': {
        concept: 'Busca binária mantém um intervalo candidato em dados ordenados. Cada comparação com o meio permite descartar uma das metades; por isso, o número de passos cresce aproximadamente com o logaritmo do tamanho da entrada.',
        question: 'O que precisa ser verdade sobre os dados para que descartar metade do intervalo não elimine uma resposta válida?',
        analogy: 'Imagine encontrar uma palavra em um dicionário: você abre perto do meio e escolhe a metade que ainda pode conter a palavra. O exercício não é um dicionário; apenas compartilha essa ideia de descarte.',
        steps: 'Roteiro parcial: definir os limites do intervalo; escolher um ponto central; comparar com o alvo; descartar a metade impossível; repetir enquanto ainda houver candidatos.'
      },
      dp: {
        concept: 'Programação dinâmica organiza subproblemas que se repetem. Uma relação de recorrência descreve como combinar resultados menores, e uma ordem de cálculo garante que os resultados necessários já existam.',
        question: 'Qual é o menor estado do problema que você consegue responder sem resolver o problema inteiro?',
        analogy: 'Ao planejar etapas de uma viagem, você registra o melhor custo para chegar a cada parada e reaproveita esses resultados, sem recalcular todos os caminhos desde o início.',
        steps: 'Roteiro parcial: definir o significado do estado; identificar escolhas possíveis; expressar a transição; definir casos-base; calcular estados em uma ordem válida.'
      },
      grafos: {
        concept: 'Um grafo representa entidades e conexões. A escolha do algoritmo depende do que as arestas significam: conectividade, menor número de passos ou menor custo com pesos.',
        question: 'As conexões têm custos diferentes? O objetivo minimiza passos, custo total ou apenas verifica se existe caminho?',
        analogy: 'Uma rede de estações pode ser desenhada como pontos ligados por rotas. Contar baldeações e minimizar preço são objetivos diferentes, mesmo usando o mesmo mapa.',
        steps: 'Roteiro parcial: modelar vértices e arestas; decidir a métrica; escolher a busca compatível; registrar o estado de cada vértice; verificar o destino.'
      },
      stl: {
        concept: 'Estruturas de dados organizam valores para favorecer operações específicas. Compare custo de acesso, busca, inserção e remoção com o tamanho e a frequência de cada operação.',
        question: 'Qual operação acontece mais vezes no seu problema e qual estrutura a torna mais barata?',
        analogy: 'Uma lista de chamada ordenada facilita procurar nomes; um índice por nome pode acelerar buscas repetidas, mas exige trabalho para ser mantido.',
        steps: 'Roteiro parcial: listar as operações necessárias; estimar quantas vezes ocorrem; escolher uma estrutura; medir o custo total; validar com entradas-limite.'
      },
      python: {
        concept: 'Em Python, listas, conjuntos e dicionários oferecem operações diferentes. A escolha deve refletir se você precisa preservar ordem, evitar repetição ou associar chaves a valores.',
        question: 'Você precisa manter a ordem original, garantir unicidade ou consultar um valor associado a uma chave?',
        analogy: 'Uma lista é como uma fila numerada, um conjunto como uma coleção sem duplicatas e um dicionário como um índice de chave para informação.',
        steps: 'Roteiro parcial: identificar a operação dominante; escolher a estrutura adequada; definir como percorrer os dados; testar vazio, repetido e valor ausente.'
      }
    };
    const resolvedTopic = explanations[topic] ? topic : 'busca-binaria';
    const explanation = explanations[resolvedTopic];
    if (level === 1) return explanation.question;
    if (level === 2) return explanation.concept;
    if (level === 3) return explanation.analogy;
    return `${explanation.steps} Não transforme essas etapas em uma implementação sem antes justificar cada uma.`;
  };

  const askMentor = () => {
    if (comparison.status === 'running' && comparison.phase === 'solo') {
      setMentorNotice('A primeira rodada é sem IA. Termine-a para habilitar as pistas na rodada equivalente.');
      return;
    }
    if (!mentorConsent) {
      setMentorNotice('Leia o aviso e marque as duas confirmações antes de abrir a sessão com orientação.');
      return;
    }
    if (!mentorQuery.trim()) return;
    if (mentorStats.hintsUsed >= 5) {
      setMentorNotice('Limite de cinco consultas atingido. Revise a teoria e tente explicar a abordagem com suas palavras.');
      return;
    }
    if (comparison.status === 'running' && comparison.phase === 'ai' && comparison.hints >= 3) {
      setMentorNotice('Você já pediu três pistas nesta rodada. Tente explicar a abordagem com suas palavras antes de continuar.');
      return;
    }
    const reply = buildMentorReply(mentorQuery, mentorLevel, mentorTopic);
    const activeProblemName = comparison.status === 'running' ? activeComparisonProblem.title : '';
    const hintKey = activeProblemName ? `${mentorTopic}: ${activeProblemName}` : mentorTopic;
    const entry = { id: Date.now(), query: mentorQuery.trim(), level: mentorLevel, topic: mentorTopic, problem: activeProblemName, answer: reply, createdAt: new Date().toISOString() };
    updatePedagogy((previous) => ({
      mentorHistory: [entry, ...previous.mentorHistory].slice(0, 100),
      hintCounts: { ...previous.hintCounts, [hintKey]: (previous.hintCounts[hintKey] || 0) + 1 },
      mentorSessionHints: previous.mentorSessionHints + 1
    }));
    setMentorStats((previous) => ({ ...previous, totalQueries: previous.totalQueries + 1, hintsUsed: previous.hintsUsed + 1 }));
    if (comparison.status === 'running' && comparison.phase === 'ai') {
      setComparison((previous) => ({ ...previous, hints: previous.hints + 1 }));
    }
    updatePedagogy((previous) => ({ completedTrainingSteps: [...new Set([...previous.completedTrainingSteps, 'consult'])] }));
    publishStudentMetrics();
    setMentorNotice('Orientação local registrada. A resposta é guiada por regras pedagógicas e não envia seu código a um serviço externo.');
  };

  const generateProblemVariant = () => {
    const template = VARIATION_TEMPLATES[variantTopic] || VARIATION_TEMPLATES['busca-binaria'];
    const topicSessions = pedagogy.sessions.filter((session) => session.topic === variantTopic);
    const recentSuccess = topicSessions.slice(0, 3).filter((session) => session.rounds?.solo?.solved).length;
    const recentHints = topicSessions.slice(0, 3).reduce((total, session) => total + (session.rounds?.ai?.hints || 0), 0);
    const difficulty = recentSuccess >= 2 && recentHints <= 3 ? 'desafio' : recentSuccess === 0 ? 'prática guiada' : template.difficulty;
    const choice = (items, offset = 0) => items[(topicSessions.length + offset) % items.length];
    const axisChange = variantAxis === 'restriction'
      ? `Nova restrição: ${choice(template.restrictions, 2)}`
      : variantAxis === 'input-output'
        ? 'Formato alterado: a entrada contém vários casos de teste e a saída registra um resultado por linha.'
        : `Novo contexto: ${choice(template.contexts, 1)}`;
    const variant = {
      id: `variant-${Date.now()}`,
      title: `${variantSource.trim() || template.title}: ${variantAxis === 'context' ? choice(template.contexts, 1) : choice(template.contexts)}`,
      technique: template.technique,
      variant: `${variantSource.trim() ? `Partindo do problema “${variantSource.trim()}”, preserve a técnica central. ` : ''}${template.variant} ${axisChange}`,
      changedAxis: variantAxis,
      difficulty,
      createdAt: new Date().toISOString(),
      nextStep: 'Explique por que a técnica combina com o problema e identifique uma entrada-limite antes de codificar.'
    };
    setGeneratedVariant(variant);
    return variant;
  };

  const saveGeneratedVariant = () => {
    if (!generatedVariant) return;
    updatePedagogy((previous) => ({ savedVariants: [generatedVariant, ...previous.savedVariants.filter((item) => item.id !== generatedVariant.id)].slice(0, 50) }));
  };

  const debugExplanation = DEBUG_GUIDE[judgeVerdict] || DEBUG_GUIDE['Wrong Answer'];
  const debugCasesByTopic = {
    'busca-binaria': ['Vetor vazio', 'Um único elemento', 'Alvo menor que todos', 'Alvo maior que todos', 'Valores repetidos'],
    dp: ['Capacidade zero', 'Nenhum item disponível', 'Um item que excede a capacidade', 'Itens com valores iguais'],
    grafos: ['Origem igual ao destino', 'Destino desconectado', 'Aresta de custo zero', 'Grafo com um vértice'],
    stl: ['Sequência vazia', 'Todos os valores iguais', 'Todos os valores distintos', 'Valores negativos']
  };

  const analyzeDebugCode = () => {
    const lines = debugCode.split('\n');
    const findings = [];
    lines.forEach((line, index) => {
      if (/\b(?:arr|vetor|v|nums)\s*\[\s*(?:i|n|size|length)\s*\]/i.test(line)) findings.push({ line: index + 1, text: 'Este acesso usa um índice que pode coincidir com o tamanho do vetor. Qual é o maior índice válido?' });
      if (/for\s*\([^;]*;[^;]*(?:<=\s*(?:n|.*\.size\(\)|.*\.length))/i.test(line)) findings.push({ line: index + 1, text: 'Confira se a condição do laço visita uma posição além do último índice válido.' });
      if (/\b(?:int|long|float|double)\s+\w+\s*;/.test(line)) findings.push({ line: index + 1, text: 'Esta variável parece ser declarada sem valor inicial. Em qual caminho ela recebe um valor antes do uso?' });
    });
    const verdictQuestions = judgeVerdict === 'Accepted'
      ? ['Você consegue justificar por que a abordagem funciona?', 'Qual variação poderia mudar a escolha da estrutura?']
      : judgeVerdict === 'Runtime Error'
      ? ['Qual entrada mínima reproduz a falha?', 'Há divisão por zero ou acesso sem elemento?']
      : judgeVerdict === 'Wrong Answer'
        ? ['Qual caso pequeno diferencia sua hipótese do resultado esperado?', 'O enunciado inclui igualdade ou valores repetidos?']
        : judgeVerdict === 'Time Limit Exceeded'
          ? ['Quantas vezes cada laço executa?', 'Há uma busca linear dentro de outra repetição?']
          : ['Qual é a primeira mensagem do compilador?', 'Os tipos e nomes usados foram declarados?'];
    setDebugFeedback({ findings, questions: verdictQuestions });
  };

  const generateDebugCases = () => setDebugCases(debugCasesByTopic[variantTopic] || debugCasesByTopic['busca-binaria']);

  const submitPatternGuess = () => {
    const expected = VARIATION_TEMPLATES[variantTopic]?.technique || '';
    const correct = patternGuess.trim().toLowerCase() === expected.toLowerCase();
    setPatternFeedback(correct
      ? `Isso: os dois problemas praticam ${expected}. A superfície mudou, mas a ideia central permaneceu.`
      : 'Ainda não. Compare as operações necessárias e as restrições; procure a técnica que resolve o núcleo dos dois problemas.');
    if (correct) updatePedagogy((previous) => ({ completedTrainingSteps: [...new Set([...previous.completedTrainingSteps, 'pattern'])] }));
  };

  const submitInterviewAnswer = () => {
    const answer = interviewAnswer.trim();
    if (!answer) return;
    const hasApproach = /\b(passos?|estrat[eé]gia|abordagem|primeiro|depois)\b/i.test(answer);
    const hasComplexity = /\b(o\(|complexidade|linear|logar[ií]tmica|quadr[aá]tica)\b/i.test(answer);
    const hasEdgeCase = /\b(limite|borda|vazio|zero|caso)\b/i.test(answer);
    const feedback = [
      hasApproach ? 'Você descreveu etapas da abordagem.' : 'Explicite a sequência de decisões da sua abordagem.',
      hasComplexity ? 'Você mencionou custo ou complexidade.' : 'Estime o custo em tempo e espaço para a entrada máxima.',
      hasEdgeCase ? 'Você considerou pelo menos um caso-limite.' : 'Teste mentalmente o caso vazio, mínimo ou sem resposta.'
    ].join(' ');
    const entry = { id: Date.now(), answer, feedback, topic: mentorTopic, createdAt: new Date().toISOString() };
    updatePedagogy((previous) => ({ interviewHistory: [entry, ...previous.interviewHistory].slice(0, 50) }));
    setInterviewFeedback(feedback);
  };

  const saveComparisonReflection = () => {
    const latestId = pedagogy.sessions[0]?.id;
    if (!latestId || (!comparisonReflection.helped.trim() && !comparisonReflection.alone.trim())) return;
    updatePedagogy((previous) => ({
      sessions: previous.sessions.map((session) => session.id === latestId
        ? { ...session, reflection: { ...comparisonReflection, savedAt: new Date().toISOString() } }
        : session),
      completedTrainingSteps: [...new Set([...previous.completedTrainingSteps, 'reflect', 'retry'])]
    }));
    setComparisonFeedback('Reflexão salva no relatório. A etapa de refazer sem ajuda foi registrada como compromisso de treino.');
  };

  const saveDiaryEntry = () => {
    const text = diaryDraft.trim();
    if (!text) return;
    updatePedagogy((previous) => ({ diary: [{ id: `diary-${Date.now()}`, text, topic: mentorTopic, createdAt: new Date().toISOString() }, ...previous.diary].slice(0, 200) }));
    setDiaryDraft('');
  };

  const saveUsageChecklist = (index) => updatePedagogy((previous) => {
    const checklist = previous.usageChecklist.map((checked, checkedIndex) => checkedIndex === index ? !checked : checked);
    return {
      usageChecklist: checklist,
      sessions: previous.sessions.map((session, sessionIndex) => sessionIndex === 0 ? { ...session, responsibleChecklist: checklist } : session)
    };
  });

  const exportTextFile = (filename, content, type = 'text/plain;charset=utf-8') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportTrainingReport = () => {
    const rows = [
      ['data', 'topico', 'tempo_sem_ia_s', 'tentativas_sem_ia', 'acerto_sem_ia', 'tempo_com_ia_s', 'tentativas_com_ia', 'acerto_com_ia', 'dicas', 'reflexao_ia', 'reflexao_independente'],
      ...pedagogy.sessions.map((session) => [
        session.date,
        session.topic,
        session.rounds?.solo?.seconds || 0,
        session.rounds?.solo?.attempts || 0,
        session.rounds?.solo?.solved ? 1 : 0,
        session.rounds?.ai?.seconds || 0,
        session.rounds?.ai?.attempts || 0,
        session.rounds?.ai?.solved ? 1 : 0,
        session.rounds?.ai?.hints || 0,
        session.reflection?.helped || '',
        session.reflection?.alone || ''
      ])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    exportTextFile('obi-quest-relatorio.csv', `\ufeff${csv}`, 'text/csv;charset=utf-8');
  };

  const exportClassroomReport = () => {
    const participants = Object.values(teacherSession.participants || {});
    const rows = [
      ['apelido_anonimo', 'dicas_solicitadas', 'sessoes_pareadas', 'topicos'],
      ...participants.map((participant) => [participant.alias, participant.hints || 0, participant.sessions || 0, (participant.topics || []).join('; ')])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    exportTextFile('obi-quest-turma-anonimizado.csv', `\ufeff${csv}`, 'text/csv;charset=utf-8');
  };

  const exportFavoritePrompts = () => {
    const prompts = IA_PROMPT_LIBRARY.filter((prompt) => pedagogy.favoritePrompts.includes(prompt.id));
    exportTextFile('obi-quest-prompts.txt', prompts.map((prompt) => `[${prompt.category}] ${prompt.text}`).join('\n'));
  };

  const createClassroom = async () => {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const classroom = { code, title: teacherTitle.trim() || 'Minicurso OBI Quest', topic: teacherTopic, createdAt: new Date().toISOString(), participants: {} };
    updatePedagogy({ classroomCode: code, classroomAlias: 'Professor', classroomData: classroom });
    setTeacherMessage(`Sessão criada. Código de entrada: ${code}`);
    if (db && user) {
      try {
        await setDoc(doc(db, 'artifacts', appId, 'classrooms', code), classroom);
      } catch {
        setTeacherMessage(`Sessão criada neste dispositivo com o código ${code}. O Firebase recusou a sincronização.`);
      }
    } else {
      setTeacherMessage(`Sessão criada neste dispositivo com o código ${code}. Para participação em outros dispositivos, configure o Firebase.`);
    }
  };

  const joinClassroom = async () => {
    const code = teacherJoinCode.trim().toUpperCase();
    if (!code) return;
    if (!db || !user) {
      setTeacherMessage('A entrada compartilhada da turma precisa de Firebase configurado e autenticação ativa.');
      return;
    }
    try {
      const reference = doc(db, 'artifacts', appId, 'classrooms', code);
      const snapshot = await getDoc(reference);
      if (!snapshot.exists()) {
        setTeacherMessage('Código de sessão não encontrado. Confira o código com o professor.');
        return;
      }
      const alias = teacherAlias.trim() || `Aluno-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const participant = { alias, hints: Object.values(pedagogy.hintCounts).reduce((sum, count) => sum + count, 0), sessions: pedagogy.sessions.length, topics: Object.keys(pedagogy.hintCounts), hintsByTopic: pedagogy.hintCounts, updatedAt: new Date().toISOString() };
      await setDoc(reference, { participants: { [user.uid]: participant } }, { merge: true });
      updatePedagogy({ classroomCode: code, classroomAlias: alias, classroomData: { ...snapshot.data(), participants: { ...snapshot.data().participants, [user.uid]: participant } } });
      setVariantTopic(snapshot.data().topic || 'busca-binaria');
      setTeacherMessage(`Participação registrada como ${alias}. O professor verá somente este apelido e métricas de treino.`);
    } catch {
      setTeacherMessage('Não foi possível entrar na turma. Verifique a conexão e as regras de acesso do Firestore.');
    }
  };

  const publishStudentMetrics = async () => {
    if (!pedagogy.classroomCode || !user || !db || pedagogy.classroomAlias === 'Professor') return;
    const participant = {
      alias: pedagogy.classroomAlias || `Aluno-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      hints: Object.values(pedagogy.hintCounts).reduce((sum, count) => sum + count, 0),
      sessions: pedagogy.sessions.length,
      topics: Object.keys(pedagogy.hintCounts),
      hintsByTopic: pedagogy.hintCounts,
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'artifacts', appId, 'classrooms', pedagogy.classroomCode), { participants: { [user.uid]: participant } }, { merge: true });
    } catch {
      setTeacherMessage('As métricas continuam salvas neste dispositivo; a sincronização da turma falhou.');
    }
  };

  useEffect(() => {
    if (!pedagogy.classroomCode || !db) return undefined;
    const reference = doc(db, 'artifacts', appId, 'classrooms', pedagogy.classroomCode);
    return onSnapshot(reference, (snapshot) => {
      if (snapshot.exists()) updatePedagogy({ classroomData: { ...snapshot.data(), participants: snapshot.data().participants || {} } });
    }, () => setTeacherMessage('Sem acesso à sincronização da turma no momento.'));
  }, [pedagogy.classroomCode]);

  useEffect(() => {
    publishStudentMetrics();
  }, [pedagogy.hintCounts, pedagogy.sessions, pedagogy.classroomCode]);

  const importExternalProblem = () => {
    try {
      const parsed = new URL(externalUrl);
      const hosts = {
        Codeforces: ['codeforces.com', 'www.codeforces.com'],
        Beecrowd: ['beecrowd.com.br', 'www.beecrowd.com.br', 'judge.beecrowd.com.br'],
        OBI: ['olimpiada.ic.unicamp.br', 'www.olimpiada.ic.unicamp.br']
      };
      if (parsed.protocol !== 'https:' || !hosts[externalProvider].includes(parsed.hostname)) {
        setExternalMessage('Use uma URL HTTPS válida do juiz selecionado.');
        return;
      }
      const problem = { id: `external-${Date.now()}`, provider: externalProvider, title: externalTitle.trim() || parsed.pathname.split('/').filter(Boolean).at(-1) || 'Problema importado', url: parsed.href, importedAt: new Date().toISOString() };
      updatePedagogy((previous) => ({ importedProblem: problem, externalSubmissions: [{ ...problem, verdict: 'Pendente', createdAt: new Date().toISOString() }, ...previous.externalSubmissions].slice(0, 200) }));
      setExternalMessage('Problema adicionado ao histórico. A submissão e a autenticação permanecem no site oficial do juiz.');
    } catch {
      setExternalMessage('Informe uma URL completa, por exemplo https://codeforces.com/problemset/problem/1/A.');
    }
  };

  const syncCodeforcesHistory = async () => {
    if (!externalHandle.trim() || !pedagogy.importedProblem || pedagogy.importedProblem.provider !== 'Codeforces') {
      setExternalMessage('Importe um problema do Codeforces e informe seu handle para buscar o veredito público.');
      return;
    }
    setExternalLoading(true);
    try {
      const match = pedagogy.importedProblem.url.match(/(?:contest\/([0-9]+)\/problem\/([A-Za-z0-9]+)|problemset\/problem\/([0-9]+)\/([A-Za-z0-9]+))/);
      if (!match) throw new Error('Não consegui identificar o concurso e o índice do problema nesta URL.');
      const contestId = match[1] || match[3];
      const problemIndex = match[2] || match[4];
      const response = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(externalHandle.trim())}&from=1&count=100`);
      const data = await response.json();
      if (!response.ok || data.status !== 'OK') throw new Error(data.comment || 'O Codeforces não retornou o histórico.');
      const found = data.result.filter((submission) => String(submission.problem?.contestId) === contestId && submission.problem?.index === problemIndex);
      if (!found.length) throw new Error('Nenhuma submissão recente deste problema foi encontrada para esse handle.');
      const recordsForProblem = found.map((submission) => ({
        id: `cf-${submission.id}`,
        provider: 'Codeforces',
        title: pedagogy.importedProblem.title,
        url: pedagogy.importedProblem.url,
        verdict: ({ OK: 'Accepted', WRONG_ANSWER: 'Wrong Answer', TIME_LIMIT_EXCEEDED: 'Time Limit Exceeded', RUNTIME_ERROR: 'Runtime Error', COMPILATION_ERROR: 'Compilation Error', MEMORY_LIMIT_EXCEEDED: 'Memory Limit', TESTING: 'Em avaliação', IN_QUEUE: 'Em avaliação' })[submission.verdict] || submission.verdict || 'Em avaliação',
        createdAt: new Date(submission.creationTimeSeconds * 1000).toISOString(),
        externalId: submission.id
      }));
      const known = new Set(pedagogy.externalSubmissions.map((item) => item.id));
      updatePedagogy((previous) => ({ externalSubmissions: [...recordsForProblem.filter((item) => !known.has(item.id)), ...previous.externalSubmissions].slice(0, 200) }));
      setExternalMessage(`${recordsForProblem.length} submissão(ões) do problema foram sincronizadas pelo histórico público.`);
    } catch (error) {
      setExternalMessage(error.message || 'Falha ao consultar o histórico público do Codeforces.');
    } finally {
      setExternalLoading(false);
    }
  };

  const updateExternalVerdict = (id, verdict) => updatePedagogy((previous) => ({
    externalSubmissions: previous.externalSubmissions.map((submission) => submission.id === id ? { ...submission, verdict, updatedAt: new Date().toISOString() } : submission)
  }));

  const toggleFavoritePrompt = (promptId) => updatePedagogy((previous) => ({
    favoritePrompts: previous.favoritePrompts.includes(promptId)
      ? previous.favoritePrompts.filter((id) => id !== promptId)
      : [...previous.favoritePrompts, promptId]
  }));

  const startAiGuidance = () => {
    if (!beforeAiChecklist.every(Boolean)) {
      setMentorNotice('Marque as duas confirmações antes de ativar a orientação.');
      return;
    }
    setMentorConsent(true);
    setMentorNotice('Orientação habilitada para esta sessão. O limite é de cinco consultas, com no máximo três pistas na rodada comparativa.');
  };

  const markTrainingStep = (step) => updatePedagogy((previous) => ({ completedTrainingSteps: [...new Set([...previous.completedTrainingSteps, step])] }));

  const independentWins = pedagogy.sessions.filter((session) => session.rounds?.solo?.solved).length;
  const unlockedMentorLevel = Math.min(4, 1 + Math.floor(independentWins / 2));
  const weeklyIndependentCount = pedagogy.sessions.filter((session) => session.rounds?.solo?.solved && Date.now() - new Date(session.date).getTime() < 7 * 24 * 60 * 60 * 1000).length;
  const classroomParticipants = Object.values(teacherSession.participants || {});
  const recentSessions = pedagogy.sessions.slice(0, 8).reverse();
  const filteredMentorHistory = pedagogy.mentorHistory.filter((item) => `${item.query} ${item.answer} ${item.topic}`.toLowerCase().includes(mentorHistorySearch.toLowerCase()));
  const recommendedPrompt = IA_PROMPT_LIBRARY.find((prompt) => prompt.id === (comparison.status === 'running' && comparison.phase === 'ai' ? 'review' : judgeVerdict === 'Accepted' ? 'variation' : 'debug')) || IA_PROMPT_LIBRARY[0];

  const comparisonReport = useMemo(() => {
    const latest = pedagogy.sessions[0];
    const toMinutes = (round) => round ? Math.round(round.seconds / 60 * 10) / 10 : 0;
    const withoutAi = latest?.rounds?.solo || { seconds: 0, attempts: 0, solved: false, hints: 0 };
    const withAi = latest?.rounds?.ai || { seconds: 0, attempts: 0, solved: false, hints: 0 };
    return {
      withoutAi: { ...withoutAi, time: toMinutes(withoutAi), correct: withoutAi.solved ? 1 : 0 },
      withAi: { ...withAi, time: toMinutes(withAi), correct: withAi.solved ? 1 : 0 },
      insight: latest
        ? 'Compare esta sessão com sua linha de base; uma única tentativa não demonstra que a IA causou a diferença.'
        : 'Conclua uma sessão pareada para gerar a primeira comparação baseada nos seus dados.'
    };
  }, [pedagogy.sessions]);

  const startComparison = () => {
    setComparison({ status: 'running', topic: variantTopic, phase: 'solo', startedAt: Date.now(), attempts: 0, solved: false, hints: 0, rounds: {} });
    setComparisonAnswer('');
    setComparisonFeedback('');
    setMentorConsent(false);
    setMentorTopic(variantTopic);
    setMentorStats((previous) => ({ ...previous, hintsUsed: 0 }));
    updatePedagogy({ mentorSessionHints: 0 });
    setBeforeAiChecklist([false, false]);
    setMentorSection('comparar');
  };

  const checkComparisonAnswer = () => {
    if (comparison.status !== 'running' || comparison.solved) return;
    const correct = comparisonAnswer.trim().toLowerCase() === activeComparisonProblem.answer.toLowerCase();
    setComparison((previous) => ({ ...previous, attempts: previous.attempts + 1, solved: correct }));
    setComparisonFeedback(correct ? 'Resposta correta. Registre o raciocínio que levou a ela antes de encerrar a rodada.' : 'Ainda não. Revise a estratégia e tente novamente; a tentativa foi registrada.');
  };

  const finishComparisonRound = () => {
    if (comparison.status !== 'running') return;
    const round = { seconds: Math.floor((Date.now() - comparison.startedAt) / 1000), attempts: comparison.attempts, solved: comparison.solved, hints: comparison.hints };
    if (comparison.phase === 'solo') {
      setComparison((previous) => ({ ...previous, phase: 'ai', startedAt: Date.now(), attempts: 0, solved: false, hints: 0, rounds: { ...previous.rounds, solo: round } }));
      setComparisonAnswer('');
      setComparisonFeedback('Primeira rodada salva. O problema equivalente da segunda rodada está pronto. Leia e marque o aviso antes de abrir as pistas.');
      setMentorConsent(false);
      setBeforeAiChecklist([false, false]);
      return;
    }
    const report = { id: `session-${Date.now()}`, topic: comparison.topic, date: new Date().toISOString(), rounds: { ...comparison.rounds, ai: round } };
    updatePedagogy((previous) => ({ sessions: [report, ...previous.sessions].slice(0, 200) }));
    setComparison((previous) => ({ ...previous, status: 'complete', rounds: { ...previous.rounds, ai: round } }));
    setComparisonAnswer('');
    setComparisonFeedback('Sessão pareada salva no relatório de evolução. Registre agora o que mudou entre as duas abordagens.');
    updatePedagogy((previous) => ({ completedTrainingSteps: [...new Set([...previous.completedTrainingSteps, 'compare'])] }));
  };

  const resetComparison = () => {
    setComparison({ status: 'idle', topic: variantTopic, phase: 'solo', startedAt: null, attempts: 0, solved: false, hints: 0, rounds: {} });
    setComparisonAnswer('');
    setComparisonFeedback('');
  };

  const autonomyRate = useMemo(() => {
    const rounds = pedagogy.sessions.flatMap((session) => [session.rounds?.solo, session.rounds?.ai]).filter(Boolean);
    if (rounds.length === 0) return 100;
    const independentCorrect = rounds.filter((round) => round.solved && round.hints === 0).length;
    return Math.round((independentCorrect / rounds.length) * 100);
  }, [pedagogy.sessions]);

  const generateRoomCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();

  const roomRanking = useMemo(() => {
    const players = roomInfo?.players ? Object.values(roomInfo.players) : [];
    return players.sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [roomInfo]);

  useEffect(() => {
    if (!roomInfo?.players || !user) return;

    const ranking = [...Object.values(roomInfo.players)].sort((a, b) => (b.score || 0) - (a.score || 0));
    const currentPlayer = ranking.find((player) => player.uid === user.uid);

    if (!currentPlayer) return;

    const currentPlacement = ranking.findIndex((player) => player.uid === user.uid) + 1;
    const currentScore = currentPlayer.score || 0;

    setBestRoomPlacement((prev) => (currentPlacement < prev ? currentPlacement : prev));
    setBestRoomScore((prev) => (currentScore > prev ? currentScore : prev));
  }, [roomInfo, user]);

  const avatarOptions = ['🧠', '⚡', '🎯', '💻', '🚀', '🔥', '😎'];
  const podiumClass = ['text-amber-300', 'text-slate-300', 'text-orange-300'];
  const practiceModes = [
    { id: 'papel', label: 'Prova de papel' },
    { id: 'programacao', label: 'Programação' },
    { id: 'mista', label: 'Mista' }
  ];
  const programTabOptions = [
    { id: 'desafios', label: 'Desafios' },
    { id: 'competicao', label: 'Competição' }
  ];
  const formatPlayerDisplayName = (name = 'Visitante') => String(name || 'Visitante').trim() || 'Visitante';

  useEffect(() => {
    setHomeChecklist((prev) => ({
      ...prev,
      iniciacao: Object.keys(selectedIniciacaoAnswers).length >= 3
    }));
  }, [selectedIniciacaoAnswers]);

  useEffect(() => {
    if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
  }, [activeTab]);

  useEffect(() => {
    setHomeChecklist((prev) => ({
      ...prev,
      programacao: isVictory || prev.programacao
    }));
  }, [isVictory]);

  useEffect(() => {
    if (activeTab === 'academy') {
      setHomeChecklist((prev) => ({ ...prev, regulamento: true }));
    }
  }, [activeTab]);

  const timerTone = timeLeft === 0 ? 'border-rose-500 bg-rose-500/10 text-rose-200' : timerAlert ? 'border-amber-500 bg-amber-500/10 text-amber-100' : 'border-cyan-500/20 bg-cyan-500/10 text-cyan-100';
  const timerAccent = timeLeft === 0 ? 'text-rose-400' : timerAlert ? 'text-amber-300' : 'text-cyan-300';
  const isTimerActive = timerRunning && timeLeft > 0;
  const canControlCompetition = !db || !user || !roomInfo
    || (peerStatus.primaryUid || roomInfo.hostUid) === user.uid;
  const peerPingSummary = summarizePeerConnection(peerStatus.peers);
  const peerConnectionLabel = peerPingSummary.averagePing !== null
    ? `ativa · ${peerPingSummary.averagePing} ms`
    : ({
      measuring: 'canal aberto · medindo latência',
      connecting: 'conectando',
      unresponsive: 'sem resposta recente',
      disconnected: 'desconectada',
      waiting: 'aguardando aparelhos'
    })[peerPingSummary.state];
  const timerStateLabel = timeLeft === 0
    ? 'Tempo esgotado — você não pode responder enquanto o cronômetro estiver parado.'
    : timerRunning
      ? 'Cronômetro ativo — você pode responder às questões.'
      : 'Cronômetro pausado — retome para poder responder.';

  const iniciacaoTimerTone = iniciacaoTimeLeft === 0 ? 'border-rose-500 bg-rose-500/10 text-rose-200' : iniciacaoTimerAlert ? 'border-amber-500 bg-amber-500/10 text-amber-100' : 'border-cyan-500/20 bg-cyan-500/10 text-cyan-100';
  const iniciacaoTimerAccent = iniciacaoTimeLeft === 0 ? 'text-rose-400' : iniciacaoTimerAlert ? 'text-amber-300' : 'text-cyan-300';
  const isIniciacaoTimerActive = iniciacaoTimerRunning && iniciacaoTimeLeft > 0;
  const iniciacaoTimerStateLabel = iniciacaoTimeLeft === 0
    ? 'Tempo esgotado — você não pode responder enquanto o cronômetro estiver parado.'
    : iniciacaoTimerRunning
      ? 'Cronômetro ativo — você pode responder às perguntas.'
      : 'Cronômetro pausado — retome para poder responder.';

  const createCompetitionRoom = async () => {
    const code = generateRoomCode();
    const displayName = formatPlayerDisplayName(playerName.trim() || (user ? `Jogador ${user.uid.slice(0, 4)}` : 'Visitante'));
    const avatar = playerAvatar || '🧠';
    const playerKey = user?.uid || `local-${displayName}`;

    if (!db || !user) {
      const fallbackRoom = {
        code,
        status: 'lobby',
        signal: 'local',
        timeLimit: competitionMinutes * 60,
        startedAt: null,
        players: {
          [playerKey]: { uid: user?.uid || playerKey, name: displayName, avatar, score: 0, joinedAt: new Date().toISOString() }
        }
      };
      setRoomInfo(fallbackRoom);
      setActiveRoomCode(code);
      setRoomCodeInput(code);
      setRoomMessage('Sala local criada. Use o código para simular uma partida local.');
      return;
    }

    const roomRef = doc(db, 'artifacts', appId, 'rooms', code);
    const initialRoom = {
      code,
      hostUid: user.uid,
      status: 'lobby',
      createdAt: new Date().toISOString(),
      startedAt: null,
      timeLimit: competitionMinutes * 60,
      players: {
        [user.uid]: { uid: user.uid, name: displayName, avatar, score: 0, joinedAt: new Date().toISOString() }
      }
    };

    try {
      await setDoc(roomRef, initialRoom);
    } catch (error) {
      setRoomMessage(`Não foi possível criar a sala: ${error.message}`);
      return;
    }
    setRoomInfo(initialRoom);
    setActiveRoomCode(code);
    setRoomCodeInput(code);
    setRoomMessage('Sala criada. Compartilhe o código com os outros participantes.');
  };

  const joinCompetitionRoom = async () => {
    const code = roomCodeInput.trim().toUpperCase();
    if (!code) {
      setRoomMessage('Digite um código de sala.');
      return;
    }

    const displayName = formatPlayerDisplayName(playerName.trim() || (user ? `Jogador ${user.uid.slice(0, 4)}` : 'Visitante'));
    const avatar = playerAvatar || '🧠';

    if (!db || !user) {
      setRoomMessage('A sincronização multiplayer precisa de Firebase disponível neste ambiente.');
      return;
    }

    const roomRef = doc(db, 'artifacts', appId, 'rooms', code);
    let roomSnap;
    try {
      roomSnap = await getDoc(roomRef);
    } catch (error) {
      setRoomMessage(`Não foi possível consultar a sala: ${error.message}`);
      return;
    }

    if (!roomSnap.exists()) {
      setRoomMessage('Sala não encontrada. Verifique o código.');
      return;
    }

    const roomData = roomSnap.data();
    const currentPlayer = { uid: user.uid, name: displayName, avatar, score: 0, joinedAt: new Date().toISOString() };
    const updatedPlayers = { ...(roomData.players || {}), [user.uid]: currentPlayer };

    try {
      await updateDoc(roomRef, {
        players: updatedPlayers,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      setRoomMessage(`Não foi possível entrar na sala: ${error.message}`);
      return;
    }

    setRoomInfo({ ...roomData, players: updatedPlayers });
    setActiveRoomCode(code);
    setRoomMessage('Você entrou na sala com sucesso.');
  };

  const startCompetition = async () => {
    if (!roomInfo) {
      setRoomMessage('Crie ou entre em uma sala primeiro.');
      return;
    }
    if (db && user && (peerStatusRef.current.primaryUid || roomInfo.hostUid) !== user.uid) {
      setRoomMessage('Somente o dispositivo principal da sala pode controlar a partida.');
      return;
    }

    const updatedRoom = {
      ...roomInfo,
      status: 'running',
      startedAt: new Date().toISOString(),
      timeLimit: competitionMinutes * 60
    };

    if (db && user && roomInfo.code) {
      const roomRef = doc(db, 'artifacts', appId, 'rooms', roomInfo.code);
      await updateDoc(roomRef, {
        status: 'running',
        startedAt: updatedRoom.startedAt,
        timeLimit: updatedRoom.timeLimit
      });
    }

    setRoomInfo(updatedRoom);
    setTimeLeft(competitionMinutes * 60);
    setTimerRunning(true);
    setTimerAlert(false);
    setRoomMessage('Partida iniciada.');
  };

  const pauseCompetition = async () => {
    if (db && user && roomInfo && (peerStatusRef.current.primaryUid || roomInfo.hostUid) !== user.uid) {
      setRoomMessage('Somente o dispositivo principal da sala pode controlar a partida.');
      return;
    }
    setTimerRunning(false);
    if (roomInfo) {
      const updatedRoom = {
        ...roomInfo,
        status: 'paused',
        timeLimit: timeLeft,
        startedAt: null
      };
      setRoomInfo(updatedRoom);

      if (db && user && roomInfo.code) {
        const roomRef = doc(db, 'artifacts', appId, 'rooms', roomInfo.code);
        await updateDoc(roomRef, {
          status: 'paused',
          timeLimit: timeLeft,
          startedAt: null
        });
      }
    }
  };

  const resetCompetition = async () => {
    if (db && user && roomInfo && (peerStatusRef.current.primaryUid || roomInfo.hostUid) !== user.uid) {
      setRoomMessage('Somente o dispositivo principal da sala pode controlar a partida.');
      return;
    }
    setTimerRunning(false);
    setTimeLeft(competitionMinutes * 60);
    setTimerAlert(false);
    if (roomInfo) {
      const updatedRoom = {
        ...roomInfo,
        status: 'lobby',
        startedAt: null,
        timeLimit: competitionMinutes * 60
      };
      setRoomInfo(updatedRoom);

      if (db && user && roomInfo.code) {
        const roomRef = doc(db, 'artifacts', appId, 'rooms', roomInfo.code);
        await updateDoc(roomRef, {
          status: 'lobby',
          startedAt: null,
          timeLimit: competitionMinutes * 60
        });
      }
    }
  };

  const startIniciacao = () => {
    if (iniciacaoTimeLeft === 0) {
      setIniciacaoTimeLeft(iniciacaoMinutes * 60);
    }
    setIniciacaoTimerRunning(true);
    setIniciacaoTimerAlert(false);
  };

  const pauseIniciacao = () => {
    setIniciacaoTimerRunning(false);
  };

  const resetIniciacao = () => {
    setIniciacaoTimerRunning(false);
    setIniciacaoTimeLeft(iniciacaoMinutes * 60);
    setIniciacaoTimerAlert(false);
  };

  const saveRecord = (player, score, room) => {
    setRecords((prev) => {
      const next = [
        {
          player,
          score,
          room,
          createdAt: new Date().toISOString()
        },
        ...prev
      ].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 8);
      return next;
    });
  };

  const addTerminalLine = (msg, type = 'info') => {
    setTerminalOutput(prev => {
      const nextLines = [...prev, { text: msg, type, id: Date.now() + Math.random() }];
      return nextLines.slice(-12);
    });
  };

  const currentLevel = LEVELS.find(l => l.id === currentLevelId) || LEVELS[0];

  const handleRunCode = (code, lang) => {
    if (!isTimerActive) {
      addTerminalLine('O cronômetro está pausado ou zerado. Retome o tempo para enviar código.', 'error');
      return;
    }

    setTerminalOutput([]);
    setShowRoast(null);
    setIsVictory(false);

    addTerminalLine(`> ${lang === 'cpp' ? 'g++ -O2 main.cpp' : 'python3 solution.py'}`, "info");
    addTerminalLine("> Executando casos de teste do Juiz...", "info");

    setTimeout(() => {
      try {
        const result = currentLevel.validate(code, lang);
        if (result.ok) {
          addTerminalLine(`> RESULTADO: AC (Accepted) - ${result.msg}`, "success");
          setIsVictory(true);
          AudioEngine.setSettings({ tempo: 160, baseHz: 60 });

          if (user && userData && !userData.completedLevels.includes(currentLevel.id)) {
            const newCompleted = [...userData.completedLevels, currentLevel.id];
            setDoc(doc(db, 'artifacts', appId, 'users', user.uid), {
              completedLevels: newCompleted,
              score: (userData.score || 0) + 100
            }, { merge: true });
          }

          if (roomInfo?.code && user && roomInfo.players?.[user.uid]) {
            const roomRef = doc(db, 'artifacts', appId, 'rooms', roomInfo.code);
            const playerData = roomInfo.players[user.uid];
            const nextScore = (playerData.score || 0) + 100;
            const primaryUid = peerStatusRef.current.primaryUid || roomInfo.hostUid;
            const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const sentToPrimary = primaryUid !== user.uid && peerPairingRef.current?.sendTo(
              primaryUid,
              { type: 'score-request', requestId }
            );
            if (primaryUid === user.uid || !sentToPrimary) {
              updateDoc(roomRef, {
                [`players.${user.uid}.score`]: increment(100),
                updatedAt: new Date().toISOString()
              }).catch((error) => {
                setRoomMessage(`Falha ao sincronizar a pontuação: ${error.message}`);
              });
            } else {
              const timeout = setTimeout(() => {
                pendingScoreRequestsRef.current.delete(requestId);
                if ((roomInfoRef.current?.players?.[user.uid]?.score || 0) >= nextScore) return;
                updateDoc(roomRef, {
                  [`players.${user.uid}.score`]: increment(100),
                  updatedAt: new Date().toISOString()
                }).catch((error) => {
                  setRoomMessage(`O dispositivo principal não confirmou a pontuação: ${error.message}`);
                });
              }, 8000);
              pendingScoreRequestsRef.current.set(requestId, timeout);
            }
            setRoomInfo((previous) => previous?.players?.[user.uid]
              ? {
                ...previous,
                players: {
                  ...previous.players,
                  [user.uid]: { ...previous.players[user.uid], score: nextScore }
                }
              }
              : previous);
            saveRecord(playerData.name || 'Jogador', nextScore, roomInfo.code);
          }
        } else {
          addTerminalLine(`> RESULTADO: WA (Wrong Answer)`, "error");
          setShowRoast({ msg: result.roast, hint: result.hint });
          AudioEngine.setSettings({ tempo: 120, baseHz: 40 });
        }
      } catch (e) {
        addTerminalLine(`> ERRO: ${e.message}`, "error");
      }
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-indigo-500 flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="tracking-widest animate-pulse">CARREGANDO OBI QUEST...</p>
        </div>
        <LocalConnectionIndicator />
        <PeerConnectionIndicator roomCode={activeRoomCode} peers={peerStatus.peers} />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#020408] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col relative">
      <BinaryBackdrop />
      <header className="fixed top-0 left-0 right-0 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 md:h-16 flex items-center justify-between gap-2">
          <button type="button" className="flex min-w-0 items-center gap-2 text-left" onClick={() => setActiveTab('menu')} aria-label="Ir para o início">
            <Trophy className="h-5 w-5 shrink-0 text-indigo-400 sm:h-6 sm:w-6" />
            <span className="truncate font-black text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 sm:text-xl">
              OBI Quest<span className="hidden sm:inline"> (Modalidades)</span>
            </span>
          </button>

          <div className="flex min-w-0 items-center gap-2 sm:gap-4 md:gap-6">
            <div className="hidden md:flex items-center gap-4 text-sm font-bold">
              <button onClick={() => setActiveTab('menu')} className={`flex items-center gap-2 hover:text-white transition-colors ${activeTab === 'menu' ? 'text-indigo-400' : 'text-slate-400'}`}><Home className="w-4 h-4" /> Início</button>
              <button onClick={() => setActiveTab('iniciacao')} className={`flex items-center gap-2 hover:text-white transition-colors ${activeTab === 'iniciacao' ? 'text-indigo-400' : 'text-slate-400'}`}><BookOpen className="w-4 h-4" /> Iniciação (Papel)</button>
              <button onClick={() => setActiveTab('programacao')} className={`flex items-center gap-2 hover:text-white transition-colors ${activeTab === 'programacao' ? 'text-indigo-400' : 'text-slate-400'}`}><Code className="w-4 h-4" /> Programação (PC)</button>
              <button onClick={() => setActiveTab('mentor')} className={`flex items-center gap-2 hover:text-white transition-colors ${activeTab === 'mentor' ? 'text-indigo-400' : 'text-slate-400'}`}><Bot className="w-4 h-4" /> IA Mentora</button>
              <button onClick={() => setActiveTab('academy')} className={`flex items-center gap-2 hover:text-white transition-colors ${activeTab === 'academy' ? 'text-indigo-400' : 'text-slate-400'}`}><GraduationCap className="w-4 h-4" /> Regulamento</button>
            </div>

            <div className="flex shrink-0 items-center gap-1 border-l border-slate-800 pl-2 sm:gap-3 sm:pl-4 md:gap-4 md:pl-6">
              <div className="flex min-h-9 items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-400 sm:gap-2 sm:px-3 sm:text-sm">
                <Activity className="h-4 w-4" /> <span>{userData?.score || 0}<span className="hidden sm:inline"> pts</span></span>
              </div>
              <button type="button" onClick={toggleAudio} aria-label={audioEnabled ? 'Desativar áudio' : 'Ativar áudio'} className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-800">
                {audioEnabled ? <Volume2 className="w-5 h-5 text-indigo-400" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main ref={mainScrollRef} className="flex-1 overflow-y-auto relative z-10 pt-14 pb-20 md:pt-16 md:pb-0">
        {activeTab === 'menu' && (
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-6 items-stretch">
              <div className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-6 md:p-8 shadow-[0_0_80px_rgba(59,130,246,0.12)] backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                    <Cpu className="w-7 h-7 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-300">OBI Quest</div>
                    <div className="text-sm text-slate-400">Plataforma de treino e competição</div>
                  </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-none">
                  Olimpíada Brasileira de <span className="text-indigo-400">Informática</span>
                </h1>
                <p className="text-lg text-slate-300 max-w-2xl leading-relaxed mb-6">
                  Treine lógica, raciocínio e programação em uma experiência completa, com módulos de Iniciação, desafios de Programação e um ambiente de competição mais profissional.
                </p>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 mb-6">
                  <div className="text-xs font-mono uppercase text-emerald-300 mb-2">Dica de preparação</div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Comece pelos problemas mais simples, mantenha a leitura do enunciado precisa e revise o que errou para melhorar em sequência.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                  <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                    <div className="text-xs font-mono uppercase text-indigo-300 mb-1">Iniciação</div>
                    <div className="text-2xl font-black text-white">10 + 10</div>
                    <div className="text-xs text-slate-300">Questões por faixa</div>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <div className="text-xs font-mono uppercase text-emerald-300 mb-1">Programação</div>
                    <div className="text-2xl font-black text-white">10</div>
                    <div className="text-xs text-slate-300">Desafios práticos</div>
                  </div>
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                    <div className="text-xs font-mono uppercase text-amber-300 mb-1">Competição</div>
                    <div className="text-2xl font-black text-white">Timer</div>
                    <div className="text-xs text-slate-300">Modo sala + cronômetro</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    onClick={() => setActiveTab('iniciacao')}
                    className="bg-slate-950/70 border border-slate-700 hover:border-indigo-500 p-5 rounded-2xl cursor-pointer transition-all text-left group"
                  >
                    <div className="text-indigo-400 font-bold mb-2 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Iniciação</div>
                    <p className="text-sm text-slate-400 mb-4">Pratique raciocínio lógico e matemática em uma sequência organizada por faixa.</p>
                    <span className="text-xs text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">Abrir módulo <ChevronRight className="w-4 h-4" /></span>
                  </div>

                  <div
                    onClick={() => setActiveTab('programacao')}
                    className="bg-slate-950/70 border border-slate-700 hover:border-emerald-500 p-5 rounded-2xl cursor-pointer transition-all text-left group"
                  >
                    <div className="text-emerald-400 font-bold mb-2 flex items-center gap-2"><Code className="w-5 h-5" /> Programação</div>
                    <p className="text-sm text-slate-400 mb-4">Resolva desafios em Python/C++ com estrutura de juiz, feedback e cronômetro de prova.</p>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">Ir para o juiz <ChevronRight className="w-4 h-4" /></span>
                  </div>

                  <div
                    onClick={() => setActiveTab('academy')}
                    className="bg-slate-950/70 border border-slate-700 hover:border-cyan-500 p-5 rounded-2xl cursor-pointer transition-all text-left group"
                  >
                    <div className="text-cyan-400 font-bold mb-2 flex items-center gap-2"><Info className="w-5 h-5" /> Regulamento</div>
                    <p className="text-sm text-slate-400 mb-4">Entenda o formato da prova, o papel de cada modalidade e a lógica de preparação.</p>
                    <span className="text-xs text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">Abrir guia <ChevronRight className="w-4 h-4" /></span>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-800 bg-slate-950/70 p-6 backdrop-blur-sm space-y-4">
                <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                  <div className="text-xs font-mono uppercase text-amber-300 mb-2">Perfil do competidor</div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-3xl">{playerAvatar}</div>
                    <div>
                      <div className="text-lg font-black text-white">{formatPlayerDisplayName(playerName)}</div>
                      <div className="text-xs text-slate-400">Nome e avatar reutilizados na criação da sala.</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <input
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Configurar nome do jogador"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-2">
                      {avatarOptions.map((avatar) => (
                        <button
                          key={avatar}
                          onClick={() => setPlayerAvatar(avatar)}
                          className={`w-10 h-10 rounded-xl border text-lg transition-all ${playerAvatar === avatar ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-700 bg-slate-950 hover:border-slate-500'}`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                <div className="text-xs font-mono uppercase text-amber-300 mb-2">Estatísticas do usuário</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3">
                    <div className="text-[11px] font-mono uppercase text-indigo-300">Pontos de iniciação</div>
                    <div className="text-xl font-black text-white">{iniciacaoScore} pts</div>
                  </div>
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
                    <div className="text-[11px] font-mono uppercase text-cyan-300">Melhor colocação</div>
                    <div className="text-xl font-black text-white">#{bestRoomPlacement}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                  <div className="text-xl font-black text-white mb-1">Competição em sala</div>
                  <p className="text-sm text-slate-300 leading-relaxed">Crie uma sala, compartilhe o código com seus adversários e use o cronômetro para simular uma rodada competitiva. O perfil salvo já é reaproveitado na criação da sala.</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <div className="text-xs font-mono uppercase text-cyan-300 mb-2">Checklist</div>
                  <div className="space-y-3 text-sm text-slate-300">
                    {[{
                      key: 'iniciacao',
                      label: 'Resolver 3 questões de iniciação',
                      completed: homeChecklist.iniciacao,
                      hint: homeChecklist.iniciacao ? 'Concluído' : 'Selecione três respostas no módulo Iniciação.'
                    }, {
                      key: 'programacao',
                      label: 'Completar um problema de programação',
                      completed: homeChecklist.programacao,
                      hint: homeChecklist.programacao ? 'Concluído' : 'Envie código aceito no modo Programação.'
                    }, {
                      key: 'regulamento',
                      label: 'Revisar as regras do regulamento',
                      completed: homeChecklist.regulamento,
                      hint: homeChecklist.regulamento ? 'Concluído' : 'Abra a aba Regulamento.'
                    }].map((item) => (
                      <div key={item.key} className="flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3">
                        <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${item.completed ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300' : 'border-slate-700 text-slate-500'}`}>
                          {item.completed ? '✓' : ''}
                        </span>
                        <div className="text-left">
                          <div className="font-semibold text-slate-100">{item.label}</div>
                          <div className="text-xs text-slate-500">{item.hint}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'iniciacao' && (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-black text-white mb-2">Modalidade Iniciação (Papel e Lógica)</h2>
                <p className="text-slate-400">Questões objetivas simulando as provas I1 (6º/7º ano) e I2 (8º/9º ano).</p>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-4 py-3 text-sm font-bold text-indigo-300">
                Pontuação: {iniciacaoScore} pts / {iniciacaoMaxScore} pts
              </div>
            </div>

            <div className={`mb-6 rounded-2xl border p-4 transition-colors ${iniciacaoTimerTone}`}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2 text-xs font-mono uppercase text-slate-400">
                    <Clock3 className={`h-4 w-4 ${iniciacaoTimerAccent}`} />
                    <span>Tempo para responder</span>
                    <span className="ml-auto rounded-full border border-current/20 px-2 py-1 text-[10px] tracking-normal text-slate-300">{iniciacaoTimerRunning ? 'EM ANDAMENTO' : iniciacaoTimeLeft === 0 ? 'ENCERRADO' : 'PAUSADO'}</span>
                  </div>
                  <div className={`font-mono text-4xl font-black tabular-nums ${iniciacaoTimerAccent}`} aria-label={`Tempo restante ${formatTime(iniciacaoTimeLeft)}`}>{formatTime(iniciacaoTimeLeft)}</div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800" role="progressbar" aria-label="Tempo restante da prova" aria-valuemin={0} aria-valuemax={iniciacaoMinutes * 60} aria-valuenow={iniciacaoTimeLeft}>
                    <div className={`h-full transition-[width] duration-500 ${iniciacaoTimeLeft <= 60 ? 'bg-rose-400' : 'bg-cyan-400'}`} style={{ width: `${Math.max(0, Math.min(100, (iniciacaoTimeLeft / Math.max(1, iniciacaoMinutes * 60)) * 100))}%` }} />
                  </div>
                  <div className="mt-2 text-xs text-slate-400">{iniciacaoTimerStateLabel}</div>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 md:min-w-[280px]" role="group" aria-label="Controles do cronômetro de iniciação">
                  <button
                    onClick={iniciacaoTimerRunning ? pauseIniciacao : startIniciacao}
                    aria-label={iniciacaoTimerRunning ? 'Pausar cronômetro' : 'Iniciar cronômetro'}
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-slate-950 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${iniciacaoTimerRunning ? 'bg-amber-400 hover:bg-amber-300' : 'bg-emerald-400 hover:bg-emerald-300'}`}
                  >
                    {iniciacaoTimerRunning ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                    {iniciacaoTimerRunning ? 'Pausar' : 'Iniciar'}
                  </button>
                  <button
                    onClick={resetIniciacao}
                    aria-label="Reiniciar cronômetro"
                    title="Reiniciar cronômetro"
                    className="inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-900 px-3 text-sm font-semibold text-slate-200 transition-colors hover:border-rose-400 hover:bg-rose-400/10 hover:text-rose-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-4"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="hidden sm:inline">Reiniciar</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {[10, 15, 20, 25].map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => {
                        setIniciacaoMinutes(minutes);
                        setIniciacaoCustomSelected(false);
                        setIniciacaoCustomMinutes('');
                        setIniciacaoCustomError('');
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${iniciacaoMinutes === minutes ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'border-slate-700 text-slate-300 hover:border-cyan-500'}`}
                    >
                      {minutes} min
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIniciacaoCustomSelected((prev) => !prev)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${iniciacaoCustomSelected ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'border-slate-700 text-slate-300 hover:border-cyan-500'}`}
                  >
                    Personalizado
                  </button>
                </div>
                {iniciacaoCustomSelected && (
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={iniciacaoCustomMinutes}
                      onChange={(e) => {
                        setIniciacaoCustomMinutes(e.target.value);
                        setIniciacaoCustomError('');
                      }}
                      placeholder="Tempo personalizado (min)"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const minutes = Number(iniciacaoCustomMinutes);
                        if (!Number.isInteger(minutes) || minutes <= 0) {
                          setIniciacaoCustomError('Digite um número inteiro positivo.');
                          return;
                        }
                        setIniciacaoMinutes(minutes);
                        setIniciacaoCustomMinutes('');
                        setIniciacaoCustomSelected(false);
                      }}
                      className="py-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700 hover:bg-slate-700"
                    >
                      Definir
                    </button>
                  </div>
                )}
                {iniciacaoCustomError && (
                  <div className="text-rose-300 text-xs">{iniciacaoCustomError}</div>
                )}
              </div>
            </div>

            <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span>{isIniciacaoTimerActive
                  ? `O cronômetro está ativo. Você tem ${formatTime(iniciacaoTimeLeft)} para responder todas as perguntas.`
                  : 'Inicie o cronômetro para começar a responder. Enquanto estiver pausado ou zerado, as alternativas não podem ser selecionadas.'}
                </span>
                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={hideIniciacaoCorrectness}
                    onChange={(e) => setHideIniciacaoCorrectness(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  Ocultar correção imediata após responder
                </label>
              </div>
              <div className="text-xs text-slate-500 mt-2">A resposta escolhida fica fixa e o feedback só aparece quando você terminar a rodada ou pausar o cronômetro.</div>
            </div>

            <div className="mb-4 flex flex-wrap gap-3">
              {[1, 2].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedAno(year)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${selectedAno === year ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-indigo-500'}`}
                >
                  Iniciação {year}
                </button>
              ))}
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
              {['todos', 'fácil', 'médio', 'difícil'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedDifficulty(level)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${selectedDifficulty === level ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500'}`}
                >
                  {level === 'todos' ? 'Todas as dificuldades' : `Nível ${level}`}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {iniciacaoQuestionsByYear.map((q, index) => {
                const selectedAnswer = selectedIniciacaoAnswers[q.id];
                const selectedOption = selectedAnswer ? Number(selectedAnswer.split('-')[1]) : -1;
                const isCorrectAnswer = selectedOption === q.correct;

                return (
                  <div key={q.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-3 gap-2 flex-wrap">
                      <span className="text-xs font-mono px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded">{q.level}</span>
                      <span className="text-xs font-bold text-cyan-300">{q.difficulty} · {q.points} pts</span>
                      <span className="text-xs text-slate-500">Questão {index + 1} · {q.title}</span>
                    </div>
                    <p className="text-lg text-white font-medium mb-4">{index + 1}. {q.question}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswer === `${q.id}-${optIdx}`;
                        const isCorrectOption = optIdx === q.correct;
                        const alreadyAnswered = Boolean(selectedAnswer);
                        const optionClassName = isSelected
                          ? (hideIniciacaoCorrectness
                              ? 'bg-slate-950 border-cyan-500 text-slate-200'
                              : (isCorrectOption ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' : 'bg-rose-950/40 border-rose-500 text-rose-300'))
                          : (selectedAnswer && !hideIniciacaoCorrectness && isCorrectOption
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600');

                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              if (!isIniciacaoTimerActive || alreadyAnswered) return;
                              setSelectedIniciacaoAnswers(prev => ({ ...prev, [q.id]: `${q.id}-${optIdx}` }));
                            }}
                            disabled={!isIniciacaoTimerActive || alreadyAnswered}
                            className={`p-4 rounded-xl border text-left font-mono text-sm transition-all ${optionClassName} ${( !isIniciacaoTimerActive || alreadyAnswered) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {selectedAnswer && (
                      <div className={`mt-4 p-4 rounded-xl border text-sm ${hideIniciacaoCorrectness ? 'bg-slate-950 border-slate-700 text-slate-200' : isCorrectAnswer ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' : 'bg-rose-950/20 border-rose-500/30 text-rose-200'}`}>
                        <p className="font-bold mb-1">{hideIniciacaoCorrectness ? 'Resposta registrada.' : isCorrectAnswer ? 'Resposta correta!' : 'Resposta registrada.'}</p>
                        {!hideIniciacaoCorrectness && <p>{q.explanation}</p>}
                        {hideIniciacaoCorrectness && <p className="text-xs text-slate-500">A correção imediata está oculta.</p>}
                      </div>
                    )}
                    {!isIniciacaoTimerActive && (
                      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-400">
                        O cronômetro está pausado ou zerado. Retome o tempo para responder a esta questão.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'mentor' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <header className="flex flex-col gap-4 border-b border-slate-800 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-300">Oficina de aprendizagem</div>
                <h2 className="mt-2 text-3xl font-black text-white">Treinar, comparar, refletir</h2>
                <p className="mt-2 max-w-3xl text-sm text-slate-400">A mentoria é local e guiada por regras pedagógicas. Ela não envia seu código para um modelo externo e nunca entrega uma solução completa.</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><div className="text-xs uppercase text-slate-500">Sessões pareadas</div><div className="mt-1 font-mono text-xl text-white">{pedagogy.sessions.length}</div></div>
                <div><div className="text-xs uppercase text-slate-500">Dicas pedidas</div><div className="mt-1 font-mono text-xl text-white">{Object.values(pedagogy.hintCounts).reduce((sum, count) => sum + count, 0)}</div></div>
                <div><div className="text-xs uppercase text-slate-500">Autonomia</div><div className="mt-1 font-mono text-xl text-emerald-300">{autonomyRate}%</div></div>
              </div>
            </header>

            <nav className="flex gap-2 overflow-x-auto border-b border-slate-800 pb-3" aria-label="Áreas de aprendizagem">
              {[
                ['mentoria', 'Mentoria'], ['comparar', 'Sem IA × com IA'], ['depuracao', 'Depuração'],
                ['variacoes', 'Variações'], ['banca', 'Banca'], ['trilha', 'Trilha'],
                ['etica', 'Uso responsável'], ['relatorios', 'Relatórios e diário'],
                ['professor', 'Professor'], ['juizes', 'Juízes externos']
              ].map(([id, label]) => (
                <button key={id} onClick={() => setMentorSection(id)} className={`shrink-0 border-b-2 px-3 py-2 text-sm font-semibold ${mentorSection === id ? 'border-cyan-400 text-cyan-200' : 'border-transparent text-slate-400 hover:text-white'}`}>
                  {label}
                </button>
              ))}
            </nav>

            {mentorSection === 'mentoria' && (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
                <section className="space-y-5">
                  <div className="border-l-2 border-amber-400 bg-amber-400/5 p-4 text-sm text-amber-100">
                    <strong>Modo “só explique, não resolva”.</strong> As respostas são construídas por regras locais. Não cole credenciais ou dados pessoais.
                  </div>
                  {!mentorConsent && (
                    <div className="space-y-3 border border-slate-800 bg-slate-900/50 p-4">
                      <h3 className="font-bold text-white">Antes da sessão com orientação</h3>
                      {PRE_AI_CHECKLIST.map((item, index) => (
                        <label key={item} className="flex items-start gap-3 text-sm text-slate-300">
                          <input type="checkbox" checked={beforeAiChecklist[index]} onChange={() => setBeforeAiChecklist((previous) => previous.map((checked, checkedIndex) => checkedIndex === index ? !checked : checked))} className="mt-1 accent-cyan-400" />
                          <span>{item}</span>
                        </label>
                      ))}
                      <button onClick={startAiGuidance} className="border border-cyan-500 px-4 py-2 text-sm font-bold text-cyan-200 disabled:opacity-40" disabled={!beforeAiChecklist.every(Boolean)}>Iniciar orientação limitada</button>
                    </div>
                  )}
                  <div className="space-y-4 border border-slate-800 bg-slate-900/40 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div><h3 className="font-bold text-white">Mentor pedagógico</h3><p className="mt-1 text-xs text-slate-500">Nível máximo liberado: {unlockedMentorLevel} · {mentorStats.hintsUsed}/5 consultas nesta sessão</p></div>
                      <label className="text-sm text-slate-300">Tópico
                        <select value={mentorTopic} onChange={(event) => setMentorTopic(event.target.value)} className="ml-2 border border-slate-700 bg-slate-950 px-2 py-1 text-white">
                          <option value="busca-binaria">Busca binária</option><option value="dp">Programação dinâmica</option><option value="grafos">Grafos</option><option value="stl">Estruturas / STL</option><option value="python">Python</option>
                        </select>
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {MENTOR_LEVELS.map((level) => (
                        <button key={level.id} disabled={level.id > unlockedMentorLevel} title={level.id > unlockedMentorLevel ? 'Resolva problemas sem ajuda para liberar níveis adicionais.' : level.description} onClick={() => setMentorLevel(level.id)} className={`border px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-30 ${mentorLevel === level.id ? 'border-cyan-400 bg-cyan-400/10 text-cyan-100' : 'border-slate-700 text-slate-300'}`}>{level.id}. {level.label}</button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">{MENTOR_LEVELS[mentorLevel - 1].description}</p>
                    <div className="border-l border-emerald-500/70 pl-3 text-xs text-emerald-200">Sugestão para agora: {recommendedPrompt.text}</div>
                    <textarea value={mentorQuery} onChange={(event) => setMentorQuery(event.target.value)} rows={3} aria-label="Pergunta para o mentor" className="w-full border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none focus:border-cyan-500" />
                    <button onClick={askMentor} disabled={!mentorConsent || !mentorQuery.trim()} className="bg-cyan-700 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Pedir uma pista</button>
                    {mentorNotice && <p role="status" className="text-sm text-cyan-200">{mentorNotice}</p>}
                    <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-4">
                      {IA_PROMPT_LIBRARY.map((prompt) => (
                        <div key={prompt.id} className="flex items-center border border-slate-800 bg-slate-950">
                          <button onClick={() => { setMentorTopic(prompt.id === 'python' ? 'python' : prompt.id === 'dp' || prompt.id === 'graphs' ? prompt.id : mentorTopic); setMentorQuery(prompt.text); }} className="px-3 py-2 text-left text-xs text-slate-300 hover:text-white">{prompt.category}</button>
                          <button aria-label={`${pedagogy.favoritePrompts.includes(prompt.id) ? 'Remover' : 'Salvar'} prompt ${prompt.category}`} title="Salvar prompt" onClick={() => toggleFavoritePrompt(prompt.id)} className="border-l border-slate-800 px-2 py-2 text-amber-300">{pedagogy.favoritePrompts.includes(prompt.id) ? '★' : '☆'}</button>
                        </div>
                      ))}
                      <button onClick={exportFavoritePrompts} className="border border-slate-700 px-3 py-2 text-xs text-slate-300"><Download className="mr-1 inline h-3 w-3" />Exportar favoritos</button>
                    </div>
                  </div>
                </section>
                <section className="space-y-4 border-l border-slate-800 pl-5">
                  <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-white">Histórico por tópico</h3><span className="text-xs text-slate-500">{pedagogy.mentorHistory.length} registros</span></div>
                  <input value={mentorHistorySearch} onChange={(event) => setMentorHistorySearch(event.target.value)} placeholder="Filtrar histórico" className="w-full border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
                  <div className="max-h-[640px] space-y-4 overflow-y-auto">
                    {filteredMentorHistory.length === 0 && <p className="text-sm text-slate-500">As orientações desta conta aparecerão aqui.</p>}
                    {filteredMentorHistory.map((item) => <article key={item.id} className="border-b border-slate-800 pb-4">
                      <div className="text-xs uppercase text-cyan-300">{item.topic} · nível {item.level} · {new Date(item.createdAt || Date.now()).toLocaleString()}</div>
                      <p className="mt-2 text-sm text-slate-300"><strong className="text-white">Pergunta:</strong> {item.query}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{item.answer}</p>
                    </article>)}
                  </div>
                </section>
              </div>
            )}

            {mentorSection === 'comparar' && (
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                <section className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><h3 className="text-xl font-bold text-white">Sessão dupla cronometrada</h3><p className="mt-1 text-sm text-slate-400">Problemas gêmeos, mesma técnica e ordem sem IA → com apoio limitado.</p></div>
                    <div className="font-mono text-2xl text-cyan-200">{comparison.status === 'running' ? formatTime(comparisonElapsed) : '00:00'}</div>
                  </div>
                  {comparison.status === 'idle' && <div className="space-y-4 border border-slate-800 bg-slate-900/40 p-5">
                    <label className="block text-sm text-slate-300">Técnica pareada
                      <select value={variantTopic} onChange={(event) => setVariantTopic(event.target.value)} className="mt-2 block w-full border border-slate-700 bg-slate-950 p-3 text-white"><option value="busca-binaria">Busca binária</option><option value="dp">Programação dinâmica</option><option value="grafos">Grafos</option><option value="stl">Estruturas e STL</option></select>
                    </label>
                    <button onClick={startComparison} className="bg-cyan-700 px-4 py-3 font-bold text-white">Começar sem IA</button>
                  </div>}
                  {comparison.status === 'running' && <div className="space-y-4 border border-slate-800 bg-slate-900/40 p-5">
                    <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-cyan-300">{comparison.phase === 'solo' ? 'Rodada 1 · sem IA' : 'Rodada 2 · apoio limitado'}</span><span className="text-xs text-slate-500">{comparison.attempts} tentativa(s) · {comparison.hints} dica(s)</span></div>
                    <h4 className="font-bold text-white">{activeComparisonProblem.title}</h4><p className="text-sm leading-relaxed text-slate-300">{activeComparisonProblem.statement}</p>
                    <form onSubmit={(event) => { event.preventDefault(); checkComparisonAnswer(); }} className="flex flex-wrap gap-2">
                      <input value={comparisonAnswer} onChange={(event) => setComparisonAnswer(event.target.value)} disabled={comparison.solved} aria-label="Sua resposta" placeholder="Digite sua resposta" className="min-w-0 flex-1 border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
                      <button disabled={comparison.solved || !comparisonAnswer.trim()} className="border border-cyan-500 px-4 py-2 font-bold text-cyan-100 disabled:opacity-40">Verificar</button>
                    </form>
                    {comparisonFeedback && <p role="status" className="text-sm text-cyan-200">{comparisonFeedback}</p>}
                    {comparison.phase === 'ai' && <div className="space-y-3 border-t border-slate-800 pt-4">
                      {!mentorConsent && <div className="space-y-2 text-sm text-slate-300">{PRE_AI_CHECKLIST.map((item, index) => <label key={item} className="flex gap-2"><input type="checkbox" checked={beforeAiChecklist[index]} onChange={() => setBeforeAiChecklist((previous) => previous.map((checked, checkedIndex) => checkedIndex === index ? !checked : checked))} className="mt-1 accent-cyan-400" />{item}</label>)}<button onClick={startAiGuidance} disabled={!beforeAiChecklist.every(Boolean)} className="border border-cyan-500 px-3 py-2 text-xs font-bold text-cyan-100 disabled:opacity-40">Ativar até 3 pistas</button></div>}
                      <div className="flex flex-wrap gap-2"><select value={mentorLevel} onChange={(event) => setMentorLevel(Number(event.target.value))} className="border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white">{MENTOR_LEVELS.filter((level) => level.id <= unlockedMentorLevel).map((level) => <option key={level.id} value={level.id}>{level.id} · {level.label}</option>)}</select><button onClick={() => { setMentorTopic(comparison.topic); setMentorQuery(`Ajude-me a pensar neste problema de ${VARIATION_TEMPLATES[comparison.topic].technique}.`); askMentor(); }} disabled={!mentorConsent || comparison.hints >= 3} className="border border-emerald-500 px-3 py-2 text-sm font-bold text-emerald-200 disabled:opacity-40">Pedir pista ({comparison.hints}/3)</button></div>
                    </div>}
                    <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-4"><button onClick={finishComparisonRound} className="bg-emerald-700 px-4 py-2 font-bold text-white">{comparison.phase === 'solo' ? 'Encerrar rodada e abrir gêmeo' : 'Concluir sessão'}</button><button onClick={resetComparison} className="border border-slate-700 px-4 py-2 text-slate-300">Descartar</button></div>
                  </div>}
                  {comparison.status === 'complete' && <div className="border-l-2 border-emerald-400 bg-emerald-400/5 p-4 text-sm text-emerald-100">Sessão concluída. Os tempos e tentativas estão salvos em Relatórios e diário.</div>}
                  {comparisonFeedback && comparison.status !== 'running' && <p role="status" className="text-sm text-cyan-200">{comparisonFeedback}</p>}
                  <div className="space-y-4 border-t border-slate-800 pt-5">
                    <h4 className="font-bold text-white">Reflexão pós-sessão</h4>
                    <label className="block text-sm text-slate-400">O que a pista ajudou a perceber?<textarea value={comparisonReflection.helped} onChange={(event) => setComparisonReflection((previous) => ({ ...previous, helped: event.target.value }))} rows={2} className="mt-1 w-full border border-slate-700 bg-slate-950 p-3 text-white" /></label>
                    <label className="block text-sm text-slate-400">O que você teria feito sozinho?<textarea value={comparisonReflection.alone} onChange={(event) => setComparisonReflection((previous) => ({ ...previous, alone: event.target.value }))} rows={2} className="mt-1 w-full border border-slate-700 bg-slate-950 p-3 text-white" /></label>
                    <button onClick={saveComparisonReflection} disabled={!pedagogy.sessions.length} className="border border-slate-600 px-3 py-2 text-sm text-slate-200 disabled:opacity-40">Salvar reflexão</button>
                  </div>
                </section>
                <section className="space-y-5 border-l border-slate-800 pl-6">
                  <h3 className="text-xl font-bold text-white">Comparação mais recente</h3>
                  <p className="text-sm text-slate-400">{comparisonReport.insight}</p>
                  {[['Sem IA', comparisonReport.withoutAi, 'bg-rose-400'], ['Com apoio', comparisonReport.withAi, 'bg-emerald-400']].map(([label, round, color]) => <div key={label} className="space-y-2 border-b border-slate-800 pb-4">
                    <div className="flex justify-between text-sm"><span className="text-slate-300">{label}</span><span className="font-mono text-white">{formatTime(round.seconds || 0)}</span></div>
                    <div className="h-2 bg-slate-800"><div className={`h-full ${color}`} style={{ width: `${Math.max(4, Math.min(100, (round.seconds / Math.max(1, comparisonReport.withoutAi.seconds, comparisonReport.withAi.seconds)) * 100))}%` }} /></div>
                    <div className="flex gap-4 text-xs text-slate-500"><span>{round.attempts} tentativas</span><span>{round.correct} acertos</span><span>{round.hints} dicas</span></div>
                  </div>)}
                  {pedagogy.sessions.length > 0 && <p className="text-sm text-slate-300">Diferença observada: {formatTime(Math.abs(comparisonReport.withoutAi.seconds - comparisonReport.withAi.seconds))} em tempo e {Math.abs(comparisonReport.withoutAi.attempts - comparisonReport.withAi.attempts)} tentativa(s). Isso descreve esta sessão, não prova causalidade.</p>}
                  <div className="space-y-2 text-sm text-slate-400"><div>Problema gêmeo: {VARIATION_TEMPLATES[pedagogy.sessions[0]?.topic || variantTopic]?.technique}</div><div>Rodadas concluídas: {pedagogy.sessions.length}</div></div>
                </section>
              </div>
            )}

            {mentorSection === 'depuracao' && (
              <div className="grid gap-8 lg:grid-cols-2">
                <section className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Tradutor de vereditos e assistente de depuração</h3>
                  <label className="block text-sm text-slate-300">Tópico para perguntas e casos de borda
                    <select value={variantTopic} onChange={(event) => { setVariantTopic(event.target.value); setDebugCases([]); setDebugFeedback(null); }} className="mt-2 block w-full border border-slate-700 bg-slate-950 p-3 text-white"><option value="busca-binaria">Busca binária</option><option value="dp">Programação dinâmica</option><option value="grafos">Grafos</option><option value="stl">Estruturas / STL</option></select>
                  </label>
                  <label className="block text-sm text-slate-300">Veredito
                    <select value={judgeVerdict} onChange={(event) => { setJudgeVerdict(event.target.value); setDebugFeedback(null); }} className="mt-2 block w-full border border-slate-700 bg-slate-950 p-3 text-white"><option>Accepted</option><option>Wrong Answer</option><option>Runtime Error</option><option>Time Limit Exceeded</option><option>Compilation Error</option><option>Memory Limit</option></select>
                  </label>
                  <p className="border-l-2 border-amber-400 pl-3 text-sm text-amber-100">{debugExplanation}</p>
                  <label className="block text-sm text-slate-300">Cole o trecho que quer investigar<textarea value={debugCode} onChange={(event) => setDebugCode(event.target.value)} rows={10} spellCheck="false" className="mt-2 w-full border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-emerald-200" placeholder="Seu código fica apenas neste navegador." /></label>
                  <div className="flex flex-wrap gap-2"><button onClick={analyzeDebugCode} className="bg-cyan-700 px-4 py-2 font-bold text-white">Analisar pontos suspeitos</button><button onClick={generateDebugCases} className="border border-slate-600 px-4 py-2 text-slate-200">Gerar casos de borda</button></div>
                  <p className="text-xs text-slate-500">Análise heurística local: indica possíveis trechos para revisão, não altera nem corrige seu programa automaticamente.</p>
                </section>
                <section className="space-y-5 border-l border-slate-800 pl-6">
                  <h3 className="font-bold text-white">Checklist de erros comuns</h3>
                  <ul className="space-y-2">{DEBUG_CHECKLIST.map((item) => <li key={item} className="border-b border-slate-800 py-2 text-sm text-slate-300">□ {item}</li>)}</ul>
                  {debugFeedback && <div className="space-y-3 border-t border-slate-800 pt-4"><h4 className="font-bold text-cyan-200">Pontos para investigar</h4>{debugFeedback.findings.length ? debugFeedback.findings.map((finding, index) => <p key={`${finding.line}-${index}`} className="text-sm text-slate-300"><strong>Linha {finding.line}:</strong> {finding.text}</p>) : <p className="text-sm text-slate-400">Nenhum padrão simples foi reconhecido. Isso não prova que o código esteja correto.</p>}{debugFeedback.questions.map((question) => <p key={question} className="text-sm text-amber-200">{question}</p>)}</div>}
                  <div className="border-t border-slate-800 pt-4"><h4 className="font-bold text-white">Casos de teste extras</h4><ul className="mt-2 space-y-2 text-sm text-slate-300">{debugCases.map((item) => <li key={item}>• {item}</li>)}</ul></div>
                </section>
              </div>
            )}

            {mentorSection === 'variacoes' && (
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
                <section className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Gerador de variações e reconhecimento de padrões</h3>
                  <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm text-slate-300">Problema resolvido de origem<input value={variantSource} onChange={(event) => setVariantSource(event.target.value)} placeholder="Título ou ideia central" className="mt-2 block w-full border border-slate-700 bg-slate-950 p-3 text-white" /></label><label className="text-sm text-slate-300">Eixo da transformação<select value={variantAxis} onChange={(event) => setVariantAxis(event.target.value)} className="mt-2 block w-full border border-slate-700 bg-slate-950 p-3 text-white"><option value="restriction">Restrições</option><option value="input-output">Entrada e saída</option><option value="context">Tema e contexto</option></select></label><label className="text-sm text-slate-300 sm:col-span-2">Técnica<select value={variantTopic} onChange={(event) => setVariantTopic(event.target.value)} className="mt-2 block w-full border border-slate-700 bg-slate-950 p-3 text-white"><option value="busca-binaria">Busca binária</option><option value="dp">Programação dinâmica</option><option value="grafos">Grafos</option><option value="stl">Estruturas / STL</option></select></label></div>
                  <button onClick={generateProblemVariant} className="bg-emerald-700 px-4 py-3 font-bold text-white">Gerar variação adaptativa</button>
                  {generatedVariant && <article className="space-y-3 border-l-2 border-emerald-400 bg-emerald-400/5 p-5"><div className="flex items-start justify-between gap-3"><div><h4 className="font-bold text-white">{generatedVariant.title}</h4><div className="mt-1 text-xs uppercase text-emerald-300">{generatedVariant.technique} · {generatedVariant.difficulty} · eixo: {generatedVariant.changedAxis}</div></div><button onClick={saveGeneratedVariant} className="border border-emerald-500 px-3 py-2 text-xs font-bold text-emerald-100">Salvar</button></div><p className="text-sm leading-relaxed text-slate-200">{generatedVariant.variant}</p><p className="text-xs text-slate-400">{generatedVariant.nextStep}</p></article>}
                  <div className="space-y-3 border-t border-slate-800 pt-5"><h4 className="font-bold text-white">Qual padrão se repete?</h4><p className="text-sm text-slate-400">A técnica da variação atual é {VARIATION_TEMPLATES[variantTopic].technique}. Selecione o padrão que conecta os dois enunciados.</p><div className="flex flex-wrap gap-2"><select value={patternGuess} onChange={(event) => setPatternGuess(event.target.value)} className="border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"><option value="">Escolher padrão</option>{Object.values(VARIATION_TEMPLATES).map((item) => <option key={item.technique}>{item.technique}</option>)}</select><button onClick={submitPatternGuess} disabled={!patternGuess} className="border border-cyan-500 px-3 py-2 text-sm text-cyan-100 disabled:opacity-40">Conferir raciocínio</button></div>{patternFeedback && <p role="status" className="text-sm text-cyan-200">{patternFeedback}</p>}</div>
                </section>
                <section className="space-y-4 border-l border-slate-800 pl-6"><h3 className="font-bold text-white">Banco salvo</h3>{pedagogy.savedVariants.length === 0 && <p className="text-sm text-slate-500">Salve uma variação para reutilizá-la em outro treino.</p>}{pedagogy.savedVariants.map((variant) => <article key={variant.id} className="border-b border-slate-800 pb-4"><div className="text-xs text-emerald-300">{variant.technique} · {variant.difficulty}</div><h4 className="mt-1 font-bold text-white">{variant.title}</h4><p className="mt-2 text-sm text-slate-400">{variant.variant}</p><button onClick={() => { setGeneratedVariant(variant); setVariantTopic(Object.keys(VARIATION_TEMPLATES).find((key) => VARIATION_TEMPLATES[key].technique === variant.technique) || 'busca-binaria'); }} className="mt-2 text-xs text-cyan-200">Reutilizar variação</button></article>)}</section>
              </div>
            )}

            {mentorSection === 'banca' && (
              <div className="grid gap-8 lg:grid-cols-2">
                <section className="space-y-4"><h3 className="text-xl font-bold text-white">Entrevista de solução</h3><p className="text-sm text-slate-400">Explique o raciocínio em texto. O feedback verifica se você descreveu abordagem, complexidade e casos-limite; não avalia a correção formal da solução.</p><div className="border-l-2 border-cyan-500 pl-3 text-sm text-cyan-100">Por que você escolheu essa estrutura de dados? Qual é a complexidade da sua solução?</div><textarea value={interviewAnswer} onChange={(event) => setInterviewAnswer(event.target.value)} rows={8} placeholder="Descreva a estratégia, o custo e um caso-limite..." className="w-full border border-slate-700 bg-slate-950 p-3 text-sm text-white" /><button onClick={submitInterviewAnswer} disabled={!interviewAnswer.trim()} className="bg-cyan-700 px-4 py-2 font-bold text-white disabled:opacity-40">Receber perguntas de banca</button>{interviewFeedback && <p role="status" className="border-l-2 border-emerald-500 pl-3 text-sm text-emerald-100">{interviewFeedback}</p>}</section>
                <section className="space-y-4 border-l border-slate-800 pl-6"><h3 className="font-bold text-white">Histórico de explicações</h3>{pedagogy.interviewHistory.map((item) => <article key={item.id} className="border-b border-slate-800 pb-4"><div className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()} · {item.topic}</div><p className="mt-2 text-sm text-slate-300">{item.answer}</p><p className="mt-2 text-sm text-emerald-200">{item.feedback}</p></article>)}</section>
              </div>
            )}

            {mentorSection === 'trilha' && (
              <div className="space-y-6"><div><h3 className="text-xl font-bold text-white">Trilha: uso estratégico de IA</h3><p className="mt-1 text-sm text-slate-400">Os níveis de ajuda são liberados depois de duas resoluções independentes por nível.</p></div><ol className="grid gap-3 md:grid-cols-5">{TRAINING_STEPS.map((step, index) => { const ids = ['concept', 'solo', 'consult', 'compare', 'retry']; const done = pedagogy.completedTrainingSteps.includes(ids[index]); return <li key={step} className={`border-t-2 p-4 ${done ? 'border-emerald-400 bg-emerald-400/5' : 'border-slate-700 bg-slate-900/30'}`}><div className="font-mono text-xs text-slate-500">ETAPA 0{index + 1}</div><div className="mt-2 font-bold text-white">{step}</div><div className="mt-2 text-xs text-slate-400">{done ? 'Concluída' : 'Pendente'}</div>{index === 0 && !done && <button onClick={() => markTrainingStep('concept')} className="mt-3 text-xs text-cyan-200">Marcar conceito estudado</button>}{index === 4 && !done && pedagogy.sessions.length > 0 && <button onClick={() => markTrainingStep('retry')} className="mt-3 text-xs text-cyan-200">Marcar refação independente</button>}</li>; })}</ol><div className="border-l-2 border-amber-400 pl-4 text-sm text-amber-100">{mentorStats.hintsUsed >= 4 ? 'Você pediu várias pistas nesta sessão. Faça uma pausa para revisar a teoria e escrever sua própria hipótese antes de continuar.' : `Seu nível de ajuda liberado é ${unlockedMentorLevel}. Resolva duas rodadas sem ajuda para liberar o próximo nível.`}</div><div className="flex flex-wrap gap-3"><button onClick={() => setMentorSection('comparar')} className="border border-cyan-500 px-4 py-2 text-sm text-cyan-100">Iniciar etapa sem IA</button><button onClick={() => setMentorSection('relatorios')} className="border border-slate-600 px-4 py-2 text-sm text-slate-300">Ver evolução</button></div></div>
            )}

            {mentorSection === 'etica' && (
              <div className="grid gap-8 lg:grid-cols-2"><section className="space-y-4"><h3 className="text-xl font-bold text-white">Checklist depois da sessão</h3>{RESPONSIBLE_CHECKLIST.map((item, index) => <label key={item} className="flex items-start gap-3 border-b border-slate-800 py-3 text-sm text-slate-300"><input type="checkbox" checked={(pedagogy.usageChecklist || [false, false, false, false])[index]} onChange={() => saveUsageChecklist(index)} className="mt-1 accent-cyan-400" />{item}</label>)}<p className="text-xs text-slate-500">As respostas ficam neste navegador. Métricas compartilhadas com uma turma usam apelido e não incluem seu código.</p></section><section className="space-y-5 border-l border-slate-800 pl-6"><h3 className="font-bold text-white">Meta de autonomia</h3><label className="block text-sm text-slate-300">Problemas sem IA nesta semana<input type="number" min="1" max="50" value={pedagogy.weeklyGoal} onChange={(event) => updatePedagogy({ weeklyGoal: Math.max(1, Number(event.target.value) || 1) })} className="mt-2 block w-28 border border-slate-700 bg-slate-950 p-2 text-white" /></label><div className="flex justify-between text-sm text-slate-400"><span>Resolvidos sem IA</span><span>{weeklyIndependentCount} / {pedagogy.weeklyGoal}</span></div><div className="h-2 bg-slate-800"><div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, weeklyIndependentCount / Math.max(1, pedagogy.weeklyGoal) * 100)}%` }} /></div><p className="text-sm text-slate-400">Transparência: nesta versão a mentoria usa regras locais; nenhum trecho de código é enviado para um serviço externo.</p></section></div>
            )}

            {mentorSection === 'relatorios' && (
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]"><section className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-bold text-white">Relatório de evolução</h3><p className="mt-1 text-sm text-slate-400">Tempos, tentativas, acertos, dicas e tópicos das sessões concluídas.</p></div><button onClick={exportTrainingReport} className="border border-slate-600 px-3 py-2 text-sm text-slate-200"><Download className="mr-2 inline h-4 w-4" />Exportar CSV</button></div><div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-4 text-sm"><div><span className="text-slate-500">Resolvido sem IA</span><div className="mt-1 text-xl font-mono text-white">{pedagogy.sessions.filter((session) => session.rounds?.solo?.solved).length}</div></div><div><span className="text-slate-500">Resolvido com apoio</span><div className="mt-1 text-xl font-mono text-white">{pedagogy.sessions.filter((session) => session.rounds?.ai?.solved).length}</div></div></div><div className="space-y-4">{recentSessions.length === 0 && <p className="text-sm text-slate-500">Conclua uma sessão comparativa para começar seu histórico.</p>}{recentSessions.map((session) => <article key={session.id} className="border-b border-slate-800 pb-4"><div className="flex justify-between gap-3 text-sm"><strong className="text-white">{VARIATION_TEMPLATES[session.topic]?.technique || session.topic}</strong><time className="text-xs text-slate-500">{new Date(session.date).toLocaleDateString()}</time></div><div className="mt-2 grid grid-cols-2 gap-3 text-xs text-slate-400"><span>Sem IA: {formatTime(session.rounds?.solo?.seconds || 0)} · {session.rounds?.solo?.attempts || 0} tent.</span><span>Com IA: {formatTime(session.rounds?.ai?.seconds || 0)} · {session.rounds?.ai?.attempts || 0} tent.</span><span>Acertos: {(session.rounds?.solo?.solved ? 1 : 0) + (session.rounds?.ai?.solved ? 1 : 0)}/2</span><span>Dicas: {session.rounds?.ai?.hints || 0}</span></div>{session.reflection && <p className="mt-2 text-xs text-emerald-200">Reflexão: {session.reflection.helped}</p>}</article>)}</div></section><section className="space-y-5 border-l border-slate-800 pl-6"><h3 className="text-xl font-bold text-white">Diário de treino</h3><label className="block text-sm text-slate-400">O que aprendeu? O que errou e quer tentar diferente?<textarea value={diaryDraft} onChange={(event) => setDiaryDraft(event.target.value)} rows={4} className="mt-2 w-full border border-slate-700 bg-slate-950 p-3 text-white" /></label><button onClick={saveDiaryEntry} disabled={!diaryDraft.trim()} className="border border-cyan-500 px-4 py-2 text-sm text-cyan-100 disabled:opacity-40">Registrar no diário</button><div className="space-y-3">{pedagogy.diary.map((entry) => <article key={entry.id} className="border-l border-slate-700 pl-3"><div className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()} · {entry.topic}</div><p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{entry.text}</p></article>)}</div><div className="border-t border-slate-800 pt-4"><h4 className="font-bold text-white">Recomendação</h4><p className="mt-2 text-sm text-slate-400">{Object.values(pedagogy.hintCounts).length ? `Você pediu mais apoio em ${Object.entries(pedagogy.hintCounts).sort((a, b) => b[1] - a[1])[0][0]}. Experimente começar a próxima sessão resolvendo sem ajuda.` : 'Registre uma sessão para receber recomendações com base no seu próprio histórico.'}</p></div></section></div>
            )}

            {mentorSection === 'relatorios' && (
              <section className="space-y-4 border-t border-slate-800 pt-6">
                <div><h3 className="text-lg font-bold text-white">Dependência de dicas ao longo do tempo</h3><p className="mt-1 text-sm text-slate-400">Cada barra representa as dicas usadas na rodada assistida de uma sessão concluída.</p></div>
                {recentSessions.length === 0 && <p className="text-sm text-slate-500">O gráfico aparecerá depois da primeira sessão comparativa.</p>}
                <div className="space-y-3">{recentSessions.map((session) => {
                  const hints = session.rounds?.ai?.hints || 0;
                  const maxHints = Math.max(1, ...recentSessions.map((item) => item.rounds?.ai?.hints || 0));
                  return <div key={session.id} className="grid grid-cols-[110px_1fr_40px] items-center gap-3 text-xs"><span className="truncate text-slate-400">{new Date(session.date).toLocaleDateString()}</span><div className="h-3 bg-slate-800"><div className="h-full bg-amber-400" style={{ width: `${Math.max(3, hints / maxHints * 100)}%` }} /></div><span className="text-right font-mono text-white">{hints}</span></div>;
                })}</div>
              </section>
            )}

            {mentorSection === 'juizes' && (
              <section className="grid gap-4 border-t border-slate-800 pt-6 sm:grid-cols-2">
                <div><div className="text-xs uppercase text-slate-500">Concluídos no OBI Quest</div><div className="mt-1 font-mono text-2xl text-white">{userData?.completedLevels?.length || 0}</div></div>
                <div><div className="text-xs uppercase text-slate-500">Accepted nos juízes externos</div><div className="mt-1 font-mono text-2xl text-emerald-300">{pedagogy.externalSubmissions.filter((submission) => submission.verdict === 'Accepted').length}</div></div>
              </section>
            )}

            {mentorSection === 'professor' && (
              <div className="grid gap-8 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]"><section className="space-y-5"><h3 className="text-xl font-bold text-white">Minicurso e sala de prática</h3><div className="space-y-3 border-b border-slate-800 pb-5"><label className="block text-sm text-slate-300">Nome da sessão<input value={teacherTitle} onChange={(event) => setTeacherTitle(event.target.value)} className="mt-2 block w-full border border-slate-700 bg-slate-950 p-3 text-white" /></label><label className="block text-sm text-slate-300">Tópico<select value={teacherTopic} onChange={(event) => setTeacherTopic(event.target.value)} className="mt-2 block w-full border border-slate-700 bg-slate-950 p-3 text-white"><option value="busca-binaria">Busca binária</option><option value="dp">Programação dinâmica</option><option value="grafos">Grafos</option><option value="stl">Estruturas / STL</option></select></label><button onClick={createClassroom} className="bg-cyan-700 px-4 py-2 font-bold text-white">Criar sessão docente</button></div><div className="space-y-3"><h4 className="font-bold text-white">Entrar como estudante</h4><input value={teacherJoinCode} onChange={(event) => setTeacherJoinCode(event.target.value)} placeholder="Código da sessão" className="w-full border border-slate-700 bg-slate-950 p-3 uppercase text-white" /><input value={teacherAlias} onChange={(event) => setTeacherAlias(event.target.value)} placeholder="Apelido opcional; pode ficar vazio" className="w-full border border-slate-700 bg-slate-950 p-3 text-white" /><button onClick={joinClassroom} className="border border-slate-600 px-4 py-2 text-sm text-slate-200">Entrar na turma</button></div>{teacherMessage && <p role="status" className="text-sm text-cyan-200">{teacherMessage}</p>}{pedagogy.classroomCode && <div className="border-l-2 border-emerald-400 pl-3 text-sm text-emerald-100">Código ativo: <strong>{pedagogy.classroomCode}</strong><br />Papel nesta sessão: {pedagogy.classroomAlias}</div>}<p className="text-xs text-slate-500">Participação entre dispositivos requer Firebase e regras de Firestore que autorizem a sessão. Sem configuração, o treino individual continua disponível.</p></section><section className="space-y-5 border-l border-slate-800 pl-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-bold text-white">{teacherSession.title || 'Painel de acompanhamento'}</h3><p className="mt-1 text-sm text-slate-400">Dados agregados por apelido, sem publicar código do aluno.</p></div><button onClick={exportClassroomReport} disabled={!classroomParticipants.length} className="border border-slate-600 px-3 py-2 text-sm text-slate-200 disabled:opacity-40"><Download className="mr-2 inline h-4 w-4" />Exportar turma</button></div><div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-4 text-sm"><div><span className="text-slate-500">Participantes</span><div className="mt-1 text-xl font-mono text-white">{classroomParticipants.length}</div></div><div><span className="text-slate-500">Média de dicas</span><div className="mt-1 text-xl font-mono text-white">{classroomParticipants.length ? (classroomParticipants.reduce((sum, participant) => sum + (participant.hints || 0), 0) / classroomParticipants.length).toFixed(1) : '0.0'}</div></div></div>{classroomParticipants.map((participant) => <article key={participant.alias} className="flex flex-wrap justify-between gap-3 border-b border-slate-800 py-3 text-sm"><div><strong className="text-white">{participant.alias}</strong><div className="mt-1 text-xs text-slate-500">Tópicos: {Object.entries(participant.hintsByTopic || {}).map(([topic, count]) => `${topic} (${count})`).join(', ') || 'sem dicas registradas'}</div></div><div className="text-right text-slate-300">{participant.hints || 0} dicas · {participant.sessions || 0} sessões</div></article>)}<div className="border-t border-slate-800 pt-4"><h4 className="font-bold text-white">Perguntas para debate</h4><ul className="mt-2 space-y-2 text-sm text-slate-300"><li>• O que mudou entre tentar sozinho e receber uma pista?</li><li>• Qual pista ajudou a formular uma hipótese, sem entregar o caminho?</li><li>• Que caso de teste você criaria para verificar a abordagem?</li></ul></div></section></div>
            )}

            {mentorSection === 'juizes' && (
              <div className="grid gap-8 lg:grid-cols-2"><section className="space-y-4"><h3 className="text-xl font-bold text-white">Importar problema e acompanhar juiz externo</h3><p className="text-sm text-slate-400">Adicione um link de Beecrowd, Codeforces ou OBI ao histórico unificado. A autenticação e o envio continuam no site oficial.</p><label className="block text-sm text-slate-300">Juiz<select value={externalProvider} onChange={(event) => setExternalProvider(event.target.value)} className="mt-2 block w-full border border-slate-700 bg-slate-950 p-3 text-white"><option>Codeforces</option><option>Beecrowd</option><option>OBI</option></select></label><label className="block text-sm text-slate-300">Título<input value={externalTitle} onChange={(event) => setExternalTitle(event.target.value)} className="mt-2 block w-full border border-slate-700 bg-slate-950 p-3 text-white" /></label><label className="block text-sm text-slate-300">URL do problema<input type="url" value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} placeholder="https://..." className="mt-2 block w-full border border-slate-700 bg-slate-950 p-3 text-white" /></label><button onClick={importExternalProblem} className="bg-cyan-700 px-4 py-2 font-bold text-white">Importar para o histórico</button>{pedagogy.importedProblem?.provider === 'Codeforces' && <div className="space-y-2 border-t border-slate-800 pt-4"><label className="block text-sm text-slate-300">Handle público do Codeforces<input value={externalHandle} onChange={(event) => setExternalHandle(event.target.value)} className="mt-2 block w-full border border-slate-700 bg-slate-950 p-3 text-white" /></label><button onClick={syncCodeforcesHistory} disabled={externalLoading} className="border border-cyan-500 px-4 py-2 text-sm text-cyan-100 disabled:opacity-40">{externalLoading ? 'Consultando...' : 'Sincronizar vereditos públicos'}</button></div>}{externalMessage && <p role="status" className="text-sm text-cyan-200">{externalMessage}</p>}</section><section className="space-y-4 border-l border-slate-800 pl-6"><h3 className="font-bold text-white">Histórico unificado</h3>{pedagogy.externalSubmissions.length === 0 && <p className="text-sm text-slate-500">Problemas importados e submissões sincronizadas aparecerão aqui.</p>}{pedagogy.externalSubmissions.map((submission) => <article key={submission.id} className="space-y-2 border-b border-slate-800 pb-4"><div className="flex justify-between gap-3"><strong className="text-sm text-white">{submission.title}</strong><span className="text-xs text-slate-500">{submission.provider}</span></div><div className="flex flex-wrap items-center gap-3"><select value={submission.verdict} onChange={(event) => updateExternalVerdict(submission.id, event.target.value)} aria-label={`Veredito para ${submission.title}`} className="border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"><option>Pendente</option><option>Accepted</option><option>Wrong Answer</option><option>Time Limit Exceeded</option><option>Runtime Error</option><option>Em avaliação</option></select><a href={submission.url} target="_blank" rel="noreferrer" className="text-xs text-cyan-200 underline">Abrir juiz oficial</a><time className="text-xs text-slate-500">{new Date(submission.createdAt).toLocaleString()}</time></div></article>)}</section></div>
            )}
          </div>
        )}

        {activeTab === 'academy' && (
          <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
            <div className="space-y-3">
              <h2 className="text-4xl font-black text-white mb-2">Regulamento e Formato OBI</h2>
              <p className="text-slate-400">Resumo completo da competição, com foco em como participar, se preparar e entender melhor o funcionamento da prova.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="text-xs font-mono text-cyan-300 uppercase mb-2">Objetivo da competição</div>
                <p className="text-sm text-slate-300 leading-relaxed">A OBI é uma olimpíada de informática criada para despertar o raciocínio lógico, a criatividade e a capacidade de resolver problemas com disciplina. Ela combina desafios de lógica e programação em um ambiente competitivo, porém formativo.</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="text-xs font-mono text-emerald-300 uppercase mb-2">Formato geral</div>
                <p className="text-sm text-slate-300 leading-relaxed">A prova é dividida entre duas modalidades principais: Iniciação, voltada para raciocínio e lógica; e Programação, voltada para escrita de soluções em linguagem de computador com validação automática.</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-xl font-bold text-white">Modalidade Iniciação</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Dividida em Iniciação 1 (6º/7º ano) e Iniciação 2 (8º/9º ano). A prova é objetiva, geralmente feita no papel ou em ambiente de avaliação escrita, e busca medir raciocínio lógico, interpretação de enunciados, organização de ideias e base matemática básica.
              </p>
              <ul className="text-sm text-slate-300 space-y-2 list-disc pl-5">
                <li>O foco é a leitura cuidadosa, não a velocidade solta.</li>
                <li>As questões geralmente misturam lógica, sequências, operações simples e interpretação.</li>
                <li>Treinar com exercícios curtos e bem estruturados ajuda muito na confiança.</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-xl font-bold text-white">Modalidade Programação</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                A prova de Programação é realizada no computador. O aluno recebe um ou mais problemas, deve interpretar o enunciado, formular uma solução, escrever o código e submetê-lo ao juiz automático. Os idiomas comuns incluem <strong>Python, C, C++, Java e Pascal</strong>.
              </p>
              <ul className="text-sm text-slate-300 space-y-2 list-disc pl-5">
                <li>É essencial ler o enunciado como uma especificação formal.</li>
                <li>Primeiro teste com casos simples; depois revise a solução completa.</li>
                <li>Erros de entrada, saída e estruturas de controle são comuns em provas iniciais.</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="text-xs font-mono text-indigo-300 uppercase mb-2">Como estudar</div>
                <p className="text-sm text-slate-300 leading-relaxed">Estude por blocos pequenos, resolva várias questões, e depois revise o que errou para entender o padrão.</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="text-xs font-mono text-amber-300 uppercase mb-2">Como competir</div>
                <p className="text-sm text-slate-300 leading-relaxed">O ideal é manter a calma, dividir o tempo da prova e tentar garantir os problemas fáceis antes dos mais difíceis.</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="text-xs font-mono text-rose-300 uppercase mb-2">Como melhorar</div>
                <p className="text-sm text-slate-300 leading-relaxed">Anote erros recorrentes, refaça desafios mais simples e busque melhorar a clareza da solução e do raciocínio.</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-xl font-bold text-white">Regra prática de preparação</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-300">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">1. Leia o enunciado inteiro antes de começar.</div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">2. Faça pelo menos 3 exercícios de treino por sessão.</div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">3. Revise lógica, sintaxe e tempo de execução após cada tentativa.</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'programacao' && currentLevel && (
          <div className="h-full flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 lg:w-1/4 border-r border-slate-800/50 bg-slate-900/30 overflow-y-auto flex flex-col p-6">
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {programTabOptions.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setProgramSubTab(tab.id)}
                      className={`px-3 py-2 rounded-full text-xs font-bold transition-all ${programSubTab === tab.id ? 'bg-indigo-500 text-white border border-indigo-400' : 'bg-slate-950 text-slate-300 border border-slate-700 hover:border-slate-500'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono px-2 py-1 bg-black/50 rounded text-slate-300">PROGRAMAÇÃO - PROBLEMA {currentLevelId}</span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">{currentLevel.title}</h2>
              <p className="text-lg text-slate-200 font-medium mb-4">{currentLevel.missionGoal}</p>
              <p className="text-sm text-slate-400 mb-6">{currentLevel.description}</p>

              {programSubTab === 'desafios' && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 mb-4">
                  <div className="text-sm text-slate-300 mb-2">Modo Desafios</div>
                  <p className="text-xs text-slate-400">Resolva o problema atual usando o editor. Envie o código e veja o feedback do juiz automático.</p>
                </div>
              )}

              {programSubTab === 'competicao' && (
                <>
                  <div className={`rounded-2xl border p-4 mb-4 transition-all ${timerTone}`}>
                    <div className={`flex items-center gap-2 font-bold text-sm mb-2 ${timerAccent}`}>
                      <Clock3 className="w-4 h-4" /> Timer de competição
                    </div>
                    <div className="text-3xl font-black text-white mb-2 tracking-tight">{formatTime(timeLeft)}</div>
                    <div className="text-[11px] font-mono uppercase mb-3 opacity-90">
                      {timeLeft === 0 ? 'Tempo esgotado — finalize a rodada.' : timerAlert ? 'Últimos minutos — pressione com foco.' : roomInfo?.status === 'running' ? 'Modo competição sincronizado.' : 'Modo competição ativo.'}
                    </div>

                    <div className="mb-3 space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                      <div className="text-[11px] font-mono uppercase text-cyan-300">Partida multiplayer</div>
                      <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
                        <span className="text-base">{playerAvatar}</span>
                        <span>Você participa como <strong className="text-white">{formatPlayerDisplayName(playerName)}</strong></span>
                      </div>
                      {!db && <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] leading-relaxed text-amber-200">Este ambiente está sem Firebase: criar uma sala funciona apenas como demonstração local. Para jogar online, configure o Firebase no aplicativo.</p>}
                      <section className="space-y-2 rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3" aria-labelledby="create-room-title">
                        <div>
                          <h3 id="create-room-title" className="text-sm font-bold text-white">Criar uma partida</h3>
                          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{db ? 'Abra uma sala nova e compartilhe o código com os outros jogadores.' : 'Abra uma sala de demonstração neste aparelho.'}</p>
                        </div>
                        <button type="button" onClick={createCompetitionRoom} className="w-full rounded-lg bg-indigo-500 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-indigo-400">
                          {db ? 'Criar sala e receber código' : 'Criar partida local'}
                        </button>
                      </section>
                      <section className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3" aria-labelledby="join-room-title">
                        <div>
                          <h3 id="join-room-title" className="text-sm font-bold text-white">Entrar em uma partida</h3>
                          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">Digite o código que o criador da sala compartilhou.</p>
                        </div>
                        <label className="sr-only" htmlFor="competition-room-code">Código da sala</label>
                        <div className="flex gap-2">
                          <input
                            id="competition-room-code"
                            value={roomCodeInput}
                            onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                            placeholder="Ex.: ABC123"
                            autoComplete="off"
                            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                          />
                          <button type="button" onClick={joinCompetitionRoom} className="rounded-lg border border-cyan-700 bg-cyan-900/60 px-4 py-2 text-xs font-bold text-cyan-100 transition-colors hover:bg-cyan-800">
                            Entrar
                          </button>
                        </div>
                      </section>
                        {roomInfo?.code && (
                          <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-300">
                            <div className="flex items-center justify-between gap-2">
                              <span>Sala: <span className="select-all font-bold text-cyan-300">{roomInfo.code}</span></span>
                              {roomInfo.signal !== 'local' && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(roomInfo.code);
                                      setRoomMessage('Código da sala copiado.');
                                    } catch (error) {
                                      setRoomMessage(`Não foi possível copiar o código automaticamente (${error.message}). Código: ${roomInfo.code}`);
                                    }
                                  }}
                                  className="shrink-0 rounded border border-slate-700 px-2 py-1 text-[10px] font-bold text-slate-200 hover:border-cyan-500"
                                >
                                  Copiar código
                                </button>
                              )}
                            </div>
                            {roomInfo.players && <div className="mt-1">{Object.keys(roomInfo.players).length} jogador(es)</div>}
                          </div>
                        )}
                        {roomInfo?.code && roomInfo.signal !== 'local' && (
                          <div className="space-y-1 rounded-lg border border-cyan-900/60 bg-cyan-950/20 px-3 py-2 text-xs text-slate-300" role="status" aria-live="polite">
                            <div className="font-bold text-cyan-200">
                              Conexão direta entre aparelhos: {peerConnectionLabel}
                            </div>
                            <div>Principal (menor ping médio): {peerStatus.primaryUid ? roomInfo.players?.[peerStatus.primaryUid]?.name || peerStatus.primaryUid : 'elegendo...'}</div>
                            <div>Reserva: {peerStatus.backupUid ? roomInfo.players?.[peerStatus.backupUid]?.name || peerStatus.backupUid : 'aguardando outro dispositivo'}</div>
                            {peerStatus.peers.length > 0 ? (
                              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                {peerStatus.peers.map((peer) => {
                                  const hasRecentPing = peerPingSummary.measuredPeers.includes(peer);
                                  const currentAverage = hasRecentPing ? peer.average : null;
                                  const pingStateLabel = hasRecentPing
                                    ? 'média atual'
                                    : peer.channelState !== 'open' ? peer.state : peer.lastPingAt ? 'sem resposta' : 'medindo';
                                  const pingTone = currentAverage === null
                                    ? 'text-slate-400'
                                    : currentAverage <= 50 ? 'text-emerald-300' : currentAverage <= 100 ? 'text-cyan-300' : currentAverage <= 200 ? 'text-amber-300' : 'text-rose-300';
                                  const barTone = currentAverage === null
                                    ? 'bg-slate-700'
                                    : currentAverage <= 50 ? 'bg-emerald-400' : currentAverage <= 100 ? 'bg-cyan-400' : currentAverage <= 200 ? 'bg-amber-400' : 'bg-rose-400';
                                  const serverRole = peer.uid === peerStatus.primaryUid
                                    ? 'Principal'
                                    : peer.uid === peerStatus.backupUid ? 'Reserva' : '';
                                  const barWidth = currentAverage === null ? 0 : Math.max(4, Math.min(100, currentAverage / 200 * 100));
                                  return (
                                    <article key={peer.uid} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3" aria-label={`Ping de ${roomInfo.players?.[peer.uid]?.name || peer.uid}`}>
                                      <div className="flex items-start justify-between gap-2">
                                        <span className="min-w-0 truncate font-semibold text-slate-200">{roomInfo.players?.[peer.uid]?.name || peer.uid}</span>
                                        <span className={`shrink-0 text-[10px] font-bold uppercase ${peer.state === 'connected' && peer.channelState === 'open' ? 'text-emerald-300' : 'text-amber-300'}`}>
                                          {[serverRole, peer.state === 'connected' ? peer.channelState : peer.state].filter(Boolean).join(' · ')}
                                        </span>
                                      </div>
                                      <div className={`mt-2 font-mono text-xl font-bold ${pingTone}`} aria-live="polite">
                                        {currentAverage === null ? '—' : `${currentAverage} ms`}
                                        <span className="ml-2 text-[10px] font-sans font-normal text-slate-500">
                                          {pingStateLabel}
                                        </span>
                                      </div>
                                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800" role="meter" aria-label={`Latência média para ${roomInfo.players?.[peer.uid]?.name || peer.uid}`} aria-valuemin={0} aria-valuemax={200} aria-valuenow={currentAverage ?? 0}>
                                        <div className={`h-full rounded-full transition-[width] duration-300 ${barTone}`} style={{ width: `${barWidth}%` }} />
                                      </div>
                                      <div className="mt-2 flex justify-between gap-2 text-[10px] text-slate-500">
                                        <span>{peer.sampleCount} medições</span>
                                        <span>{hasRecentPing ? `${peer.minimum}–${peer.maximum} ms · var. ${peer.jitter} ms` : 'Sem medição recente'}</span>
                                      </div>
                                    </article>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="rounded-lg border border-dashed border-slate-800 px-3 py-3 text-center text-[11px] text-slate-500">
                                Entre com outro dispositivo para medir o ping P2P.
                              </div>
                            )}
                            {peerStatus.error && <div className="text-amber-200">{peerStatus.error}</div>}
                            <div className="pt-1 text-[10px] text-slate-500">A conexão direta exige Firebase para sinalização e uma rede compatível com WebRTC. A sala continua usando Firestore para persistir a partida.</div>
                          </div>
                        )}
                        {roomMessage && <div className="text-[11px] text-amber-200">{roomMessage}</div>}
                    </div>

                    {roomInfo?.players && (
                      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 mb-3">
                        <div className="text-[11px] font-mono text-emerald-300 uppercase mb-2">Placar de colocados</div>
                        <div className="space-y-2">
                          {roomRanking.map((player, index) => (
                            <div key={player.uid || player.name || index} className="flex items-center justify-between text-xs rounded-lg bg-slate-900 px-3 py-2">
                              <span className="flex items-center gap-2">
                                <span className="text-base">{player.avatar || '🧠'}</span>
                                <span className={`font-bold ${podiumClass[index] || 'text-slate-300'}`}>#{index + 1} {player.name}</span>
                              </span>
                              <span className="font-bold text-emerald-300">{player.score || 0} pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {records.length > 0 && (
                      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 mb-3">
                        <div className="text-[11px] font-mono text-amber-300 uppercase mb-2">Records locais</div>
                        <div className="space-y-2">
                          {records.slice(0, 5).map((record, index) => (
                            <div key={`${record.player}-${record.createdAt}-${index}`} className="flex items-center justify-between text-xs rounded-lg bg-slate-900 px-3 py-2">
                              <span className="text-slate-300">{index + 1}. {record.player} · {record.room}</span>
                              <span className="font-bold text-amber-300">{record.score} pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 mb-3">
                      <div className="flex flex-wrap gap-2">
                        {[15, 30, 45, 60].map((minutes) => (
                          <button
                            key={minutes}
                            onClick={() => {
                              setCompetitionMinutes(minutes);
                              setProgramacaoCustomSelected(false);
                              setProgramacaoCustomMinutes('');
                              setProgramacaoCustomError('');
                            }}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${competitionMinutes === minutes ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'border-slate-700 text-slate-300 hover:border-cyan-500'}`}
                          >
                            {minutes} min
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setProgramacaoCustomSelected((prev) => !prev)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${programacaoCustomSelected ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'border-slate-700 text-slate-300 hover:border-cyan-500'}`}
                        >
                          Personalizado
                        </button>
                      </div>
                      {programacaoCustomSelected && (
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={programacaoCustomMinutes}
                            onChange={(e) => {
                              setProgramacaoCustomMinutes(e.target.value);
                              setProgramacaoCustomError('');
                            }}
                            placeholder="Tempo personalizado (min)"
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const minutes = Number(programacaoCustomMinutes);
                              if (!Number.isInteger(minutes) || minutes <= 0) {
                                setProgramacaoCustomError('Digite um número inteiro positivo.');
                                return;
                              }
                              setCompetitionMinutes(minutes);
                              setProgramacaoCustomMinutes('');
                              setProgramacaoCustomSelected(false);
                            }}
                            className="py-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700 hover:bg-slate-700"
                          >
                            Definir
                          </button>
                        </div>
                      )}
                      {programacaoCustomError && (
                        <div className="text-rose-300 text-xs">{programacaoCustomError}</div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={startCompetition} disabled={!canControlCompetition} title={canControlCompetition ? '' : 'Somente o dispositivo principal pode controlar a partida.'} className="py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs disabled:cursor-not-allowed disabled:opacity-40">Iniciar</button>
                      <button onClick={pauseCompetition} disabled={!canControlCompetition} title={canControlCompetition ? '' : 'Somente o dispositivo principal pode controlar a partida.'} className="py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs disabled:cursor-not-allowed disabled:opacity-40">Pausar</button>
                      <button onClick={resetCompetition} disabled={!canControlCompetition} title={canControlCompetition ? '' : 'Somente o dispositivo principal pode controlar a partida.'} className="py-2 rounded-xl bg-rose-500 text-white font-bold text-xs disabled:cursor-not-allowed disabled:opacity-40">Reset</button>
                    </div>
                  </div>

                  <div className="mt-auto bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-xs text-amber-200 font-mono">
                      {language === 'cpp' ? currentLevel.syntaxTipCpp : currentLevel.syntaxTipPython}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 flex flex-col h-full bg-[#020408] p-4 md:p-6 gap-4">
              <div className="flex-1 min-h-[300px]">
                <CodeEditor
                  initialValueCpp={currentLevel.initialCodeCpp}
                  initialValuePython={currentLevel.initialCodePython}
                  language={language}
                  onLangChange={setLanguage}
                  onRun={handleRunCode}
                  onReset={() => { setTerminalOutput([]); setShowRoast(null); setIsVictory(false); }}
                  isVictory={isVictory}
                  canSubmit={isTimerActive}
                />
              </div>

              <div className="h-48 flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-black rounded-2xl border border-slate-800 p-4 font-mono text-sm overflow-y-auto">
                  <div className="text-slate-500 mb-2 border-b border-slate-800 pb-2">Console do Juiz Automático</div>
                  {terminalOutput.map((l) => (
                    <div key={l.id} className={l.type === 'error' ? 'text-rose-400 font-bold' : l.type === 'success' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{l.text}</div>
                  ))}
                </div>
                <div className="w-full md:w-80 flex flex-col justify-center">
                  {showRoast ? (
                    <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4">
                      <p className="text-rose-400 font-bold mb-1">Feedback do Juiz:</p>
                      <p className="text-rose-200 text-sm mb-2">"{showRoast.msg}"</p>
                      <p className="text-xs text-rose-300 font-mono">{showRoast.hint}</p>
                    </div>
                  ) : isVictory ? (
                    <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 text-center">
                      <p className="text-emerald-400 font-bold mb-2">Aprovado (AC)!</p>
                      <button onClick={() => { setCurrentLevelId(Math.min(LEVELS.length, currentLevelId + 1)); setIsVictory(false); setTerminalOutput([]); }} className="w-full py-2 bg-emerald-600 text-white rounded font-bold text-sm">Próximo Problema</button>
                    </div>
                  ) : (
                    <div className="text-slate-600 text-sm text-center">Envie seu código em C++ ou Python para validação.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-950/95 px-1 pt-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden" aria-label="Navegação principal">
        <div className="mx-auto grid max-w-xl grid-cols-5">
          {[
            { id: 'menu', label: 'Início', Icon: Home },
            { id: 'iniciacao', label: 'Iniciação', Icon: BookOpen },
            { id: 'programacao', label: 'Código', Icon: Code },
            { id: 'mentor', label: 'Mentoria', Icon: Bot },
            { id: 'academy', label: 'Regras', Icon: GraduationCap }
          ].map(({ id, label, Icon }) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)} aria-current={activeTab === id ? 'page' : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold leading-none transition-colors ${activeTab === id ? 'text-cyan-300' : 'text-slate-500 hover:text-slate-200'}`}>
              <Icon className="h-5 w-5" strokeWidth={activeTab === id ? 2.5 : 1.8} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
      <LocalConnectionIndicator />
      <PeerConnectionIndicator
        roomCode={roomInfo?.code === activeRoomCode && roomInfo.signal !== 'local' ? activeRoomCode : ''}
        peers={peerStatus.peers}
        players={roomInfo?.players}
      />
      <AppVersion />
    </div>
  );
}
