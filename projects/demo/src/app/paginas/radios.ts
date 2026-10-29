import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoEjemplo } from '../doc/ejemplo';
import { coleccion, cssVar } from '../doc/tokens';

const USOS: Record<string, string> = {
  'radius-0': 'Tablas y divisores',
  'radius-4': 'Checkbox',
  'radius-8': 'Botones',
  'radius-12': 'Campos y menús',
  'radius-16': 'Tarjetas',
  'radius-24': 'Modales y contenedores grandes',
  'radius-full': 'Píldoras, avatares y áreas táctiles',
};

@Component({
  selector: 'demo-radios',
  imports: [DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-radios">
        <header class="doc-encabezado">
          <h1 id="t-radios" class="doc-titulo">Radios</h1>
          <p class="doc-descripcion">
            Siete pasos, de 0 a Full (80 px). El paso grande es de 24 px porque la escala no tiene 20.
          </p>
        </header>
        <div class="doc-tarjetas">
          @for (r of radios; track r.css) {
            <article class="doc-tarjeta">
              <div class="doc-visual"><span class="forma" [style.border-radius]="'var(' + r.css + ')'"></span></div>
              <h3>{{ r.valor }}</h3>
              <p>{{ r.uso }}</p>
              <p class="doc-tokens doc-mono">{{ r.css }}</p>
            </article>
          }
        </div>
        <demo-ejemplo titulo="Radios con tokens" nombre="superficies" [css]="ejemplo" fondo="pagina">
          <span class="ej ej--tarjeta">Tarjeta · radius-16</span>
          <span class="ej ej--pildora">Píldora · radius-full</span>
        </demo-ejemplo>
      </section>
    </div>
  `,
  styles: `
    .doc-visual {
      justify-content: center;
    }
    .ej {
      padding: var(--spacing-16) var(--spacing-24);
      border: 1px solid var(--border-low-contrast);
      background: var(--background-surface);
      font-size: var(--font-size-body-sm);
    }
    .ej--tarjeta {
      border-radius: var(--radius-16);
    }
    .ej--pildora {
      padding: var(--spacing-4) var(--spacing-16);
      border-radius: var(--radius-full);
    }
    .forma {
      width: 96px;
      height: 96px;
      border: 2px solid var(--border-brand);
      background: var(--button-tint);
    }
  `,
})
export default class Radios {
  protected readonly ejemplo = `.tarjeta {
  border-radius: var(--radius-16);
}

.pildora {
  border-radius: var(--radius-full);
}`;
  protected readonly radios = coleccion('Radius').vars.map((v) => ({
    css: cssVar(v.nombre),
    valor: v.valores[0] === '0' ? '0 px' : `${v.valores[0]} px`,
    uso: USOS[v.nombre] ?? '',
  }));
}
