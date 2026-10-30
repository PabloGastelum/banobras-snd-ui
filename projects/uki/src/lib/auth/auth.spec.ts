import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UkiAuth } from './auth';
import { UkiHero } from './hero';

@Component({
  imports: [UkiAuth, UkiHero],
  template: `
    <uki-hero [illustrationSrc]="ilustracion()" />
    <uki-auth heading="Inicia sesión en tu cuenta" [systemName]="sistema()" [year]="2026">
      <p id="aviso">Contraseña incorrecta</p>
      <form id="formulario"><button type="submit">Iniciar sesión</button></form>
    </uki-auth>
  `,
})
class Anfitrion {
  readonly ilustracion = signal<string | null>(null);
  readonly sistema = signal<string | undefined>('Sistema de Administración y Actualización del Inventario de Procesos de BANOBRAS');
}

async function montar() {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const fixture = TestBed.createComponent(Anfitrion);
  await fixture.whenStable();
  return { raiz: fixture.nativeElement as HTMLElement, host: fixture.componentInstance, actualizar: () => fixture.whenStable() };
}

describe('UkiAuth', () => {
  let aviso: ReturnType<typeof vi.spyOn>;
  beforeEach(() => (aviso = vi.spyOn(console, 'warn').mockImplementation(() => undefined)));
  afterEach(() => {
    aviso.mockRestore();
    TestBed.resetTestingModule();
  });

  it('dibuja el logotipo de Banobras con su nombre, el título como h1 y el nombre del sistema', async () => {
    const { raiz } = await montar();
    const auth = raiz.querySelector('uki-auth')!;
    expect(auth.querySelector('uki-logo-banobras svg')!.getAttribute('aria-label')).toBe('Banobras');
    expect(auth.querySelector('h1')!.textContent!.trim()).toBe('Inicia sesión en tu cuenta');
    expect(auth.querySelector('.uki-auth__sistema')!.textContent).toContain('Inventario de Procesos');
  });

  it('pone el contenido del sistema debajo del encabezado, sin cambiarlo, y el pie con el año', async () => {
    const { raiz } = await montar();
    const cuerpo = raiz.querySelector('.uki-auth__cuerpo')!;
    expect([...cuerpo.children].map((e) => e.id || e.className)).toEqual(['uki-auth__encabezado', 'aviso', 'formulario']);
    const pie = raiz.querySelector('.uki-auth__pie')!;
    expect(pie.tagName).not.toBe('FOOTER');
    expect(pie.querySelector('strong')!.textContent).toBe('© 2026 BANOBRAS.');
  });

  it('con headingLevel 2 el título es h2, para páginas que ya tienen h1', async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(UkiAuth);
    fixture.componentRef.setInput('heading', 'Inicia sesión');
    fixture.componentRef.setInput('headingLevel', 2);
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(raiz.querySelector('h1')).toBeNull();
    expect(raiz.querySelector('h2')!.textContent!.trim()).toBe('Inicia sesión');
  });

  it('sin systemName no deja un párrafo vacío', async () => {
    const { raiz, host, actualizar } = await montar();
    host.sistema.set(undefined);
    await actualizar();
    expect(raiz.querySelector('.uki-auth__sistema')).toBeNull();
  });
});

describe('UkiHero', () => {
  let aviso: ReturnType<typeof vi.spyOn>;
  beforeEach(() => (aviso = vi.spyOn(console, 'warn').mockImplementation(() => undefined)));
  afterEach(() => {
    aviso.mockRestore();
    TestBed.resetTestingModule();
  });

  it('solo informa el logotipo del Gobierno de México (blanco) y no tiene nada enfocable', async () => {
    const { raiz } = await montar();
    const hero = raiz.querySelector('uki-hero')!;
    const logo = hero.querySelector('uki-logo-gobmx')!;
    expect(logo.querySelector('svg')!.getAttribute('aria-label')).toBe('Gobierno de México');
    expect(logo.querySelector('rect')!.getAttribute('stroke')).toBe('#FFFFFF');
    expect(hero.querySelectorAll('a, button, [tabindex]').length).toBe(0);
    expect(hero.querySelector('.uki-hero__patron')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('dibuja la ilustración como imagen decorativa solo si recibe illustrationSrc', async () => {
    const { raiz, host, actualizar } = await montar();
    expect(raiz.querySelector('uki-hero img')).toBeNull();
    host.ilustracion.set('/assets/la-patria.webp');
    await actualizar();
    const img = raiz.querySelector<HTMLImageElement>('uki-hero img')!;
    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('src')).toBe('/assets/la-patria.webp');
    expect(img.getAttribute('width')).toBe('600');
    expect(img.getAttribute('height')).toBe('743');
  });
});
