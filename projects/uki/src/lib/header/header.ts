import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Barra superior de UKI (página Header) para portales transaccionales y paneles de administración. Va junto a la
 * Sidebar, mide 60 px de alto (lo mismo que su barra de marca) y alinea su contenido a la derecha. Se aplica sobre el
 * `<header>` nativo, que da la región `banner`.
 *
 * ```html
 * <header ukiHeader>
 *   <uki-user-menu name="Mariana López" userRole="Administradora" (signOut)="salir()" />
 * </header>
 * ```
 */
@Component({
  // Selector de atributo en camelCase, como ukiButton: conserva el elemento nativo.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'header[ukiHeader]',
  template: `<ng-content />`,
  styleUrl: './header.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'uki-header' },
})
export class UkiHeader {}
