import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UkiSearch, UkiSearchSize } from './search';

@Component({
  imports: [UkiSearch, ReactiveFormsModule],
  template: `
    <uki-search
      [size]="size()"
      placeholder="Buscar por folio"
      ariaLabel="Buscar en la tabla"
      [resultados]="resultados()"
      [formControl]="control"
      (buscar)="busquedas.push($event)"
    />
  `,
})
class Anfitrion {
  readonly size = signal<UkiSearchSize>('default');
  readonly resultados = signal<number | null>(null);
  readonly control = new FormControl('', { nonNullable: true });
  readonly busquedas: string[] = [];
}

async function montar() {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const fixture = TestBed.createComponent(Anfitrion);
  await fixture.whenStable();
  const raiz: HTMLElement = fixture.nativeElement;
  const input = raiz.querySelector<HTMLInputElement>('input')!;
  const escribir = (texto: string) => {
    input.value = texto;
    input.dispatchEvent(new Event('input'));
  };
  return { fixture, raiz, input, escribir, anfitrion: fixture.componentInstance, actualizar: () => fixture.whenStable() };
}

describe('UkiSearch', () => {
  afterEach(() => vi.useRealTimers());

  it('es un input type=search dentro de role=search con su nombre accesible', async () => {
    const { raiz, input } = await montar();
    expect(raiz.querySelector('[role=search]')!.contains(input)).toBe(true);
    expect(input.type).toBe('search');
    expect(input.getAttribute('aria-label')).toBe('Buscar en la tabla');
    expect(input.placeholder).toBe('Buscar por folio');
  });

  it('emite 300 ms después de la última tecla y actualiza el control de inmediato', async () => {
    const { escribir, anfitrion } = await montar();
    // Relojes falsos después de montar: la detección de cambios sin zone.js también usa temporizadores.
    vi.useFakeTimers();
    escribir('Fer');
    escribir('Fernández');
    expect(anfitrion.control.value).toBe('Fernández');
    vi.advanceTimersByTime(299);
    expect(anfitrion.busquedas).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(anfitrion.busquedas).toEqual(['Fernández']);
  });

  it('Enter emite sin esperar', async () => {
    const { input, escribir, anfitrion } = await montar();
    vi.useFakeTimers();
    escribir('FON-2026');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(anfitrion.busquedas).toEqual(['FON-2026']);
    vi.advanceTimersByTime(400);
    expect(anfitrion.busquedas).toEqual(['FON-2026']);
  });

  it('el botón × solo aparece con texto, borra, emite vacío y devuelve el foco', async () => {
    const { raiz, input, escribir, anfitrion, actualizar } = await montar();
    expect(raiz.querySelector('.uki-search__borrar')).toBeNull();
    escribir('Fernández');
    await actualizar();
    const borrar = raiz.querySelector<HTMLButtonElement>('button[aria-label="Borrar búsqueda"]')!;
    borrar.click();
    await actualizar();
    expect(input.value).toBe('');
    expect(anfitrion.control.value).toBe('');
    expect(anfitrion.busquedas.at(-1)).toBe('');
    expect(document.activeElement).toBe(input);
    expect(raiz.querySelector('.uki-search__borrar')).toBeNull();
  });

  it('Esc borra la búsqueda y no se propaga; vacía deja pasar la tecla', async () => {
    const { input, escribir, anfitrion, actualizar } = await montar();
    escribir('Fernández');
    await actualizar();
    const esc = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    input.dispatchEvent(esc);
    await actualizar();
    expect(anfitrion.control.value).toBe('');
    expect(esc.defaultPrevented).toBe(true);
    const escVacia = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    input.dispatchEvent(escVacia);
    expect(escVacia.defaultPrevented).toBe(false);
  });

  it('anuncia el número de resultados', async () => {
    const { raiz, anfitrion, actualizar } = await montar();
    const anuncio = raiz.querySelector('[aria-live=polite]')!;
    expect(anuncio.textContent!.trim()).toBe('');
    anfitrion.resultados.set(12);
    await actualizar();
    expect(anuncio.textContent!.trim()).toBe('12 resultados');
    anfitrion.resultados.set(1);
    await actualizar();
    expect(anuncio.textContent!.trim()).toBe('1 resultado');
  });

  it('refleja el valor y el estado deshabilitado del control', async () => {
    const { raiz, input, anfitrion, actualizar } = await montar();
    anfitrion.control.setValue('previo');
    await actualizar();
    expect(input.value).toBe('previo');
    anfitrion.control.disable();
    await actualizar();
    expect(input.disabled).toBe(true);
    expect(raiz.querySelector('uki-search')!.classList).toContain('uki-search--deshabilitado');
    expect(raiz.querySelector('.uki-search__borrar')).toBeNull();
  });

  it('cambia de tamaño con la clase large', async () => {
    const { raiz, anfitrion, actualizar } = await montar();
    anfitrion.size.set('large');
    await actualizar();
    expect(raiz.querySelector('uki-search')!.classList).toContain('uki-search--large');
  });
});
