import { DOCUMENT, isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  isDevMode,
  linkedSignal,
  model,
  PLATFORM_ID,
  signal,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IsActiveMatchOptions, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { UkiAvatar } from '../avatar/avatar';
import { UkiCapa } from '../capa/capa';
import { UkiTooltip } from '../capa/tooltip';
import { UkiIcono, UkiNombreIcono } from '../iconos/icono';
import { UkiLogoBanobras, UkiLogoBanobrasIcon } from '../marca/logo';
import { UkiPilaModales } from '../modal/modal-pila';

/** Íconos incorporados («Linear» de UKI). Para otros, `<ng-template ukiSidebarIcon="nombre">`. */
export type UkiSidebarIconName =
  | 'house'
  | 'file-earmark-text'
  | 'journal-text'
  | 'folder'
  | 'people'
  | 'gear'
  | 'globe'
  | 'box-arrow-right'
  | 'list'
  | 'three-dots'
  | 'search'
  | 'eye'
  | 'pencil'
  | 'chat'
  | 'check-circle'
  | 'info-circle';

export interface UkiSidebarItem {
  /** Nombre corto del destino (1 a 3 palabras). */
  label: string;
  /** Ícono incorporado o el nombre de una plantilla `ukiSidebarIcon`. 24 px en el nivel 1 y 16 px en los demás. */
  icon?: UkiSidebarIconName | (string & {});
  /** Ruta del router (`routerLink`). */
  link?: string | readonly unknown[];
  /** Enlace que no es del router. Se usa si no hay `link`. */
  href?: string;
  /** Destinos del nivel siguiente (máximo 3 niveles). Un elemento con hijos no navega: abre y cierra su rama. */
  children?: readonly UkiSidebarItem[];
  /** Sección del panel «Más» en teléfono (Figma: «Section title»). Solo el nivel 1. */
  section?: string;
  /** Va en la barra inferior de teléfono (máximo 3; el cuarto lugar es «Más»). Solo el nivel 1. */
  bottomBar?: boolean;
}

/** La persona que inició sesión (Sidebar/Header). */
export interface UkiSidebarUser {
  name: string;
  role?: string;
  avatarSrc?: string | null;
}

/** Enlace de la barra de marca (Topbar link), por ejemplo a Llave MX. */
export interface UkiSidebarLink {
  /** Nombre accesible del enlace («Ir a Llave MX»). */
  label: string;
  link?: string | readonly unknown[];
  href?: string;
}

/** `auto` decide por el ancho; `desktop` y `mobile` fijan la forma. */
export type UkiSidebarDevice = 'auto' | 'desktop' | 'mobile';

interface Nodo {
  item: UkiSidebarItem;
  /** Posición en el árbol: «3», «3.1», «3.1.0». */
  clave: string;
  nivel: 1 | 2 | 3;
  hijos: Nodo[];
  activo: boolean;
  contieneActivo: boolean;
}

type Rango = 'telefono' | 'tableta' | 'escritorio';

const TELEFONO = '(max-width: 767.98px)';
const ESCRITORIO = '(min-width: 1280px)';
const NIVELES = 3;
const DESTINOS_RECOMENDADOS = 8;
const DESTINOS_BARRA = 3;
const ABRIR_FLOTANTE_MS = 100;
const CERRAR_FLOTANTE_MS = 150;

const INCORPORADOS: Record<UkiSidebarIconName, UkiNombreIcono> = {
  house: 'house',
  'file-earmark-text': 'file-earmark-text',
  'journal-text': 'journal-text',
  folder: 'folder',
  people: 'people',
  gear: 'gear',
  globe: 'globe',
  'box-arrow-right': 'box-arrow-right',
  list: 'list',
  'three-dots': 'dots',
  search: 'search',
  eye: 'eye',
  pencil: 'pencil',
  chat: 'chat',
  'check-circle': 'check-circle',
  'info-circle': 'info-circle',
};

const EXACTO: IsActiveMatchOptions = { paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' };
const SUBCONJUNTO: IsActiveMatchOptions = { ...EXACTO, paths: 'subset' };

const ENFOCABLES = 'a[href], button:not([disabled])';

let siguienteId = 0;

/**
 * Ícono propio para la Sidebar: `<ng-template ukiSidebarIcon="tramites"><svg>…</svg></ng-template>` y luego
 * `{ icon: 'tramites' }` en el destino. Es decorativo: el nombre del destino ya está en su etiqueta.
 */
@Directive({ selector: 'ng-template[ukiSidebarIcon]' })
export class UkiSidebarIcon {
  readonly name = input.required<string>({ alias: 'ukiSidebarIcon' });
  readonly template = inject(TemplateRef);
}

/**
 * Navegación principal de UKI (página Sidebar) para portales transaccionales y paneles de administración.
 *
 * ```html
 * <uki-sidebar [items]="menu" [user]="persona" [topbarLink]="{ label: 'Ir a Llave MX', href: llaveMx }" />
 * ```
 *
 * Cambia de forma con el ancho: expandida (256 px, acordeón de hasta 3 niveles) desde 1280 px; colapsada (56 px, solo
 * íconos y panel flotante) de 768 a 1279 px o cuando la persona la contrae; en teléfono, barra inferior con hasta 3
 * destinos y «Más», que abre un panel de pantalla completa. Llena el alto de su columna: la marca, la persona y el
 * botón de contraer quedan fijos y solo la lista hace scroll. No decide permisos: dibuja los destinos que le dan.
 */
@Component({
  selector: 'uki-sidebar',
  imports: [NgTemplateOutlet, RouterLink, UkiAvatar, UkiIcono, UkiLogoBanobras, UkiLogoBanobrasIcon, UkiTooltip],
  templateUrl: './sidebar.html',
  styleUrls: ['../capa/capa.css', './sidebar.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'uki-sidebar-anfitrion',
    '[class.uki-sidebar-anfitrion--movil]': 'movil()',
    '[class.uki-sidebar-anfitrion--colapsada]': 'colapsada()',
    '(keydown)': 'alTeclear($event)',
    '(focusout)': 'alSalirFoco($event)',
    '(document:click)': 'alClicFuera($event)',
  },
})
export class UkiSidebar {
  /** Destinos de primer nivel (Figma recomienda de 4 a 8) con sus hijos. */
  readonly items = input.required<readonly UkiSidebarItem[]>();
  /** Persona que inició sesión, debajo de la marca. */
  readonly user = input<UkiSidebarUser>();
  /** Convierte la barra de marca en un enlace (por ejemplo, «Ir a Llave MX»). */
  readonly topbarLink = input<UkiSidebarLink>();
  /** Nombre de la región de navegación. */
  readonly ariaLabel = input('Menú principal');
  /** `auto` (por omisión) decide por el ancho de la ventana; `desktop` y `mobile` fijan la forma. */
  readonly device = input<UkiSidebarDevice>('auto');
  /**
   * `true` contraída, `false` expandida y `null` según el ancho (colapsada en tableta). El botón de contraer lo cambia;
   * vuelve a `null` cuando la ventana cambia de rango.
   */
  readonly collapsed = model<boolean | null>(null);

  protected readonly idLista = `uki-sidebar-lista-${++siguienteId}`;
  protected readonly idPanel = `uki-sidebar-panel-${siguienteId}`;
  protected readonly idTituloPanel = `uki-sidebar-panel-titulo-${siguienteId}`;
  protected readonly prefijo = `uki-sidebar-${siguienteId}`;

  private readonly router = inject(Router);
  private readonly pila = inject(UkiPilaModales);
  private readonly document = inject(DOCUMENT);
  private readonly anfitrion: HTMLElement = inject(ElementRef).nativeElement;
  private readonly iconosPropios = contentChildren(UkiSidebarIcon);
  private readonly panelFlotante = viewChild<ElementRef<HTMLElement>>('panelFlotante');
  private readonly panel = viewChild<ElementRef<HTMLDialogElement>>('panel');
  private readonly botonMas = viewChild<ElementRef<HTMLButtonElement>>('botonMas');
  private readonly lista = viewChild<ElementRef<HTMLElement>>('lista');

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly rango = signal<Rango>('escritorio');
  protected readonly movil = computed(() => this.device() === 'mobile' || (this.device() === 'auto' && this.rango() === 'telefono'));
  protected readonly colapsada = computed(
    () => !this.movil() && (this.collapsed() ?? (this.device() === 'auto' && this.rango() === 'tableta')),
  );

  protected readonly arbol = computed(() => {
    this.url();
    return this.construir(this.items(), '', 1);
  });

  /** Ramas abiertas del acordeón (una por nivel); se reinicia con la rama de la página actual al navegar. */
  protected readonly ramas = linkedSignal(() => this.clavesActivas(this.arbol()));

  /** Clave del padre cuyo panel flotante está abierto (versión colapsada). */
  protected readonly flotante = signal<string | null>(null);
  protected readonly panelAbierto = signal(false);

  protected readonly inferiores = computed(() => {
    const nivel1 = this.arbol();
    const marcados = nivel1.filter((n) => n.item.bottomBar && !n.hijos.length);
    return (marcados.length ? marcados : nivel1.filter((n) => !n.hijos.length)).slice(0, DESTINOS_BARRA);
  });

  protected readonly secciones = computed(() => {
    const secciones: { titulo?: string; nodos: Nodo[] }[] = [];
    for (const nodo of this.arbol()) {
      const titulo = nodo.item.section;
      const ultima = secciones.at(-1);
      if (ultima && ultima.titulo === titulo) ultima.nodos.push(nodo);
      else secciones.push({ titulo, nodos: [nodo] });
    }
    return secciones;
  });

  private capaFlotante?: UkiCapa;
  private enfocarFlotante = false;
  private temporizador?: ReturnType<typeof setTimeout>;
  private previoPanel: HTMLElement | null = null;

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID)) && typeof matchMedia === 'function') {
      const telefono = matchMedia(TELEFONO);
      const escritorio = matchMedia(ESCRITORIO);
      const calcular = (): Rango => (telefono.matches ? 'telefono' : escritorio.matches ? 'escritorio' : 'tableta');
      this.rango.set(calcular());
      const alCambiar = () => {
        const nuevo = calcular();
        if (nuevo === this.rango()) return;
        this.rango.set(nuevo);
        this.flotante.set(null);
        this.collapsed.set(null);
      };
      telefono.addEventListener('change', alCambiar);
      escritorio.addEventListener('change', alCambiar);
      inject(DestroyRef).onDestroy(() => {
        telefono.removeEventListener('change', alCambiar);
        escritorio.removeEventListener('change', alCambiar);
      });
    }

    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.temporizador);
      this.capaFlotante?.cerrar();
      this.cerrarPanel(false);
    });

    afterRenderEffect(() => {
      const panel = this.panelFlotante()?.nativeElement;
      const clave = this.flotante();
      this.capaFlotante?.cerrar();
      this.capaFlotante = undefined;
      if (!panel || !clave) return;
      const disparador = this.anfitrion.querySelector<HTMLElement>(`[aria-controls="${this.idFlotante(clave)}"]`);
      if (!disparador) return;
      this.capaFlotante = new UkiCapa(panel, disparador, { lado: 'derecha', separacion: 8 });
      this.capaFlotante.abrir();
      if (this.enfocarFlotante) {
        this.enfocarFlotante = false;
        panel.querySelector<HTMLElement>(ENFOCABLES)?.focus();
      }
    });

    // Al navegar, el destino actual queda a la vista dentro de la lista. Solo se mueve la lista: scrollIntoView también
    // desplazaría la página.
    afterRenderEffect(() => {
      this.url();
      const lista = this.lista()?.nativeElement;
      const actual = lista?.querySelector<HTMLElement>('[aria-current="page"]');
      if (!lista || !actual) return;
      const l = lista.getBoundingClientRect();
      const a = actual.getBoundingClientRect();
      if (a.top < l.top) lista.scrollTop -= l.top - a.top;
      else if (a.bottom > l.bottom) lista.scrollTop += a.bottom - l.bottom;
    });

    // Si la forma cambia con el panel «Más» abierto, el panel se va con ella.
    afterRenderEffect(() => {
      if (!this.movil() && this.panelAbierto()) this.cerrarPanel(false);
    });
  }

  // —— Acordeón ——

  protected abierta(clave: string): boolean {
    return this.ramas().includes(clave);
  }

  protected alternarRama(nodo: Nodo): void {
    const { clave } = nodo;
    if (this.abierta(clave)) {
      this.ramas.update((ramas) => ramas.filter((r) => r !== clave && !r.startsWith(`${clave}.`)));
    } else {
      this.ramas.update((ramas) => [...ramas.filter((r) => clave.startsWith(`${r}.`)), clave]);
    }
  }

  protected alternarColapso(): void {
    this.flotante.set(null);
    this.collapsed.set(!this.colapsada());
  }

  // —— Panel flotante (colapsada) ——

  protected idFlotante(clave: string): string {
    return `${this.prefijo}-flotante-${clave.replaceAll('.', '-')}`;
  }

  protected idHijos(clave: string): string {
    return `${this.prefijo}-hijos-${clave.replaceAll('.', '-')}`;
  }

  protected tieneTercerNivel(nodo: Nodo): boolean {
    return nodo.hijos.some((h) => h.hijos.length > 0);
  }

  protected alternarFlotante(nodo: Nodo): void {
    clearTimeout(this.temporizador);
    this.flotante.set(this.flotante() === nodo.clave ? null : nodo.clave);
  }

  protected entrarPuntero(nodo: Nodo): void {
    clearTimeout(this.temporizador);
    if (this.flotante() === nodo.clave) return;
    this.temporizador = setTimeout(() => this.flotante.set(nodo.clave), ABRIR_FLOTANTE_MS);
  }

  protected quedarse(): void {
    clearTimeout(this.temporizador);
  }

  protected salirPuntero(): void {
    clearTimeout(this.temporizador);
    if (this.flotante() === null) return;
    this.temporizador = setTimeout(() => this.flotante.set(null), CERRAR_FLOTANTE_MS);
  }

  private cerrarFlotante(devolverFoco: boolean): void {
    const clave = this.flotante();
    if (clave === null) return;
    clearTimeout(this.temporizador);
    this.flotante.set(null);
    if (devolverFoco) this.anfitrion.querySelector<HTMLElement>(`[aria-controls="${this.idFlotante(clave)}"]`)?.focus();
  }

  protected alElegir(): void {
    this.cerrarFlotante(false);
    if (this.panelAbierto()) this.cerrarPanel(true);
  }

  // —— Panel «Más» (teléfono) ——

  protected abrirPanel(): void {
    const panel = this.panel()?.nativeElement;
    if (!panel || panel.open) return;
    const activo = this.document.activeElement;
    this.previoPanel = activo instanceof HTMLElement && activo !== this.document.body ? activo : this.botonMas()?.nativeElement ?? null;
    this.pila.entrar(panel);
    panel.showModal();
    this.panelAbierto.set(true);
    panel.querySelector<HTMLElement>('.uki-sidebar-panel__cerrar')?.focus();
  }

  protected cerrarPanel(devolverFoco = true): void {
    const panel = this.panel()?.nativeElement;
    if (panel?.open) panel.close();
    if (panel) this.pila.salir(panel);
    if (!this.panelAbierto()) return;
    this.panelAbierto.set(false);
    const previo = this.previoPanel ?? this.botonMas()?.nativeElement;
    this.previoPanel = null;
    if (devolverFoco && previo?.isConnected) previo.focus();
  }

  /** Esc sin keydown (por ejemplo, el botón Atrás en Android) llega como `cancel`. */
  protected alCancelar(evento: Event): void {
    evento.preventDefault();
    this.cerrarPanel();
  }

  // —— Teclado, foco y clic fuera ——

  protected alTeclear(evento: KeyboardEvent): void {
    const destino = evento.target as HTMLElement;
    const panel = this.panel()?.nativeElement;
    if (panel?.open && panel.contains(destino)) return this.alTeclearPanel(evento, panel);

    const flotante = this.flotante();
    const disparador = destino.closest<HTMLElement>('.uki-sidebar__disparador');
    if (disparador && ['Enter', ' ', 'ArrowRight'].includes(evento.key)) {
      evento.preventDefault();
      const clave = disparador.dataset['clave']!;
      this.enfocarFlotante = true;
      if (flotante === clave) this.panelFlotante()?.nativeElement.querySelector<HTMLElement>(ENFOCABLES)?.focus();
      else this.flotante.set(clave);
      return;
    }
    if (flotante !== null && (evento.key === 'Escape' || (evento.key === 'ArrowLeft' && this.panelFlotante()?.nativeElement.contains(destino)))) {
      // Esc solo cierra el panel flotante: no debe llegar a un modal que contenga la Sidebar.
      evento.preventDefault();
      evento.stopPropagation();
      this.cerrarFlotante(true);
    }
  }

  private alTeclearPanel(evento: KeyboardEvent, panel: HTMLDialogElement): void {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      evento.stopPropagation();
      this.cerrarPanel();
      return;
    }
    if (evento.key !== 'Tab') return;
    // showModal() deja salir el foco a la barra del navegador; aquí da la vuelta dentro del panel.
    const lista = [...panel.querySelectorAll<HTMLElement>(ENFOCABLES)];
    const primero = lista[0];
    const ultimo = lista.at(-1);
    const activo = this.document.activeElement;
    if (evento.shiftKey && activo === primero) {
      evento.preventDefault();
      ultimo?.focus();
    } else if (!evento.shiftKey && activo === ultimo) {
      evento.preventDefault();
      primero?.focus();
    }
  }

  protected alSalirFoco(evento: FocusEvent): void {
    const destino = evento.relatedTarget as Node | null;
    if (this.flotante() !== null && destino && !this.anfitrion.contains(destino)) this.cerrarFlotante(false);
  }

  protected alClicFuera(evento: MouseEvent): void {
    const destino = evento.target as Node | null;
    if (this.flotante() !== null && destino && !this.anfitrion.contains(destino)) this.cerrarFlotante(false);
  }

  // —— Íconos ——

  protected plantillaIcono(nombre: string | undefined): TemplateRef<unknown> | null {
    if (!nombre) return null;
    return this.iconosPropios().find((i) => i.name() === nombre)?.template ?? null;
  }

  protected iconoIncorporado(nombre: string | undefined): UkiNombreIcono | null {
    return nombre && nombre in INCORPORADOS ? INCORPORADOS[nombre as UkiSidebarIconName] : null;
  }

  // —— Árbol ——

  private construir(items: readonly UkiSidebarItem[], prefijo: string, nivel: number): Nodo[] {
    if (isDevMode() && nivel === 1 && items.length > DESTINOS_RECOMENDADOS) {
      console.warn(`[uki-sidebar] ${items.length} destinos de primer nivel: Figma recomienda de 4 a 8.`);
    }
    return items.map((item, i) => {
      const clave = prefijo ? `${prefijo}.${i}` : `${i}`;
      let hijos: Nodo[] = [];
      if (item.children?.length) {
        if (nivel < NIVELES) {
          hijos = this.construir(item.children, clave, nivel + 1);
        } else if (isDevMode()) {
          console.warn(`[uki-sidebar] «${item.label}» tiene hijos en un cuarto nivel: la Sidebar dibuja tres niveles como máximo.`);
        }
      }
      const activo = this.esActivo(item);
      return {
        item,
        clave,
        nivel: nivel as Nodo['nivel'],
        hijos,
        activo,
        contieneActivo: activo || hijos.some((h) => h.contieneActivo),
      };
    });
  }

  private esActivo(item: UkiSidebarItem): boolean {
    if (item.link === undefined) return false;
    const arbol = this.router.createUrlTree(Array.isArray(item.link) ? item.link : [item.link]);
    // Inicio («/») solo en la raíz exacta; los demás también en sus páginas de detalle.
    const raiz = this.router.serializeUrl(arbol) === '/';
    return this.router.isActive(arbol, raiz ? EXACTO : SUBCONJUNTO);
  }

  private clavesActivas(nodos: Nodo[]): string[] {
    const padre = nodos.find((n) => n.hijos.length && n.contieneActivo);
    return padre ? [padre.clave, ...this.clavesActivas(padre.hijos)] : [];
  }
}
