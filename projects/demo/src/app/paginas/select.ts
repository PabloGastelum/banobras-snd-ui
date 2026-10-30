import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UkiSelect, UkiSelectOption } from '@banobras/uki';
import { DemoEjemplo } from '../doc/ejemplo';
import { ESTADOS_CAMPO } from '../doc/estados-campo';
import { DocToken } from '../doc/token';

const ESTADOS_MX: UkiSelectOption<string>[] = [
  { value: 'AGS', label: 'Aguascalientes' },
  { value: 'BC', label: 'Baja California' },
  { value: 'BCS', label: 'Baja California Sur' },
  { value: 'CAMP', label: 'Campeche' },
  { value: 'CHIS', label: 'Chiapas' },
  { value: 'CHIH', label: 'Chihuahua' },
  { value: 'CDMX', label: 'Ciudad de México' },
  { value: 'COAH', label: 'Coahuila' },
  { value: 'COL', label: 'Colima' },
  { value: 'DGO', label: 'Durango' },
];

const TRAMITES: UkiSelectOption<string>[] = [
  { value: 'alta', label: 'Alta de proyecto' },
  { value: 'baja', label: 'Baja de proyecto' },
  { value: 'cambio', label: 'Cambio de responsable' },
  { value: 'consulta', label: 'Consulta de saldo (no disponible)', disabled: true },
  { value: 'estado', label: 'Estado de cuenta' },
];

const TECLAS = [
  ['↓ · ↑ · Enter · Espacio', 'Con la lista cerrada, la abren en la opción elegida o en la primera.'],
  ['↓ · ↑', 'Mueven la opción activa, saltando las deshabilitadas.'],
  ['Inicio · Fin', 'Van a la primera o a la última opción.'],
  ['Una letra', 'Salta a la siguiente opción que empieza con ella; varias letras seguidas buscan el prefijo.'],
  ['Enter · Espacio', 'Eligen la opción activa y cierran.'],
  ['Tab', 'Elige la opción activa y pasa al siguiente campo.'],
  ['Esc', 'Cierra sin cambiar la elección.'],
];

