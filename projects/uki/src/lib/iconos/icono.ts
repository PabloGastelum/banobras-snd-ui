import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

export type UkiNombreIcono = 'search' | 'chevron-down' | 'check' | 'close';

/**
 * Íconos internos de la librería, con el trazo «Linear» de UKI (1.5 px, puntas redondeadas). Siempre decorativos:
 * el control que los contiene lleva el nombre accesible. No forma parte de la API pública.
 */
@Component({
  selector: 'uki-icono',
  template: `
    <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
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
}
