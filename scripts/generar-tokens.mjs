// Genera projects/uki/styles/tokens.css a partir de projects/uki/tokens/uki-figma.json (exportado de UKI en Figma).
// Uso: node scripts/generar-tokens.mjs           → escribe el archivo
//      node scripts/generar-tokens.mjs --check   → falla si el archivo no corresponde al JSON
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const raiz = new URL('../projects/uki/', import.meta.url);
const origen = JSON.parse(readFileSync(new URL('tokens/uki-figma.json', raiz), 'utf8'));
const destino = fileURLToPath(new URL('styles/tokens.css', raiz));

/** Tema por omisión (decisión del 29/10/2026). Los demás modos de Semantic se activan con data-uki-theme. */
const TEMA = 'Guinda';

const PESOS = { Regular: 400, Medium: 500, SemiBold: 600, Bold: 700 };
const RESPALDO = {
  Patria: "'Patria', 'Noto Sans', Georgia, serif",
  'Noto Sans': "'Noto Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
};
/** Variables de Layout que no llevan unidad. */
const SIN_UNIDAD = new Set(['web-columns', 'admin-columns']);

/** Nombre de Figma → propiedad CSS: `button/primary` → `--button-primary` (misma regla que el code syntax de UKI). */
const nombreCss = (nombre) => `--${nombre.replaceAll('/', '-')}`;

function valorCss(nombre, tipo, valor) {
  if (valor.startsWith('@')) return `var(${nombreCss(valor.slice(1))})`;
  const prop = nombreCss(nombre).slice(2);
  if (tipo === 'F') return valor === '0' || SIN_UNIDAD.has(prop) ? valor : `${valor}px`;
  if (prop.startsWith('font-weight-')) return String(PESOS[valor] ?? valor);
  if (prop.startsWith('font-family-')) return RESPALDO[valor] ?? `'${valor}'`;
  return valor;
}

function leer(coleccion) {
  return coleccion.vars.map((linea) => {
    const [nombre, tipo, ...valores] = linea.split('|');
    return { nombre, tipo, valores };
  });
}

const raizCss = [];
const porModo = { Tablet: [], Desktop: [] };
/** Temas alternos: { verde: ['  --brand-primary: var(--pverde-900);', …] } con solo lo que cambia respecto a TEMA. */
const temas = {};

for (const coleccion of origen.collections) {
  const vars = leer(coleccion);
  raizCss.push('', `  /* ${coleccion.name} */`);
  if (coleccion.modes.length === 1) {
    for (const v of vars) raizCss.push(`  ${nombreCss(v.nombre)}: ${valorCss(v.nombre, v.tipo, v.valores[0])};`);
  } else if (coleccion.name === 'Semantic') {
    const i = coleccion.modes.indexOf(TEMA);
    for (const v of vars) raizCss.push(`  ${nombreCss(v.nombre)}: ${valorCss(v.nombre, v.tipo, v.valores[i])};`);
    coleccion.modes.forEach((modo, j) => {
      if (j === i) return;
      temas[modo.toLowerCase()] = vars
        .filter((v) => v.valores[j] !== v.valores[i])
        .map((v) => `  ${nombreCss(v.nombre)}: ${valorCss(v.nombre, v.tipo, v.valores[j])};`);
    });
  } else {
    // Colecciones por dispositivo: Mobile en :root y solo lo que cambia en Tablet y Desktop.
    for (const v of vars) {
      raizCss.push(`  ${nombreCss(v.nombre)}: ${valorCss(v.nombre, v.tipo, v.valores[0])};`);
      for (const modo of ['Tablet', 'Desktop']) {
        const i = coleccion.modes.indexOf(modo);
        const previo = v.valores[i - 1];
        if (v.valores[i] !== previo) porModo[modo].push(`  ${nombreCss(v.nombre)}: ${valorCss(v.nombre, v.tipo, v.valores[i])};`);
      }
    }
  }
}

// Las sombras llevan el color resuelto: var() no admite cambiar la opacidad sin la sintaxis de color relativo.
const { elevation } = origen;
const hex = leer(origen.collections.find((c) => c.name === 'Primitives')).find((v) => v.nombre === elevation.color).valores[0];
const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ');
const conOpacidad = (capa) => `rgb(${rgb} / ${elevation.opacity[capa]}%)`;
const sombra = ([x, y, desenfoque, extension], capa) => `${x}px ${y}px ${desenfoque}px ${extension}px ${conOpacidad(capa)}`;
raizCss.push('', `  /* Elevation (${elevation.color} = ${hex}) */`);
raizCss.push(`  --elevation-scrim: ${conOpacidad('scrim')};`);
for (const [estilo, capas] of Object.entries(elevation.styles)) {
  raizCss.push(`  --elevation-${estilo}: ${sombra(capas.key, 'shadow-key')}, ${sombra(capas.ambient, 'shadow-ambient')};`);
}

const bloques = [
  `/* Generado por scripts/generar-tokens.mjs desde tokens/uki-figma.json · UKI v${origen.figmaVersion} · tema ${TEMA} por omisión. No editar a mano. */`,
  '',
  ':root {' + raizCss.join('\n'),
  '}',
];
for (const [tema, lineas] of Object.entries(temas)) {
  bloques.push(
    '',
    `/* Tema ${tema}: agrega data-uki-theme="${tema}" a <html> o a cualquier contenedor. Solo cambian los tokens semánticos. */`,
    `[data-uki-theme='${tema}'] {`,
    ...lineas,
    '}',
  );
}
for (const modo of ['Tablet', 'Desktop']) {
  bloques.push('', `@media (min-width: ${origen.breakpoints[modo]}px) {`, '  :root {', ...porModo[modo].map((l) => '  ' + l), '  }', '}');
}
const css = bloques.join('\n') + '\n';

if (process.argv.includes('--check')) {
  const actual = readFileSync(destino, 'utf8');
  if (actual !== css) {
    console.error('tokens.css no corresponde a uki-figma.json. Ejecuta: node scripts/generar-tokens.mjs');
    process.exit(1);
  }
  console.log('tokens.css al día.');
} else {
  writeFileSync(destino, css);
  console.log(`Escrito ${destino}`);
}
