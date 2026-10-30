import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoEjemplo } from '../doc/ejemplo';
import { DemoIcono } from '../doc/iconos';

/** Plantilla documentada «Pantalla de acceso»: Hero + Auth. No es un componente exportado. */
@Component({
  selector: 'demo-pagina-acceso',
  imports: [DemoEjemplo, DemoIcono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Pantalla de acceso</h1>
          <p class="doc-descripcion">
            La pantalla de inicio de sesión completa: Hero a la izquierda y Auth a la derecha (644 + 636 = 1280 px). Debajo de
            1280 px el Hero se oculta y queda solo Auth. Es una plantilla: copia el código y conecta el formulario con el
            servicio de sesión de tu sistema.
          </p>
        </header>
        <p class="abrir">
          <a href="/muestra/acceso" target="_blank" rel="noopener">
            Abrir a pantalla completa <demo-icono nombre="externo" /><span class="doc-oculto">(se abre en otra pestaña)</span>
          </a>
        </p>
        <div class="muestras">
          <figure class="muestra muestra--amplia">
            <iframe src="/muestra/acceso" title="Pantalla de acceso a 1280 px" width="1280" height="832"></iframe>
            <figcaption>Escritorio, 1280 px (reducido)</figcaption>
          </figure>
          <figure class="muestra">
            <iframe src="/muestra/acceso" title="Pantalla de acceso a 375 px" width="375" height="700"></iframe>
            <figcaption>Teléfono, 375 px</figcaption>
          </figure>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-codigo">
        <header class="doc-encabezado">
          <h2 id="t-codigo" class="doc-titulo">Código</h2>
          <p class="doc-descripcion">
            La retícula centra las dos columnas. El Hero se oculta solo; el contenedor del Auth pasa a ocupar todo el ancho.
          </p>
        </header>
        <demo-ejemplo titulo="acceso" [soloCodigo]="true" [archivos]="archivos" />
      </section>
    </div>
  `,
  styles: `
    .abrir {
      margin: 0;
    }
    .abrir a {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-4);
      color: var(--text-brand);
    }
    .abrir a:focus-visible {
      outline: 2px solid var(--border-brand);
      outline-offset: 2px;
    }
    .muestras {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: var(--spacing-24);
    }
    .muestra {
      display: grid;
      gap: var(--spacing-8);
      max-width: 100%;
      margin: 0;
    }
    .muestra iframe {
      max-width: 100%;
      border: 1px solid var(--border-low-contrast);
      border-radius: var(--radius-12);
      background: var(--background-surface);
    }
    .muestra--amplia {
      width: 640px;
      height: 416px;
      overflow: hidden;
    }
    .muestra--amplia iframe {
      max-width: none;
      transform: scale(0.5);
      transform-origin: 0 0;
    }
    figcaption {
      color: var(--text-secondary);
      font-size: var(--font-size-caption);
    }
    @media (max-width: 767.98px) {
      .muestra--amplia {
        display: none;
      }
    }
  `,
})
export default class PaginaAcceso {
  protected readonly archivos = [
    {
      nombre: 'acceso.html',
      lenguaje: 'html' as const,
      codigo: `<div class="acceso">
  <uki-hero class="acceso__hero" illustrationSrc="/assets/la-patria.webp" />
  <main class="acceso__principal">
    <uki-auth heading="Inicia sesión en tu cuenta"
              systemName="Sistema de Administración y Actualización del Inventario de Procesos de BANOBRAS">
      @if (error()) {
        <uki-alert type="warning">El usuario o la contraseña no coinciden. Revisa los datos e intenta de nuevo.</uki-alert>
      }
      <form [formGroup]="acceso" (ngSubmit)="entrar()" novalidate>
        <uki-field label="Usuario" required error="Escribe tu usuario.">
          <input ukiInput autocomplete="username" formControlName="usuario" />
        </uki-field>
        <uki-field label="Contraseña" required error="Escribe tu contraseña.">
          <input ukiInput type="password" autocomplete="current-password" formControlName="contrasena" />
        </uki-field>
        <button ukiButton type="submit" [loading]="entrando()">Iniciar sesión</button>
      </form>
    </uki-auth>
  </main>
</div>`,
    },
    {
      nombre: 'acceso.css',
      lenguaje: 'css' as const,
      codigo: `.acceso {
  display: flex;
  justify-content: center;
  min-height: 100dvh;
  background: var(--background-surface);
}
.acceso__hero {
  flex: none;
  min-height: 100dvh;
}
.acceso__principal {
  display: flex;
  flex: 0 1 636px;
  justify-content: center;
}
/* Debajo de 1280 px el Hero se oculta solo. */
@media (max-width: 1279.98px) {
  .acceso__principal {
    flex-basis: 100%;
  }
}`,
    },
  ];
}
