import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  input,
  isDevMode,
  ViewEncapsulation,
} from '@angular/core';

/** `default`: 60 px de alto (encabezado de escritorio, acceso y pie) · `small`: 32 px (teléfono y barras compactas). */
export type UkiLogoSize = 'default' | 'small';

/** Colores oficiales de la identidad (D3): no siguen el tema y no son tokens. */
const TINTA_COLOR = '#6B0E35';
const TINTA_BLANCA = '#FFFFFF';

const avisados = new Set<string>();

/**
 * Base común de los logotipos (interna): tamaño, espacio libre, nombre accesible y marcador.
 *
 * Figma pide usar solo los vectores oficiales («nunca redibujes, calques ni aproximes un logotipo»). Mientras no estén
 * los archivos oficiales, cada logotipo dibuja un marcador con su ancho, su alto y su nombre (D4); los trazos se
 * integrarán en la plantilla de cada componente sin cambiar la API.
 */
@Directive({
  host: {
    class: 'uki-logo uki-logo--marcador',
    '[class.uki-logo--small]': 'size() === "small"',
    '[class.uki-logo--sin-espacio]': '!clearSpace()',
  },
})
export abstract class UkiLogoBase {
  /** `default` (60 px de alto) o `small` (32 px). Para otro alto, `--uki-logo-alto` (de 32 px al máximo de 400 px de ancho). */
  readonly size = input<UkiLogoSize>('default');
  /** Oculta el logotipo a lectores de pantalla cuando el nombre ya está escrito al lado o es solo adorno. */
  readonly decorative = input(false, { transform: booleanAttribute });
  /** Cambia el nombre accesible (por ejemplo, «Banobras, ir a Inicio»). */
  readonly label = input<string>();
  /** Reserva el espacio libre de la guía (¼ del alto en cada lado). Apágalo si el contenedor ya lo da. */
  readonly clearSpace = input(true, { transform: booleanAttribute });

  /** Nombre accesible por omisión. */
  protected abstract readonly nombre: string;
  /** Texto del marcador. */
  protected abstract readonly corto: string;
  /** Ancho del `viewBox` para 60 de alto, el tamaño natural del componente en Figma. */
  protected abstract readonly ancho: number;
  protected abstract readonly selector: string;
  /** El tema actual es la versión blanca (sobre superficies oscuras). */
  protected abstract readonly blanco: () => boolean;

  protected readonly alto = 60;
  protected readonly nombreAccesible = computed(() => this.label() ?? this.nombre);
  protected readonly tinta = computed(() => (this.blanco() ? TINTA_BLANCA : TINTA_COLOR));

  protected avisarMarcador(): void {
    if (!isDevMode() || avisados.has(this.selector)) return;
    avisados.add(this.selector);
    console.warn(
      `[${this.selector}] Dibuja un marcador: faltan los vectores oficiales del logotipo (preguntas abiertas 1 y 2 de la entrega 5).`,
    );
  }
}

/** Plantilla común mientras no estén los trazos oficiales (D4). */
const MARCADOR = `
  <svg
    class="uki-logo__svg"
    [attr.viewBox]="'0 0 ' + ancho + ' ' + alto"
    [attr.width]="ancho"
    [attr.height]="alto"
    [attr.role]="decorative() ? null : 'img'"
    [attr.aria-label]="decorative() ? null : nombreAccesible()"
    [attr.aria-hidden]="decorative() ? 'true' : null"
    focusable="false"
  >
    <rect x="1" y="1" [attr.width]="ancho - 2" [attr.height]="alto - 2" rx="4" fill="none" [attr.stroke]="tinta()"
          stroke-width="2" stroke-dasharray="6 4" />
    <text class="uki-logo__marcador" x="50%" y="50%" dominant-baseline="central" text-anchor="middle" [attr.fill]="tinta()">
      {{ corto }}
    </text>
  </svg>
`;

