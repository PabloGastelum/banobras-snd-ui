import { ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { DemoIcono } from './doc/iconos';
import { Portapapeles } from './doc/portapapeles';
import { TemaDoc } from './doc/tema';
import { Tema } from './doc/tokens';
import uki from '../../../uki/tokens/uki-figma.json';

interface Enlace {
  ruta: string;
  texto: string;
  /** Página del archivo de Figma con la referencia de diseño. */
  figma: string;
}

const FIGMA = 'https://www.figma.com/design/6fzZVvIfv44dGFePtb5F9n/UKI---Library?node-id=';

/** Grupos de la barra lateral en el orden de las páginas del archivo de Figma. */
const GRUPOS: { titulo: string; enlaces: Enlace[] }[] = [
  {
    titulo: 'Fundamentos',
    enlaces: [
      { ruta: '/colores', texto: 'Colores', figma: '5-4' },
      { ruta: '/espaciado', texto: 'Espaciado', figma: '5-5' },
      { ruta: '/reticula', texto: 'Retícula', figma: '5-6' },
      { ruta: '/radios', texto: 'Radios', figma: '5-7' },
      { ruta: '/elevacion', texto: 'Elevación', figma: '5-8' },
      { ruta: '/tipografia', texto: 'Tipografía', figma: '5-9' },
    ],
  },
  {
    titulo: 'Componentes',
    enlaces: [
      { ruta: '/button', texto: 'Button', figma: '195-3254' },
      { ruta: '/checkbox', texto: 'Checkbox', figma: '359-2693' },
      { ruta: '/spinner', texto: 'Spinner', figma: '292-2961' },
    ],
  },
];
const INICIO: Enlace & { grupo: string } = { ruta: '/', texto: 'Inicio', figma: '0-1', grupo: 'UKI' };
const PAGINAS = [INICIO, ...GRUPOS.flatMap((g) => g.enlaces.map((e) => ({ ...e, grupo: g.titulo })))];

interface Entrada {
  id: string;
  texto: string;
}

@Component({
  selector: 'demo-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DemoIcono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (sinMarco()) {
      <router-outlet />
    } @else {
      <a class="saltar" href="#contenido" (click)="saltar($event)">Saltar al contenido</a>
      <div class="marco">
        <aside class="lateral">
          <a class="marca" routerLink="/">
            <span class="marca__figura" aria-hidden="true"><span></span><span></span></span>
            <span>
              <span class="marca__nombre">UKI</span>
              <span class="marca__pie">Sistema de diseño · Banobras</span>
            </span>
          </a>
          <button
            #botonMenu
            type="button"
            class="menu-boton"
            aria-controls="navegacion"
            [attr.aria-expanded]="menuAbierto()"
            (click)="abrirMenu()"
          >
            <demo-icono nombre="menu" />
            <span class="oculto">Abrir menú</span>
          </button>
          @if (menuAbierto()) {
            <div class="velo" aria-hidden="true" (click)="cerrarMenu()"></div>
          }
          <div
            #panel
            id="navegacion"
            class="lateral__panel"
            [class.abierto]="menuAbierto()"
            [attr.role]="menuAbierto() ? 'dialog' : null"
            [attr.aria-modal]="menuAbierto() ? 'true' : null"
            [attr.aria-label]="menuAbierto() ? 'Menú de la documentación' : null"
          >
          <div class="panel-cabeza">
            <p class="panel-cabeza__titulo">
              <span class="marca__figura" aria-hidden="true"><span></span><span></span></span>
              <span>
                <span class="marca__nombre">UKI</span>
                <span class="marca__pie">Sistema de diseño · Banobras</span>
              </span>
            </p>
            <button #botonCerrar type="button" class="menu-cerrar" (click)="cerrarMenu()">
              <demo-icono nombre="cerrar" />
              <span class="oculto">Cerrar menú</span>
            </button>
          </div>
          <nav aria-label="Documentación">
            <ul class="lateral__inicio">
              <li>
                <a routerLink="/" routerLinkActive="activo" [routerLinkActiveOptions]="{ exact: true }" ariaCurrentWhenActive="page">Inicio</a>
              </li>
            </ul>
            @for (grupo of grupos; track grupo.titulo) {
              <p class="lateral__grupo" [id]="'g-' + grupo.titulo">{{ grupo.titulo }}</p>
              <ul [attr.aria-labelledby]="'g-' + grupo.titulo">
                @for (enlace of grupo.enlaces; track enlace.ruta) {
                  <li>
                    <a [routerLink]="enlace.ruta" routerLinkActive="activo" ariaCurrentWhenActive="page">{{ enlace.texto }}</a>
                  </li>
                }
              </ul>
            }
          </nav>
          <dl class="lateral__datos">
            <div><dt>Paquete</dt><dd>&#64;banobras/uki 0.1.0</dd></div>
            <div><dt>Figma</dt><dd>UKI Library v{{ version }}</dd></div>
            <div><dt>Tema</dt><dd>{{ tema.actual() }}</dd></div>
          </dl>
          </div>
        </aside>

        <div class="cuerpo" [attr.inert]="menuAbierto() ? '' : null">
          @if (pagina(); as p) {
            <header class="cabeza">
              <p class="cabeza__ruta">
                <span>{{ p.grupo }}</span>
                <span aria-hidden="true">/</span>
                <span class="cabeza__actual">{{ p.texto }}</span>
              </p>
              <div class="cabeza__acciones">
              <fieldset class="selector-tema">
                <legend class="oculto">Tema de color</legend>
                <span class="selector-tema__titulo" aria-hidden="true">Tema</span>
                @for (t of temas; track t.nombre) {
                  <label class="selector-tema__opcion" [class.activo]="tema.actual() === t.nombre">
                    <input
                      type="radio"
                      name="tema"
                      [value]="t.nombre"
                      [checked]="tema.actual() === t.nombre"
                      (change)="tema.actual.set(t.nombre)"
                    />
                    <span class="selector-tema__punto" [style.background]="t.color" aria-hidden="true"></span>
                    {{ t.nombre }}
                  </label>
                }
              </fieldset>
              <a class="cabeza__figma" [href]="figma + p.figma" target="_blank" rel="noopener noreferrer">
                Ver en Figma
                <demo-icono nombre="externo" />
                <span class="oculto">(se abre en otra pestaña)</span>
              </a>
              </div>
            </header>
          }
          <div class="lectura" [class.lectura--completa]="!mostrarIndice()">
            <main id="contenido" tabindex="-1">
              <router-outlet />
            </main>
            @if (mostrarIndice()) {
              <nav class="indice" aria-labelledby="indice-titulo">
                <p id="indice-titulo" class="indice__titulo">En esta página</p>
                <ul>
                  @for (entrada of indice(); track entrada.id) {
                    <li>
                      <a [href]="'#' + entrada.id" [class.actual]="entrada.id === seccionActual()" (click)="irA($event, entrada.id)">{{
                        entrada.texto
                      }}</a>
                    </li>
                  }
                </ul>
              </nav>
            }
          </div>
          @if (vecinas(); as v) {
            <nav class="vecinas" aria-label="Páginas vecinas">
              @if (v.anterior; as a) {
                <a class="vecina" [routerLink]="a.ruta">
                  <demo-icono nombre="flecha-izq" />
                  <span><small>Anterior</small>{{ a.texto }}</span>
                </a>
              }
              @if (v.siguiente; as s) {
                <a class="vecina vecina--siguiente" [routerLink]="s.ruta">
                  <span><small>Siguiente</small>{{ s.texto }}</span>
                  <demo-icono nombre="flecha-der" />
                </a>
              }
            </nav>
          }
        </div>
      </div>
    }
    <p class="oculto" aria-live="polite">{{ anuncio() }}</p>
  `,
  styles: `
    /* Oculto a la vista, legible para lectores de pantalla. Sin margen ni posición propia: si no, alarga la página. */
    .oculto {
      position: absolute;
      top: 0;
      left: 0;
      margin: 0;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    .saltar {
      position: absolute;
      top: var(--spacing-8);
      left: var(--spacing-8);
      z-index: 10;
      padding: var(--spacing-8) var(--spacing-16);
      border-radius: var(--radius-8);
      background: var(--brand-primary);
      color: var(--text-inverse);
      transform: translateY(-200%);
    }
    .saltar:focus-visible {
      transform: none;
      outline: 2px solid var(--gold-400);
    }
    .marco {
      display: grid;
      grid-template-columns: 264px minmax(0, 1fr);
      min-height: 100vh;
    }

    /* Barra lateral: el marco toma el color de la marca; la columna de lectura queda en blanco. */
    .lateral {
      position: sticky;
      top: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-24);
      height: 100vh;
      overflow-y: auto;
      box-sizing: border-box;
      padding: var(--spacing-24) var(--spacing-16);
      background: linear-gradient(180deg, var(--sidebar-background), var(--sidebar-background-submenu));
      color: var(--text-inverse);
      scrollbar-color: var(--sidebar-topbar) transparent;
    }
    .lateral__panel {
      display: contents;
    }
    .menu-boton,
    .panel-cabeza,
    .velo {
      display: none;
    }
    .marca {
      display: flex;
      align-items: center;
      gap: var(--spacing-12);
      padding: var(--spacing-4) var(--spacing-8);
      border-radius: var(--radius-8);
      color: inherit;
      text-decoration: none;
    }
    /* Círculo y cuarto de círculo de la portada de UKI. */
    .marca__figura {
      display: grid;
      grid-template-columns: 18px 18px;
      gap: 2px;
    }
    .marca__figura span {
      height: 18px;
      background: var(--neutral-100);
    }
    .marca__figura span:first-child {
      border-radius: var(--radius-full);
    }
    .marca__figura span:last-child {
      border-radius: 18px 0 0 0;
      background: var(--button-focus-ring);
    }
    .marca__nombre {
      display: block;
      font-family: var(--font-family-heading);
      font-size: 1.375rem;
      line-height: 1;
      font-weight: var(--font-weight-bold);
    }
    .marca__pie {
      display: block;
      margin-top: 2px;
      font-size: var(--font-size-caption);
      color: var(--sidebar-indicator);
    }
    /* Títulos de grupo más tenues que los enlaces: blanco al 60 % mantiene ≥4.5:1 sobre guinda y verde. */
    .lateral__grupo {
      margin: var(--spacing-16) 0 var(--spacing-4);
      padding: 0 var(--spacing-12);
      font-size: var(--font-size-caption);
      font-weight: var(--font-weight-semibold);
      letter-spacing: 0.02em;
      color: rgb(255 255 255 / 60%);
    }
    nav ul {
      display: grid;
      gap: 2px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .lateral nav a {
      position: relative;
      display: block;
      padding: var(--spacing-8) var(--spacing-12);
      border-radius: var(--radius-8);
      color: var(--text-inverse);
      font-size: var(--font-size-body-sm);
      text-decoration: none;
      transition: background-color 160ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    .lateral nav a:hover {
      background: var(--sidebar-item-hover);
    }
    .lateral nav a.activo {
      background: var(--neutral-100);
      color: var(--text-brand);
      font-weight: var(--font-weight-semibold);
    }
    .lateral a:focus-visible {
      outline: 2px solid var(--gold-300);
      outline-offset: 2px;
    }
    .lateral__datos {
      display: grid;
      gap: var(--spacing-8);
      margin: auto 0 0;
      padding: var(--spacing-16) var(--spacing-12) 0;
      border-top: 1px solid rgb(255 255 255 / 16%);
      font-size: var(--font-size-caption);
    }
    .lateral__datos div {
      display: flex;
      justify-content: space-between;
      gap: var(--spacing-8);
    }
    .lateral__datos dt {
      color: var(--sidebar-indicator);
    }
    .lateral__datos dd {
      margin: 0;
      font-variant-numeric: tabular-nums;
    }

    /* Encabezado corrido: dónde estoy y enlace a la referencia en Figma. */
    .cuerpo {
      min-width: 0;
    }
    .cabeza {
      position: sticky;
      top: 0;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-16);
      min-height: 56px;
      padding: 0 var(--spacing-40);
      border-bottom: 1px solid var(--border-low-contrast);
      background: rgb(255 255 255 / 92%);
      backdrop-filter: blur(8px);
    }
    .cabeza__ruta {
      display: flex;
      gap: var(--spacing-8);
      margin: 0;
      font-size: var(--font-size-body-sm);
      color: var(--text-secondary);
    }
    .cabeza__actual {
      color: var(--text-primary);
      font-weight: var(--font-weight-semibold);
    }
    .cabeza__acciones {
      display: flex;
      align-items: center;
      gap: var(--spacing-16);
    }
    .selector-tema {
      display: flex;
      align-items: center;
      gap: 2px;
      margin: 0;
      padding: 3px;
      border: 1px solid var(--border-low-contrast);
      border-radius: var(--radius-full);
      background: var(--neutral-200);
    }
    .selector-tema__titulo {
      padding: 0 var(--spacing-8) 0 var(--spacing-12);
      font-size: var(--font-size-caption);
      color: var(--text-secondary);
    }
    .selector-tema__opcion {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-8);
      min-height: 34px;
      padding: 0 var(--spacing-12);
      border-radius: var(--radius-full);
      color: var(--text-secondary);
      font-size: var(--font-size-body-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition:
        background-color 200ms cubic-bezier(0.16, 1, 0.3, 1),
        color 200ms cubic-bezier(0.16, 1, 0.3, 1),
        box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    .selector-tema__opcion input {
      position: absolute;
      inset: 0;
      margin: 0;
      opacity: 0;
      cursor: inherit;
    }
    .selector-tema__opcion:has(input:focus-visible) {
      outline: 2px solid var(--border-brand);
      outline-offset: 1px;
    }
    .selector-tema__opcion.activo {
      background: var(--background-surface);
      color: var(--text-primary);
      box-shadow: var(--elevation-raised);
    }
    .selector-tema__punto {
      width: 12px;
      height: 12px;
      border-radius: var(--radius-full);
    }
    .cabeza__figma {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-8);
      min-height: 40px;
      padding: 0 var(--spacing-12);
      border-radius: var(--radius-8);
      color: var(--text-brand);
      font-size: var(--font-size-body-sm);
      font-weight: var(--font-weight-medium);
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .cabeza__figma:hover {
      background: var(--button-tint);
    }
    .cabeza__figma:focus-visible,
    .indice a:focus-visible,
    .vecina:focus-visible {
      outline: 2px solid var(--border-brand);
      outline-offset: 2px;
    }

    .lectura {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 200px;
      gap: var(--spacing-32);
      padding: 0 var(--spacing-40);
    }
    .lectura--completa {
      grid-template-columns: minmax(0, 1fr);
    }
    main {
      min-width: 0;
    }
    main:focus {
      outline: none;
    }

    /* Índice de la página con la sección visible marcada. */
    .indice {
      position: sticky;
      top: 88px;
      align-self: start;
      padding-top: var(--spacing-48);
    }
    .indice__titulo {
      margin: 0 0 var(--spacing-12);
      font-size: var(--font-size-caption);
      font-weight: var(--font-weight-semibold);
      color: var(--text-secondary);
    }
    .indice ul {
      border-left: 1px solid var(--border-low-contrast);
    }
    .indice a {
      display: block;
      margin-left: -1px;
      padding: var(--spacing-4) var(--spacing-12);
      border-left: 2px solid transparent;
      color: var(--text-secondary);
      font-size: var(--font-size-body-sm);
      text-decoration: none;
      transition:
        color 160ms cubic-bezier(0.16, 1, 0.3, 1),
        border-color 160ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    .indice a:hover {
      color: var(--text-primary);
    }
    .indice a.actual {
      border-left-color: var(--border-brand);
      color: var(--text-brand);
      font-weight: var(--font-weight-medium);
    }

    .vecinas {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-16);
      margin: 0 var(--spacing-40);
      padding: var(--spacing-32) 0 var(--spacing-64);
      border-top: 1px solid var(--border-low-contrast);
    }
    .vecina {
      display: flex;
      align-items: center;
      gap: var(--spacing-12);
      padding: var(--spacing-16) var(--spacing-20);
      border: 1px solid var(--border-low-contrast);
      border-radius: var(--radius-12);
      color: var(--text-primary);
      font-weight: var(--font-weight-semibold);
      text-decoration: none;
      transition: border-color 160ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    .vecina:hover {
      border-color: var(--border-brand);
      color: var(--text-brand);
    }
    .vecina small {
      display: block;
      font-size: var(--font-size-caption);
      font-weight: var(--font-weight-regular);
      color: var(--text-secondary);
    }
    .vecina--siguiente {
      grid-column: 2;
      justify-content: flex-end;
      text-align: right;
    }

    @media (max-width: 1279.98px) {
      .lectura {
        grid-template-columns: minmax(0, 1fr);
      }
      .indice {
        display: none;
      }
    }
    /* Móvil y tableta: barra superior con la marca y un botón que abre la navegación en un panel lateral. */
    @media (max-width: 1023.98px) {
      .marco {
        grid-template-columns: minmax(0, 1fr);
      }
      .lateral {
        z-index: 20;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        height: 60px;
        padding: 0 var(--spacing-8) 0 var(--spacing-12);
        overflow: visible;
      }
      .marca__figura {
        grid-template-columns: 14px 14px;
      }
      .marca__figura span {
        height: 14px;
      }
      .marca__figura span:last-child {
        border-radius: 14px 0 0 0;
      }
      .marca__nombre {
        font-size: 1.125rem;
      }
      .menu-boton {
        position: relative;
        display: inline-grid;
        place-items: center;
        width: 44px;
        height: 44px;
        padding: 0;
        border: 0;
        border-radius: var(--radius-8);
        background: transparent;
        color: var(--text-inverse);
        font: inherit;
        font-size: var(--font-size-body-sm);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
      }
      .menu-boton:focus-visible,
      .menu-cerrar:focus-visible {
        outline: 2px solid var(--gold-300);
        outline-offset: 2px;
      }
      .velo {
        position: fixed;
        inset: 0;
        z-index: 29;
        display: block;
        background: var(--elevation-scrim);
        animation: aparecer 200ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .lateral__panel {
        position: fixed;
        inset: 0 auto 0 0;
        z-index: 30;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-16);
        width: min(320px, 86vw);
        box-sizing: border-box;
        overflow-y: auto;
        padding: var(--spacing-16);
        background: linear-gradient(180deg, var(--sidebar-background), var(--sidebar-background-submenu));
        box-shadow: var(--elevation-modal);
        transform: translateX(-100%);
        visibility: hidden;
        transition:
          transform 280ms cubic-bezier(0.16, 1, 0.3, 1),
          visibility 0s linear 280ms;
      }
      .lateral__panel.abierto {
        transform: none;
        visibility: visible;
        transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .panel-cabeza {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-12);
        padding: 0 0 var(--spacing-16) var(--spacing-8);
        border-bottom: 1px solid rgb(255 255 255 / 16%);
      }
      .panel-cabeza__titulo {
        display: flex;
        align-items: center;
        gap: var(--spacing-12);
        margin: 0;
      }
      .menu-cerrar {
        display: inline-grid;
        flex: none;
        place-items: center;
        width: 44px;
        height: 44px;
        border: 0;
        border-radius: var(--radius-8);
        background: transparent;
        color: var(--text-inverse);
        cursor: pointer;
      }
      .menu-boton:hover,
      .menu-cerrar:hover {
        background: var(--sidebar-item-hover);
      }
      .lateral nav a {
        padding-block: var(--spacing-12);
      }
      .cabeza {
        position: static;
        padding-inline: var(--spacing-16);
      }
      .lectura {
        padding-inline: var(--spacing-16);
      }
      .cabeza__ruta,
      .selector-tema__titulo {
        display: none;
      }
      .cabeza__acciones {
        width: 100%;
        justify-content: space-between;
      }
      .vecinas {
        margin-inline: var(--spacing-16);
      }
    }
    @media (max-width: 1023.98px) and (prefers-reduced-motion: reduce) {
      .lateral__panel,
      .lateral__panel.abierto,
      .velo {
        transition: none;
        animation: none;
      }
    }
    @keyframes aparecer {
      from {
        opacity: 0;
      }
    }
  `,
})
export class App {
  protected readonly grupos = GRUPOS;
  protected readonly version = uki.figmaVersion;
  protected readonly figma = FIGMA;
  protected readonly anuncio = inject(Portapapeles).anuncio;
  protected readonly tema = inject(TemaDoc);
  protected readonly temas: { nombre: Tema; color: string }[] = [
    { nombre: 'Guinda', color: 'var(--pguinda-900)' },
    { nombre: 'Verde', color: 'var(--pverde-900)' },
  ];

  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.split(/[?#]/)[0]),
    ),
    { initialValue: '' },
  );
  /** Las muestras que se incrustan en iframes (por ejemplo el grupo de botones a 375 px) van sin barra lateral. */
  protected readonly sinMarco = computed(() => {
    this.url();
    let r = this.ruta.snapshot;
    while (r.firstChild) r = r.firstChild;
    return r.data['sinMarco'] === true;
  });
  protected readonly pagina = computed(() => PAGINAS.find((p) => p.ruta === this.url()) ?? null);
  protected readonly vecinas = computed(() => {
    const i = PAGINAS.findIndex((p) => p.ruta === this.url());
    return i < 0 ? null : { anterior: PAGINAS[i - 1] ?? null, siguiente: PAGINAS[i + 1] ?? null };
  });

  protected readonly menuAbierto = signal(false);
  private readonly botonMenu = viewChild<ElementRef<HTMLButtonElement>>('botonMenu');
  private readonly botonCerrar = viewChild<ElementRef<HTMLButtonElement>>('botonCerrar');

  protected readonly indice = signal<Entrada[]>([]);
  /** La portada ocupa todo el ancho, como la de Figma; las demás páginas llevan índice. */
  protected readonly mostrarIndice = computed(() => this.url() !== '/' && this.indice().length > 1);
  protected readonly seccionActual = signal('');
  private titulos: HTMLElement[] = [];
  private cuadro = 0;

  constructor() {
    const suscripcion = this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      if (this.menuAbierto()) this.cerrarMenu(false);
      // La página nueva se pinta después de NavigationEnd: se arma el índice en el siguiente cuadro.
      setTimeout(() => requestAnimationFrame(() => this.armarIndice()));
    });
    // La sección actual es el último título que ya pasó bajo el encabezado; al final de la página, el último.
    const alDesplazar = () => {
      cancelAnimationFrame(this.cuadro);
      this.cuadro = requestAnimationFrame(() => this.marcarSeccion());
    };
    addEventListener('scroll', alDesplazar, { passive: true });
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape' && this.menuAbierto()) this.cerrarMenu();
    };
    addEventListener('keydown', alTeclear);
    // Si la ventana crece a escritorio con el menú abierto, se cierra para no dejar la página bloqueada.
    const escritorio = matchMedia('(min-width: 1024px)');
    const alCambiarAncho = () => escritorio.matches && this.menuAbierto() && this.cerrarMenu(false);
    escritorio.addEventListener('change', alCambiarAncho);
    inject(DestroyRef).onDestroy(() => {
      suscripcion.unsubscribe();
      removeEventListener('scroll', alDesplazar);
      removeEventListener('keydown', alTeclear);
      escritorio.removeEventListener('change', alCambiarAncho);
      document.body.style.overflow = '';
      cancelAnimationFrame(this.cuadro);
    });
  }

  private armarIndice(): void {
    this.titulos = [...document.querySelectorAll<HTMLElement>('main h1[id], main h2[id]')];
    this.indice.set(this.titulos.map((t) => ({ id: t.id, texto: t.textContent?.trim() ?? '' })));
    this.marcarSeccion();
  }

  private marcarSeccion(): void {
    if (!this.titulos.length) return;
    const alFinal = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    const pasados = this.titulos.filter((t) => t.getBoundingClientRect().top <= 120);
    const actual = alFinal ? this.titulos.at(-1)! : (pasados.at(-1) ?? this.titulos[0]);
    this.seccionActual.set(actual.id);
  }

  protected abrirMenu(): void {
    this.menuAbierto.set(true);
    document.body.style.overflow = 'hidden';
    // El foco entra al panel; el resto de la página queda inerte mientras está abierto.
    requestAnimationFrame(() => this.botonCerrar()?.nativeElement.focus());
  }

  protected cerrarMenu(devolverFoco = true): void {
    this.menuAbierto.set(false);
    document.body.style.overflow = '';
    if (devolverFoco) this.botonMenu()?.nativeElement.focus();
  }

  protected irA(evento: Event, id: string): void {
    evento.preventDefault();
    const destino = document.getElementById(id);
    if (!destino) return;
    destino.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    destino.setAttribute('tabindex', '-1');
    destino.focus({ preventScroll: true });
    this.seccionActual.set(id);
  }

  protected saltar(evento: Event): void {
    evento.preventDefault();
    document.getElementById('contenido')?.focus();
  }
}
