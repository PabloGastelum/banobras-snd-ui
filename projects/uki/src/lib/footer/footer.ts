import { ChangeDetectionStrategy, Component, input, numberAttribute, ViewEncapsulation } from '@angular/core';

/**
 * Pie de página de UKI (página Footer). Cierra cada página con el aviso de derechos de BANOBRAS en un estilo discreto.
 * Se aplica sobre el `<footer>` nativo, que da la región `contentinfo`.
 *
 * ```html
 * <footer ukiFooter></footer>
 * <footer ukiFooter [year]="2026">Todos los derechos reservados. <a routerLink="/aviso">Aviso de privacidad</a></footer>
 * ```
 *
 * «© año BANOBRAS.» va siempre al inicio, en SemiBold. El contenido proyectado reemplaza a «Todos los derechos
 * reservados».
 */
@Component({
  // Selector de atributo en camelCase, como ukiButton: conserva el elemento nativo.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'footer[ukiFooter]',
  template: `
    <p class="uki-footer__texto">
      <strong class="uki-footer__marca">© {{ year() }} BANOBRAS.</strong>&ngsp;<ng-content>Todos los derechos reservados</ng-content>
    </p>
  `,
  styleUrl: './footer.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'uki-footer' },
})
export class UkiFooter {
  /** Año del aviso. Por omisión, el año en curso. */
  readonly year = input(new Date().getFullYear(), { transform: numberAttribute });
}
