import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UkiBadge, UkiFeedbackType } from '@banobras/uki';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';
import { TIPOS_FEEDBACK } from '../doc/tipos-feedback';
import { DocToken } from '../doc/token';

const PARTES: Parte[] = [
  { selector: '.uki-badge', nombre: 'Contenedor', detalle: 'feedback/{tipo}/background · radius-full · relleno spacing-4 / spacing-8 · 24 px de alto', lado: 'arriba', alinear: 'inicio' },
  { selector: '.uki-badge__dot', nombre: 'Punto', detalle: '6 px · feedback/{tipo}/foreground · decorativo', lado: 'abajo' },
  { selector: '.uki-badge__label', nombre: 'Etiqueta', detalle: 'Caption SemiBold (12/16) · feedback/{tipo}/foreground · 1–2 palabras', lado: 'arriba' },
];

/** Etiquetas de ejemplo de la tabla «Types» de Figma. */
const EJEMPLOS: Record<UkiFeedbackType, { etiqueta: string; detalle: string }> = {
  success: { etiqueta: 'Aprobada', detalle: 'Terminó bien' },
  info: { etiqueta: 'Recibida', detalle: 'Actualización neutra' },
  warning: { etiqueta: 'En revisión', detalle: 'Requiere atención' },
  error: { etiqueta: 'Rechazada', detalle: 'Falló o se rechazó' },
};

const SOLICITUDES = [
  { folio: 'FON-2026-0142', solicitante: 'Municipio de Tlaquepaque', tipo: 'success', estado: 'Aprobada' },
  { folio: 'FON-2026-0157', solicitante: 'Gobierno de Durango', tipo: 'warning', estado: 'En revisión' },
  { folio: 'FON-2026-0163', solicitante: 'Municipio de Colima', tipo: 'info', estado: 'Recibida' },
  { folio: 'FON-2026-0171', solicitante: 'Gobierno de Campeche', tipo: 'error', estado: 'Rechazada' },
] as const;

@Component({
  selector: 'demo-badge',
  imports: [UkiBadge, DocAnatomia, DocToken, DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Badge</h1>
          <p class="doc-descripcion">
            Un badge muestra el estado de un elemento, como una solicitud o un documento, con una etiqueta corta. Es de solo
            lectura: informa, no dispara acciones.
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsalo para</h3>
            <p>El estado de un registro en tablas, tarjetas y páginas de detalle: aprobada, recibida, en revisión, rechazada.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Nunca solo color</h3>
            <p>Todo badge tiene punto y etiqueta de texto, para que el estado se entienda aunque no se distingan los colores.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Corto y consistente</h3>
            <p>Usa una o dos palabras y la misma etiqueta para el mismo estado en todo el sistema.</p>
          </article>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-atomos">
        <header class="doc-encabezado">
          <h2 id="t-atomos" class="doc-titulo">Átomos</h2>
          <p class="doc-descripcion">
            Cuatro tipos que corresponden a los tokens de retroalimentación: Success, Info, Warning y Error. La etiqueta es el
            contenido del componente.
          </p>
        </header>
        <demo-ejemplo titulo="Tipos" nombre="badge" [html]="codigo.tipos" [ts]="codigo.importar">
          @for (t of tipos; track t.tipo) {
            <uki-badge [type]="t.tipo" [attr.data-prueba]="'badge-' + t.tipo">{{ ejemplos[t.tipo].etiqueta }}</uki-badge>
          }
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">Tres partes. Cada tipo solo cambia los tokens de fondo y de primer plano.</p>
        </header>
        <demo-anatomia [partes]="partes" [escala]="3">
          <uki-badge type="success">Aprobada</uki-badge>
        </demo-anatomia>
      </section>

      <section class="doc-seccion" aria-labelledby="t-tipos">
        <header class="doc-encabezado">
          <h2 id="t-tipos" class="doc-titulo">Tipos</h2>
          <p class="doc-descripcion">Un tipo por significado. Etiquetas de ejemplo usadas en el portal.</p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Tokens por tipo</caption>
            <thead>
              <tr>
                <th scope="col">Tipo</th>
                <th scope="col">Fondo</th>
                <th scope="col">Punto y texto</th>
                <th scope="col">Ejemplo</th>
              </tr>
            </thead>
            <tbody>
              @for (t of tipos; track t.tipo) {
                <tr>
                  <th scope="row">{{ t.nombre }}<small>{{ ejemplos[t.tipo].detalle }}</small></th>
                  <td><demo-token [nombre]="t.fondo" /></td>
                  <td><demo-token [nombre]="t.primerPlano" /></td>
                  <td><uki-badge [type]="t.tipo">{{ ejemplos[t.tipo].etiqueta }}</uki-badge></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-tabla">
        <header class="doc-encabezado">
          <h2 id="t-tabla" class="doc-titulo">En una tabla</h2>
          <p class="doc-descripcion">
            El badge no lleva rol: el lector de pantalla lee la etiqueta como el texto de la celda. El punto es decorativo.
          </p>
        </header>
        <demo-ejemplo titulo="Estado de solicitudes" nombre="solicitudes" [html]="codigo.tabla">
          <div class="doc-tabla-contenedor tabla-ejemplo" tabindex="0">
          <table class="doc-tabla">
            <caption class="doc-oculto">Solicitudes recientes</caption>
            <thead>
              <tr>
                <th scope="col">Folio</th>
                <th scope="col">Solicitante</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (s of solicitudes; track s.folio) {
                <tr>
                  <td class="doc-mono">{{ s.folio }}</td>
                  <td>{{ s.solicitante }}</td>
                  <td><uki-badge [type]="s.tipo">{{ s.estado }}</uki-badge></td>
                </tr>
              }
            </tbody>
          </table>
          </div>
        </demo-ejemplo>
      </section>
    </div>
  `,
  styles: `
    .tabla-ejemplo {
      width: 100%;
    }
  `,
})
export default class BadgePagina {
  protected readonly tipos = TIPOS_FEEDBACK;
  protected readonly ejemplos = EJEMPLOS;
  protected readonly partes = PARTES;
  protected readonly solicitudes = SOLICITUDES;
  protected readonly codigo = {
    importar: `import { UkiBadge } from '@banobras/uki';

@Component({
  imports: [UkiBadge],
  // …
})`,
    tipos: `<uki-badge type="success">Aprobada</uki-badge>
<uki-badge type="info">Recibida</uki-badge>
<uki-badge type="warning">En revisión</uki-badge>
<uki-badge type="error">Rechazada</uki-badge>`,
    tabla: `<td>
  <uki-badge [type]="solicitud.tipo">{{ solicitud.estado }}</uki-badge>
</td>`,
  };
}
