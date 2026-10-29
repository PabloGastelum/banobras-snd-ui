import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UkiFeedbackType } from '../feedback';
import { UkiBadge } from './badge';

@Component({
  imports: [UkiBadge],
  template: `<uki-badge [type]="type()">En revisión</uki-badge>`,
})
class Anfitrion {
  readonly type = signal<UkiFeedbackType>('warning');
}

async function montar() {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const fixture = TestBed.createComponent(Anfitrion);
  await fixture.whenStable();
  const badge: HTMLElement = fixture.nativeElement.querySelector('uki-badge');
  return { fixture, badge, anfitrion: fixture.componentInstance };
}

describe('UkiBadge', () => {
  it('muestra la etiqueta proyectada como texto, sin rol', async () => {
    const { badge } = await montar();
    expect(badge.textContent?.trim()).toBe('En revisión');
    expect(badge.getAttribute('role')).toBeNull();
    expect(badge.classList).toContain('uki-badge');
  });

  it('el punto es decorativo', async () => {
    const { badge } = await montar();
    expect(badge.querySelector('.uki-badge__dot')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('aplica la clase de cada tipo', async () => {
    const { fixture, badge, anfitrion } = await montar();
    expect(badge.classList).toContain('uki-badge--warning');
    for (const tipo of ['success', 'info', 'error'] as const) {
      anfitrion.type.set(tipo);
      await fixture.whenStable();
      expect(badge.classList).toContain(`uki-badge--${tipo}`);
      expect(badge.classList).not.toContain('uki-badge--warning');
    }
  });
});
