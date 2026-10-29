import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UkiButton } from '@banobras/uki';
import { DemoEjemplo } from '../doc/ejemplo';
import { DemoIcono } from '../doc/iconos';
import { figmaVersion } from '../doc/tokens';

/** Estados de la portada de Figma; la biblioteca está «En curso» hasta su v1.0.0. */
const ESTADOS = [
  { nombre: 'Idea', actual: false },
  { nombre: 'Exploración', actual: false },
  { nombre: 'En curso', actual: true },
  { nombre: 'Publicado', actual: false },
];

const SECCIONES = [
  {
    titulo: 'Fundamentos',
    descripcion: 'Tokens de color, espaciado, retícula, radios, elevación y tipografía.',
    enlaces: [
      { ruta: '/colores', texto: 'Colores' },
      { ruta: '/espaciado', texto: 'Espaciado' },
      { ruta: '/reticula', texto: 'Retícula' },
      { ruta: '/radios', texto: 'Radios' },
      { ruta: '/elevacion', texto: 'Elevación' },
      { ruta: '/tipografia', texto: 'Tipografía' },
    ],
  },
  {
    titulo: 'Componentes',
    descripcion: 'Componentes Angular listos para usar, con sus variantes, estados y código.',
    enlaces: [
      { ruta: '/button', texto: 'Button' },
      { ruta: '/checkbox', texto: 'Checkbox' },
      { ruta: '/search', texto: 'Search' },
      { ruta: '/select', texto: 'Select' },
      { ruta: '/spinner', texto: 'Spinner' },
      { ruta: '/text-area', texto: 'Text area' },
      { ruta: '/text-field', texto: 'Text field' },
    ],
  },
];

