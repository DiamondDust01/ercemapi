// Geometria da malha hexagonal do fundo do Pensa Comigo.
// Hexágonos de topo plano com lado `side`: largura 2·side e altura √3·side.
// Colunas vizinhas ficam a 1,5·side uma da outra, e as colunas ímpares descem
// meia altura. Os contornos e os dígitos usam as mesmas contas, então cada
// dígito cai exatamente no centro de um hexágono.

export const hexHeight = (side) => Math.sqrt(3) * side;

export const hexPolygon = (cx, cy, side) => Array.from({ length: 6 }, (_, index) => {
  const angle = (Math.PI / 3) * index;
  return `${(cx + side * Math.cos(angle)).toFixed(2)},${(cy + side * Math.sin(angle)).toFixed(2)}`;
}).join(' ');

// Centros de todos os hexágonos que aparecem, mesmo em parte, num retângulo width × height.
export const hexCenters = (width, height, side) => {
  const h = hexHeight(side);
  const columns = Math.ceil(width / (1.5 * side)) + 1;
  const rows = Math.ceil(height / h) + 1;
  const centers = [];
  for (let column = 0; column < columns; column += 1) {
    const x = column * 1.5 * side;
    const offset = column % 2 === 1 ? h / 2 : 0;
    for (let row = 0; row < rows; row += 1) {
      centers.push({ x, y: row * h + offset, column, row });
    }
  }
  return centers;
};

// Dígito de cada célula: alterna em xadrez para formar o padrão de zeros e uns.
export const digitFor = ({ column, row }) => ((column + row) % 2 === 0 ? '0' : '1');
