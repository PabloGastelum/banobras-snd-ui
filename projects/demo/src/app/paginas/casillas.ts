import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UkiButton, UkiCheckbox } from '@banobras/uki';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';
import { DocToken } from '../doc/token';

const PARTES: Parte[] = [
  { selector: '.uki-checkbox__target', nombre: 'Área táctil', detalle: '40 × 40 · radius-full · Hover button/tint · Focus button/focus-ring al 24 %', lado: 'arriba', alinear: 'inicio' },
  { selector: '.uki-checkbox__input', nombre: 'Caja', detalle: '20 px · radius-4 · sin marcar: 2 px checkbox/border · marcada: checkbox/selected', lado: 'abajo' },
  { selector: '.uki-checkbox__icon', nombre: 'Ícono', detalle: 'check-lg o dash-lg · 16 px · icon/inverse', lado: 'arriba' },
  { selector: '.uki-checkbox__label', nombre: 'Etiqueta', detalle: 'Body/Small · text/primary · opcional · también se puede hacer clic', lado: 'abajo' },
];

@Component({
  selector: 'demo-casillas',
  imports: [UkiCheckbox, UkiButton, ReactiveFormsModule, FormsModule, JsonPipe, DocAnatomia, DocToken, DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Checkbox</h1>
          <p class="doc-descripcion">
            Una casilla permite activar o desactivar una opción, elegir varias de una lista o seleccionar filas de una tabla. Cada
            casilla funciona sola; para una sola opción entre varias, usa radio.
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsala para</h3>
            <p>Varias opciones independientes, una sola aceptación (como los términos) o seleccionar filas de una tabla.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Siempre con etiqueta</h3>
            <p>Muestra un texto claro junto a la caja, o usa ariaLabel cuando el contexto lo explica (filas de tabla). La etiqueta también se puede hacer clic.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Indeterminado</h3>
            <p>Solo en una casilla padre cuando algunas hijas, no todas, están marcadas; por ejemplo, «seleccionar todas» en el encabezado de una tabla.</p>
          </article>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-atomos">
        <header class="doc-encabezado">
          <h2 id="t-atomos" class="doc-titulo">Átomos</h2>
          <p class="doc-descripcion">
            Tres valores (Unchecked, Checked, Indeterminate) y cuatro estados (Default, Hover, Focus, Disabled). Hover y Focus
            salen de la interacción: pasa el puntero o usa Tab.
          </p>
        </header>
        <div class="doc-matriz" tabindex="0">
          <table>
            <caption class="doc-descripcion">Filas: valor. Columnas: estado, sin y con etiqueta.</caption>
            <thead>
              <tr>
                <th scope="col">Valor</th>
                <th scope="col">Default</th>
                <th scope="col">Con etiqueta</th>
                <th scope="col">Disabled</th>
                <th scope="col">Disabled con etiqueta</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Unchecked</th>
                <td><uki-checkbox ariaLabel="Opción sin marcar" /></td>
                <td><uki-checkbox data-prueba="unchecked">Opción</uki-checkbox></td>
                <td><uki-checkbox ariaLabel="Opción sin marcar deshabilitada" disabled /></td>
                <td><uki-checkbox disabled>Opción</uki-checkbox></td>
              </tr>
              <tr>
                <th scope="row">Checked</th>
                <td><uki-checkbox ariaLabel="Opción marcada" [checked]="true" /></td>
                <td><uki-checkbox data-prueba="checked" [checked]="true">Opción</uki-checkbox></td>
                <td><uki-checkbox ariaLabel="Opción marcada deshabilitada" [checked]="true" disabled /></td>
                <td><uki-checkbox [checked]="true" disabled>Opción</uki-checkbox></td>
              </tr>
              <tr>
                <th scope="row">Indeterminate</th>
                <td><uki-checkbox ariaLabel="Opción parcial" [indeterminate]="true" /></td>
                <td><uki-checkbox [indeterminate]="true">Opción</uki-checkbox></td>
                <td><uki-checkbox ariaLabel="Opción parcial deshabilitada" [indeterminate]="true" disabled /></td>
                <td><uki-checkbox [indeterminate]="true" disabled>Opción</uki-checkbox></td>
              </tr>
            </tbody>
          </table>
        </div>
        <demo-ejemplo titulo="Valores y estados" nombre="valores" [html]="codigo.valores" [ts]="codigo.valoresTs">
          <uki-checkbox [(checked)]="avisos">Recibir avisos</uki-checkbox>
          <uki-checkbox [indeterminate]="true" ariaLabel="Seleccionar todas las filas" />
          <uki-checkbox [checked]="true" disabled>Aceptado por el sistema</uki-checkbox>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">Cuatro partes. Los colores salen de los tokens checkbox/*, así que siguen el tema.</p>
        </header>
        <demo-anatomia [partes]="partes">
          <uki-checkbox [checked]="true">Acepto los términos</uki-checkbox>
        </demo-anatomia>
      </section>

      <section class="doc-seccion" aria-labelledby="t-estados">
        <header class="doc-encabezado">
          <h2 id="t-estados" class="doc-titulo">Estados</h2>
          <p class="doc-descripcion">Tokens de cada estado. Indeterminate usa los mismos tokens que Checked.</p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Tokens por estado</caption>
            <thead>
              <tr>
                <th scope="col">Estado</th>
                <th scope="col">Unchecked</th>
                <th scope="col">Checked / Indeterminate</th>
                <th scope="col">Área táctil</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Default<small>Listo para usarse</small></th>
                <td><demo-token parte="Borde" nombre="checkbox/border" nota="2 px" /><demo-token parte="Fondo" nombre="background/surface" /></td>
                <td><demo-token parte="Fondo" nombre="checkbox/selected" /><demo-token parte="Ícono" nombre="icon/inverse" /></td>
                <td>—</td>
              </tr>
              <tr>
                <th scope="row">Hover<small>Puntero encima</small></th>
                <td>Igual que Default</td>
                <td>Igual que Default</td>
                <td><demo-token parte="Fondo" nombre="button/tint" /></td>
              </tr>
              <tr>
                <th scope="row">Focus<small>Foco con teclado</small></th>
                <td>Igual que Default</td>
                <td>Igual que Default</td>
                <td><demo-token parte="Fondo" nombre="button/focus-ring" nota="al 24 %" /></td>
              </tr>
              <tr>
                <th scope="row">Disabled<small>No disponible</small></th>
                <td><demo-token parte="Borde" nombre="border/low-contrast" /><demo-token parte="Fondo" nombre="background/page" /></td>
                <td><demo-token parte="Fondo" nombre="text/disabled" /></td>
                <td><demo-token parte="Etiqueta" nombre="text/disabled" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-formularios">
        <header class="doc-encabezado">
          <h2 id="t-formularios" class="doc-titulo">En formularios</h2>
          <p class="doc-descripcion">
            uki-checkbox implementa ControlValueAccessor: funciona con formularios reactivos, ngModel o [(checked)], y refleja
            value, disabled, dirty y touched como un control nativo.
          </p>
        </header>
        <h3 class="doc-subtitulo">Formulario reactivo con «seleccionar todas»</h3>
        <demo-ejemplo titulo="Formulario reactivo" nombre="avisos" [html]="codigo.reactivoHtml" [ts]="codigo.reactivoTs">
          <div class="pila">
            <form [formGroup]="formulario" class="lista">
              <uki-checkbox data-prueba="todas" [checked]="todas()" [indeterminate]="algunas()" (checkedChange)="marcarTodas($event)">
                Todos los avisos
              </uki-checkbox>
              <div class="hijos">
                <uki-checkbox formControlName="correo">Correo electrónico</uki-checkbox>
                <uki-checkbox formControlName="sms">Mensaje de texto</uki-checkbox>
                <uki-checkbox formControlName="portal">Aviso en el portal</uki-checkbox>
              </div>
            </form>
            <button ukiButton variant="secondary" type="button" (click)="alternarHabilitado()">
              {{ formulario.disabled ? 'Habilitar' : 'Deshabilitar' }} formulario
            </button>
            <pre class="estado" data-prueba="estado-reactivo" tabindex="0" aria-label="Estado del formulario">{{ estado() | json }}</pre>
          </div>
        </demo-ejemplo>
        <h3 class="doc-subtitulo">Con ngModel</h3>
        <demo-ejemplo titulo="ngModel" nombre="terminos" [html]="codigo.ngModelHtml" [ts]="codigo.ngModelTs">
          <uki-checkbox [(ngModel)]="aceptaTerminos" name="terminos">Acepto los términos y condiciones</uki-checkbox>
          <span class="uki-body-sm">aceptaTerminos = {{ aceptaTerminos }}</span>
        </demo-ejemplo>
      </section>
    </div>
  `,
  styles: `
    .lista {
      display: grid;
      gap: var(--spacing-4);
    }
    .hijos {
      display: grid;
      padding-left: var(--spacing-32);
    }
    .pila {
      display: grid;
      justify-items: start;
      gap: var(--spacing-16);
      width: 100%;
    }
    .estado {
      width: 100%;
      box-sizing: border-box;
      margin: 0;
      padding: var(--spacing-12) var(--spacing-16);
      border-radius: var(--radius-8);
      background: var(--neutral-300);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: var(--font-size-caption);
    }
  `,
})
export default class Casillas {
  protected readonly partes = PARTES;
  protected readonly formulario = new FormGroup({
    correo: new FormControl(true, { nonNullable: true }),
    sms: new FormControl(false, { nonNullable: true }),
    portal: new FormControl(false, { nonNullable: true }),
  });
  private readonly valor = toSignal(this.formulario.valueChanges, { initialValue: this.formulario.getRawValue() });
  private readonly marcadas = computed(() => Object.values(this.valor()).filter(Boolean).length);
  protected readonly todas = computed(() => this.marcadas() === 3);
  protected readonly algunas = computed(() => this.marcadas() > 0 && this.marcadas() < 3);
  // events emite también los cambios de touched, dirty y disabled, que no pasan por valueChanges.
  private readonly eventos = toSignal(this.formulario.events);
  protected readonly estado = computed(() => {
    this.eventos();
    return {
      value: this.valor(),
      disabled: this.formulario.disabled,
      dirty: this.formulario.dirty,
      touched: this.formulario.touched,
    };
  });
  protected aceptaTerminos = false;
  protected readonly avisos = signal(true);
  protected readonly codigo = {
    valores: `<uki-checkbox [(checked)]="avisos">Recibir avisos</uki-checkbox>

<!-- Sin etiqueta visible: ariaLabel da el nombre accesible -->
<uki-checkbox [indeterminate]="true" ariaLabel="Seleccionar todas las filas" />

<uki-checkbox [checked]="true" disabled>Aceptado por el sistema</uki-checkbox>`,
    valoresTs: `import { Component, signal } from '@angular/core';
import { UkiCheckbox } from '@banobras/uki';

@Component({
  selector: 'app-preferencias',
  imports: [UkiCheckbox],
  templateUrl: './valores.html',
})
export class Preferencias {
  protected readonly avisos = signal(true);
}`,
    reactivoHtml: `<form [formGroup]="formulario">
  <uki-checkbox [checked]="todas()" [indeterminate]="algunas()" (checkedChange)="marcarTodas($event)">
    Todos los avisos
  </uki-checkbox>
  <uki-checkbox formControlName="correo">Correo electrónico</uki-checkbox>
  <uki-checkbox formControlName="sms">Mensaje de texto</uki-checkbox>
  <uki-checkbox formControlName="portal">Aviso en el portal</uki-checkbox>
</form>`,
    reactivoTs: `import { Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UkiCheckbox } from '@banobras/uki';

@Component({
  selector: 'app-avisos',
  imports: [UkiCheckbox, ReactiveFormsModule],
  templateUrl: './avisos.html',
})
export class Avisos {
  protected readonly formulario = new FormGroup({
    correo: new FormControl(true, { nonNullable: true }),
    sms: new FormControl(false, { nonNullable: true }),
    portal: new FormControl(false, { nonNullable: true }),
  });
  private readonly valor = toSignal(this.formulario.valueChanges, {
    initialValue: this.formulario.getRawValue(),
  });
  private readonly marcadas = computed(() => Object.values(this.valor()).filter(Boolean).length);
  protected readonly todas = computed(() => this.marcadas() === 3);
  protected readonly algunas = computed(() => this.marcadas() > 0 && this.marcadas() < 3);

  protected marcarTodas(marcar: boolean): void {
    this.formulario.setValue({ correo: marcar, sms: marcar, portal: marcar });
    this.formulario.markAsDirty();
  }
}`,
    ngModelHtml: `<uki-checkbox [(ngModel)]="aceptaTerminos" name="terminos">
  Acepto los términos y condiciones
</uki-checkbox>`,
    ngModelTs: `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UkiCheckbox } from '@banobras/uki';

@Component({
  selector: 'app-terminos',
  imports: [UkiCheckbox, FormsModule],
  templateUrl: './terminos.html',
})
export class Terminos {
  protected aceptaTerminos = false;
}`,
  };

  protected marcarTodas(marcar: boolean): void {
    this.formulario.setValue({ correo: marcar, sms: marcar, portal: marcar });
    this.formulario.markAsDirty();
  }

  protected alternarHabilitado(): void {
    if (this.formulario.disabled) this.formulario.enable();
    else this.formulario.disable();
  }
}
