import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
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
  Cloud, Download, Upload, Copy, GraduationCap, Map as MapIcon, Compass,
  Plus, Repeat2
} from 'lucide-react';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'obi-quest-v1';

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
  { id: 1, label: 'Pergunta socrática', description: 'Faça o aluno refletir sobre o problema sem entregar a resposta.' },
  { id: 2, label: 'Dica conceitual', description: 'Explique a ideia central e a estratégia de solução.' },
  { id: 3, label: 'Exemplo análogo', description: 'Use um caso parecido para ilustrar o conceito.' },
  { id: 4, label: 'Pseudocódigo parcial', description: 'Mostre a estrutura sem entregar a solução final.' }
];

const IA_PROMPT_LIBRARY = [
  'Explique o conceito de busca binária.',
  'Gere uma variação deste problema.',
  'O que meu código está fazendo de errado?',
  'Qual é a diferença entre complexidade linear e logarítmica?',
  'Como posso testar casos de borda em um problema de grafos?',
  'Explique por que esta estrutura de dados é adequada para este caso.'
];

const DEBUG_GUIDE = {
  'Runtime Error': 'O erro aconteceu durante a execução. Verifique se há divisão por zero, acesso a índice fora do vetor ou uso de memória inválida.',
  'Wrong Answer': 'A saída está diferente do esperado. Revise a lógica, os casos de borda e a ordem dos cálculos.',
  'Time Limit Exceeded': 'A solução está correta em princípio, mas é lenta demais. Avalie a complexidade e reduza a quantidade de operações.',
  'Compilation Error': 'O programa não compila. Observe erros de sintaxe, tipos e chaves ou ponto e vírgula faltando.',
  'Memory Limit': 'O programa usa mais memória do que o permitido. Reavalie estruturas gigantes ou cópias desnecessárias.'
};

const VARIATION_TEMPLATES = {
  'busca-binaria': {
    title: 'Busca binária em faixa crescente',
    variant: 'Agora o vetor está ordenado e você deve retornar a posição do valor alvo em O(log n), mas com uma contagem de comparações.',
    difficulty: 'médio'
  },
  'dp': {
    title: 'DP com mochila leve',
    variant: 'Dado um conjunto de itens com peso e valor, escolha o melhor conjunto sem exceder a capacidade. Exiba o maior valor possível.',
    difficulty: 'difícil'
  },
  'grafos': {
    title: 'Menor caminho em grafo de rotas',
    variant: 'Encontre o menor caminho de um ponto para o outro, considerando custos distintos por aresta.',
    difficulty: 'difícil'
  },
  'stl': {
    title: 'Ordenação e contagem de repetidos',
    variant: 'Receba uma sequência de números e apresente a quantidade de valores repetidos após a ordenação.',
    difficulty: 'fácil'
  }
};

const RESPONSIBLE_CHECKLIST = [
  'Eu tentei resolver sozinho antes de pedir ajuda.',
  'Eu entendi a explicação e não apenas copiei a solução.',
  'Eu revisei as partes do código que ainda não entendo.',
  'Eu usei a IA como ferramenta de reflexão, não como atalho.'
];

