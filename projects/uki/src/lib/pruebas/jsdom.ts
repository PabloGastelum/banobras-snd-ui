/*
 * Ayudas para las pruebas unitarias en jsdom (no forman parte de la API pública ni del paquete).
 * jsdom no implementa showModal() ni matchMedia(); la capa superior, la inercia y el Esc nativo se prueban en Playwright.
 */

interface DialogoPrueba extends HTMLDialogElement {
  ukiModal?: boolean;
}

/** `<dialog>` mínimo: `showModal()` y `close()` cambian `open` y `close()` dispara el evento `close`. */
export function polyfillDialogo(): void {
  const proto = HTMLDialogElement.prototype as DialogoPrueba;
  proto.showModal = function (this: DialogoPrueba) {
    if (this.open) throw new DOMException('El diálogo ya está abierto.', 'InvalidStateError');
    this.setAttribute('open', '');
    this.ukiModal = true;
  };
  proto.close = function (this: DialogoPrueba, valor?: string) {
    if (!this.open) return;
    this.removeAttribute('open');
    this.ukiModal = false;
    if (valor !== undefined) this.returnValue = valor;
    this.dispatchEvent(new Event('close'));
  };
}

export interface MediaFalsa {
  /** Cambia si la consulta coincide y avisa a quien escucha `change`. */
  cambiar(coincide: boolean): void;
}

/** `matchMedia` controlable: todas las consultas responden igual. */
export function matchMediaFalso(coincide = false): MediaFalsa {
  let actual = coincide;
  const escuchas = new Set<(evento: MediaQueryListEvent) => void>();
  window.matchMedia = (consulta: string) =>
    ({
      get matches() {
        return actual;
      },
      media: consulta,
      onchange: null,
      addEventListener: (_tipo: string, fn: (evento: MediaQueryListEvent) => void) => escuchas.add(fn),
      removeEventListener: (_tipo: string, fn: (evento: MediaQueryListEvent) => void) => escuchas.delete(fn),
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
    }) as unknown as MediaQueryList;
  return {
    cambiar(valor: boolean) {
      actual = valor;
      for (const fn of escuchas) fn({ matches: valor } as MediaQueryListEvent);
    },
  };
}

export interface AnchoFalso {
  /** Cambia el ancho de la ventana y avisa a las consultas cuyo resultado cambió. */
  cambiar(ancho: number): void;
}

/** `matchMedia` que evalúa `min-width` y `max-width` contra un ancho simulado (la Sidebar usa dos consultas). */
export function anchoFalso(inicial: number): AnchoFalso {
  let ancho = inicial;
  const evaluar = (consulta: string) => {
    const min = /min-width:\s*([\d.]+)px/.exec(consulta);
    const max = /max-width:\s*([\d.]+)px/.exec(consulta);
    return (!min || ancho >= Number(min[1])) && (!max || ancho <= Number(max[1]));
  };
  const listas: { consulta: string; previo: boolean; escuchas: Set<(evento: MediaQueryListEvent) => void> }[] = [];
  window.matchMedia = (consulta: string) => {
    const lista = { consulta, previo: evaluar(consulta), escuchas: new Set<(evento: MediaQueryListEvent) => void>() };
    listas.push(lista);
    return {
      get matches() {
        return evaluar(consulta);
      },
      media: consulta,
      onchange: null,
      addEventListener: (_tipo: string, fn: (evento: MediaQueryListEvent) => void) => lista.escuchas.add(fn),
      removeEventListener: (_tipo: string, fn: (evento: MediaQueryListEvent) => void) => lista.escuchas.delete(fn),
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
    } as unknown as MediaQueryList;
  };
  return {
    cambiar(valor: number) {
      ancho = valor;
      for (const lista of listas) {
        const ahora = evaluar(lista.consulta);
        if (ahora === lista.previo) continue;
        lista.previo = ahora;
        for (const fn of lista.escuchas) fn({ matches: ahora, media: lista.consulta } as MediaQueryListEvent);
      }
    },
  };
}
