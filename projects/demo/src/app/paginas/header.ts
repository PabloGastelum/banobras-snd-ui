import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UkiAvatar, UkiHeader, UkiToastService, UkiUserMenu, UkiUserMenuItem } from '@banobras/uki';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';
import { DemoIcono } from '../doc/iconos';
import { DocToken } from '../doc/token';

const PARTES: Parte[] = [
  { selector: '.uki-header', nombre: 'Contenedor', detalle: '60 px · header/background · relleno spacing-24 (escritorio) o spacing-8 (teléfono) · contenido a la derecha', lado: 'arriba', alinear: 'inicio' },
  { selector: '.uki-user-menu__boton', nombre: 'Botón de usuario', detalle: 'Avatar sm + chevron · 40 px · radius-8 · sidebar/item-hover con Hover y abierto · chevron hacia arriba abierto', lado: 'abajo' },
];

const DISPOSITIVOS = [
  { dispositivo: 'Desktop', cuando: 'Tableta y escritorio', corte: '768 px o más', medida: '1280 × 60 (ancho completo)', espacio: 'Relleno spacing-24 · espacio spacing-16' },
  { dispositivo: 'Mobile', cuando: 'Teléfonos', corte: 'Menos de 768 px', medida: '375 × 60 (ancho completo)', espacio: 'Relleno spacing-8 · espacio spacing-4' },
];

