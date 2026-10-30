import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UkiFooter } from './footer';

@Component({
  imports: [UkiFooter],
  template: `
    <footer ukiFooter id="omision"></footer>
    <footer ukiFooter id="propio" [year]="anio()">Todos los derechos reservados. <a href="/aviso">Aviso de privacidad</a></footer>
  `,
})
class Anfitrion {
  readonly anio = signal(2026);
}

async function montar() {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const fixture = TestBed.createComponent(Anfitrion);
  await fixture.whenStable();
  return { raiz: fixture.nativeElement as HTMLElement, host: fixture.componentInstance, actualizar: () => fixture.whenStable() };
}

describe('UkiFooter', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('es el <footer> nativo con «© año BANOBRAS.» en negritas y el texto por omisión', async () => {
    const { raiz } = await montar();
    const pie = raiz.querySelector('#omision')!;
    expect(pie.tagName).toBe('FOOTER');
    expect(pie.classList).toContain('uki-footer');
    expect(pie.querySelector('strong')!.textContent).toBe(`© ${new Date().getFullYear()} BANOBRAS.`);
    expect(pie.textContent!.replace(/\s+/g, ' ').trim()).toBe(`© ${new Date().getFullYear()} BANOBRAS. Todos los derechos reservados`);
  });

  it('usa el año que le dan y el contenido proyectado en lugar del texto por omisión', async () => {
    const { raiz, host, actualizar } = await montar();
    const pie = raiz.querySelector('#propio')!;
    expect(pie.querySelector('strong')!.textContent).toBe('© 2026 BANOBRAS.');
    expect(pie.querySelector('a')!.textContent).toBe('Aviso de privacidad');
    expect(pie.textContent).toContain('Todos los derechos reservados. ');
    host.anio.set(2027);
    await actualizar();
    expect(pie.querySelector('strong')!.textContent).toBe('© 2027 BANOBRAS.');
  });
});