const BinaryBackdrop = () => {
  const columns = 28;
  const rows = 16;
  const cells = Array.from({ length: columns * rows }, (_, index) => (index % 2 === 0 ? '0' : '1'));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_35%),linear-gradient(180deg,#020408_0%,#030712_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.10)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div
        className="absolute inset-0 p-3 md:p-6 grid gap-1 md:gap-2 text-[8px] md:text-[10px] font-mono text-cyan-300/30"
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
  const [records, setRecords] = useState([]);
  const [bestRoomPlacement, setBestRoomPlacement] = useState(99);
  const [bestRoomScore, setBestRoomScore] = useState(0);
  const [homeChecklist, setHomeChecklist] = useState({
    iniciacao: false,
    programacao: false,
    regulamento: false
  });
  const [mentorLevel, setMentorLevel] = useState(1);
  const [mentorQuery, setMentorQuery] = useState('Explique o conceito de busca binária.');
  const [mentorHistory, setMentorHistory] = useState([
    {
      id: 1,
      query: 'Explique o conceito de busca binária.',
      level: 2,
      answer: 'A busca binária só funciona em dados ordenados. Você reduz o intervalo pela metade a cada passo, comparando o alvo com o ponto médio. Isso transforma uma busca linear em uma busca logarítmica.'
    }
  ]);
  const [mentorStats, setMentorStats] = useState({ totalQueries: 1, hintsUsed: 1 });
  const [judgeVerdict, setJudgeVerdict] = useState('Wrong Answer');
  const [variantTopic, setVariantTopic] = useState('busca-binaria');
  const [generatedVariant, setGeneratedVariant] = useState(VARIATION_TEMPLATES['busca-binaria']);
  const [responsibleUsage, setResponsibleUsage] = useState([false, false, false, false]);
  const [teacherSession] = useState({
    students: 22,
    averageHints: 3.4,
    autonomy: 74
  });

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

  const buildMentorReply = (query, level) => {
    const normalized = query.toLowerCase();

    if (normalized.includes('busca bin') || normalized.includes('busca-bin')) {
      const base = 'A busca binária exige dados ordenados. Em vez de percorrer todo o vetor, você compara o alvo com o ponto médio e descarta metade do espaço de busca. Isso reduz a complexidade de O(n) para O(log n).';
      if (level === 1) return `${base} Qual seria o critério para decidir se o alvo está à esquerda ou à direita do meio?`;
      if (level === 2) return `${base} Dica: pense em um intervalo e reduza o espaço de busca a cada comparação.`;
      if (level === 3) return `${base} Exemplo análogo: ao procurar uma palavra em um dicionário, você não lê página por página; você abre no meio e decide em qual metade procurar.`;
      if (level === 4) return `${base} Pseudocódigo parcial: while (esq <= dir) { meio = ...; if (v[meio] == alvo) return meio; if (v[meio] < alvo) esq = ...; else dir = ...; }`;
    }

    if (normalized.includes('varia') || normalized.includes('variação')) {
      return 'Para gerar variações, mantenha o núcleo da ideia e altere apenas um eixo: a restrição, o contexto, a entrada ou a saída. O objetivo é treinar reconhecimento de padrão, não repetir a solução literalmente.';
    }

    if (normalized.includes('código') || normalized.includes('errado') || normalized.includes('debug')) {
      return 'Antes de corrigir, trace o fluxo do seu código. Pergunte: qual valor entra no loop, quando a condição muda, e o que acontece no primeiro caso limite? Isso ajuda a localizar a falha sem cair em correção automática.';
    }

    if (normalized.includes('complexidade') || normalized.includes('log') || normalized.includes('linear')) {
      return 'Complexidade linear significa que a quantidade de trabalho cresce proporcionalmente ao tamanho da entrada. Já a logarítmica aparece quando o problema é reduzido pela metade a cada etapa, como em busca binária ou recorrências de divisão.';
    }

    if (normalized.includes('grafos') || normalized.includes('grafo')) {
      return 'Em grafos, a primeira pergunta é: o problema exige apenas presença de caminho, ou também exige o menor custo? Isso define se a estratégia é busca, DFS, BFS ou algoritmo de menor caminho.';
    }

    if (normalized.includes('stl') || normalized.includes('estrutura')) {
      return 'Estruturas de dados são ferramentas de organização. O mais importante é saber o custo de cada operação: acesso, inserção, busca e ordenação. Isso ajuda a escolher entre vetor, conjunto, mapa e fila.';
    }

    return 'A melhor forma de aprender é quebrar o problema em partes: objetivo, entradas, restrições e padrão de decisão. Tente responder essas quatro perguntas antes de pedir a próxima dica.';
  };

  const askMentor = () => {
    const reply = buildMentorReply(mentorQuery, mentorLevel);
    setMentorHistory((prev) => [{
      id: Date.now(),
      query: mentorQuery,
      level: mentorLevel,
      answer: reply
    }, ...prev].slice(0, 6));
    setMentorStats((prev) => ({
      totalQueries: prev.totalQueries + 1,
      hintsUsed: prev.hintsUsed + (mentorLevel > 1 ? 1 : 0)
    }));
  };

  const generateProblemVariant = () => {
    const template = VARIATION_TEMPLATES[variantTopic] || VARIATION_TEMPLATES['busca-binaria'];
    const difficultyShift = mentorStats.hintsUsed > 4 ? 'difícil' : template.difficulty;
    const variant = {
      ...template,
      difficulty: difficultyShift,
      nextStep: 'Tente escrever a ideia geral antes do código. Identifique a estrutura de dados, a operação chave e o critério de parada.'
    };
    setGeneratedVariant(variant);
  };

  const debugExplanation = DEBUG_GUIDE[judgeVerdict] || DEBUG_GUIDE['Wrong Answer'];

  const comparisonReport = useMemo(() => {
    const withoutAi = { time: 26, attempts: 7, correct: 2, hints: 0 };
    const withAi = { time: 18, attempts: 4, correct: 3, hints: mentorStats.hintsUsed };
    const deltaTime = withoutAi.time - withAi.time;
    const deltaAttempts = withoutAi.attempts - withAi.attempts;
    return {
      withoutAi,
      withAi,
      deltaTime,
      deltaAttempts,
      insight: deltaTime > 0
        ? 'O uso estratégico de IA ajudou a reduzir tempo e tentativas, mas ainda vale reforçar a etapa de raciocínio solo.'
        : 'A sessão com IA ainda exige mais autonomia. Revise o conceito antes de consultar a próxima pista.'
    };
  }, [mentorStats.hintsUsed]);

  const autonomyRate = Math.min(100, Math.max(30, 100 - mentorStats.hintsUsed * 8 + teacherSession.autonomy / 2));

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

    await setDoc(roomRef, initialRoom);
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
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      setRoomMessage('Sala não encontrada. Verifique o código.');
      return;
    }

    const roomData = roomSnap.data();
    const currentPlayer = { uid: user.uid, name: displayName, avatar, score: 0, joinedAt: new Date().toISOString() };
    const updatedPlayers = { ...(roomData.players || {}), [user.uid]: currentPlayer };

    await updateDoc(roomRef, {
      players: updatedPlayers,
      updatedAt: new Date().toISOString()
    });

    setRoomInfo({ ...roomData, players: updatedPlayers });
    setActiveRoomCode(code);
    setRoomMessage('Você entrou na sala com sucesso.');
  };

  const startCompetition = async () => {
    if (!roomInfo) {
      setRoomMessage('Crie ou entre em uma sala primeiro.');
      return;
    }

    const updatedRoom = {
      ...roomInfo,
      status: 'running',
      startedAt: new Date().toISOString(),
      timeLimit: competitionMinutes * 60
    };

    if (db && user && roomInfo.hostUid === user.uid) {
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
    setTimerRunning(false);
    if (roomInfo) {
      const updatedRoom = {
        ...roomInfo,
        status: 'paused',
        timeLimit: timeLeft,
        startedAt: null
      };
      setRoomInfo(updatedRoom);

      if (db && user && roomInfo.hostUid === user.uid && roomInfo.code) {
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

      if (db && user && roomInfo.hostUid === user.uid && roomInfo.code) {
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
            const updatedPlayers = {
              ...roomInfo.players,
              [user.uid]: {
                ...playerData,
                score: nextScore
              }
            };
            setRoomInfo((prev) => prev ? { ...prev, players: updatedPlayers } : prev);
            updateDoc(roomRef, { players: updatedPlayers });
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col relative">
      <BinaryBackdrop />
      <header className="fixed top-0 left-0 right-0 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('menu')}>
            <Trophy className="w-6 h-6 text-indigo-400" />
            <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              OBI Quest (Modalidades)
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-sm font-bold">
              <button onClick={() => setActiveTab('menu')} className={`flex items-center gap-2 hover:text-white transition-colors ${activeTab === 'menu' ? 'text-indigo-400' : 'text-slate-400'}`}><Home className="w-4 h-4" /> Início</button>
              <button onClick={() => setActiveTab('iniciacao')} className={`flex items-center gap-2 hover:text-white transition-colors ${activeTab === 'iniciacao' ? 'text-indigo-400' : 'text-slate-400'}`}><BookOpen className="w-4 h-4" /> Iniciação (Papel)</button>
              <button onClick={() => setActiveTab('programacao')} className={`flex items-center gap-2 hover:text-white transition-colors ${activeTab === 'programacao' ? 'text-indigo-400' : 'text-slate-400'}`}><Code className="w-4 h-4" /> Programação (PC)</button>
              <button onClick={() => setActiveTab('mentor')} className={`flex items-center gap-2 hover:text-white transition-colors ${activeTab === 'mentor' ? 'text-indigo-400' : 'text-slate-400'}`}><Bot className="w-4 h-4" /> IA Mentora</button>
              <button onClick={() => setActiveTab('academy')} className={`flex items-center gap-2 hover:text-white transition-colors ${activeTab === 'academy' ? 'text-indigo-400' : 'text-slate-400'}`}><GraduationCap className="w-4 h-4" /> Regulamento</button>
            </div>

            <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full text-sm font-bold">
                <Activity className="w-4 h-4" /> {userData?.score || 0} pts
              </div>
              <button onClick={toggleAudio} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors">
                {audioEnabled ? <Volume2 className="w-5 h-5 text-indigo-400" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 pt-16">
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

            <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
                <div>
                  <div className="text-xs font-mono uppercase text-cyan-300 mb-2">Tempo para responder as perguntas</div>
                  <div className="text-3xl font-black text-white">{formatTime(iniciacaoTimeLeft)}</div>
                  <div className="text-xs uppercase tracking-[0.15em] mt-1 text-slate-400">{iniciacaoTimerStateLabel}</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
                  <button onClick={startIniciacao} className="w-full py-2 rounded-xl border border-emerald-500 text-emerald-500 font-bold text-xs bg-transparent hover:bg-emerald-500/10">Iniciar</button>
                  <button onClick={pauseIniciacao} className="w-full py-2 rounded-xl border border-amber-500 text-amber-500 font-bold text-xs bg-transparent hover:bg-amber-500/10">Pausar</button>
                  <button onClick={resetIniciacao} className="w-full py-2 rounded-xl border border-rose-500 text-rose-500 font-bold text-xs bg-transparent hover:bg-rose-500/10">Reset</button>
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
          <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-300">IA mentora pedagógica</div>
                <h2 className="text-4xl font-black text-white mt-2">Modo estratégico de aprendizagem</h2>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                Dicas pedidas: {mentorStats.hintsUsed} · Autonomia: {Math.round(autonomyRate)}%
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-black text-white">Chat de IA mentora</div>
                    <div className="flex gap-2 flex-wrap">
                      {MENTOR_LEVELS.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setMentorLevel(level.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border ${mentorLevel === level.id ? 'border-cyan-500 bg-cyan-500/15 text-cyan-200' : 'border-slate-700 text-slate-300'}`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <textarea
                      value={mentorQuery}
                      onChange={(e) => setMentorQuery(e.target.value)}
                      rows={3}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {IA_PROMPT_LIBRARY.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => setMentorQuery(prompt)}
                        className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={askMentor}
                    className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 font-black text-white shadow-[0_0_30px_rgba(99,102,241,0.22)]"
                  >
                    Pedir orientação pedagógica
                  </button>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                  <div className="text-lg font-black text-white mb-4">Histórico de ajudas</div>
                  <div className="space-y-3">
                    {mentorHistory.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-300 mb-2">
                          Nível {item.level} · {MENTOR_LEVELS[item.level - 1]?.label}
                        </div>
                        <p className="text-sm text-slate-300 mb-1"><span className="font-bold text-white">Pergunta:</span> {item.query}</p>
                        <p className="text-sm text-slate-200"><span className="font-bold text-emerald-300">Resposta:</span> {item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                  <div className="text-lg font-black text-white mb-4">Modo comparativo</div>
                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="rounded-2xl border border-slate-700 bg-slate-950 p-3">
                      <div className="text-xs font-mono uppercase text-rose-300 mb-2">Sem IA</div>
                      <div className="flex justify-between"><span>Tempo</span><span>{comparisonReport.withoutAi.time} min</span></div>
                      <div className="flex justify-between"><span>Tentativas</span><span>{comparisonReport.withoutAi.attempts}</span></div>
                      <div className="flex justify-between"><span>Acertos</span><span>{comparisonReport.withoutAi.correct}</span></div>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-950 p-3">
                      <div className="text-xs font-mono uppercase text-emerald-300 mb-2">Com IA</div>
                      <div className="flex justify-between"><span>Tempo</span><span>{comparisonReport.withAi.time} min</span></div>
                      <div className="flex justify-between"><span>Tentativas</span><span>{comparisonReport.withAi.attempts}</span></div>
                      <div className="flex justify-between"><span>Acertos</span><span>{comparisonReport.withAi.correct}</span></div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-cyan-100">
                    {comparisonReport.insight}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                  <div className="text-lg font-black text-white mb-4">Depuração guiada pelo juiz</div>
                  <select
                    value={judgeVerdict}
                    onChange={(e) => setJudgeVerdict(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none"
                  >
                    <option value="Runtime Error">Runtime Error</option>
                    <option value="Wrong Answer">Wrong Answer</option>
                    <option value="Time Limit Exceeded">Time Limit Exceeded</option>
                    <option value="Compilation Error">Compilation Error</option>
                    <option value="Memory Limit">Memory Limit</option>
                  </select>
                  <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                    {debugExplanation}
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-slate-300 list-disc pl-5">
                    <li>Qual é o intervalo do seu loop?</li>
                    <li>O que acontece quando n = 0?</li>
                    <li>Você inicializou a variável antes de usá-la?</li>
                    <li>A sua estrutura está na complexidade correta?</li>
                  </ul>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                  <div className="text-lg font-black text-white mb-4">Geração de variações</div>
                  <select
                    value={variantTopic}
                    onChange={(e) => setVariantTopic(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none"
                  >
                    <option value="busca-binaria">Busca binária</option>
                    <option value="dp">DP</option>
                    <option value="grafos">Grafos</option>
                    <option value="stl">STL</option>
                  </select>
                  <button
                    onClick={generateProblemVariant}
                    className="mt-3 w-full rounded-xl border border-emerald-500 text-emerald-300 font-bold py-2 hover:bg-emerald-500/10"
                  >
                    Gerar variação
                  </button>
                  <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                    <div className="font-bold">{generatedVariant.title}</div>
                    <div className="mt-2">{generatedVariant.variant}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-300">Dificuldade: {generatedVariant.difficulty}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="text-lg font-black text-white mb-4">Checklist de uso responsável</div>
                <div className="space-y-3">
                  {RESPONSIBLE_CHECKLIST.map((item, index) => (
                    <label key={item} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={responsibleUsage[index]}
                        onChange={() => setResponsibleUsage((prev) => prev.map((value, valueIndex) => valueIndex === index ? !value : value))}
                        className="mt-1 h-4 w-4 accent-cyan-500"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="text-lg font-black text-white mb-4">Painel de autonomia</div>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between"><span>Questões resolvidas sem IA</span><span>{Math.max(2, 7 - mentorStats.hintsUsed)} / 7</span></div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, autonomyRate)}%` }} /></div>
                  <div className="flex justify-between"><span>Uso de IA em treino</span><span>{mentorStats.hintsUsed} dicas</span></div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="text-lg font-black text-white mb-4">Modo professor / minicurso</div>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between"><span>Alunos</span><span>{teacherSession.students}</span></div>
                  <div className="flex justify-between"><span>Média de dicas</span><span>{teacherSession.averageHints}</span></div>
                  <div className="flex justify-between"><span>Autonomia</span><span>{teacherSession.autonomy}%</span></div>
                </div>
                <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200">
                  Sugestão: peça que os alunos resolvam primeiro sem IA e só depois comparem com a explicação orientada.
                </div>
              </div>
            </div>
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

                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 mb-3">
                      <div className="text-[11px] font-mono text-cyan-300 uppercase mb-2">Sala multiplayer</div>
                      <div className="flex flex-col gap-2">
                        <div className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-300 flex items-center gap-2">
                          <span className="text-lg">{playerAvatar}</span>
                          <span className="font-bold text-white">{formatPlayerDisplayName(playerName)}</span>
                        </div>
                        <button onClick={createCompetitionRoom} className="w-full py-2 rounded-lg bg-indigo-500 text-white font-bold text-xs">Criar sala</button>
                        <div className="flex gap-2">
                          <input
                            value={roomCodeInput}
                            onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                            placeholder="Código da sala"
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none"
                          />
                          <button onClick={joinCompetitionRoom} className="px-3 py-2 rounded-lg bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700">Entrar</button>
                        </div>
                        {roomInfo?.code && (
                          <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-300">
                            Sala: <span className="font-bold text-cyan-300">{roomInfo.code}</span>
                            {roomInfo.players && <span className="ml-2">• {Object.keys(roomInfo.players).length} jogador(es)</span>}
                          </div>
                        )}
                        {roomMessage && <div className="text-[11px] text-amber-200">{roomMessage}</div>}
                      </div>
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
                      <button onClick={startCompetition} className="py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">Iniciar</button>
                      <button onClick={pauseCompetition} className="py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">Pausar</button>
                      <button onClick={resetCompetition} className="py-2 rounded-xl bg-rose-500 text-white font-bold text-xs">Reset</button>
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
    </div>
  );
}
