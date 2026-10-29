import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UkiField } from './field';
import { UkiInput } from './input';

@Component({
  imports: [UkiField, UkiInput, ReactiveFormsModule],
  template: `
    <form [formGroup]="formulario" (ngSubmit)="enviado = true">
      <uki-field label="Correo electrónico" helper="Te enviaremos el acuse." error="Escribe un correo válido.">
        <input ukiInput type="email" formControlName="correo" />
      </uki-field>
      <uki-field label="Motivo" [maxlength]="10" error="Usa máximo 10 caracteres.">
        <textarea ukiInput formControlName="motivo"></textarea>
      </uki-field>
      <button type="submit">Enviar</button>
    </form>
  `,
})
class ConFormulario {
  readonly formulario = new FormGroup({
    correo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    motivo: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(10)] }),
  });
  enviado = false;
}

@Component({
  imports: [UkiField, UkiInput, FormsModule],
  template: `
    <uki-field label="Nombre" [required]="true" [error]="error()">
      <input ukiInput id="propio" [(ngModel)]="nombre" name="nombre" />
    </uki-field>
    <uki-field label="Sin formulario" [error]="error()">
      <input ukiInput required />
    </uki-field>
  `,
})
class SinReactivos {
  nombre = '';
  readonly error = signal<string | undefined>(undefined);
}

async function montar<T>(tipo: new () => T) {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const fixture = TestBed.createComponent(tipo);
  await fixture.whenStable();
  const raiz: HTMLElement = fixture.nativeElement;
  return { fixture, raiz, anfitrion: fixture.componentInstance, actualizar: () => fixture.whenStable() };
}

const campos = (raiz: HTMLElement) => [...raiz.querySelectorAll<HTMLElement>('uki-field')];

describe('UkiField', () => {
  it('arma la etiqueta como UKI: texto, asterisco oculto a lectores y dos puntos', async () => {
    const { raiz } = await montar(ConFormulario);
    const etiqueta = campos(raiz)[0].querySelector('label')!;
    expect(etiqueta.textContent!.replace(/\s/g, '')).toBe('Correoelectrónico*:');
    expect(etiqueta.querySelector('.uki-field__asterisco')!.getAttribute('aria-hidden')).toBe('true');
    // Sin Validators.required no hay asterisco.
    expect(campos(raiz)[1].querySelector('.uki-field__asterisco')).toBeNull();
  });

  it('une la etiqueta con el control y la ayuda con aria-describedby', async () => {
    const { raiz } = await montar(ConFormulario);
    const campo = campos(raiz)[0];
    const control = campo.querySelector('input')!;
    expect(campo.querySelector('label')!.getAttribute('for')).toBe(control.id);
    const ayuda = campo.querySelector('.uki-field__mensaje')!;
    expect(ayuda.textContent!.trim()).toBe('Te enviaremos el acuse.');
    expect(control.getAttribute('aria-describedby')).toBe(ayuda.id);
    expect(control.getAttribute('aria-required')).toBe('true');
    expect(control.classList).toContain('uki-input');
  });

  it('no muestra el error hasta que el campo inválido se toca', async () => {
    const { raiz, actualizar } = await montar(ConFormulario);
    const campo = campos(raiz)[0];
    const control = campo.querySelector('input')!;
    expect(campo.querySelector('.uki-field__mensaje--error')).toBeNull();
    expect(control.hasAttribute('aria-invalid')).toBe(false);
    control.dispatchEvent(new FocusEvent('blur'));
    await actualizar();
    const error = campo.querySelector('.uki-field__mensaje--error')!;
    expect(error.textContent!.trim()).toBe('Escribe un correo válido.');
    expect(control.getAttribute('aria-invalid')).toBe('true');
    expect(control.getAttribute('aria-describedby')).toBe(error.id);
    // El error reemplaza a la ayuda.
    expect(campo.querySelectorAll('.uki-field__mensaje')).toHaveLength(1);
  });

  it('muestra el error al enviar aunque no se haya tocado el campo', async () => {
    const { raiz, actualizar } = await montar(ConFormulario);
    raiz.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await actualizar();
    expect(campos(raiz)[0].querySelector('.uki-field__mensaje--error')).not.toBeNull();
  });

  it('quita el error cuando el valor es válido', async () => {
    const { raiz, anfitrion, actualizar } = await montar(ConFormulario);
    anfitrion.formulario.controls.correo.markAsTouched();
    await actualizar();
    expect(campos(raiz)[0].querySelector('.uki-field__mensaje--error')).not.toBeNull();
    anfitrion.formulario.controls.correo.setValue('ana@banobras.gob.mx');
    await actualizar();
    expect(campos(raiz)[0].querySelector('.uki-field__mensaje--error')).toBeNull();
  });

  it('cuenta caracteres, se pone en error al pasar el límite y el contador entra en aria-describedby', async () => {
    const { raiz, anfitrion, actualizar } = await montar(ConFormulario);
    const campo = campos(raiz)[1];
    const textarea = campo.querySelector('textarea')!;
    expect(textarea.classList).toContain('uki-input--textarea');
    const contador = () => campo.querySelector('.uki-field__contador')!;
    expect(contador().textContent!.trim()).toBe('0/10');
    expect(textarea.getAttribute('aria-describedby')).toBe(contador().id);

    anfitrion.formulario.controls.motivo.setValue('12345678901');
    await actualizar();
    expect(contador().textContent!.trim()).toBe('11/10');
    expect(contador().classList).toContain('uki-field__contador--excedido');
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
    // Al pasar el límite el mensaje aparece sin esperar a que se toque el campo.
    expect(campo.querySelector('.uki-field__mensaje--error')!.textContent!.trim()).toBe('Usa máximo 10 caracteres.');
    // Límite flexible: el valor no se corta.
    expect(textarea.value).toBe('12345678901');
  });

  it('respeta disable() del control', async () => {
    const { raiz, anfitrion, actualizar } = await montar(ConFormulario);
    anfitrion.formulario.controls.correo.disable();
    await actualizar();
    expect(campos(raiz)[0].querySelector('input')!.disabled).toBe(true);
    expect(campos(raiz)[0].classList).toContain('uki-field--deshabilitado');
  });

  it('con ngModel conserva el id propio, marca requerido por entrada y sin formulario muestra el error tal cual', async () => {
    const { raiz, anfitrion, actualizar } = await montar(SinReactivos);
    const [conModelo, sinFormulario] = campos(raiz);
    const control = conModelo.querySelector('input')!;
    expect(control.id).toBe('propio');
    expect(conModelo.querySelector('label')!.getAttribute('for')).toBe('propio');
    expect(conModelo.querySelector('.uki-field__asterisco')).not.toBeNull();
    // El atributo required del input también cuenta como obligatorio.
    expect(sinFormulario.querySelector('.uki-field__asterisco')).not.toBeNull();

    anfitrion.error.set('Este dato es obligatorio.');
    await actualizar();
    expect(sinFormulario.querySelector('.uki-field__mensaje--error')).not.toBeNull();
    expect(sinFormulario.querySelector('input')!.getAttribute('aria-invalid')).toBe('true');
    // Con ngModel válido (sin validadores) no hay error aunque haya texto de error.
    expect(conModelo.querySelector('.uki-field__mensaje--error')).toBeNull();
  });
});
