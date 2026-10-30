import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { UkiAvatar } from '../avatar/avatar';
import { UkiCapa } from '../capa/capa';
import { UkiIcono } from '../iconos/icono';

let siguienteId = 0;

type Destino = 'primera' | 'ultima' | null;

/**
 * Menú de usuario del Header de UKI (moléculas User button, User menu y Menu item). El botón muestra el Avatar de la
 * persona y abre un menú con su nombre, su rol y «Cerrar sesión», que siempre va al final.
 *
 * ```html
 * <uki-user-menu name="Mariana López Hernández" userRole="Administradora" [avatarSrc]="foto" (signOut)="salir()">
 *   <a ukiUserMenuItem routerLink="/perfil">Mi perfil</a>
 * </uki-user-menu>
 * ```
 *
 * Sigue el patrón de botón de menú de WAI-ARIA: Enter, Espacio o ↓ abren en la primera opción y ↑ en la última; las
 * flechas, Inicio y Fin se mueven; Esc cierra y devuelve el foco al botón, y Tab cierra. «Cerrar sesión» solo emite
 * `signOut`: el sistema decide qué hacer.
 */
@Component({
  selector: 'uki-user-menu',
  imports: [UkiAvatar, UkiIcono],
  template: `
    <button
      #boton
      type="button"
      class="uki-user-menu__boton"
      [id]="idBoton"
      aria-haspopup="menu"
      [attr.aria-expanded]="abierto()"
      [attr.aria-controls]="idMenu"
      (click)="alternar()"
    >
      <span class="uki-user-menu__oculto">{{ ariaLabel() }}</span>
      <uki-avatar [name]="name()" [src]="avatarSrc()" size="sm" status decorative />
      <uki-icono class="uki-user-menu__chevron" [nombre]="abierto() ? 'chevron-up' : 'chevron-down'" />
    </button>
    <div #panel class="uki-user-menu__panel" [hidden]="!abierto()">
      <div class="uki-user-menu__perfil">
        <uki-avatar [name]="name()" [src]="avatarSrc()" size="md" status decorative />
        <div class="uki-user-menu__datos">
          <p class="uki-user-menu__nombre">{{ name() }}</p>
          @if (userRole()) {
            <p class="uki-user-menu__rol">{{ userRole() }}</p>
          }
        </div>
      </div>
      <hr class="uki-user-menu__separador" />
      <div #menu role="menu" class="uki-user-menu__opciones" [id]="idMenu" [attr.aria-labelledby]="idBoton">
        <ng-content />
        <button type="button" role="menuitem" tabindex="-1" class="uki-user-menu__opcion" (click)="cerrarSesion()">
          <uki-icono class="uki-user-menu__icono" nombre="box-arrow-right" />
          <span>{{ signOutLabel() }}</span>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['../capa/capa.css', './user-menu.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'uki-user-menu',
    '(keydown)': 'alTeclear($event)',
    '(focusout)': 'alSalirFoco($event)',
    '(document:click)': 'alClicFuera($event)',
  },
})
export class UkiUserMenu {
  /** Nombre de la persona que inició sesión. Va en el menú y da las iniciales del Avatar sin foto. */
  readonly name = input.required<string>();
  /** Rol o cargo, debajo del nombre (Figma: Role; `role` chocaría con el atributo ARIA del elemento). */
  readonly userRole = input<string>();
  /** Foto de la persona (Avatar). */
  readonly avatarSrc = input<string | null | undefined>(null);
  /** Nombre accesible del botón (texto oculto a la vista: el Avatar es decorativo). */
  readonly ariaLabel = input('Menú de usuario');
  /** Texto de la última opción. */
  readonly signOutLabel = input('Cerrar sesión');
  /** La persona eligió «Cerrar sesión». El componente no cierra la sesión. */
  readonly signOut = output<void>();

  protected readonly idBoton = `uki-user-menu-boton-${++siguienteId}`;
  protected readonly idMenu = `uki-user-menu-${siguienteId}`;
  protected readonly abierto = signal(false);

  private readonly anfitrion: HTMLElement = inject(ElementRef).nativeElement;
  private readonly boton = viewChild.required<ElementRef<HTMLButtonElement>>('boton');
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly menu = viewChild.required<ElementRef<HTMLElement>>('menu');
  private capa?: UkiCapa;
  private destino: Destino = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.capa?.cerrar());
    afterRenderEffect(() => {
      if (!this.abierto()) {
        this.capa?.cerrar();
        this.capa = undefined;
        return;
      }
      if (!this.capa) {
        this.capa = new UkiCapa(this.panel().nativeElement, this.boton().nativeElement, { alinear: 'fin', separacion: 4 });
        this.capa.abrir();
      }
      const opciones = this.opciones();
      const destino = this.destino === 'ultima' ? opciones.at(-1) : this.destino === 'primera' ? opciones[0] : null;
      this.destino = null;
      destino?.focus();
    });
  }

  /** Cierra el menú. Lo usan Esc, las opciones y el clic fuera; también sirve desde el código. */
  cerrar(devolverFoco = false): void {
    if (!this.abierto()) return;
    this.abierto.set(false);
    if (devolverFoco) this.boton().nativeElement.focus();
  }

  protected alternar(): void {
    if (this.abierto()) {
      this.cerrar();
    } else {
      this.abrir('primera');
    }
  }

  protected cerrarSesion(): void {
    this.cerrar(true);
    this.signOut.emit();
  }

  protected alTeclear(evento: KeyboardEvent): void {
    const destino = evento.target as Node;
    if (destino === this.boton().nativeElement) {
      this.alTeclearBoton(evento);
    } else if (this.menu().nativeElement.contains(destino)) {
      this.alTeclearMenu(evento);
    }
  }

  protected alClicFuera(evento: MouseEvent): void {
    const destino = evento.target as Node | null;
    if (this.abierto() && destino && !this.anfitrion.contains(destino)) this.cerrar();
  }

  protected alSalirFoco(evento: FocusEvent): void {
    const destino = evento.relatedTarget as Node | null;
    if (this.abierto() && destino && !this.anfitrion.contains(destino)) this.cerrar();
  }

  private abrir(destino: Destino): void {
    this.destino = destino;
    if (this.abierto()) {
      // Ya abierto: solo mueve el foco.
      const opciones = this.opciones();
      (destino === 'ultima' ? opciones.at(-1) : opciones[0])?.focus();
      this.destino = null;
      return;
    }
    this.abierto.set(true);
  }

  private alTeclearBoton(evento: KeyboardEvent): void {
    const teclas: Record<string, Destino> = { Enter: 'primera', ' ': 'primera', ArrowDown: 'primera', ArrowUp: 'ultima' };
    if (!(evento.key in teclas)) return;
    evento.preventDefault();
    this.abrir(teclas[evento.key]);
  }

  private alTeclearMenu(evento: KeyboardEvent): void {
    const opciones = this.opciones();
    const actual = opciones.indexOf(evento.target as HTMLElement);
    const mover = (i: number) => {
      evento.preventDefault();
      opciones[(i + opciones.length) % opciones.length]?.focus();
    };
    switch (evento.key) {
      case 'ArrowDown':
        return mover(actual + 1);
      case 'ArrowUp':
        return mover(actual - 1);
      case 'Home':
        return mover(0);
      case 'End':
        return mover(opciones.length - 1);
      case 'Escape':
        // Esc solo cierra el menú: no debe llegar a un modal que contenga el Header.
        evento.preventDefault();
        evento.stopPropagation();
        return this.cerrar(true);
      case 'Tab':
        return this.cerrar();
    }
  }

  private opciones(): HTMLElement[] {
    return [...this.menu().nativeElement.querySelectorAll<HTMLElement>('[role="menuitem"]')];
  }
}

/**
 * Opción propia del menú de usuario, antes de «Cerrar sesión». Se aplica sobre un `<button>` o un `<a>`; al elegirla,
 * el menú se cierra.
 */
@Directive({
  selector: '[ukiUserMenuItem]',
  host: {
    class: 'uki-user-menu__opcion',
    role: 'menuitem',
    tabindex: '-1',
    '(click)': 'elegir()',
  },
})
export class UkiUserMenuItem {
  private readonly menu = inject(UkiUserMenu);

  protected elegir(): void {
    this.menu.cerrar(true);
  }
}
