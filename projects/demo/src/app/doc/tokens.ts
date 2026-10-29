import uki from '../../../../uki/tokens/uki-figma.json';

/** Lectura de uki-figma.json para la documentación: valores, alias resueltos y contraste WCAG. */

interface Variable {
  nombre: string;
  valores: string[];
}

export type Tema = 'Guinda' | 'Verde';
const modosSemantic = uki.collections.find((c) => c.name === 'Semantic')!.modes;

const colecciones = new Map(
  uki.collections.map((c) => [
    c.name,
    {
      modos: c.modes,
      vars: c.vars.map((linea): Variable => {
        const [nombre, , ...valores] = linea.split('|');
        return { nombre, valores };
      }),
    },
  ]),
);

export const coleccion = (nombre: string) => colecciones.get(nombre)!;

/** `pguinda/900` → `--pguinda-900`, la misma regla que usa scripts/generar-tokens.mjs. */
export const cssVar = (nombre: string) => `--${nombre.replaceAll('/', '-')}`;

const todas = new Map<string, Variable>([...colecciones.values()].flatMap((c) => c.vars.map((v) => [v.nombre, v] as const)));
const semanticas = new Set(coleccion('Semantic').vars.map((v) => v.nombre));

/** Valor crudo de una variable en un tema: las semánticas tienen un valor por tema; las demás, uno solo. */
function crudo(nombre: string, tema: Tema): string {
  const variable = todas.get(nombre);
  if (!variable) throw new Error(`Token desconocido: ${nombre}`);
  return variable.valores[semanticas.has(nombre) ? modosSemantic.indexOf(tema) : 0];
}

/** Valor de un color en un tema, siguiendo los alias hasta el primitivo. */
export function hex(nombre: string, tema: Tema = 'Guinda'): string {
  const valor = crudo(nombre, tema);
  return valor.startsWith('@') ? hex(valor.slice(1), tema) : valor.toUpperCase();
}

/** Primer alias de un token semántico (`button/primary` → `pguinda/900` en guinda, `pverde/900` en verde). */
export function alias(nombre: string, tema: Tema = 'Guinda'): string | null {
  const valor = crudo(nombre, tema);
  return valor.startsWith('@') ? valor.slice(1) : null;
}

export function rgb(color: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16)) as [number, number, number];
}

function luminancia(color: string): number {
  const [r, g, b] = rgb(color).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string): number {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/** Nivel WCAG para texto normal; 3:1 solo alcanza para texto grande. */
export function nivel(ratio: number): string {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA grande';
  return '—';
}

const BLANCO = '#FFFFFF';
const OSCURO = hex('neutral/800');

/** Texto que mejor contrasta sobre un fondo (blanco o text/primary) y su razón de contraste. */
export function textoSobre(fondo: string): { color: string; ratio: number } {
  const conBlanco = contraste(fondo, BLANCO);
  const conOscuro = contraste(fondo, OSCURO);
  return conBlanco >= conOscuro ? { color: BLANCO, ratio: conBlanco } : { color: OSCURO, ratio: conOscuro };
}

export const figmaVersion = uki.figmaVersion;
export const elevacion = uki.elevation;
