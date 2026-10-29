import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Casilla de verificación de UKI (página Checkbox). Envuelve un `<input type="checkbox">` nativo y funciona con
 * formularios reactivos, `ngModel` o `[(checked)]`.
 *
 * ```html
 * <uki-checkbox formControlName="aceptaTerminos">Acepto los términos</uki-checkbox>
 * <uki-checkbox [(checked)]="todas" [indeterminate]="algunas()" ariaLabel="Seleccionar todas las filas" />
 * ```
 */
@Component({
  selector: 'uki-checkbox',
  template: `
    <label class="uki-checkbox__control">
      <span class="uki-checkbox__target">
        <input
          class="uki-checkbox__input"
          type="checkbox"
          [checked]="checked()"
          [indeterminate]="indeterminate()"
          [disabled]="isDisabled()"
          [attr.name]="name()"
          [attr.aria-label]="ariaLabel()"
          (change)="alCambiar($event)"
          (blur)="alTocar()"
        />
        @if (indeterminate()) {
          <svg class="uki-checkbox__icon" viewBox="0 0 16 16" focusable="false" aria-hidden="true">
            <path d="M3 8h10" />
          </svg>
        } @else if (checked()) {
          <svg class="uki-checkbox__icon" viewBox="0 0 16 16" focusable="false" aria-hidden="true">
            <path d="M3 8.4 6.4 11.8 13 4.4" />
          </svg>
        }
      </span>
      <span class="uki-checkbox__label"><ng-content /></span>
    </label>
  `,
  styleUrl: './checkbox.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UkiCheckbox), multi: true }],
  host: {
    class: 'uki-checkbox',
    '[class.uki-checkbox--disabled]': 'isDisabled()',
  },
})
export class UkiCheckbox implements ControlValueAccessor {
  /** Valor marcado. Admite `[(checked)]`. */
  readonly checked = model(false);
  /** Estado mixto para una casilla padre (por ejemplo «seleccionar todas»). Se apaga cuando la persona hace clic. */
  readonly indeterminate = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Nombre accesible cuando no hay etiqueta visible (filas de tabla). */
  readonly ariaLabel = input<string | null>(null);
  readonly name = input<string | null>(null);

  private readonly deshabilitadoPorFormulario = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.deshabilitadoPorFormulario());

  private notificarCambio: (valor: boolean) => void = () => undefined;
  private notificarToque: () => void = () => undefined;

  writeValue(valor: unknown): void {
    this.checked.set(valor === true);
  }

  registerOnChange(fn: (valor: boolean) => void): void {
    this.notificarCambio = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.notificarToque = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitadoPorFormulario.set(deshabilitado);
  }

  protected alCambiar(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).checked;
    this.indeterminate.set(false);
    this.checked.set(valor);
    this.notificarCambio(valor);
  }

  protected alTocar(): void {
    this.notificarToque();
  }
}
