import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UkiFeedbackType } from '../feedback';
import { UkiAlert } from './alert';

@Component({
  imports: [UkiAlert],
  template: `
    <button type="button" id="antes">Antes</button>
    <uki-alert [type]="type()" [icon]="icon()" [dismissible]="dismissible()" [(open)]="open">
      No pudimos enviar la solicitud. <a href="/ayuda">Ver ayuda</a>
    </uki-alert>
    <button type="button" id="oculto" hidden>Oculto</button>
    <button type="button" id="despues">Después</button>
  `,
})
class Anfitrion {
  readonly type = signal<UkiFeedbackType>('success');
  readonly icon = signal(true);
  readonly dismissible = signal(false);
  readonly open = signal(true);
}

async function montar() {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const fixture = TestBed.createComponent(Anfitrion);
  // El foco solo funciona con el anfitrión dentro del documento.
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const raiz: HTMLElement = fixture.nativeElement;
  const alerta = raiz.querySelector<HTMLElement>('uki-alert')!;
  return { fixture, raiz, alerta, anfitrion: fixture.componentInstance, actualizar: () => fixture.whenStable() };
}

describe('UkiAlert', () => {
  afterEach(() => document.body.replaceChildren());

  it('proyecta el mensaje, con enlaces', async () => {
    const { alerta } = await montar();
    expect(alerta.querySelector('.uki-alert__message')!.textContent).toContain('No pudimos enviar la solicitud.');
    expect(alerta.querySelector('a[href="/ayuda"]')).not.toBeNull();
  });

  it('usa role=alert solo en Error y role=status en los demás tipos', async () => {
    const { alerta, anfitrion, actualizar } = await montar();
    for (const [tipo, rol] of [
      ['success', 'status'],
      ['info', 'status'],
      ['warning', 'status'],
      ['error', 'alert'],
    ] as const) {
      anfitrion.type.set(tipo);
      await actualizar();
      expect(alerta.getAttribute('role')).toBe(rol);
      expect(alerta.classList).toContain(`uki-alert--${tipo}`);
    }
  });

  it('muestra el ícono de cada tipo y se puede apagar', async () => {
    const { alerta, anfitrion, actualizar } = await montar();
    const icono = () => alerta.querySelector('.uki-alert__icon');
    expect(icono()!.getAttribute('aria-hidden')).toBe('true');
    expect(icono()!.querySelectorAll('circle, path').length).toBeGreaterThan(0);
    anfitrion.type.set('warning');
    await actualizar();
    expect(icono()!.querySelector('circle')).toBeNull();
    anfitrion.icon.set(false);
    await actualizar();
    expect(icono()).toBeNull();
  });

  it('el botón «Cerrar aviso» solo aparece con dismissible', async () => {
    const { alerta, anfitrion, actualizar } = await montar();
    expect(alerta.querySelector('button')).toBeNull();
    anfitrion.dismissible.set(true);
    await actualizar();
    const cerrar = alerta.querySelector<HTMLButtonElement>('button.uki-alert__close')!;
    expect(cerrar.getAttribute('aria-label')).toBe('Cerrar aviso');
    expect(cerrar.type).toBe('button');
  });

  it('al cerrar se oculta, avisa con [(open)] y lleva el foco al siguiente elemento enfocable visible', async () => {
    const { raiz, alerta, anfitrion, actualizar } = await montar();
    anfitrion.dismissible.set(true);
    await actualizar();
    const cerrar = alerta.querySelector<HTMLButtonElement>('.uki-alert__close')!;
    cerrar.focus();
    cerrar.click();
    await actualizar();
    expect(anfitrion.open()).toBe(false);
    expect(alerta.hasAttribute('hidden')).toBe(true);
    expect(document.activeElement).toBe(raiz.querySelector('#despues'));
  });

  it('con open=false empieza oculto', async () => {
    const { alerta, anfitrion, actualizar } = await montar();
    anfitrion.open.set(false);
    await actualizar();
    expect(alerta.hasAttribute('hidden')).toBe(true);
  });
});
