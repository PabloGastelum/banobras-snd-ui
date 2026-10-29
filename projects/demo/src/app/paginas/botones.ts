import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UkiButton, UkiButtonGroup, UkiButtonSize, UkiButtonVariant, UkiCheckbox } from '@banobras/uki';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';
import { DocToken } from '../doc/token';

interface Celda {
  fondo: string;
  texto: string;
  borde?: string;
  nota?: string;
}

/** Tabla «States» de Figma: tokens por estado y variante (igual que la especificación). */
const ESTADOS: { estado: string; detalle: string; celdas: (Celda | null)[] }[] = [
  {
    estado: 'Default',
    detalle: 'Listo para usarse.',
    celdas: [
      { fondo: 'button/primary', texto: 'text/inverse' },
      { fondo: 'background/surface', texto: 'text/brand', borde: 'border/brand', nota: '1 px' },
      { fondo: 'none', texto: 'text/brand' },
      { fondo: 'button/danger', texto: 'text/inverse' },
    ],
  },
  {
    estado: 'Hover',
    detalle: 'Puntero encima. Solo escritorio.',
    celdas: [
      { fondo: 'button/primary-hover', texto: 'text/inverse' },
      { fondo: 'button/tint', texto: 'text/brand', borde: 'border/brand', nota: '1 px' },
      { fondo: 'button/tint', texto: 'button/primary-hover' },
      { fondo: 'button/danger-hover', texto: 'text/inverse' },
    ],
  },
  {
    estado: 'Focus',
    detalle: 'Foco con teclado. Borde exterior que no depende solo del color.',
    celdas: [
      { fondo: 'button/primary', texto: 'text/inverse', borde: 'button/focus-ring', nota: '2 px fuera' },
      { fondo: 'background/surface', texto: 'text/brand', borde: 'border/brand', nota: '3 px fuera' },
      { fondo: 'button/tint', texto: 'text/brand', borde: 'border/brand', nota: '2 px fuera' },
      { fondo: 'button/danger', texto: 'text/inverse', borde: 'button/danger-focus-ring', nota: '2 px fuera' },
    ],
  },
  {
    estado: 'Pressed',
    detalle: 'Mientras se mantiene el clic. Confirma que la acción empezó.',
    celdas: [
      { fondo: 'button/tint', texto: 'text/primary' },
      { fondo: 'button/tint-pressed', texto: 'text/brand' },
      { fondo: 'button/tint-pressed', texto: 'button/ghost-pressed' },
      { fondo: 'button/danger-pressed', texto: 'text/inverse' },
    ],
  },
  {
    estado: 'Disabled',
    detalle: 'No disponible. Ni clic ni foco.',
    celdas: [
      { fondo: 'button/disabled-background', texto: 'button/disabled-foreground' },
      { fondo: 'background/surface', texto: 'button/disabled-border', borde: 'button/disabled-border', nota: '1 px' },
      { fondo: 'none', texto: 'button/disabled-foreground' },
      { fondo: 'button/disabled-background', texto: 'button/disabled-foreground' },
    ],
  },
  {
    estado: 'Loading',
    detalle: 'Proceso en curso. El spinner reemplaza el texto y el ancho se conserva.',
    celdas: [
      { fondo: 'button/primary', texto: 'text/inverse' },
      { fondo: 'background/surface', texto: 'text/brand', borde: 'border/brand', nota: '1 px' },
      null,
      { fondo: 'button/danger', texto: 'text/inverse' },
    ],
  },
];

const PARTES: Parte[] = [
  { selector: '.uki-button', nombre: 'Contenedor', detalle: '48 px (Large 64 px) · radius-8 · relleno spacing-24 (Ghost spacing-8) · fondo y borde según variante', lado: 'arriba', alinear: 'inicio' },
  { selector: '[ukiButtonLeading]', nombre: 'Ícono inicial', detalle: 'Opcional · 24 px · hereda el color del texto · ukiButtonLeading', lado: 'abajo' },
  { selector: '.uki-button__label', nombre: 'Texto', detalle: 'Estilo Button · 16/24 SemiBold · text/inverse en Primary y Danger, text/brand en Secondary y Ghost', lado: 'arriba' },
  { selector: '[ukiButtonTrailing]', nombre: 'Ícono final', detalle: 'Opcional · 24 px · hereda el color del texto · ukiButtonTrailing', lado: 'abajo' },
];

