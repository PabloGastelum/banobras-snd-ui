import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { Fragmento, Lenguaje, resaltar } from './codigo';
import { DemoIcono } from './iconos';
import { Portapapeles } from './portapapeles';

export interface Archivo {
  nombre: string;
  lenguaje: Lenguaje;
  codigo: string;
}

let contador = 0;

/**
 * Ejemplo vivo de la documentación: el componente real arriba y, debajo, «Ver código» y «Copiar». El código se muestra
 * con resaltado y, si hay varios archivos (plantilla y clase), con pestañas.
 *
 * ```html
 * <demo-ejemplo titulo="Variantes" [html]="codigo">…componentes…</demo-ejemplo>
 * ```
 */
@Component({
  selector: 'demo-ejemplo',
  imports: [DemoIcono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ejemplo' },
  template: `
    @if (!soloCodigo()) {
      <div class="ejemplo__vista" [class.ejemplo__vista--pagina]="fondo() === 'pagina'">
        <ng-content />
      </div>
    }
    <div class="ejemplo__barra" [class.ejemplo__barra--sola]="soloCodigo()">
      @if (titulo()) {
        <p class="ejemplo__titulo">{{ titulo() }}</p>
      }
      <div class="ejemplo__acciones">
        @if (!soloCodigo()) {
          <button
            type="button"
            class="ejemplo__accion"
            [attr.aria-expanded]="abierto()"
            [attr.aria-controls]="id + '-codigo'"
            (click)="abierto.set(!abierto())"
          >
            <demo-icono nombre="codigo" />
            {{ abierto() ? 'Ocultar código' : 'Ver código' }}
          </button>
        }
        <button
          type="button"
          class="ejemplo__accion"
          [class.ejemplo__accion--hecho]="estadoCopia() === 'copiado'"
          [attr.aria-label]="'Copiar ' + archivoActivo().nombre"
          (click)="copiar()"
        >
          <demo-icono [nombre]="estadoCopia() === 'copiado' ? 'listo' : estadoCopia() === 'error' ? 'error' : 'copiar'" />
          <span aria-hidden="true">{{ estadoCopia() === 'copiado' ? 'Copiado' : estadoCopia() === 'error' ? 'Sin acceso' : 'Copiar' }}</span>
        </button>
      </div>
    </div>
    <div class="ejemplo__codigo" [id]="id + '-codigo'" [hidden]="!abierto()">
      @if (lista().length > 1) {
        <div class="ejemplo__archivos" role="tablist" aria-label="Archivos del ejemplo">
          @for (archivo of lista(); track archivo.nombre; let i = $index) {
            <button
              type="button"
              role="tab"
              class="ejemplo__archivo"
              [id]="id + '-tab-' + i"
              [attr.aria-selected]="i === activo()"
              [attr.aria-controls]="id + '-panel'"
              [attr.tabindex]="i === activo() ? 0 : -1"
              (click)="activo.set(i)"
              (keydown.arrowRight)="mover(1, $event)"
              (keydown.arrowLeft)="mover(-1, $event)"
            >
              {{ archivo.nombre }}
            </button>
          }
        </div>
      }
      <pre
        class="ejemplo__pre"
        tabindex="0"
        [id]="id + '-panel'"
        [attr.role]="lista().length > 1 ? 'tabpanel' : null"
        [attr.aria-labelledby]="lista().length > 1 ? id + '-tab-' + activo() : null"
        [attr.aria-label]="lista().length > 1 ? null : 'Código: ' + archivoActivo().nombre"
      ><code>@for (f of fragmentos(); track $index) {<span [class]="'tk tk--' + f.tipo">{{ f.valor }}</span>}</code></pre>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      min-width: 0;
      overflow: hidden;
      border: 1px solid var(--border-low-contrast);
      border-radius: var(--radius-16);
      background: var(--background-surface);
    }
    .ejemplo__vista {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-16);
      min-width: 0;
      padding: var(--spacing-32);
    }
    .ejemplo__vista--pagina {
      background: var(--background-page);
    }
    .ejemplo__barra {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-8);
      padding: var(--spacing-8) var(--spacing-8) var(--spacing-8) var(--spacing-16);
      border-top: 1px solid var(--border-low-contrast);
      background: var(--neutral-200);
    }
    .ejemplo__barra--sola {
      border-top: 0;
    }
    .ejemplo__titulo {
      margin: 0;
      font-size: var(--font-size-body-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-secondary);
    }
    .ejemplo__acciones {
      display: flex;
      gap: var(--spacing-4);
      margin-left: auto;
    }
    .ejemplo__accion {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-8);
      min-height: 40px;
      padding: 0 var(--spacing-12);
      border: 1px solid transparent;
      border-radius: var(--radius-8);
      background: transparent;
      color: var(--text-primary);
      font: inherit;
      font-size: var(--font-size-body-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition:
        background-color 160ms cubic-bezier(0.16, 1, 0.3, 1),
        color 160ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    .ejemplo__accion:hover {
      background: var(--button-tint);
      color: var(--text-brand);
    }
    .ejemplo__accion:focus-visible {
      outline: 2px solid var(--border-brand);
      outline-offset: 1px;
    }
    .ejemplo__accion[aria-expanded='true'] {
      border-color: var(--border-low-contrast);
      background: var(--background-surface);
      color: var(--text-brand);
    }
    .ejemplo__accion--hecho,
    .ejemplo__accion--hecho:hover {
      background: var(--feedback-success-background);
      color: var(--feedback-success-foreground);
    }
    @media (pointer: coarse) {
      .ejemplo__accion {
        min-height: 44px;
      }
    }
    .ejemplo__codigo {
      border-top: 1px solid var(--neutral-700);
      background: var(--neutral-800);
    }
    .ejemplo__archivos {
      display: flex;
      gap: var(--spacing-4);
      padding: var(--spacing-8) var(--spacing-12) 0;
      border-bottom: 1px solid var(--neutral-700);
    }
    .ejemplo__archivo {
      padding: var(--spacing-8) var(--spacing-12);
      border: 0;
      border-bottom: 2px solid transparent;
      background: transparent;
      color: var(--neutral-500);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: var(--font-size-caption);
      cursor: pointer;
    }
    .ejemplo__archivo[aria-selected='true'] {
      border-bottom-color: var(--button-focus-ring);
      color: var(--neutral-100);
    }
    .ejemplo__archivo:focus-visible,
    .ejemplo__pre:focus-visible {
      outline: 2px solid var(--button-focus-ring);
      outline-offset: -2px;
    }
    .ejemplo__pre {
      max-height: 420px;
      margin: 0;
      overflow: auto;
      padding: var(--spacing-16) var(--spacing-20);
      color: var(--neutral-300);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.8125rem;
      line-height: 1.7;
      tab-size: 2;
      scrollbar-color: var(--neutral-600) transparent;
    }
    .ejemplo__pre ::selection {
      background: var(--sidebar-topbar);
      color: var(--neutral-100);
    }
    .tk--etiqueta {
      color: var(--button-focus-ring);
    }
    .tk--atributo {
      color: var(--gold-300);
    }
    .tk--cadena {
      color: var(--neutral-100);
    }
    .tk--clave {
      color: var(--button-tint-pressed);
      font-style: italic;
    }
    .tk--expresion {
      color: var(--gold-200);
    }
    .tk--comentario {
      color: var(--neutral-500);
      font-style: italic;
    }
  `,
})
export class DemoEjemplo {
  readonly html = input<string>();
  readonly ts = input<string>();
  readonly css = input<string>();
  readonly archivos = input<Archivo[]>();
  readonly titulo = input<string>();
  readonly fondo = input<'superficie' | 'pagina'>('superficie');
  /** Sin vista previa (comandos, configuración): el código se muestra abierto desde el inicio. */
  readonly soloCodigo = input(false);
  /** Nombre base de los archivos en las pestañas (`ejemplo.html`, `ejemplo.ts`). */
  readonly nombre = input('ejemplo');

  protected readonly id = `ejemplo-${++contador}`;
  /** Los bloques de solo código no tienen vista que mostrar: arrancan abiertos. */
  protected readonly abierto = linkedSignal(() => this.soloCodigo());
  protected readonly activo = signal(0);
  private readonly portapapeles = inject(Portapapeles);

  protected readonly lista = computed<Archivo[]>(() => {
    if (this.archivos()?.length) return this.archivos()!;
    const lista: Archivo[] = [];
    if (this.html()) lista.push({ nombre: `${this.nombre()}.html`, lenguaje: 'html', codigo: this.html()! });
    if (this.ts()) lista.push({ nombre: `${this.nombre()}.ts`, lenguaje: 'ts', codigo: this.ts()! });
    if (this.css()) lista.push({ nombre: `${this.nombre()}.css`, lenguaje: 'css', codigo: this.css()! });
    return lista;
  });
  protected readonly archivoActivo = computed(() => this.lista()[Math.min(this.activo(), this.lista().length - 1)]);
  protected readonly fragmentos = computed<Fragmento[]>(() => resaltar(this.archivoActivo().codigo, this.archivoActivo().lenguaje));
  protected readonly estadoCopia = computed(() => this.portapapeles.estado(`${this.id}-${this.activo()}`));

  protected copiar(): void {
    void this.portapapeles.copiar(this.archivoActivo().codigo, `${this.id}-${this.activo()}`, this.archivoActivo().nombre);
  }

  protected mover(paso: number, evento: Event): void {
    const total = this.lista().length;
    this.activo.set((this.activo() + paso + total) % total);
    const destino = (evento.target as HTMLElement).parentElement?.children[this.activo()] as HTMLElement | undefined;
    destino?.focus();
  }
}
