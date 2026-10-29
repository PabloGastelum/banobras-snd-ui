import { AfterContentInit, Directive, ElementRef, inject, signal } from '@angular/core';
import { NgControl } from '@angular/forms';
import { idUnico, SeguidorDeControl } from './estado-control';

/**
 * Control nativo de UKI: `<input ukiInput>` o `<textarea ukiInput>` dentro de `<uki-field>` (página Fields: _Input y
 * _Textarea box). Conserva todos los atributos nativos; `formControlName` y `ngModel` se usan directo sobre él.
 *
 * ```html
 * <uki-field label="Correo electrónico" required>
 *   <input ukiInput type="email" autocomplete="email" formControlName="correo" />
 * </uki-field>
 * ```
 */
@Directive({
  selector: 'input[ukiInput], textarea[ukiInput]',
  host: {
    class: 'uki-input',
    '[class.uki-input--textarea]': 'esTextarea',
    '[attr.id]': 'id',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': 'invalido() ? "true" : null',
    '[attr.aria-required]': 'requerido() ? "true" : null',
    '(input)': 'seguidor.refrescar()',
    '(blur)': 'seguidor.refrescar()',
  },
})
export class UkiInput implements AfterContentInit {
  private readonly elemento: HTMLInputElement | HTMLTextAreaElement = inject(ElementRef).nativeElement;
  protected readonly esTextarea = this.elemento.tagName === 'TEXTAREA';
  /** Respeta un `id` puesto por el sistema; si no hay, se genera uno. */
  readonly id = this.elemento.id || idUnico('uki-campo');
  readonly seguidor = new SeguidorDeControl(inject(NgControl, { self: true, optional: true }), () => this.elemento.value);

  /** Los fija `uki-field`. */
  readonly describedBy = signal<string | null>(null);
  readonly invalido = signal(false);
  readonly requerido = signal(false);

  get deshabilitado(): boolean {
    return this.elemento.disabled;
  }

  get requeridoNativo(): boolean {
    return this.elemento.required;
  }

  ngAfterContentInit(): void {
    this.seguidor.conectar();
  }
}
