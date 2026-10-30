import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UkiButton, UkiField, UkiInput, UkiSelect, UkiSelectOption } from '@banobras/uki';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';
import { ESTADOS_CAMPO } from '../doc/estados-campo';
import { DocToken } from '../doc/token';

const PARTES: Parte[] = [
  { selector: '.uki-field__label', nombre: 'Etiqueta', detalle: '_Label · estilo Label · text/primary · Required muestra el asterisco', lado: 'arriba', alinear: 'inicio' },
  { selector: '.uki-field__asterisco', nombre: 'Indicador de obligatorio', detalle: 'Asterisco opcional · field/required · oculto a lectores (el control lleva aria-required)', lado: 'arriba' },
  { selector: '.uki-input', nombre: 'Contenedor', detalle: '_Input · field/background · field/border · radius-4 · 48 px', lado: 'abajo', alinear: 'inicio' },
  { selector: '.uki-input', nombre: 'Placeholder / texto', detalle: 'Body/Medium · field/placeholder vacío, text/primary con valor, text/disabled deshabilitado', lado: 'abajo' },
  { selector: '.uki-field__mensaje', nombre: 'Ayuda / error', detalle: '_Helper · Caption · ayuda en text/secondary, error en feedback/error/foreground', lado: 'abajo' },
];

const TRAMITES: UkiSelectOption<string>[] = [
  { value: 'alta', label: 'Alta de proyecto' },
  { value: 'cambio', label: 'Cambio de responsable' },
  { value: 'estado', label: 'Estado de cuenta' },
  { value: 'revision', label: 'Revisión técnica' },
];

@Component({
  selector: 'demo-text-field',
  imports: [UkiField, UkiInput, UkiSelect, UkiButton, ReactiveFormsModule, JsonPipe, DocAnatomia, DocToken, DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Text field</h1>
          <p class="doc-descripcion">
            Un campo de texto permite escribir información corta y libre. Siempre tiene etiqueta visible, un campo de 48 px y
            ayuda opcional.
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsalo para</h3>
            <p>Una línea de texto libre: nombre, correo, teléfono, CURP, código postal. Para respuestas largas usa Text area; para opciones fijas, Select.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Etiqueta siempre visible</h3>
            <p>La etiqueta va arriba y nunca desaparece. El placeholder solo muestra un ejemplo del formato esperado.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>El ancho sigue al dato</h3>
            <p>Ajusta el ancho a la respuesta esperada: completo para correo, corto para LADA o código postal. Así se sabe cuánto escribir.</p>
          </article>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-estados-vivos">
        <header class="doc-encabezado">
          <h2 id="t-estados-vivos" class="doc-titulo">Estados</h2>
          <p class="doc-descripcion">
            Default, Filled, Error y Disabled se fijan con el control del formulario. Hover y Focus salen de la interacción: pasa
            el puntero o usa Tab.
          </p>
        </header>
        <demo-ejemplo titulo="Estados del campo" nombre="estados" [html]="codigo.estados" [ts]="codigo.estadosTs">
          <div class="rejilla">
            <uki-field label="Default" helper="Texto de ayuda.">
              <input ukiInput placeholder="nombre@dominio.mx" [formControl]="vacio" />
            </uki-field>
            <uki-field label="Filled">
              <input ukiInput [formControl]="lleno" />
            </uki-field>
            <uki-field label="Error" error="Escribe un correo con el formato nombre@dominio.mx">
              <input ukiInput data-prueba="campo-error" [formControl]="conError" />
            </uki-field>
            <uki-field label="Disabled">
              <input ukiInput [formControl]="deshabilitado" />
            </uki-field>
          </div>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">Cinco partes. Cada una sale de un token, así que un cambio en el token actualiza todos los campos.</p>
        </header>
        <demo-anatomia [partes]="partes" [escala]="1.4">
          <uki-field class="anatomia-campo" label="Correo electrónico" required helper="Te enviaremos el acuse.">
            <input ukiInput placeholder="nombre@dominio.mx" tabindex="-1" />
          </uki-field>
        </demo-anatomia>
      </section>

      <section class="doc-seccion" aria-labelledby="t-tokens">
        <header class="doc-encabezado">
          <h2 id="t-tokens" class="doc-titulo">Tokens por estado</h2>
          <p class="doc-descripcion">
            Cada estado cambia solo el borde, el fondo o el texto. Focus y Error usan borde de 2 px para no depender solo del color.
          </p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Tokens de Text field (Text area usa los mismos)</caption>
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
                  <td><demo-token [nombre]="fila.texto" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-formularios">
        <header class="doc-encabezado">
          <h2 id="t-formularios" class="doc-titulo">En formularios</h2>
          <p class="doc-descripcion">
            El campo envuelve un input nativo: type, autocomplete y formControlName van directo sobre él. El error aparece al
            salir de un campo inválido o al enviar, y queda ligado con aria-describedby y aria-invalid.
          </p>
        </header>
        <demo-ejemplo titulo="Solicitud" nombre="solicitud" [html]="codigo.formularioHtml" [ts]="codigo.formularioTs">
          <form class="formulario" [formGroup]="formulario" (ngSubmit)="enviar()" novalidate>
            <uki-field label="Nombre completo" error="Escribe tu nombre como aparece en tu identificación.">
              <input ukiInput autocomplete="name" formControlName="nombre" />
            </uki-field>
            <uki-field label="Correo electrónico" helper="Te enviaremos el acuse a este correo." error="Escribe un correo con el formato nombre@dominio.mx">
              <input ukiInput type="email" autocomplete="email" placeholder="nombre@dominio.mx" formControlName="correo" />
            </uki-field>
            <uki-select label="Tipo de trámite" [options]="tramites" formControlName="tramite" error="Elige un tipo de trámite." />
            <uki-field label="Motivo" [maxlength]="200" helper="Describe brevemente la solicitud." error="Usa máximo 200 caracteres.">
              <textarea ukiInput formControlName="motivo"></textarea>
            </uki-field>
            <div class="acciones">
              <button ukiButton type="submit">Enviar solicitud</button>
              <span class="uki-body-sm" aria-live="polite">{{ mensaje() }}</span>
            </div>
          </form>
          <pre class="doc-estado estado" tabindex="0" aria-label="Estado del formulario">{{ estado() | json }}</pre>
        </demo-ejemplo>
      </section>
    </div>
  `,
  styles: `
    .anatomia-campo {
      width: 280px;
    }
    .rejilla {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--spacing-24);
      width: 100%;
    }
    .formulario {
      display: grid;
      gap: var(--spacing-24);
      width: min(100%, 480px);
    }
    .acciones {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-16);
    }
    .estado {
      flex: 1 1 260px;
      align-self: start;
    }
  `,
})
export default class TextFieldPagina {
  protected readonly partes = PARTES;
  protected readonly estados = ESTADOS_CAMPO.filter((e) => !e.soloSelect);
  protected readonly tramites = TRAMITES;

  protected readonly vacio = new FormControl('');
  protected readonly lleno = new FormControl('ana.lopez@banobras.gob.mx');
  protected readonly conError = new FormControl('ana.lopez@', [Validators.email]);
  protected readonly deshabilitado = new FormControl({ value: 'ana.lopez@banobras.gob.mx', disabled: true });

  protected readonly formulario = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: Validators.required }),
    correo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    tramite: new FormControl<string | null>(null, Validators.required),
    motivo: new FormControl('', { nonNullable: true, validators: Validators.maxLength(200) }),
  });
  private readonly eventos = toSignal(this.formulario.events);
  protected readonly estado = computed(() => {
    this.eventos();
    return { valid: this.formulario.valid, touched: this.formulario.touched, value: this.formulario.getRawValue() };
  });
  protected readonly mensaje = signal('');

  constructor() {
    this.conError.markAsTouched();
  }

  protected enviar(): void {
    this.mensaje.set(this.formulario.valid ? 'Solicitud lista para enviarse.' : 'Revisa los campos marcados.');
  }

  protected readonly codigo = {
    estados: `<uki-field label="Correo electrónico" helper="Texto de ayuda."
           error="Escribe un correo con el formato nombre@dominio.mx">
  <input ukiInput type="email" placeholder="nombre@dominio.mx" [formControl]="correo" />
</uki-field>`,
    estadosTs: `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UkiField, UkiInput } from '@banobras/uki';

