import { ChangeDetectionStrategy, Component, input, numberAttribute, ViewEncapsulation } from '@angular/core';
import { UkiLogoBanobras } from '../marca/logo';

/**
 * Bloque de inicio de sesión de UKI (página Auth): logotipo de Banobras, título, nombre del sistema, el contenido del
 * sistema (el Alert opcional y su formulario) y el aviso de derechos. Es solo maquetación: no valida, no envía y no
 * autentica; el `<form>`, sus campos y lo que pasa al enviarlo son del sistema.
 *
 * ```html
 * <main>
 *   <uki-auth heading="Inicia sesión en tu cuenta" systemName="Sistema de Administración y Actualización…">
 *     <form [formGroup]="acceso" (ngSubmit)="entrar()">…</form>
 *   </uki-auth>
 * </main>
 * ```
 *
 * Un `<form>` proyectado se acomoda como en Figma: campos separados `spacing-16` y el botón a lo ancho, `spacing-40`
 * debajo. Combínalo con `uki-hero` en escritorio.
 */
@Component({
  selector: 'uki-auth',
  imports: [UkiLogoBanobras],
  template: `
    <div class="uki-auth__marca">
      <uki-logo-banobras class="uki-auth__logo" [clearSpace]="false" />
    </div>
    <div class="uki-auth__cuerpo">
      <div class="uki-auth__encabezado">
        @if (headingLevel() === 2) {
          <h2 class="uki-auth__titulo">{{ heading() }}</h2>
        } @else {
          <h1 class="uki-auth__titulo">{{ heading() }}</h1>
        }
        @if (systemName()) {
          <p class="uki-auth__sistema">{{ systemName() }}</p>
        }
      </div>
      <ng-content />
    </div>
    <p class="uki-auth__pie"><strong>© {{ year() }} BANOBRAS.</strong>&ngsp;Todos los derechos reservados</p>
  `,
  styleUrl: './auth.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'uki-auth' },
})
export class UkiAuth {
  /** Título de la página, por ejemplo «Inicia sesión en tu cuenta». Es el `<h1>`. */
  readonly heading = input.required<string>();
  /** Nivel del título: 1 en la pantalla de acceso; 2 si la página ya tiene su `<h1>` (por ejemplo, la documentación). */
  readonly headingLevel = input<1 | 2>(1);
  /** Nombre completo del sistema, debajo del título. */
  readonly systemName = input<string>();
  /** Año del aviso de derechos. Por omisión, el año en curso. */
  readonly year = input(new Date().getFullYear(), { transform: numberAttribute });
}
