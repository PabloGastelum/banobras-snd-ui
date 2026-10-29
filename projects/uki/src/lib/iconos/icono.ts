import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

export type UkiNombreIcono =
  | 'search'
  | 'chevron-down'
  | 'check'
  | 'close'
  | 'check-circle'
  | 'info-circle'
  | 'exclamation-triangle'
  | 'x-circle'
  | 'x';

/** Íconos dibujados en un cuadro de 24 (Alert y Toast); los demás usan el cuadro de 20 de los campos. */
const CUADRO_24: ReadonlySet<UkiNombreIcono> = new Set(['check-circle', 'info-circle', 'exclamation-triangle', 'x-circle', 'x']);

/**
 * Íconos internos de la librería, con el trazo «Linear» de UKI (1.5 px, puntas redondeadas). Siempre decorativos:
 * el control que los contiene lleva el nombre accesible. No forma parte de la API pública.
 */
@Component({
  selector: 'uki-icono',
  template: `
    <svg [attr.viewBox]="cuadro()" focusable="false" aria-hidden="true">
      @switch (nombre()) {
        @case ('search') {
          <circle cx="8.75" cy="8.75" r="5.25" />
          <path d="m12.75 12.75 3.75 3.75" />
        }
        @case ('chevron-down') {
          <path d="m5 7.5 5 5 5-5" />
        }
        @case ('check') {
          <path d="m4.5 10.5 3.5 3.5 7.5-7.5" />
        }
        @case ('close') {
          <path d="m5.5 5.5 9 9M14.5 5.5l-9 9" />
        }
        @case ('check-circle') {
          <circle cx="12" cy="12" r="9.25" />
          <path d="m8.25 12.25 2.5 2.5 5-5.25" />
        }
        @case ('info-circle') {
          <circle cx="12" cy="12" r="9.25" />
          <path d="M12 11v5.25M12 7.75h.01" />
        }
        @case ('exclamation-triangle') {
          <path d="M10.3 4.9 2.85 17.3a2 2 0 0 0 1.7 3h14.9a2 2 0 0 0 1.7-3L13.7 4.9a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9.5v4.25M12 16.75h.01" />
        }
        @case ('x-circle') {
          <circle cx="12" cy="12" r="9.25" />
          <path d="m9.25 9.25 5.5 5.5m0-5.5-5.5 5.5" />
        }
        @case ('x') {
          <path d="m6.5 6.5 11 11m0-11-11 11" />
        }
      }
    </svg>
  `,
  styles: `
    .uki-icono {
      display: inline-flex;
      flex: none;
      width: 20px;
      height: 20px;
    }
    .uki-icono svg {
      width: 100%;
      height: 100%;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'uki-icono', 'aria-hidden': 'true' },
})
export class UkiIcono {
  readonly nombre = input.required<UkiNombreIcono>();
  protected readonly cuadro = computed(() => (CUADRO_24.has(this.nombre()) ? '0 0 24 24' : '0 0 20 20'));
}
