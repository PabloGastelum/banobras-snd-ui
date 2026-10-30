import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { UkiLogoGobmx } from '../marca/logo';

/**
 * Panel de marca de la pantalla de acceso (página Hero): fondo `brand/primary` con un patrón decorativo, el logotipo
 * del Gobierno de México y la ilustración La Patria. Va junto a `uki-auth` en escritorio y se oculta debajo de
 * 1280 px. Es decorativo: solo el logotipo tiene nombre accesible.
 *
 * ```html
 * <uki-hero illustrationSrc="/assets/la-patria.webp" />
 * ```
 *
 * La Patria es una imagen oficial que no se puede editar: el sistema la sirve desde sus assets hasta que la librería
 * la incluya (preguntas abiertas 1 y 2 de la entrega 5).
 */
@Component({
  selector: 'uki-hero',
  imports: [UkiLogoGobmx],
  template: `
    <span class="uki-hero__patron" aria-hidden="true"></span>
    <uki-logo-gobmx class="uki-hero__logo" theme="white" [clearSpace]="false" />
    @if (illustrationSrc()) {
      <img class="uki-hero__ilustracion" [src]="illustrationSrc()" alt="" width="600" height="743" />
    }
  `,
  styleUrl: './hero.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'uki-hero' },
})
export class UkiHero {
  /** Ruta de la ilustración La Patria (600 × 743, abajo a la derecha). Es decorativa (`alt=""`). */
  readonly illustrationSrc = input<string | null | undefined>(null);
}
