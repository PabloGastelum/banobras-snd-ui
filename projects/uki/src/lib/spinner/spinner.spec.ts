import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UkiSpinner, UkiSpinnerSize } from './spinner';

@Component({
  imports: [UkiSpinner],
  template: `<uki-spinner [size]="size()" [label]="label()" [decorative]="decorative()" />`,
})
class Anfitrion {
  readonly size = signal<UkiSpinnerSize>(24);
  readonly label = signal('Cargando');
  readonly decorative = signal(false);
}

async function montar() {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const fixture = TestBed.createComponent(Anfitrion);
  await fixture.whenStable();
  const spinner: HTMLElement = fixture.nativeElement.querySelector('uki-spinner');
  return { fixture, spinner };
}

describe('UkiSpinner', () => {
  it('se anuncia como estado con la etiqueta «Cargando» por omisión', async () => {
    const { spinner } = await montar();
    expect(spinner.getAttribute('role')).toBe('status');
    expect(spinner.getAttribute('aria-label')).toBe('Cargando');
    expect(spinner.classList).toContain('uki-spinner');
  });

  it('usa la etiqueta que se le pase', async () => {
    const { fixture, spinner } = await montar();
    fixture.componentInstance.label.set('Cargando resultados');
    await fixture.whenStable();
    expect(spinner.getAttribute('aria-label')).toBe('Cargando resultados');
  });

  it('dibuja 12 puntos: el activo al 100 % y la estela de 90 % a 5 %', async () => {
    const { spinner } = await montar();
    const opacidades = [...spinner.querySelectorAll('circle')].map((c) => Number(c.getAttribute('opacity')));
    expect(opacidades).toHaveLength(12);
    expect(opacidades[0]).toBe(1);
    // La estela va detrás del punto activo: 11 en punto (índice 11) es la más visible y 1 en punto (índice 1) la menos.
    expect(opacidades[11]).toBe(0.9);
    expect(opacidades[1]).toBe(0.05);
    for (let i = 1; i < 11; i++) expect(opacidades[i]).toBeLessThan(opacidades[i + 1]);
  });

  it('cambia de tamaño con la clase correspondiente', async () => {
    const { fixture, spinner } = await montar();
    expect(spinner.classList).not.toContain('uki-spinner--36');
    fixture.componentInstance.size.set(36);
    await fixture.whenStable();
    expect(spinner.classList).toContain('uki-spinner--36');
    fixture.componentInstance.size.set(48);
    await fixture.whenStable();
    expect(spinner.classList).toContain('uki-spinner--48');
  });

  it('en modo decorativo se oculta a lectores de pantalla', async () => {
    const { fixture, spinner } = await montar();
    fixture.componentInstance.decorative.set(true);
    await fixture.whenStable();
    expect(spinner.getAttribute('aria-hidden')).toBe('true');
    expect(spinner.hasAttribute('role')).toBe(false);
    expect(spinner.hasAttribute('aria-label')).toBe(false);
  });
});
