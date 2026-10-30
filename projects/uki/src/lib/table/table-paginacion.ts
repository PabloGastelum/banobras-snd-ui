import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { UkiIcono } from '../iconos/icono';

let siguienteId = 0;

/** Páginas visibles: la primera, la última y la actual ± 1, con «…» donde se saltan páginas. */
export function paginasVisibles(actual: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const numeros = new Set([1, total, actual - 1, actual, actual + 1]);
  if (actual <= 3) [2, 3, 4].forEach((n) => numeros.add(n));
  if (actual >= total - 2) [total - 3, total - 2, total - 1].forEach((n) => numeros.add(n));
  const orden = [...numeros].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const resultado: (number | '…')[] = [];
  orden.forEach((n, i) => {
    const previo = orden[i - 1];
    if (previo !== undefined && n - previo === 2) resultado.push(previo + 1);
    else if (previo !== undefined && n - previo > 2) resultado.push('…');
    resultado.push(n);
  });
  return resultado;
}

/**
 * Paginación de `uki-table` (interna). Escritorio: filas por página, rango «1–10 de 48» y páginas numeradas con
 * anterior y siguiente. Teléfono: rango, anterior, «1 / 10» y siguiente.
 */
@Component({
  selector: 'uki-table-paginacion',
  imports: [UkiIcono],
  template: `
    <nav class="uki-table-paginacion" [class.uki-table-paginacion--movil]="movil()" aria-label="Paginación">
      @if (!movil()) {
        <div class="uki-table-paginacion__filas">
          <label class="uki-table-paginacion__etiqueta" [for]="idFilas">Filas por página:</label>
          <span class="uki-table-paginacion__selector">
            <select [id]="idFilas" class="uki-table-paginacion__select" (change)="alCambiarTamano($event)">
              @for (opcion of pageSizeOptions(); track opcion) {
                <option [value]="opcion" [selected]="opcion === pageSize()">{{ opcion }}</option>
              }
            </select>
            <uki-icono class="uki-table-paginacion__chevron" nombre="chevron-down" />
          </span>
        </div>
      }
      <p class="uki-table-paginacion__rango">{{ rango() }}</p>
      <div class="uki-table-paginacion__paginas">
        <button
          type="button"
          class="uki-table-paginacion__boton"
          aria-label="Página anterior"
          [attr.aria-disabled]="page() <= 1 ? 'true' : null"
          (click)="ir(page() - 1)"
        >
          <uki-icono nombre="chevron-left" />
        </button>
        @if (movil()) {
          <span class="uki-table-paginacion__actual-movil">{{ page() }} / {{ paginas() }}</span>
        } @else {
          @for (n of visibles(); track $index) {
            @if (n === '…') {
              <span class="uki-table-paginacion__boton uki-table-paginacion__boton--salto" aria-hidden="true">…</span>
            } @else {
              <button
                type="button"
                class="uki-table-paginacion__boton"
                [class.uki-table-paginacion__boton--actual]="n === page()"
                [attr.aria-current]="n === page() ? 'page' : null"
                [attr.aria-label]="'Página ' + n"
                (click)="ir(n)"
              >
                {{ n }}
              </button>
            }
          }
        }
        <button
          type="button"
          class="uki-table-paginacion__boton"
          aria-label="Página siguiente"
          [attr.aria-disabled]="page() >= paginas() ? 'true' : null"
          (click)="ir(page() + 1)"
        >
          <uki-icono nombre="chevron-right" />
        </button>
      </div>
    </nav>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UkiTablePaginacion {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();
  readonly pageSizeOptions = input.required<readonly number[]>();
  readonly movil = input(false, { transform: booleanAttribute });
  readonly cambiarPagina = output<number>();
  readonly cambiarTamano = output<number>();

  protected readonly idFilas = `uki-table-filas-${++siguienteId}`;
  protected readonly paginas = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  protected readonly visibles = computed(() => paginasVisibles(this.page(), this.paginas()));
  protected readonly rango = computed(() => {
    const total = this.total();
    if (!total) return '0 de 0';
    const desde = (this.page() - 1) * this.pageSize() + 1;
    const hasta = Math.min(total, this.page() * this.pageSize());
    return `${desde}–${hasta} de ${total}`;
  });

  /** Anterior y siguiente usan aria-disabled (no disabled) para no perder el foco al llegar a un extremo. */
  protected ir(pagina: number): void {
    const destino = Math.min(Math.max(1, pagina), this.paginas());
    if (destino !== this.page()) this.cambiarPagina.emit(destino);
  }

  protected alCambiarTamano(evento: Event): void {
    this.cambiarTamano.emit(Number((evento.target as HTMLSelectElement).value));
  }
}
