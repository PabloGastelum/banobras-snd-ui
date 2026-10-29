import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UkiField, UkiInput } from '@banobras/uki';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';
import { ESTADOS_CAMPO } from '../doc/estados-campo';
import { DocToken } from '../doc/token';

const PARTES: Parte[] = [
  { selector: '.uki-field__label', nombre: 'Etiqueta', detalle: '_Label · estilo Label · text/primary · asterisco field/required', lado: 'arriba', alinear: 'inicio' },
  { selector: '.uki-input', nombre: 'Contenedor', detalle: '_Textarea box · field/background · field/border · radius-4 · 120 px', lado: 'arriba' },
  { selector: '.uki-input', nombre: 'Texto', detalle: 'Body/Medium · field/placeholder vacío, text/primary con texto · empieza arriba a la izquierda', lado: 'abajo', alinear: 'inicio' },
  { selector: '.uki-field__mensaje', nombre: 'Ayuda', detalle: '_Helper · Caption · ayuda en text/secondary, error en feedback/error/foreground', lado: 'abajo' },
  { selector: '.uki-field__contador', nombre: 'Contador', detalle: 'Caption · text/secondary · feedback/error/foreground al pasar el límite', lado: 'abajo' },
];

@Component({
  selector: 'demo-text-area',
  imports: [UkiField, UkiInput, ReactiveFormsModule, DocAnatomia, DocToken, DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Text area</h1>
          <p class="doc-descripcion">
            Un área de texto permite escribir varias líneas. Muestra cuánto espacio necesita la respuesta y, cuando hay límite,
            cuántos caracteres quedan.
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsalo para</h3>
            <p>Respuestas largas: descripciones, comentarios, motivos u observaciones. Para una línea (nombres, correos, folios) usa Text field.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Tamaño de la respuesta</h3>
            <p>Muestra unas 4 líneas por omisión (120 px). Puede crecer o redimensionarse en vertical, nunca en horizontal.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Muestra el límite</h3>
            <p>Si hay máximo, muestra el contador (92/500). Se pone rojo al pasar el límite y la ayuda explica cómo corregirlo.</p>
          </article>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-estados-vivos">
        <header class="doc-encabezado">
          <h2 id="t-estados-vivos" class="doc-titulo">Estados</h2>
          <p class="doc-descripcion">
            El límite es flexible: se puede escribir de más y el validador del formulario lo marca como error, en lugar de
            cortar el texto sin avisar.
          </p>
        </header>
        <demo-ejemplo titulo="Contador y límite" nombre="motivo" [html]="codigo.html" [ts]="codigo.ts">
          <div class="rejilla">
            <uki-field label="Motivo" [maxlength]="120" helper="Describe brevemente la solicitud." error="Usa máximo 120 caracteres.">
              <textarea ukiInput data-prueba="textarea" placeholder="Escribe el motivo" [formControl]="motivo"></textarea>
            </uki-field>
            <uki-field label="Al pasar el límite" [maxlength]="40" error="Usa máximo 40 caracteres.">
              <textarea ukiInput data-prueba="textarea-excedido" [formControl]="excedido"></textarea>
            </uki-field>
            <uki-field label="Disabled">
              <textarea ukiInput [formControl]="deshabilitado"></textarea>
            </uki-field>
          </div>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">Etiqueta, caja de varias líneas con agarradera para redimensionar, ayuda y contador.</p>
        </header>
        <demo-anatomia [partes]="partes" [escala]="1.4">
          <uki-field class="anatomia-campo" label="Observaciones" [maxlength]="500" helper="Opcional.">
            <textarea ukiInput placeholder="Escribe aquí" tabindex="-1"></textarea>
          </uki-field>
        </demo-anatomia>
      </section>

      <section class="doc-seccion" aria-labelledby="t-tokens">
        <header class="doc-encabezado">
          <h2 id="t-tokens" class="doc-titulo">Tokens por estado</h2>
          <p class="doc-descripcion">Los mismos de Text field. El contador usa text/secondary y feedback/error/foreground al pasar el límite.</p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Tokens de Text area</caption>
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
    </div>
  `,
  styles: `
    .anatomia-campo {
      width: 280px;
    }
    .rejilla {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--spacing-24);
      width: 100%;
    }
  `,
})
export default class TextAreaPagina {
  protected readonly partes = PARTES;
  protected readonly estados = ESTADOS_CAMPO.filter((e) => !e.soloSelect);
  protected readonly motivo = new FormControl('', [Validators.maxLength(120)]);
  protected readonly excedido = new FormControl('Este texto pasa del límite de cuarenta caracteres.', [Validators.maxLength(40)]);
  protected readonly deshabilitado = new FormControl({ value: 'Sin cambios permitidos.', disabled: true });

  protected readonly codigo = {
    html: `<uki-field label="Motivo" [maxlength]="120" helper="Describe brevemente la solicitud."
           error="Usa máximo 120 caracteres.">
  <textarea ukiInput formControlName="motivo"></textarea>
</uki-field>`,
    ts: `// El límite es flexible: el contador usa [maxlength] del campo
// y el error lo marca el validador del formulario.
motivo: new FormControl('', [Validators.maxLength(120)]),`,
  };
}
