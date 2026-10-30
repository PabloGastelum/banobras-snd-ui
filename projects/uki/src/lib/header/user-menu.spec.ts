import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UkiHeader } from './header';
import { UkiUserMenu, UkiUserMenuItem } from './user-menu';

@Component({
  imports: [UkiHeader, UkiUserMenu, UkiUserMenuItem],
  template: `
    <header ukiHeader>
      <uki-user-menu name="Mariana López Hernández" userRole="Administradora" (signOut)="salidas = salidas + 1">
        <button ukiUserMenuItem type="button" (click)="perfil = perfil + 1">Mi perfil</button>
        <a ukiUserMenuItem href="#ayuda">Ayuda</a>
      </uki-user-menu>
    </header>
    <button type="button" id="fuera">Fuera</button>
  `,
})
class Anfitrion {
  salidas = 0;
  perfil = 0;
}

async function montar() {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const fixture = TestBed.createComponent(Anfitrion);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const raiz: HTMLElement = fixture.nativeElement;
  const boton = raiz.querySelector<HTMLButtonElement>('.uki-user-menu__boton')!;
  const menu = () => raiz.querySelector<HTMLElement>('[role="menu"]')!;
  const panel = () => raiz.querySelector<HTMLElement>('.uki-user-menu__panel')!;
  const opciones = () => [...menu().querySelectorAll<HTMLElement>('[role="menuitem"]')];
  const abierto = () => boton.getAttribute('aria-expanded') === 'true';
  const teclear = async (destino: Element, key: string, extra: KeyboardEventInit = {}) => {
    const evento = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extra });
    destino.dispatchEvent(evento);
    await fixture.whenStable();
    return evento;
  };
  return { fixture, raiz, boton, menu, panel, opciones, abierto, teclear, actualizar: () => fixture.whenStable() };
}

describe('UkiHeader y UkiUserMenu', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    document.body.replaceChildren();
  });

  it('el Header es el <header> nativo', async () => {
    const { raiz } = await montar();
    const header = raiz.querySelector('header')!;
    expect(header.classList).toContain('uki-header');
    expect(header.hasAttribute('role')).toBe(false);
  });

  it('el botón es un botón de menú con nombre, aria-haspopup, aria-expanded y aria-controls', async () => {
    const { raiz, boton, menu, panel } = await montar();
    // El nombre sale de un texto oculto: con aria-label, el nombre no coincidiría con las iniciales visibles.
    expect(boton.hasAttribute('aria-label')).toBe(false);
    expect(boton.querySelector('.uki-user-menu__oculto')!.textContent).toBe('Menú de usuario');
    expect(raiz.querySelector('uki-user-menu')!.hasAttribute('role')).toBe(false);
    expect(boton.getAttribute('aria-haspopup')).toBe('menu');
    expect(boton.getAttribute('aria-expanded')).toBe('false');
    expect(boton.getAttribute('aria-controls')).toBe(menu().id);
    expect(panel().hidden).toBe(true);
    expect(boton.querySelector('uki-avatar')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('el menú tiene el perfil fuera de las opciones y «Cerrar sesión» al final', async () => {
    const { boton, panel, opciones, actualizar } = await montar();
    boton.click();
    await actualizar();
    expect(panel().querySelector('.uki-user-menu__nombre')!.textContent).toContain('Mariana López Hernández');
    expect(panel().querySelector('.uki-user-menu__rol')!.textContent).toContain('Administradora');
    expect(opciones().map((o) => o.textContent!.trim())).toEqual(['Mi perfil', 'Ayuda', 'Cerrar sesión']);
    expect(opciones().every((o) => o.tabIndex === -1)).toBe(true);
  });

  it('con clic abre y enfoca la primera opción; Esc cierra y devuelve el foco al botón', async () => {
    const { boton, opciones, abierto, teclear, actualizar } = await montar();
    boton.click();
    await actualizar();
    expect(abierto()).toBe(true);
    expect(document.activeElement).toBe(opciones()[0]);
    const esc = await teclear(document.activeElement!, 'Escape');
    expect(esc.defaultPrevented).toBe(true);
    expect(abierto()).toBe(false);
    expect(document.activeElement).toBe(boton);
  });

  it('↓ abre en la primera opción y ↑ en la última; las flechas, Inicio y Fin se mueven y dan la vuelta', async () => {
    const { boton, opciones, teclear } = await montar();
    boton.focus();
    await teclear(boton, 'ArrowUp');
    expect(document.activeElement).toBe(opciones()[2]);
    await teclear(document.activeElement!, 'ArrowDown');
    expect(document.activeElement).toBe(opciones()[0]);
    await teclear(document.activeElement!, 'ArrowUp');
    expect(document.activeElement).toBe(opciones()[2]);
    await teclear(document.activeElement!, 'Home');
    expect(document.activeElement).toBe(opciones()[0]);
    await teclear(document.activeElement!, 'End');
    expect(document.activeElement).toBe(opciones()[2]);
    await teclear(document.activeElement!, 'Escape');
    await teclear(boton, 'ArrowDown');
    expect(document.activeElement).toBe(opciones()[0]);
  });

  it('Enter y Espacio en el botón abren el menú en la primera opción', async () => {
    const { boton, opciones, abierto, teclear } = await montar();
    const enter = await teclear(boton, 'Enter');
    expect(enter.defaultPrevented).toBe(true);
    expect(abierto()).toBe(true);
    expect(document.activeElement).toBe(opciones()[0]);
    await teclear(document.activeElement!, 'Escape');
    await teclear(boton, ' ');
    expect(abierto()).toBe(true);
  });

  it('Tab cierra el menú sin impedir que el foco avance', async () => {
    const { boton, abierto, teclear, actualizar } = await montar();
    boton.click();
    await actualizar();
    const tab = await teclear(document.activeElement!, 'Tab');
    expect(tab.defaultPrevented).toBe(false);
    expect(abierto()).toBe(false);
  });

  it('un clic fuera cierra el menú', async () => {
    const { raiz, boton, abierto, actualizar } = await montar();
    boton.click();
    await actualizar();
    raiz.querySelector<HTMLElement>('#fuera')!.click();
    await actualizar();
    expect(abierto()).toBe(false);
  });

  it('elegir una opción la ejecuta, cierra el menú y devuelve el foco', async () => {
    const { fixture, boton, opciones, abierto, actualizar } = await montar();
    boton.click();
    await actualizar();
    opciones()[0].click();
    await actualizar();
    expect(fixture.componentInstance.perfil).toBe(1);
    expect(abierto()).toBe(false);
    expect(document.activeElement).toBe(boton);
  });

  it('«Cerrar sesión» solo emite signOut y cierra el menú', async () => {
    const { fixture, boton, opciones, abierto, actualizar } = await montar();
    boton.click();
    await actualizar();
    opciones()[2].click();
    await actualizar();
    expect(fixture.componentInstance.salidas).toBe(1);
    expect(abierto()).toBe(false);
  });
});
