import { Directive, inject, input, TemplateRef } from '@angular/core';

/** En la plantilla, `let-fila` es la fila sin tipo (como en las tablas de Angular Material). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UkiTableCellContext<T = any> {
  $implicit: T;
}

/**
 * Celda propia para una columna de `uki-table` (por ejemplo, un Badge con el estado). Se usa en la tabla y en la tarjeta
 * de teléfono.
 *
 * ```html
 * <ng-template ukiTableCell="estado" let-fila>
 *   <uki-badge [type]="fila.tipoEstado">{{ fila.estado }}</uki-badge>
 * </ng-template>
 * ```
 */
@Directive({ selector: 'ng-template[ukiTableCell]' })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class UkiTableCell<T = any> {
  /** `key` de la columna que dibuja. */
  readonly key = input.required<string>({ alias: 'ukiTableCell' });
  readonly template = inject<TemplateRef<UkiTableCellContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(_dir: UkiTableCell<T>, _ctx: unknown): _ctx is UkiTableCellContext<T> {
    return true;
  }
}

/** Acciones propias de la barra superior sin selección (por ejemplo, Exportar). */
@Directive({ selector: '[ukiTableToolbar]', host: { class: 'uki-table__accion-barra' } })
export class UkiTableToolbar {}

/** Acciones en lote de la barra superior cuando hay filas seleccionadas (Descargar, Eliminar). */
@Directive({ selector: '[ukiTableBulkActions]', host: { class: 'uki-table__accion-barra' } })
export class UkiTableBulkActions {}
