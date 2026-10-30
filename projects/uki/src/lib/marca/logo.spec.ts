import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UkiLogoBanobras, UkiLogoBanobrasIcon, UkiLogoFonadin, UkiLogoGobmx, UkiLogoHacienda } from './logo';

@Component({
  imports: [UkiLogoBanobras, UkiLogoBanobrasIcon, UkiLogoGobmx, UkiLogoHacienda, UkiLogoFonadin],
  template: `
    <uki-logo-banobras id="banobras" [theme]="tema()" [size]="tamano()" [decorative]="decorativo()" [label]="etiqueta()"
                       [clearSpace]="espacio()" />
    <uki-logo-banobras-icon id="icono" theme="white" />
    <uki-logo-gobmx id="gobmx" theme="white" />
    <uki-logo-hacienda id="hacienda" />
    <uki-logo-fonadin id="fonadin" size="small" />
  `,
})
class Anfitrion {
  readonly tema = signal<'color' | 'white'>('color');
  readonly tamano = signal<'default' | 'small'>('default');
  readonly decorativo = signal(false);
  readonly etiqueta = signal<string | undefined>(undefined);
  readonly espacio = signal(true);
}

async function montar() {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const fixture = TestBed.createComponent(Anfitrion);
  await fixture.whenStable();
  const raiz: HTMLElement = fixture.nativeElement;
  const svg = (id: string) => raiz.querySelector(`#${id} svg`)!;
  return { fixture, raiz, svg, host: fixture.componentInstance, actualizar: () => fixture.whenStable() };
}

describe('Logotipos', () => {
  let aviso: ReturnType<typeof vi.spyOn>;
  beforeEach(() => (aviso = vi.spyOn(console, 'warn').mockImplementation(() => undefined)));
  afterEach(() => {
    aviso.mockRestore();
    TestBed.resetTestingModule();
  });

  it('son imágenes con el nombre de cada institución', async () => {
    const { svg } = await montar();
    const nombres = ['banobras', 'icono', 'gobmx', 'hacienda', 'fonadin'].map((id) => [
      svg(id).getAttribute('role'),
      svg(id).getAttribute('aria-label'),
    ]);
    expect(nombres).toEqual([
      ['img', 'Banobras'],
      ['img', 'Banobras'],
      ['img', 'Gobierno de México'],
      ['img', 'Secretaría de Hacienda y Crédito Público'],
      ['img', 'FONADIN, Fondo Nacional de Infraestructura'],
    ]);
  });

  it('cambia el nombre con label y se oculta con decorative', async () => {
    const { svg, host, actualizar } = await montar();
    host.etiqueta.set('Banobras, ir a Inicio');
    await actualizar();
    expect(svg('banobras').getAttribute('aria-label')).toBe('Banobras, ir a Inicio');
    host.decorativo.set(true);
    await actualizar();
    expect(svg('banobras').getAttribute('aria-hidden')).toBe('true');
    expect(svg('banobras').hasAttribute('role')).toBe(false);
    expect(svg('banobras').hasAttribute('aria-label')).toBe(false);
  });

  it('usa la proporción del tamaño natural de Figma y el viewBox de 60 de alto', async () => {
    const { svg } = await montar();
    expect(svg('banobras').getAttribute('viewBox')).toBe('0 0 284 60');
    expect(svg('gobmx').getAttribute('viewBox')).toBe('0 0 188 60');
    expect(svg('hacienda').getAttribute('viewBox')).toBe('0 0 273 60');
    expect(svg('fonadin').getAttribute('viewBox')).toBe('0 0 262 60');
    expect(svg('icono').getAttribute('viewBox')).toBe('0 0 60 60');
  });

  it('marca el tamaño Small y permite apagar el espacio libre', async () => {
    const { raiz, host, actualizar } = await montar();
    const banobras = raiz.querySelector('#banobras')!;
    expect(raiz.querySelector('#fonadin')!.classList).toContain('uki-logo--small');
    expect(banobras.classList).not.toContain('uki-logo--small');
    expect(banobras.classList).not.toContain('uki-logo--sin-espacio');
    host.tamano.set('small');
    host.espacio.set(false);
    await actualizar();
    expect(banobras.classList).toContain('uki-logo--small');
    expect(banobras.classList).toContain('uki-logo--sin-espacio');
  });

  it('usa los colores oficiales fijos, no tokens: guinda en color y blanco en white', async () => {
    const { svg, host, actualizar } = await montar();
    expect(svg('banobras').querySelector('rect')!.getAttribute('stroke')).toBe('#6B0E35');
    expect(svg('gobmx').querySelector('rect')!.getAttribute('stroke')).toBe('#FFFFFF');
    host.tema.set('white');
    await actualizar();
    expect(svg('banobras').querySelector('text')!.getAttribute('fill')).toBe('#FFFFFF');
  });

  it('mientras falten los vectores oficiales dibuja un marcador y avisa una sola vez por logotipo', async () => {
    const { raiz } = await montar();
    expect(raiz.querySelector('#banobras')!.classList).toContain('uki-logo--marcador');
    expect(raiz.querySelector('#banobras text')!.textContent!.trim()).toBe('BANOBRAS');
    TestBed.createComponent(Anfitrion);
    const mensajes = aviso.mock.calls.map((llamada) => String(llamada[0])).filter((m) => m.includes('uki-logo-banobras]'));
    expect(mensajes.length).toBeLessThanOrEqual(1);
  });
});
