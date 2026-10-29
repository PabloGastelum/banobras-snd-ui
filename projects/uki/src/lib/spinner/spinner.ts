import { booleanAttribute, ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

export type UkiSpinnerSize = 24 | 36 | 48;

/** Punto de la figura: centro en un círculo de radio 8 dentro de un cuadro de 24 (Spinner › Anatomy). */
interface Punto {
  cx: number;
  cy: number;
  opacity: number;
}

/**
 * Doce puntos, uno cada 30°. El punto activo (12 en punto) va al 100 % y la estela, en sentido contrario al giro,
 * baja de 90 % a 5 % en pasos iguales.
 */
const PUNTOS: readonly Punto[] = Array.from({ length: 12 }, (_, i) => {
  const angulo = (i * 30 * Math.PI) / 180;
  const atras = (12 - i) % 12;
  return {
    cx: +(12 + 8 * Math.sin(angulo)).toFixed(3),
    cy: +(12 - 8 * Math.cos(angulo)).toFixed(3),
    opacity: atras === 0 ? 1 : +(0.9 - ((atras - 1) * 0.85) / 10).toFixed(3),
  };
});

/**
 * Indicador de carga de UKI (página Spinner).
 *
 * ```html
 * <uki-spinner size="36" label="Cargando resultados" />
 * ```
 */
@Component({
  selector: 'uki-spinner',
  template: `
    <svg class="uki-spinner__figure" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      @for (punto of puntos; track $index) {
        <circle [attr.cx]="punto.cx" [attr.cy]="punto.cy" r="1.8" [attr.opacity]="punto.opacity" />
      }
    </svg>
  `,
  styleUrl: './spinner.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'uki-spinner',
    '[class.uki-spinner--36]': 'size() == 36',
    '[class.uki-spinner--48]': 'size() == 48',
    '[attr.role]': 'decorative() ? null : "status"',
    '[attr.aria-label]': 'decorative() ? null : label()',
    '[attr.aria-hidden]': 'decorative() ? "true" : null',
  },
})
export class UkiSpinner {
  /** Lado en píxeles: 24 (por omisión), 36 o 48. */
  readonly size = input<UkiSpinnerSize, UkiSpinnerSize | `${UkiSpinnerSize}`>(24, {
    transform: (valor) => Number(valor) as UkiSpinnerSize,
  });
  /** Texto que anuncian los lectores de pantalla. */
  readonly label = input('Cargando');
  /** Oculta el spinner a lectores de pantalla cuando otro elemento ya anuncia la espera (por ejemplo, un botón con `aria-busy`). */
  readonly decorative = input(false, { transform: booleanAttribute });

  protected readonly puntos = PUNTOS;
}
