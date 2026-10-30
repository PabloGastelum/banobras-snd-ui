import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import {
  UkiBadge,
  UkiButton,
  UkiDialogService,
  UkiFeedbackType,
  UkiTable,
  UkiTableActionEvent,
  UkiTableActionType,
  UkiTableBulkActions,
  UkiTableCell,
  UkiTableColumn,
  UkiTableKey,
  UkiTableSort,
  UkiTableToolbar,
  UkiToastService,
} from '@banobras/uki';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';
import { DocToken } from '../doc/token';

interface Solicitud {
  folio: string;
  solicitante: string;
  tramite: string;
  fecha: string;
  monto: number;
  estado: string;
  tipo: UkiFeedbackType;
  eliminada?: boolean;
}

const SOLICITANTES = [
  'Municipio de Tlaquepaque', 'Gobierno de Durango', 'Municipio de Colima', 'Gobierno de Campeche', 'Municipio de Mérida',
  'Gobierno de Sonora', 'Municipio de León', 'Gobierno de Oaxaca', 'Municipio de Toluca', 'Gobierno de Zacatecas',
  'Municipio de Puebla', 'Gobierno de Tabasco',
];
const TRAMITES = ['Alta de proyecto', 'Cambio de responsable', 'Estado de cuenta', 'Revisión técnica'];
const ESTADOS: { estado: string; tipo: UkiFeedbackType }[] = [
  { estado: 'Aprobada', tipo: 'success' },
  { estado: 'En revisión', tipo: 'warning' },
  { estado: 'Recibida', tipo: 'info' },
  { estado: 'Rechazada', tipo: 'error' },
];

/** 48 solicitudes de ejemplo, siempre las mismas. */
const BASE: Solicitud[] = Array.from({ length: 48 }, (_, i) => {
  const dia = ((i * 7) % 28) + 1;
  const mes = (i % 9) + 1;
  return {
    folio: `SOL-2026-${String(101 + i).padStart(4, '0')}`,
    solicitante: SOLICITANTES[i % SOLICITANTES.length],
    tramite: TRAMITES[(i * 3) % TRAMITES.length],
    fecha: `2026-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`,
    monto: ((i * 7919) % 950 + 50) * 1000,
    ...ESTADOS[(i * 5) % ESTADOS.length],
  };
});

const MONEDA = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const FECHA = (iso: string) => iso.split('-').reverse().join('/');

const COLUMNAS: UkiTableColumn<Solicitud>[] = [
  { key: 'folio', header: 'Folio', sortable: true, card: 'title' },
  { key: 'solicitante', header: 'Solicitante', sortable: true },
  { key: 'tramite', header: 'Trámite' },
  { key: 'fecha', header: 'Fecha', sortable: true, value: (s) => FECHA(s.fecha) },
  { key: 'monto', header: 'Monto', sortable: true, align: 'end', value: (s) => MONEDA.format(s.monto) },
  { key: 'estado', header: 'Estado', card: 'status' },
];

const PARTES: Parte[] = [
  { selector: '.uki-table__barra', nombre: 'Barra superior', detalle: 'Título, conteo y Search · con filas seleccionadas, barra de acciones en lote (table/row-selected) · 72 px', lado: 'arriba', alinear: 'inicio' },
  { selector: 'thead th:nth-child(2)', nombre: 'Encabezado', detalle: '<th scope="col"> · table/header-background · Label Bold text/secondary · botón de orden con aria-sort · 48 px', lado: 'arriba' },
  { selector: 'thead th:first-child', nombre: 'Columna de selección', detalle: '56 px · Checkbox por fila; el del encabezado selecciona la página y queda indeterminado', lado: 'arriba' },
  { selector: 'tbody tr:nth-child(2) td:nth-child(3)', nombre: 'Filas', detalle: '<td> · 52 px · Body/Small · borde table/border · pares table/row-striped · seleccionadas table/row-selected', lado: 'abajo' },
  { selector: 'thead th:nth-child(3)', nombre: 'Columna de texto', detalle: 'Texto a la izquierda e importes a la derecha · máximo 288 px con elipsis', lado: 'arriba' },
  { selector: 'tbody tr:first-child .uki-table__botones', nombre: 'Columna de acciones', detalle: 'Ver, Editar, Eliminar (Restaurar en eliminados) · 32 px · aria-label con el registro + tooltip', lado: 'abajo' },
  { selector: '.uki-table-paginacion__paginas', nombre: 'Paginación', detalle: '<nav aria-label="Paginación"> · rango «1–10 de 48» · páginas con aria-current · anterior y siguiente', lado: 'abajo' },
  { selector: '.uki-table-paginacion__filas', nombre: 'Filas por página', detalle: '5, 10 o 25 · al cambiar vuelve a la página 1', lado: 'abajo', alinear: 'inicio' },
];

