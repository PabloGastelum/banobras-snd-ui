import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { UkiCapa } from '../capa/capa';
import { UkiIcono } from '../iconos/icono';

export interface UkiBreadcrumbItem {
  /** Mismo nombre que el menú y el título de la página, de 1 a 3 palabras. */
  label: string;
  /** Ruta del router (`routerLink`). */
  link?: string | readonly unknown[];
  /** Enlace que no es del router. Se usa si no hay `link`. */
  href?: string;
}

/** Desde cuántos niveles se colapsan los intermedios en «…» (Figma: 5). */
const NIVELES_PARA_COLAPSAR = 5;

type Visible = { tipo: 'nivel'; item: UkiBreadcrumbItem; indice: number } | { tipo: 'colapsado' };

let siguienteId = 0;

/**
 * Ruta de navegación de UKI (página Breadcrumbs). Muestra el camino desde «Inicio» hasta la página actual, que es el
 * último elemento y no es enlace. Desde 5 niveles, los intermedios se agrupan en «…»; en teléfonos (< 768 px) queda un
 * solo enlace a la página padre.
 *
 * ```html
 * <uki-breadcrumbs [items]="[
 *   { label: 'Inicio', link: '/' },
 *   { label: 'Trámites', link: '/tramites' },
 *   { label: 'SOL-2026-0148' }
 * ]" />
 * ```
 */
@Component({
  selector: 'uki-breadcrumbs',
  imports: [RouterLink, NgTemplateOutlet, UkiIcono],
  template: `
    <ng-template #enlace let-item let-indice="indice" let-clase="clase">
      @if (item.link !== undefined) {
        <a [class]="clase" [routerLink]="item.link">
          @if (indice === 0 && homeIcon()) {
            <uki-icono class="uki-breadcrumbs__icono" nombre="house" />
          }
          <span>{{ item.label }}</span>
        </a>
      } @else if (item.href) {
        <a [class]="clase" [href]="item.href">
          @if (indice === 0 && homeIcon()) {
            <uki-icono class="uki-breadcrumbs__icono" nombre="house" />
          }
          <span>{{ item.label }}</span>
        </a>
      } @else {
        <span [class]="clase + ' uki-breadcrumbs__item--texto'">{{ item.label }}</span>
      }
    </ng-template>

    <nav class="uki-breadcrumbs" aria-label="Ruta de navegación">
      <ol class="uki-breadcrumbs__lista">
        @for (v of visibles(); track $index; let ultimo = $last) {
          <li class="uki-breadcrumbs__nivel">
            @if (v.tipo === 'colapsado') {
              <button
                #botonMas
                type="button"
                class="uki-breadcrumbs__mas"
                aria-label="Mostrar ruta completa"
                [attr.aria-expanded]="menuAbierto()"
                [attr.aria-controls]="idMenu"
                (click)="alternarMenu()"
              >
                <uki-icono nombre="dots" />
              </button>
              @if (menuAbierto()) {
                <ul #menu class="uki-breadcrumbs__menu" [id]="idMenu">
                  @for (o of ocultos(); track $index) {
                    <li>
                      <ng-container
                        [ngTemplateOutlet]="enlace"
                        [ngTemplateOutletContext]="{ $implicit: o, indice: -1, clase: 'uki-breadcrumbs__opcion' }"
                      />
                    </li>
                  }
                </ul>
              }
            } @else if (ultimo) {
              <span class="uki-breadcrumbs__item uki-breadcrumbs__item--actual" aria-current="page">
                @if (v.indice === 0 && homeIcon()) {
                  <uki-icono class="uki-breadcrumbs__icono" nombre="house" />
                }
                <span>{{ v.item.label }}</span>
              </span>
            } @else {
              <ng-container
                [ngTemplateOutlet]="enlace"
                [ngTemplateOutletContext]="{ $implicit: v.item, indice: v.indice, clase: 'uki-breadcrumbs__item' }"
              />
            }
            @if (!ultimo) {
              <uki-icono class="uki-breadcrumbs__separador" nombre="chevron-right" />
            }
          </li>
        }
      </ol>
      @if (padre(); as p) {
        <div class="uki-breadcrumbs__volver">
          <ng-container
            [ngTemplateOutlet]="volver"
            [ngTemplateOutletContext]="{ $implicit: p }"
          />
        </div>
      }
    </nav>

    <ng-template #volver let-item>
      @if (item.link !== undefined) {
        <a class="uki-breadcrumbs__item" [routerLink]="item.link">
          <uki-icono class="uki-breadcrumbs__icono" nombre="chevron-left" />
          <span><span class="uki-breadcrumbs__oculto">Volver a </span>{{ item.label }}</span>
        </a>
      } @else if (item.href) {
        <a class="uki-breadcrumbs__item" [href]="item.href">
          <uki-icono class="uki-breadcrumbs__icono" nombre="chevron-left" />
          <span><span class="uki-breadcrumbs__oculto">Volver a </span>{{ item.label }}</span>
        </a>
      }
    </ng-template>
  `,
  styleUrls: ['../capa/capa.css', './breadcrumbs.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'uki-breadcrumbs-anfitrion',
    '(document:click)': 'alClicFuera($event)',
    '(focusout)': 'alSalirFoco($event)',
    '(keydown.escape)': 'cerrarMenu(true, $event)',
  },
})
export class UkiBreadcrumbs {
  /** Niveles desde «Inicio»; el último es la página actual y nunca es enlace. */
  readonly items = input.required<readonly UkiBreadcrumbItem[]>();
  /** Ícono de casa en el primer nivel. */
  readonly homeIcon = input(true, { transform: booleanAttribute });

