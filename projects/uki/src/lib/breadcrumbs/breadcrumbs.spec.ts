import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UkiBreadcrumbItem, UkiBreadcrumbs } from './breadcrumbs';

const CUATRO: UkiBreadcrumbItem[] = [
  { label: 'Inicio', link: '/' },
  { label: 'Trámites', link: '/tramites' },
  { label: 'Solicitudes', href: 'https://ejemplo.mx/solicitudes' },
  { label: 'SOL-2026-0148', link: '/no-se-usa' },
];

const SEIS: UkiBreadcrumbItem[] = [
  { label: 'Inicio', link: '/' },
  { label: 'Programas', link: '/programas' },
  { label: 'FONADIN', link: '/programas/fonadin' },
  { label: 'Trámites', link: '/programas/fonadin/tramites' },
  { label: 'Solicitudes', link: '/programas/fonadin/tramites/solicitudes' },
  { label: 'Detalle' },
];

@Component({
  imports: [UkiBreadcrumbs],
  template: `<uki-breadcrumbs [items]="items()" [homeIcon]="casa()" /><button type="button" id="fuera">Fuera</button>`,
})
class Anfitrion {
  readonly items = signal<UkiBreadcrumbItem[]>(CUATRO);
  readonly casa = signal(true);
}

async function montar(items = CUATRO) {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), provideRouter([])] });
  const fixture = TestBed.createComponent(Anfitrion);
  fixture.componentInstance.items.set(items);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const raiz: HTMLElement = fixture.nativeElement;
  const actualizar = () => fixture.whenStable();
  const lista = () => raiz.querySelector('ol')!;
  const niveles = () => [...lista().querySelectorAll(':scope > li')];
  return { fixture, raiz, actualizar, lista, niveles };
}

describe('UkiBreadcrumbs', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    document.body.replaceChildren();
  });

  it('es un nav «Ruta de navegación» con una lista ordenada; el último es la página actual sin enlace', async () => {
    const { raiz, niveles } = await montar();
    const nav = raiz.querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).toBe('Ruta de navegación');
    expect(niveles().length).toBe(4);
    const ultimo = niveles()[3];
    expect(ultimo.querySelector('a')).toBeNull();
    const actual = ultimo.querySelector('[aria-current="page"]')!;
    expect(actual.textContent!.trim()).toBe('SOL-2026-0148');
  });

  it('dibuja routerLink o href, con la casa solo en el primero y separadores ocultos', async () => {
    const { niveles, raiz, fixture, actualizar } = await montar();
    const [inicio, tramites, solicitudes] = niveles().map((li) => li.querySelector('a')!);
    expect(inicio.getAttribute('href')).toBe('/');
    expect(tramites.getAttribute('href')).toBe('/tramites');
    expect(solicitudes.getAttribute('href')).toBe('https://ejemplo.mx/solicitudes');
    expect(inicio.querySelector('uki-icono')).not.toBeNull();
    expect(tramites.querySelector('uki-icono')).toBeNull();
    const separadores = raiz.querySelectorAll('ol .uki-breadcrumbs__separador');
    expect(separadores.length).toBe(3);
    separadores.forEach((s) => expect(s.getAttribute('aria-hidden')).toBe('true'));
    fixture.componentInstance.casa.set(false);
    await actualizar();
    expect(niveles()[0].querySelector('a uki-icono')).toBeNull();
  });

  it('con menos de 5 niveles no colapsa', async () => {
    const { raiz } = await montar();
    expect(raiz.querySelector('.uki-breadcrumbs__mas')).toBeNull();
  });

  it('desde 5 niveles muestra el primero, «…» y los dos últimos; el botón abre la lista de ocultos', async () => {
    const { raiz, niveles, actualizar } = await montar(SEIS);
    expect(niveles().map((li) => li.textContent!.trim())).toEqual(['Inicio', '', 'Solicitudes', 'Detalle']);
    const mas = raiz.querySelector<HTMLButtonElement>('.uki-breadcrumbs__mas')!;
    expect(mas.getAttribute('aria-label')).toBe('Mostrar ruta completa');
    expect(mas.getAttribute('aria-expanded')).toBe('false');
    mas.click();
    await actualizar();
    const menu = raiz.querySelector<HTMLElement>('.uki-breadcrumbs__menu')!;
    expect(mas.getAttribute('aria-expanded')).toBe('true');
    expect(mas.getAttribute('aria-controls')).toBe(menu.id);
    expect(menu.classList).toContain('uki-capa');
    expect([...menu.querySelectorAll('a')].map((a) => a.textContent!.trim())).toEqual(['Programas', 'FONADIN', 'Trámites']);
    expect(document.activeElement!.textContent!.trim()).toBe('Programas');
  });

  it('Esc cierra la lista sin propagarse y devuelve el foco al botón; un clic fuera también la cierra', async () => {
    const { raiz, actualizar } = await montar(SEIS);
    const mas = raiz.querySelector<HTMLButtonElement>('.uki-breadcrumbs__mas')!;
    mas.click();
    await actualizar();
    const esc = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.activeElement!.dispatchEvent(esc);
    await actualizar();
    expect(esc.defaultPrevented).toBe(true);
    expect(raiz.querySelector('.uki-breadcrumbs__menu')).toBeNull();
    expect(document.activeElement).toBe(mas);

    mas.click();
    await actualizar();
    raiz.querySelector<HTMLButtonElement>('#fuera')!.click();
    await actualizar();
    expect(raiz.querySelector('.uki-breadcrumbs__menu')).toBeNull();
  });

  it('para teléfonos dibuja el enlace a la página padre con «Volver a»', async () => {
    const { raiz } = await montar(SEIS);
    const volver = raiz.querySelector('.uki-breadcrumbs__volver a')!;
    expect(volver.getAttribute('href')).toBe('/programas/fonadin/tramites/solicitudes');
    expect(volver.textContent!.replace(/\s+/g, ' ').trim()).toBe('Volver a Solicitudes');
  });
});
