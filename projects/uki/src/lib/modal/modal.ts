import { DOCUMENT } from '@angular/common';
import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { UkiIcono } from '../iconos/icono';
import { UkiPilaModales } from './modal-pila';

export type UkiModalSize = 'default' | 'small';
export type UkiModalType = 'informative' | 'confirmation';
/** Cómo se cerró: × (`close`), Esc (`escape`), clic en el velo (`backdrop`) o un botón o código (`action`). */
export type UkiModalCloseReason = 'close' | 'escape' | 'backdrop' | 'action';

/** Duración de la animación de salida. */
export const SALIDA_MODAL_MS = 200;

const ENFOCABLES = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]',
  '[contenteditable="true"]',
].join(',');

let siguienteId = 0;

/**
 * Modal de UKI (página Modal). Diálogo centrado sobre un velo oscuro que necesita la atención de la persona antes de
 * seguir. Usa `<dialog>` nativo con `showModal()`: queda encima de todo y lo de atrás es inerte (no se usa ni se lee).
 *
 * ```html
 * <uki-modal [(open)]="confirmar" title="¿Eliminar el trámite?" size="small" type="confirmation">
 *   <p>Se eliminarán todos los elementos del trámite. Esta acción no se puede deshacer.</p>
 *   <div ukiModalFooter>
 *     <button ukiButton variant="secondary" type="button" ukiModalClose>Cancelar</button>
 *     <button ukiButton variant="danger" type="button" (click)="eliminar()">Eliminar</button>
 *   </div>
 * </uki-modal>
 * ```
 *
 * El foco entra al abrir (al elemento con `ukiModalFocus`; si no, a Cancelar en Confirmation y al botón principal en
 * Informative), da la vuelta con Tab y vuelve al disparador al cerrar. Para confirmar desde el código, `UkiDialogService`.
 */
@Component({
  selector: 'uki-modal',
  imports: [UkiIcono],
  template: `
    <!-- El teclado (Tab, Esc) llega por keydown; el clic solo detecta el velo, que no es un control. -->
    <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
    <dialog
      #dialogo
      class="uki-modal"
      aria-modal="true"
      [class.uki-modal--small]="size() === 'small'"
      [class.uki-modal--saliendo]="cerrando()"
      [attr.aria-labelledby]="idTitulo"
      [attr.aria-describedby]="describeBody() ? idCuerpo : null"
      (keydown)="alTeclear($event)"
      (cancel)="alCancelar($event)"
      (close)="alCerrarNativo()"
      (mousedown)="alPresionar($event)"
      (click)="alClic($event)"
    >
      <div class="uki-modal__panel">
        <header class="uki-modal__header">
          <h2 class="uki-modal__title" [id]="idTitulo">{{ title() }}</h2>
          <button type="button" class="uki-modal__close" aria-label="Cerrar" (click)="cerrar('close')">
            <uki-icono nombre="x" />
          </button>
        </header>
        <div class="uki-modal__body" [id]="idCuerpo">
          <ng-content />
        </div>
        <ng-content select="[ukiModalFooter]" />
      </div>
    </dialog>
  `,
  styleUrl: './modal.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'uki-modal-anfitrion' },
})
export class UkiModal {
  /** Dice qué pasa: «¿Eliminar el trámite?». Es el nombre accesible del diálogo. */
  readonly title = input.required<string>();
  /** `default`: 640 px · `small`: 480 px. */
  readonly size = input<UkiModalSize>('default');
  /** Decide el foco inicial: Cancelar en `confirmation`, el botón principal en `informative`. */
  readonly type = input<UkiModalType>('informative');
  /** Abierto o cerrado. Admite `[(open)]`. */
  readonly open = model(false);
  /** Esc cierra el modal. Apágalo solo mientras una acción está en curso. */
  readonly closeOnEsc = input(true, { transform: booleanAttribute });
  /** Un clic en el velo cierra el modal. Apagado por omisión (Figma: nunca en Confirmation). */
  readonly closeOnBackdrop = input(false, { transform: booleanAttribute });
  /** El cuerpo describe el diálogo (`aria-describedby`). Apágalo si el cuerpo es un formulario. */
  readonly describeBody = input(true, { transform: booleanAttribute });
  /** Se emite al terminar de cerrar, con el motivo. */
  readonly closed = output<UkiModalCloseReason>();

  protected readonly idTitulo = `uki-modal-titulo-${++siguienteId}`;
  protected readonly idCuerpo = `uki-modal-cuerpo-${siguienteId}`;
  protected readonly cerrando = signal(false);

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');
  private readonly pila = inject(UkiPilaModales);
  private readonly document = inject(DOCUMENT);
  private previo: HTMLElement | null = null;
  private temporizadorSalida?: ReturnType<typeof setTimeout>;
  private cerrandoNosotros = false;
  private presionEnVelo = false;

