/**
 * Resaltado mínimo para los ejemplos de la documentación. Devuelve fragmentos con su tipo para pintarlos con
 * interpolación normal (sin innerHTML). Solo cubre lo que usan los ejemplos: HTML de plantillas Angular, TypeScript y CSS.
 */

export type Lenguaje = 'html' | 'ts' | 'css';
export type TipoFragmento = 'etiqueta' | 'atributo' | 'cadena' | 'comentario' | 'clave' | 'expresion' | 'texto';

export interface Fragmento {
  tipo: TipoFragmento;
  valor: string;
}

const PALABRAS_TS =
  /^(?:import|from|export|default|class|const|let|new|readonly|protected|private|public|return|if|else|true|false|null|undefined|this|implements|interface|type|async|await)\b/;

function html(codigo: string): Fragmento[] {
  const salida: Fragmento[] = [];
  let i = 0;
  while (i < codigo.length) {
    const resto = codigo.slice(i);
    const comentario = /^<!--[\s\S]*?-->/.exec(resto);
    if (comentario) {
      salida.push({ tipo: 'comentario', valor: comentario[0] });
      i += comentario[0].length;
      continue;
    }
    const apertura = /^<\/?[\w-]+/.exec(resto);
    if (apertura) {
      salida.push({ tipo: 'etiqueta', valor: apertura[0] });
      i += apertura[0].length;
      // Atributos hasta el cierre de la etiqueta.
      while (i < codigo.length) {
        const dentro = codigo.slice(i);
        const cierre = /^\s*\/?>/.exec(dentro);
        if (cierre) {
          salida.push({ tipo: 'etiqueta', valor: cierre[0] });
          i += cierre[0].length;
          break;
        }
        const atributo = /^(\s+)([\w\-[\]().*#@]+)/.exec(dentro);
        if (atributo) {
          salida.push({ tipo: 'texto', valor: atributo[1] }, { tipo: 'atributo', valor: atributo[2] });
          i += atributo[0].length;
          continue;
        }
        const valor = /^=("[^"]*"|'[^']*')/.exec(dentro);
        if (valor) {
          salida.push({ tipo: 'texto', valor: '=' }, { tipo: 'cadena', valor: valor[1] });
          i += valor[0].length;
          continue;
        }
        salida.push({ tipo: 'texto', valor: dentro[0] });
        i += 1;
      }
      continue;
    }
    const interpolacion = /^\{\{[\s\S]*?\}\}/.exec(resto);
    if (interpolacion) {
      salida.push({ tipo: 'expresion', valor: interpolacion[0] });
      i += interpolacion[0].length;
      continue;
    }
    const bloque = /^@(?:if|else|for|switch|case|empty)\b/.exec(resto);
    if (bloque) {
      salida.push({ tipo: 'clave', valor: bloque[0] });
      i += bloque[0].length;
      continue;
    }
    const texto = /^[^<{@]+|^[<{@]/.exec(resto)!;
    salida.push({ tipo: 'texto', valor: texto[0] });
    i += texto[0].length;
  }
  return salida;
}

function ts(codigo: string): Fragmento[] {
  const salida: Fragmento[] = [];
  let i = 0;
  while (i < codigo.length) {
    const resto = codigo.slice(i);
    const reglas: [RegExp, TipoFragmento][] = [
      [/^\/\/[^\n]*|^\/\*[\s\S]*?\*\//, 'comentario'],
      [/^'[^'\n]*'|^"[^"\n]*"|^`[^`]*`/, 'cadena'],
      [/^@\w+/, 'atributo'],
      [PALABRAS_TS, 'clave'],
      [/^[A-Z][\w]*/, 'etiqueta'],
    ];
    const regla = reglas.map(([re, tipo]) => [re.exec(resto), tipo] as const).find(([m]) => m);
    if (regla) {
      salida.push({ tipo: regla[1], valor: regla[0]![0] });
      i += regla[0]![0].length;
      continue;
    }
    const texto = /^[a-z_$][\w$]*|^\s+|^./is.exec(resto)!;
    salida.push({ tipo: 'texto', valor: texto[0] });
    i += texto[0].length;
  }
  return salida;
}

function css(codigo: string): Fragmento[] {
  const salida: Fragmento[] = [];
  for (const linea of codigo.split(/(\n)/)) {
    const declaracion = /^(\s*)([\w-]+)(\s*:\s*)(.*)$/.exec(linea);
    if (declaracion && !linea.trim().endsWith('{')) {
      salida.push(
        { tipo: 'texto', valor: declaracion[1] },
        { tipo: 'atributo', valor: declaracion[2] },
        { tipo: 'texto', valor: declaracion[3] },
        { tipo: 'cadena', valor: declaracion[4] },
      );
    } else if (/^\s*[^\s].*\{\s*$/.test(linea)) {
      salida.push({ tipo: 'etiqueta', valor: linea });
    } else {
      salida.push({ tipo: 'texto', valor: linea });
    }
  }
  return salida;
}

export function resaltar(codigo: string, lenguaje: Lenguaje): Fragmento[] {
  if (lenguaje === 'ts') return ts(codigo);
  if (lenguaje === 'css') return css(codigo);
  return html(codigo);
}