  protected readonly idMenu = `uki-breadcrumbs-menu-${++siguienteId}`;
  protected readonly menuAbierto = signal(false);

  private readonly anfitrion: HTMLElement = inject(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly botonMas = viewChild<ElementRef<HTMLButtonElement>>('botonMas');
  private readonly menu = viewChild<ElementRef<HTMLElement>>('menu');
  private capa?: UkiCapa;

  protected readonly colapsa = computed(() => this.items().length >= NIVELES_PARA_COLAPSAR);

  /** Primero, «…» y los dos últimos cuando colapsa; si no, todos. */
  protected readonly visibles = computed<Visible[]>(() => {
    const items = this.items();
    const nivel = (item: UkiBreadcrumbItem, indice: number): Visible => ({ tipo: 'nivel', item, indice });
    if (!this.colapsa()) return items.map(nivel);
    const n = items.length;
    return [nivel(items[0], 0), { tipo: 'colapsado' }, nivel(items[n - 2], n - 2), nivel(items[n - 1], n - 1)];
  });

  protected readonly ocultos = computed(() => (this.colapsa() ? this.items().slice(1, -2) : []));

  /** Penúltimo nivel: destino del enlace «‹ Padre» en teléfonos. */
  protected readonly padre = computed(() => {
    const items = this.items();
    return items.length > 1 ? items[items.length - 2] : null;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.capa?.cerrar());
    afterRenderEffect(() => {
      const menu = this.menu()?.nativeElement;
      const boton = this.botonMas()?.nativeElement;
      if (!menu || !boton) {
        this.capa?.cerrar();
        this.capa = undefined;
        return;
      }
      if (this.capa) return;
      this.capa = new UkiCapa(menu, boton);
      this.capa.abrir();
      menu.querySelector<HTMLElement>('a')?.focus();
    });
  }

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(devolverFoco: boolean, evento?: Event): void {
    if (!this.menuAbierto()) return;
    // Esc solo cierra el menú: no debe llegar a un modal que contenga la ruta.
    evento?.preventDefault();
    evento?.stopPropagation();
    this.menuAbierto.set(false);
    if (devolverFoco) this.botonMas()?.nativeElement.focus();
  }

  protected alClicFuera(evento: MouseEvent): void {
    if (!this.menuAbierto()) return;
    const destino = evento.target as Node | null;
    if (destino && this.anfitrion.contains(destino)) return;
    this.cerrarMenu(false);
  }

  protected alSalirFoco(evento: FocusEvent): void {
    const destino = evento.relatedTarget as Node | null;
    if (this.menuAbierto() && destino && !this.anfitrion.contains(destino) && destino !== this.document.body) {
      this.cerrarMenu(false);
    }
  }
}
