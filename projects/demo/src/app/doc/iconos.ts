import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type NombreIcono = 'codigo' | 'copiar' | 'listo' | 'error' | 'externo' | 'flecha-izq' | 'flecha-der' | 'menu' | 'cerrar' | 'abajo' | 'arriba' | 'salir';

/** Íconos de la documentación: SVG de 20 px, trazo de 1.5 px, siempre decorativos (el control lleva el nombre). */
@Component({
  selector: 'demo-icono',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', class: 'demo-icono' },
  template: `
    <svg viewBox="0 0 20 20" focusable="false">
      @switch (nombre()) {
        @case ('codigo') {
          <path d="M7 6 3 10l4 4M13 6l4 4-4 4M11.2 4.5l-2.4 11" />
        }
        @case ('copiar') {
          <rect x="7" y="7" width="9.5" height="9.5" rx="2" />
          <path d="M13 7V5.5a2 2 0 0 0-2-2H5.5a2 2 0 0 0-2 2V11a2 2 0 0 0 2 2H7" />
        }
        @case ('listo') {
          <path d="m4 10.5 3.8 3.8L16 6" />
        }
        @case ('error') {
          <path d="M10 6v5M10 14h.01M10 2.8 17.6 16H2.4Z" />
        }
        @case ('externo') {
          <path d="M8 4H5a1.5 1.5 0 0 0-1.5 1.5v9.5A1.5 1.5 0 0 0 5 16.5h9.5A1.5 1.5 0 0 0 16 15v-3M11 3.5h5.5V9M16.5 3.5 9 11" />
        }
        @case ('flecha-izq') {
          <path d="M12 4.5 6.5 10l5.5 5.5" />
        }
        @case ('flecha-der') {
          <path d="M8 4.5 13.5 10 8 15.5" />
        }
        @case ('menu') {
          <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />
        }
        @case ('cerrar') {
          <path d="m5 5 10 10M15 5 5 15" />
        }
        @case ('abajo') {
          <path d="m5 7.5 5 5 5-5" />
        }
        @case ('arriba') {
          <path d="m5 12.5 5-5 5 5" />
        }
        @case ('salir') {
          <path d="M12 6.5V4.5a1 1 0 0 0-1-1H4.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1H11a1 1 0 0 0 1-1v-2M8 10h9.5M14.5 7l3 3-3 3" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      width: 20px;
      height: 20px;
    }
    svg {
      width: 100%;
      height: 100%;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
})
export class DemoIcono {
  readonly nombre = input.required<NombreIcono>();
}
