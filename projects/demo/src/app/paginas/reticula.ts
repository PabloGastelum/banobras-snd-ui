import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoEjemplo } from '../doc/ejemplo';
import { coleccion } from '../doc/tokens';

const layout = coleccion('Layout');
const valor = (nombre: string, modo: number) => {
  const v = layout.vars.find((x) => x.nombre === nombre)!.valores[modo];
  return v.startsWith('@spacing-') ? Number(v.slice('@spacing-'.length)) : Number(v);
};
const DISPOSITIVOS = layout.modos.map((modo, i) => ({
  modo: ({ Mobile: 'Móvil', Tablet: 'Tableta', Desktop: 'Escritorio' } as Record<string, string>)[modo],
  desde: valor('breakpoint', i),
  columnas: valor('web/columns', i),
  medianil: valor('web/gutter', i),
  margenWeb: valor('web/margin', i),
  margenAdmin: valor('admin/margin', i),
  lateral: valor('admin/sidebar', i),
  superior: valor('admin/topbar', i),
}));

@Component({
  selector: 'demo-reticula',
  imports: [DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-reticula">
        <header class="doc-encabezado">
          <h1 id="t-reticula" class="doc-titulo">Retícula</h1>
          <p class="doc-descripcion">
            Una colección Layout con modos Móvil, Tableta y Escritorio para sitios públicos (web) y herramientas internas (admin).
            El ancho máximo del contenido es de {{ anchoMaximo }} px. Las variables cambian solas con el ancho de pantalla.
          </p>
        </header>
        <div class="doc-tarjetas">
          @for (d of dispositivos; track d.modo) {
            <article class="doc-tarjeta">
              <h3>{{ d.modo }}</h3>
              <p>Desde {{ d.desde }} px</p>
              <div class="columnas doc-muestra-color" aria-hidden="true" [style.gap.px]="d.medianil / 2" [style.padding-inline.px]="d.margenWeb / 2">
                @for (c of rango(d.columnas); track c) {
                  <span></span>
                }
              </div>
              <dl>
                <div><dt>Columnas</dt><dd>{{ d.columnas }}</dd></div>
                <div><dt>Medianil</dt><dd>{{ d.medianil }} px</dd></div>
                <div><dt>Margen web</dt><dd>{{ d.margenWeb }} px</dd></div>
                <div><dt>Margen admin</dt><dd>{{ d.margenAdmin }} px</dd></div>
                <div><dt>Barra lateral admin</dt><dd>{{ d.lateral }} px</dd></div>
                <div><dt>Barra superior admin</dt><dd>{{ d.superior }} px</dd></div>
              </dl>
            </article>
          }
        </div>
        <demo-ejemplo titulo="Contenedor con la retícula web" nombre="contenedor" [css]="ejemplo" fondo="pagina">
          <div class="contenedor-ejemplo">
            @for (c of rango(12); track c) {
              <span>{{ c + 1 }}</span>
            }
          </div>
        </demo-ejemplo>
      </section>
    </div>
  `,
  styles: `
    .columnas {
      display: flex;
      height: 96px;
      margin: var(--spacing-8) 0;
      border-radius: var(--radius-8);
      background: var(--background-surface);
    }
    .columnas span {
      flex: 1;
      background: color-mix(in srgb, var(--button-focus-ring) 45%, transparent);
    }
    dl {
      display: grid;
      gap: var(--spacing-4);
      margin: 0;
      font-size: var(--font-size-caption);
    }
    dl div {
      display: flex;
      justify-content: space-between;
      gap: var(--spacing-8);
      padding-bottom: var(--spacing-4);
      border-bottom: 1px solid var(--border-low-contrast);
    }
    dd {
      margin: 0;
      font-weight: var(--font-weight-semibold);
      font-variant-numeric: tabular-nums;
    }
    .contenedor-ejemplo {
      display: grid;
      flex: 1;
      grid-template-columns: repeat(var(--web-columns), minmax(0, 1fr));
      gap: var(--web-gutter);
    }
    .contenedor-ejemplo span {
      display: grid;
      place-items: center;
      min-height: 64px;
      border-radius: var(--radius-4);
      background: var(--button-tint);
      color: var(--text-brand);
      font-size: var(--font-size-caption);
      font-weight: var(--font-weight-semibold);
    }
    .contenedor-ejemplo span:nth-child(n + 5) {
      display: none;
    }
    @media (min-width: 768px) {
      .contenedor-ejemplo span:nth-child(n + 5) {
        display: grid;
      }
      .contenedor-ejemplo span:nth-child(n + 9) {
        display: none;
      }
    }
    @media (min-width: 1280px) {
      .contenedor-ejemplo span:nth-child(n + 9) {
        display: grid;
      }
    }
  `,
})
export default class Reticula {
  protected readonly dispositivos = DISPOSITIVOS;
  protected readonly anchoMaximo = valor('web/max-width', 0);
  protected readonly rango = (n: number) => Array.from({ length: n }, (_, i) => i);
  protected readonly ejemplo = `.contenedor {
  display: grid;
  grid-template-columns: repeat(var(--web-columns), minmax(0, 1fr));
  gap: var(--web-gutter);
  max-width: var(--web-max-width);
  margin-inline: auto;
  padding-inline: var(--web-margin);
}`;
}
