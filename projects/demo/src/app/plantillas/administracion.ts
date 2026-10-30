import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  UkiBadge,
  UkiBreadcrumbs,
  UkiFooter,
  UkiHeader,
  UkiSidebar,
  UkiSidebarItem,
  UkiSidebarUser,
  UkiToastService,
  UkiUserMenu,
  UkiUserMenuItem,
} from '@banobras/uki';

/** Ruta de la muestra: el destino «Solicitudes» apunta aquí para verse activo; los demás son anclas. */
export const RUTA_ADMINISTRACION = '/muestra/administracion';

export const MENU_ADMINISTRACION: UkiSidebarItem[] = [
  { label: 'Inicio', icon: 'house', href: '#contenido', bottomBar: true },
  { label: 'Solicitudes', icon: 'file-earmark-text', link: RUTA_ADMINISTRACION, bottomBar: true },
  { label: 'Documentos', icon: 'folder', href: '#contenido', bottomBar: true },
  {
    label: 'Administración',
    icon: 'gear',
    section: 'Administración',
    children: [
      { label: 'Usuarios', icon: 'people', href: '#contenido' },
      {
        label: 'Catálogos',
        icon: 'journal-text',
        children: [
          { label: 'Macroprocesos', href: '#contenido' },
          { label: 'Procesos', href: '#contenido' },
        ],
      },
      { label: 'Bitácora', icon: 'journal-text', href: '#contenido' },
    ],
  },
];

export const PERSONA_ADMINISTRACION: UkiSidebarUser = { name: 'Mariana López Hernández', role: 'Administradora' };

/**
 * Plantilla «Pantalla de administración» (App shell de Figma, en progreso): Sidebar | Header, contenido con ruta,
 * título y descripción (Page Header, en progreso), y Footer. Sin barra de la documentación, para verla a pantalla
 * completa o en un iframe de 375 px.
 */
@Component({
  selector: 'demo-plantilla-administracion',
  imports: [UkiSidebar, UkiHeader, UkiUserMenu, UkiUserMenuItem, UkiBreadcrumbs, UkiFooter, UkiBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app">
      <uki-sidebar
        class="app__lateral"
        [items]="menu"
        [user]="persona"
        [topbarLink]="{ label: 'Ir a Llave MX', href: '#contenido' }"
        [(collapsed)]="contraida"
      />
      <div class="app__contenido">
        <header ukiHeader class="app__header">
          <uki-user-menu [name]="persona.name" [userRole]="persona.role" (signOut)="salir()">
            <a ukiUserMenuItem href="#contenido">Mi perfil</a>
          </uki-user-menu>
        </header>
        <main id="contenido" class="app__principal" tabindex="-1">
          <div class="app__titulo">
            <uki-breadcrumbs [items]="ruta" />
            <h1 class="uki-heading-1">Solicitudes</h1>
            <p class="uki-body-md app__descripcion">Revisa el estado de las solicitudes de tu área y atiende las que están en revisión.</p>
          </div>
          <ul class="app__tarjetas">
            @for (s of solicitudes; track s.folio) {
              <li class="app__tarjeta">
                <p class="app__folio">{{ s.folio }}</p>
                <p>{{ s.tramite }}</p>
                <uki-badge [type]="s.tipo">{{ s.estado }}</uki-badge>
              </li>
            }
          </ul>
        </main>
        <footer ukiFooter></footer>
      </div>
    </div>
  `,
  styles: `
    .app {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      min-height: 100dvh;
      background: var(--background-page);
    }
    /* La Sidebar llena su columna y queda fija al alto de la ventana: solo su lista hace scroll. */
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
      display: grid;
      flex: 1;
      align-content: start;
      gap: var(--spacing-32);
      padding: var(--spacing-32) var(--admin-margin) var(--spacing-48) calc(var(--admin-margin) + 24px);
    }
    .app__principal:focus {
      outline: none;
    }
    .app__titulo {
      display: grid;
      gap: var(--spacing-20);
      max-width: 960px;
    }
    .app__titulo h1,
    .app__descripcion {
      margin: 0;
    }
    .app__descripcion {
      color: var(--text-secondary);
    }
    .app__tarjetas {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: var(--admin-gutter);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .app__tarjeta {
      display: grid;
      justify-items: start;
      gap: var(--spacing-8);
      padding: var(--spacing-24);
      border: 1px solid var(--border-low-contrast);
      border-radius: var(--radius-8);
      background: var(--background-surface);
    }
    .app__tarjeta p {
      margin: 0;
    }
    .app__folio {
      font-weight: var(--font-weight-semibold);
    }
    /* Teléfono: una columna; la barra inferior es fija y se reservan 76 px abajo. */
    @media (max-width: 767.98px) {
      .app {
        grid-template-columns: minmax(0, 1fr);
      }
      .app__lateral {
        position: static;
        height: auto;
      }
      .app__contenido {
        padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px));
      }
      .app__principal {
        padding-inline: var(--admin-margin);
      }
    }
  `,
})
export default class PlantillaAdministracion {
  private readonly avisos = inject(UkiToastService);
  protected readonly menu = MENU_ADMINISTRACION;
  protected readonly persona = PERSONA_ADMINISTRACION;
  protected readonly contraida = signal<boolean | null>(null);
  protected readonly ruta = [{ label: 'Inicio', href: '#contenido' }, { label: 'Trámites', href: '#contenido' }, { label: 'Solicitudes' }];
  protected readonly solicitudes = [
    { folio: 'SOL-2026-0148', tramite: 'Alta de proceso', estado: 'En revisión', tipo: 'warning' as const },
    { folio: 'SOL-2026-0147', tramite: 'Cambio de responsable', estado: 'Aprobada', tipo: 'success' as const },
    { folio: 'SOL-2026-0146', tramite: 'Baja de subproceso', estado: 'Recibida', tipo: 'info' as const },
  ];

  protected salir(): void {
    this.avisos.info('Cerrar sesión', 'El sistema decide qué hacer: el componente solo emite signOut.');
  }
}
