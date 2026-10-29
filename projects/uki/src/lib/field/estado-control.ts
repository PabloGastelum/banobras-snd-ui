import { computed, DestroyRef, inject, Signal, signal } from '@angular/core';
import { FormGroupDirective, NgControl, NgForm, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

let contador = 0;

/** Identificador único para enlazar etiqueta, control, ayuda y contador. */
export const idUnico = (prefijo: string) => `${prefijo}-${++contador}`;

/** Lo que el campo necesita saber del control para dibujar el error y los atributos ARIA. */
export interface EstadoDeControl {
  invalido: boolean;
  tocado: boolean;
  enviado: boolean;
  requerido: boolean;
  deshabilitado: boolean;
  /** Longitud del valor, para el contador del Text area. */
  longitud: number;
}

/**
 * Sigue el estado de un control de formularios (reactivos o ngModel) como señal. Los formularios de Angular no son
 * señales: se escucha `control.events` (valor, estado, touched) y el envío del formulario padre.
 *
 * Se crea en el constructor de la directiva o componente y se conecta en `ngAfterContentInit`, cuando
 * `formControlName` ya creó su control.
 */
export class SeguidorDeControl {
  private readonly version = signal(0);
  private readonly enviado = signal(false);
  private suscripciones = new Subscription();
  private readonly formulario = inject(FormGroupDirective, { optional: true }) ?? inject(NgForm, { optional: true });

  constructor(
    private readonly ngControl: NgControl | null,
    private readonly valorNativo: () => string = () => '',
  ) {
    inject(DestroyRef).onDestroy(() => this.suscripciones.unsubscribe());
  }

  conectar(): void {
    this.suscripciones.unsubscribe();
    this.suscripciones = new Subscription();
    const control = this.ngControl?.control;
    if (control) this.suscripciones.add(control.events.subscribe(() => this.version.update((v) => v + 1)));
    if (this.formulario) {
      this.suscripciones.add(this.formulario.ngSubmit.subscribe(() => this.enviado.set(true)));
      // Al reiniciar el formulario vuelve a «no enviado».
      if (control) this.suscripciones.add(control.events.subscribe(() => !this.formulario?.submitted && this.enviado.set(false)));
    }
    this.version.update((v) => v + 1);
  }

  /** Avisa de un cambio que no pasa por el control (por ejemplo, el texto de un input sin formulario). */
  refrescar(): void {
    this.version.update((v) => v + 1);
  }

  readonly estado: Signal<EstadoDeControl> = computed(() => {
    this.version();
    const control = this.ngControl?.control;
    const valor = control ? control.value : this.valorNativo();
    return {
      invalido: control?.invalid ?? false,
      tocado: control?.touched ?? false,
      enviado: this.enviado(),
      requerido: control?.hasValidator(Validators.required) ?? false,
      deshabilitado: control?.disabled ?? false,
      longitud: typeof valor === 'string' ? valor.length : 0,
    };
  });

  readonly tieneControl = () => !!this.ngControl?.control;
}
