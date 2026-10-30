import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { matchMediaFalso } from '../pruebas/jsdom';
import { paginasVisibles } from './table-paginacion';
import { UkiTable, UkiTableActionEvent, UkiTableActionType, UkiTableColumn, UkiTableKey, UkiTableSort } from './table';
import { UkiTableBulkActions, UkiTableCell } from './table.directivas';

interface Solicitud {
  folio: string;
  solicitante: string;
  monto: number;
  estado: string;
  eliminada?: boolean;
}

const FILAS: Solicitud[] = [
  { folio: 'SOL-0141', solicitante: 'Ana Ruiz', monto: 1200, estado: 'Aprobada' },
  { folio: 'SOL-0142', solicitante: 'Luis Gómez', monto: 98000, estado: 'En revisión' },
  { folio: 'SOL-0143', solicitante: 'Marta Díaz', monto: 450, estado: 'Rechazada', eliminada: true },
];

const COLUMNAS: UkiTableColumn<Solicitud>[] = [
  { key: 'folio', header: 'Folio', sortable: true, card: 'title' },
  { key: 'solicitante', header: 'Solicitante', sortable: true },
  { key: 'monto', header: 'Monto', align: 'end', value: (f) => `$${f.monto}` },
  { key: 'estado', header: 'Estado', card: 'status' },
];

@Component({
  imports: [UkiTable, UkiTableCell, UkiTableBulkActions],
  template: `
    <uki-table
      caption="Solicitudes"
      [columns]="columnas"
      [rows]="filas()"
      [total]="total()"
      [rowKey]="porFolio"
      [rowLabel]="nombre"
      [selectable]="seleccionable()"
      [(selection)]="seleccion"
      [actions]="acciones"
      searchable
      [loading]="cargando()"
      [(page)]="pagina"
      [(pageSize)]="tamano"
      [(sort)]="orden"
      emptyMessage="No hay solicitudes que coincidan."
      (searchChange)="busquedas.push($event)"
      (action)="eventos.push($event)"
    >
      <ng-template ukiTableCell="estado" let-fila><strong class="estado">{{ fila.estado }}</strong></ng-template>
      <button ukiTableBulkActions type="button" id="descargar">Descargar</button>
    </uki-table>
  `,
})
class Anfitrion {
  readonly columnas = COLUMNAS;
  readonly filas = signal<Solicitud[]>(FILAS);
  readonly total = signal(48);
  readonly seleccionable = signal(true);
  readonly cargando = signal(false);
  readonly seleccion = signal<readonly UkiTableKey[]>([]);
  readonly pagina = signal(1);
  readonly tamano = signal(10);
  readonly orden = signal<UkiTableSort | null>(null);
  readonly busquedas: string[] = [];
  readonly eventos: UkiTableActionEvent<Solicitud>[] = [];
  readonly porFolio = (f: Solicitud) => f.folio;
  readonly nombre = (f: Solicitud) => `solicitud ${f.folio}`;
  readonly acciones = (f: Solicitud): UkiTableActionType[] => (f.eliminada ? ['restore'] : ['view', 'edit', 'delete']);
}

async function montar({ movil = false } = {}) {
  matchMediaFalso(movil);
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const fixture = TestBed.createComponent(Anfitrion);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const raiz: HTMLElement = fixture.nativeElement;
  const anfitrion = fixture.componentInstance;
  const actualizar = async () => {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  };
  const filas = () => [...raiz.querySelectorAll<HTMLTableRowElement>('tbody tr')];
  const encabezados = () => [...raiz.querySelectorAll<HTMLTableCellElement>('thead th')];
  const anuncio = () => raiz.querySelector('.uki-table__anuncio')!.textContent!.trim();
  const casilla = (contenedor: Element) => contenedor.querySelector<HTMLInputElement>('input[type=checkbox]')!;
  return { fixture, raiz, anfitrion, actualizar, filas, encabezados, anuncio, casilla };
}

