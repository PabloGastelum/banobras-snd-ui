import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  createComponent,
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injectable,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { UkiButton } from '../button/button';
import { UkiModal, UkiModalClose, UkiModalCloseReason, UkiModalFooter, UkiModalSize, UkiModalType } from './modal';

export interface UkiConfirmOptions {
  /** Pregunta concreta: «¿Eliminar el trámite?». */
  title: string;
  /** Qué va a pasar: «Se eliminarán todos los elementos del trámite. Esta acción no se puede deshacer.» */
  message: string;
  /** Repite la acción: «Eliminar», no «Aceptar». */
  confirmLabel: string;
  /** Por omisión, «Cancelar». */
  cancelLabel?: string;
  /** Acción destructiva o irreversible: el botón de confirmar es Danger. */
  destructive?: boolean;
  /** Por omisión, `small` (480 px). */
  size?: UkiModalSize;
}

export interface UkiInformOptions {
  title: string;
  message: string;
  /** Por omisión, «Entendido». */
  actionLabel?: string;
  /** Por omisión, `small` (480 px). */
  size?: UkiModalSize;
}

/** Datos ya resueltos del diálogo que crea el servicio. */
interface Dialogo {
  type: UkiModalType;
  title: string;
  message: string;
  size: UkiModalSize;
  acceptLabel: string;
  cancelLabel: string | null;
  destructive: boolean;
}

/** Diálogo que crea `UkiDialogService` (interno). Usa el mismo `uki-modal` que la plantilla. */
@Component({
  selector: 'uki-dialogo',
  imports: [UkiModal, UkiModalFooter, UkiModalClose, UkiButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let d = dialogo();
    <uki-modal [title]="d.title" [size]="d.size" [type]="d.type" [(open)]="abierto" (closed)="alCerrar($event)">
      <p>{{ d.message }}</p>
      <div ukiModalFooter>
        @if (d.cancelLabel) {
          <button ukiButton variant="secondary" type="button" ukiModalClose>{{ d.cancelLabel }}</button>
        }
        <button ukiButton type="button" [variant]="d.destructive ? 'danger' : 'primary'" (click)="aceptar()">
          {{ d.acceptLabel }}
        </button>
      </div>
    </uki-modal>
  `,
})
export class UkiDialogo {
  readonly dialogo = input.required<Dialogo>();
  readonly abierto = signal(true);
  /** Lo asigna el servicio: recibe `true` solo si se cerró con el botón de aceptar. */
  alTerminar: (aceptado: boolean) => void = () => undefined;
  private aceptado = false;

  protected aceptar(): void {
    this.aceptado = true;
    this.abierto.set(false);
  }

  protected alCerrar(_motivo: UkiModalCloseReason): void {
    this.alTerminar(this.aceptado);
  }
}

/**
 * Diálogos de UKI desde el código (página Modal). Para los dos tipos de Figma sin tocar la plantilla:
 *
 * ```ts
 * private readonly dialogos = inject(UkiDialogService);
 *
 * async eliminar(folio: string): Promise<void> {
 *   const confirmado = await this.dialogos.confirm({
 *     title: '¿Eliminar el trámite?',
 *     message: 'Se eliminarán todos los elementos del trámite. Esta acción no se puede deshacer.',
 *     confirmLabel: 'Eliminar',
 *     destructive: true,
 *   });
 *   if (confirmado) this.tramites.eliminar(folio);
 * }
 * ```
 *
 * Para contenido propio (un formulario corto, texto con enlaces), usa `<uki-modal>` en la plantilla.
 */
@Injectable({ providedIn: 'root' })
export class UkiDialogService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);
  private readonly enNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly abiertos = new Set<ComponentRef<UkiDialogo>>();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const ref of this.abiertos) this.quitar(ref);
    });
  }

  /** Pregunta antes de una acción importante. Se cumple con `true` solo si la persona confirma. En SSR, `false`. */
  confirm(opciones: UkiConfirmOptions): Promise<boolean> {
    return this.abrir({
      type: 'confirmation',
      title: opciones.title,
      message: opciones.message,
      size: opciones.size ?? 'small',
      acceptLabel: opciones.confirmLabel,
      cancelLabel: opciones.cancelLabel ?? 'Cancelar',
      destructive: opciones.destructive ?? false,
    });
  }

  /** Explica algo que se tiene que leer antes de seguir. Se cumple al cerrarlo. */
  inform(opciones: UkiInformOptions): Promise<void> {
    return this.abrir({
      type: 'informative',
      title: opciones.title,
      message: opciones.message,
      size: opciones.size ?? 'small',
      acceptLabel: opciones.actionLabel ?? 'Entendido',
      cancelLabel: null,
      destructive: false,
    }).then(() => undefined);
  }

  private abrir(dialogo: Dialogo): Promise<boolean> {
    if (!this.enNavegador) return Promise.resolve(false);
    return new Promise<boolean>((resolver) => {
      const ref = createComponent(UkiDialogo, { environmentInjector: this.injector });
      ref.setInput('dialogo', dialogo);
      ref.instance.alTerminar = (aceptado) => {
        this.quitar(ref);
        resolver(aceptado);
      };
      this.abiertos.add(ref);
      this.appRef.attachView(ref.hostView);
      this.document.body.appendChild(ref.location.nativeElement);
    });
  }

  private quitar(ref: ComponentRef<UkiDialogo>): void {
    if (!this.abiertos.delete(ref)) return;
    if (!this.appRef.destroyed) this.appRef.detachView(ref.hostView);
    ref.destroy();
    ref.location.nativeElement.remove();
  }
}
