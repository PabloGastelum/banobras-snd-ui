import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { UkiSidebar, UkiSidebarItem, UkiSidebarUser } from '@banobras/uki';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';
import { DemoIcono } from '../doc/iconos';
import { DocToken } from '../doc/token';

/**
 * Destinos de ejemplo. Solo «Mis trámites» es del router y apunta a esta página, para mostrar el activo; los demás son
 * anclas de la página para no salir de ella.
 */
const MENU: UkiSidebarItem[] = [
  { label: 'Inicio', icon: 'house', href: '#t-resumen', bottomBar: true, section: 'Mi cuenta' },
  { label: 'Mis trámites', icon: 'file-earmark-text', link: '/sidebar', bottomBar: true, section: 'Mi cuenta' },
  { label: 'Documentos', icon: 'folder', href: '#t-organismos', bottomBar: true, section: 'Mi cuenta' },
  {
    label: 'Administración',
    icon: 'gear',
    section: 'Administración',
    children: [
      { label: 'Usuarios', icon: 'people', href: '#t-estados' },
      { label: 'Roles y permisos', icon: 'people', href: '#t-estados' },
      {
        label: 'Catálogos',
        icon: 'journal-text',
        children: [
          { label: 'Macroprocesos', href: '#t-responsivo' },
          { label: 'Procesos', href: '#t-responsivo' },
          { label: 'Subprocesos', href: '#t-responsivo' },
        ],
      },
      { label: 'Bitácora', icon: 'journal-text', href: '#t-teclado' },
    ],
  },
  { label: 'Ayuda', icon: 'globe', href: '#t-teclado', section: 'Administración' },
];

const LARGO: UkiSidebarItem[] = [
  ...MENU,
  { label: 'Reportes', icon: 'journal-text', href: '#t-resumen' },
  { label: 'Indicadores', icon: 'search', href: '#t-resumen' },
  { label: 'Mensajes', icon: 'chat', href: '#t-resumen' },
  { label: 'Configuración', icon: 'gear', href: '#t-resumen' },
];

/** Para la anatomía: el activo es un subelemento, así su rama se abre sola. */
const ANATOMIA: UkiSidebarItem[] = MENU.map((item) =>
  item.children
    ? { ...item, children: item.children.map((h, i) => (i === 0 ? { ...h, href: undefined, link: '/sidebar' } : h)) }
    : item.link
      ? { ...item, link: undefined, href: '#t-anatomia' }
      : item,
);

const PERSONA: UkiSidebarUser = { name: 'Mariana López Hernández', role: 'Administradora' };

const PARTES: Parte[] = [
  { selector: '.uki-sidebar__marca', nombre: 'Barra de marca', detalle: 'Topbar link · 60 px · sidebar/topbar · Banobras White Small · enlace opcional («Ir a Llave MX»)', lado: 'arriba' },
  { selector: '.uki-sidebar__persona', nombre: 'Persona', detalle: 'Sidebar/Header · 72 px · Avatar sm + nombre Label SemiBold + rol Caption · borde inferior', lado: 'arriba' },
  { selector: '.uki-sidebar__fila--nivel-1', nombre: 'Elemento', detalle: 'Item · 56 px · relleno spacing-16 · espacio spacing-12 · ícono 24 + Label', lado: 'abajo' },
  { selector: '.uki-sidebar__fila--activa', nombre: 'Subelemento activo', detalle: 'Nivel 2: 40 px, sangría 52 px (nivel 3: 36 px, 76 px) · sidebar/mobile-active · aria-current="page"', lado: 'abajo' },
  { selector: '.uki-sidebar__toggle', nombre: 'Botón de contraer', detalle: 'Toggle · 24 × 48 · radius-8 en las esquinas derechas · aria-expanded y aria-controls', lado: 'abajo' },
  { selector: '.uki-sidebar', nombre: 'Contenedor', detalle: '256 px expandida, 56 px colapsada · degradado sidebar/background → sidebar/background-end · Elevation/raised', lado: 'arriba', alinear: 'inicio' },
];

const RESPONSIVO = [
  { forma: 'Escritorio · Expandida', corte: '1280 px o más', medida: '256 px (admin/sidebar)', detalle: 'Con etiquetas. Los hijos se abren en acordeón debajo del padre, hasta tres niveles, con una sola rama abierta. El botón del borde derecho la contrae.' },
  { forma: 'Tableta · Colapsada', corte: '768 a 1279 px, o al contraerla', medida: '56 px · panel de 188 px (220 con tres niveles)', detalle: 'Solo íconos. Los hijos se abren en un panel flotante blanco al pasar el puntero, con clic o con Enter, Espacio o →.' },
  { forma: 'Teléfono · Barra inferior', corte: 'Menos de 768 px', medida: 'Hasta 4 destinos · radius-16 arriba', detalle: 'Tres destinos (bottomBar) y «Más», que abre el panel completo.' },
  { forma: 'Teléfono · Panel «Más»', corte: 'Menos de 768 px', medida: 'Pantalla completa', detalle: 'Todos los destinos agrupados por section. Esc o × lo cierran y el foco vuelve a «Más».' },
];

