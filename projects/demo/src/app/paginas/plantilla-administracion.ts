import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoEjemplo } from '../doc/ejemplo';
import { DemoIcono } from '../doc/iconos';

/** Plantilla documentada «Pantalla de administración» (App shell de Figma, en progreso). No es un componente exportado. */
@Component({
  selector: 'demo-pagina-administracion',
  imports: [DemoEjemplo, DemoIcono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Pantalla de administración</h1>
          <p class="doc-descripcion">
            El marco de las pantallas de los portales y paneles: Sidebar a la izquierda; arriba el Header; en el contenido, la
            ruta, el título y la descripción de la página; y abajo el Footer. En Figma, App shell y Page Header están en
            progreso, por eso esta es una plantilla y no un componente.
          </p>
        </header>
        <p class="abrir">
          <a href="/muestra/administracion" target="_blank" rel="noopener">
            Abrir a pantalla completa <demo-icono nombre="externo" /><span class="doc-oculto">(se abre en otra pestaña)</span>
          </a>
        </p>
        <div class="muestras">
          <figure class="muestra muestra--amplia">
            <iframe src="/muestra/administracion" title="Pantalla de administración a 1280 px" width="1280" height="720"></iframe>
            <figcaption>Escritorio, 1280 px (reducido)</figcaption>
          </figure>
          <figure class="muestra">
            <iframe src="/muestra/administracion" title="Pantalla de administración a 375 px" width="375" height="700"></iframe>
            <figcaption>Teléfono, 375 px: barra inferior y «Más»</figcaption>
          </figure>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-regiones">
        <header class="doc-encabezado">
          <h2 id="t-regiones" class="doc-titulo">Regiones</h2>
          <p class="doc-descripcion">
            Una de cada una, para que los lectores de pantalla salten entre ellas: navegación (Sidebar, «Menú principal»),
            encabezado (Header), contenido (main) y pie (Footer). La ruta de navegación va dentro del contenido.
          </p>
        </header>
      </section>

      <section class="doc-seccion" aria-labelledby="t-codigo">
        <header class="doc-encabezado">
          <h2 id="t-codigo" class="doc-titulo">Código</h2>
          <p class="doc-descripcion">
            La Sidebar llena el alto de su columna y queda fija con position: sticky; el Header también. En teléfono, la
            retícula pasa a una columna y se reservan 76 px abajo para la barra inferior.
          </p>
        </header>
        <demo-ejemplo titulo="administracion" [soloCodigo]="true" [archivos]="archivos" />
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
      background: var(--background-page);
    }
    .muestra--amplia {
      width: 640px;
      height: 360px;
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
export default class PaginaAdministracion {
  protected readonly archivos = [
    {
      nombre: 'marco.html',
      lenguaje: 'html' as const,
      codigo: `<div class="app">
  <uki-sidebar class="app__lateral" [items]="menu" [user]="persona"
               [topbarLink]="{ label: 'Ir a Llave MX', href: llaveMx }" [(collapsed)]="contraida" />
  <div class="app__contenido">
    <header ukiHeader class="app__header">
      <uki-user-menu [name]="persona.name" [userRole]="persona.role" (signOut)="salir()" />
    </header>
    <main id="contenido" class="app__principal">
      <uki-breadcrumbs [items]="ruta()" />
      <h1 class="uki-heading-1">{{ titulo() }}</h1>
      <p class="uki-body-md">{{ descripcion() }}</p>
      <router-outlet />
    </main>
    <footer ukiFooter></footer>
  </div>
</div>`,
    },
    {
      nombre: 'marco.css',
      lenguaje: 'css' as const,
      codigo: `.app {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  min-height: 100dvh;
  background: var(--background-page);
}
/* La Sidebar queda fija al alto de la ventana: solo su lista hace scroll. */
.app__lateral {
  position: sticky;
  top: 0;
  z-index: 2;
  height: 100dvh;
}
.app__contenido {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.app__header {
  position: sticky;
  top: 0;
  z-index: 1;
}
.app__principal {
  flex: 1;
  /* + 24 px del botón de contraer, pegado al borde derecho de la Sidebar. */
  padding: var(--spacing-32) var(--admin-margin) var(--spacing-48) calc(var(--admin-margin) + 24px);
}
@media (max-width: 767.98px) {
  .app {
    grid-template-columns: minmax(0, 1fr);
  }
  .app__lateral {
    position: static;
    height: auto;
  }
  /* La barra inferior es fija: reserva su alto. */
  .app__contenido {
    padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px));
  }
  .app__principal {
    padding-inline: var(--admin-margin);
  }
}`,
    },
  ];
}