  constructor() {
    afterRenderEffect({
      write: () => {
        const abierto = this.open();
        const dialogo = this.dialogo().nativeElement;
        if (abierto && !dialogo.open) this.abrir(dialogo);
        else if (!abierto && dialogo.open) this.cerrar('action');
      },
    });
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.temporizadorSalida);
      const dialogo = this.dialogo().nativeElement;
      if (dialogo.open) {
        this.cerrandoNosotros = true;
        dialogo.close();
        this.devolverFoco();
      }
      this.pila.salir(dialogo);
    });
  }

  /** Cierra con la animación de salida. Lo usan × y `ukiModalClose`; también sirve desde el código. */
  cerrar(motivo: UkiModalCloseReason = 'action'): void {
    const dialogo = this.dialogo().nativeElement;
    if (!dialogo.open || this.cerrando()) return;
    this.cerrando.set(true);
    this.temporizadorSalida = setTimeout(() => this.terminar(motivo), movimientoReducido() ? 0 : SALIDA_MODAL_MS);
  }

  private abrir(dialogo: HTMLDialogElement): void {
    const activo = this.document.activeElement;
    this.previo = activo instanceof HTMLElement && activo !== this.document.body ? activo : null;
    this.pila.entrar(dialogo);
    dialogo.showModal();
    this.enfocarInicial(dialogo);
  }

  private terminar(motivo: UkiModalCloseReason): void {
    const dialogo = this.dialogo().nativeElement;
    this.cerrando.set(false);
    if (dialogo.open) {
      this.cerrandoNosotros = true;
      dialogo.close();
    }
    this.limpiar(motivo);
  }

  private limpiar(motivo: UkiModalCloseReason): void {
    this.pila.salir(this.dialogo().nativeElement);
    this.open.set(false);
    this.devolverFoco();
    this.closed.emit(motivo);
  }

  private devolverFoco(): void {
    const previo = this.previo;
    this.previo = null;
    if (previo?.isConnected) previo.focus();
  }

  /** `ukiModalFocus` → Cancelar (Confirmation) o el principal (Informative) → ×. */
  private enfocarInicial(dialogo: HTMLDialogElement): void {
    const propios = <T extends Element>(lista: Iterable<T>) => [...lista].filter((e) => e.closest('dialog') === dialogo);
    const marcado = propios(dialogo.querySelectorAll<HTMLElement>('[ukiModalFocus]'))[0];
    const pie = propios(dialogo.querySelectorAll<HTMLElement>('[ukiModalFooter]'))[0];
    const botones = pie ? this.enfocables(dialogo, pie) : [];
    const destino =
      marcado ??
      (this.type() === 'confirmation' ? botones[0] : botones.at(-1)) ??
      dialogo.querySelector<HTMLElement>('.uki-modal__close');
    destino?.focus();
  }

  private enfocables(dialogo: HTMLDialogElement, raiz: ParentNode = dialogo): HTMLElement[] {
    return [...raiz.querySelectorAll<HTMLElement>(ENFOCABLES)].filter(
      (e) => e.tabIndex >= 0 && e.closest('dialog') === dialogo && !e.closest('[inert], [hidden]'),
    );
  }

  protected alTeclear(evento: KeyboardEvent): void {
    const dialogo = this.dialogo().nativeElement;
    if (evento.defaultPrevented || this.pila.superior !== dialogo) return;
    if (evento.key === 'Escape') {
      // Se cierra con la animación propia; el cierre nativo se cancela.
      evento.preventDefault();
      evento.stopPropagation();
      if (this.closeOnEsc()) this.cerrar('escape');
      return;
    }
    if (evento.key !== 'Tab') return;
    // showModal() deja salir el foco a la barra del navegador; aquí da la vuelta dentro del modal.
    const lista = this.enfocables(dialogo);
    const primero = lista[0];
    const ultimo = lista.at(-1);
    const activo = this.document.activeElement;
    if (!primero || !ultimo) {
      evento.preventDefault();
    } else if (evento.shiftKey && (activo === primero || activo === dialogo)) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && activo === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  }

  /** Esc sin keydown (por ejemplo, el botón Atrás en Android) llega como `cancel`. */
  protected alCancelar(evento: Event): void {
    evento.preventDefault();
    if (this.closeOnEsc() && this.pila.superior === this.dialogo().nativeElement) this.cerrar('escape');
  }

  /** El navegador cerró el diálogo sin pasar por `cerrar()` (por ejemplo, un `<form method="dialog">`). */
  protected alCerrarNativo(): void {
    // El evento `close` llega después (en otra tarea) cuando cerramos nosotros: se ignora una vez.
    if (this.cerrandoNosotros) {
      this.cerrandoNosotros = false;
      return;
    }
    clearTimeout(this.temporizadorSalida);
    this.cerrando.set(false);
    this.limpiar('action');
  }

  /** El velo es el propio `<dialog>`; el panel va dentro. Solo cuenta si el clic empezó y terminó en el velo. */
  protected alPresionar(evento: MouseEvent): void {
    this.presionEnVelo = evento.target === this.dialogo().nativeElement;
  }

  protected alClic(evento: MouseEvent): void {
    const enVelo = this.presionEnVelo && evento.target === this.dialogo().nativeElement;
    this.presionEnVelo = false;
    if (enVelo && this.closeOnBackdrop()) this.cerrar('backdrop');
  }
}

/** Pie del modal: los botones van a la derecha en escritorio y apilados (principal arriba) en móvil. */
@Directive({ selector: '[ukiModalFooter]', host: { class: 'uki-modal__footer' } })
export class UkiModalFooter {}

/** Cierra el modal que lo contiene al hacer clic (`closed` emite `action`). */
@Directive({ selector: '[ukiModalClose]', host: { '(click)': 'cerrar()' } })
export class UkiModalClose {
  private readonly modal = inject(UkiModal);

  protected cerrar(): void {
    this.modal.cerrar('action');
  }
}

/** Marca el elemento que recibe el foco al abrir el modal (por ejemplo, el primer campo de un formulario). */
@Directive({ selector: '[ukiModalFocus]' })
export class UkiModalFocus {}

function movimientoReducido(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
