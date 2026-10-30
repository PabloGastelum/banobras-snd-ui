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
  | 'x'
  | 'house'
  | 'chevron-right'
  | 'chevron-left'
  | 'eye'
  | 'pencil'
  | 'trash'
  | 'arrow-counterclockwise'
  | 'chat'
  | 'arrow-up'
  | 'arrow-down'
  | 'arrows-vertical'
  | 'dots'
  | 'chevron-up'
  | 'file-earmark-text'
  | 'journal-text'
  | 'folder'
  | 'people'
  | 'gear'
  | 'globe'
  | 'box-arrow-right'
  | 'list';

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
        @case ('house') {
          <path d="M3.5 8.75 10 3.5l6.5 5.25v7.25a1 1 0 0 1-1 1h-3.25v-4.75h-4.5V17H4.5a1 1 0 0 1-1-1Z" />
        }
        @case ('chevron-right') {
          <path d="m7.5 5 5 5-5 5" />
        }
        @case ('chevron-left') {
          <path d="m12.5 5-5 5 5 5" />
        }
        @case ('eye') {
          <path d="M1.75 10S4.75 4.5 10 4.5 18.25 10 18.25 10 15.25 15.5 10 15.5 1.75 10 1.75 10Z" />
          <circle cx="10" cy="10" r="2.5" />
        }
        @case ('pencil') {
          <path d="M13.25 3.75a1.77 1.77 0 0 1 2.5 2.5L6.5 15.5l-3.25 1.25L4.5 13.5Z" />
          <path d="m11.75 5.25 3 3" />
        }
        @case ('trash') {
          <path d="M3.5 5.5h13M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M5 5.5l.75 10.6a1 1 0 0 0 1 .9h6.5a1 1 0 0 0 1-.9L15 5.5" />
          <path d="M8.5 9v5M11.5 9v5" />
        }
        @case ('arrow-counterclockwise') {
          <path d="M3.75 10a6.25 6.25 0 1 0 1.83-4.42L3.5 7.5" />
          <path d="M3.5 3.5v4h4" />
        }
        @case ('chat') {
          <path d="M3.5 4h13a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8.25L4.5 17v-3h-1a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
        }
        @case ('arrow-up') {
          <path d="M10 16V4M5 9l5-5 5 5" />
        }
        @case ('arrow-down') {
          <path d="M10 4v12m-5-5 5 5 5-5" />
        }
        @case ('arrows-vertical') {
          <path d="m6.5 7.5 3.5-3.5 3.5 3.5M6.5 12.5l3.5 3.5 3.5-3.5" />
        }
        @case ('dots') {
          <path d="M4.5 10h.01M10 10h.01M15.5 10h.01" stroke-width="2.25" />
        }
        @case ('chevron-up') {
          <path d="m5 12.5 5-5 5 5" />
        }
        @case ('file-earmark-text') {
          <path d="M11.5 2.5H5.5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-10Z" />
          <path d="M11.5 2.5v4h4M7.5 10.5h5M7.5 13.5h5" />
        }
        @case ('journal-text') {
          <path d="M5.5 2.5h9a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1Z" />
          <path d="M3 6h3M3 10h3M3 14h3M8.5 7h4.5M8.5 10h4.5M8.5 13h3" />
        }
        @case ('folder') {
          <path d="M2.5 5.5a1 1 0 0 1 1-1h4l1.75 2h7.25a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1Z" />
        }
        @case ('people') {
          <circle cx="7.5" cy="7" r="2.75" />
          <path d="M2.5 16.25c0-2.75 2.25-4.5 5-4.5s5 1.75 5 4.5" />
          <path d="M12.5 4.5a2.5 2.5 0 0 1 0 5M14.25 11.9c1.9.45 3.25 1.95 3.25 4.35" />
        }
        @case ('gear') {
          <circle cx="10" cy="10" r="2.5" />
          <path
            d="M8.6 2.5h2.8l.45 2.1 1.5.85 2.05-.65 1.4 2.4-1.6 1.45v1.7l1.6 1.45-1.4 2.4-2.05-.65-1.5.85-.45 2.1H8.6l-.45-2.1-1.5-.85-2.05.65-1.4-2.4 1.6-1.45v-1.7L3.2 7.2l1.4-2.4 2.05.65 1.5-.85Z"
          />
        }
        @case ('globe') {
          <circle cx="10" cy="10" r="7.5" />
          <path d="M2.5 10h15M10 2.5c2 2.1 3 4.6 3 7.5s-1 5.4-3 7.5c-2-2.1-3-4.6-3-7.5s1-5.4 3-7.5Z" />
        }
        @case ('box-arrow-right') {
          <path d="M12 6.5V4.5a1 1 0 0 0-1-1H4.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1H11a1 1 0 0 0 1-1v-2" />
          <path d="M8 10h9.5M14.5 7l3 3-3 3" />
        }
        @case ('list') {
          <path d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13" />
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
