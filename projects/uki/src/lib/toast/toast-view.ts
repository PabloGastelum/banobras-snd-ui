import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { ICONO_FEEDBACK, UkiFeedbackType } from '../feedback';
import { UkiIcono } from '../iconos/icono';

/**
 * El aviso que se ve (Toast › Anatomy): ícono, título, descripción y botón de cerrar. Lo usa la región de avisos; no es
 * región viva ni forma parte de la API pública (los avisos se muestran con `UkiToastService`).
 */
@Component({
  selector: 'uki-toast',
  imports: [UkiIcono],
  template: `
    @if (icon()) {
      <uki-icono class="uki-toast__icon" [nombre]="icono()" />
    }
    <div class="uki-toast__content">
      <p class="uki-toast__title">{{ title() }}</p>
      @if (description()) {
        <p class="uki-toast__description">{{ description() }}</p>
      }
    </div>
    @if (dismissible()) {
      <button type="button" class="uki-toast__close" aria-label="Cerrar aviso" (click)="cerrar.emit()">
        <uki-icono nombre="x" />
      </button>
    }
  `,
  styleUrl: './toast.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'uki-toast',
    '[class.uki-toast--success]': 'type() === "success"',
    '[class.uki-toast--info]': 'type() === "info"',
    '[class.uki-toast--warning]': 'type() === "warning"',
    '[class.uki-toast--error]': 'type() === "error"',
  },
})
export class UkiToastView {
  readonly type = input<UkiFeedbackType>('success');
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly icon = input(true, { transform: booleanAttribute });
  readonly dismissible = input(true, { transform: booleanAttribute });
  readonly cerrar = output<void>();
  protected readonly icono = computed(() => ICONO_FEEDBACK[this.type()]);
}
