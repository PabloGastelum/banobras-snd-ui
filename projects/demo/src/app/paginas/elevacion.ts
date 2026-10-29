import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoEjemplo } from '../doc/ejemplo';
import { elevacion } from '../doc/tokens';

const USOS: Record<string, string> = {
  raised: 'Tarjetas y superficies sobre el fondo de la página.',
  overlay: 'Menús desplegables, listas de opciones y tooltips.',
  floating: 'Elementos que flotan sobre el contenido, como avisos (toast).',
  modal: 'Diálogos modales, siempre sobre el scrim.',
};

@Component({
  selector: 'demo-elevacion',
  imports: [DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-elevacion">
        <header class="doc-encabezado">
          <h1 id="t-elevacion" class="doc-titulo">Elevación</h1>
          <p class="doc-descripcion">
            Cuatro sombras hechas con dos capas neutras (key al {{ opacidad['shadow-key'] }} % y ambient al
            {{ opacidad['shadow-ambient'] }} % de {{ color }}), más un scrim al {{ opacidad.scrim }} % para los modales.
          </p>
        </header>
        <div class="doc-tarjetas">
          @for (e of estilos; track e.nombre) {
            <article class="doc-tarjeta">
              <div class="doc-visual fondo"><span class="superficie" [style.box-shadow]="'var(--elevation-' + e.nombre + ')'"></span></div>
              <h3>{{ e.nombre }}</h3>
              <p>{{ e.uso }}</p>
              <p class="doc-tokens doc-mono">--elevation-{{ e.nombre }}</p>
            </article>
          }
          <article class="doc-tarjeta">
            <div class="doc-visual scrim"><span class="superficie superficie--modal"></span></div>
            <h3>scrim</h3>
            <p>Capa que oscurece la página detrás de un modal.</p>
            <p class="doc-tokens doc-mono">--elevation-scrim</p>
          </article>
        </div>
        <demo-ejemplo titulo="Menú desplegable" nombre="menu" [css]="ejemplo" fondo="pagina">
          <ul class="menu-ejemplo" aria-label="Ejemplo de menú">
            <li>Editar</li>
            <li>Duplicar</li>
            <li>Descargar PDF</li>
          </ul>
        </demo-ejemplo>
      </section>
    </div>
  `,
  styles: `
    .doc-visual {
      justify-content: center;
      min-height: 160px;
    }
    .fondo {
      background: var(--background-page);
    }
    .scrim {
      background: linear-gradient(var(--elevation-scrim), var(--elevation-scrim)), var(--background-page);
    }
    .superficie--modal {
      box-shadow: var(--elevation-modal);
    }
    .menu-ejemplo {
      min-width: 200px;
      margin: 0;
      padding: var(--spacing-8) 0;
      border-radius: var(--radius-12);
      background: var(--background-surface);
      box-shadow: var(--elevation-overlay);
      list-style: none;
    }
    .menu-ejemplo li {
      padding: var(--spacing-8) var(--spacing-16);
      font-size: var(--font-size-body-sm);
    }
    .superficie {
      width: 120px;
      height: 80px;
      border-radius: var(--radius-12);
      background: var(--background-surface);
    }
  `,
})
export default class Elevacion {
  protected readonly ejemplo = `.menu {
  border-radius: var(--radius-12);
  background: var(--background-surface);
  box-shadow: var(--elevation-overlay);
}

.modal-fondo {
  background: var(--elevation-scrim);
}`;
  protected readonly opacidad = elevacion.opacity;
  protected readonly color = elevacion.color;
  protected readonly estilos = Object.keys(elevacion.styles).map((nombre) => ({ nombre, uso: USOS[nombre] }));
}
