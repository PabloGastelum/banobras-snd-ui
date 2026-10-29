import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UkiSelect, UkiSelectOption } from './select';

const TRAMITES: UkiSelectOption<string>[] = [
  { value: 'alta', label: 'Alta de proyecto' },
  { value: 'baja', label: 'Baja de proyecto' },
  { value: 'cambio', label: 'Cambio de responsable' },
  { value: 'consulta', label: 'Consulta de saldo', disabled: true },
  { value: 'estado', label: 'Estado de cuenta' },
  { value: 'rev', label: 'Revisión técnica' },
];

@Component({
  imports: [UkiSelect, ReactiveFormsModule],
  template: `
    <uki-select
      label="Tipo de trámite"
      [options]="opciones"
      [formControl]="control"
      helper="Elige el más parecido."
      error="Elige un tipo de trámite."
    />
    <button type="button" id="fuera">Fuera</button>
  `,
})
class ConFormControl {
  readonly opciones = TRAMITES;
  readonly control = new FormControl<string | null>(null, Validators.required);
}

@Component({
  imports: [UkiSelect, FormsModule],
  template: `<uki-select label="Estado" [options]="opciones" [(ngModel)]="valor" name="estado" />`,
})
class ConNgModel {
  readonly opciones = TRAMITES;
  valor: string | null = 'cambio';
}

async function montar<T>(tipo: new () => T) {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const fixture = TestBed.createComponent(tipo);
  await fixture.whenStable();
  const raiz: HTMLElement = fixture.nativeElement;
  const combo = raiz.querySelector<HTMLButtonElement>('[role=combobox]')!;
  const actualizar = () => fixture.whenStable();
  const tecla = async (key: string, extra: KeyboardEventInit = {}) => {
    const evento = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extra });
    combo.dispatchEvent(evento);
    await actualizar();
    return evento;
  };
  const lista = () => raiz.querySelector<HTMLElement>('[role=listbox]');
  const activa = () => {
    const id = combo.getAttribute('aria-activedescendant');
    return id ? raiz.querySelector(`[id="${id}"]`)!.textContent!.trim() : null;
  };
  return { fixture, raiz, combo, tecla, lista, activa, actualizar, anfitrion: fixture.componentInstance };
}

