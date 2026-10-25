// Geometria da grade quadrada do fundo do OBI Quest. As linhas ficam a cada `cell`
// pixels a partir do canto da tela, e os dígitos vão no centro de uma célula a cada
// `step` células, nas duas direções. Linhas e dígitos usam as mesmas contas, então
// cada dígito fica dentro de um quadrado, sem tocar nas linhas.

export const gridDigitCenters = (width, height, cell, step = 2) => {
  const columns = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const centers = [];
  for (let column = 0; column < columns; column += step) {
    for (let row = 0; row < rows; row += step) {
      centers.push({ x: column * cell + cell / 2, y: row * cell + cell / 2, column: column / step, row: row / step });
    }
  }
  return centers;
};

// Zeros e uns em xadrez.
export const gridDigitFor = ({ column, row }) => ((column + row) % 2 === 0 ? '0' : '1');
