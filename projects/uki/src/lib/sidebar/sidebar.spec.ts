import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { anchoFalso, polyfillDialogo } from '../pruebas/jsdom';
import { UkiSidebar, UkiSidebarIcon, UkiSidebarItem, UkiSidebarLink, UkiSidebarUser } from './sidebar';

@Component({ template: '' })
class Vacia {}

const MENU: UkiSidebarItem[] = [
  { label: 'Inicio', icon: 'house', link: '/' },
  { label: 'Mis trámites', icon: 'file-earmark-text', link: '/tramites', bottomBar: true },
  { label: 'Documentos', icon: 'folder', link: '/documentos', bottomBar: true, section: 'Mi cuenta' },
  {
    label: 'Administración',
    icon: 'gear',
    section: 'Administración',
    children: [
      { label: 'Usuarios', link: '/admin/usuarios' },
      {
        label: 'Catálogos',
        icon: 'journal-text',
        children: [
          { label: 'Macroprocesos', link: '/admin/catalogos/macroprocesos' },
          { label: 'Procesos', link: '/admin/catalogos/procesos' },
        ],
      },
      { label: 'Bitácora', href: 'https://ejemplo.mx/bitacora' },
    ],
  },
  { label: 'Reportes', icon: 'propio', section: 'Administración', children: [{ label: 'Mensuales', link: '/reportes' }] },
];

@Component({
  imports: [UkiSidebar, UkiSidebarIcon],
  template: `
    <uki-sidebar [items]="items()" [user]="persona()" [topbarLink]="enlaceMarca()" [device]="dispositivo()"
                 [(collapsed)]="contraida">
      <ng-template ukiSidebarIcon="propio"><svg class="icono-propio"></svg></ng-template>
    </uki-sidebar>
    <button type="button" id="fuera">Fuera</button>
  `,
})
class Anfitrion {
  readonly items = signal<UkiSidebarItem[]>(MENU);
  readonly persona = signal<UkiSidebarUser | undefined>({ name: 'Mariana López', role: 'Administradora' });
  readonly enlaceMarca = signal<UkiSidebarLink | undefined>({ label: 'Ir a Llave MX', href: 'https://llave.gob.mx' });
  readonly dispositivo = signal<'auto' | 'desktop' | 'mobile'>('auto');
  contraida: boolean | null = null;
}

async function montar(ancho = 1440, url = '/') {
  const pantalla = anchoFalso(ancho);
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), provideRouter([{ path: '**', component: Vacia }])],
  });
  await TestBed.inject(Router).navigateByUrl(url);
  const fixture = TestBed.createComponent(Anfitrion);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const raiz: HTMLElement = fixture.nativeElement;
  const actualizar = () => fixture.whenStable();
  const nav = () => raiz.querySelector('nav')!;
  const fila = (texto: string) =>
    [...raiz.querySelectorAll<HTMLElement>('a, button')].find((e) => e.textContent!.trim() === texto)!;
  const teclear = async (destino: Element, key: string) => {
    const evento = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    destino.dispatchEvent(evento);
    await actualizar();
    return evento;
  };
  return { fixture, raiz, host: fixture.componentInstance, pantalla, actualizar, nav, fila, teclear };
}

