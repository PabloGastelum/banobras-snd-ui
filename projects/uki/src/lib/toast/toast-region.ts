import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal, ViewEncapsulation } from '@angular/core';
import { UkiFeedbackType } from '../feedback';
import { UkiToastView } from './toast-view';

/** Espera antes de escribir en la región viva, para que el lector de pantalla note el cambio (como el LiveAnnouncer del CDK). */
export const RETRASO_ANUNCIO_MS = 100;
/** Duración de la animación de salida. */
export const SALIDA_MS = 200;

/** Aviso ya resuelto, con los valores por omisión aplicados. */
export interface Aviso {
  id: number;
  type: UkiFeedbackType;
  title: string;
  description?: string;
  icon: boolean;
  dismissible: boolean;
  /** Milisegundos hasta cerrarse solo; `null` = hasta que la persona lo cierre. */
  duration: number | null;
  alCerrar: () => void;
}

/**
 * Región de avisos: el Toast visible y dos regiones vivas ocultas a la vista (`status` y `alert`) que existen desde que se
 * crea la región. La crea `UkiToastService` al final de `<body>`; no forma parte de la API pública.
 */
@Component({
  selector: 'uki-toast-region',
  imports: [UkiToastView],
  template: `
    <div class="uki-toast-region__anuncio" role="status">{{ anuncioEstado() }}</div>
    <div class="uki-toast-region__anuncio" role="alert">{{ anuncioAlerta() }}</div>
    @if (actual(); as aviso) {
      <!-- El aviso no recibe foco (no lo roba); Esc y focusin llegan desde su botón, y el puntero solo pausa. -->
      <uki-toast
        [type]="aviso.type"
        [title]="aviso.title"
        [description]="aviso.description"
        [icon]="aviso.icon"
        [dismissible]="aviso.dismissible"
        [class.uki-toast--saliendo]="saliendo()"
        (cerrar)="cerrar(aviso.id)"
        (mouseenter)="marcar('puntero', true)"
        (mouseleave)="marcar('puntero', false)"
        (focusin)="marcar('foco', true)"
        (focusout)="alSalirFoco($event)"
        (keydown.escape)="cerrar(aviso.id)"
      />
    }
  `,
  styleUrl: './toast.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'uki-toast-region' },
})
export class UkiToastRegion {
  protected readonly actual = signal<Aviso | null>(null);
  protected readonly saliendo = signal(false);
  protected readonly anuncioEstado = signal('');
  protected readonly anuncioAlerta = signal('');
  protected readonly puntero = signal(false);
  protected readonly foco = signal(false);
  /** El tiempo corre solo sin el puntero encima ni el foco dentro. */
  private readonly pausado = computed(() => this.puntero() || this.foco());

  private temporizador?: ReturnType<typeof setTimeout>;
  private temporizadorAnuncio?: ReturnType<typeof setTimeout>;
  private temporizadorSalida?: ReturnType<typeof setTimeout>;
  /** Tiempo que le queda al aviso y cuándo se empezó a contar. */
  private restante: number | null = null;
  private inicio = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.temporizador);
      clearTimeout(this.temporizadorAnuncio);
      clearTimeout(this.temporizadorSalida);
      this.actual()?.alCerrar();
    });
  }

  /** Muestra el aviso; si había otro visible, lo reemplaza (uno a la vez). */
  mostrar(aviso: Aviso): void {
    this.quitar();
    this.puntero.set(false);
    this.foco.set(false);
    this.actual.set(aviso);
    this.anunciar(aviso);
    this.restante = aviso.duration;
    this.contar();
  }

  /** Cierra el aviso `id` si sigue visible, con la animación de salida. */
  cerrar(id: number): void {
    if (this.actual()?.id !== id || this.saliendo()) return;
    this.detener();
    this.saliendo.set(true);
    const salida = movimientoReducido() ? 0 : SALIDA_MS;
    this.temporizadorSalida = setTimeout(() => this.quitar(), salida);
  }

  protected alSalirFoco(evento: FocusEvent): void {
    const destino = evento.relatedTarget as Node | null;
    if (!destino || !(evento.currentTarget as HTMLElement).contains(destino)) this.marcar('foco', false);
  }

  /** Con el puntero encima o el foco dentro, el tiempo se detiene; al salir, sigue con lo que quedaba. */
  protected marcar(fuente: 'puntero' | 'foco', valor: boolean): void {
    (fuente === 'puntero' ? this.puntero : this.foco).set(valor);
    if (this.pausado()) this.detener();
    else this.contar();
  }

  private anunciar(aviso: Aviso): void {
    clearTimeout(this.temporizadorAnuncio);
    this.anuncioEstado.set('');
    this.anuncioAlerta.set('');
    const texto = aviso.description ? `${aviso.title}. ${aviso.description}` : aviso.title;
    const region = aviso.type === 'error' ? this.anuncioAlerta : this.anuncioEstado;
    this.temporizadorAnuncio = setTimeout(() => region.set(texto), RETRASO_ANUNCIO_MS);
  }

  /** Arranca o reanuda la cuenta con el tiempo que quedaba. */
  private contar(): void {
    const aviso = this.actual();
    if (!aviso || this.restante === null || this.pausado() || this.saliendo()) return;
    clearTimeout(this.temporizador);
    this.inicio = Date.now();
    this.temporizador = setTimeout(() => this.cerrar(aviso.id), this.restante);
  }

  /** Pausa la cuenta y guarda lo que falta. */
  private detener(): void {
    if (this.temporizador === undefined) return;
    clearTimeout(this.temporizador);
    this.temporizador = undefined;
    if (this.restante !== null) this.restante = Math.max(0, this.restante - (Date.now() - this.inicio));
  }

  /** Quita el aviso visible sin animación y avisa a quien lo mostró. */
  private quitar(): void {
    clearTimeout(this.temporizadorSalida);
    this.detener();
    const anterior = this.actual();
    this.actual.set(null);
    this.saliendo.set(false);
    anterior?.alCerrar();
  }
}

function movimientoReducido(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
