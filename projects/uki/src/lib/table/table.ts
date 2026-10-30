import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  output,
  PLATFORM_ID,
  signal,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UkiButton } from '../button/button';
import { UkiTooltip } from '../capa/tooltip';
import { UkiCheckbox } from '../checkbox/checkbox';
import { UkiIcono, UkiNombreIcono } from '../iconos/icono';
import { UkiSearch } from '../search/search';
import { UkiSelect, UkiSelectOption } from '../select/select';
import { UkiSpinner } from '../spinner/spinner';
import { UkiTablePaginacion } from './table-paginacion';
import { UkiTableCell, UkiTableCellContext } from './table.directivas';

export type UkiTableActionType = 'view' | 'edit' | 'delete' | 'restore' | 'comment';
export type UkiTableKey = string | number;

export interface UkiTableColumn<T = unknown> {
  /** Propiedad de la fila que se muestra (o nombre de la plantilla `ukiTableCell`). */
  key: string;
  /** Texto del encabezado; también es la etiqueta en la tarjeta de teléfono. */
  header: string;
  /** El encabezado ordena (emite `sort`; el servidor ordena). */
  sortable?: boolean;
  /** `end` para importes y números. */
  align?: 'start' | 'end';
  /** Papel en la tarjeta de teléfono: `title` (folio, arriba), `status` (arriba a la derecha), `field` o `hidden`. */
  card?: 'title' | 'status' | 'field' | 'hidden';
  /** Texto de la celda. Por omisión, `row[key]`. */
  value?: (row: T) => string | number | null | undefined;
}

export interface UkiTableSort {
  key: string;
  direction: 'asc' | 'desc';
}

export interface UkiTableActionEvent<T = unknown> {
  action: UkiTableActionType;
  row: T;
}

const ACCIONES: Record<UkiTableActionType, { texto: string; icono: UkiNombreIcono }> = {
  view: { texto: 'Ver', icono: 'eye' },
  edit: { texto: 'Editar', icono: 'pencil' },
  delete: { texto: 'Eliminar', icono: 'trash' },
  restore: { texto: 'Restaurar', icono: 'arrow-counterclockwise' },
  comment: { texto: 'Comentar', icono: 'chat' },
};

const DIRECCION = { asc: 'ascendente', desc: 'descendente' } as const;
const TELEFONO = '(max-width: 767.98px)';

let siguienteId = 0;

/**
 * Tabla de UKI (página Table). Muestra **una página** de registros que da el servidor y emite eventos para que el
 * sistema pida otra: no ordena, no filtra y no pagina por su cuenta. En teléfonos (< 768 px) cada fila es una tarjeta.
 *
 * ```html
 * <uki-table caption="Solicitudes" [columns]="columnas" [rows]="pagina().filas" [total]="pagina().total"
 *            [rowKey]="porFolio" [rowLabel]="nombre" selectable [(selection)]="seleccion"
 *            [actions]="['view', 'edit', 'delete']" searchable [loading]="cargando()"
 *            [(page)]="pag" [(pageSize)]="tam" [(sort)]="orden" (searchChange)="buscar($event)" (action)="actuar($event)">
 *   <ng-template ukiTableCell="estado" let-fila><uki-badge [type]="fila.tipo">{{ fila.estado }}</uki-badge></ng-template>
 *   <button ukiTableBulkActions ukiButton variant="secondary" type="button">Descargar</button>
 * </uki-table>
 * ```
 */
