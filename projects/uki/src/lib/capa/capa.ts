/** Separación mínima entre el panel y el borde de la ventana. */
const MARGEN_VENTANA = 8;

export interface OpcionesCapa {
  /** `ancla`: el panel mide lo mismo que el elemento que lo abre (lista del Select). Por omisión, su propio ancho. */
  ancho?: 'ancla' | 'contenido';
  /** Distancia en px entre el ancla y el panel. */
  separacion?: number;
  /** Lado preferido; si no cabe y del otro lado hay más espacio, se voltea. */
  lado?: 'abajo' | 'arriba';
  /** Alineación horizontal con el ancla. */
  alinear?: 'inicio' | 'centro';
}

type ElementoConPopover = HTMLElement & { showPopover?: () => void; hidePopover?: () => void };

/** El navegador tiene el Popover API (Chrome 114, Firefox 125, Safari 17). */
export function soportaPopover(elemento: HTMLElement): boolean {
  return typeof (elemento as ElementoConPopover).showPopover === 'function';
}

/**
 * Capa superpuesta de la librería (interna). Coloca un panel flotante (lista del Select, menú «…», tooltip) con
 * `position: fixed` y coordenadas calculadas desde el elemento que lo abre, así no se recorta dentro de contenedores con
 * `overflow: hidden`. Si el navegador tiene el Popover API, además lo sube a la capa superior (encima de todo, también
 * de un `<dialog>` abierto). Las coordenadas se fijan con CSSOM, que la CSP con nonce permite.
 *
 * El panel sigue dentro del componente en el DOM: conserva su lugar en el árbol de accesibilidad y no queda inerte
 * dentro de un modal.
 */
export class UkiCapa {
  private abierta = false;
  private readonly opciones: Required<OpcionesCapa>;
  private readonly alMover = () => this.colocar();

  constructor(
    private readonly panel: HTMLElement,
    private readonly ancla: HTMLElement,
    opciones: OpcionesCapa = {},
  ) {
    this.opciones = { ancho: 'contenido', separacion: 4, lado: 'abajo', alinear: 'inicio', ...opciones };
  }

  abrir(): void {
    if (this.abierta) return;
    this.abierta = true;
    const panel = this.panel as ElementoConPopover;
    panel.classList.add('uki-capa');
    if (soportaPopover(panel)) {
      panel.setAttribute('popover', 'manual');
      try {
        panel.showPopover!();
      } catch {
        // Si no se puede (por ejemplo, el panel aún no está conectado), queda con position: fixed y z-index.
      }
    }
    this.colocar();
    const vista = this.panel.ownerDocument.defaultView;
    vista?.addEventListener('scroll', this.alMover, { capture: true, passive: true });
    vista?.addEventListener('resize', this.alMover, { passive: true });
  }

  cerrar(): void {
    if (!this.abierta) return;
    this.abierta = false;
    const vista = this.panel.ownerDocument.defaultView;
    vista?.removeEventListener('scroll', this.alMover, { capture: true });
    vista?.removeEventListener('resize', this.alMover);
    const panel = this.panel as ElementoConPopover;
    if (panel.isConnected && panel.hasAttribute('popover')) {
      try {
        panel.hidePopover!();
      } catch {
        // Ya estaba cerrado.
      }
    }
  }

  /** Calcula la posición. Se llama sola con scroll y resize; llámala si cambia el contenido del panel. */
  colocar(): void {
    if (!this.abierta) return;
    const { separacion, lado, ancho, alinear } = this.opciones;
    const vista = this.panel.ownerDocument.defaultView;
    const altoVentana = vista?.innerHeight ?? 0;
    const anchoVentana = vista?.innerWidth ?? 0;
    const a = this.ancla.getBoundingClientRect();
    const estilo = this.panel.style;
    if (ancho === 'ancla') estilo.setProperty('width', `${a.width}px`);

    const alto = this.panel.offsetHeight;
    const anchoPanel = ancho === 'ancla' ? a.width : this.panel.offsetWidth;
    const espacioAbajo = altoVentana - a.bottom - separacion;
    const espacioArriba = a.top - separacion;
    const cabeAbajo = alto <= espacioAbajo;
    const cabeArriba = alto <= espacioArriba;
    const abajo = lado === 'abajo' ? cabeAbajo || espacioAbajo >= espacioArriba : !(cabeArriba || espacioArriba >= espacioAbajo);

    const top = abajo ? a.bottom + separacion : a.top - separacion - alto;
    let left = alinear === 'centro' ? a.left + a.width / 2 - anchoPanel / 2 : a.left;
    left = Math.min(left, anchoVentana - anchoPanel - MARGEN_VENTANA);
    left = Math.max(left, MARGEN_VENTANA);

    estilo.setProperty('top', `${Math.round(top)}px`);
    estilo.setProperty('left', `${Math.round(left)}px`);
    this.panel.dataset['lado'] = abajo ? 'abajo' : 'arriba';
  }
}
