import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UkiCheckbox } from './checkbox';

@Component({
  imports: [UkiCheckbox, ReactiveFormsModule],
  template: `<uki-checkbox [formControl]="control">Acepto los términos</uki-checkbox>`,
})
class ConFormControl {
  readonly control = new FormControl(false, { nonNullable: true });
}

@Component({
  imports: [UkiCheckbox, FormsModule],
  template: `<uki-checkbox [(ngModel)]="valor">Recibir avisos</uki-checkbox>`,
})
class ConNgModel {
  valor = true;
}

@Component({
  imports: [UkiCheckbox],
  template: `
    <uki-checkbox [(checked)]="todas" [(indeterminate)]="algunas" ariaLabel="Seleccionar todas las filas" />
  `,
})
class ConModelos {
  readonly todas = signal(false);
  readonly algunas = signal(true);
}

async function montar<T>(tipo: new () => T) {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const fixture = TestBed.createComponent(tipo);
  await fixture.whenStable();
  const raiz: HTMLElement = fixture.nativeElement;
  return {
    fixture,
    anfitrion: fixture.componentInstance,
    casilla: raiz.querySelector<HTMLElement>('uki-checkbox')!,
    input: raiz.querySelector<HTMLInputElement>('input[type=checkbox]')!,
    etiqueta: raiz.querySelector<HTMLElement>('.uki-checkbox__label')!,
    actualizar: () => fixture.whenStable(),
  };
}

describe('UkiCheckbox', () => {
  describe('con FormControl', () => {
    it('refleja el valor del control', async () => {
      const { anfitrion, input, actualizar } = await montar(ConFormControl);
      expect(input.checked).toBe(false);
      anfitrion.control.setValue(true);
      await actualizar();
      expect(input.checked).toBe(true);
    });

    it('notifica al control cuando la persona hace clic', async () => {
      const { anfitrion, input, actualizar } = await montar(ConFormControl);
      input.click();
      await actualizar();
      expect(anfitrion.control.value).toBe(true);
      expect(anfitrion.control.dirty).toBe(true);
    });

    it('cambia el valor al hacer clic en el texto de la etiqueta', async () => {
      const { anfitrion, etiqueta, actualizar } = await montar(ConFormControl);
      expect(etiqueta.textContent!.trim()).toBe('Acepto los términos');
      etiqueta.click();
      await actualizar();
      expect(anfitrion.control.value).toBe(true);
    });

    it('marca touched al perder el foco', async () => {
      const { anfitrion, input } = await montar(ConFormControl);
      input.dispatchEvent(new FocusEvent('blur'));
      expect(anfitrion.control.touched).toBe(true);
    });

    it('respeta disable() del control', async () => {
      const { anfitrion, casilla, input, actualizar } = await montar(ConFormControl);
      anfitrion.control.disable();
      await actualizar();
      expect(input.disabled).toBe(true);
      expect(casilla.classList).toContain('uki-checkbox--disabled');
      anfitrion.control.enable();
      await actualizar();
      expect(input.disabled).toBe(false);
    });
  });

  describe('con ngModel', () => {
    it('lee y escribe el valor', async () => {
      const { anfitrion, input, actualizar } = await montar(ConNgModel);
      await actualizar();
      expect(input.checked).toBe(true);
      input.click();
      await actualizar();
      expect(anfitrion.valor).toBe(false);
    });
  });

  describe('con [(checked)] e indeterminate', () => {
    it('muestra el estado mixto en el input nativo', async () => {
      const { input, casilla } = await montar(ConModelos);
      expect(input.indeterminate).toBe(true);
      expect(casilla.querySelector('.uki-checkbox__icon path')!.getAttribute('d')).toBe('M3 8h10');
    });

    it('al hacer clic apaga indeterminate y marca la casilla', async () => {
      const { anfitrion, input, actualizar } = await montar(ConModelos);
      input.click();
      await actualizar();
      expect(anfitrion.algunas()).toBe(false);
      expect(anfitrion.todas()).toBe(true);
      expect(input.indeterminate).toBe(false);
    });

    it('usa ariaLabel como nombre accesible sin etiqueta visible', async () => {
      const { input } = await montar(ConModelos);
      expect(input.getAttribute('aria-label')).toBe('Seleccionar todas las filas');
    });
  });
});
