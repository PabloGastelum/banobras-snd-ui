import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UkiLogoBanobras, UkiLogoBanobrasIcon, UkiLogoFonadin, UkiLogoGobmx, UkiLogoHacienda } from '@banobras/uki';
import { DemoEjemplo } from '../doc/ejemplo';

interface Logotipo {
  id: string;
  nombre: string;
  selector: string;
  descripcion: string;
  temas: string;
  tamanos: string;
  espacio: string;
  uso: string;
}

const LOGOTIPOS: Logotipo[] = [
  {
    id: 'banobras',
    nombre: 'Banobras',
    selector: 'uki-logo-banobras',
    descripcion: 'Logotipo de Banobras. Su símbolo solo, para la barra lateral colapsada, es uki-logo-banobras-icon.',
    temas: 'color · white',
    tamanos: 'Default 284 × 60 · Small ≈152 × 32 (el mínimo) · máximo 400 px de ancho',
    espacio: 'x = ¼ del alto: 16 px en Default, 8 px en Small',
    uso: 'Color sobre superficies claras. White solo sobre la marca o superficies oscuras de la paleta institucional, nunca sobre fotos.',
  },
  {
    id: 'gobmx',
    nombre: 'Gobierno de México',
    selector: 'uki-logo-gobmx',
    descripcion: 'Imagotipo horizontal: el Escudo Nacional siempre a la izquierda de «Gobierno de México».',
    temas: 'default · white',
    tamanos: '188 × 60. La guía no fija mínimo ni máximo: escálalo solo en proporción',
    espacio: 'La letra «O» de México en cada lado y junto a otras identidades',
    uso: 'Default a color sobre superficies claras. White (dos tintas) sobre superficies oscuras o bandas Guinda, Verde o Dorado. Nunca a una tinta en medios digitales.',
  },
  {
    id: 'hacienda',
    nombre: 'Hacienda',
    selector: 'uki-logo-hacienda',
    descripcion: 'Logotipo de la Secretaría de Hacienda y Crédito Público.',
    temas: 'default · white',
    tamanos: 'Default 273 × 60 · Small ≈146 × 32',
    espacio: 'Pendiente en la guía: no pongas texto, íconos ni otros logotipos cerca',
    uso: 'Default sobre superficies claras. White (texto blanco y escudo dorado) sobre superficies oscuras.',
  },
  {
    id: 'fonadin',
    nombre: 'FONADIN',
    selector: 'uki-logo-fonadin',
    descripcion: 'Símbolo y nombre del Fondo Nacional de Infraestructura.',
    temas: 'color · white',
    tamanos: 'Default 262 × 60 · Small ≈140 × 32 (el mínimo). Máximo pendiente',
    espacio: 'x = ¼ del alto: 16 px en Default, 8 px en Small',
    uso: 'Color sobre superficies claras. White solo sobre la marca o superficies oscuras de la paleta institucional.',
  },
];

