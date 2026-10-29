import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UkiSearch } from '@banobras/uki';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';
import { DocToken } from '../doc/token';

const PARTES: Parte[] = [
  { selector: '.uki-search__caja', nombre: 'Contenedor', detalle: 'field/background · 1 px field/border · radius-4 · 40 px (Default) o 48 px (Large)', lado: 'arriba', alinear: 'inicio' },
  { selector: '.uki-search__icono', nombre: 'Ícono de búsqueda', detalle: 'Linear/search · 16 px (Default) o 20 px (Large) · text/secondary', lado: 'abajo' },
  { selector: '.uki-search__input', nombre: 'Valor', detalle: 'Placeholder en field/placeholder, búsqueda en text/primary · Body/Small o Body/Medium', lado: 'arriba' },
  { selector: '.uki-search__borrar', nombre: 'Borrar', detalle: 'Botón × de 24 px (Default) o 32 px (Large) · solo con texto · aria-label «Borrar búsqueda»', lado: 'abajo' },
];

/** Datos de muestra: en los sistemas el filtrado se hace en el servidor. */
const SOLICITUDES = [
  { folio: 'FON-2026-0142', solicitante: 'Ana López Fernández' },
  { folio: 'FON-2026-0143', solicitante: 'Jorge Fernández Ruiz' },
  { folio: 'FON-2026-0150', solicitante: 'María Sánchez Ortiz' },
  { folio: 'FON-2026-0151', solicitante: 'Luis Ortega Díaz' },
  { folio: 'FON-2026-0158', solicitante: 'Paola Ruiz Méndez' },
];

