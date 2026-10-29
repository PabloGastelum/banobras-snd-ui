import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { inicialesDe, UkiAvatar, UkiAvatarSize } from './avatar';

@Component({
  imports: [UkiAvatar],
  template: `
    <uki-avatar
      [name]="name()"
      [src]="src()"
      [size]="size()"
      [status]="status()"
      [decorative]="decorative()"
      [initials]="initials()"
    />
  `,
})
class Anfitrion {
  readonly name = signal('Mariana López Hernández');
  readonly src = signal<string | null>(null);
  readonly size = signal<UkiAvatarSize>('md');
  readonly status = signal(false);
  readonly decorative = signal(false);
  readonly initials = signal<string | undefined>(undefined);
}

async function montar() {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const fixture = TestBed.createComponent(Anfitrion);
  await fixture.whenStable();
  const avatar: HTMLElement = fixture.nativeElement.querySelector('uki-avatar');
  return { fixture, avatar, anfitrion: fixture.componentInstance, actualizar: () => fixture.whenStable() };
}

describe('inicialesDe', () => {
  it('toma las dos primeras palabras que no son partículas', () => {
    expect(inicialesDe('Mariana López Hernández')).toBe('ML');
    expect(inicialesDe('María de la Luz Pérez')).toBe('ML');
    expect(inicialesDe('  ángel  del  Río ')).toBe('ÁR');
    expect(inicialesDe('Banobras')).toBe('B');
    expect(inicialesDe('')).toBe('');
  });
});

describe('UkiAvatar', () => {
  it('es una imagen con el nombre como nombre accesible', async () => {
    const { avatar } = await montar();
    expect(avatar.getAttribute('role')).toBe('img');
    expect(avatar.getAttribute('aria-label')).toBe('Mariana López Hernández');
  });

  it('sin foto muestra las iniciales; con initials usa las fijas', async () => {
    const { avatar, anfitrion, actualizar } = await montar();
    expect(avatar.classList).toContain('uki-avatar--initials');
    expect(avatar.querySelector('.uki-avatar__initials')!.textContent).toBe('ML');
    anfitrion.initials.set('BN');
    await actualizar();
    expect(avatar.querySelector('.uki-avatar__initials')!.textContent).toBe('BN');
  });

  it('con foto muestra la imagen con alt vacío y vuelve a las iniciales si falla', async () => {
    const { avatar, anfitrion, actualizar } = await montar();
    anfitrion.src.set('/foto.jpg');
    await actualizar();
    const img = avatar.querySelector('img')!;
    expect(img.getAttribute('src')).toBe('/foto.jpg');
    expect(img.getAttribute('alt')).toBe('');
    expect(avatar.classList).not.toContain('uki-avatar--initials');
    img.dispatchEvent(new Event('error'));
    await actualizar();
    expect(avatar.querySelector('img')).toBeNull();
    expect(avatar.querySelector('.uki-avatar__initials')!.textContent).toBe('ML');
    // Otra foto vuelve a intentarlo.
    anfitrion.src.set('/otra.jpg');
    await actualizar();
    expect(avatar.querySelector('img')!.getAttribute('src')).toBe('/otra.jpg');
  });

  it('con status muestra el punto y lo agrega al nombre accesible', async () => {
    const { avatar, anfitrion, actualizar } = await montar();
    expect(avatar.querySelector('.uki-avatar__status')).toBeNull();
    anfitrion.status.set(true);
    await actualizar();
    expect(avatar.querySelector('.uki-avatar__status')!.getAttribute('aria-hidden')).toBe('true');
    expect(avatar.getAttribute('aria-label')).toBe('Mariana López Hernández, en línea');
  });

  it('decorative lo oculta a lectores de pantalla', async () => {
    const { avatar, anfitrion, actualizar } = await montar();
    anfitrion.decorative.set(true);
    await actualizar();
    expect(avatar.getAttribute('aria-hidden')).toBe('true');
    expect(avatar.getAttribute('role')).toBeNull();
    expect(avatar.getAttribute('aria-label')).toBeNull();
  });

  it('aplica la clase de cada tamaño; md no lleva clase', async () => {
    const { avatar, anfitrion, actualizar } = await montar();
    expect(avatar.className).not.toMatch(/uki-avatar--(xs|sm|lg|xl)/);
    for (const tamano of ['xs', 'sm', 'lg', 'xl'] as const) {
      anfitrion.size.set(tamano);
      await actualizar();
      expect(avatar.classList).toContain(`uki-avatar--${tamano}`);
    }
  });
});
