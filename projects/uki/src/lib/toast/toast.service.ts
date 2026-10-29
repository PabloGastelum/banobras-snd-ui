import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injectable,
  PLATFORM_ID,
} from '@angular/core';
import { UkiFeedbackType } from '../feedback';
import { UkiToastRegion } from './toast-region';

/** Success e Info se cierran solos a los 5 s; Warning y Error se quedan hasta que la persona los cierra (Figma). */
const DURACION: Record<UkiFeedbackType, number | null> = { success: 5000, info: 5000, warning: null, error: null };

export interface UkiToastOptions {
  /** Intención del aviso. Por omisión, `success`. */
  type?: UkiFeedbackType;
  /** De 2 a 5 palabras: «Solicitud enviada». */
  title: string;
  /** Una línea con qué pasó o qué puede hacer la persona. */
  description?: string;
  /** Milisegundos antes de cerrarse solo; `null` lo deja hasta que lo cierren. Por omisión depende del tipo. */
  duration?: number | null;
  /** Ícono de estado (Leading Icon en Figma). Por omisión, encendido. */
  icon?: boolean;
  /** Botón «Cerrar aviso» (Trailing Icon en Figma). Siempre aparece si el aviso no se cierra solo. */
  dismissible?: boolean;
}

export interface UkiToastRef {
  /** Cierra el aviso si sigue visible. */
  close(): void;
  /** Se cumple cuando el aviso se cierra: por tiempo, por la persona, con `close()` o porque otro lo reemplazó. */
  readonly closed: Promise<void>;
}

/**
 * Avisos flotantes de UKI (página Toast). Confirman el resultado de una acción sin bloquear la pantalla y sin mover el
 * foco. Uno a la vez: un aviso nuevo reemplaza al visible.
 *
 * ```ts
 * private readonly avisos = inject(UkiToastService);
 *
 * guardar(): void {
 *   this.avisos.success('Solicitud enviada', 'Te enviamos el acuse por correo.');
 * }
 * ```
 *
 * El aviso se anuncia a lectores de pantalla (Error de inmediato, los demás sin interrumpir). Nunca pongas en un aviso la
 * única forma de terminar una tarea: desaparece.
 */
@Injectable({ providedIn: 'root' })
export class UkiToastService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);
  private readonly enNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  private region?: ComponentRef<UkiToastRegion>;
  private siguienteId = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (!this.region) return;
      // Si la aplicación ya se destruyó, ya soltó sus vistas.
      if (!this.appRef.destroyed) this.appRef.detachView(this.region.hostView);
      this.region.destroy();
      this.region = undefined;
    });
  }

  /** Muestra un aviso. En el servidor (SSR) no hace nada. */
  show(opciones: UkiToastOptions): UkiToastRef {
    const type = opciones.type ?? 'success';
    const duration = opciones.duration === undefined ? DURACION[type] : opciones.duration;
    const id = ++this.siguienteId;
    let resolver!: () => void;
    const closed = new Promise<void>((resolve) => (resolver = resolve));
    const region = this.obtenerRegion();
    if (!region) {
      resolver();
      return { close: () => undefined, closed };
    }
    region.mostrar({
      id,
      type,
      title: opciones.title,
      description: opciones.description,
      icon: opciones.icon ?? true,
      dismissible: duration === null || type === 'warning' || type === 'error' || (opciones.dismissible ?? true),
      duration,
      alCerrar: resolver,
    });
    return { close: () => region.cerrar(id), closed };
  }

  success(title: string, description?: string): UkiToastRef {
    return this.show({ type: 'success', title, description });
  }

  info(title: string, description?: string): UkiToastRef {
    return this.show({ type: 'info', title, description });
  }

  warning(title: string, description?: string): UkiToastRef {
    return this.show({ type: 'warning', title, description });
  }

  error(title: string, description?: string): UkiToastRef {
    return this.show({ type: 'error', title, description });
  }

  /** Crea la región una sola vez, al final de `<body>`, con la API de Angular (compatible con CSP). */
  private obtenerRegion(): UkiToastRegion | null {
    if (!this.enNavegador) return null;
    if (!this.region) {
      this.region = createComponent(UkiToastRegion, { environmentInjector: this.injector });
      this.appRef.attachView(this.region.hostView);
      this.document.body.appendChild(this.region.location.nativeElement);
    }
    return this.region.instance;
  }
}