@Component({
  selector: 'demo-search',
  imports: [UkiSearch, ReactiveFormsModule, DocAnatomia, DocToken, DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Search</h1>
          <p class="doc-descripcion">
            La búsqueda filtra el contenido de la pantalla mientras se escribe, para encontrar un registro sin desplazarse.
            Funciona con tablas, listas de tarjetas y paneles de filtros.
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsala para</h3>
            <p>Listas con más de una página de resultados, o cuando se busca algo conocido por nombre, folio o correo.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Di qué busca</h3>
            <p>Escribe los campos en el placeholder, por ejemplo «Buscar por folio o solicitante». Muestra cuántos resultados hay y un estado vacío si no hay ninguno.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Fácil de deshacer</h3>
            <p>El botón × y la tecla Esc borran la búsqueda y muestran todo otra vez. Conserva la búsqueda al cambiar de página u orden.</p>
          </article>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-filtrar">
        <header class="doc-encabezado">
          <h2 id="t-filtrar" class="doc-titulo">Filtrar una lista</h2>
          <p class="doc-descripcion">
            Emite (buscar) 300 ms después de la última tecla, y de inmediato con Enter o al borrar. El número de resultados se
            anuncia a lectores de pantalla. Aquí se filtra en el navegador solo para la demostración; en los sistemas, el
            filtrado va en el servidor.
          </p>
        </header>
        <demo-ejemplo titulo="Búsqueda en una tabla" nombre="busqueda" [html]="codigo.html" [ts]="codigo.ts">
          <div class="busqueda">
            <uki-search
              data-prueba="search"
              placeholder="Buscar por folio o solicitante"
              ariaLabel="Buscar solicitudes"
              [resultados]="filtradas().length"
              (buscar)="consulta.set($event)"
            />
            <p class="uki-body-sm conteo">{{ filtradas().length }} de {{ total }} solicitudes</p>
            <ul class="resultados">
              @for (s of filtradas(); track s.folio) {
                <li><span class="doc-mono">{{ s.folio }}</span> {{ s.solicitante }}</li>
              } @empty {
                <li class="vacio">Ninguna solicitud coincide con «{{ consulta() }}».</li>
              }
            </ul>
          </div>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-tamanos">
        <header class="doc-encabezado">
          <h2 id="t-tamanos" class="doc-titulo">Tamaños y estados</h2>
          <p class="doc-descripcion">Default (40 px) para tablas, listas y filtros; Large (48 px) junto a campos de formulario.</p>
        </header>
        <demo-ejemplo titulo="Default, Large y Disabled" nombre="tamanos" [html]="codigo.tamanos">
          <div class="rejilla">
            <uki-search ariaLabel="Buscar, tamaño default" />
            <uki-search size="large" ariaLabel="Buscar, tamaño large" [formControl]="llena" />
            <uki-search ariaLabel="Buscar, deshabilitado" disabled />
          </div>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">Cuatro partes. Usa los mismos tokens de campo que Text field.</p>
        </header>
        <demo-anatomia [partes]="partes" [escala]="1.4">
          <uki-search class="anatomia-busqueda" ariaLabel="Anatomía de la búsqueda" [formControl]="anatomia" />
        </demo-anatomia>
      </section>

      <section class="doc-seccion" aria-labelledby="t-tokens">
        <header class="doc-encabezado">
          <h2 id="t-tokens" class="doc-titulo">Tokens por estado</h2>
          <p class="doc-descripcion">Los dos tamaños usan los mismos tokens.</p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Tokens de Search</caption>
            <thead>
              <tr>
                <th scope="col">Estado</th>
                <th scope="col">Borde</th>
                <th scope="col">Texto</th>
                <th scope="col">Botón ×</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">Empty<small>Sin búsqueda</small></th><td><demo-token nombre="field/border" nota="1 px" /></td><td><demo-token nombre="field/placeholder" /></td><td>Oculto</td></tr>
              <tr><th scope="row">Hover<small>Puntero encima</small></th><td><demo-token nombre="field/border-hover" nota="1 px" /></td><td><demo-token nombre="field/placeholder" /></td><td>Oculto</td></tr>
              <tr><th scope="row">Focus<small>Escribiendo</small></th><td><demo-token nombre="field/border-focus" nota="2 px" /></td><td><demo-token nombre="text/primary" /></td><td>Visible con texto</td></tr>
              <tr><th scope="row">Filled<small>Búsqueda aplicada</small></th><td><demo-token nombre="field/border" nota="1 px" /></td><td><demo-token nombre="text/primary" /></td><td>Visible</td></tr>
              <tr><th scope="row">Disabled<small>No disponible</small></th><td><demo-token nombre="field/border" nota="1 px" /><demo-token nombre="field/disabled-background" /></td><td><demo-token nombre="text/disabled" /></td><td>Oculto</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: `
    .busqueda {
      display: grid;
      gap: var(--spacing-12);
      width: min(100%, 480px);
    }
    .conteo {
      margin: 0;
      color: var(--text-secondary);
    }
    .resultados {
      display: grid;
      margin: 0;
      padding: 0;
      list-style: none;
      border: 1px solid var(--table-border);
      border-radius: var(--radius-8);
    }
    .resultados li {
      display: flex;
      gap: var(--spacing-12);
      padding: var(--spacing-12) var(--spacing-16);
      border-bottom: 1px solid var(--table-border);
      font-size: var(--font-size-body-sm);
    }
    .resultados li:last-child {
      border-bottom: 0;
    }
    .vacio {
      color: var(--text-secondary);
    }
    .rejilla {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      align-items: center;
      gap: var(--spacing-24);
      width: 100%;
    }
    .anatomia-busqueda {
      width: 240px;
    }
  `,
})
export default class SearchPagina {
  protected readonly partes = PARTES;
  protected readonly total = SOLICITUDES.length;
  protected readonly consulta = signal('');
  protected readonly filtradas = computed(() => {
    const q = this.consulta().trim().toLowerCase();
    return q ? SOLICITUDES.filter((s) => `${s.folio} ${s.solicitante}`.toLowerCase().includes(q)) : SOLICITUDES;
  });
  protected readonly llena = new FormControl('Fernández');
  protected readonly anatomia = new FormControl('Fernández');

  protected readonly codigo = {
    html: `<uki-search placeholder="Buscar por folio o solicitante" ariaLabel="Buscar solicitudes"
            [resultados]="total()" (buscar)="buscar($event)" />`,
    ts: `import { Component, inject, signal } from '@angular/core';
import { UkiSearch } from '@banobras/uki';
import { SolicitudesService } from './solicitudes.service';

@Component({
  selector: 'app-solicitudes',
  imports: [UkiSearch],
  templateUrl: './busqueda.html',
})
export class Solicitudes {
  private readonly solicitudes = inject(SolicitudesService);
  protected readonly total = signal<number | null>(null);

  // (buscar) ya trae la espera de 300 ms: no hace falta debounceTime.
  protected buscar(texto: string): void {
    this.solicitudes.consultar({ texto, pagina: 1 }).subscribe((r) => this.total.set(r.total));
  }
}`,
    tamanos: `<uki-search ariaLabel="Buscar en la tabla" />
<uki-search size="large" ariaLabel="Buscar" />
<uki-search ariaLabel="Buscar" disabled />`,
  };
}
