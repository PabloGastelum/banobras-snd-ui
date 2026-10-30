import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UkiHero } from '@banobras/uki';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';
import { DocToken } from '../doc/token';

const PARTES: Parte[] = [
  { selector: '.uki-hero', nombre: 'Fondo', detalle: 'brand/primary en todo el panel · cambia con el tema', lado: 'arriba', alinear: 'inicio' },
  { selector: '.uki-hero__patron', nombre: 'Patrón', detalle: 'Degradado decorativo brand/secondary → brand/primary al 20 %, detrás del arte', lado: 'abajo' },
  { selector: '.uki-hero__logo', nombre: 'Logotipo', detalle: 'Gobierno de México · White · 188 × 60 · arriba a la izquierda, a 40 px', lado: 'abajo' },
];

/** Página Hero de Figma: el panel de marca de la pantalla de acceso. */
@Component({
  selector: 'demo-hero',
  imports: [UkiHero, DemoEjemplo, DocAnatomia, DocToken],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Hero</h1>
          <p class="doc-descripcion">
            El panel de marca de la pantalla de acceso. Muestra el logotipo del Gobierno de México y la ilustración La Patria
            sobre el color de la marca, junto al bloque Auth.
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsalo para</h3>
            <p>El lado izquierdo de la pantalla de acceso en escritorio, junto a Auth. Es decorativo y no tiene acciones.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Se oculta en pantallas chicas</h3>
            <p>Debajo de 1280 px el Hero desaparece y queda solo Auth, para que el formulario tenga todo el espacio.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>No edites el arte</h3>
            <p>La ilustración y el logotipo siguen las reglas de marca del Gobierno de México. La ilustración se pasa con illustrationSrc.</p>
          </article>
        </div>
        <demo-ejemplo titulo="Hero" nombre="hero" [html]="codigo.basico" [ts]="codigo.ts">
          <div class="marco-hero">
            <uki-hero data-prueba="hero" />
            <p class="nota-oculto">El Hero se oculta debajo de 1280 px: amplía la ventana para verlo.</p>
          </div>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-moleculas">
        <header class="doc-encabezado">
          <h2 id="t-moleculas" class="doc-titulo">Moléculas</h2>
          <p class="doc-descripcion">
            Hero es un solo componente de 644 × 832 sin propiedades. El fondo sigue al tema guinda o verde con brand/primary; el
            logotipo y la ilustración conservan sus colores oficiales.
          </p>
        </header>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">
            Cuatro partes forman el panel. La cuarta, la ilustración La Patria (600 × 743, abajo a la derecha), es una imagen
            oficial que el sistema sirve desde sus assets.
          </p>
        </header>
        <demo-anatomia [partes]="partes" [escala]="0.5">
          <uki-hero class="anatomia" />
        </demo-anatomia>
      </section>

      <section class="doc-seccion" aria-labelledby="t-composicion">
        <header class="doc-encabezado">
          <h2 id="t-composicion" class="doc-titulo">Composición</h2>
          <p class="doc-descripcion">Las piezas del Hero y de dónde vienen.</p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Composición del Hero</caption>
            <thead>
              <tr>
                <th scope="col">Parte</th>
                <th scope="col">Origen</th>
                <th scope="col">Token</th>
                <th scope="col">Nota</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">Fondo</th><td>Hero</td><td><demo-token nombre="brand/primary" /></td><td>Cambia con el tema</td></tr>
              <tr><th scope="row">Patrón</th><td>Degradado</td><td><demo-token nombre="brand/secondary" nota="al 20 %" /></td><td>Decorativo, detrás del arte</td></tr>
              <tr><th scope="row">Ilustración</th><td>La Patria · Default</td><td>—</td><td>Abajo a la derecha · <code>alt=""</code></td></tr>
              <tr><th scope="row">Logotipo</th><td>GobMX · White</td><td>—</td><td>Arriba a la izquierda · nombre accesible</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: `
    .marco-hero {
      display: grid;
      justify-items: center;
      width: 100%;
    }
    .nota-oculto {
      display: none;
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--font-size-body-sm);
    }
    @media (max-width: 1279.98px) {
      .nota-oculto {
        display: block;
      }
    }
    .anatomia {
      display: block !important;
    }
  `,
})
export default class HeroPagina {
  protected readonly partes = PARTES;
  protected readonly codigo = {
    basico: `<!-- La ilustración la sirve el sistema; es decorativa (alt=""). -->
<uki-hero illustrationSrc="/assets/la-patria.webp" />`,
    ts: `import { UkiHero } from '@banobras/uki';

@Component({
  imports: [UkiHero],
})`,
  };
}
