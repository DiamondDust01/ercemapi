// Frases do fundo do Pensa Comigo (chuva de letras no estilo Matrix).
// Citações: só autoria bem documentada, para não espalhar atribuições falsas entre
// os alunos. Frases sem autor são do próprio app e repetem as quatro técnicas.

export const QUOTES = [
  { text: 'Só sei que nada sei.', author: 'Sócrates' },
  { text: 'Uma vida sem reflexão não vale a pena ser vivida.', author: 'Sócrates' },
  { text: 'Conhece-te a ti mesmo.', author: 'Templo de Delfos' },
  { text: 'Penso, logo existo.', author: 'René Descartes' },
  { text: 'Ninguém entra duas vezes no mesmo rio.', author: 'Heráclito' },
  { text: 'O homem é a medida de todas as coisas.', author: 'Protágoras' },
  { text: 'O importante é não parar de questionar.', author: 'Albert Einstein' },
  { text: 'A imaginação é mais importante que o conhecimento.', author: 'Albert Einstein' },
  { text: 'A educação é a arma mais poderosa que você pode usar para mudar o mundo.', author: 'Nelson Mandela' },
  { text: 'Ensinar não é transferir conhecimento, mas criar as possibilidades para a sua própria produção ou a sua construção.', author: 'Paulo Freire' },
  { text: 'Ninguém educa ninguém, ninguém educa a si mesmo, os homens se educam entre si, mediatizados pelo mundo.', author: 'Paulo Freire' },
  { text: 'Duvidar de tudo ou crer em tudo são duas soluções igualmente cômodas, que nos dispensam de refletir.', author: 'Henri Poincaré' },
  { text: 'Quem não sabe o que procura não entende o que encontra.', author: 'Claude Bernard' },
  { text: 'Comece onde você está. Use o que você tem. Faça o que você pode.', author: 'Arthur Ashe' },
  { text: 'Quem pergunta é tolo por cinco minutos; quem não pergunta é tolo para sempre.', author: 'Provérbio chinês' },
  { text: 'Tente primeiro. Depois pergunte.' },
  { text: 'Peça uma pista, não a resposta.' },
  { text: 'Errar faz parte de aprender.' },
  { text: 'Confira antes de confiar.' },
  { text: 'Pergunte por quê.' },
  { text: 'A IA ajuda. Quem pensa é você.' },
  { text: 'Explique com as suas palavras.' },
  { text: 'Pequenos passos, todos os dias.' }
];

export const formatQuote = ({ text, author }) => (author ? `${text} — ${author}` : text);
