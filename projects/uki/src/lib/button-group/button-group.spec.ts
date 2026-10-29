import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UkiButton } from '../button/button';
import { UkiButtonGroup } from './button-group';

@Component({
  imports: [UkiButton, UkiButtonGroup],
  template: `
    <div ukiButtonGroup>
      <button ukiButton variant="ghost" type="button">Cancelar</button>
      <button ukiButton type="button">Continuar</button>
    </div>
  `,
})
class Anfitrion {}

describe('UkiButtonGroup', () => {
  it('agrega la clase del grupo y conserva los botones en el orden del DOM', async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(Anfitrion);
    await fixture.whenStable();
    const grupo: HTMLElement = fixture.nativeElement.querySelector('[ukiButtonGroup]');
    expect(grupo.classList).toContain('uki-button-group');
    expect([...grupo.children].map((b) => b.textContent!.trim())).toEqual(['Cancelar', 'Continuar']);
  });
});