describe('UkiTable', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    document.body.replaceChildren();
  });

  it('dibuja una tabla semántica con caption, th scope="col" y las celdas de la página', async () => {
    const { raiz, filas, encabezados } = await montar();
    const tabla = raiz.querySelector('table')!;
    expect(tabla.querySelector('caption')!.textContent!.trim()).toBe('Solicitudes');
    const region = raiz.querySelector('[role=region]')!;
    expect(region.getAttribute('tabindex')).toBe('0');
    expect(region.getAttribute('aria-labelledby')).toBe(tabla.querySelector('caption')!.id);
    expect(encabezados().map((th) => th.getAttribute('scope'))).toEqual(Array(6).fill('col'));
    expect(encabezados().map((th) => th.textContent!.trim()).slice(1)).toEqual(['Folio', 'Solicitante', 'Monto', 'Estado', 'Acciones']);
    expect(filas().length).toBe(3);
    const celdas = [...filas()[1].querySelectorAll('td')].map((td) => td.textContent!.trim());
    expect(celdas.slice(1, 5)).toEqual(['SOL-0142', 'Luis Gómez', '$98000', 'En revisión']);
    expect(filas()[1].querySelector('.estado')).not.toBeNull();
    expect(filas()[1].querySelectorAll('td')[3].classList).toContain('uki-table__fin');
    expect(raiz.querySelector('.uki-table__conteo')!.textContent).toBe('48 registros');
  });

  it('ordena con un botón en el encabezado: ascendente, luego descendente, con aria-sort y anuncio', async () => {
    const { anfitrion, encabezados, actualizar, anuncio } = await montar();
    const folio = encabezados()[1];
    expect(folio.getAttribute('aria-sort')).toBe('none');
    expect(encabezados()[3].getAttribute('aria-sort')).toBeNull();
    folio.querySelector('button')!.click();
    await actualizar();
    expect(anfitrion.orden()).toEqual({ key: 'folio', direction: 'asc' });
    expect(encabezados()[1].getAttribute('aria-sort')).toBe('ascending');
    expect(anuncio()).toBe('Ordenado por Folio, ascendente');
    encabezados()[1].querySelector('button')!.click();
    await actualizar();
    expect(anfitrion.orden()).toEqual({ key: 'folio', direction: 'desc' });
    expect(encabezados()[1].getAttribute('aria-sort')).toBe('descending');
    encabezados()[2].querySelector('button')!.click();
    await actualizar();
    expect(anfitrion.orden()).toEqual({ key: 'solicitante', direction: 'asc' });
    expect(encabezados()[1].getAttribute('aria-sort')).toBe('none');
  });

  it('selecciona por clave, «Seleccionar todas» queda indeterminado y la barra muestra las acciones en lote', async () => {
    const { raiz, anfitrion, filas, encabezados, actualizar, casilla } = await montar();
    const todas = casilla(encabezados()[0]);
    expect(todas.getAttribute('aria-label')).toBe('Seleccionar todas las filas');
    expect(casilla(filas()[0]).getAttribute('aria-label')).toBe('Seleccionar solicitud SOL-0141');
    expect(raiz.querySelector('#descargar')).toBeNull();

    casilla(filas()[0]).click();
    await actualizar();
    expect(anfitrion.seleccion()).toEqual(['SOL-0141']);
    expect(casilla(encabezados()[0]).indeterminate).toBe(true);
    expect(filas()[0].classList).toContain('uki-table__fila--seleccionada');
    expect(raiz.querySelector('.uki-table__conteo-seleccion')!.textContent).toBe('1 fila seleccionada');
    expect(raiz.querySelector('#descargar')).not.toBeNull();

    casilla(encabezados()[0]).click();
    await actualizar();
    expect(anfitrion.seleccion()).toEqual(['SOL-0141', 'SOL-0142', 'SOL-0143']);
    expect(casilla(encabezados()[0]).checked).toBe(true);

    // Otra página: la selección se conserva y «todas» se calcula sobre las filas visibles.
    anfitrion.filas.set([{ folio: 'SOL-0150', solicitante: 'Eva Paz', monto: 1, estado: 'Aprobada' }]);
    await actualizar();
    expect(casilla(encabezados()[0]).checked).toBe(false);
    expect(raiz.querySelector('.uki-table__conteo-seleccion')!.textContent).toBe('3 filas seleccionadas');

    raiz.querySelector<HTMLButtonElement>('[aria-label="Quitar selección"]')!.click();
    await actualizar();
    expect(anfitrion.seleccion()).toEqual([]);
    expect(document.activeElement).toBe(raiz.querySelector('[role=region]'));
  });

  it('las acciones nombran el registro, emiten el evento y pueden cambiar por fila', async () => {
    const { anfitrion, filas, actualizar } = await montar();
    const botones = (i: number) => [...filas()[i].querySelectorAll<HTMLButtonElement>('.uki-table__accion')];
    expect(botones(0).map((b) => b.getAttribute('aria-label'))).toEqual([
      'Ver solicitud SOL-0141',
      'Editar solicitud SOL-0141',
      'Eliminar solicitud SOL-0141',
    ]);
    expect(botones(2).map((b) => b.getAttribute('aria-label'))).toEqual(['Restaurar solicitud SOL-0143']);
    botones(1)[2].click();
    await actualizar();
    expect(anfitrion.eventos).toEqual([{ action: 'delete', row: FILAS[1] }]);
  });

  it('muestra un tooltip solo visual al enfocar una acción', async () => {
    const { raiz, filas, actualizar } = await montar();
    const ver = filas()[0].querySelector<HTMLButtonElement>('.uki-table__accion')!;
    ver.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await actualizar();
    const tooltip = raiz.querySelector('.uki-tooltip')!;
    expect(tooltip.textContent).toBe('Ver');
    expect(tooltip.getAttribute('aria-hidden')).toBe('true');
    const esc = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    ver.dispatchEvent(esc);
    expect(esc.defaultPrevented).toBe(true);
    expect(raiz.querySelector('.uki-tooltip')).toBeNull();
  });

  it('pagina con páginas numeradas, aria-current y filas por página que vuelven a la página 1', async () => {
    const { raiz, anfitrion, actualizar, anuncio } = await montar();
    const nav = raiz.querySelector('nav[aria-label="Paginación"]')!;
    expect(nav.querySelector('.uki-table-paginacion__rango')!.textContent).toBe('1–10 de 48');
    const paginas = () => [...nav.querySelectorAll<HTMLButtonElement>('button[aria-label^="Página "]:not([aria-label*="anterior"]):not([aria-label*="siguiente"])')];
    expect(paginas().map((b) => b.textContent!.trim())).toEqual(['1', '2', '3', '4', '5']);
    expect(paginas()[0].getAttribute('aria-current')).toBe('page');
    expect(nav.querySelector('[aria-label="Página anterior"]')!.getAttribute('aria-disabled')).toBe('true');
    nav.querySelector<HTMLButtonElement>('[aria-label="Página siguiente"]')!.click();
    await actualizar();
    expect(anfitrion.pagina()).toBe(2);
    expect(anuncio()).toBe('Página 2 de 5');
    const select = nav.querySelector<HTMLSelectElement>('select')!;
    expect(raiz.querySelector(`label[for="${select.id}"]`)!.textContent).toBe('Filas por página:');
    select.value = '25';
    select.dispatchEvent(new Event('change'));
    await actualizar();
    expect(anfitrion.tamano()).toBe(25);
    expect(anfitrion.pagina()).toBe(1);
  });

  it('calcula las páginas visibles con «…»', () => {
    expect(paginasVisibles(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(paginasVisibles(1, 10)).toEqual([1, 2, 3, 4, '…', 10]);
    expect(paginasVisibles(5, 10)).toEqual([1, '…', 4, 5, 6, '…', 10]);
    expect(paginasVisibles(10, 10)).toEqual([1, '…', 7, 8, 9, 10]);
    expect(paginasVisibles(3, 10)).toEqual([1, 2, 3, 4, '…', 10]);
  });

  it('sin filas muestra el vacío; con búsqueda ofrece «Limpiar búsqueda», que emite una búsqueda vacía', async () => {
    const { raiz, anfitrion, actualizar } = await montar();
    anfitrion.filas.set([]);
    anfitrion.total.set(0);
    await actualizar();
    expect(raiz.querySelector('.uki-table__vacio')!.textContent).toBe('No hay solicitudes que coincidan.');
    expect(raiz.querySelector('nav[aria-label="Paginación"]')).toBeNull();
    expect([...raiz.querySelectorAll('button')].some((b) => b.textContent!.includes('Limpiar búsqueda'))).toBe(false);

    const campo = raiz.querySelector<HTMLInputElement>('input[type=search]')!;
    expect(campo.getAttribute('aria-label')).toBe('Buscar en Solicitudes');
    campo.value = 'Fernandes';
    campo.dispatchEvent(new Event('input'));
    await new Promise((r) => setTimeout(r, 350));
    await actualizar();
    expect(anfitrion.busquedas).toEqual(['Fernandes']);
    const limpiar = [...raiz.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent!.includes('Limpiar búsqueda'))!;
    limpiar.click();
    await actualizar();
    expect(anfitrion.busquedas).toEqual(['Fernandes', '']);
  });

  it('cargando: sin filas muestra el Spinner en el cuerpo; con filas, aria-busy y Spinner en la barra', async () => {
    const { raiz, anfitrion, actualizar } = await montar();
    anfitrion.cargando.set(true);
    await actualizar();
    expect(raiz.querySelector('table')!.getAttribute('aria-busy')).toBe('true');
    expect(raiz.querySelector('.uki-table__barra uki-spinner')).not.toBeNull();
    anfitrion.filas.set([]);
    await actualizar();
    expect(raiz.querySelector('tbody uki-spinner')!.getAttribute('aria-label')).toBe('Cargando resultados');
  });

  it('en teléfono dibuja tarjetas con título, estado, campos y acciones de 40 px, sin tabla', async () => {
    const { raiz } = await montar({ movil: true });
    expect(raiz.querySelector('table')).toBeNull();
    const tarjetas = raiz.querySelectorAll('.uki-table__tarjeta');
    expect(tarjetas.length).toBe(3);
    const primera = tarjetas[0];
    expect(primera.querySelector('.uki-table__tarjeta-titulo')!.textContent!.trim()).toBe('SOL-0141');
    expect(primera.querySelector('.uki-table__tarjeta-estado .estado')).not.toBeNull();
    expect([...primera.querySelectorAll('dt')].map((dt) => dt.textContent)).toEqual(['Solicitante', 'Monto']);
    expect(primera.querySelectorAll('.uki-table__accion--grande').length).toBe(3);
    expect(raiz.querySelector('.uki-table__controles uki-checkbox')!.textContent!.trim()).toBe('Seleccionar todas');
    expect(raiz.querySelector('.uki-table-paginacion__actual-movil')!.textContent!.trim()).toBe('1 / 5');
  });
});