const TECLADO = [
  { tecla: 'Tab / Mayús + Tab', accion: 'Recorre la barra de marca, los destinos visibles y el botón de contraer.' },
  { tecla: 'Enter o Espacio', accion: 'En un padre, abre o cierra su rama (expandida) o su panel flotante (colapsada). En un destino, navega.' },
  { tecla: '→ / ←', accion: 'Colapsada: → abre el panel flotante con el foco en el primer destino; ← lo cierra y vuelve al padre.' },
  { tecla: 'Esc', accion: 'Cierra el panel flotante o el panel «Más» y devuelve el foco a quien lo abrió.' },
];

/** Página Sidebar de Figma: la navegación principal en sus tres formas. */
@Component({
  selector: 'demo-sidebar',
  imports: [UkiSidebar, DemoEjemplo, DocAnatomia, DocToken, DemoIcono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Sin encapsulación, como la página de Spinner: ajusta la barra de teléfono dentro de su marco (.pg-sidebar-*).
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Sidebar</h1>
          <p class="doc-descripcion">
            La navegación principal de los portales transaccionales y los paneles de administración. Se arma con átomos
            (íconos), moléculas (elementos, persona, botón de contraer) y organismos (barra de escritorio, barra inferior y
            panel de teléfono), y se basa en la «Barra lateral» del SND.
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsala para</h3>
            <p>Productos con 4 a 8 destinos de primer nivel entre los que la gente se mueve seguido: portales, ventanillas de trámites y back-offices.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>No la uses para</h3>
            <p>Sitios públicos de pocas páginas o flujos lineales, como un asistente de pasos. Usa la navegación del encabezado o un indicador de pasos.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Una por pantalla</h3>
            <p>Vive en la columna admin/sidebar y nunca se desplaza con el contenido: solo su lista hace scroll.</p>
          </article>
        </div>
        <demo-ejemplo titulo="Sidebar expandida" nombre="sidebar" [html]="codigo.basico" [ts]="codigo.ts" fondo="pagina">
          <div class="pg-sidebar-marco" data-prueba="sidebar-expandida">
            <uki-sidebar [items]="menu" [user]="persona" [topbarLink]="{ label: 'Ir a Llave MX', href: '#t-resumen' }" device="desktop"
                         [(collapsed)]="contraida" />
            <div class="pg-sidebar-contenido" aria-hidden="true"><span></span><span></span><span></span></div>
          </div>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-moleculas">
        <header class="doc-encabezado">
          <h2 id="t-moleculas" class="doc-titulo">Moléculas</h2>
          <p class="doc-descripcion">
            Siete partes pequeñas, cada una con un trabajo: elemento, subelemento, opción del panel flotante, destino de la
            barra inferior, persona, barra de marca y botón de contraer. Los estados, en vista fija:
          </p>
        </header>
        <div class="doc-visual pg-sidebar-estados pg-sidebar-oscuro" aria-hidden="true">
          @for (e of estados; track e.clase) {
            <figure>
              <span class="uki-sidebar__fila uki-sidebar__fila--nivel-1 pg-sidebar-fila" [class]="e.clase">
                <demo-icono class="pg-sidebar-icono" nombre="menu" />
                <span class="uki-sidebar__etiqueta">Mis trámites</span>
              </span>
              <figcaption>Elemento · {{ e.nombre }}</figcaption>
            </figure>
          }
          <figure>
            <span class="uki-sidebar__fila uki-sidebar__fila--nivel-2 pg-sidebar-fila">
              <span class="uki-sidebar__etiqueta">Usuarios</span>
            </span>
            <figcaption>Subelemento · nivel 2</figcaption>
          </figure>
          <figure>
            <span class="uki-sidebar__fila uki-sidebar__fila--nivel-3 pg-sidebar-fila uki-sidebar__fila--activa">
              <span class="uki-sidebar__etiqueta">Procesos</span>
            </span>
            <figcaption>Subelemento · nivel 3 activo</figcaption>
          </figure>
          <figure>
            <span class="pg-sidebar-toggle-fijo uki-sidebar__toggle"><demo-icono nombre="flecha-izq" /></span>
            <figcaption>Botón de contraer</figcaption>
          </figure>
        </div>
        <div class="doc-visual pg-sidebar-estados" aria-hidden="true">
          @for (o of opciones; track o.nombre) {
            <figure>
              <span class="uki-sidebar__opcion" [class]="o.clase"><demo-icono class="pg-sidebar-icono-chico" nombre="menu" />Mis documentos</span>
              <figcaption>Opción del panel · {{ o.nombre }}</figcaption>
            </figure>
          }
          <figure>
            <span class="pg-sidebar-oscuro pg-sidebar-destinos">
              <span class="uki-sidebar-movil__destino"><demo-icono nombre="menu" />Inicio</span>
              <span class="uki-sidebar-movil__destino uki-sidebar__fila--activa"><demo-icono nombre="menu" />Trámites</span>
            </span>
            <figcaption>Destino de la barra inferior · Default y Active</figcaption>
          </figure>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-organismos">
        <header class="doc-encabezado">
          <h2 id="t-organismos" class="doc-titulo">Organismos</h2>
          <p class="doc-descripcion">
            Con device="auto" (por omisión) la Sidebar elige su forma según el ancho. Aquí cada ejemplo fija la suya con device
            y collapsed. Pasa el puntero o usa Enter sobre «Administración» en la colapsada para abrir su panel flotante.
          </p>
        </header>
        <div class="pg-sidebar-organismos">
          <demo-ejemplo titulo="Colapsada con panel flotante" nombre="colapsada" [html]="codigo.colapsada" fondo="pagina">
            <div class="pg-sidebar-marco pg-sidebar-marco--corto" data-prueba="sidebar-colapsada">
              <uki-sidebar [items]="menu" [user]="persona" device="desktop" [collapsed]="true" ariaLabel="Menú principal (colapsado)" />
              <div class="pg-sidebar-contenido" aria-hidden="true"><span></span><span></span></div>
            </div>
          </demo-ejemplo>
          <demo-ejemplo titulo="Teléfono: barra inferior y «Más»" nombre="movil" [html]="codigo.movil" fondo="pagina">
            <div class="pg-sidebar-telefono" data-prueba="sidebar-movil">
              <div class="pg-sidebar-contenido" aria-hidden="true"><span></span><span></span><span></span></div>
              <uki-sidebar [items]="menu" device="mobile" ariaLabel="Menú principal (teléfono)" />
            </div>
          </demo-ejemplo>
        </div>
        <demo-ejemplo titulo="Solo la lista hace scroll" nombre="scroll" [html]="codigo.scroll" fondo="pagina">
          <div class="pg-sidebar-marco pg-sidebar-marco--corto" data-prueba="sidebar-scroll">
            <uki-sidebar [items]="largo" [user]="persona" device="desktop" ariaLabel="Menú principal (lista larga)" />
            <div class="pg-sidebar-contenido" aria-hidden="true"><span></span><span></span></div>
          </div>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">Seis partes forman la Sidebar. Cada una toma su valor de un token, así que el tema verde la actualiza completa.</p>
        </header>
        <demo-anatomia [partes]="partes" [escala]="1">
          <div class="pg-sidebar-anatomia">
            <uki-sidebar [items]="anatomia" [user]="persona" device="desktop" [collapsed]="false" />
          </div>
        </demo-anatomia>
      </section>

      <section class="doc-seccion" aria-labelledby="t-estados">
        <header class="doc-encabezado">
          <h2 id="t-estados" class="doc-titulo">Estados</h2>
          <p class="doc-descripcion">
            Default → Hover (solo con puntero) → clic → Active; con el teclado, Focus. El activo usa sidebar/mobile-active en
            lugar de sidebar/item-active: con texto blanco, sidebar/item-active da 3.9:1 en guinda y 4.4:1 en verde, debajo
            del 4.5:1 de AA.
          </p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Tokens de la Sidebar por estado</caption>
            <thead>
              <tr>
                <th scope="col">Estado</th>
                <th scope="col">Fondo</th>
                <th scope="col">Texto e ícono</th>
                <th scope="col">Indicador</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Default<small>Transparente sobre el fondo</small></th>
                <td><demo-token nombre="sidebar/background" nota="→ sidebar/background-end" /></td>
                <td><demo-token nombre="text/inverse" /></td>
                <td>—</td>
              </tr>
              <tr>
                <th scope="row">Hover<small>Solo con puntero</small></th>
                <td><demo-token nombre="sidebar/item-hover" /></td>
                <td><demo-token nombre="text/inverse" /></td>
                <td>—</td>
              </tr>
              <tr>
                <th scope="row">Active<small>Página actual · aria-current="page"</small></th>
                <td><demo-token nombre="sidebar/mobile-active" /></td>
                <td><demo-token nombre="text/inverse" /></td>
                <td><demo-token nombre="sidebar/indicator" nota="barra de 4 px" /></td>
              </tr>
              <tr>
                <th scope="row">Focus<small>Teclado · nunca lo quites</small></th>
                <td>—</td>
                <td><demo-token nombre="text/inverse" /></td>
                <td><demo-token nombre="sidebar/indicator" nota="anillo de 2 px" /></td>
              </tr>
              <tr>
                <th scope="row">Subelemento · Focus</th>
                <td>—</td>
                <td><demo-token nombre="text/inverse" /></td>
                <td><demo-token nombre="button/focus-ring" nota="2 px" /></td>
              </tr>
              <tr>
                <th scope="row">Panel flotante</th>
                <td><demo-token nombre="background/surface" nota="Elevation/overlay" /></td>
                <td><demo-token nombre="text/primary" /></td>
                <td><demo-token nombre="border/brand" nota="foco de 2 px" /></td>
              </tr>
              <tr>
                <th scope="row">Barra de marca</th>
                <td><demo-token nombre="sidebar/topbar" /></td>
                <td>Logotipo White</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-responsivo">
        <header class="doc-encabezado">
          <h2 id="t-responsivo" class="doc-titulo">Comportamiento responsivo</h2>
          <p class="doc-descripcion">
            La Sidebar cambia de forma con los cortes de la colección Layout. El contenido nunca pasa debajo de ella: la
            retícula de administración reserva su columna. En teléfono, deja abajo 76 px para la barra inferior.
          </p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Formas de la Sidebar</caption>
            <thead>
              <tr>
                <th scope="col">Forma</th>
                <th scope="col">Corte</th>
                <th scope="col">Medida</th>
                <th scope="col">Comportamiento</th>
              </tr>
            </thead>
            <tbody>
              @for (r of responsivo; track r.forma) {
                <tr>
                  <th scope="row">{{ r.forma }}</th>
                  <td>{{ r.corte }}</td>
                  <td>{{ r.medida }}</td>
                  <td>{{ r.detalle }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-teclado">
        <header class="doc-encabezado">
          <h2 id="t-teclado" class="doc-titulo">Teclado</h2>
          <p class="doc-descripcion">Todo se usa sin ratón. Los padres son botones con aria-expanded; los destinos, enlaces.</p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Teclas de la Sidebar</caption>
            <thead>
              <tr>
                <th scope="col">Tecla</th>
                <th scope="col">Acción</th>
              </tr>
            </thead>
            <tbody>
              @for (t of teclado; track t.tecla) {
                <tr>
                  <th scope="row"><kbd>{{ t.tecla }}</kbd></th>
                  <td>{{ t.accion }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: `
    .pg-sidebar-marco {
      display: flex;
      width: 100%;
      height: 560px;
      overflow: hidden;
      border-radius: var(--radius-12);
      background: var(--background-page);
    }
    .pg-sidebar-marco--corto {
      height: 420px;
    }
    .pg-sidebar-contenido {
      display: grid;
      flex: 1;
      align-content: start;
      gap: var(--spacing-12);
      min-width: 0;
      padding: var(--spacing-32) var(--spacing-40);
    }
    .pg-sidebar-contenido span {
      height: 12px;
      border-radius: var(--radius-full);
      background: var(--border-low-contrast);
    }
    .pg-sidebar-contenido span:first-child {
      width: 40%;
      height: 20px;
    }
    .pg-sidebar-organismos {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-24);
    }
    /* Teléfono de 375 × 420 dentro de la página: la barra fija queda dentro del marco. */
    .pg-sidebar-telefono {
      position: relative;
      width: 100%;
      max-width: 375px;
      height: 420px;
      overflow: hidden;
      margin-inline: auto;
      border: 1px solid var(--border-low-contrast);
      border-radius: var(--radius-16);
      background: var(--background-surface);
    }
    .pg-sidebar-telefono .uki-sidebar-movil {
      position: absolute;
    }
    .pg-sidebar-anatomia {
      display: flex;
      height: 520px;
      padding-right: 24px;
    }
    .pg-sidebar-estados {
      align-items: flex-start;
      gap: var(--spacing-24);
    }
    .pg-sidebar-estados figure {
      display: grid;
      justify-items: start;
      gap: var(--spacing-8);
      margin: 0;
    }
    .pg-sidebar-estados figcaption {
      color: var(--text-secondary);
      font-size: var(--font-size-caption);
    }
    .pg-sidebar-oscuro {
      background: linear-gradient(180deg, var(--sidebar-background), var(--sidebar-background-end));
    }
    .pg-sidebar-oscuro figcaption {
      color: var(--text-inverse);
    }
    .pg-sidebar-fila {
      width: 256px;
    }
    .pg-sidebar-icono {
      width: 24px;
      height: 24px;
    }
    .pg-sidebar-icono-chico {
      width: 16px;
      height: 16px;
    }
    .pg-sidebar-hover {
      background: var(--sidebar-item-hover);
    }
    .pg-sidebar-foco {
      outline: 2px solid var(--sidebar-indicator);
      outline-offset: -2px;
    }
    .pg-sidebar-estados .pg-sidebar-toggle-fijo {
      position: static;
    }
    .pg-sidebar-opcion-hover {
      background: var(--background-page);
    }
    .pg-sidebar-opcion-foco {
      outline: 2px solid var(--border-brand);
      outline-offset: -2px;
    }
    .pg-sidebar-destinos {
      display: flex;
      gap: var(--spacing-8);
      padding: var(--spacing-8);
      border-radius: var(--radius-16) var(--radius-16) 0 0;
    }
  `,
})
export default class SidebarPagina {
  protected readonly menu = MENU;
  protected readonly largo = LARGO;
  protected readonly anatomia = ANATOMIA;
  protected readonly persona = PERSONA;
  protected readonly partes = PARTES;
  protected readonly responsivo = RESPONSIVO;
  protected readonly teclado = TECLADO;
  protected readonly contraida = signal<boolean | null>(null);
  protected readonly estados = [
    { nombre: 'Default', clase: '' },
    { nombre: 'Hover', clase: 'pg-sidebar-hover' },
    { nombre: 'Active', clase: 'uki-sidebar__fila--activa' },
    { nombre: 'Focus', clase: 'pg-sidebar-foco' },
  ];
  protected readonly opciones = [
    { nombre: 'Default', clase: '' },
    { nombre: 'Hover', clase: 'pg-sidebar-opcion-hover' },
    { nombre: 'Active', clase: 'uki-sidebar__fila--activa' },
    { nombre: 'Focus', clase: 'pg-sidebar-opcion-foco' },
  ];
  protected readonly codigo = {
    basico: `<uki-sidebar [items]="menu" [user]="persona" [topbarLink]="{ label: 'Ir a Llave MX', href: llaveMx }"
             [(collapsed)]="contraida" />`,
    ts: `import { UkiSidebar, UkiSidebarItem, UkiSidebarUser } from '@banobras/uki';

@Component({
  imports: [UkiSidebar],
})
export class Marco {
  // Los destinos los decide el sistema (por ejemplo, según el rol); la Sidebar solo los dibuja.
  protected readonly menu: UkiSidebarItem[] = [
    { label: 'Inicio', icon: 'house', link: '/', bottomBar: true },
    { label: 'Mis trámites', icon: 'file-earmark-text', link: '/tramites', bottomBar: true },
    { label: 'Documentos', icon: 'folder', link: '/documentos', bottomBar: true },
    { label: 'Administración', icon: 'gear', section: 'Administración', children: [
      { label: 'Usuarios', link: '/admin/usuarios' },
      { label: 'Catálogos', icon: 'journal-text', children: [
        { label: 'Macroprocesos', link: '/admin/catalogos/macroprocesos' },
        { label: 'Procesos', link: '/admin/catalogos/procesos' },
      ] },
      { label: 'Bitácora', link: '/admin/bitacora' },
    ] },
  ];
  protected readonly persona: UkiSidebarUser = { name: 'Mariana López Hernández', role: 'Administradora' };
  // null: según el ancho. true o false: la elección de la persona (guárdala si quieres recordarla).
  protected readonly contraida = signal<boolean | null>(null);
}`,
    colapsada: `<!-- Colapsada siempre (por ejemplo, en una pantalla con mucho contenido). -->
<uki-sidebar [items]="menu" [user]="persona" [collapsed]="true" />`,
    movil: `<!-- En teléfono la barra inferior es fija: deja 76 px abajo para que no tape el contenido. -->
<uki-sidebar [items]="menu" />

<!-- Ícono propio: una plantilla con el nombre que usas en icon. -->
<uki-sidebar [items]="menu">
  <ng-template ukiSidebarIcon="tramites"><svg viewBox="0 0 24 24">…</svg></ng-template>
</uki-sidebar>`,
    scroll: `/* La Sidebar llena el alto de su columna; fíjala al alto de la ventana. */
.app__lateral {
  position: sticky;
  top: 0;
  height: 100dvh;
}`,
  };
}