@Component({
  selector: 'uki-table',
  imports: [
    NgTemplateOutlet,
    FormsModule,
    UkiButton,
    UkiCheckbox,
    UkiIcono,
    UkiSearch,
    UkiSelect,
    UkiSpinner,
    UkiTablePaginacion,
    UkiTooltip,
  ],
  template: `
    <ng-template #celda let-row let-col="col">
      @if (plantillas().get(col.key); as plantilla) {
        <ng-container [ngTemplateOutlet]="plantilla" [ngTemplateOutletContext]="{ $implicit: row }" />
      } @else {
        <span class="uki-table__texto">{{ valor(row, col) }}</span>
      }
    </ng-template>

    <ng-template #acciones let-row let-grande="grande">
      <div class="uki-table__botones">
        @for (a of accionesDe(row); track a) {
          <button
            type="button"
            class="uki-table__accion"
            [class.uki-table__accion--grande]="grande"
            [class.uki-table__accion--delete]="a === 'delete'"
            [attr.aria-label]="textoAccion(a) + ' ' + etiqueta(row)"
            [ukiTooltip]="textoAccion(a)"
            (click)="action.emit({ action: a, row })"
          >
            <uki-icono [nombre]="iconoAccion(a)" />
          </button>
        }
      </div>
    </ng-template>

    <ng-template #estado>
      @if (loading()) {
        <div class="uki-table__estado">
          <uki-spinner size="36" label="Cargando resultados" />
        </div>
      } @else {
        <div class="uki-table__estado">
          <p class="uki-table__vacio">{{ emptyMessage() }}</p>
          @if (busqueda()) {
            <button ukiButton variant="secondary" type="button" (click)="limpiarBusqueda()">Limpiar búsqueda</button>
          }
        </div>
      }
    </ng-template>

    <div class="uki-table__barra" [class.uki-table__barra--seleccion]="seleccionadas().size > 0">
      @if (seleccionadas().size > 0) {
        <button type="button" class="uki-table__quitar" aria-label="Quitar selección" (click)="quitarSeleccion()">
          <uki-icono nombre="x" />
        </button>
        <p class="uki-table__conteo-seleccion">{{ textoSeleccion() }}</p>
        <div class="uki-table__acciones-barra"><ng-content select="[ukiTableBulkActions]" /></div>
      } @else {
        <div class="uki-table__titulo">
          <!-- El nombre de la tabla es el <caption>; aquí solo se ve. -->
          <p class="uki-table__nombre" aria-hidden="true">{{ caption() }}</p>
          <p class="uki-table__conteo">{{ textoTotal() }}</p>
        </div>
        @if (loading()) {
          <uki-spinner class="uki-table__cargando" size="24" />
        }
        @if (searchable()) {
          <uki-search
            #buscador
            class="uki-table__buscar"
            [placeholder]="searchPlaceholder()"
            [ariaLabel]="'Buscar en ' + caption()"
            [resultados]="busqueda() && !loading() ? total() : null"
            (buscar)="alBuscar($event)"
          />
        }
        <div class="uki-table__acciones-barra"><ng-content select="[ukiTableToolbar]" /></div>
      }
    </div>

    @if (movil()) {
      @if (selectable() || columnasOrdenables().length) {
        <div class="uki-table__controles">
          @if (selectable() && rows().length) {
            <uki-checkbox
              [checked]="todasPagina()"
              [indeterminate]="algunasPagina()"
              (checkedChange)="seleccionarPagina($event)"
              >Seleccionar todas</uki-checkbox
            >
          }
          @if (columnasOrdenables().length) {
            <uki-select
              class="uki-table__ordenar"
              label="Ordenar por"
              placeholder="Sin orden"
              [options]="opcionesOrden()"
              [ngModel]="valorOrden()"
              (ngModelChange)="ordenarDesde($event)"
            />
          }
        </div>
      }
      @if (rows().length) {
        <ul #region class="uki-table__tarjetas" tabindex="-1" [attr.aria-label]="caption()" [attr.aria-busy]="loading() || null">
          @for (row of rows(); track clave(row)) {
            <li class="uki-table__tarjeta" [class.uki-table__tarjeta--seleccionada]="seleccionadas().has(clave(row))">
              <div class="uki-table__tarjeta-arriba">
                @if (selectable()) {
                  <uki-checkbox
                    [checked]="seleccionadas().has(clave(row))"
                    [ariaLabel]="'Seleccionar ' + etiqueta(row)"
                    (checkedChange)="alternarFila(row, $event)"
                  />
                }
                @if (columnaTitulo(); as col) {
                  <span class="uki-table__tarjeta-titulo">
                    <ng-container [ngTemplateOutlet]="celda" [ngTemplateOutletContext]="{ $implicit: row, col }" />
                  </span>
                }
                @if (columnaEstado(); as col) {
                  <span class="uki-table__tarjeta-estado">
                    <ng-container [ngTemplateOutlet]="celda" [ngTemplateOutletContext]="{ $implicit: row, col }" />
                  </span>
                }
              </div>
              <dl class="uki-table__campos">
                @for (col of camposTarjeta(); track col.key) {
                  <div class="uki-table__campo">
                    <dt>{{ col.header }}</dt>
                    <dd><ng-container [ngTemplateOutlet]="celda" [ngTemplateOutletContext]="{ $implicit: row, col }" /></dd>
                  </div>
                }
              </dl>
              @if (accionesDe(row).length) {
                <ng-container [ngTemplateOutlet]="acciones" [ngTemplateOutletContext]="{ $implicit: row, grande: true }" />
              }
            </li>
          }
        </ul>
      } @else {
        <ng-container [ngTemplateOutlet]="estado" />
      }
    } @else {
      <div #region class="uki-table__desplazamiento" role="region" tabindex="0" [attr.aria-labelledby]="idCaption">
        <table class="uki-table__tabla" [attr.aria-busy]="loading() || null">
          <caption class="uki-table__caption" [id]="idCaption">{{ caption() }}</caption>
          <thead>
            <tr>
              @if (selectable()) {
                <th scope="col" class="uki-table__seleccion">
                  <uki-checkbox
                    [checked]="todasPagina()"
                    [indeterminate]="algunasPagina()"
                    [disabled]="!rows().length"
                    ariaLabel="Seleccionar todas las filas"
                    (checkedChange)="seleccionarPagina($event)"
                  />
                </th>
              }
              @for (col of columns(); track col.key) {
                <th scope="col" [class.uki-table__fin]="col.align === 'end'" [attr.aria-sort]="col.sortable ? ariaSort(col) : null">
                  @if (col.sortable) {
                    <button type="button" class="uki-table__orden" (click)="ordenar(col)">
                      <span class="uki-table__encabezado">{{ col.header }}</span>
                      <uki-icono class="uki-table__icono-orden" [nombre]="iconoOrden(col)" />
                    </button>
                  } @else {
                    <span class="uki-table__encabezado">{{ col.header }}</span>
                  }
                </th>
              }
              @if (tieneAcciones()) {
                <th scope="col" class="uki-table__acciones-col"><span class="uki-table__encabezado">Acciones</span></th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track clave(row)) {
              <tr class="uki-table__fila" [class.uki-table__fila--seleccionada]="seleccionadas().has(clave(row))">
                @if (selectable()) {
                  <td class="uki-table__seleccion">
                    <uki-checkbox
                      [checked]="seleccionadas().has(clave(row))"
                      [ariaLabel]="'Seleccionar ' + etiqueta(row)"
                      (checkedChange)="alternarFila(row, $event)"
                    />
                  </td>
                }
                @for (col of columns(); track col.key) {
                  <td [class.uki-table__fin]="col.align === 'end'">
                    <ng-container [ngTemplateOutlet]="celda" [ngTemplateOutletContext]="{ $implicit: row, col }" />
                  </td>
                }
                @if (tieneAcciones()) {
                  <td class="uki-table__acciones-col">
                    <ng-container [ngTemplateOutlet]="acciones" [ngTemplateOutletContext]="{ $implicit: row, grande: false }" />
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td class="uki-table__celda-estado" [attr.colspan]="totalColumnas()">
                  <ng-container [ngTemplateOutlet]="estado" />
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    @if (total() > 0) {
      <uki-table-paginacion
        [page]="page()"
        [pageSize]="pageSize()"
        [total]="total()"
        [pageSizeOptions]="pageSizeOptions()"
        [movil]="movil()"
        (cambiarPagina)="irAPagina($event)"
        (cambiarTamano)="cambiarTamano($event)"
      />
    }
    <div class="uki-table__anuncio" role="status">{{ anuncio() }}</div>
  `,
  styleUrls: ['../capa/capa.css', './table.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'uki-table' },
})
export class UkiTable<T = unknown> {
  /** Nombre de la tabla: va en el `<caption>` y se ve en la barra superior. */
  readonly caption = input.required<string>();
  readonly columns = input.required<readonly UkiTableColumn<T>[]>();
  /** Solo las filas de la página actual, como las da el servidor. */
  readonly rows = input.required<readonly T[]>();
  /** Total de registros en el servidor (para el conteo y la paginación). */
  readonly total = input<number>(0);
  /** Clave única de cada fila. Por omisión, `row.id`. */
  readonly rowKey = input<(row: T) => UkiTableKey>((row) => (row as { id: UkiTableKey }).id);
  /** Nombre del registro en los `aria-label`: «Editar {rowLabel}». Por omisión, el valor de la primera columna. */
  readonly rowLabel = input<((row: T) => string) | null>(null);
  readonly selectable = input(false, { transform: booleanAttribute });
  /** Claves seleccionadas. Se conservan al cambiar de página, de orden o de búsqueda. */
  readonly selection = model<readonly UkiTableKey[]>([]);
  /** Acciones por fila, o una función que las decide por fila (un registro eliminado solo muestra `restore`). */
  readonly actions = input<readonly UkiTableActionType[] | ((row: T) => readonly UkiTableActionType[])>([]);
  readonly searchable = input(false, { transform: booleanAttribute });
  readonly searchPlaceholder = input('Buscar');
  readonly loading = input(false, { transform: booleanAttribute });
  /** Explica por qué no hay filas y qué hacer. */
  readonly emptyMessage = input('No hay registros.');
  /** Página actual, desde 1. */
  readonly page = model(1);
  readonly pageSize = model(10);
  readonly pageSizeOptions = input<readonly number[]>([5, 10, 25]);
  /** Orden por una columna, o `null`. */
  readonly sort = model<UkiTableSort | null>(null);
  /** Texto de búsqueda, con la espera de Search ya aplicada. */
  readonly searchChange = output<string>();
  readonly action = output<UkiTableActionEvent<T>>();

  protected readonly idCaption = `uki-table-caption-${++siguienteId}`;
  protected readonly movil = signal(false);
  protected readonly busqueda = signal('');
  protected readonly anuncio = signal('');

  private readonly celdas = contentChildren(UkiTableCell);
  private readonly buscador = viewChild<UkiSearch>('buscador');
  private readonly region = viewChild<ElementRef<HTMLElement>>('region');

  protected readonly plantillas = computed(() => {
    const mapa = new Map<string, TemplateRef<UkiTableCellContext<unknown>>>();
    for (const celda of this.celdas()) mapa.set(celda.key(), celda.template);
    return mapa;
  });
  protected readonly seleccionadas = computed(() => new Set(this.selection()));
  protected readonly tieneAcciones = computed(() => {
    const acciones = this.actions();
    return typeof acciones === 'function' || acciones.length > 0;
  });
  protected readonly totalColumnas = computed(
    () => this.columns().length + (this.selectable() ? 1 : 0) + (this.tieneAcciones() ? 1 : 0),
  );
  protected readonly todasPagina = computed(() => {
    const filas = this.rows();
    return filas.length > 0 && filas.every((f) => this.seleccionadas().has(this.clave(f)));
  });
  protected readonly algunasPagina = computed(
    () => !this.todasPagina() && this.rows().some((f) => this.seleccionadas().has(this.clave(f))),
  );
  protected readonly textoTotal = computed(() => (this.total() === 1 ? '1 registro' : `${this.total()} registros`));
  protected readonly textoSeleccion = computed(() => {
    const n = this.seleccionadas().size;
    return n === 1 ? '1 fila seleccionada' : `${n} filas seleccionadas`;
  });
  protected readonly columnasOrdenables = computed(() => this.columns().filter((c) => c.sortable));
  protected readonly opcionesOrden = computed<UkiSelectOption<string>[]>(() =>
    this.columnasOrdenables().flatMap((c) => [
      { value: `${c.key}:asc`, label: `${c.header}, ascendente` },
      { value: `${c.key}:desc`, label: `${c.header}, descendente` },
    ]),
  );
  protected readonly valorOrden = computed(() => {
    const orden = this.sort();
    return orden ? `${orden.key}:${orden.direction}` : null;
  });
  protected readonly columnaTitulo = computed(
    () => this.columns().find((c) => c.card === 'title') ?? this.columns().find((c) => c.card !== 'hidden' && c.card !== 'status'),
  );
  protected readonly columnaEstado = computed(() => this.columns().find((c) => c.card === 'status'));
  protected readonly camposTarjeta = computed(() =>
    this.columns().filter((c) => c !== this.columnaTitulo() && c !== this.columnaEstado() && c.card !== 'hidden'),
  );

  constructor() {
    // En teléfono se dibujan tarjetas en lugar de la tabla (Figma: nunca scroll horizontal en teléfonos).
    if (isPlatformBrowser(inject(PLATFORM_ID)) && typeof matchMedia === 'function') {
      const consulta = matchMedia(TELEFONO);
      this.movil.set(consulta.matches);
      const alCambiar = (evento: MediaQueryListEvent) => this.movil.set(evento.matches);
      consulta.addEventListener('change', alCambiar);
      inject(DestroyRef).onDestroy(() => consulta.removeEventListener('change', alCambiar));
    }
  }

  protected clave(row: T): UkiTableKey {
    return this.rowKey()(row);
  }

  protected valor(row: T, col: UkiTableColumn<T>): string {
    const v = col.value ? col.value(row) : (row as Record<string, unknown>)[col.key];
    return v === null || v === undefined ? '' : String(v);
  }

  protected etiqueta(row: T): string {
    const propia = this.rowLabel();
    if (propia) return propia(row);
    const primera = this.columns()[0];
    return primera ? this.valor(row, primera) : '';
  }

  protected accionesDe(row: T): readonly UkiTableActionType[] {
    const acciones = this.actions();
    return typeof acciones === 'function' ? acciones(row) : acciones;
  }

  protected textoAccion(accion: UkiTableActionType): string {
    return ACCIONES[accion].texto;
  }

  protected iconoAccion(accion: UkiTableActionType): UkiNombreIcono {
    return ACCIONES[accion].icono;
  }

  protected ariaSort(col: UkiTableColumn<T>): 'ascending' | 'descending' | 'none' {
    const orden = this.sort();
    if (orden?.key !== col.key) return 'none';
    return orden.direction === 'asc' ? 'ascending' : 'descending';
  }

  protected iconoOrden(col: UkiTableColumn<T>): UkiNombreIcono {
    const orden = this.ariaSort(col);
    return orden === 'ascending' ? 'arrow-up' : orden === 'descending' ? 'arrow-down' : 'arrows-vertical';
  }

  /** Ascendente y luego descendente; una columna nueva empieza en ascendente. */
  protected ordenar(col: UkiTableColumn<T>): void {
    const actual = this.sort();
    const direction = actual?.key === col.key && actual.direction === 'asc' ? 'desc' : 'asc';
    this.cambiarOrden({ key: col.key, direction });
  }

  protected ordenarDesde(valor: string | null): void {
    if (!valor) return;
    const [key, direction] = valor.split(':') as [string, 'asc' | 'desc'];
    this.cambiarOrden({ key, direction });
  }

  private cambiarOrden(orden: UkiTableSort): void {
    this.sort.set(orden);
    const header = this.columns().find((c) => c.key === orden.key)?.header ?? orden.key;
    this.anunciar(`Ordenado por ${header}, ${DIRECCION[orden.direction]}`);
  }

  protected alternarFila(row: T, marcada: boolean): void {
    const clave = this.clave(row);
    const actual = this.selection().filter((k) => k !== clave);
    this.cambiarSeleccion(marcada ? [...actual, clave] : actual);
  }

  protected seleccionarPagina(marcada: boolean): void {
    const pagina = this.rows().map((f) => this.clave(f));
    const resto = this.selection().filter((k) => !pagina.includes(k));
    this.cambiarSeleccion(marcada ? [...resto, ...pagina] : resto);
  }

  protected quitarSeleccion(): void {
    this.cambiarSeleccion([]);
    // El botón desaparece: el foco pasa a la tabla para no perderse.
    this.region()?.nativeElement.focus();
  }

  private cambiarSeleccion(claves: UkiTableKey[]): void {
    this.selection.set(claves);
    this.anunciar(claves.length ? this.textoSeleccion() : 'Sin filas seleccionadas');
  }

  protected irAPagina(pagina: number): void {
    this.page.set(pagina);
    this.anunciar(`Página ${pagina} de ${Math.max(1, Math.ceil(this.total() / this.pageSize()))}`);
  }

  protected cambiarTamano(tamano: number): void {
    this.pageSize.set(tamano);
    this.page.set(1);
  }

  protected alBuscar(texto: string): void {
    this.busqueda.set(texto);
    this.searchChange.emit(texto);
  }

  protected limpiarBusqueda(): void {
    // Search emite '' de inmediato (alBuscar) y devuelve el foco al campo.
    this.buscador()?.borrar();
  }

  private anunciar(texto: string): void {
    // Vaciar y escribir hace que el lector anuncie aunque el texto se repita.
    this.anuncio.set('');
    queueMicrotask(() => this.anuncio.set(texto));
  }
}
