import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UkiFooter } from '@banobras/uki';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';
import { DocToken } from '../doc/token';

const PARTES: Parte[] = [
  { selector: '.uki-footer', nombre: 'Contenedor', detalle: 'Ancho completo · background/page · relleno spacing-24 y spacing-32 · 64 px de alto', lado: 'arriba', alinear: 'inicio' },
  { selector: '.uki-footer__marca', nombre: 'Aviso de derechos', detalle: 'Caption (12/16) · text/secondary · «© año BANOBRAS.» en SemiBold', lado: 'abajo' },
];

/** Página Footer de Figma. */
@Component({
  selector: 'demo-footer',
  imports: [UkiFooter, DemoEjemplo, DocAnatomia, DocToken],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Footer</h1>
          <p class="doc-descripcion">
            El pie cierra cada página del portal. Muestra el aviso de derechos de BANOBRAS en un estilo discreto, para que nunca
            compita con el contenido.
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsalo para</h3>
            <p>El final de cada página, debajo del contenido principal. Un pie por página y el mismo texto en todo el portal.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Discreto</h3>
            <p>Texto pequeño (Caption) en text/secondary sobre el fondo de la página, sin borde. No debe quitarle atención al contenido.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Actualiza el año</h3>
            <p>«© año BANOBRAS.» va siempre al inicio en SemiBold. El año es el actual; cámbialo con year si el sistema lo da.</p>
          </article>
        </div>
        <demo-ejemplo titulo="Footer" nombre="footer" [html]="codigo.basico" [ts]="codigo.ts" fondo="pagina">
          <footer ukiFooter class="ancho" data-prueba="footer"></footer>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-moleculas">
        <header class="doc-encabezado">
          <h2 id="t-moleculas" class="doc-titulo">Moléculas</h2>
          <p class="doc-descripcion">
            Footer es un solo componente que ocupa el ancho de su contenedor. El contenido proyectado reemplaza a «Todos los
            derechos reservados», por ejemplo para agregar el aviso de privacidad.
          </p>
        </header>
        <demo-ejemplo titulo="Con aviso de privacidad" nombre="footer-enlace" [html]="codigo.enlace" fondo="pagina">
          <footer ukiFooter class="ancho" [year]="2026">
            Todos los derechos reservados. <a href="#t-resumen">Aviso de privacidad</a>
          </footer>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">Dos partes forman el pie. Cada una toma su valor de un token.</p>
        </header>
        <demo-anatomia [partes]="partes" [escala]="1">
          <footer ukiFooter class="anatomia" [year]="2026"></footer>
        </demo-anatomia>
      </section>

      <section class="doc-seccion" aria-labelledby="t-tokens">
        <header class="doc-encabezado">
          <h2 id="t-tokens" class="doc-titulo">Tokens</h2>
          <p class="doc-descripcion">Cada valor del pie viene de un token. Cambia el token, no la capa.</p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Tokens del Footer</caption>
            <thead>
              <tr>
                <th scope="col">Parte</th>
                <th scope="col">Token</th>
                <th scope="col">Nota</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">Fondo</th><td><demo-token nombre="background/page" /></td><td>Igual que la página, sin borde</td></tr>
              <tr><th scope="row">Texto</th><td><demo-token nombre="text/secondary" /></td><td>Discreto y legible (9.4:1)</td></tr>
              <tr><th scope="row">Tipografía</th><td><code>Caption 12/16</code></td><td>«© año BANOBRAS.» en font/weight/semibold</td></tr>
              <tr><th scope="row">Relleno</th><td><code>spacing-24 · spacing-32</code></td><td>Arriba y abajo · lados (spacing-16 en teléfono)</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: `
    .ancho {
      flex: 1 1 100%;
    }
    .anatomia {
      width: 560px;
    }
  `,
})
export default class FooterPagina {
  protected readonly partes = PARTES;
  protected readonly codigo = {
    basico: `<footer ukiFooter></footer>
<!-- © 2026 BANOBRAS. Todos los derechos reservados -->`,
    ts: `import { UkiFooter } from '@banobras/uki';

@Component({
  imports: [UkiFooter],
})`,
    enlace: `<footer ukiFooter [year]="2026">
  Todos los derechos reservados. <a routerLink="/aviso">Aviso de privacidad</a>
</footer>`,
  };
}
