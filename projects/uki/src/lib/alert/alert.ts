import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  ViewEncapsulation,
} from '@angular/core';
import { ICONO_FEEDBACK, UkiFeedbackType } from '../feedback';
import { UkiIcono } from '../iconos/icono';

/** Elementos que pueden recibir el foco con Tab. */
const ENFOCABLES =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/**
 * Mensaje de UKI dentro de la página (página Alert), junto al contenido del que habla. El mensaje es el contenido, así
 * que puede llevar negritas y enlaces.
 *
 * ```html
 * <uki-alert type="success">Guardamos tu solicitud con el folio FON-2026-0142.</uki-alert>
 * <uki-alert type="error" dismissible [(open)]="hayError">No pudimos enviar la solicitud.</uki-alert>
 * ```
 *
 * Error lleva `role="alert"` (interrumpe al lector de pantalla); Success, Info y Warning llevan `role="status"`. Solo se
 * anuncian si el Alert aparece después de cargar la página, por ejemplo con `@if`.
 */
@Component({
  selector: 'uki-alert',
  imports: [UkiIcono],
  template: `
    @if (icon()) {
      <uki-icono class="uki-alert__icon" [nombre]="icono()" />
    }
    <div class="uki-alert__message"><ng-content /></div>
    @if (dismissible()) {
      <button type="button" class="uki-alert__close" aria-label="Cerrar aviso" (click)="close()">
        <uki-icono nombre="x" />
      </button>
    }
  `,
  styleUrl: './alert.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'uki-alert',
    '[class.uki-alert--success]': 'type() === "success"',
    '[class.uki-alert--info]': 'type() === "info"',
    '[class.uki-alert--warning]': 'type() === "warning"',
    '[class.uki-alert--error]': 'type() === "error"',
    '[attr.role]': 'type() === "error" ? "alert" : "status"',
    '[attr.hidden]': 'open() ? null : ""',
  },
})
export class UkiAlert {
  /** Intención del mensaje. Cada tipo tiene su color y su ícono. */
  readonly type = input<UkiFeedbackType>('success');
  /** Ícono de estado a la izquierda (Leading Icon en Figma). */
  readonly icon = input(true, { transform: booleanAttribute });
  /** Botón «Cerrar aviso» a la derecha (Trailing Icon en Figma). Al cerrarlo, `open` pasa a `false`. */
  readonly dismissible = input(false, { transform: booleanAttribute });
  /** Visible u oculto. Con `[(open)]` el sistema se entera de que la persona lo cerró. */
  readonly open = model(true);

  private readonly host: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;
  protected readonly icono = computed(() => ICONO_FEEDBACK[this.type()]);

  /** Oculta el aviso. Si el foco estaba dentro, lo lleva al siguiente elemento enfocable para que no se pierda. */
  close(): void {
    if (this.host.contains(this.host.ownerDocument.activeElement)) {
      this.siguienteEnfocable()?.focus();
    }
    this.open.set(false);
  }

  private siguienteEnfocable(): HTMLElement | undefined {
    const todos = Array.from(this.host.ownerDocument.querySelectorAll<HTMLElement>(ENFOCABLES));
    return todos.find(
      (el) =>
        !this.host.contains(el) &&
        this.host.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING &&
        !el.closest('[hidden], [inert]'),
    );
  }
}
