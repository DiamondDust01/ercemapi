// Gera src/themeLight.css a partir da paleta do Tailwind instalado.
// O tema claro inverte cada escala de cor (50 ↔ 950, 100 ↔ 900, ..., 400 ↔ 600):
// fundos escuros viram claros, textos claros viram escuros e os destaques mantêm
// contraste, sem reescrever as classes das telas.
// Uso: node scripts/generate-light-theme.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const themePath = path.join(root, 'node_modules', 'tailwindcss', 'theme.css');
const outputPath = path.join(root, 'src', 'themeLight.css');

export const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
export const mirrorShade = (shade) => SHADES[SHADES.length - 1 - SHADES.indexOf(shade)];

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
  Object.keys(palette).sort().forEach((hue) => {
    const scale = palette[hue];
    if (!SHADES.every((shade) => scale[shade])) return;
    SHADES.forEach((shade) => lines.push(`  --color-${hue}-${shade}: ${scale[mirrorShade(shade)]};`));
  });
  return `/* Gerado por scripts/generate-light-theme.mjs. Não edite à mão. */
/* Tema claro: escalas do Tailwind invertidas e branco/preto trocados. */
:root[data-theme="light"] {
  color-scheme: light;
  --color-white: oklch(20.8% 0.042 265.755);
  --color-black: oklch(98.4% 0.003 247.858);
${lines.join('\n')}
}
`;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const palette = readPalette(fs.readFileSync(themePath, 'utf8'));
  fs.writeFileSync(outputPath, buildLightTheme(palette));
  console.log(`Tema claro gerado em ${path.relative(root, outputPath)} (${Object.keys(palette).length} escalas).`);
}
