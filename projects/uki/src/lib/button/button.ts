import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  isDevMode,
  ViewEncapsulation,
} from '@angular/core';
import { UkiSpinner } from '../spinner/spinner';

export type UkiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type UkiButtonSize = 'default' | 'large';

/**
 * Botón de UKI (página Button). Se aplica sobre un `<button>` o un `<a>` nativo para conservar su semántica.
 *
 * ```html
 * <button ukiButton type="submit" [loading]="guardando()">Guardar</button>
 * <button ukiButton variant="secondary" size="large">Cancelar</button>
 * <a ukiButton variant="ghost" routerLink="/aviso">Aviso de privacidad</a>
 * ```
 *
 * Los íconos se proyectan con los atributos `ukiButtonLeading` y `ukiButtonTrailing` (24 px, heredan el color del texto).
 */
@Component({
  // Selector de atributo en camelCase, como las directivas: conserva el elemento nativo.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[ukiButton], a[ukiButton]',
  imports: [UkiSpinner],
  template: `
    <ng-content select="[ukiButtonLeading]" />
    <span class="uki-button__label"><ng-content /></span>
    <ng-content select="[ukiButtonTrailing]" />
    @if (isLoading()) {
      <uki-spinner class="uki-button__spinner" decorative />
    }
  `,
  styleUrl: './button.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'uki-button',
    '[class.uki-button--primary]': 'variant() === "primary"',
    '[class.uki-button--secondary]': 'variant() === "secondary"',
    '[class.uki-button--ghost]': 'variant() === "ghost"',
    '[class.uki-button--danger]': 'variant() === "danger"',
    '[class.uki-button--large]': 'size() === "large"',
    '[class.uki-button--loading]': 'isLoading()',
    '[class.uki-button--disabled]': 'disabled()',
    '[attr.disabled]': 'isNativeButton && disabled() ? "" : null',
    '[attr.aria-disabled]': '(!isNativeButton && disabled()) || isLoading() ? "true" : null',
    '[attr.tabindex]': '!isNativeButton && disabled() ? "-1" : null',
    '[attr.aria-busy]': 'isLoading() ? "true" : null',
  },
})
export class UkiButton {
  /** Peso de la acción. Solo un `primary` por sección. */
  readonly variant = input<UkiButtonVariant>('primary');
  /** `default` mide 48 px de alto y `large` 64 px. */
  readonly size = input<UkiButtonSize>('default');
  /** Muestra el spinner en lugar del texto e ignora los clics sin perder el foco. No aplica a `ghost`. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Ni clic ni foco. En `<a>` se marca con `aria-disabled` y se cancela la navegación. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly host: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;
  protected readonly isNativeButton = this.host.tagName === 'BUTTON';
  protected readonly isLoading = computed(() => this.loading() && this.variant() !== 'ghost' && !this.disabled());

  constructor() {
    // En fase de captura sobre el propio elemento corre antes que los (click) del consumidor y que routerLink.
    const bloquear = (evento: Event) => {
      if (this.isLoading() || (!this.isNativeButton && this.disabled())) {
        evento.preventDefault();
        evento.stopImmediatePropagation();
      }
    };
    this.host.addEventListener('click', bloquear, { capture: true });
    inject(DestroyRef).onDestroy(() => this.host.removeEventListener('click', bloquear, { capture: true }));

    if (isDevMode()) {
      effect(() => {
        if (this.loading() && this.variant() === 'ghost') {
          console.warn('[ukiButton] La variante ghost no tiene estado loading en UKI; se ignora.');
        }
      });
    }
  }
}
