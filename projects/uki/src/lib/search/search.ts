import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UkiIcono } from '../iconos/icono';

export type UkiSearchSize = 'default' | 'large';

/** Espera después de la última tecla antes de emitir `(buscar)` (Figma: «debounce ~300 ms»). */
const ESPERA_MS = 300;

/**
 * Búsqueda de UKI (página Search). Filtra el contenido mientras la persona escribe: emite `(buscar)` 300 ms después de
 * la última tecla, y de inmediato con Enter o al borrar. No filtra nada por sí misma; en los sistemas el filtrado va en
 * el servidor.
 *
 * ```html
 * <uki-search placeholder="Buscar por folio o solicitante" ariaLabel="Buscar en la tabla"
 *             [resultados]="total()" (buscar)="filtrar($event)" />
 * ```
 */
@Component({
  selector: 'uki-search',
  imports: [UkiIcono],
  template: `
    <div class="uki-search__caja" role="search">
      <uki-icono class="uki-search__icono" nombre="search" />
      <input
        #campo
        class="uki-search__input"
        type="search"
        autocomplete="off"
        [attr.aria-label]="ariaLabel()"
        [placeholder]="placeholder()"
        [value]="valor()"
        [disabled]="deshabilitado()"
        (input)="alEscribir($event)"
        (keydown.escape)="alEscape($event)"
        (keydown.enter)="emitirYa()"
        (blur)="alTocar()"
      />
      @if (valor() && !deshabilitado()) {
        <button type="button" class="uki-search__borrar" aria-label="Borrar búsqueda" (click)="borrar()">
          <uki-icono nombre="close" />
        </button>
      }
    </div>
    <p class="uki-search__anuncio" aria-live="polite">{{ anuncio() }}</p>
  `,
  styleUrl: './search.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UkiSearch), multi: true }],
  host: {
    class: 'uki-search',
    '[class.uki-search--large]': 'size() === "large"',
    '[class.uki-search--deshabilitado]': 'deshabilitado()',
  },
})
export class UkiSearch implements ControlValueAccessor {
  /** `default` (40 px) para tablas, listas y filtros; `large` (48 px) junto a campos de formulario. */
  readonly size = input<UkiSearchSize>('default');
  /** Di qué se busca: «Buscar por folio o solicitante». */
  readonly placeholder = input('Buscar');
  /** Nombre accesible del campo, por ejemplo «Buscar en la tabla». */
  readonly ariaLabel = input('Buscar');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Número de resultados del último filtro; se anuncia a lectores de pantalla. `null` no anuncia nada. */
  readonly resultados = input<number | null>(null);
  /** Texto a buscar, con la espera ya aplicada. */
  readonly buscar = output<string>();

  protected readonly valor = signal('');
  private readonly deshabilitadoPorFormulario = signal(false);
  protected readonly deshabilitado = computed(() => this.disabled() || this.deshabilitadoPorFormulario());
  protected readonly anuncio = computed(() => {
    const n = this.resultados();
    if (n === null || n === undefined) return '';
    return n === 1 ? '1 resultado' : `${n} resultados`;
  });

  private readonly campo = viewChild.required<ElementRef<HTMLInputElement>>('campo');
  private temporizador?: ReturnType<typeof setTimeout>;
  private notificarCambio: (valor: string) => void = () => undefined;
  private notificarToque: () => void = () => undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizador));
  }

  protected alEscribir(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.valor.set(valor);
    this.notificarCambio(valor);
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.buscar.emit(valor), ESPERA_MS);
  }

  protected emitirYa(): void {
    clearTimeout(this.temporizador);
    this.buscar.emit(this.valor());
  }

  /** Esc borra la búsqueda. Si ya está vacía, deja pasar la tecla (por ejemplo, para cerrar un modal). */
  protected alEscape(evento: Event): void {
    if (!this.valor()) return;
    evento.preventDefault();
    evento.stopPropagation();
    this.borrar();
  }

  /** Borra la búsqueda, emite de inmediato y devuelve el foco al campo. */
  borrar(): void {
    this.valor.set('');
    this.notificarCambio('');
    this.emitirYa();
    this.campo().nativeElement.focus();
  }

  protected alTocar(): void {
    this.notificarToque();
  }

  writeValue(valor: unknown): void {
    this.valor.set(typeof valor === 'string' ? valor : '');
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.notificarCambio = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.notificarToque = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitadoPorFormulario.set(deshabilitado);
  }
}
