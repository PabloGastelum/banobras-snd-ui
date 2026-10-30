import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UkiBreadcrumbItem, UkiBreadcrumbs } from '@banobras/uki';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';
import { DemoIcono } from '../doc/iconos';
import { DocToken } from '../doc/token';

/** En la documentación todos los enlaces apuntan a esta página para no salir de ella. */
const AQUI = '/breadcrumbs';

const nivel = (label: string): UkiBreadcrumbItem => ({ label, link: AQUI });

const RUTAS = {
  dos: [nivel('Inicio'), { label: 'Trámites' }],
  tres: [nivel('Inicio'), nivel('Trámites'), { label: 'Solicitudes' }],
  cuatro: [nivel('Inicio'), nivel('Trámites'), nivel('Solicitudes'), { label: 'SOL-2026-0148' }],
  colapsada: [
    nivel('Inicio'),
    nivel('Programas'),
    nivel('FONADIN'),
    nivel('Trámites'),
    nivel('Solicitudes'),
    { label: 'SOL-2026-0148' },
  ],
};

const PARTES: Parte[] = [
  { selector: '.uki-breadcrumbs__nivel:first-child .uki-breadcrumbs__item', nombre: 'Inicio', detalle: 'Elemento con ícono house de 16 px · siempre el primer nivel', lado: 'arriba' },
  { selector: '.uki-breadcrumbs__separador', nombre: 'Separador', detalle: 'chevron-right de 16 px · breadcrumb/separator · aria-hidden', lado: 'abajo' },
  { selector: '.uki-breadcrumbs__mas', nombre: 'Más niveles', detalle: 'Botón «…» de 24 × 24 · reemplaza los niveles intermedios desde 5 · abre la lista con ellos', lado: 'arriba' },
  { selector: '.uki-breadcrumbs__nivel:nth-child(3) .uki-breadcrumbs__item', nombre: 'Enlace', detalle: 'Label · breadcrumb/link subrayado · Hover breadcrumb/link-hover · foco de 2 px', lado: 'abajo' },
  { selector: '[aria-current="page"]', nombre: 'Actual', detalle: 'Label · breadcrumb/current · sin subrayado · no es enlace · aria-current="page"', lado: 'arriba' },
];

const TIPOS = [
  { tipo: '2 niveles', cuando: 'Página de una sección', ejemplo: 'Inicio › Trámites', pantalla: 'Escritorio y tableta', nota: 'La ruta más corta' },
  { tipo: '3 niveles', cuando: 'Lista dentro de una sección', ejemplo: 'Inicio › Trámites › Solicitudes', pantalla: 'Escritorio y tableta', nota: 'La más común' },
  { tipo: '4 niveles', cuando: 'Página de detalle', ejemplo: 'Inicio › Trámites › Solicitudes › Detalle', pantalla: 'Escritorio y tableta', nota: 'Ruta completa a la vista' },
  { tipo: 'Collapsed', cuando: '5 niveles o más', ejemplo: 'Inicio › … › Solicitudes › Detalle', pantalla: 'Escritorio y tableta', nota: 'Primero, «…» y los dos últimos' },
  { tipo: 'Mobile', cuando: 'Cualquier profundidad', ejemplo: '‹ Solicitudes', pantalla: 'Menos de 768 px', nota: 'Un enlace a la página padre' },
];