@Component({
  selector: 'demo-botones',
  imports: [UkiButton, UkiButtonGroup, UkiCheckbox, RouterLink, DocAnatomia, DocToken, DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Button</h1>
          <p class="doc-descripcion">
            Un botón ejecuta una acción. Su estilo indica qué tan importante es. Usa un nivel por acción y un solo Primary por
            sección.
          </p>
        </header>
        <div class="doc-tarjetas">
          @for (v of resumen; track v.variante) {
            <article class="doc-tarjeta">
              <div class="doc-visual">
                <button ukiButton type="button" [variant]="v.variante">Continuar</button>
              </div>
              <h3>{{ v.titulo }}</h3>
              <p>{{ v.descripcion }}</p>
              <p class="doc-tokens doc-mono">variant="{{ v.variante }}"</p>
            </article>
          }
        </div>
        <demo-ejemplo titulo="Variantes" nombre="variantes" [html]="codigo.variantes" [ts]="codigo.importar">
          <button ukiButton variant="ghost" type="button">Ver más</button>
          <button ukiButton variant="secondary" type="button">Cancelar</button>
          <button ukiButton type="button">Continuar</button>
          <button ukiButton variant="danger" type="button">Eliminar</button>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-atomos">
        <header class="doc-encabezado">
          <h2 id="t-atomos" class="doc-titulo">Átomos</h2>
          <p class="doc-descripcion">
            Cuatro variantes, dos tamaños y seis estados. Default, Disabled y Loading se fijan con entradas; Hover, Focus y
            Pressed salen de la interacción: pasa el puntero, usa Tab o mantén presionado.
          </p>
        </header>
        <div class="doc-flujo">
          <uki-checkbox [(checked)]="todoDeshabilitado">Deshabilitar todo</uki-checkbox>
          <uki-checkbox [(checked)]="todoCargando">Loading en todo</uki-checkbox>
        </div>
        <div class="doc-matriz" tabindex="0">
          <table>
            <caption class="doc-descripcion">Filas: variante y tamaño. Columnas: estado.</caption>
            <thead>
              <tr>
                <th scope="col">Variante</th>
                <th scope="col">Default</th>
                <th scope="col">Disabled</th>
                <th scope="col">Loading</th>
              </tr>
            </thead>
            <tbody>
              @for (fila of filas; track fila.clave) {
                <tr>
                  <th scope="row">{{ fila.variante }} · {{ fila.tamano }}</th>
                  <td>
                    <button
                      ukiButton
                      type="button"
                      [attr.data-prueba]="fila.clave"
                      [variant]="fila.variante"
                      [size]="fila.tamano"
                      [disabled]="todoDeshabilitado()"
                      [loading]="todoCargando()"
                    >
                      Continuar
                    </button>
                  </td>
                  <td>
                    <button ukiButton type="button" [variant]="fila.variante" [size]="fila.tamano" disabled>Continuar</button>
                  </td>
                  <td>
                    @if (fila.variante === 'ghost') {
                      <span class="doc-descripcion">No aplica</span>
                    } @else {
                      <button ukiButton type="button" [variant]="fila.variante" [size]="fila.tamano" loading>Continuar</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <demo-ejemplo titulo="Tamaño y estados" nombre="estados" [html]="codigo.estados">
          <button ukiButton size="large" type="button">Continuar</button>
          <button ukiButton type="button" disabled>No disponible</button>
          <button ukiButton type="button" loading>Guardar</button>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">Cuatro partes. Los íconos son opcionales y se proyectan con atributos.</p>
        </header>
        <demo-anatomia [partes]="partes">
          <button ukiButton type="button" tabindex="-1">
            <svg ukiButtonLeading viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            Continuar
            <svg ukiButtonTrailing viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </demo-anatomia>
        <demo-ejemplo titulo="Con íconos" nombre="iconos" [html]="codigo.iconos">
          <button ukiButton type="button">
            <svg ukiButtonLeading viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            Agregar
          </button>
          <button ukiButton variant="secondary" type="button">
            Siguiente
            <svg ukiButtonTrailing viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-estados">
        <header class="doc-encabezado">
          <h2 id="t-estados" class="doc-titulo">Estados</h2>
          <p class="doc-descripcion">
            Seis estados compartidos por todas las variantes. Cada estado solo cambia el token de fondo, borde o texto.
          </p>
        </header>
        <div class="doc-tarjeta">
          <p class="doc-overline">Flujo de interacción</p>
          <p class="doc-flujo">
            <span class="doc-pildora">Default</span><span aria-hidden="true">→</span>
            <span class="doc-pildora">Hover</span><span aria-hidden="true">→</span>
            <span class="doc-pildora">Focus</span><span aria-hidden="true">→</span>
            <span class="doc-pildora">Pressed</span><span aria-hidden="true">→</span>
            <span class="doc-pildora">Loading</span><span aria-hidden="true">·</span>
            <span class="doc-pildora doc-pildora--apagada">Disabled</span>
          </p>
        </div>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Tokens por estado y variante</caption>
            <thead>
              <tr>
                <th scope="col">Estado</th>
                <th scope="col">Primary</th>
                <th scope="col">Secondary</th>
                <th scope="col">Ghost</th>
                <th scope="col">Danger</th>
              </tr>
            </thead>
            <tbody>
              @for (fila of estados; track fila.estado) {
                <tr>
                  <th scope="row">{{ fila.estado }}<small>{{ fila.detalle }}</small></th>
                  @for (c of fila.celdas; track $index) {
                    <td>
                      @if (c) {
                        <demo-token parte="Fondo" [nombre]="c.fondo" />
                        <demo-token parte="Texto" [nombre]="c.texto" />
                        @if (c.borde) {
                          <demo-token parte="Borde" [nombre]="c.borde" [nota]="c.nota" />
                        }
                      } @else {
                        <span class="doc-descripcion">No aplica</span>
                      }
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
        <h3 class="doc-subtitulo">Loading en una acción real</h3>
        <p class="doc-descripcion">Conserva el ancho y el foco mientras dura la operación; los clics extra se ignoran.</p>
        <demo-ejemplo titulo="Guardar con loading" nombre="guardar" [html]="codigo.loadingHtml" [ts]="codigo.loadingTs">
          <button ukiButton type="button" data-prueba="guardar" [loading]="guardando()" (click)="guardar()">Guardar</button>
          <span class="uki-body-sm" aria-live="polite">Guardados: {{ guardados() }}</span>
        </demo-ejemplo>
        <h3 class="doc-subtitulo">Como enlace</h3>
        <p class="doc-descripcion">Sobre un &lt;a&gt; navega con routerLink. Deshabilitado no navega ni recibe foco con Tab.</p>
        <demo-ejemplo titulo="Enlaces" nombre="enlaces" [html]="codigo.enlaces">
          <a ukiButton variant="ghost" routerLink="/colores">Ver colores</a>
          <a ukiButton variant="ghost" routerLink="/colores" disabled>Enlace deshabilitado</a>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-grupo">
        <header class="doc-encabezado">
          <h2 id="t-grupo" class="doc-titulo">Grupo de botones</h2>
          <p class="doc-descripcion">Cómo se colocan varios botones juntos. El orden y la alineación son iguales en todo el producto.</p>
        </header>
        <demo-ejemplo titulo="Grupo de botones" nombre="grupo" [html]="codigo.grupo">
          <div ukiButtonGroup class="grupo-ancho" data-prueba="grupo">
            <button ukiButton variant="ghost" type="button">Cancelar</button>
            <button ukiButton variant="secondary" type="button">Guardar borrador</button>
            <button ukiButton type="button">Continuar</button>
          </div>
        </demo-ejemplo>
        <div class="grupo">
          <article class="doc-tarjeta">
            <h3>Horizontal · escritorio</h3>
            <p>Alineado a la derecha, a 16 px (spacing-16). Orden Ghost → Secondary → Primary: el Primary va al final, más cerca del cierre de la lectura.</p>
          </article>
          <article class="doc-tarjeta">
            <div class="doc-visual doc-visual--movil">
              <iframe src="/muestra/grupo-botones" title="Grupo de botones a 375 px" width="375" height="232"></iframe>
            </div>
            <h3>Apilado · móvil</h3>
            <p>Por debajo de 768 px los botones ocupan todo el ancho y se apilan a 12 px (spacing-12). El Primary queda arriba.</p>
          </article>
        </div>
      </section>
    </div>
  `,
  styles: `
    .grupo {
      display: grid;
      grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
      gap: var(--spacing-16);
    }
    @media (max-width: 1023.98px) {
      .grupo {
        grid-template-columns: minmax(0, 1fr);
      }
    }
    .grupo-ancho {
      flex: 1;
    }
    .doc-visual--movil {
      justify-content: center;
      padding: var(--spacing-12);
      background: var(--neutral-200);
    }
    iframe {
      max-width: 100%;
      border: 1px solid var(--border-low-contrast);
      border-radius: var(--radius-16);
      background: var(--background-page);
    }
  `,
})
export default class Botones {
  protected readonly resumen: { variante: UkiButtonVariant; titulo: string; descripcion: string }[] = [
    { variante: 'primary', titulo: 'Primary', descripcion: 'La acción más importante de la pantalla o del paso: enviar, continuar, pagar. Solo una por sección.' },
    { variante: 'secondary', titulo: 'Secondary', descripcion: 'Una alternativa con menos peso, junto al Primary: cancelar, regresar, guardar borrador.' },
    { variante: 'ghost', titulo: 'Ghost', descripcion: 'Acciones de baja prioridad dentro del contenido: aviso de privacidad, ver más, editar. No tiene Loading.' },
    { variante: 'danger', titulo: 'Danger', descripcion: 'Acciones destructivas o irreversibles: eliminar, desactivar. Un verbo claro, una por vista, y confirmación en un modal.' },
  ];
  protected readonly filas = (['primary', 'secondary', 'ghost', 'danger'] as UkiButtonVariant[]).flatMap((variante) =>
    (['default', 'large'] as UkiButtonSize[]).map((tamano) => ({ variante, tamano, clave: `${variante}-${tamano}` })),
  );
  protected readonly estados = ESTADOS;
  protected readonly partes = PARTES;
  protected readonly todoDeshabilitado = signal(false);
  protected readonly todoCargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly guardados = signal(0);
  protected readonly codigo = {
    importar: `import { Component } from '@angular/core';
import { UkiButton } from '@banobras/uki';

@Component({
  selector: 'app-acciones',
  imports: [UkiButton],
  templateUrl: './variantes.html',
})
export class Acciones {}`,
    variantes: `<button ukiButton variant="ghost" type="button">Ver más</button>
<button ukiButton variant="secondary" type="button">Cancelar</button>
<button ukiButton type="button">Continuar</button>
<button ukiButton variant="danger" type="button">Eliminar</button>`,
    estados: `<button ukiButton size="large" type="button">Continuar</button>
<button ukiButton type="button" disabled>No disponible</button>
<button ukiButton type="button" loading>Guardar</button>`,
    iconos: `<button ukiButton type="button">
  <svg ukiButtonLeading viewBox="0 0 24 24" aria-hidden="true">…</svg>
  Agregar
</button>
<button ukiButton variant="secondary" type="button">
  Siguiente
  <svg ukiButtonTrailing viewBox="0 0 24 24" aria-hidden="true">…</svg>
</button>`,
    loadingHtml: `<button ukiButton type="button" [loading]="guardando()" (click)="guardar()">
  Guardar
</button>`,
    loadingTs: `import { Component, inject, signal } from '@angular/core';
import { UkiButton } from '@banobras/uki';
import { finalize } from 'rxjs';
import { ExpedienteService } from './expediente.service';

@Component({
  selector: 'app-guardar',
  imports: [UkiButton],
  templateUrl: './guardar.html',
})
export class Guardar {
  private readonly expedientes = inject(ExpedienteService);
  protected readonly guardando = signal(false);

  protected guardar(): void {
    this.guardando.set(true);
    this.expedientes
      .guardar()
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe();
  }
}`,
    enlaces: `<a ukiButton variant="ghost" routerLink="/aviso-de-privacidad">Aviso de privacidad</a>
<a ukiButton variant="ghost" routerLink="/historial" [disabled]="!tieneHistorial()">Historial</a>`,
    grupo: `<div ukiButtonGroup>
  <button ukiButton variant="ghost" type="button">Cancelar</button>
  <button ukiButton variant="secondary" type="button">Guardar borrador</button>
  <button ukiButton type="submit">Continuar</button>
</div>`,
  };

  protected guardar(): void {
    this.guardando.set(true);
    setTimeout(() => {
      this.guardando.set(false);
      this.guardados.update((n) => n + 1);
    }, 1500);
  }
}