const COMPORTAMIENTO = [
  ['Selección múltiple', 'Casilla por fila + seleccionar todas', 'Selecciona filas y actúa sobre todas desde la barra superior.', 'aria-label por casilla; la del encabezado queda indeterminada.'],
  ['Filas alternas', 'Cada fila par', 'Alterna table/row y table/row-striped; hover y selección ganan a la franja.', 'Nunca es la única pista: el borde entre filas se queda.'],
  ['Orden', 'Una columna a la vez', 'Clic en el encabezado: ascendente y luego descendente. El servidor ordena.', '<button> dentro del <th> + aria-sort; se anuncia el orden.'],
  ['Búsqueda', 'Mientras se escribe', 'Emite el texto a los 300 ms; × borra; sin resultados muestra el vacío.', 'aria-label + número de resultados anunciado.'],
  ['Paginación', '5, 10 o 25 filas por página', 'Rango «1–10 de 48», páginas numeradas y anterior/siguiente; conserva búsqueda, orden y selección.', '<nav aria-label="Paginación"> y aria-current.'],
  ['Acciones por fila', 'Ver, Editar, Eliminar', 'Botones de ícono en la columna Acciones. Eliminar pide confirmación (UkiDialogService).', 'aria-label con el registro («Editar SOL-2026-0101») + tooltip.'],
  ['Teléfono', 'Tarjetas debajo de 768 px', 'Cada fila es una tarjeta; quedan seleccionar todas, ordenar y la paginación compacta.', 'Mismo orden y etiquetas que las columnas; acciones de 40 px.'],
];

const TECLAS = [
  ['Tab', 'Recorre la región de la tabla (scroll horizontal con flechas), los botones de orden, las casillas, las acciones y la paginación.'],
  ['Enter · Espacio', 'Ordenan desde el encabezado y activan acciones y páginas.'],
  ['Espacio', 'Marca o desmarca la casilla enfocada.'],
  ['Esc', 'En la búsqueda, borra el texto; sobre una acción, oculta el tooltip.'],
];

interface Consulta {
  page: number;
  pageSize: number;
  sort: UkiTableSort | null;
  busqueda: string;
}

/** «Servidor» de la documentación: filtra, ordena y pagina como lo haría el backend del sistema. */
function consultar(datos: Solicitud[], { page, pageSize, sort, busqueda }: Consulta) {
  const texto = busqueda.trim().toLowerCase();
  let filas = texto
    ? datos.filter((s) => `${s.folio} ${s.solicitante} ${s.tramite}`.toLowerCase().includes(texto))
    : [...datos];
  if (sort) {
    const signo = sort.direction === 'asc' ? 1 : -1;
    const k = sort.key as keyof Solicitud;
    filas = filas.sort((a, b) => ((a[k] ?? '') > (b[k] ?? '') ? signo : (a[k] ?? '') < (b[k] ?? '') ? -signo : 0));
  }
  return { filas: filas.slice((page - 1) * pageSize, page * pageSize), total: filas.length };
}