@Component({
  selector: 'app-correo',
  imports: [UkiField, UkiInput, ReactiveFormsModule],
  templateUrl: './estados.html',
})
export class Correo {
  protected readonly correo = new FormControl('', [Validators.required, Validators.email]);
}`,
    formularioHtml: `<form [formGroup]="formulario" (ngSubmit)="enviar()" novalidate>
  <uki-field label="Nombre completo" error="Escribe tu nombre como aparece en tu identificación.">
    <input ukiInput autocomplete="name" formControlName="nombre" />
  </uki-field>
  <uki-field label="Correo electrónico" helper="Te enviaremos el acuse a este correo."
             error="Escribe un correo con el formato nombre@dominio.mx">
    <input ukiInput type="email" autocomplete="email" formControlName="correo" />
  </uki-field>
  <uki-select label="Tipo de trámite" [options]="tramites" formControlName="tramite"
              error="Elige un tipo de trámite." />
  <uki-field label="Motivo" [maxlength]="200" error="Usa máximo 200 caracteres.">
    <textarea ukiInput formControlName="motivo"></textarea>
  </uki-field>
  <button ukiButton type="submit">Enviar solicitud</button>
</form>`,
    formularioTs: `import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UkiButton, UkiField, UkiInput, UkiSelect, UkiSelectOption } from '@banobras/uki';

@Component({
  selector: 'app-solicitud',
  imports: [UkiField, UkiInput, UkiSelect, UkiButton, ReactiveFormsModule],
  templateUrl: './solicitud.html',
})
export class Solicitud {
  protected readonly tramites: UkiSelectOption<string>[] = [
    { value: 'alta', label: 'Alta de proyecto' },
    { value: 'cambio', label: 'Cambio de responsable' },
  ];
  protected readonly formulario = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: Validators.required }),
    correo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    tramite: new FormControl<string | null>(null, Validators.required),
    motivo: new FormControl('', { nonNullable: true, validators: Validators.maxLength(200) }),
  });

  protected enviar(): void {
    if (this.formulario.invalid) return;
    // Enviar al servicio de Business.
  }
}`,
  };
}
