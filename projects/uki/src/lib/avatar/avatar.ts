import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  isDevMode,
  linkedSignal,
  ViewEncapsulation,
} from '@angular/core';

export type UkiAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Palabras que no dan inicial: «María de la Luz Pérez» → «ML». */
const PARTICULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y']);

/** Dos iniciales con las dos primeras palabras del nombre que no son partículas. */
export function inicialesDe(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .filter((palabra) => palabra && !PARTICULAS.has(palabra.toLocaleLowerCase('es-MX')))
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toLocaleUpperCase('es-MX'))
    .join('');
}

/**
 * Avatar de UKI (página Avatar): la foto de una persona en un círculo. Sin foto, o si la imagen no carga, muestra sus
 * iniciales sobre brand/primary.
 *
 * ```html
 * <uki-avatar name="Mariana López Hernández" src="/fotos/mlopez.jpg" size="lg" status />
 * <uki-avatar name="Mariana López Hernández" decorative />
 * ```
 *
 * El nombre accesible es `name` (más «, en línea» con `status`). Usa `decorative` cuando el nombre ya está escrito al
 * lado, para que no se lea dos veces.
 */
@Component({
  selector: 'uki-avatar',
  template: `
    @if (mostrarFoto()) {
      <img class="uki-avatar__image" [src]="src()" alt="" (error)="fallo.set(true)" />
    } @else {
      <span class="uki-avatar__initials" aria-hidden="true">{{ textoIniciales() }}</span>
    }
    @if (status()) {
      <span class="uki-avatar__status" aria-hidden="true"></span>
    }
  `,
  styleUrl: './avatar.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'uki-avatar',
    '[class.uki-avatar--xs]': 'size() === "xs"',
    '[class.uki-avatar--sm]': 'size() === "sm"',
    '[class.uki-avatar--lg]': 'size() === "lg"',
    '[class.uki-avatar--xl]': 'size() === "xl"',
    '[class.uki-avatar--initials]': '!mostrarFoto()',
    '[attr.role]': 'decorative() ? null : "img"',
    '[attr.aria-label]': 'decorative() ? null : etiqueta()',
    '[attr.aria-hidden]': 'decorative() ? "true" : null',
  },
})
export class UkiAvatar {
  /** Nombre de la persona. Es el nombre accesible y la fuente de las iniciales. */
  readonly name = input('');
  /** Foto cuadrada con la cara al centro; se recorta en círculo. */
  readonly src = input<string | null | undefined>(null);
  /** xs 24 · sm 32 · md 40 (por omisión) · lg 48 · xl 56 px. */
  readonly size = input<UkiAvatarSize>('md');
  /** Punto verde de «en línea». Úsalo solo si el sistema sabe que la persona tiene sesión. */
  readonly status = input(false, { transform: booleanAttribute });
  /** Oculta el avatar a lectores de pantalla cuando el nombre ya está escrito al lado. */
  readonly decorative = input(false, { transform: booleanAttribute });
  /** Iniciales fijas, si las calculadas no sirven. */
  readonly initials = input<string>();

  /** La imagen falló al cargar; se reinicia cuando cambia `src`. */
  protected readonly fallo = linkedSignal({ source: this.src, computation: () => false });
  protected readonly mostrarFoto = computed(() => !!this.src() && !this.fallo());
  protected readonly textoIniciales = computed(() => (this.initials() ?? inicialesDe(this.name())).slice(0, 2));
  protected readonly etiqueta = computed(() => (this.status() ? `${this.name()}, en línea` : this.name()));

  constructor() {
    if (isDevMode()) {
      effect(() => {
        if (!this.decorative() && !this.name().trim()) {
          console.warn('[uki-avatar] Falta name: el avatar no tiene nombre accesible. Usa decorative si el nombre ya está al lado.');
        }
      });
    }
  }
}
