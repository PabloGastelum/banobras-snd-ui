import { ApplicationRef, PLATFORM_ID, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { matchMediaFalso, polyfillDialogo } from '../pruebas/jsdom';
import { UkiDialogService } from './dialog.service';

async function montar() {
  polyfillDialogo();
  matchMediaFalso(true);
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const dialogos = TestBed.inject(UkiDialogService);
  const appRef = TestBed.inject(ApplicationRef);
  const actualizar = async () => {
    await new Promise((r) => setTimeout(r));
    await appRef.whenStable();
  };
  const boton = (texto: string) =>
    [...document.querySelectorAll<HTMLButtonElement>('dialog button')].find((b) => b.textContent!.trim() === texto)!;
  return { dialogos, actualizar, boton };
}

describe('UkiDialogService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    document.body.replaceChildren();
  });

  it('confirm() abre un Confirmation Small y se cumple con true al confirmar', async () => {
    const { dialogos, actualizar, boton } = await montar();
    const respuesta = dialogos.confirm({
      title: '¿Eliminar el trámite?',
      message: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      destructive: true,
    });
    await actualizar();
    const dialogo = document.querySelector('dialog')!;
    expect(dialogo.open).toBe(true);
    expect(dialogo.classList).toContain('uki-modal--small');
    expect(dialogo.querySelector('h2')!.textContent).toBe('¿Eliminar el trámite?');
    expect(dialogo.querySelector('.uki-modal__body')!.textContent).toContain('Esta acción no se puede deshacer.');
    expect(document.activeElement!.textContent!.trim()).toBe('Cancelar');
    expect(boton('Eliminar').classList).toContain('uki-button--danger');
    boton('Eliminar').click();
    await actualizar();
    await expect(respuesta).resolves.toBe(true);
    expect(document.querySelector('dialog')).toBeNull();
  });

  it('confirm() se cumple con false con Cancelar, × o Esc; sin destructive el botón es Primary', async () => {
    const { dialogos, actualizar, boton } = await montar();
    const opciones = { title: '¿Enviar la solicitud?', message: 'Ya no podrás editarla.', confirmLabel: 'Enviar' };

    const conCancelar = dialogos.confirm(opciones);
    await actualizar();
    expect(boton('Enviar').classList).toContain('uki-button--primary');
    boton('Cancelar').click();
    await actualizar();
    await expect(conCancelar).resolves.toBe(false);

    const conCerrar = dialogos.confirm(opciones);
    await actualizar();
    document.querySelector<HTMLButtonElement>('.uki-modal__close')!.click();
    await actualizar();
    await expect(conCerrar).resolves.toBe(false);

    const conEsc = dialogos.confirm(opciones);
    await actualizar();
    document.querySelector('dialog')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await actualizar();
    await expect(conEsc).resolves.toBe(false);
  });

  it('inform() muestra un solo botón «Entendido» y se cumple al cerrarlo', async () => {
    const { dialogos, actualizar, boton } = await montar();
    const respuesta = dialogos.inform({ title: 'Requisitos', message: 'Ten a la mano tu identificación.' });
    await actualizar();
    expect(document.querySelectorAll('.uki-modal__footer button').length).toBe(1);
    expect(document.activeElement).toBe(boton('Entendido'));
    boton('Entendido').click();
    await actualizar();
    await expect(respuesta).resolves.toBeUndefined();
  });

  it('en el servidor no abre nada y confirm() responde false', async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: PLATFORM_ID, useValue: 'server' }],
    });
    const dialogos = TestBed.inject(UkiDialogService);
    await expect(dialogos.confirm({ title: 'x', message: 'y', confirmLabel: 'z' })).resolves.toBe(false);
    expect(document.querySelector('dialog')).toBeNull();
  });
});