/** Página Brand de Figma: los logotipos de la identidad, sus tamaños, espacio libre y uso. */
@Component({
  selector: 'demo-logotipos',
  imports: [UkiLogoBanobras, UkiLogoBanobrasIcon, UkiLogoGobmx, UkiLogoHacienda, UkiLogoFonadin, DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Logotipos</h1>
          <p class="doc-descripcion">
            Brand es la primera capa del sistema: Brand → Fundamentos → Componentes. Tiene lo que no son tokens: los logotipos,
            el símbolo y la ilustración. Los colores y la tipografía viven en Fundamentos.
          </p>
        </header>
        <div class="aviso" role="note">
          <strong>Marcadores temporales.</strong>
          Figma pide usar solo los vectores oficiales y nunca redibujarlos. Mientras se confirman los derechos de uso y llegan
          los archivos oficiales, cada logotipo dibuja un marcador con su tamaño, su espacio libre y su nombre accesible. Los
          trazos se integran sin cambiar la API.
        </div>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Una sola fuente</h3>
            <p>Los logotipos viven solo aquí. Header, Footer, Auth, Hero y Sidebar usan estos componentes, así que un cambio llega a todas las pantallas.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Solo archivos oficiales</h3>
            <p>Nunca redibujes, calques ni aproximes un logotipo, y nunca edites la ilustración de la Joven Mexicana. Sus colores son fijos: el tema verde no los cambia.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Escala con su contenedor</h3>
            <p>Dos tamaños, Default (60 px de alto) y Small (32 px). Para otro alto usa --uki-logo-alto, entre 32 px y 400 px de ancho.</p>
          </article>
        </div>
        <demo-ejemplo titulo="Logotipos" nombre="logotipos" [html]="codigo.basico" [ts]="codigo.ts">
          <div class="fila">
            <uki-logo-banobras data-prueba="logo-banobras" />
            <uki-logo-gobmx data-prueba="logo-gobmx" />
          </div>
        </demo-ejemplo>
      </section>

      @for (l of logotipos; track l.id) {
        <section class="doc-seccion" [attr.aria-labelledby]="'t-' + l.id">
          <header class="doc-encabezado">
            <h2 [id]="'t-' + l.id" class="doc-titulo">{{ l.nombre }}</h2>
            <p class="doc-descripcion">{{ l.descripcion }}</p>
          </header>
          <div class="versiones" aria-label="Versiones" role="group">
            <figure class="version">
              <div class="version__fondo version__fondo--claro">
                @switch (l.id) {
                  @case ('banobras') {
                    <uki-logo-banobras />
                    <uki-logo-banobras size="small" />
                  }
                  @case ('gobmx') {
                    <uki-logo-gobmx />
                  }
                  @case ('hacienda') {
                    <uki-logo-hacienda />
                    <uki-logo-hacienda size="small" />
                  }
                  @case ('fonadin') {
                    <uki-logo-fonadin />
                    <uki-logo-fonadin size="small" />
                  }
                }
              </div>
              <figcaption>{{ l.id === 'gobmx' || l.id === 'hacienda' ? 'Default' : 'Color' }} · sobre superficies claras</figcaption>
            </figure>
            <figure class="version">
              <div class="version__fondo version__fondo--marca">
                @switch (l.id) {
                  @case ('banobras') {
                    <uki-logo-banobras theme="white" />
                    <uki-logo-banobras-icon theme="white" size="small" />
                  }
                  @case ('gobmx') {
                    <uki-logo-gobmx theme="white" />
                  }
                  @case ('hacienda') {
                    <uki-logo-hacienda theme="white" />
                  }
                  @case ('fonadin') {
                    <uki-logo-fonadin theme="white" />
                  }
                }
              </div>
              <figcaption>White · sobre la marca o superficies oscuras</figcaption>
            </figure>
          </div>
          <div class="doc-tabla-contenedor" tabindex="0">
            <table class="doc-tabla">
              <caption>{{ l.nombre }}: reglas de uso</caption>
              <tbody>
                <tr><th scope="row">Selector</th><td><code>&lt;{{ l.selector }}&gt;</code></td></tr>
                <tr><th scope="row">Theme</th><td><code>{{ l.temas }}</code></td></tr>
                <tr><th scope="row">Tamaños</th><td>{{ l.tamanos }}</td></tr>
                <tr><th scope="row">Espacio libre</th><td>{{ l.espacio }}</td></tr>
                <tr><th scope="row">Uso</th><td>{{ l.uso }}</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      }

      <section class="doc-seccion" aria-labelledby="t-patria">
        <header class="doc-encabezado">
          <h2 id="t-patria" class="doc-titulo">La Patria</h2>
          <p class="doc-descripcion">
            La ilustración de la Joven Mexicana (versiones Default, Guinda y Verde) es una imagen oficial de 800 × 991 que no
            se edita ni se reconstruye. La usa el Hero de la pantalla de acceso con <code>illustrationSrc</code>: el sistema la
            sirve desde sus assets hasta que la librería pueda incluirla. Siempre es decorativa (<code>alt=""</code>).
          </p>
        </header>
      </section>

      <section class="doc-seccion" aria-labelledby="t-accesibilidad">
        <header class="doc-encabezado">
          <h2 id="t-accesibilidad" class="doc-titulo">Accesibilidad</h2>
          <p class="doc-descripcion">
            Cada logotipo es un SVG con <code>role="img"</code> y el nombre de la institución. Cuando enlaza a Inicio, cambia
            el nombre con <code>label</code>; cuando el nombre ya está escrito al lado o es solo adorno, usa
            <code>decorative</code> y queda oculto a los lectores de pantalla.
          </p>
        </header>
        <demo-ejemplo titulo="Nombre o decorativo" nombre="accesibilidad" [html]="codigo.accesibilidad">
          <div class="fila">
            <a class="enlace-logo" href="#t-resumen"><uki-logo-banobras label="Banobras, ir a Inicio" [clearSpace]="false" /></a>
            <p class="con-nombre">
              <uki-logo-banobras-icon size="small" decorative [clearSpace]="false" />
              Banobras
            </p>
          </div>
        </demo-ejemplo>
      </section>
    </div>
  `,
  styles: `
    .aviso {
      padding: var(--spacing-16) var(--spacing-24);
      border-left: 4px solid var(--feedback-warning-foreground);
      border-radius: var(--radius-8);
      background: var(--feedback-warning-background);
      color: var(--text-primary);
      font-size: var(--font-size-body-sm);
      line-height: var(--font-line-height-body-sm);
    }
    .fila {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-24);
    }
    .versiones {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: var(--spacing-16);
    }
    .version {
      display: grid;
      gap: var(--spacing-8);
      margin: 0;
    }
    .version__fondo {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      min-height: 160px;
      overflow: hidden;
      border-radius: var(--radius-12);
    }
    .version__fondo--claro {
      border: 1px solid var(--border-low-contrast);
      background: var(--background-surface);
    }
    .version__fondo--marca {
      background: var(--brand-primary);
    }
    figcaption {
      color: var(--text-secondary);
      font-size: var(--font-size-caption);
    }
    .enlace-logo {
      display: inline-flex;
      border-radius: var(--radius-4);
    }
    .enlace-logo:focus-visible {
      outline: 2px solid var(--border-brand);
      outline-offset: 4px;
    }
    .con-nombre {
      display: flex;
      align-items: center;
      gap: var(--spacing-8);
      margin: 0;
      font-weight: var(--font-weight-semibold);
    }
    code {
      font-size: 0.85em;
    }
  `,
})
export default class LogotiposPagina {
  protected readonly logotipos = LOGOTIPOS;
  protected readonly codigo = {
    basico: `<uki-logo-banobras />                              <!-- Color, 284 × 60 -->
<uki-logo-banobras theme="white" size="small" />  <!-- sobre la marca, 32 px -->
<uki-logo-gobmx />
<uki-logo-hacienda theme="white" />
<uki-logo-fonadin size="small" />`,
    ts: `import { UkiLogoBanobras, UkiLogoGobmx } from '@banobras/uki';

// Un componente por logotipo: tu aplicación solo incluye los trazos que usa.
@Component({
  imports: [UkiLogoBanobras, UkiLogoGobmx],
})`,
    accesibilidad: `<!-- Enlaza a Inicio: el nombre dice a dónde va. -->
<a routerLink="/"><uki-logo-banobras label="Banobras, ir a Inicio" [clearSpace]="false" /></a>

<!-- El nombre ya está escrito al lado: decorativo. -->
<uki-logo-banobras-icon size="small" decorative /> Banobras

/* Otro alto, en proporción (de 32 px a 400 px de ancho). */
.mi-logo { --uki-logo-alto: 48px; }`,
  };
}