@Component({
  selector: 'demo-select',
  imports: [UkiSelect, ReactiveFormsModule, FormsModule, DocToken, DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Select</h1>
          <p class="doc-descripcion">
            Un select permite elegir una opción de una lista. Mantiene el formulario corto y evita errores de captura, porque
            solo se pueden elegir valores válidos.
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsalo para</h3>
            <p>De 5 a 15 opciones fijas: tipo de trámite, estado o tipo de documento. Para 2–4 opciones usa radio; para listas muy largas, búsqueda.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Placeholder claro</h3>
            <p>Di qué elegir: «Selecciona una opción». Ordena las opciones con lógica: alfabético, más usadas primero o por tamaño.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Igual que Text field</h3>
            <p>Misma etiqueta, altura (48 px), tokens y estados que Text field, más Open. En un formulario quedan alineados.</p>
          </article>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-estados-vivos">
        <header class="doc-encabezado">
          <h2 id="t-estados-vivos" class="doc-titulo">Estados</h2>
          <p class="doc-descripcion">Abre el primero con clic o con el teclado para ver Open, la opción activa y la seleccionada.</p>
        </header>
        <demo-ejemplo titulo="Estados del select" nombre="tramite" [html]="codigo.html" [ts]="codigo.ts">
          <div class="rejilla">
            <uki-select data-prueba="select" label="Tipo de trámite" [options]="tramites" [formControl]="tramite" helper="Elige el más parecido." />
            <uki-select label="Filled" [options]="tramites" [formControl]="lleno" />
            <uki-select label="Error" [options]="tramites" [formControl]="conError" error="Elige un tipo de trámite." />
            <uki-select label="Disabled" [options]="tramites" [formControl]="deshabilitado" />
          </div>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-lista">
        <header class="doc-encabezado">
          <h2 id="t-lista" class="doc-titulo">Lista y opciones</h2>
          <p class="doc-descripcion">
            La lista muestra hasta 6 opciones (248 px) y después se desplaza. Usa background/surface, 1 px border/low-contrast,
            radius-4 y Elevation/overlay. Cada opción mide 40 px.
          </p>
        </header>
        <demo-ejemplo titulo="Lista con desplazamiento y ngModel" nombre="estado" [html]="codigo.ngModel">
          <div class="rejilla">
            <uki-select label="Estado" [options]="estadosMx" [(ngModel)]="estado" name="estado" />
            <p class="uki-body-sm">estado = {{ estado ?? 'null' }}</p>
          </div>
        </demo-ejemplo>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Opción: tokens por estado</caption>
            <thead>
              <tr>
                <th scope="col">Estado</th>
                <th scope="col">Fondo</th>
                <th scope="col">Texto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Default</th>
                <td><demo-token nombre="background/surface" /></td>
                <td><demo-token nombre="text/primary" nota="Body/Medium" /></td>
              </tr>
              <tr>
                <th scope="row">Hover y activa<small>Puntero o teclado</small></th>
                <td><demo-token nombre="background/page" /></td>
                <td><demo-token nombre="text/primary" /></td>
              </tr>
              <tr>
                <th scope="row">Selected</th>
                <td><demo-token nombre="button/tint" /></td>
                <td><demo-token nombre="brand/primary" nota="SemiBold + palomita" /></td>
              </tr>
              <tr>
                <th scope="row">Disabled</th>
                <td><demo-token nombre="background/surface" /></td>
                <td><demo-token nombre="text/disabled" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-recorte">
        <header class="doc-encabezado">
          <h2 id="t-recorte" class="doc-titulo">Dentro de tarjetas y modales</h2>
          <p class="doc-descripcion">
            La lista va en una capa superpuesta: no se recorta dentro de contenedores con overflow: hidden (tarjetas, tablas,
            modales). Se coloca debajo del campo o arriba si no cabe, y sigue al campo al hacer scroll.
          </p>
        </header>
        <demo-ejemplo titulo="Tarjeta con overflow: hidden" nombre="tarjeta" [html]="codigo.recorte">
          <div class="tarjeta-recorte" data-prueba="contenedor-recorte">
            <uki-select label="Entidad" [options]="estadosMx" [(ngModel)]="estadoRecorte" name="estado-recorte" data-prueba="select-recorte" />
          </div>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-teclado">
        <header class="doc-encabezado">
          <h2 id="t-teclado" class="doc-titulo">Teclado</h2>
          <p class="doc-descripcion">
            Sigue el patrón <em>select-only combobox</em> de WAI-ARIA: el foco se queda en el campo y la opción activa se indica
            con aria-activedescendant.
          </p>
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

      <section class="doc-seccion" aria-labelledby="t-tokens">
        <header class="doc-encabezado">
          <h2 id="t-tokens" class="doc-titulo">Tokens por estado</h2>
          <p class="doc-descripcion">Siete estados. Focus, Open y Error usan borde de 2 px. En Error el placeholder conserva su color.</p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Tokens de Select</caption>
            <thead>
              <tr>
                <th scope="col">Estado</th>
                <th scope="col">Borde</th>
                <th scope="col">Fondo</th>
                <th scope="col">Texto</th>
              </tr>
            </thead>
            <tbody>
              @for (fila of estados; track fila.estado) {
                <tr>
                  <th scope="row">{{ fila.estado }}<small>{{ fila.detalle }}</small></th>
                  <td><demo-token [nombre]="fila.borde" [nota]="fila.ancho" /></td>
                  <td><demo-token [nombre]="fila.fondo" /></td>
                  <td><demo-token [nombre]="fila.estado === 'Focus' || fila.estado === 'Error' ? 'field/placeholder' : fila.texto" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: `
    .rejilla {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      align-items: start;
      gap: var(--spacing-24);
      width: 100%;
    }
    .tarjeta-recorte {
      width: min(100%, 360px);
      height: 120px;
      padding: var(--spacing-16);
      overflow: hidden;
      border: 1px solid var(--border-low-contrast);
      border-radius: var(--radius-8);
      box-sizing: border-box;
    }
    kbd {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: var(--font-size-caption);
    }
  `,
})
export default class SelectPagina {
  protected readonly tramites = TRAMITES;
  protected readonly estadosMx = ESTADOS_MX;
  protected readonly teclas = TECLAS;
  protected readonly estados = ESTADOS_CAMPO;
  protected readonly tramite = new FormControl<string | null>(null);
  protected readonly lleno = new FormControl<string | null>('cambio');
  protected readonly conError = new FormControl<string | null>(null, Validators.required);
  protected readonly deshabilitado = new FormControl<string | null>({ value: 'alta', disabled: true });
  protected estado: string | null = 'CDMX';
  protected estadoRecorte: string | null = null;

  constructor() {
    this.conError.markAsTouched();
  }

  protected readonly codigo = {
    html: `<uki-select label="Tipo de trámite" placeholder="Selecciona una opción"
            [options]="tramites" formControlName="tramite"
            helper="Elige el más parecido." error="Elige un tipo de trámite." />`,
    ts: `import { UkiSelect, UkiSelectOption } from '@banobras/uki';

protected readonly tramites: UkiSelectOption<string>[] = [
  { value: 'alta', label: 'Alta de proyecto' },
  { value: 'baja', label: 'Baja de proyecto' },
  { value: 'consulta', label: 'Consulta de saldo', disabled: true },
];`,
    ngModel: `<uki-select label="Estado" [options]="estados" [(ngModel)]="estado" name="estado" />`,
    recorte: `<!-- La lista no se recorta aunque la tarjeta tenga overflow: hidden. -->
<div class="tarjeta">
  <uki-select label="Estado" [options]="estados" [(ngModel)]="estado" name="estado" />
</div>`,
  };
}
