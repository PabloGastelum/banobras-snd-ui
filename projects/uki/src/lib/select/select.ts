import {
  AfterContentInit,
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { idUnico, SeguidorDeControl } from '../field/estado-control';
import { UkiCapa } from '../capa/capa';
import { UkiIcono } from '../iconos/icono';

export interface UkiSelectOption<T = unknown> {
  value: T;
  label: string;
  disabled?: boolean;
}

/** Tiempo para seguir sumando letras a la búsqueda por teclado. */
const ESPERA_LETRAS_MS = 500;

const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/**
 * Select de UKI (página Fields: Select). Elige una opción de una lista de 5 a 15. Sigue el patrón *select-only
 * combobox* de WAI-ARIA: el foco se queda en el botón con `role="combobox"` y la opción activa se indica con
 * `aria-activedescendant`. Funciona con formularios reactivos y `ngModel`.
 *
 * ```html
 * <uki-select label="Tipo de trámite" required placeholder="Selecciona una opción"
 *             [options]="tramites" formControlName="tramite" error="Elige un tipo de trámite." />
 * ```
 */
@Component({
  selector: 'uki-select',
  imports: [UkiIcono],
  template: `
    <span class="uki-field__label" [id]="idEtiqueta">
      <span>{{ label() }}</span>
      @if (esRequerido()) {
        <span class="uki-field__asterisco" aria-hidden="true">*</span>
      }
      <span aria-hidden="true">:</span>
    </span>
    <div class="uki-select__caja" #caja>
      <button
        #disparador
        type="button"
        role="combobox"
        class="uki-input uki-select__disparador"
        [class.uki-input--activo]="abierto()"
        [id]="idControl"
        [attr.aria-labelledby]="idEtiqueta"
        aria-haspopup="listbox"
        [attr.aria-controls]="idLista"
        [attr.aria-expanded]="abierto()"
        [attr.aria-activedescendant]="abierto() && activo() >= 0 ? idOpcion(activo()) : null"
        [attr.aria-required]="esRequerido() ? 'true' : null"
        [attr.aria-invalid]="errorVisible() ? 'true' : null"
        [attr.aria-describedby]="errorVisible() || helper() ? idMensaje : null"
        [disabled]="deshabilitado()"
        (click)="alternar()"
        (keydown)="alTeclear($event)"
        (blur)="alSalir()"
      >
        <span class="uki-select__valor" [class.uki-select__valor--vacio]="!seleccionada()">{{
          seleccionada()?.label ?? placeholder()
        }}</span>
        <uki-icono class="uki-select__chevron" nombre="chevron-down" />
      </button>
      @if (abierto()) {
        <div
          #lista
          class="uki-select__menu"
          role="listbox"
          tabindex="-1"
          [id]="idLista"
          [attr.aria-labelledby]="idEtiqueta"
          (mousedown)="$event.preventDefault()"
        >
          @for (opcion of options(); track $index; let i = $index) {
            <!-- El teclado vive en el combobox (aria-activedescendant); las opciones solo reciben el clic del puntero. -->
            <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
            <div
              class="uki-select__opcion"
              role="option"
              [id]="idOpcion(i)"
              [class.uki-select__opcion--activa]="i === activo()"
              [attr.aria-selected]="i === indiceSeleccionado()"
              [attr.aria-disabled]="opcion.disabled ? 'true' : null"
              (click)="elegir(i)"
              (mousemove)="!opcion.disabled && activo.set(i)"
            >
              <span class="uki-select__texto">{{ opcion.label }}</span>
              @if (i === indiceSeleccionado()) {
                <uki-icono nombre="check" />
              }
            </div>
          }
        </div>
      }
    </div>
    @if (errorVisible()) {
      <div class="uki-field__pie">
        <p class="uki-field__mensaje uki-field__mensaje--error" [id]="idMensaje">{{ error() }}</p>
      </div>
    } @else if (helper()) {
      <div class="uki-field__pie">
        <p class="uki-field__mensaje" [id]="idMensaje">{{ helper() }}</p>
      </div>
    }
  `,
  styleUrls: ['../field/field.css', '../capa/capa.css', './select.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'uki-select' },
})
export class UkiSelect<T = unknown> implements ControlValueAccessor, AfterContentInit {
  readonly label = input.required<string>();
  readonly options = input<UkiSelectOption<T>[]>([]);
  /** Di qué se elige: «Selecciona una opción». */
  readonly placeholder = input('Selecciona una opción');
  readonly required = input(false, { transform: booleanAttribute });
  readonly helper = input<string>();
  /** Explica cómo corregir. Se muestra cuando el control es inválido y ya se tocó o se envió. */
  readonly error = input<string>();
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly idEtiqueta = idUnico('uki-select-etiqueta');
  protected readonly idControl = idUnico('uki-select');
  protected readonly idLista = idUnico('uki-select-lista');
  protected readonly idMensaje = idUnico('uki-select-mensaje');
  protected readonly idOpcion = (i: number) => `${this.idLista}-opcion-${i}`;

  protected readonly abierto = signal(false);
  protected readonly activo = signal(-1);
  private readonly valor = signal<T | null>(null);
  private readonly deshabilitadoPorFormulario = signal(false);

  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly seguidor = new SeguidorDeControl(this.ngControl);
  private readonly disparador = viewChild.required<ElementRef<HTMLButtonElement>>('disparador');
  private readonly lista = viewChild<ElementRef<HTMLElement>>('lista');
  private readonly caja = viewChild.required<ElementRef<HTMLElement>>('caja');
  private capa?: UkiCapa;

  protected readonly indiceSeleccionado = computed(() => this.options().findIndex((o) => o.value === this.valor()));
  protected readonly seleccionada = computed<UkiSelectOption<T> | null>(() => this.options()[this.indiceSeleccionado()] ?? null);
  protected readonly deshabilitado = computed(() => this.disabled() || this.deshabilitadoPorFormulario());
  protected readonly esRequerido = computed(() => this.required() || this.seguidor.estado().requerido);
  protected readonly errorVisible = computed(() => {
    if (!this.error()) return false;
    if (!this.seguidor.tieneControl()) return true;
    const estado = this.seguidor.estado();
    return estado.invalido && (estado.tocado || estado.enviado);
  });

  private letras = '';
  private temporizadorLetras?: ReturnType<typeof setTimeout>;
  private notificarCambio: (valor: T | null) => void = () => undefined;
  private notificarToque: () => void = () => undefined;

  constructor() {
    // Patrón de Angular Material: el componente es su propio ControlValueAccessor sin dependencia circular.
    if (this.ngControl) this.ngControl.valueAccessor = this;
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.temporizadorLetras);
      this.capa?.cerrar();
    });
    // La lista va en la capa superpuesta: no se recorta dentro de contenedores con overflow: hidden ni de un modal.
    afterRenderEffect(() => {
      const lista = this.lista()?.nativeElement;
      if (!lista) {
        this.capa?.cerrar();
        this.capa = undefined;
        return;
      }
      if (this.capa) return;
      this.capa = new UkiCapa(lista, this.caja().nativeElement, { ancho: 'ancla' });
      this.capa.abrir();
    });
    // La opción activa siempre queda a la vista dentro de la lista.
    afterRenderEffect(() => {
      const i = this.activo();
      if (!this.abierto() || i < 0) return;
      this.lista()?.nativeElement.querySelector<HTMLElement>(`[id="${this.idOpcion(i)}"]`)?.scrollIntoView?.({ block: 'nearest' });
    });
  }

  ngAfterContentInit(): void {
    this.seguidor.conectar();
  }

  protected enfocar(): void {
    this.disparador().nativeElement.focus();
  }

  protected alternar(): void {
    if (this.abierto()) this.cerrar();
    else this.abrir(this.inicialActivo());
  }

  private inicialActivo(): number {
    return this.indiceSeleccionado() >= 0 ? this.indiceSeleccionado() : this.siguienteHabilitada(-1, 1);
  }

  private abrir(activo: number): void {
    if (this.deshabilitado()) return;
    this.abierto.set(true);
    this.activo.set(activo);
  }

  private cerrar(): void {
    this.abierto.set(false);
    this.activo.set(-1);
  }

  /** Índice de la siguiente opción habilitada en la dirección indicada, sin dar la vuelta. */
  private siguienteHabilitada(desde: number, paso: 1 | -1): number {
    const opciones = this.options();
    for (let i = desde + paso; i >= 0 && i < opciones.length; i += paso) if (!opciones[i].disabled) return i;
    return desde;
  }

  private primera = () => this.siguienteHabilitada(-1, 1);
  private ultima = () => this.siguienteHabilitada(this.options().length, -1);

  protected elegir(i: number): void {
    const opcion = this.options()[i];
    if (!opcion || opcion.disabled) return;
    if (opcion.value !== this.valor()) {
      this.valor.set(opcion.value);
      this.notificarCambio(opcion.value);
    }
    this.cerrar();
    this.enfocar();
  }

  protected alSalir(): void {
    this.cerrar();
    this.notificarToque();
    this.seguidor.refrescar();
  }

  protected alTeclear(evento: KeyboardEvent): void {
    const { key, altKey } = evento;
    const abierto = this.abierto();
    const letra = key.length === 1 && !evento.ctrlKey && !evento.metaKey && (key !== ' ' || this.letras !== '');

    if (letra) {
      evento.preventDefault();
      this.buscarPorLetra(key);
      return;
    }
    // Cualquier otra tecla termina la búsqueda por letras.
    this.letras = '';

    if (!abierto) {
      const accion: Record<string, () => number> = {
        ArrowDown: () => this.inicialActivo(),
        ArrowUp: () => this.inicialActivo(),
        Enter: () => this.inicialActivo(),
        ' ': () => this.inicialActivo(),
        Home: this.primera,
        End: this.ultima,
      };
      if (accion[key]) {
        evento.preventDefault();
        this.abrir(accion[key]());
      }
      return;
    }

    switch (key) {
      case 'ArrowDown':
        evento.preventDefault();
        this.activo.set(this.siguienteHabilitada(this.activo(), 1));
        break;
      case 'ArrowUp':
        evento.preventDefault();
        if (altKey) this.elegir(this.activo());
        else this.activo.set(this.siguienteHabilitada(this.activo(), -1));
        break;
      case 'Home':
        evento.preventDefault();
        this.activo.set(this.primera());
        break;
      case 'End':
        evento.preventDefault();
        this.activo.set(this.ultima());
        break;
      case 'PageDown':
        evento.preventDefault();
        this.activo.set(this.moverVarias(10));
        break;
      case 'PageUp':
        evento.preventDefault();
        this.activo.set(this.moverVarias(-10));
        break;
      case 'Enter':
      case ' ':
        evento.preventDefault();
        this.elegir(this.activo());
        break;
      case 'Escape':
        evento.preventDefault();
        evento.stopPropagation();
        this.cerrar();
        break;
      case 'Tab':
        // Tab elige la opción activa y deja que el foco siga su camino.
        this.elegir(this.activo());
        break;
    }
  }

  private moverVarias(cuantas: number): number {
    let i = this.activo();
    const paso = cuantas > 0 ? 1 : -1;
    for (let k = 0; k < Math.abs(cuantas); k++) i = this.siguienteHabilitada(i, paso);
    return i;
  }

  /** Salta a la siguiente opción que empieza con las letras escritas (sin distinguir acentos ni mayúsculas). */
  private buscarPorLetra(letra: string): void {
    clearTimeout(this.temporizadorLetras);
    this.letras += normalizar(letra);
    this.temporizadorLetras = setTimeout(() => (this.letras = ''), ESPERA_LETRAS_MS);

    const opciones = this.options();
    const total = opciones.length;
    const actual = this.abierto() ? this.activo() : this.indiceSeleccionado();
    // Con una sola letra repetida se recorren las opciones que empiezan con ella; con varias, se busca el prefijo.
    const repetida = this.letras.length > 1 && [...this.letras].every((c) => c === this.letras[0]);
    const buscado = repetida ? this.letras[0] : this.letras;
    const inicio = this.letras.length === 1 || repetida ? actual + 1 : Math.max(actual, 0);
    for (let k = 0; k < total; k++) {
      const i = (inicio + k + total) % total;
      if (!opciones[i].disabled && normalizar(opciones[i].label).startsWith(buscado)) {
        if (!this.abierto()) this.abrir(i);
        else this.activo.set(i);
        return;
      }
    }
  }

  writeValue(valor: T | null): void {
    this.valor.set(valor ?? null);
  }

  registerOnChange(fn: (valor: T | null) => void): void {
    this.notificarCambio = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.notificarToque = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitadoPorFormulario.set(deshabilitado);
    if (deshabilitado) this.cerrar();
  }
}