describe('UkiSelect', () => {
  it('es un combobox con etiqueta, placeholder y lista cerrada', async () => {
    const { raiz, combo, lista } = await montar(ConFormControl);
    const etiqueta = raiz.querySelector('.uki-field__label')!;
    expect(combo.getAttribute('aria-labelledby')).toBe(etiqueta.id);
    expect(etiqueta.textContent!.replace(/\s/g, '')).toBe('Tipodetrámite*:');
    expect(combo.getAttribute('aria-haspopup')).toBe('listbox');
    expect(combo.getAttribute('aria-expanded')).toBe('false');
    expect(combo.getAttribute('aria-required')).toBe('true');
    expect(combo.textContent!.trim()).toBe('Selecciona una opción');
    expect(lista()).toBeNull();
  });

  it('abre con clic y elige con clic; cierra y marca la opción', async () => {
    const { raiz, combo, lista, actualizar, anfitrion } = await montar(ConFormControl);
    combo.click();
    await actualizar();
    expect(combo.getAttribute('aria-expanded')).toBe('true');
    expect(combo.getAttribute('aria-controls')).toBe(lista()!.id);
    const opciones = [...raiz.querySelectorAll<HTMLElement>('[role=option]')];
    expect(opciones).toHaveLength(6);
    opciones[2].click();
    await actualizar();
    expect(anfitrion.control.value).toBe('cambio');
    expect(lista()).toBeNull();
    expect(combo.textContent!.trim()).toBe('Cambio de responsable');
    combo.click();
    await actualizar();
    const elegida = raiz.querySelector('[role=option][aria-selected=true]')!;
    expect(elegida.textContent!.trim()).toBe('Cambio de responsable');
    expect(elegida.querySelector('uki-icono')).not.toBeNull();
  });

  it('una opción deshabilitada no se elige', async () => {
    const { raiz, combo, actualizar, anfitrion } = await montar(ConFormControl);
    combo.click();
    await actualizar();
    const deshabilitada = raiz.querySelectorAll<HTMLElement>('[role=option]')[3];
    expect(deshabilitada.getAttribute('aria-disabled')).toBe('true');
    deshabilitada.click();
    await actualizar();
    expect(anfitrion.control.value).toBeNull();
  });

  it('teclado cerrado: ↓, Enter y Espacio abren en la primera; Inicio y Fin abren en los extremos', async () => {
    const { tecla, activa, combo } = await montar(ConFormControl);
    for (const key of ['ArrowDown', 'Enter', ' ']) {
      const evento = await tecla(key);
      expect(evento.defaultPrevented).toBe(true);
      expect(combo.getAttribute('aria-expanded')).toBe('true');
      expect(activa()).toBe('Alta de proyecto');
      await tecla('Escape');
    }
    await tecla('End');
    expect(activa()).toBe('Revisión técnica');
    await tecla('Escape');
    await tecla('Home');
    expect(activa()).toBe('Alta de proyecto');
  });

  it('teclado abierto: ↑/↓ mueven saltando deshabilitadas, sin dar la vuelta; Enter elige y cierra', async () => {
    const { tecla, activa, combo, anfitrion } = await montar(ConFormControl);
    await tecla('ArrowDown');
    await tecla('ArrowDown');
    await tecla('ArrowDown');
    expect(activa()).toBe('Cambio de responsable');
    await tecla('ArrowDown');
    expect(activa()).toBe('Estado de cuenta');
    await tecla('ArrowDown');
    await tecla('ArrowDown');
    expect(activa()).toBe('Revisión técnica');
    await tecla('ArrowUp');
    expect(activa()).toBe('Estado de cuenta');
    await tecla('Enter');
    expect(anfitrion.control.value).toBe('estado');
    expect(combo.getAttribute('aria-expanded')).toBe('false');
    expect(combo.hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('Esc cierra sin cambiar y no propaga; Tab elige la activa', async () => {
    const { tecla, combo, anfitrion } = await montar(ConFormControl);
    await tecla('ArrowDown');
    await tecla('ArrowDown');
    const esc = await tecla('Escape');
    expect(esc.defaultPrevented).toBe(true);
    expect(combo.getAttribute('aria-expanded')).toBe('false');
    expect(anfitrion.control.value).toBeNull();
    await tecla('ArrowDown');
    await tecla('ArrowDown');
    const tab = await tecla('Tab');
    expect(tab.defaultPrevented).toBe(false);
    expect(anfitrion.control.value).toBe('baja');
  });

  it('una letra salta a la siguiente opción que empieza con ella, sin acentos ni mayúsculas', async () => {
    const { tecla, activa } = await montar(ConFormControl);
    await tecla('c');
    // «Consulta de saldo» está deshabilitada: se salta.
    expect(activa()).toBe('Cambio de responsable');
    // Pasados 500 ms la siguiente letra empieza una búsqueda nueva.
    await new Promise((r) => setTimeout(r, 550));
    await tecla('r');
    expect(activa()).toBe('Revisión técnica');
    await new Promise((r) => setTimeout(r, 550));
    await tecla('a');
    // Da la vuelta al llegar al final.
    expect(activa()).toBe('Alta de proyecto');
  });

  it('varias letras seguidas buscan el prefijo', async () => {
    const { tecla, activa } = await montar(ConFormControl);
    await tecla('b');
    expect(activa()).toBe('Baja de proyecto');
    await tecla('ArrowUp');
    await tecla('e');
    await tecla('s');
    expect(activa()).toBe('Estado de cuenta');
  });

  it('al perder el foco cierra, marca touched y muestra el error si sigue vacío', async () => {
    const { raiz, combo, actualizar, anfitrion } = await montar(ConFormControl);
    combo.click();
    await actualizar();
    combo.dispatchEvent(new FocusEvent('blur'));
    await actualizar();
    expect(combo.getAttribute('aria-expanded')).toBe('false');
    expect(anfitrion.control.touched).toBe(true);
    const error = raiz.querySelector('.uki-field__mensaje--error')!;
    expect(error.textContent!.trim()).toBe('Elige un tipo de trámite.');
    expect(combo.getAttribute('aria-invalid')).toBe('true');
    expect(combo.getAttribute('aria-describedby')).toBe(error.id);
  });

  it('respeta disable() del control', async () => {
    const { combo, actualizar, anfitrion } = await montar(ConFormControl);
    anfitrion.control.disable();
    await actualizar();
    expect(combo.disabled).toBe(true);
  });

  it('con ngModel muestra el valor inicial y escribe el elegido', async () => {
    const { fixture, combo, tecla, actualizar } = await montar(ConNgModel);
    await actualizar();
    expect(combo.textContent!.trim()).toBe('Cambio de responsable');
    // Abre en la opción elegida.
    await tecla('ArrowDown');
    await tecla('ArrowDown');
    await tecla('Enter');
    expect(fixture.componentInstance.valor).toBe('estado');
  });
});
