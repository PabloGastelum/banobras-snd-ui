import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoEjemplo } from '../doc/ejemplo';
import { coleccion } from '../doc/tokens';

const tipo = coleccion('Typography');
const medida = (clave: string) => {
  const tam = tipo.vars.find((v) => v.nombre === `font/size/${clave}`)!.valores;
  const alto = tipo.vars.find((v) => v.nombre === `font/line-height/${clave}`)!.valores;
  return tam.map((t, i) => `${t}/${alto[i]}`);
};

const ESTILOS = [
  { nombre: 'Heading/H1', clase: 'uki-heading-1', clave: 'h1', peso: 'Patria Bold' },
  { nombre: 'Heading/H2', clase: 'uki-heading-2', clave: 'h2', peso: 'Patria Bold' },
  { nombre: 'Heading/H3', clase: 'uki-heading-3', clave: 'h3', peso: 'Patria Bold' },
  { nombre: 'Heading/H4', clase: 'uki-heading-4', clave: 'h4', peso: 'Patria Bold' },
  { nombre: 'Heading/H5', clase: 'uki-heading-5', clave: 'h5', peso: 'Patria Bold' },
  { nombre: 'Heading/H6', clase: 'uki-heading-6', clave: 'h6', peso: 'Patria Bold' },
  { nombre: 'Body/Large', clase: 'uki-body-lg', clave: 'body-lg', peso: 'Noto Sans Regular' },
  { nombre: 'Body/Medium', clase: 'uki-body-md', clave: 'body-md', peso: 'Noto Sans Regular' },
  { nombre: 'Body/Small', clase: 'uki-body-sm', clave: 'body-sm', peso: 'Noto Sans Regular' },
  { nombre: 'Label', clase: 'uki-label', clave: 'label', peso: 'Noto Sans Medium' },
  { nombre: 'Caption', clase: 'uki-caption', clave: 'caption', peso: 'Noto Sans Regular' },
  { nombre: 'Button', clase: 'uki-button-text', clave: 'button', peso: 'Noto Sans SemiBold' },
  { nombre: 'Link', clase: 'uki-link', clave: 'body-md', peso: 'Noto Sans Medium, subrayado' },
].map((e) => ({ ...e, medidas: medida(e.clave) }));

@Component({
  selector: 'demo-tipografia',
  imports: [DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-tipografia">
        <header class="doc-encabezado">
          <h1 id="t-tipografia" class="doc-titulo">Tipografía</h1>
          <p class="doc-descripcion">
            Patria para encabezados y Noto Sans para cuerpo e interfaz. Trece estilos de texto; los encabezados cambian de tamaño
            solos en tableta (768 px) y escritorio (1280 px).
          </p>
        </header>
        <div class="doc-tarjetas familias">
          <article class="doc-tarjeta">
            <p class="muestra patria" aria-hidden="true">Aa</p>
            <h3>Patria</h3>
            <p>Para encabezados. Light, Regular y Bold; los encabezados usan Bold.</p>
            <p class="doc-tokens doc-mono">--font-family-heading</p>
          </article>
          <article class="doc-tarjeta">
            <p class="muestra" aria-hidden="true">Aa</p>
            <h3>Noto Sans</h3>
            <p>Para cuerpo e interfaz. Variable de 400 a 700, recortada a caracteres latinos.</p>
            <p class="doc-tokens doc-mono">--font-family-body</p>
          </article>
        </div>
        <demo-ejemplo titulo="Clases de texto" nombre="aviso" [html]="ejemplo">
          <div class="texto-ejemplo">
            <p class="uki-heading-3">Fondo Nacional de Infraestructura</p>
            <p class="uki-body-md">Consulta los proyectos financiados y descarga los reportes trimestrales.</p>
            <a class="uki-link" href="#t-tipografia">Ver reportes</a>
          </div>
        </demo-ejemplo>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Estilos de texto: tamaño/interlineado en px por dispositivo</caption>
            <thead>
              <tr>
                <th scope="col">Estilo</th>
                <th scope="col">Muestra</th>
                <th scope="col">Móvil</th>
                <th scope="col">Tableta</th>
                <th scope="col">Escritorio</th>
              </tr>
            </thead>
            <tbody>
              @for (e of estilos; track e.nombre) {
                <tr>
                  <th scope="row">
                    {{ e.nombre }}
                    <small><code>.{{ e.clase }}</code> · {{ e.peso }}</small>
                  </th>
                  <td><span [class]="e.clase">Obras para México</span></td>
                  @for (m of e.medidas; track $index) {
                    <td class="doc-mono">{{ m }}</td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: `
    .muestra {
      margin: var(--spacing-8) 0 !important;
      font-size: 5rem !important;
      line-height: 1 !important;
      color: var(--text-primary) !important;
    }
    .patria {
      font-family: var(--font-family-heading);
      font-weight: var(--font-weight-bold);
    }
    td {
      vertical-align: middle !important;
    }
    .texto-ejemplo {
      display: grid;
      gap: var(--spacing-8);
      max-width: 60ch;
    }
    .texto-ejemplo p {
      margin: 0;
    }
    .uki-link {
      color: var(--text-brand);
    }
  `,
})
export default class Tipografia {
  protected readonly estilos = ESTILOS;
  protected readonly ejemplo = `<h2 class="uki-heading-3">Fondo Nacional de Infraestructura</h2>
<p class="uki-body-md">Consulta los proyectos financiados y descarga los reportes trimestrales.</p>
<a class="uki-link" routerLink="/reportes">Ver reportes</a>`;
}
