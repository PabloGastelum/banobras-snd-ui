import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DemoEjemplo } from '../doc/ejemplo';
import { Portapapeles } from '../doc/portapapeles';
import { TemaDoc } from '../doc/tema';
import { alias, coleccion, contraste, cssVar, hex, nivel, rgb, Tema, textoSobre } from '../doc/tokens';

interface Paso {
  paso: string;
  token: string;
  css: string;
  hex: string;
  texto: string;
  contraste: string;
  nivel: string;
  base: boolean;
}

interface Familia {
  id: string;
  nombre: string;
  overline: string;
  base: string;
  pasos: Paso[];
}

/** Un decimal sin redondear hacia arriba: 4.47 se muestra 4.4 para no aparentar que cumple 4.5:1. */
const truncar = (ratio: number) => (Math.floor(ratio * 10) / 10).toFixed(1);

const pasos = (familia: string, base: string): Paso[] =>
  coleccion('Primitives')
    .vars.filter((v) => v.nombre.startsWith(`${familia}/`))
    .map((v) => v.nombre.split('/')[1])
    .sort((a, b) => Number(a) - Number(b))
    .map((paso) => {
      const token = `${familia}/${paso}`;
      const valor = hex(token);
      const texto = textoSobre(valor);
      return {
        paso,
        token,
        css: cssVar(token),
        hex: valor,
        texto: texto.color,
        contraste: truncar(texto.ratio),
        nivel: nivel(texto.ratio),
        base: paso === base,
      };
    });

const familia = (id: string, nombre: string, overline: string, prefijo: string, base: string): Familia => ({
  id,
  nombre,
  overline,
  base: `${prefijo}/${base}`,
  pasos: pasos(prefijo, base),
});

const APOYO = [
  { nombre: 'Error', prefijo: 'red', overline: 'Retroalimentación, tono 500' },
  { nombre: 'Éxito', prefijo: 'green', overline: 'Retroalimentación, tono 500' },
  { nombre: 'Información', prefijo: 'blue', overline: 'Retroalimentación, tono 500' },
  { nombre: 'Advertencia', prefijo: 'yellow', overline: 'Retroalimentación, tono 500' },
  { nombre: 'Morado', prefijo: 'purple', overline: 'Complementario, tono 500' },
  { nombre: 'Naranja', prefijo: 'orange', overline: 'Complementario, tono 500' },
].map((a) => {
  const fondo = hex(`${a.prefijo}/100`);
  const texto = hex(`${a.prefijo}/500`);
  const ratio = contraste(fondo, texto);
  return {
    ...a,
    base: `${a.prefijo}/500`,
    fondo: { token: `${a.prefijo}/100`, hex: fondo },
    texto: { token: `${a.prefijo}/500`, hex: texto },
    resultado: `500 sobre 100 · ${truncar(ratio)} ${nivel(ratio)}`,
  };
});

const ROLES = [
  {
    nombre: 'Primario',
    descripcion: 'Identidad principal e interacciones clave, como los botones primarios. Elige una sola paleta.',
    tokens: ['pguinda/900', 'pverde/900', 'gold/600'],
  },
  { nombre: 'Secundario', descripcion: 'Acentos que destacan información o secciones.', tokens: ['pverde/500', 'pguinda/600'] },
  { nombre: 'Neutro', descripcion: 'Colores base que equilibran la composición.', tokens: ['neutral/800', 'neutral/500'] },
  {
    nombre: 'Apoyo',
    descripcion: 'Comunican estados del sistema (error, éxito, información, advertencia) y los complementarios morado y naranja.',
    tokens: ['red/500', 'green/500', 'blue/500', 'yellow/500', 'purple/500', 'orange/500'],
  },
];

const TEMAS = [
  {
    id: 'guinda',
    nombre: 'Guinda' as Tema,
    overline: 'Tema de proyectos federales',
    oscuro: 'pguinda/900',
    claro: 'pguinda/600',
    estado: 'Tema por omisión',
    codigo: '',
  },
  {
    id: 'verde',
    nombre: 'Verde' as Tema,
    overline: 'Tema de proyectos transversales',
    oscuro: 'pverde/900',
    claro: 'pverde/600',
    estado: 'data-uki-theme="verde"',
    codigo: 'verde',
  },
].map((t) => ({ ...t, hexOscuro: hex(t.oscuro), hexClaro: hex(t.claro) }));

