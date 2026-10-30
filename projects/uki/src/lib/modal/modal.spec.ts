import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UkiButton } from '../button/button';
import { matchMediaFalso, polyfillDialogo } from '../pruebas/jsdom';
import { UkiToastService } from '../toast/toast.service';
import { UkiModal, UkiModalClose, UkiModalCloseReason, UkiModalFocus, UkiModalFooter } from './modal';
import { CLASE_SIN_SCROLL } from './modal-pila';

@Component({
  imports: [UkiModal, UkiModalFooter, UkiModalClose, UkiModalFocus, UkiButton],
  template: `
    <button type="button" id="disparador" (click)="abierto.set(true)">Abrir</button>
    <uki-modal
      [(open)]="abierto"
      title="¿Eliminar el trámite?"
      [type]="tipo()"
      [closeOnEsc]="conEsc()"
      [closeOnBackdrop]="conVelo()"
      (closed)="motivos.push($event)"
    >
      <p>Se eliminarán todos los elementos del trámite.</p>
      @if (conCampo()) {
        <input id="campo" ukiModalFocus aria-label="Motivo" />
      }
      <div ukiModalFooter>
        <button ukiButton variant="secondary" type="button" id="cancelar" ukiModalClose>Cancelar</button>
        <button ukiButton type="button" id="eliminar">Eliminar</button>
      </div>
    </uki-modal>
    <uki-modal [(open)]="segundo" title="Segundo" type="confirmation">
      <div ukiModalFooter><button ukiButton type="button" id="dentro-segundo">Aceptar</button></div>
    </uki-modal>
  `,
})
class Anfitrion {
  readonly abierto = signal(false);
  readonly segundo = signal(false);
  readonly tipo = signal<'informative' | 'confirmation'>('confirmation');
  readonly conEsc = signal(true);
  readonly conVelo = signal(false);
  readonly conCampo = signal(false);
  readonly motivos: UkiModalCloseReason[] = [];
}

async function montar() {
  polyfillDialogo();
  // Sin animación: la salida dura 0 ms.
  matchMediaFalso(true);
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const fixture = TestBed.createComponent(Anfitrion);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const raiz: HTMLElement = fixture.nativeElement;
  const anfitrion = fixture.componentInstance;
  const dialogos = () => raiz.querySelectorAll<HTMLDialogElement>('dialog');
  const dialogo = () => dialogos()[0];
  const actualizar = async () => {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  };
  const abrir = async () => {
    const disparador = raiz.querySelector<HTMLButtonElement>('#disparador')!;
    disparador.focus();
    disparador.click();
    await actualizar();
  };
  const tecla = async (destino: Element, key: string, extra: KeyboardEventInit = {}) => {
    const evento = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extra });
    destino.dispatchEvent(evento);
    await actualizar();
    return evento;
  };
  const enfocado = () => document.activeElement as HTMLElement;
  return { fixture, raiz, anfitrion, dialogo, dialogos, abrir, tecla, actualizar, enfocado };
}

