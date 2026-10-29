import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoEjemplo } from '../doc/ejemplo';
import { coleccion, cssVar } from '../doc/tokens';

const ESPACIADOS = coleccion('Spacing').vars.map((v) => ({ css: cssVar(v.nombre), valor: Number(v.valores[0]) }));

@Component({
  selector: 'demo-espaciado',
  imports: [DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-espaciado">
        <header class="doc-encabezado">
          <h1 id="t-espaciado" class="doc-titulo">Espaciado</h1>
          <p class="doc-descripcion">
            {{ espaciados.length }} pasos sobre una base de 4 px, de 0 a 160. Los tokens llevan el valor en el nombre para que
            diseño y código hablen igual: <code>--spacing-24</code> son 24 px en Figma y en CSS.
          </p>
        </header>
        <div class="doc-tarjetas usos">
          <article class="doc-tarjeta">
            <h3>Dentro de componentes</h3>
            <p>Del 2 al 24: separación entre ícono y texto, rellenos de botones y campos.</p>
            <p class="doc-tokens doc-mono">Button: --spacing-8 entre ícono y texto, --spacing-24 de relleno</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Entre componentes</h3>
            <p>Del 12 al 48: grupos de botones, campos de un formulario, tarjetas.</p>
            <p class="doc-tokens doc-mono">Button group: --spacing-16 en escritorio, --spacing-12 en móvil</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Entre secciones</h3>
            <p>Del 64 al 160: márgenes de página y separación entre bloques grandes.</p>
            <p class="doc-tokens doc-mono">Retícula web: --spacing-80 de margen en escritorio</p>
          </article>
        </div>
        <demo-ejemplo titulo="Espaciado con tokens" nombre="ficha" [css]="ejemplo" fondo="pagina">
          <div class="ficha">
            <p class="ficha__titulo">Expediente 2026-0142</p>
            <p class="ficha__texto">Relleno spacing-24 y separación interna spacing-8.</p>
          </div>
        </demo-ejemplo>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Escala completa</caption>
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Valor</th>
                <th scope="col">Muestra</th>
              </tr>
            </thead>
            <tbody>
              @for (e of espaciados; track e.css) {
                <tr>
                  <th scope="row"><code>{{ e.css }}</code></th>
                  <td>{{ e.valor }} px</td>
                  <td><span class="barra" [style.width]="'var(' + e.css + ')'"></span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: `
    .barra {
      display: block;
      height: 16px;
      min-width: 1px;
      border-radius: 2px;
      background: var(--brand-secondary);
    }
    td {
      vertical-align: middle !important;
    }
    .ficha {
      display: grid;
      gap: var(--spacing-8);
      padding: var(--spacing-24);
      border-radius: var(--radius-16);
      background: var(--background-surface);
      box-shadow: var(--elevation-raised);
    }
    .ficha p {
      margin: 0;
    }
    .ficha__titulo {
      font-weight: var(--font-weight-semibold);
    }
    .ficha__texto {
      font-size: var(--font-size-body-sm);
      color: var(--text-secondary);
    }
  `,
})
export default class Espaciado {
  protected readonly espaciados = ESPACIADOS;
  protected readonly ejemplo = `.ficha {
  display: grid;
  gap: var(--spacing-8);
  padding: var(--spacing-24);
  border-radius: var(--radius-16);
  background: var(--background-surface);
  box-shadow: var(--elevation-raised);
}`;
}