@Component({
  selector: 'demo-breadcrumbs',
  imports: [UkiBreadcrumbs, DocAnatomia, DocToken, DemoEjemplo, DemoIcono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Breadcrumbs</h1>
          <p class="doc-descripcion">
            La ruta de navegación es una navegación secundaria: muestra el camino desde «Inicio» hasta la página actual, para
            que la persona sepa dónde está y pueda subir de nivel sin usar el botón de regresar.
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsalo para</h3>
            <p>Páginas de dos o más niveles, como una solicitud dentro de la lista de trámites. No la uses en Inicio ni en páginas de un nivel. Va debajo del Header y arriba del título.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>El último es la página</h3>
            <p>La página actual cierra la ruta. Es texto, no enlace, y tiene el mismo nombre que el título de la página.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Nombres cortos</h3>
            <p>Usa los mismos nombres cortos que el menú (1 a 3 palabras). Desde 5 niveles, los intermedios se agrupan en «…»; en teléfonos queda un enlace para volver.</p>
          </article>
        </div>
        <demo-ejemplo titulo="Ruta de 4 niveles" nombre="ruta" [html]="codigo.basico" [ts]="codigo.ts">
          <uki-breadcrumbs [items]="rutas.cuatro" data-prueba="ruta-4" />
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-moleculas">
        <header class="doc-encabezado">
          <h2 id="t-moleculas" class="doc-titulo">Moléculas</h2>
          <p class="doc-descripcion">
            Tres partes pequeñas forman la ruta: el elemento (enlace o página actual), el separador (chevron decorativo) y el
            botón «…» para los niveles ocultos.
          </p>
        </header>
        <div class="doc-visual estados uki-breadcrumbs" aria-hidden="true">
          <figure>
            <span class="uki-breadcrumbs__item"><span>Trámites</span></span>
            <figcaption>Default</figcaption>
          </figure>
          <figure>
            <span class="uki-breadcrumbs__item forzar-hover"><span>Trámites</span></span>
            <figcaption>Hover</figcaption>
          </figure>
          <figure>
            <span class="uki-breadcrumbs__item forzar-foco"><span>Trámites</span></span>
            <figcaption>Focus</figcaption>
          </figure>
          <figure>
            <span class="uki-breadcrumbs__item uki-breadcrumbs__item--actual"><span>Trámites</span></span>
            <figcaption>Current</figcaption>
          </figure>
          <figure>
            <span class="separador"><demo-icono nombre="flecha-der" /></span>
            <figcaption>Separador</figcaption>
          </figure>
          <figure>
            <span class="uki-breadcrumbs__mas mas-fijo">…</span>
            <figcaption>Más niveles</figcaption>
          </figure>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-organismos">
        <header class="doc-encabezado">
          <h2 id="t-organismos" class="doc-titulo">Organismos</h2>
          <p class="doc-descripcion">
            La ruta une las partes según la profundidad: 2, 3 o 4 niveles, Collapsed desde 5 niveles (prueba el botón «…») y
            Mobile en pantallas de menos de 768 px.
          </p>
        </header>
        <demo-ejemplo titulo="Tipos de ruta" nombre="tipos" [html]="codigo.tipos">
          <div class="organismos">
            <uki-breadcrumbs [items]="rutas.dos" />
            <uki-breadcrumbs [items]="rutas.tres" />
            <uki-breadcrumbs [items]="rutas.cuatro" />
            <uki-breadcrumbs [items]="rutas.colapsada" data-prueba="ruta-colapsada" />
            <p class="movil-fijo uki-breadcrumbs" aria-hidden="true">
              <span class="uki-breadcrumbs__item"><demo-icono nombre="flecha-izq" /><span>Solicitudes</span></span>
              <small>Mobile (vista fija; en menos de 768 px la ruta real se ve así)</small>
            </p>
          </div>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">
            Cinco partes forman la ruta. Los colores vienen de los tokens breadcrumb, así que siguen los temas guinda y verde.
          </p>
        </header>
        <demo-anatomia [partes]="partes" [escala]="1.5">
          <uki-breadcrumbs [items]="rutas.colapsada" />
        </demo-anatomia>
      </section>

      <section class="doc-seccion" aria-labelledby="t-tipos">
        <header class="doc-encabezado">
          <h2 id="t-tipos" class="doc-titulo">Tipos</h2>
          <p class="doc-descripcion">Elige el tipo según la profundidad de la página y el tamaño de la pantalla. El componente lo decide solo.</p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Tipos de ruta</caption>
            <thead>
              <tr>
                <th scope="col">Tipo</th>
                <th scope="col">Ejemplo</th>
                <th scope="col">Pantalla</th>
                <th scope="col">Nota</th>
              </tr>
            </thead>
            <tbody>
              @for (t of tipos; track t.tipo) {
                <tr>
                  <th scope="row">{{ t.tipo }}<small>{{ t.cuando }}</small></th>
                  <td>{{ t.ejemplo }}</td>
                  <td>{{ t.pantalla }}</td>
                  <td>{{ t.nota }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-tokens">
        <header class="doc-encabezado">
          <h2 id="t-tokens" class="doc-titulo">Tokens por estado</h2>
          <p class="doc-descripcion">
            Los enlaces siempre van subrayados para no depender solo del color. El foco usa border/brand en lugar de
            button/focus-ring, que no llega a 3:1 sobre blanco.
          </p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Tokens de Breadcrumbs</caption>
            <thead>
              <tr>
                <th scope="col">Estado</th>
                <th scope="col">Texto</th>
                <th scope="col">Foco</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Default<small>Enlace subrayado</small></th>
                <td><demo-token nombre="breadcrumb/link" nota="Label" /></td>
                <td>—</td>
              </tr>
              <tr>
                <th scope="row">Hover</th>
                <td><demo-token nombre="breadcrumb/link-hover" /></td>
                <td>—</td>
              </tr>
              <tr>
                <th scope="row">Focus</th>
                <td><demo-token nombre="breadcrumb/link" /></td>
                <td><demo-token nombre="border/brand" nota="borde 2 px" /></td>
              </tr>
              <tr>
                <th scope="row">Current<small>Sin subrayado</small></th>
                <td><demo-token nombre="breadcrumb/current" /></td>
                <td>—</td>
              </tr>
              <tr>
                <th scope="row">Separador</th>
                <td><demo-token nombre="breadcrumb/separator" /></td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: `
    .estados {
      gap: var(--spacing-32);
    }
    figure {
      display: grid;
      justify-items: center;
      gap: var(--spacing-8);
      margin: 0;
    }
    figcaption {
      color: var(--text-secondary);
      font-size: var(--font-size-caption);
      font-weight: var(--font-weight-regular);
    }
    .forzar-hover {
      color: var(--breadcrumb-link-hover);
    }
    .forzar-foco {
      outline: 2px solid var(--border-brand);
    }
    .separador {
      display: inline-flex;
      width: 16px;
      height: 16px;
      color: var(--breadcrumb-separator);
    }
    .mas-fijo {
      font-weight: var(--font-weight-bold);
    }
    .organismos {
      display: grid;
      gap: var(--spacing-16);
      width: 100%;
    }
    .movil-fijo {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-8);
      margin: 0;
    }
    .movil-fijo demo-icono {
      width: 16px;
      height: 16px;
    }
    .movil-fijo small {
      color: var(--text-secondary);
      font-size: var(--font-size-caption);
      font-weight: var(--font-weight-regular);
    }
  `,
})
export default class BreadcrumbsPagina {
  protected readonly rutas = RUTAS;
  protected readonly partes = PARTES;
  protected readonly tipos = TIPOS;
  protected readonly codigo = {
    basico: `<uki-breadcrumbs [items]="[
  { label: 'Inicio', link: '/' },
  { label: 'Trámites', link: '/tramites' },
  { label: 'Solicitudes', link: '/tramites/solicitudes' },
  { label: 'SOL-2026-0148' }
]" />`,
    ts: `import { UkiBreadcrumbs, UkiBreadcrumbItem } from '@banobras/uki';

// El último nivel es la página actual: no lleva link.
// Con href en lugar de link se aceptan enlaces que no son del router.
protected readonly ruta: UkiBreadcrumbItem[] = [
  { label: 'Inicio', link: '/' },
  { label: 'Trámites', link: ['/tramites'] },
  { label: 'SOL-2026-0148' },
];`,
    tipos: `<!-- Desde 5 niveles se colapsan los intermedios en «…». -->
<uki-breadcrumbs [items]="[
  { label: 'Inicio', link: '/' },
  { label: 'Programas', link: '/programas' },
  { label: 'FONADIN', link: '/programas/fonadin' },
  { label: 'Trámites', link: '/programas/fonadin/tramites' },
  { label: 'Solicitudes', link: '/programas/fonadin/tramites/solicitudes' },
  { label: 'SOL-2026-0148' }
]" />`,
  };
}
