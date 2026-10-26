// Gera src/themeLight.css a partir da paleta do Tailwind instalado.
// As telas foram desenhadas para o tema escuro; o tema claro troca o valor de cada
// tom conforme o papel que ele tem nas telas:
// - Cinzas (slate, gray...): 900 vira branco (cartões), 950 um cinza bem claro
//   (áreas internas), 800 e 700 viram contornos suaves e 300/400 viram texto escuro.
// - Cores de destaque: os tons claros usados em texto (50 a 400) viram escuros, os
//   tons escuros usados em fundos (800 a 950) viram claros e os tons médios (500 a
//   700) ficam iguais, para os botões continuarem saturados.
// - Texto branco sobre botões de cor sólida continua branco.
// Uso: node scripts/generate-light-theme.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const themePath = path.join(root, 'node_modules', 'tailwindcss', 'theme.css');
const outputPath = path.join(root, 'src', 'themeLight.css');

export const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
export const GRAYS = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'mauve', 'olive', 'mist', 'taupe'];
export const SOLID_SHADES = [500, 600, 700];
export const LIGHT_SURFACE = '#ffffff';
export const LIGHT_INSET = '#f4f6fa';

// Tom de origem (na mesma escala) usado no tema claro, ou uma cor fixa.
const GRAY_MAP = { 50: 950, 100: 900, 200: 800, 300: 700, 400: 600, 500: 500, 600: 400, 700: 300, 800: 200, 900: LIGHT_SURFACE, 950: LIGHT_INSET };
const ACCENT_MAP = { 50: 950, 100: 900, 200: 800, 300: 700, 400: 600, 500: 500, 600: 600, 700: 700, 800: 200, 900: 100, 950: 50 };

export const lightSourceFor = (hue, shade) => (GRAYS.includes(hue) ? GRAY_MAP : ACCENT_MAP)[shade];

export const readPalette = (css) => {
  const palette = {};
  for (const match of css.matchAll(/--color-([a-z]+)-(\d{2,3}):\s*([^;]+);/g)) {
    const [, hue, shade, value] = match;
    (palette[hue] = palette[hue] || {})[Number(shade)] = value.trim();
  }
  return palette;
};

export const buildLightTheme = (palette) => {
  const lines = [];
  const solids = [];
  Object.keys(palette).sort().forEach((hue) => {
    const scale = palette[hue];
    if (!SHADES.every((shade) => scale[shade])) return;
    SHADES.forEach((shade) => {
      const source = lightSourceFor(hue, shade);
      lines.push(`  --color-${hue}-${shade}: ${typeof source === 'number' ? scale[source] : source};`);
    });
    if (!GRAYS.includes(hue)) SOLID_SHADES.forEach((shade) => solids.push(`:root[data-theme="light"] .bg-${hue}-${shade}.text-white`));
  });
  const slate = palette.slate || {};
  return `/* Gerado por scripts/generate-light-theme.mjs. Não edite à mão. */
/* Tema claro: cada tom da paleta recebe o valor adequado ao seu papel nas telas. */
:root[data-theme="light"] {
  color-scheme: light;
  --color-white: ${slate[900] || '#0f172a'};
  --color-black: ${LIGHT_INSET};
${lines.join('\n')}
}

/* Texto branco sobre botões de cor sólida continua branco. */
${solids.join(',\n')} {
  color: #ffffff;
}
`;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const palette = readPalette(fs.readFileSync(themePath, 'utf8'));
  fs.writeFileSync(outputPath, buildLightTheme(palette));
  console.log(`Tema claro gerado em ${path.relative(root, outputPath)} (${Object.keys(palette).length} escalas).`);
}
