import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterLink } from '@angular/router';
import { UkiButton, UkiButtonSize, UkiButtonVariant } from './button';

@Component({ template: '' })
class Vacio {}

@Component({
  imports: [UkiButton, RouterLink],
  template: `
    <form (submit)="enviado = enviado + 1; $event.preventDefault()">
      <button
        ukiButton
        id="boton"
        type="submit"
        [variant]="variant()"
        [size]="size()"
        [loading]="loading()"
        [disabled]="disabled()"
        (click)="clics = clics + 1"
      >
        <svg ukiButtonLeading id="inicial"></svg>
        Guardar
        <svg ukiButtonTrailing id="final"></svg>
      </button>
    </form>
    <a ukiButton id="liga" routerLink="/destino" [disabled]="disabled()" (click)="clicsLiga = clicsLiga + 1">Ir</a>
  `,
})
class Anfitrion {
  readonly variant = signal<UkiButtonVariant>('primary');
  readonly size = signal<UkiButtonSize>('default');
  readonly loading = signal(false);
  readonly disabled = signal(false);
  clics = 0;
  clicsLiga = 0;
  enviado = 0;
}

async function montar() {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), provideRouter([{ path: 'destino', component: Vacio }])],
  });
  const fixture = TestBed.createComponent(Anfitrion);
  await fixture.whenStable();
  const raiz: HTMLElement = fixture.nativeElement;
  const boton = raiz.querySelector<HTMLButtonElement>('#boton')!;
  const liga = raiz.querySelector<HTMLAnchorElement>('#liga')!;
  const anfitrion = fixture.componentInstance;
  const actualizar = () => fixture.whenStable();
  return { fixture, boton, liga, anfitrion, actualizar };
}

describe('UkiButton', () => {
  it('es primary y default por omisión', async () => {
    const { boton } = await montar();
    expect(boton.classList).toContain('uki-button');
    expect(boton.classList).toContain('uki-button--primary');
    expect(boton.classList).not.toContain('uki-button--large');
  });

  it('aplica la clase de cada variante y tamaño', async () => {
    const { boton, anfitrion, actualizar } = await montar();
    for (const variante of ['secondary', 'ghost', 'danger'] as const) {
      anfitrion.variant.set(variante);
      await actualizar();
      expect(boton.classList).toContain(`uki-button--${variante}`);
      expect(boton.classList).not.toContain('uki-button--primary');
    }
    anfitrion.size.set('large');
    await actualizar();
    expect(boton.classList).toContain('uki-button--large');
  });

  it('proyecta el texto y los íconos inicial y final en orden', async () => {
    const { boton } = await montar();
    const hijos = [...boton.children].map((h) => h.id || h.className);
    expect(hijos).toEqual(['inicial', 'uki-button__label', 'final']);
    expect(boton.querySelector('.uki-button__label')!.textContent!.trim()).toBe('Guardar');
  });

  it('disabled en <button> usa el atributo nativo', async () => {
    const { boton, anfitrion, actualizar } = await montar();
    anfitrion.disabled.set(true);
    await actualizar();
    expect(boton.disabled).toBe(true);
    expect(boton.classList).toContain('uki-button--disabled');
    expect(boton.hasAttribute('aria-disabled')).toBe(false);
  });

  it('disabled en <a> marca aria-disabled, lo saca del tabulador y no navega', async () => {
    const { liga, anfitrion, actualizar } = await montar();
    const router = TestBed.inject(Router);
    anfitrion.disabled.set(true);
    await actualizar();
    expect(liga.getAttribute('aria-disabled')).toBe('true');
    expect(liga.getAttribute('tabindex')).toBe('-1');
    liga.click();
    await actualizar();
    expect(anfitrion.clicsLiga).toBe(0);
    expect(router.url).toBe('/');
  });

  it('la liga habilitada navega', async () => {
    const { liga, actualizar } = await montar();
    const router = TestBed.inject(Router);
    liga.click();
    await actualizar();
    expect(router.url).toBe('/destino');
  });

  it('loading muestra el spinner, marca aria-busy e ignora clics y envíos sin quitar el foco', async () => {
    const { boton, anfitrion, actualizar } = await montar();
    anfitrion.loading.set(true);
    await actualizar();
    expect(boton.classList).toContain('uki-button--loading');
    expect(boton.getAttribute('aria-busy')).toBe('true');
    expect(boton.getAttribute('aria-disabled')).toBe('true');
    expect(boton.disabled).toBe(false);
    expect(boton.querySelector('uki-spinner')).not.toBeNull();
    boton.click();
    await actualizar();
    expect(anfitrion.clics).toBe(0);
    expect(anfitrion.enviado).toBe(0);
  });

  it('sin loading, el clic llega al consumidor y envía el formulario', async () => {
    const { boton, anfitrion, actualizar } = await montar();
    boton.click();
    await actualizar();
    expect(anfitrion.clics).toBe(1);
    expect(anfitrion.enviado).toBe(1);
  });

  it('ghost ignora loading y avisa en consola', async () => {
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { boton, anfitrion, actualizar } = await montar();
    anfitrion.variant.set('ghost');
    anfitrion.loading.set(true);
    await actualizar();
    expect(boton.classList).not.toContain('uki-button--loading');
    expect(boton.querySelector('uki-spinner')).toBeNull();
    expect(aviso).toHaveBeenCalledWith(expect.stringContaining('ghost'));
    aviso.mockRestore();
  });

  it('disabled tiene prioridad sobre loading', async () => {
    const { boton, anfitrion, actualizar } = await montar();
    anfitrion.loading.set(true);
    anfitrion.disabled.set(true);
    await actualizar();
    expect(boton.classList).not.toContain('uki-button--loading');
    expect(boton.disabled).toBe(true);
  });
});
