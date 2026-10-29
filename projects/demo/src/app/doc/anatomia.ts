import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

export interface Parte {
  /** Selector CSS del elemento dentro del lienzo al que apunta el marcador. */
  selector: string;
  nombre: string;
  detalle: string;
  /** El marcador va arriba o abajo del elemento. */
  lado: 'arriba' | 'abajo';
  /** Por omisión apunta al centro; `inicio` apunta cerca del borde izquierdo (útil para el contenedor). */
  alinear?: 'centro' | 'inicio';
}

interface Marcador {
  n: number;
  x: number;
  y: number;
  largo: number;
  lado: 'arriba' | 'abajo';
}

/**
 * Bloque «Anatomy» de Figma: el componente real ampliado en un lienzo, con marcadores numerados que apuntan a cada
 * parte, y la lista de partes a la derecha. Las posiciones se miden en el navegador.
 */
@Component({
  selector: 'demo-anatomia',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tarjeta lienzo-tarjeta">
      <div class="lienzo" #lienzo>
        <div class="ampliado" aria-hidden="true" inert [style.transform]="'scale(' + escala() + ')'"><ng-content /></div>
        @for (m of marcadores(); track m.n) {
          <span
            class="linea"
            [style.left.px]="m.x"
            [style.top.px]="m.lado === 'arriba' ? m.y - m.largo : m.y"
            [style.height.px]="m.largo"
          ></span>
          <span class="marcador" [style.left.px]="m.x" [style.top.px]="m.lado === 'arriba' ? m.y - m.largo : m.y + m.largo">{{
            m.n
          }}</span>
        }
      </div>
    </div>
    <div class="tarjeta partes">
      <h3>Partes</h3>
      <ol>
        @for (parte of partes(); track parte.nombre; let i = $index) {
          <li>
            <span class="numero" aria-hidden="true">{{ i + 1 }}</span>
            <span>
              <strong>{{ parte.nombre }}</strong>
              <span class="detalle">{{ parte.detalle }}</span>
            </span>
          </li>
        }
      </ol>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: minmax(0, 5fr) minmax(0, 3fr);
      gap: var(--spacing-16);
    }
    @media (max-width: 1023.98px) {
      :host {
        grid-template-columns: minmax(0, 1fr);
      }
    }
    .tarjeta {
      padding: var(--spacing-24);
      border-radius: var(--radius-16);
      background: var(--neutral-300);
    }
    .lienzo {
      position: relative;
      display: grid;
      place-items: center;
      min-height: 360px;
      overflow: hidden;
      border-radius: var(--radius-12);
      background: var(--background-surface);
    }
    .ampliado {
      pointer-events: none;
    }
    .linea {
      position: absolute;
      width: 1px;
      background: var(--brand-secondary);
    }
    .marcador {
      position: absolute;
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      margin-left: -12px;
      margin-top: -12px;
      border-radius: var(--radius-full);
      background: var(--brand-secondary);
      color: var(--text-inverse);
      font-size: var(--font-size-caption);
      font-weight: var(--font-weight-semibold);
    }
    h3 {
      margin: 0 0 var(--spacing-16);
      font-size: 1.5rem;
      font-weight: var(--font-weight-medium);
    }
    ol {
      display: grid;
      gap: var(--spacing-16);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: flex;
      gap: var(--spacing-12);
    }
    .numero {
      display: grid;
      flex: none;
      place-items: center;
      width: 24px;
      height: 24px;
      border-radius: var(--radius-full);
      background: var(--brand-secondary);
      color: var(--text-inverse);
      font-size: var(--font-size-caption);
      font-weight: var(--font-weight-semibold);
    }
    strong {
      display: block;
      font-size: var(--font-size-body-sm);
    }
    .detalle {
      display: block;
      font-size: var(--font-size-caption);
      line-height: 1.5;
      color: var(--text-secondary);
    }
  `,
})
export class DocAnatomia {
  readonly partes = input.required<Parte[]>();
  /** Cuánto se amplía el componente; los campos anchos usan menos para caber en el lienzo. */
  readonly escala = input(2);
  protected readonly marcadores = signal<Marcador[]>([]);
  private readonly lienzo = viewChild.required<ElementRef<HTMLElement>>('lienzo');

  constructor() {
    const destruir = inject(DestroyRef);
    afterNextRender(() => {
      const lienzo = this.lienzo().nativeElement;
      const medir = () => {
        const base = lienzo.getBoundingClientRect();
        const largo = Math.max(32, base.height / 2 - 72);
        this.marcadores.set(
          this.partes().flatMap((parte, i) => {
            const el = lienzo.querySelector(parte.selector);
            if (!el) return [];
            const r = el.getBoundingClientRect();
            const y = (parte.lado === 'arriba' ? r.top : r.bottom) - base.top;
            // La línea se acorta si hace falta para que el número quede dentro del lienzo.
            const espacio = parte.lado === 'arriba' ? y - 20 : base.height - y - 20;
            return [
              {
                n: i + 1,
                x: (parte.alinear === 'inicio' ? r.left + 6 : r.left + r.width / 2) - base.left,
                y,
                largo: Math.max(12, Math.min(largo, espacio)),
                lado: parte.lado,
              },
            ];
          }),
        );
      };
      // Espera a que carguen las fuentes para medir el ancho final del texto.
      void document.fonts.ready.then(medir);
      const observador = new ResizeObserver(medir);
      observador.observe(lienzo);
      destruir.onDestroy(() => observador.disconnect());
    });
  }
}