describe('UkiSidebar', () => {
  beforeAll(() => polyfillDialogo());
  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
    document.body.replaceChildren();
    document.documentElement.className = '';
  });

  describe('estructura', () => {
    it('es un nav «Menú principal» con la barra de marca, la persona y la lista', async () => {
      const { nav } = await montar();
      expect(nav().getAttribute('aria-label')).toBe('Menú principal');
      const marca = nav().querySelector<HTMLAnchorElement>('.uki-sidebar__marca')!;
      expect(marca.tagName).toBe('A');
      expect(marca.textContent!.trim()).toContain('Ir a Llave MX');
      expect(marca.hasAttribute('aria-label')).toBe(false);
      expect(marca.getAttribute('href')).toBe('https://llave.gob.mx');
      expect(marca.querySelector('uki-logo-banobras svg')!.getAttribute('aria-hidden')).toBe('true');
      expect(nav().querySelector('.uki-sidebar__nombre')!.textContent).toContain('Mariana López');
      expect(nav().querySelector('.uki-sidebar__rol')!.textContent).toContain('Administradora');
      expect(nav().querySelectorAll('.uki-sidebar__lista > li').length).toBe(5);
    });

    it('sin enlace de marca muestra el logotipo con su nombre', async () => {
      const { nav, host, actualizar } = await montar();
      host.enlaceMarca.set(undefined);
      await actualizar();
      const marca = nav().querySelector('.uki-sidebar__marca')!;
      expect(marca.tagName).toBe('DIV');
      expect(marca.querySelector('svg')!.getAttribute('aria-label')).toBe('Banobras');
    });

    it('los destinos son enlaces del router o externos, con íconos incorporados o propios', async () => {
      const { fila, raiz } = await montar();
      expect(fila('Mis trámites').getAttribute('href')).toBe('/tramites');
      expect(fila('Mis trámites').querySelector('uki-icono')).not.toBeNull();
      expect(raiz.querySelector('.uki-sidebar__lista .icono-propio')).not.toBeNull();
    });

    it('marca la página actual con aria-current="page"; Inicio solo en la raíz exacta', async () => {
      const { fila } = await montar(1440, '/tramites/SOL-2026-0148');
      expect(fila('Mis trámites').getAttribute('aria-current')).toBe('page');
      expect(fila('Mis trámites').classList).toContain('uki-sidebar__fila--activa');
      expect(fila('Inicio').hasAttribute('aria-current')).toBe(false);
    });
  });

  describe('acordeón', () => {
    it('un padre es un botón con aria-expanded y aria-controls que abre sus hijos', async () => {
      const { fila, raiz, actualizar } = await montar();
      const admin = fila('Administración');
      expect(admin.tagName).toBe('BUTTON');
      expect(admin.getAttribute('aria-expanded')).toBe('false');
      expect(fila('Usuarios')).toBeUndefined();
      admin.click();
      await actualizar();
      expect(admin.getAttribute('aria-expanded')).toBe('true');
      const hijos = raiz.querySelector(`#${admin.getAttribute('aria-controls')}`)!;
      expect([...hijos.querySelectorAll(':scope > li > a, :scope > li > button')].map((e) => e.textContent!.trim())).toEqual([
        'Usuarios',
        'Catálogos',
        'Bitácora',
      ]);
      expect(fila('Bitácora').getAttribute('href')).toBe('https://ejemplo.mx/bitacora');
    });

    it('solo una rama abierta por nivel', async () => {
      const { fila, actualizar } = await montar();
      fila('Administración').click();
      await actualizar();
      fila('Catálogos').click();
      await actualizar();
      expect(fila('Macroprocesos')).toBeDefined();
      fila('Reportes').click();
      await actualizar();
      expect(fila('Administración').getAttribute('aria-expanded')).toBe('false');
      expect(fila('Usuarios')).toBeUndefined();
      expect(fila('Mensuales')).toBeDefined();
    });

    it('abre sola la rama de la página actual, hasta el tercer nivel', async () => {
      const { fila } = await montar(1440, '/admin/catalogos/procesos');
      expect(fila('Administración').getAttribute('aria-expanded')).toBe('true');
      expect(fila('Catálogos').getAttribute('aria-expanded')).toBe('true');
      expect(fila('Procesos').getAttribute('aria-current')).toBe('page');
      expect(fila('Procesos').classList).toContain('uki-sidebar__fila--nivel-3');
      expect(fila('Usuarios').classList).toContain('uki-sidebar__fila--nivel-2');
    });

    it('ignora un cuarto nivel y avisa en desarrollo', async () => {
      const aviso = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { host, actualizar, fila } = await montar();
      host.items.set([
        { label: 'A', icon: 'house', children: [{ label: 'B', children: [{ label: 'C', children: [{ label: 'D', link: '/d' }] }] }] },
      ]);
      await actualizar();
      fila('A').click();
      await actualizar();
      fila('B').click();
      await actualizar();
      expect(fila('C').tagName).toBe('A');
      expect(fila('D')).toBeUndefined();
      expect(aviso.mock.calls.some((c) => String(c[0]).includes('tres niveles'))).toBe(true);
      aviso.mockRestore();
    });
  });

  describe('forma según el ancho', () => {
    it('expandida desde 1280 px, colapsada de 768 a 1279 y en teléfono debajo de 768', async () => {
      const { nav, raiz, pantalla, actualizar } = await montar(1440);
      expect(nav().classList).not.toContain('uki-sidebar--colapsada');
      pantalla.cambiar(1024);
      await actualizar();
      expect(nav().classList).toContain('uki-sidebar--colapsada');
      pantalla.cambiar(375);
      await actualizar();
      expect(raiz.querySelector('.uki-sidebar-movil')).not.toBeNull();
      expect(raiz.querySelector('.uki-sidebar__lista')).toBeNull();
    });

    it('el botón de contraer cambia [(collapsed)] y su estado; la elección se borra al cambiar de rango', async () => {
      const { raiz, nav, host, pantalla, actualizar } = await montar(1440);
      const toggle = raiz.querySelector<HTMLButtonElement>('.uki-sidebar__toggle')!;
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(toggle.getAttribute('aria-label')).toBe('Contraer menú');
      expect(toggle.getAttribute('aria-controls')).toBe(raiz.querySelector('.uki-sidebar__lista')!.id);
      toggle.click();
      await actualizar();
      expect(host.contraida).toBe(true);
      expect(nav().classList).toContain('uki-sidebar--colapsada');
      expect(toggle.getAttribute('aria-label')).toBe('Expandir menú');
      pantalla.cambiar(1024);
      await actualizar();
      expect(host.contraida).toBeNull();
      raiz.querySelector<HTMLButtonElement>('.uki-sidebar__toggle')!.click();
      await actualizar();
      expect(nav().classList).not.toContain('uki-sidebar--colapsada');
    });

    it('device fija la forma para la documentación o un sistema que no la quiera automática', async () => {
      const { raiz, nav, host, actualizar } = await montar(1024);
      host.dispositivo.set('desktop');
      await actualizar();
      expect(nav().classList).not.toContain('uki-sidebar--colapsada');
      host.dispositivo.set('mobile');
      await actualizar();
      expect(raiz.querySelector('.uki-sidebar-movil')).not.toBeNull();
    });
  });

  describe('colapsada', () => {
    it('solo muestra íconos: el nombre queda para el lector y la persona es su Avatar', async () => {
      const { fila, nav } = await montar(1024);
      expect(fila('Mis trámites').querySelector('.uki-sidebar__oculto')).not.toBeNull();
      expect(nav().querySelector('.uki-sidebar__nombre')).toBeNull();
      expect(nav().querySelector('.uki-sidebar__persona uki-avatar')!.getAttribute('aria-label')).toContain('Mariana López');
      expect(nav().querySelector('.uki-sidebar__marca uki-logo-banobras-icon')).not.toBeNull();
    });

    it('un padre abre el panel flotante con clic; Esc lo cierra y devuelve el foco', async () => {
      const { fila, raiz, teclear, actualizar } = await montar(1024, '/admin/usuarios');
      const admin = fila('Administración');
      expect(admin.classList).toContain('uki-sidebar__fila--activa');
      admin.click();
      await actualizar();
      expect(admin.getAttribute('aria-expanded')).toBe('true');
      const panel = raiz.querySelector(`#${admin.getAttribute('aria-controls')}`)!;
      expect(panel.querySelector('.uki-sidebar__flotante-titulo')!.textContent).toContain('Administración');
      expect(panel.querySelector('.uki-sidebar__grupo')!.textContent).toContain('Catálogos');
      expect(panel.classList).toContain('uki-sidebar__flotante--tres');
      expect(fila('Usuarios').getAttribute('aria-current')).toBe('page');
      fila('Usuarios').focus();
      await teclear(fila('Usuarios'), 'Escape');
      expect(admin.getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(admin);
    });

    it('Enter, Espacio o → abren el panel con el foco en el primer destino; ← lo cierra', async () => {
      const { fila, teclear } = await montar(1024);
      const admin = fila('Administración');
      admin.focus();
      const enter = await teclear(admin, 'Enter');
      expect(enter.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(fila('Usuarios'));
      await teclear(document.activeElement!, 'ArrowLeft');
      expect(document.activeElement).toBe(admin);
      await teclear(admin, 'ArrowRight');
      expect(document.activeElement).toBe(fila('Usuarios'));
    });

    it('con el puntero abre a los 100 ms y cierra a los 150 ms de salir, salvo que el puntero llegue al panel', async () => {
      const { fila, raiz, actualizar } = await montar(1024);
      vi.useFakeTimers();
      const admin = fila('Administración');
      admin.dispatchEvent(new MouseEvent('mouseenter'));
      vi.advanceTimersByTime(100);
      await actualizar();
      expect(admin.getAttribute('aria-expanded')).toBe('true');
      admin.dispatchEvent(new MouseEvent('mouseleave'));
      raiz.querySelector('.uki-sidebar__flotante')!.dispatchEvent(new MouseEvent('mouseenter'));
      vi.advanceTimersByTime(200);
      await actualizar();
      expect(admin.getAttribute('aria-expanded')).toBe('true');
      raiz.querySelector('.uki-sidebar__flotante')!.dispatchEvent(new MouseEvent('mouseleave'));
      vi.advanceTimersByTime(150);
      await actualizar();
      expect(admin.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('teléfono', () => {
    it('barra inferior con los destinos marcados y «Más»', async () => {
      const { raiz } = await montar(375, '/tramites');
      const barra = raiz.querySelector('.uki-sidebar-movil')!;
      expect(barra.tagName).toBe('NAV');
      expect(barra.getAttribute('aria-label')).toBe('Menú principal');
      const destinos = [...barra.querySelectorAll<HTMLElement>('.uki-sidebar-movil__destino')];
      expect(destinos.map((d) => d.textContent!.trim())).toEqual(['Mis trámites', 'Documentos', 'Más']);
      expect(destinos[0].getAttribute('aria-current')).toBe('page');
      expect(destinos[2].getAttribute('aria-haspopup')).toBe('dialog');
    });

    it('sin destinos marcados usa los tres primeros sin hijos', async () => {
      const { raiz, host, actualizar } = await montar(375);
      host.items.set(MENU.map(({ bottomBar: _, ...resto }) => resto));
      await actualizar();
      const destinos = [...raiz.querySelectorAll('.uki-sidebar-movil__destino')].map((d) => d.textContent!.trim());
      expect(destinos).toEqual(['Inicio', 'Mis trámites', 'Documentos', 'Más']);
    });

    it('«Más» abre el panel en la pila de modales con secciones; Esc lo cierra y el foco vuelve', async () => {
      const { raiz, teclear, actualizar } = await montar(375);
      const mas = [...raiz.querySelectorAll<HTMLElement>('.uki-sidebar-movil__destino')].at(-1)!;
      mas.focus();
      mas.click();
      await actualizar();
      const panel = raiz.querySelector<HTMLDialogElement>('dialog.uki-sidebar-panel')!;
      expect(panel.open).toBe(true);
      expect(mas.getAttribute('aria-expanded')).toBe('true');
      expect(document.documentElement.classList).toContain('uki-modal-abierto');
      expect(panel.getAttribute('aria-labelledby')).toBe(panel.querySelector('.uki-sidebar-panel__titulo')!.id);
      expect([...panel.querySelectorAll('.uki-sidebar-panel__seccion')].map((s) => s.textContent!.trim())).toEqual([
        'Mi cuenta',
        'Administración',
      ]);
      expect(document.activeElement).toBe(panel.querySelector('.uki-sidebar-panel__cerrar'));
      await teclear(document.activeElement!, 'Escape');
      expect(panel.open).toBe(false);
      expect(document.documentElement.classList).not.toContain('uki-modal-abierto');
      expect(document.activeElement).toBe(mas);
    });

    it('Tab da la vuelta dentro del panel; × y elegir un destino lo cierran', async () => {
      const { raiz, teclear, actualizar } = await montar(375);
      const mas = [...raiz.querySelectorAll<HTMLElement>('.uki-sidebar-movil__destino')].at(-1)!;
      mas.click();
      await actualizar();
      const panel = raiz.querySelector<HTMLDialogElement>('dialog.uki-sidebar-panel')!;
      const enfocables = [...panel.querySelectorAll<HTMLElement>('a, button')];
      enfocables.at(-1)!.focus();
      const tab = await teclear(enfocables.at(-1)!, 'Tab');
      expect(tab.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(enfocables[0]);
      panel.querySelector<HTMLAnchorElement>('a[href="/tramites"]')!.click();
      await actualizar();
      expect(panel.open).toBe(false);
      mas.click();
      await actualizar();
      panel.querySelector<HTMLButtonElement>('.uki-sidebar-panel__cerrar')!.click();
      await actualizar();
      expect(panel.open).toBe(false);
    });
  });
});