/**
 * Logotipo de Banobras (Brand, componente Banobras). `color` sobre superficies claras; `white` solo sobre la marca o
 * superficies oscuras de la paleta institucional, nunca sobre fotos. 284 × 60 (Default) o ≈152 × 32 (Small, el mínimo).
 *
 * ```html
 * <uki-logo-banobras />
 * <uki-logo-banobras theme="white" size="small" />
 * ```
 */
@Component({
  selector: 'uki-logo-banobras',
  template: MARCADOR,
  styleUrl: './logo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UkiLogoBanobras extends UkiLogoBase {
  readonly theme = input<'color' | 'white'>('color');
  protected readonly nombre = 'Banobras';
  protected readonly corto = 'BANOBRAS';
  protected readonly ancho = 284;
  protected readonly selector = 'uki-logo-banobras';
  protected readonly blanco = () => this.theme() === 'white';
  constructor() {
    super();
    this.avisarMarcador();
  }
}

/** Símbolo de Banobras sin el nombre (Brand, componente Banobras Icon). Para la barra lateral colapsada. */
@Component({
  selector: 'uki-logo-banobras-icon',
  template: MARCADOR,
  styleUrl: './logo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UkiLogoBanobrasIcon extends UkiLogoBase {
  readonly theme = input<'color' | 'white'>('color');
  protected readonly nombre = 'Banobras';
  protected readonly corto = 'B';
  protected readonly ancho = 60;
  protected readonly selector = 'uki-logo-banobras-icon';
  protected readonly blanco = () => this.theme() === 'white';
  constructor() {
    super();
    this.avisarMarcador();
  }
}

/**
 * Imagotipo del Gobierno de México (Brand, componente GobMX). `default` a color sobre superficies claras; `white` (dos
 * tintas) sobre superficies oscuras o bandas Guinda, Verde o Dorado. 188 × 60. Espacio libre: la «O» de México.
 */
@Component({
  selector: 'uki-logo-gobmx',
  template: MARCADOR,
  styleUrl: './logo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UkiLogoGobmx extends UkiLogoBase {
  readonly theme = input<'default' | 'white'>('default');
  protected readonly nombre = 'Gobierno de México';
  protected readonly corto = 'Gobierno de México';
  protected readonly ancho = 188;
  protected readonly selector = 'uki-logo-gobmx';
  protected readonly blanco = () => this.theme() === 'white';
  constructor() {
    super();
    this.avisarMarcador();
  }
}

/** Logotipo de la Secretaría de Hacienda y Crédito Público (Brand, componente Hacienda). 273 × 60 o ≈146 × 32. */
@Component({
  selector: 'uki-logo-hacienda',
  template: MARCADOR,
  styleUrl: './logo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UkiLogoHacienda extends UkiLogoBase {
  readonly theme = input<'default' | 'white'>('default');
  protected readonly nombre = 'Secretaría de Hacienda y Crédito Público';
  protected readonly corto = 'Hacienda';
  protected readonly ancho = 273;
  protected readonly selector = 'uki-logo-hacienda';
  protected readonly blanco = () => this.theme() === 'white';
  constructor() {
    super();
    this.avisarMarcador();
  }
}

/** Logotipo de FONADIN, símbolo y nombre (Brand, componente FONADIN). 262 × 60 o ≈140 × 32 (el mínimo). */
@Component({
  selector: 'uki-logo-fonadin',
  template: MARCADOR,
  styleUrl: './logo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UkiLogoFonadin extends UkiLogoBase {
  readonly theme = input<'color' | 'white'>('color');
  protected readonly nombre = 'FONADIN, Fondo Nacional de Infraestructura';
  protected readonly corto = 'FONADIN';
  protected readonly ancho = 262;
  protected readonly selector = 'uki-logo-fonadin';
  protected readonly blanco = () => this.theme() === 'white';
  constructor() {
    super();
    this.avisarMarcador();
  }
}
