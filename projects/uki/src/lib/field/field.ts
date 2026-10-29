import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  input,
  numberAttribute,
  ViewEncapsulation,
} from '@angular/core';
import { idUnico } from './estado-control';
import { UkiInput } from './input';

/**
 * Campo de UKI (página Fields: Text field y Text area). Dibuja la etiqueta, la ayuda o el error y el contador alrededor
 * de un control nativo con `ukiInput`, y une todo con `id`, `aria-describedby`, `aria-invalid` y `aria-required`.
 *
 * ```html
 * <uki-field label="Correo electrónico" required helper="Te enviaremos el acuse." error="Escribe un correo válido.">
 *   <input ukiInput type="email" formControlName="correo" />
 * </uki-field>
 *
 * <uki-field label="Motivo" [maxlength]="500" error="Usa máximo 500 caracteres.">
 *   <textarea ukiInput formControlName="motivo"></textarea>
 * </uki-field>
 * ```
 */
@Component({
  selector: 'uki-field',
  template: `
    <label class="uki-field__label" [attr.for]="control()?.id">
      <span>{{ label() }}</span>
      @if (esRequerido()) {
        <span class="uki-field__asterisco" aria-hidden="true">*</span>
      }
      <span aria-hidden="true">:</span>
    </label>
    <ng-content />
    @if (mostrarPie()) {
      <div class="uki-field__pie">
        @if (errorVisible()) {
          <p class="uki-field__mensaje uki-field__mensaje--error" [id]="idMensaje">{{ error() }}</p>
        } @else if (helper()) {
          <p class="uki-field__mensaje" [id]="idMensaje">{{ helper() }}</p>
        }
        @if (maxlength()) {
          <p class="uki-field__contador" [class.uki-field__contador--excedido]="excedido()" [id]="idContador">
            {{ longitud() }}/{{ maxlength() }}
          </p>
        }
      </div>
    }
  `,
  styleUrl: './field.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'uki-field',
    '[class.uki-field--deshabilitado]': 'deshabilitado()',
  },
})
export class UkiField {
  /** Texto de la etiqueta, siempre visible. El asterisco y los dos puntos se agregan solos. */
  readonly label = input.required<string>();
  /** Marca el campo como obligatorio. También se detecta `Validators.required` o el atributo `required` del control. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Ayuda debajo del campo. */
  readonly helper = input<string>();
  /** Mensaje de error: explica cómo corregir. Se muestra cuando el control es inválido y ya se tocó o se envió. */
  readonly error = input<string>();
  /** Muestra el contador «n/máximo». Es un límite flexible: el error lo marca el validador del formulario. */
  readonly maxlength = input(undefined, { transform: (v: unknown) => (v == null || v === '' ? undefined : numberAttribute(v)) });

  protected readonly control = contentChild(UkiInput);
  protected readonly idMensaje = idUnico('uki-campo-mensaje');
  protected readonly idContador = idUnico('uki-campo-contador');

  private readonly estado = computed(() => this.control()?.seguidor.estado());

  protected readonly esRequerido = computed(
    () => this.required() || !!this.estado()?.requerido || !!this.control()?.requeridoNativo,
  );
  protected readonly longitud = computed(() => this.estado()?.longitud ?? 0);
  protected readonly excedido = computed(() => !!this.maxlength() && this.longitud() > this.maxlength()!);
  protected readonly deshabilitado = computed(() => !!this.estado()?.deshabilitado || !!this.control()?.deshabilitado);

  protected readonly errorVisible = computed(() => {
    if (!this.error()) return false;
    const control = this.control();
    if (!control?.seguidor.tieneControl()) return true;
    const estado = this.estado()!;
    // Al pasar el límite del contador el error aparece de inmediato, como pide Figma; los demás, al salir o al enviar.
    return estado.invalido && (estado.tocado || estado.enviado || this.excedido());
  });

  protected readonly mostrarPie = computed(() => this.errorVisible() || !!this.helper() || !!this.maxlength());

  constructor() {
    // El campo decide los atributos ARIA del control proyectado.
    effect(() => {
      const control = this.control();
      if (!control) return;
      const ids = [this.errorVisible() || this.helper() ? this.idMensaje : null, this.maxlength() ? this.idContador : null];
      control.describedBy.set(ids.filter(Boolean).join(' ') || null);
      control.invalido.set(this.errorVisible() || this.excedido());
      control.requerido.set(this.esRequerido());
    });
  }
}