const DIRECCIONES = [
  { nombre: 'arriba', css: 'to top' },
  { nombre: 'abajo', css: 'to bottom' },
  { nombre: 'izquierda', css: 'to left' },
  { nombre: 'derecha', css: 'to right' },
];

interface FilaToken {
  css: string;
  guinda: { alias: string; hex: string };
  verde: { alias: string; hex: string };
  cambia: boolean;
}

const SEMANTICOS = (() => {
  const grupos = new Map<string, FilaToken[]>();
  for (const v of coleccion('Semantic').vars) {
    const grupo = v.nombre.split('/')[0];
    if (!grupos.has(grupo)) grupos.set(grupo, []);
    const guinda = { alias: cssVar(alias(v.nombre, 'Guinda') ?? v.nombre), hex: hex(v.nombre, 'Guinda') };
    const verde = { alias: cssVar(alias(v.nombre, 'Verde') ?? v.nombre), hex: hex(v.nombre, 'Verde') };
    grupos.get(grupo)!.push({ css: cssVar(v.nombre), guinda, verde, cambia: guinda.hex !== verde.hex });
  }
  return [...grupos.entries()].map(([grupo, tokens]) => ({ grupo, tokens }));
})();

@Component({
  selector: 'demo-colores',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-semantico">
        <header class="doc-encabezado">
          <h1 id="t-semantico" class="doc-titulo">Semántico</h1>
          <p class="doc-descripcion">
            Cómo se aplica la paleta, a partir del Sistema Nacional de Diseño (SND). Los primitivos son los valores; los tokens
            semánticos les dan una función (texto, íconos, bordes, fondos) para que la interfaz sea clara y consistente.
          </p>
        </header>

        <h2 class="doc-subtitulo">Roles de color</h2>
        <div class="doc-tarjetas roles">
          @for (rol of roles; track rol.nombre) {
            <article class="doc-tarjeta">
              <div class="circulos" aria-hidden="true">
                @for (t of rol.tokens; track t) {
                  <span [style.background]="'var(' + css(t) + ')'"></span>
                }
              </div>
              <h3>{{ rol.nombre }}</h3>
              <p>{{ rol.descripcion }}</p>
              <p class="doc-tokens doc-mono">{{ nombresCss(rol.tokens) }}</p>
            </article>
          }
        </div>

        <h2 class="doc-subtitulo">Temas y degradados</h2>
        <div class="temas">
          @for (tema of temas; track tema.id) {
            <article
              class="tema"
              [attr.aria-labelledby]="'tema-' + tema.id"
              [style.background]="'linear-gradient(135deg, var(' + css(tema.oscuro) + '), var(' + css(tema.claro) + '))'"
            >
              <h3 [id]="'tema-' + tema.id">{{ tema.nombre }}</h3>
              <p class="tema__nota">{{ tema.overline }} · color principal {{ css(tema.oscuro) }}</p>
              <p class="tema__estado">{{ tema.estado }}</p>
              <button
                type="button"
                class="tema__usar"
                [attr.aria-pressed]="temaDoc.actual() === tema.nombre"
                (click)="temaDoc.actual.set(tema.nombre)"
              >
                {{ temaDoc.actual() === tema.nombre ? 'Tema activo' : 'Ver la documentación en ' + tema.nombre }}
              </button>
              <div class="tema__pie">
                <div>
                  <p class="tema__degradado">Degradado {{ css(tema.oscuro) }} → {{ css(tema.claro) }}</p>
                  <p class="tema__nota">{{ tema.hexOscuro }} → {{ tema.hexClaro }} · el color claro marca la dirección</p>
                </div>
                <ul class="direcciones doc-muestra-color">
                  @for (d of direcciones; track d.nombre) {
                    <li
                      [style.background]="'linear-gradient(' + d.css + ', var(' + css(tema.oscuro) + '), var(' + css(tema.claro) + '))'"
                    >
                      {{ d.nombre }}
                    </li>
                  }
                </ul>
              </div>
            </article>
          }
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-primario">
        <header class="doc-encabezado">
          <h2 id="t-primario" class="doc-titulo">Primario</h2>
          <p class="doc-descripcion">
            Los colores institucionales que definen la identidad de Banobras. Cada familia (Guinda, Verde y Dorado) tiene un tono
            base en 600 y una escala de 10 pasos del 100 al 950. Cada paso indica el contraste del texto que mejor se lee encima.
          </p>
        </header>
        @for (f of primarios; track f.id) {
          <ng-container [ngTemplateOutlet]="filaFamilia" [ngTemplateOutletContext]="{ $implicit: f }" />
        }
      </section>

      <section class="doc-seccion" aria-labelledby="t-secundario">
        <header class="doc-encabezado">
          <h2 id="t-secundario" class="doc-titulo">Secundario</h2>
          <p class="doc-descripcion">Tonos de apoyo de la misma familia, marcados en la escala con ●.</p>
        </header>
        @for (f of secundarios; track f.id) {
          <ng-container [ngTemplateOutlet]="filaFamilia" [ngTemplateOutletContext]="{ $implicit: f }" />
        }
      </section>

      <section class="doc-seccion" aria-labelledby="t-neutro">
        <header class="doc-encabezado">
          <h2 id="t-neutro" class="doc-titulo">Neutro</h2>
          <p class="doc-descripcion">Grises para texto, bordes y fondos. El 800 es el color del texto principal.</p>
        </header>
        <ng-container [ngTemplateOutlet]="filaFamilia" [ngTemplateOutletContext]="{ $implicit: neutro }" />
      </section>

      <section class="doc-seccion" aria-labelledby="t-apoyo">
        <header class="doc-encabezado">
          <h2 id="t-apoyo" class="doc-titulo">Apoyo</h2>
          <p class="doc-descripcion">
            Cada estado tiene un fondo (100) y un color para texto y borde (500) que cumplen contraste entre sí. Los rojos 300,
            400 y 600 se usan además en Button danger.
          </p>
        </header>
        @for (a of apoyo; track a.prefijo) {
          <div class="familia familia--apoyo">
            <article class="base" [style.background]="'var(' + css(a.base) + ')'" [style.color]="textoDe(a.base)">
              <h3>{{ a.nombre }}</h3>
              <p class="base__rol">{{ a.overline }}</p>
              <p class="base__token">
                <span class="doc-mono">{{ css(a.base) }}</span>
                <span>{{ a.texto.hex }} · {{ rgbTexto(a.texto.hex) }}</span>
              </p>
            </article>
            <div class="apoyo">
              <div class="apoyo__bloque" [style.background]="'var(' + css(a.fondo.token) + ')'">
                <p class="doc-overline">Fondo</p>
                <p class="apoyo__ejemplo" [style.color]="'var(' + css(a.texto.token) + ')'">{{ a.resultado }}</p>
                <p class="doc-mono">{{ css(a.fondo.token) }} · {{ a.fondo.hex }}</p>
              </div>
              <div class="apoyo__bloque apoyo__bloque--texto" [style.background]="'var(' + css(a.texto.token) + ')'">
                <p class="doc-overline">Texto · borde</p>
                <p class="doc-mono">{{ css(a.texto.token) }} · {{ a.texto.hex }}</p>
              </div>
            </div>
          </div>
        }
      </section>

      <section class="doc-seccion" aria-labelledby="t-tokens">
        <header class="doc-encabezado">
          <h2 id="t-tokens" class="doc-titulo">Tokens semánticos</h2>
          <p class="doc-descripcion">
            Las {{ totalSemanticos }} variables que usan los componentes. {{ cambianConTema }} cambian con el tema; las demás
            (texto, neutros y estados) son iguales en guinda y verde. En código siempre se usa el token semántico, nunca el
            primitivo, para que el tema funcione solo.
          </p>
        </header>
        <demo-ejemplo titulo="Usar tokens en CSS" nombre="aviso" [css]="ejemploCss">
          <p class="aviso-ejemplo">Tu solicitud se envió. Te avisaremos por correo cuando cambie de estado.</p>
        </demo-ejemplo>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla tokens">
            <caption>
              Valor de cada token en los dos temas; la columna del tema activo va resaltada. Haz clic en un token para copiar su
              variable.
            </caption>
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Guinda</th>
                <th scope="col">Verde</th>
              </tr>
            </thead>
            @for (g of semanticos; track g.grupo) {
              <tbody>
                <tr class="tokens__grupo">
                  <th scope="rowgroup" colspan="3">{{ g.grupo }}</th>
                </tr>
                @for (t of g.tokens; track t.css) {
                  <tr>
                    <th scope="row">
                      <button type="button" class="token" (click)="copiar(t.css)">
                        <span class="doc-token__muestra" [style.background]="'var(' + t.css + ')'"></span>
                        <span class="doc-oculto">Copiar </span><code>{{ t.css }}</code>
                        <span class="token__aviso" aria-hidden="true">{{ portapapeles.estado(t.css) === 'copiado' ? 'Copiado' : 'Copiar' }}</span>
                      </button>
                    </th>
                    <td [class.tokens__activa]="tema.actual() === 'Guinda'"><code>{{ t.guinda.alias }}</code> <span class="tokens__hex">{{ t.guinda.hex }}</span></td>
                    <td [class.tokens__activa]="tema.actual() === 'Verde'">
                      @if (t.cambia) {
                        <code>{{ t.verde.alias }}</code> <span class="tokens__hex">{{ t.verde.hex }}</span>
                      } @else {
                        <span class="tokens__igual">Igual</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            }
          </table>
        </div>
      </section>
    </div>

    <ng-template #filaFamilia let-f>
      <div class="familia">
        <article class="base" [style.background]="'var(' + css(f.base) + ')'" [style.color]="textoDe(f.base)">
          <h3>{{ f.nombre }}</h3>
          <p class="base__rol">{{ f.overline }}</p>
          <p class="base__token">
            <span class="doc-mono">{{ css(f.base) }}</span>
            <span>{{ hexDe(f.base) }} · {{ rgbTexto(hexDe(f.base)) }}</span>
          </p>
        </article>
        <ol class="escala doc-muestra-color" [attr.aria-label]="'Escala ' + f.nombre" [style.--pasos]="f.pasos.length">
          @for (p of f.pasos; track p.paso) {
            <li [style.background]="'var(' + p.css + ')'" [style.color]="p.texto">
              <button type="button" class="escala__copiar" [attr.aria-label]="'Copiar var(' + p.css + ')'" (click)="copiar(p.css)">
                <span class="escala__paso">{{ p.paso }}@if (p.base) {<span> ●</span>}</span>
                <span class="escala__dato">
                  <span class="doc-mono">{{ p.hex }}</span>
                  <small>{{ p.contraste }}</small>
                  <small>{{ p.nivel }}</small>
                </span>
                <span class="escala__aviso" aria-hidden="true">{{ portapapeles.estado(p.css) === 'copiado' ? 'Copiado' : 'Copiar' }}</span>
              </button>
            </li>
          }
        </ol>
      </div>
    </ng-template>
  `,
  imports: [NgTemplateOutlet, DemoEjemplo],
  styles: `
    .roles .doc-tarjeta {
      min-height: 176px;
    }
    .circulos {
      display: flex;
      margin-bottom: var(--spacing-12);
    }
    .circulos span {
      width: 32px;
      height: 32px;
      margin-right: -6px;
      border: 2px solid var(--neutral-300);
      border-radius: var(--radius-full);
    }
    .temas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: var(--spacing-16);
    }
    .tema {
      display: grid;
      grid-template-rows: auto auto auto auto 1fr;
      align-content: start;
      min-height: 240px;
      padding: var(--spacing-24);
      border-radius: var(--radius-16);
      color: var(--text-inverse);
    }
    .tema h3 {
      margin: var(--spacing-4) 0 var(--spacing-8);
      font-size: 2rem;
      font-weight: var(--font-weight-semibold);
    }
    .tema p {
      margin: 0;
    }
    .tema__nota {
      font-size: var(--font-size-caption);
    }
    .tema__usar {
      justify-self: start;
      min-height: 40px;
      margin-top: var(--spacing-16);
      padding: 0 var(--spacing-16);
      border: 1px solid rgb(255 255 255 / 70%);
      border-radius: var(--radius-8);
      background: transparent;
      color: inherit;
      font: inherit;
      font-size: var(--font-size-body-sm);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
    }
    .tema__usar:hover {
      background: rgb(255 255 255 / 12%);
    }
    .tema__usar[aria-pressed='true'] {
      background: var(--neutral-100);
      color: var(--neutral-800);
    }
    .tema__usar:focus-visible {
      outline: 2px solid var(--neutral-100);
      outline-offset: 2px;
    }
    .tema__estado {
      justify-self: start;
      margin-top: var(--spacing-12) !important;
      padding: 2px var(--spacing-8);
      border: 1px solid rgb(255 255 255 / 50%);
      border-radius: var(--radius-full);
      font-size: 0.6875rem;
      font-weight: var(--font-weight-medium);
    }
    .base__rol {
      font-size: var(--font-size-caption);
    }
    .aviso-ejemplo {
      margin: 0;
      padding: var(--spacing-16);
      border: 1px solid var(--feedback-success-foreground);
      border-radius: var(--radius-8);
      background: var(--feedback-success-background);
      color: var(--feedback-success-foreground);
      font-size: var(--font-size-body-sm);
    }
    .tema__pie {
      display: flex;
      flex-wrap: wrap;
      align-items: end;
      justify-content: space-between;
      gap: var(--spacing-16);
      margin-top: var(--spacing-32);
    }
    .tema__degradado {
      font-weight: var(--font-weight-medium);
    }
    .direcciones {
      display: flex;
      gap: var(--spacing-8);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .direcciones li {
      display: flex;
      align-items: end;
      width: 56px;
      height: 48px;
      box-sizing: border-box;
      padding: var(--spacing-4) var(--spacing-8);
      border: 1px solid rgb(255 255 255 / 40%);
      border-radius: var(--radius-8);
      font-size: 0.625rem;
    }
    :host {
      display: block;
      container-type: inline-size;
    }
    .familia {
      display: grid;
      grid-template-columns: minmax(220px, 3fr) minmax(0, 10fr);
      gap: var(--spacing-16);
    }
    /* La escala necesita unos 72 px por paso: debajo de ese ancho la tarjeta base va arriba. */
    @container (max-width: 1080px) {
      .familia {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--spacing-8);
      }
      /* Más específico que .base, que se declara después. */
      .familia .base {
        grid-template-columns: minmax(0, 1fr) auto;
        grid-template-rows: auto auto;
        align-items: end;
        min-height: 0;
        column-gap: var(--spacing-24);
      }
      .familia .base h3 {
        grid-column: 1;
      }
      .familia .base__token {
        grid-column: 2;
        grid-row: 1 / span 2;
        text-align: right;
      }
      .familia .escala li {
        min-height: 160px;
      }
      .familia.familia--apoyo .base {
        min-height: 0;
      }
    }
    .base {
      display: grid;
      grid-template-rows: auto auto 1fr;
      min-height: 200px;
      padding: var(--spacing-24);
      border-radius: var(--radius-16);
      color: var(--text-inverse);
    }
    .base h3 {
      margin: var(--spacing-4) 0 0;
      font-size: 2rem;
      font-weight: var(--font-weight-semibold);
    }
    .base p {
      margin: 0;
    }
    .base__token {
      display: grid;
      align-self: end;
      gap: 2px;
      font-size: var(--font-size-caption);
    }
    .base__token .doc-mono {
      font-size: var(--font-size-body-sm);
      font-weight: var(--font-weight-medium);
    }
    .escala {
      display: grid;
      grid-template-columns: repeat(var(--pasos), minmax(64px, 1fr));
      margin: 0;
      padding: 0;
      overflow-x: auto;
      border-radius: var(--radius-16);
      list-style: none;
    }
    .escala li {
      display: grid;
      min-height: 200px;
    }
    .escala__copiar {
      position: relative;
      display: grid;
      grid-template-rows: auto 1fr;
      padding: var(--spacing-12);
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: copy;
    }
    .escala__copiar:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: -4px;
    }
    .escala__aviso {
      position: absolute;
      top: 50%;
      left: 50%;
      padding: 2px var(--spacing-8);
      border-radius: var(--radius-full);
      background: var(--neutral-100);
      color: var(--neutral-800);
      font-size: 0.6875rem;
      font-weight: var(--font-weight-semibold);
      opacity: 0;
      transform: translate(-50%, -40%);
      transition:
        opacity 160ms cubic-bezier(0.16, 1, 0.3, 1),
        transform 160ms cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }
    .escala__copiar:hover .escala__aviso,
    .escala__copiar:focus-visible .escala__aviso {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
    .escala__paso {
      font-size: var(--font-size-body-sm);
      font-weight: var(--font-weight-semibold);
    }
    .escala__dato {
      display: grid;
      align-self: end;
      align-content: end;
      gap: 2px;
    }
    .escala__dato .doc-mono {
      font-size: 0.6875rem;
      font-weight: var(--font-weight-semibold);
    }
    .escala__dato small {
      font-size: 0.625rem;
      white-space: nowrap;
    }
    .familia--apoyo .base {
      min-height: 160px;
    }
    .apoyo {
      display: grid;
      grid-template-columns: 1fr 1fr;
      overflow: hidden;
      border-radius: var(--radius-16);
    }
    .apoyo__bloque {
      display: grid;
      align-content: space-between;
      gap: var(--spacing-12);
      padding: var(--spacing-24);
      color: var(--text-primary);
    }
    .apoyo__bloque p {
      margin: 0;
    }
    .apoyo__bloque--texto {
      color: var(--text-inverse);
    }
    .apoyo__ejemplo {
      font-size: var(--font-size-body-md);
      font-weight: var(--font-weight-semibold);
    }
    .tokens td,
    .tokens tbody th {
      padding: var(--spacing-8) var(--spacing-16);
      vertical-align: middle;
    }
    .tokens tbody th {
      white-space: nowrap;
    }
    .tokens tbody th {
      font-weight: var(--font-weight-regular);
    }
    .tokens__grupo th {
      padding-top: var(--spacing-24) !important;
      font-weight: var(--font-weight-semibold) !important;
      text-transform: capitalize;
    }
    .tokens code {
      font-size: 0.8125rem;
    }
    .tokens td code {
      color: var(--text-secondary);
    }
    .tokens__hex,
    .tokens__igual {
      font-size: var(--font-size-caption);
      color: var(--text-secondary);
    }
    /* Alias arriba y valor abajo: la tabla cabe sin desplazamiento horizontal junto al índice. */
    .tokens td code,
    .tokens__hex {
      display: block;
      white-space: nowrap;
    }
    .tokens td.tokens__activa {
      background: var(--background-surface);
    }
    .tokens td.tokens__activa code {
      color: var(--text-primary);
    }
    .token {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-8);
      margin-left: calc(var(--spacing-8) * -1);
      padding: var(--spacing-4) var(--spacing-8);
      border: 0;
      border-radius: var(--radius-8);
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: copy;
    }
    .token:hover {
      background: var(--background-surface);
    }
    .token:focus-visible {
      outline: 2px solid var(--border-brand);
      outline-offset: 1px;
    }
    /* Fuera del flujo para que no ensanche la columna. */
    .token__aviso {
      position: absolute;
      top: 50%;
      left: calc(100% + var(--spacing-4));
      padding: 2px var(--spacing-8);
      border-radius: var(--radius-full);
      background: var(--background-surface);
      box-shadow: var(--elevation-raised);
      font-size: var(--font-size-caption);
      color: var(--text-brand);
      transform: translateY(-50%);
      pointer-events: none;
      opacity: 0;
      transition: opacity 160ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    .token:hover .token__aviso,
    .token:focus-visible .token__aviso {
      opacity: 1;
    }
  `,
})
export default class Colores {
  protected readonly roles = ROLES;
  protected readonly temas = TEMAS;
  protected readonly direcciones = DIRECCIONES;
  protected readonly primarios = [
    familia('guinda', 'Guinda', 'Tono base 600', 'pguinda', '600'),
    familia('verde', 'Verde', 'Tono base 600', 'pverde', '600'),
    familia('dorado', 'Dorado', 'Tono base 600', 'gold', '600'),
  ];
  protected readonly secundarios = [
    familia('verde-500', 'Verde', 'Secundario, tono 500', 'pverde', '500'),
    familia('guinda-600', 'Guinda', 'Secundario, tono 600', 'pguinda', '600'),
  ];
  protected readonly neutro = familia('neutro', 'Neutro', 'Tono base 800', 'neutral', '800');
  protected readonly apoyo = APOYO;
  protected readonly semanticos = SEMANTICOS;
  protected readonly totalSemanticos = coleccion('Semantic').vars.length;

  protected readonly portapapeles = inject(Portapapeles);
  protected readonly temaDoc = inject(TemaDoc);
  protected readonly tema = this.temaDoc;
  protected readonly cambianConTema = SEMANTICOS.flatMap((g) => g.tokens).filter((t) => t.cambia).length;
  protected readonly ejemploCss = `.aviso {
  padding: var(--spacing-16);
  border: 1px solid var(--feedback-success-foreground);
  border-radius: var(--radius-8);
  background: var(--feedback-success-background);
  color: var(--feedback-success-foreground);
  font-size: var(--font-size-body-sm);
}`;

  protected css = cssVar;
  protected copiar = (variable: string) => void this.portapapeles.copiar(`var(${variable})`, variable, variable);
  protected hexDe = hex;
  protected nombresCss = (tokens: string[]) => tokens.map(cssVar).join(' · ');
  protected rgbTexto = (valor: string) => `rgb(${rgb(valor).join(', ')})`;
  /** Texto de la tarjeta base: blanco o text/primary, el que mejor contraste (Dorado 600 no alcanza 4.5:1 con blanco). */
  protected textoDe = (token: string) => textoSobre(hex(token)).color;
}