/** Página Header de Figma: barra superior y menú de usuario. */
@Component({
  selector: 'demo-header',
  imports: [UkiHeader, UkiUserMenu, UkiUserMenuItem, UkiAvatar, DemoIcono, DemoEjemplo, DocAnatomia, DocToken],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Header</h1>
          <p class="doc-descripcion">
            La barra superior de los portales transaccionales y los paneles de administración. Va junto a la Sidebar y tiene el
            botón de usuario, que abre un menú para cerrar sesión.
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsalo para</h3>
            <p>La parte de arriba de cada pantalla de administración, junto a la Sidebar. Un Header por página, fijo mientras el contenido se desplaza.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Alineado con la Sidebar</h3>
            <p>Mide 60 px de alto, lo mismo que la barra de marca de la Sidebar, para que las dos barras se lean como un solo marco.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Cerrar sesión fácil</h3>
            <p>El Avatar abre el menú: confirma quién inició sesión y «Cerrar sesión» es la última opción, con un ícono de salida.</p>
          </article>
        </div>
        <demo-ejemplo titulo="Header con menú de usuario" nombre="header" [html]="codigo.basico" [ts]="codigo.ts">
          <header ukiHeader class="ancho" data-prueba="header">
            <uki-user-menu name="Mariana López Hernández" userRole="Administradora" (signOut)="salir()" data-prueba="menu-usuario">
              <a ukiUserMenuItem href="#t-moleculas">Mi perfil</a>
            </uki-user-menu>
          </header>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-moleculas">
        <header class="doc-encabezado">
          <h2 id="t-moleculas" class="doc-titulo">Moléculas</h2>
          <p class="doc-descripcion">
            Tres partes forman el menú de usuario: el botón (el disparador), el menú (el panel) y cada opción («Cerrar sesión»
            por omisión). Sus estados, en vista fija:
          </p>
        </header>
        <div class="doc-visual estados" aria-hidden="true">
          @for (e of estadosBoton; track e) {
            <figure>
              <span class="fondo-header">
                <span class="uki-user-menu__boton" [class]="'forzar-' + e">
                  <uki-avatar name="Mariana López" size="sm" status decorative />
                  <demo-icono class="chevron" [nombre]="e === 'open' ? 'arriba' : 'abajo'" />
                </span>
              </span>
              <figcaption>{{ etiquetas[e] }}</figcaption>
            </figure>
          }
        </div>
        <div class="doc-visual estados" aria-hidden="true">
          <div class="uki-user-menu__panel menu-fijo">
            <div class="uki-user-menu__perfil">
              <uki-avatar name="Mariana López Hernández" size="md" status decorative />
              <div class="uki-user-menu__datos">
                <p class="uki-user-menu__nombre">Mariana López Hernández</p>
                <p class="uki-user-menu__rol">Administradora</p>
              </div>
            </div>
            <hr class="uki-user-menu__separador" />
            <span class="uki-user-menu__opcion"><demo-icono nombre="salir" />Cerrar sesión</span>
            <span class="uki-user-menu__opcion forzar-hover-opcion"><demo-icono nombre="salir" />Hover</span>
            <span class="uki-user-menu__opcion forzar-foco-opcion"><demo-icono nombre="salir" />Focus</span>
          </div>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-organismos">
        <header class="doc-encabezado">
          <h2 id="t-organismos" class="doc-titulo">Organismos</h2>
          <p class="doc-descripcion">
            El Header une el contenedor, el botón y el menú. Abre el menú con clic, Enter, Espacio o ↓; recórrelo con las
            flechas, Inicio y Fin; ciérralo con Esc, Tab o un clic fuera.
          </p>
        </header>
        <demo-ejemplo titulo="Con foto y opciones propias" nombre="header-opciones" [html]="codigo.opciones">
          <header ukiHeader class="ancho">
            <uki-user-menu name="Jorge Ramírez" userRole="Analista de procesos" avatarSrc="avatar-ejemplo.svg" (signOut)="salir()">
              <a ukiUserMenuItem href="#t-organismos">Mi perfil</a>
              <button ukiUserMenuItem type="button">Cambiar de sistema</button>
            </uki-user-menu>
          </header>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">
            Tres partes forman el Header: el contenedor, el botón de usuario y el menú (280 px, background/surface,
            Elevation/overlay, debajo del botón). Cada parte toma su valor de un token, así que el tema verde actualiza todo.
          </p>
        </header>
        <demo-anatomia [partes]="partes" [escala]="1">
          <header ukiHeader class="anatomia">
            <uki-user-menu name="Mariana López" userRole="Administradora" />
          </header>
        </demo-anatomia>
      </section>

      <section class="doc-seccion" aria-labelledby="t-dispositivos">
        <header class="doc-encabezado">
          <h2 id="t-dispositivos" class="doc-titulo">Dispositivos</h2>
          <p class="doc-descripcion">Dos tamaños. El Header siempre llena el ancho de la pantalla junto a la Sidebar.</p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Dispositivos del Header</caption>
            <thead>
              <tr>
                <th scope="col">Dispositivo</th>
                <th scope="col">Corte</th>
                <th scope="col">Tamaño</th>
                <th scope="col">Espaciado</th>
              </tr>
            </thead>
            <tbody>
              @for (d of dispositivos; track d.dispositivo) {
                <tr>
                  <th scope="row">{{ d.dispositivo }}<small>{{ d.cuando }}</small></th>
                  <td>{{ d.corte }}</td>
                  <td>{{ d.medida }}</td>
                  <td>{{ d.espacio }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-tokens">
        <header class="doc-encabezado">
          <h2 id="t-tokens" class="doc-titulo">Tokens por estado</h2>
          <p class="doc-descripcion">
            Sobre el Header oscuro, el foco usa button/focus-ring (5.1:1). En las opciones, sobre blanco, usa border/brand
            porque button/focus-ring no llega a 3:1.
          </p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Tokens del Header y del menú de usuario</caption>
            <thead>
              <tr>
                <th scope="col">Parte · estado</th>
                <th scope="col">Fondo</th>
                <th scope="col">Texto o borde</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">Barra</th><td><demo-token nombre="header/background" /></td><td>—</td></tr>
              <tr><th scope="row">Botón · Hover y abierto</th><td><demo-token nombre="sidebar/item-hover" /></td><td>—</td></tr>
              <tr><th scope="row">Botón · Focus</th><td>—</td><td><demo-token nombre="button/focus-ring" nota="2 px" /></td></tr>
              <tr><th scope="row">Menú</th><td><demo-token nombre="background/surface" /></td><td><demo-token nombre="border/low-contrast" nota="1 px · radius-8 · Elevation/overlay" /></td></tr>
              <tr><th scope="row">Perfil</th><td>—</td><td><demo-token nombre="text/primary" nota="nombre" /><demo-token nombre="text/secondary" nota="rol" /></td></tr>
              <tr><th scope="row">Opción · Hover</th><td><demo-token nombre="background/page" /></td><td><demo-token nombre="text/primary" /></td></tr>
              <tr><th scope="row">Opción · Focus</th><td>—</td><td><demo-token nombre="border/brand" nota="2 px" /></td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: `
    .ancho {
      flex: 1 1 100%;
    }
    .anatomia {
      width: 480px;
    }
    .estados {
      gap: var(--spacing-24);
    }
    figure {
      display: grid;
      justify-items: center;
      gap: var(--spacing-8);
      margin: 0;
    }
    figcaption {
      color: var(--text-secondary);
      font-size: var(--font-size-caption);
    }
    .fondo-header {
      display: inline-flex;
      padding: var(--spacing-12);
      border-radius: var(--radius-8);
      background: var(--header-background);
    }
    .forzar-hover,
    .forzar-open {
      background: var(--sidebar-item-hover);
    }
    .forzar-focus {
      outline: 2px solid var(--button-focus-ring);
    }
    .menu-fijo {
      animation: none;
    }
    .chevron {
      width: 16px;
      height: 16px;
    }
    .forzar-hover-opcion {
      background: var(--background-page);
    }
    .forzar-foco-opcion {
      outline: 2px solid var(--border-brand);
      outline-offset: -2px;
    }
  `,
})
export default class HeaderPagina {
  private readonly avisos = inject(UkiToastService);
  protected readonly partes = PARTES;
  protected readonly dispositivos = DISPOSITIVOS;
  protected readonly estadosBoton = ['default', 'hover', 'focus', 'open'] as const;
  protected readonly etiquetas = { default: 'Default', hover: 'Hover', focus: 'Focus', open: 'Open' };

  protected salir(): void {
    this.avisos.info('Cerrar sesión', 'El sistema decide qué hacer: el componente solo emite signOut.');
  }

  protected readonly codigo = {
    basico: `<header ukiHeader>
  <uki-user-menu name="Mariana López Hernández" userRole="Administradora" (signOut)="salir()">
    <a ukiUserMenuItem routerLink="/perfil">Mi perfil</a>
  </uki-user-menu>
</header>`,
    ts: `import { UkiHeader, UkiUserMenu, UkiUserMenuItem } from '@banobras/uki';

@Component({
  imports: [UkiHeader, UkiUserMenu, UkiUserMenuItem],
})
export class Marco {
  private readonly sesion = inject(SesionService);

  // El componente no cierra la sesión: solo avisa.
  protected salir(): void {
    this.sesion.cerrar();
  }
}`,
    opciones: `<header ukiHeader>
  <uki-user-menu name="Jorge Ramírez" userRole="Analista de procesos" [avatarSrc]="foto" (signOut)="salir()">
    <a ukiUserMenuItem routerLink="/perfil">Mi perfil</a>
    <button ukiUserMenuItem type="button" (click)="cambiar()">Cambiar de sistema</button>
  </uki-user-menu>
</header>`,
  };
}
