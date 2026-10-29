import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { UkiFeedbackType } from '../feedback';

/**
 * Etiqueta de estado de UKI (página Badge). Es de solo lectura: informa, no dispara acciones. Siempre lleva punto y
 * texto para que el estado no dependa solo del color.
 *
 * ```html
 * <uki-badge type="success">Aprobada</uki-badge>
 * <uki-badge type="warning">En revisión</uki-badge>
 * ```
 */
@Component({
  selector: 'uki-badge',
  template: `<span class="uki-badge__dot" aria-hidden="true"></span><span class="uki-badge__label"><ng-content /></span>`,
  styleUrl: './badge.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'uki-badge',
    '[class.uki-badge--success]': 'type() === "success"',
    '[class.uki-badge--info]': 'type() === "info"',
    '[class.uki-badge--warning]': 'type() === "warning"',
    '[class.uki-badge--error]': 'type() === "error"',
  },
})
export class UkiBadge {
  /** Significado del estado. Usa la misma etiqueta para el mismo estado en todo el sistema. */
  readonly type = input<UkiFeedbackType>('success');
}