/** Portada de la documentación con la misma distribución y descripción que la portada de UKI en Figma. */
@Component({
  selector: 'demo-inicio',
  imports: [RouterLink, UkiButton, DemoEjemplo, DemoIcono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="portada" aria-labelledby="t-inicio">
        <div class="portada__texto">
          <ol class="estados" aria-label="Estado de la biblioteca">
            @for (e of estados; track e.nombre) {
              <li [class.actual]="e.actual" [attr.aria-current]="e.actual ? 'step' : null">{{ e.nombre }}</li>
            }
          </ol>
          <h1 id="t-inicio" class="portada__titulo">UKI - Library</h1>
          <p class="portada__descripcion">
            La biblioteca es el sistema de diseño base de <strong>BANOBRAS</strong>: armoniza la identidad de marca y las
            experiencias digitales en todos los productos. Ofrece un marco común de fundamentos, componentes reutilizables y
            tokens de diseño.
          </p>
          <div class="portada__acciones">
            <a ukiButton routerLink="/colores">Explorar fundamentos</a>
            <a ukiButton variant="secondary" routerLink="/button">Ver componentes</a>
          </div>
          <ul class="portada__datos">
            <li>
              <a [href]="figma" target="_blank" rel="noopener noreferrer">
                Figma · UKI Library v{{ version }}
                <demo-icono nombre="externo" />
                <span class="doc-oculto">(se abre en otra pestaña)</span>
              </a>
            </li>
            <li><code>&#64;banobras/uki</code> 0.1.0</li>
            <li>Angular 20 a 22</li>
          </ul>
        </div>
        <svg class="portada__figura" viewBox="0 0 360 360" aria-hidden="true" focusable="false">
          <circle cx="90" cy="90" r="75" class="lleno" />
          <path d="M195 165A150 150 0 0 1 345 15V165Z" class="lleno" />
          <path d="M15 345A75 75 0 0 1 165 345Z" class="lleno" />
          <circle cx="270" cy="270" r="75" class="linea" />
          <circle cx="270" cy="270" r="45" class="linea" />
        </svg>
      </section>

      <section class="doc-seccion" aria-labelledby="t-empezar">
        <header class="doc-encabezado">
          <h2 id="t-empezar" class="doc-titulo">Cómo empezar</h2>
          <p class="doc-descripcion">Tres pasos para usar UKI en cualquiera de los sistemas de Banobras.</p>
        </header>
        <ol class="pasos">
          <li>
            <h3>Instala el paquete</h3>
            <p>Mientras no esté en el registro privado, genera el .tgz con <code>npm run pack:uki</code> en este repositorio.</p>
            <demo-ejemplo titulo="Terminal" [soloCodigo]="true" [archivos]="[instalar]" />
          </li>
          <li>
            <h3>Agrega los estilos globales</h3>
            <p>Tokens, fuentes y estilos base. Van antes de los estilos del proyecto.</p>
            <demo-ejemplo titulo="angular.json" [soloCodigo]="true" [archivos]="[estilos]" />
          </li>
          <li>
            <h3>Usa los componentes</h3>
            <p>Importa solo los que necesites; cada uno trae su CSS.</p>
            <demo-ejemplo titulo="Tu primer botón" nombre="inicio" [html]="usarHtml" [ts]="usarTs">
              <button ukiButton type="button">Continuar</button>
            </demo-ejemplo>
          </li>
        </ol>
      </section>

      <section class="doc-seccion" aria-labelledby="t-contenido">
        <header class="doc-encabezado">
          <h2 id="t-contenido" class="doc-titulo">Contenido</h2>
          <p class="doc-descripcion">Cada página sigue la página equivalente del archivo de Figma.</p>
        </header>
        <div class="contenido">
          @for (s of secciones; track s.titulo) {
            <article class="doc-tarjeta">
              <h3>{{ s.titulo }}</h3>
              <p>{{ s.descripcion }}</p>
              <ul>
                @for (e of s.enlaces; track e.ruta) {
                  <li>
                    <a [routerLink]="e.ruta">{{ e.texto }}<demo-icono nombre="flecha-der" /></a>
                  </li>
                }
              </ul>
            </article>
          }
        </div>
      </section>
    </div>
  `,
  styles: `
    .portada {
      display: grid;
      grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
      align-items: center;
      gap: var(--spacing-48);
      margin: calc(var(--spacing-48) * -1) calc(var(--spacing-40) * -1) 0;
      padding: var(--spacing-64) var(--spacing-40);
      background: var(--background-page);
      border-bottom: 1px solid var(--border-low-contrast);
    }
    .portada__texto {
      display: grid;
      gap: var(--spacing-24);
      min-width: 0;
    }
    .estados {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-8) var(--spacing-24);
      margin: 0;
      padding: 0;
      list-style: none;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: var(--font-size-caption);
      color: var(--text-secondary);
    }
    .estados li {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-8);
    }
    .estados li::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: var(--radius-full);
      background: var(--text-secondary);
    }
    .estados .actual {
      color: var(--text-primary);
      font-weight: var(--font-weight-semibold);
    }
    .estados .actual::before {
      background: var(--brand-primary);
    }
    .portada__titulo {
      margin: 0;
      font-family: var(--font-family-heading);
      font-size: clamp(3rem, 7vw, 5.5rem);
      line-height: 1;
      font-weight: 300;
      letter-spacing: -0.03em;
      color: var(--text-primary);
      text-wrap: balance;
    }
    .portada__descripcion {
      max-width: 52ch;
      margin: 0;
      font-size: var(--font-size-body-lg);
      line-height: var(--font-line-height-body-lg);
      color: var(--text-secondary);
    }
    .portada__descripcion strong {
      color: var(--text-primary);
    }
    .portada__acciones {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-12);
    }
    .portada__datos {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-8) var(--spacing-24);
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: var(--font-size-body-sm);
      color: var(--text-secondary);
    }
    .portada__datos a {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-4);
      color: var(--text-brand);
    }
    .portada__datos a:focus-visible {
      outline: 2px solid var(--border-brand);
      outline-offset: 2px;
    }
    .portada__figura {
      width: 100%;
      max-width: 360px;
      justify-self: end;
    }
    .lleno {
      fill: var(--brand-primary);
    }
    .linea {
      fill: none;
      stroke: var(--text-primary);
      stroke-width: 1;
    }
    @media (max-width: 1023.98px) {
      .portada {
        grid-template-columns: minmax(0, 1fr);
        margin-inline: calc(var(--spacing-16) * -1);
        padding: var(--spacing-40) var(--spacing-16);
      }
      .portada__figura {
        grid-row: 1;
        justify-self: start;
        max-width: 160px;
      }
    }
    @media (max-width: 767.98px) {
      .portada {
        margin-top: calc(var(--spacing-32) * -1);
      }
    }
    .pasos {
      display: grid;
      gap: var(--spacing-40);
      margin: 0;
      padding: 0;
      list-style: none;
      counter-reset: paso;
    }
    .pasos > li {
      display: grid;
      gap: var(--spacing-12);
      padding-left: var(--spacing-48);
      position: relative;
      counter-increment: paso;
    }
    .pasos > li::before {
      content: counter(paso);
      position: absolute;
      top: 0;
      left: 0;
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      background: var(--button-tint);
      color: var(--text-brand);
      font-weight: var(--font-weight-semibold);
    }
    .pasos h3 {
      margin: 0;
      font-size: 1.25rem;
      line-height: 32px;
      font-weight: var(--font-weight-semibold);
    }
    .pasos p {
      margin: 0;
      color: var(--text-secondary);
    }
    .contenido {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: var(--spacing-16);
    }
    .contenido ul {
      display: grid;
      margin: var(--spacing-8) 0 0;
      padding: 0;
      list-style: none;
    }
    .contenido a {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-12) 0;
      border-bottom: 1px solid var(--border-low-contrast);
      color: var(--text-primary);
      font-weight: var(--font-weight-medium);
      text-decoration: none;
    }
    .contenido li:last-child a {
      border-bottom: 0;
    }
    .contenido a:hover {
      color: var(--text-brand);
    }
    .contenido a:focus-visible {
      outline: 2px solid var(--border-brand);
      outline-offset: 2px;
    }
  `,
})
export default class Inicio {
  protected readonly estados = ESTADOS;
  protected readonly secciones = SECCIONES;
  protected readonly version = figmaVersion;
  protected readonly figma = 'https://www.figma.com/design/6fzZVvIfv44dGFePtb5F9n/UKI---Library?node-id=0-1';
  protected readonly instalar = {
    nombre: 'terminal',
    lenguaje: 'ts' as const,
    codigo: `npm install ../banobras-snd-ui/dist/uki/banobras-uki-0.1.0.tgz`,
  };
  protected readonly estilos = {
    nombre: 'angular.json',
    lenguaje: 'ts' as const,
    codigo: `"styles": [
  "node_modules/@banobras/uki/styles/uki.css",
  "src/styles.css"
]`,
  };
  protected readonly usarHtml = `<button ukiButton type="button">Continuar</button>`;
  protected readonly usarTs = `import { Component } from '@angular/core';
import { UkiButton } from '@banobras/uki';

@Component({
  selector: 'app-inicio',
  imports: [UkiButton],
  templateUrl: './inicio.html',
})
export class Inicio {}`;
}
