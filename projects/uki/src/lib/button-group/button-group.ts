import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Grupo de botones de UKI (Button › Button group). En escritorio alinea a la derecha con el Primary al final;
 * por debajo de 768 px apila a todo lo ancho con el Primary arriba.
 *
 * ```html
 * <div ukiButtonGroup>
 *   <button ukiButton variant="ghost" type="button">Cancelar</button>
 *   <button ukiButton variant="secondary" type="button">Guardar borrador</button>
 *   <button ukiButton type="submit">Continuar</button>
 * </div>
 * ```
 */
@Component({
  // Selector de atributo en camelCase, como las directivas: conserva el elemento nativo.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[ukiButtonGroup]',
  template: '<ng-content />',
  styleUrl: './button-group.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'uki-button-group' },
})
export class UkiButtonGroup {}