describe('UkiModal', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    document.body.replaceChildren();
    document.documentElement.classList.remove(CLASE_SIN_SCROLL);
  });

  it('abre con [(open)] como diálogo modal con título, descripción y bloqueo del scroll', async () => {
    const { abrir, dialogo } = await montar();
    expect(dialogo().open).toBe(false);
    await abrir();
    const d = dialogo();
    expect(d.open).toBe(true);
    expect(d.getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById(d.getAttribute('aria-labelledby')!)!.textContent).toBe('¿Eliminar el trámite?');
    expect(document.getElementById(d.getAttribute('aria-describedby')!)!.textContent).toContain('Se eliminarán');
    expect(d.querySelector('h2')!.textContent).toBe('¿Eliminar el trámite?');
    expect(d.querySelector('.uki-modal__close')!.getAttribute('aria-label')).toBe('Cerrar');
    expect(document.documentElement.classList).toContain(CLASE_SIN_SCROLL);
  });

  it('en Confirmation enfoca Cancelar; en Informative, el botón principal; ukiModalFocus gana', async () => {
    const { abrir, anfitrion, enfocado, tecla, dialogo, actualizar } = await montar();
    await abrir();
    expect(enfocado().id).toBe('cancelar');
    await tecla(dialogo(), 'Escape');

    anfitrion.tipo.set('informative');
    await actualizar();
    await abrir();
    expect(enfocado().id).toBe('eliminar');
    await tecla(dialogo(), 'Escape');

    anfitrion.conCampo.set(true);
    await actualizar();
    await abrir();
    expect(enfocado().id).toBe('campo');
  });

  it('Tab y Mayús+Tab dan la vuelta dentro del modal', async () => {
    const { abrir, raiz, tecla, enfocado } = await montar();
    await abrir();
    const eliminar = raiz.querySelector<HTMLElement>('#eliminar')!;
    eliminar.focus();
    const adelante = await tecla(eliminar, 'Tab');
    expect(adelante.defaultPrevented).toBe(true);
    expect(enfocado().classList).toContain('uki-modal__close');
    const atras = await tecla(enfocado(), 'Tab', { shiftKey: true });
    expect(atras.defaultPrevented).toBe(true);
    expect(enfocado().id).toBe('eliminar');
    // En medio, Tab sigue su camino normal.
    const cancelar = raiz.querySelector<HTMLElement>('#cancelar')!;
    cancelar.focus();
    expect((await tecla(cancelar, 'Tab')).defaultPrevented).toBe(false);
  });

  it('Esc cierra, emite el motivo y devuelve el foco al disparador', async () => {
    const { abrir, dialogo, tecla, anfitrion, enfocado } = await montar();
    await abrir();
    const evento = await tecla(dialogo(), 'Escape');
    expect(evento.defaultPrevented).toBe(true);
    expect(dialogo().open).toBe(false);
    expect(anfitrion.abierto()).toBe(false);
    expect(anfitrion.motivos).toEqual(['escape']);
    expect(enfocado().id).toBe('disparador');
    expect(document.documentElement.classList).not.toContain(CLASE_SIN_SCROLL);
  });

  it('con closeOnEsc apagado, Esc no cierra; cancel nativo tampoco', async () => {
    const { abrir, dialogo, tecla, anfitrion, actualizar } = await montar();
    anfitrion.conEsc.set(false);
    await abrir();
    await tecla(dialogo(), 'Escape');
    const cancelar = new Event('cancel', { cancelable: true });
    dialogo().dispatchEvent(cancelar);
    await actualizar();
    expect(cancelar.defaultPrevented).toBe(true);
    expect(dialogo().open).toBe(true);
  });

  it('× cierra con «close» y ukiModalClose con «action»', async () => {
    const { abrir, raiz, dialogo, anfitrion, actualizar } = await montar();
    await abrir();
    raiz.querySelector<HTMLButtonElement>('.uki-modal__close')!.click();
    await actualizar();
    expect(dialogo().open).toBe(false);
    await abrir();
    raiz.querySelector<HTMLButtonElement>('#cancelar')!.click();
    await actualizar();
    expect(dialogo().open).toBe(false);
    expect(anfitrion.motivos).toEqual(['close', 'action']);
  });

  it('el clic en el velo no cierra por omisión; con closeOnBackdrop sí, y un clic en el panel nunca', async () => {
    const { abrir, dialogo, raiz, anfitrion, actualizar } = await montar();
    const clicEn = async (destino: Element) => {
      destino.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      destino.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await actualizar();
    };
    await abrir();
    await clicEn(dialogo());
    expect(dialogo().open).toBe(true);
    anfitrion.conVelo.set(true);
    await actualizar();
    await clicEn(raiz.querySelector('.uki-modal__panel')!);
    expect(dialogo().open).toBe(true);
    await clicEn(dialogo());
    expect(dialogo().open).toBe(false);
    expect(anfitrion.motivos).toEqual(['backdrop']);
  });

  it('con dos modales apilados, Esc cierra solo el de arriba y el foco vuelve al de abajo', async () => {
    const { abrir, dialogos, tecla, anfitrion, actualizar, enfocado } = await montar();
    await abrir();
    anfitrion.segundo.set(true);
    await actualizar();
    expect(enfocado().id).toBe('dentro-segundo');
    await tecla(enfocado(), 'Escape');
    expect(dialogos()[1].open).toBe(false);
    expect(dialogos()[0].open).toBe(true);
    expect(enfocado().id).toBe('cancelar');
    expect(document.documentElement.classList).toContain(CLASE_SIN_SCROLL);
  });

  it('la región de avisos de Toast se mueve dentro del modal abierto y vuelve a <body> al cerrarlo', async () => {
    const { abrir, dialogo, tecla } = await montar();
    const avisos = TestBed.inject(UkiToastService);
    avisos.info('Copiado');
    const region = document.querySelector('uki-toast-region')!;
    expect(region.parentElement).toBe(document.body);
    const status = region.querySelector('[role="status"]');
    await abrir();
    expect(region.parentElement).toBe(dialogo());
    await tecla(dialogo(), 'Escape');
    expect(region.parentElement).toBe(document.body);
    // Las regiones vivas son las mismas: no se crean de nuevo.
    expect(region.querySelector('[role="status"]')).toBe(status);
  });
});