@Component({
  selector: 'demo-table',
  imports: [UkiTable, UkiTableCell, UkiTableToolbar, UkiTableBulkActions, UkiBadge, UkiButton, DocAnatomia, DocToken, DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Table</h1>
          <p class="doc-descripcion">
            La tabla muestra listas de registros, como las solicitudes de un programa, para que la gente los compare, los
            encuentre y actúe sobre ellos. Combina la distribución de Bootstrap (filas alternas y paginación numerada) con la
            interacción de Material (barra de selección, flechas de orden y filas por página).
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsalo para</h3>
            <p>Listas de registros con varios datos que se comparan o se trabajan en lote. Para un solo registro usa una página de detalle; para 3 campos o menos, una lista simple.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Fácil de recorrer</h3>
            <p>Texto a la izquierda, importes a la derecha, el mismo formato de fecha y encabezados cortos. Las filas alternas de 52 px ayudan a seguir cada línea.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Datos del servidor</h3>
            <p>La tabla recibe una página y emite eventos (orden, búsqueda, página, acciones). No ordena, no filtra ni pagina por su cuenta: esas reglas viven en el servidor.</p>
          </article>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-atomos">
        <header class="doc-encabezado">
          <h2 id="t-atomos" class="doc-titulo">Átomos</h2>
          <p class="doc-descripcion">
            Las piezas más pequeñas: los botones de acción (Ver, Editar, Restaurar, Comentar y Eliminar, en rojo), el botón de
            página y anterior/siguiente. Pasa el puntero para ver el tooltip.
          </p>
        </header>
        <div class="doc-visual atomos uki-table-atomos">
          <uki-table
            class="ancho"
            caption="Acciones por fila"
            [columns]="columnasAtomos"
            [rows]="filaAtomos"
            [total]="1"
            [actions]="todasLasAcciones"
            [rowLabel]="nombreAtomo"
            data-prueba="atomos"
          />
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-moleculas">
        <header class="doc-encabezado">
          <h2 id="t-moleculas" class="doc-titulo">Moléculas</h2>
          <p class="doc-descripcion">
            Bloques hechos con los átomos: la barra superior (búsqueda o acciones en lote), la paginación y el estado vacío,
            que explica por qué no hay filas y ofrece «Limpiar búsqueda».
          </p>
        </header>
        <demo-ejemplo titulo="Estado vacío" nombre="vacio" [html]="codigo.vacio">
          <uki-table
            class="ancho"
            caption="Solicitudes"
            [columns]="columnas"
            [rows]="[]"
            searchable
            emptyMessage="No hay solicitudes que coincidan con «Fernandes». Revisa la ortografía o prueba con otro término."
            data-prueba="tabla-vacia"
          />
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-organismos">
        <header class="doc-encabezado">
          <h2 id="t-organismos" class="doc-titulo">Organismos</h2>
          <p class="doc-descripcion">
            La tabla completa con datos de ejemplo. Un «servidor» simulado de la documentación ordena, busca y pagina con una
            espera de 300 ms, así que también se ve el estado cargando. Selecciona filas para ver la barra de acciones en
            lote, y prueba Eliminar: pide confirmación con un modal.
          </p>
        </header>
        <demo-ejemplo titulo="Solicitudes" nombre="solicitudes" [html]="codigo.html" [ts]="codigo.ts">
          <uki-table
            class="ancho"
            caption="Solicitudes"
            data-prueba="tabla"
            [columns]="columnas"
            [rows]="resultado().filas"
            [total]="resultado().total"
            [rowKey]="porFolio"
            [rowLabel]="nombre"
            selectable
            [(selection)]="seleccion"
            [actions]="acciones"
            searchable
            searchPlaceholder="Buscar por folio o solicitante"
            [loading]="cargando()"
            [(page)]="pagina"
            [(pageSize)]="tamano"
            [(sort)]="orden"
            emptyMessage="No hay solicitudes que coincidan. Revisa la ortografía o prueba con otro término."
            (searchChange)="buscar($event)"
            (action)="actuar($event)"
          >
            <ng-template ukiTableCell="estado" let-fila>
              <uki-badge [type]="fila.tipo">{{ fila.estado }}</uki-badge>
            </ng-template>
            <button ukiTableToolbar ukiButton variant="secondary" type="button" (click)="exportar()">Exportar</button>
            <button ukiTableBulkActions ukiButton variant="secondary" type="button" (click)="descargar()">Descargar</button>
            <button ukiTableBulkActions ukiButton variant="danger" type="button" (click)="eliminarSeleccion()">Eliminar</button>
          </uki-table>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">
            Ocho partes forman la tabla. Los colores vienen de los tokens table y checkbox, así que siguen los temas guinda y
            verde.
          </p>
        </header>
        <demo-anatomia [partes]="partes" [escala]="0.55">
          <uki-table
            class="anatomia-tabla"
            caption="Solicitudes"
            [columns]="columnasAnatomia"
            [rows]="filasAnatomia"
            [total]="48"
            [rowKey]="porFolio"
            selectable
            [selection]="['SOL-2026-0102']"
            [actions]="['view', 'edit', 'delete']"
            searchable
          />
        </demo-anatomia>
      </section>

      <section class="doc-seccion" aria-labelledby="t-comportamiento">
        <header class="doc-encabezado">
          <h2 id="t-comportamiento" class="doc-titulo">Comportamiento</h2>
          <p class="doc-descripcion">Cómo funciona cada parte y qué necesita para la accesibilidad.</p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Comportamiento de la tabla</caption>
            <thead>
              <tr>
                <th scope="col">Función</th>
                <th scope="col">Cómo funciona</th>
                <th scope="col">Accesibilidad</th>
              </tr>
            </thead>
            <tbody>
              @for (c of comportamiento; track c[0]) {
                <tr>
                  <th scope="row">{{ c[0] }}<small>{{ c[1] }}</small></th>
                  <td>{{ c[2] }}</td>
                  <td>{{ c[3] }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-tokens">
        <header class="doc-encabezado">
          <h2 id="t-tokens" class="doc-titulo">Tokens por parte y estado</h2>
          <p class="doc-descripcion">Hover y selección ganan a la franja; el borde entre filas se queda siempre.</p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Tokens de Table</caption>
            <thead>
              <tr>
                <th scope="col">Parte · estado</th>
                <th scope="col">Fondo</th>
                <th scope="col">Texto o borde</th>
              </tr>
            </thead>
            <tbody>
              @for (t of tokens; track t[0]) {
                <tr>
                  <th scope="row">{{ t[0] }}</th>
                  <td><demo-token [nombre]="t[1]" /></td>
                  <td><demo-token [nombre]="t[2]" [nota]="t[3]" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-teclado">
        <header class="doc-encabezado">
          <h2 id="t-teclado" class="doc-titulo">Teclado</h2>
          <p class="doc-descripcion">Todos los controles son nativos (botones, casillas y un select), en el orden en que se ven.</p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Teclas</caption>
            <thead>
              <tr>
                <th scope="col">Tecla</th>
                <th scope="col">Qué hace</th>
              </tr>
            </thead>
            <tbody>
              @for (t of teclas; track t[0]) {
                <tr>
                  <th scope="row"><kbd>{{ t[0] }}</kbd></th>
                  <td>{{ t[1] }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: `
    .ancho {
      width: 100%;
    }
    .atomos {
      justify-content: flex-start;
    }
    .anatomia-tabla {
      width: 1100px;
    }
    kbd {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: var(--font-size-caption);
    }
  `,
})
export default class TablePagina {
  private readonly dialogos = inject(UkiDialogService);
  private readonly avisos = inject(UkiToastService);

  protected readonly columnas = COLUMNAS;
  protected readonly columnasAnatomia = COLUMNAS.slice(0, 5);
  protected readonly filasAnatomia = BASE.slice(0, 3);
  protected readonly columnasAtomos: UkiTableColumn<{ id: string }>[] = [{ key: 'id', header: 'Registro' }];
  protected readonly filaAtomos = [{ id: 'SOL-2026-0101' }];
  protected readonly todasLasAcciones: UkiTableActionType[] = ['view', 'edit', 'restore', 'comment', 'delete'];
  protected readonly partes = PARTES;
  protected readonly comportamiento = COMPORTAMIENTO;
  protected readonly teclas = TECLAS;
  protected readonly tokens = [
    ['Encabezado', 'table/header-background', 'text/secondary', 'Label Bold'],
    ['Fila impar', 'table/row', 'table/border', 'borde inferior 1 px'],
    ['Fila par', 'table/row-striped', 'table/border', 'borde inferior 1 px'],
    ['Fila · Hover', 'table/row-hover', 'text/primary', 'Body/Small'],
    ['Fila · Selected', 'table/row-selected', 'text/primary', ''],
    ['Barra · con selección', 'table/row-selected', 'text/primary', ''],
    ['Acción · Hover', 'button/tint', 'icon/primary', 'Eliminar: feedback/error/*'],
    ['Página actual', 'checkbox/selected', 'text/inverse', ''],
    ['Página · Hover', 'button/tint', 'text/primary', ''],
  ];

  private readonly datos = signal(BASE);
  protected readonly pagina = signal(1);
  protected readonly tamano = signal(10);
  protected readonly orden = signal<UkiTableSort | null>({ key: 'fecha', direction: 'desc' });
  protected readonly busqueda = signal('');
  protected readonly seleccion = signal<readonly UkiTableKey[]>([]);
  protected readonly cargando = signal(false);
  protected readonly resultado = signal(consultar(BASE, { page: 1, pageSize: 10, sort: { key: 'fecha', direction: 'desc' }, busqueda: '' }));

  protected readonly porFolio = (s: Solicitud) => s.folio;
  protected readonly nombre = (s: Solicitud) => `solicitud ${s.folio}`;
  protected readonly nombreAtomo = (s: { id: string }) => s.id;
  protected readonly acciones = (s: Solicitud): UkiTableActionType[] => (s.eliminada ? ['restore'] : ['view', 'edit', 'delete']);

  constructor() {
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    let primera = true;
    inject(DestroyRef).onDestroy(() => clearTimeout(temporizador));
    // Cada cambio de página, orden o búsqueda «pide» la página al servidor simulado.
    effect(() => {
      const consulta: Consulta = { page: this.pagina(), pageSize: this.tamano(), sort: this.orden(), busqueda: this.busqueda() };
      const datos = this.datos();
      if (primera) {
        primera = false;
        return;
      }
      untracked(() => this.cargando.set(true));
      clearTimeout(temporizador);
      temporizador = setTimeout(() => {
        this.resultado.set(consultar(datos, consulta));
        this.cargando.set(false);
      }, 300);
    });
  }

  protected buscar(texto: string): void {
    this.busqueda.set(texto);
    this.pagina.set(1);
  }

  protected async actuar({ action, row }: UkiTableActionEvent<Solicitud>): Promise<void> {
    if (action === 'delete') {
      const confirmado = await this.dialogos.confirm({
        title: '¿Eliminar la solicitud?',
        message: `Se eliminará ${row.folio} de ${row.solicitante}. Podrás restaurarla desde esta tabla.`,
        confirmLabel: 'Eliminar',
        destructive: true,
      });
      if (!confirmado) return;
      this.marcarEliminada(row.folio, true);
      this.avisos.success('Solicitud eliminada', row.folio);
    } else if (action === 'restore') {
      this.marcarEliminada(row.folio, false);
      this.avisos.success('Solicitud restaurada', row.folio);
    } else {
      this.avisos.info(action === 'view' ? 'Ver solicitud' : 'Editar solicitud', `${row.folio}: en un sistema real, se abre su página.`);
    }
  }

  protected exportar(): void {
    this.avisos.info('Exportación iniciada', 'En un sistema real, el servidor genera el archivo.');
  }

  protected descargar(): void {
    this.avisos.info('Descarga iniciada', `${this.seleccion().length} solicitudes seleccionadas.`);
  }

  protected async eliminarSeleccion(): Promise<void> {
    const total = this.seleccion().length;
    const confirmado = await this.dialogos.confirm({
      title: `¿Eliminar ${total === 1 ? '1 solicitud' : `${total} solicitudes`}?`,
      message: 'Podrás restaurarlas desde esta tabla.',
      confirmLabel: 'Eliminar',
      destructive: true,
    });
    if (!confirmado) return;
    for (const folio of this.seleccion()) this.marcarEliminada(String(folio), true);
    this.seleccion.set([]);
    this.avisos.success('Solicitudes eliminadas');
  }

  private marcarEliminada(folio: string, eliminada: boolean): void {
    this.datos.update((datos) => datos.map((s) => (s.folio === folio ? { ...s, eliminada } : s)));
  }

  protected readonly codigo = {
    vacio: `<uki-table caption="Solicitudes" [columns]="columnas" [rows]="[]" searchable
           emptyMessage="No hay solicitudes que coincidan con «Fernandes». Revisa la ortografía o prueba con otro término." />`,
    html: `<uki-table
  caption="Solicitudes"
  [columns]="columnas"
  [rows]="pagina().filas"
  [total]="pagina().total"
  [rowKey]="porFolio"
  [rowLabel]="nombre"
  selectable
  [(selection)]="seleccion"
  [actions]="acciones"
  searchable
  searchPlaceholder="Buscar por folio o solicitante"
  [loading]="cargando()"
  [(page)]="numeroPagina"
  [(pageSize)]="tamano"
  [(sort)]="orden"
  emptyMessage="No hay solicitudes que coincidan."
  (searchChange)="buscar($event)"
  (action)="actuar($event)"
>
  <ng-template ukiTableCell="estado" let-fila>
    <uki-badge [type]="fila.tipo">{{ fila.estado }}</uki-badge>
  </ng-template>
  <button ukiTableToolbar ukiButton variant="secondary" type="button">Exportar</button>
  <button ukiTableBulkActions ukiButton variant="secondary" type="button">Descargar</button>
  <button ukiTableBulkActions ukiButton variant="danger" type="button">Eliminar</button>
</uki-table>`,
    ts: `import { UkiTable, UkiTableCell, UkiTableColumn, UkiTableSort, UkiTableActionEvent } from '@banobras/uki';

protected readonly columnas: UkiTableColumn<Solicitud>[] = [
  { key: 'folio', header: 'Folio', sortable: true, card: 'title' },
  { key: 'solicitante', header: 'Solicitante', sortable: true },
  { key: 'fecha', header: 'Fecha', sortable: true, value: (s) => formatearFecha(s.fecha) },
  { key: 'monto', header: 'Monto', sortable: true, align: 'end', value: (s) => moneda.format(s.monto) },
  { key: 'estado', header: 'Estado', card: 'status' },
];
protected readonly porFolio = (s: Solicitud) => s.folio;
protected readonly nombre = (s: Solicitud) => \`solicitud \${s.folio}\`;
protected readonly acciones = (s: Solicitud) => (s.eliminada ? ['restore'] : ['view', 'edit', 'delete']);

// La tabla no ordena, filtra ni pagina: el servidor responde con la página pedida.
protected readonly numeroPagina = signal(1);
protected readonly tamano = signal(10);
protected readonly orden = signal<UkiTableSort | null>({ key: 'fecha', direction: 'desc' });
protected readonly busqueda = signal('');
protected readonly pagina = toSignal(/* observable que pide al servidor con estos valores */);

protected async actuar({ action, row }: UkiTableActionEvent<Solicitud>): Promise<void> {
  if (action !== 'delete') return;
  const confirmado = await this.dialogos.confirm({
    title: '¿Eliminar la solicitud?', message: \`Se eliminará \${row.folio}.\`,
    confirmLabel: 'Eliminar', destructive: true,
  });
  if (confirmado) this.solicitudes.eliminar(row.folio);
}`,
  };
}
