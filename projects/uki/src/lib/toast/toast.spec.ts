import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RETRASO_ANUNCIO_MS, SALIDA_MS } from './toast-region';
import { UkiToastService } from './toast.service';

function montar() {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const avisos = TestBed.inject(UkiToastService);
  const appRef = TestBed.inject(ApplicationRef);
  // Relojes falsos después de crear el servicio; la detección de cambios se corre a mano con tick().
  vi.useFakeTimers();
  const pintar = () => appRef.tick();
  const avanzar = (ms: number) => {
    vi.advanceTimersByTime(ms);
    pintar();
  };
  const toast = () => document.querySelector<HTMLElement>('.uki-toast');
  const anuncio = (rol: 'status' | 'alert') =>
    document.querySelector<HTMLElement>(`.uki-toast-region [role="${rol}"]`)!.textContent!.trim();
  return { avisos, pintar, avanzar, toast, anuncio };
}

describe('UkiToastService', () => {
  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
    document.body.replaceChildren();
  });

  it('crea una sola región al final de <body> con las dos regiones vivas', () => {
    const { avisos, pintar } = montar();
    expect(document.querySelector('uki-toast-region')).toBeNull();
    avisos.success('Solicitud enviada');
    avisos.info('Copiado');
    pintar();
    const regiones = document.querySelectorAll('uki-toast-region');
    expect(regiones.length).toBe(1);
    expect(document.body.lastElementChild).toBe(regiones[0]);
    expect(regiones[0].querySelector('[role="status"]')).not.toBeNull();
    expect(regiones[0].querySelector('[role="alert"]')).not.toBeNull();
  });

  it('muestra título, descripción, ícono y botón «Cerrar aviso»; el aviso visible no es región viva', () => {
    const { avisos, pintar, toast } = montar();
    avisos.success('Solicitud enviada', 'Te enviamos el acuse por correo.');
    pintar();
    expect(toast()!.classList).toContain('uki-toast--success');
    expect(toast()!.getAttribute('role')).toBeNull();
    expect(toast()!.querySelector('.uki-toast__title')!.textContent).toBe('Solicitud enviada');
    expect(toast()!.querySelector('.uki-toast__description')!.textContent).toBe('Te enviamos el acuse por correo.');
    expect(toast()!.querySelector('.uki-toast__icon')!.getAttribute('aria-hidden')).toBe('true');
    expect(toast()!.querySelector('button')!.getAttribute('aria-label')).toBe('Cerrar aviso');
  });

  it('anuncia a los 100 ms en status (Success, Info, Warning) o en alert (Error)', () => {
    const { avisos, pintar, avanzar, anuncio } = montar();
    avisos.success('Solicitud enviada', 'Te enviamos el acuse por correo.');
    pintar();
    expect(anuncio('status')).toBe('');
    avanzar(RETRASO_ANUNCIO_MS);
    expect(anuncio('status')).toBe('Solicitud enviada. Te enviamos el acuse por correo.');
    expect(anuncio('alert')).toBe('');

    avisos.error('No se pudo enviar');
    pintar();
    expect(anuncio('status')).toBe('');
    avanzar(RETRASO_ANUNCIO_MS);
    expect(anuncio('alert')).toBe('No se pudo enviar');
    expect(anuncio('status')).toBe('');
  });

  it('no mueve el foco', () => {
    const { avisos, pintar } = montar();
    const campo = document.body.appendChild(document.createElement('input'));
    campo.focus();
    avisos.error('No se pudo enviar');
    pintar();
    expect(document.activeElement).toBe(campo);
  });

  it('Success e Info se cierran a los 5 s; Warning y Error se quedan con botón de cerrar', async () => {
    const { avisos, avanzar, toast } = montar();
    const ref = avisos.info('Copiado');
    avanzar(4999);
    expect(toast()).not.toBeNull();
    avanzar(1);
    expect(toast()!.classList).toContain('uki-toast--saliendo');
    avanzar(SALIDA_MS);
    expect(toast()).toBeNull();
    await expect(ref.closed).resolves.toBeUndefined();

    avisos.show({ type: 'warning', title: 'Tu sesión vence pronto', dismissible: false });
    avanzar(60_000);
    expect(toast()!.classList).toContain('uki-toast--warning');
    expect(toast()!.querySelector('.uki-toast__close')).not.toBeNull();
  });

  it('duration cambia el tiempo; null lo deja hasta cerrarlo', () => {
    const { avisos, avanzar, toast } = montar();
    avisos.show({ title: 'Guardado', duration: 1000 });
    avanzar(1000 + SALIDA_MS);
    expect(toast()).toBeNull();
    avisos.show({ title: 'Guardado', duration: null });
    avanzar(60_000);
    expect(toast()).not.toBeNull();
  });

  it('se pausa con el puntero encima o el foco dentro y sigue con el tiempo que quedaba', () => {
    const { avisos, pintar, avanzar, toast } = montar();
    avisos.success('Solicitud enviada');
    pintar();
    avanzar(3000);
    toast()!.dispatchEvent(new MouseEvent('mouseenter'));
    avanzar(10_000);
    expect(toast()!.classList).not.toContain('uki-toast--saliendo');
    toast()!.dispatchEvent(new MouseEvent('mouseleave'));
    avanzar(1999);
    expect(toast()!.classList).not.toContain('uki-toast--saliendo');

    toast()!.querySelector('button')!.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    avanzar(10_000);
    expect(toast()!.classList).not.toContain('uki-toast--saliendo');
    toast()!.querySelector('button')!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    avanzar(1);
    expect(toast()!.classList).toContain('uki-toast--saliendo');
  });

  it('uno a la vez: el nuevo reemplaza al visible y cumple closed del anterior', async () => {
    const { avisos, pintar, toast } = montar();
    const primero = avisos.success('Guardado');
    avisos.error('No se pudo enviar');
    pintar();
    expect(document.querySelectorAll('.uki-toast').length).toBe(1);
    expect(toast()!.classList).toContain('uki-toast--error');
    await expect(primero.closed).resolves.toBeUndefined();
  });

  it('se cierra con close(), con el botón y con Esc dentro', async () => {
    const { avisos, pintar, avanzar, toast } = montar();
    const ref = avisos.error('No se pudo enviar');
    pintar();
    ref.close();
    avanzar(SALIDA_MS);
    expect(toast()).toBeNull();
    await expect(ref.closed).resolves.toBeUndefined();

    avisos.warning('Revisa los datos');
    pintar();
    toast()!.querySelector<HTMLButtonElement>('.uki-toast__close')!.click();
    avanzar(SALIDA_MS);
    expect(toast()).toBeNull();

    avisos.warning('Revisa los datos');
    pintar();
    toast()!.querySelector('button')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    avanzar(SALIDA_MS);
    expect(toast()).toBeNull();
  });

  it('icon y dismissible se pueden apagar en Success e Info', () => {
    const { avisos, pintar, toast } = montar();
    avisos.show({ type: 'info', title: 'Copiado', icon: false, dismissible: false });
    pintar();
    expect(toast()!.querySelector('.uki-toast__icon')).toBeNull();
    expect(toast()!.querySelector('button')).toBeNull();
  });

  it('al destruir la aplicación quita la región', () => {
    const { avisos, pintar } = montar();
    avisos.success('Guardado');
    pintar();
    TestBed.resetTestingModule();
    expect(document.querySelector('uki-toast-region')).toBeNull();
  });
});
