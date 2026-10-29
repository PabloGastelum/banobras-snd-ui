import { DestroyRef, inject, Injectable, signal } from '@angular/core';

export type EstadoCopia = 'listo' | 'copiado' | 'error';

/**
 * La API del portapapeles exige que la página tenga el foco (falla, por ejemplo, dentro de un iframe sin permiso);
 * en ese caso se usa la copia clásica con una selección temporal.
 */
async function escribir(texto: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(texto);
    return;
  } catch {
    const area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    const foco = document.activeElement as HTMLElement | null;
    document.body.append(area);
    area.select();
    const copiado = document.execCommand('copy');
    area.remove();
    foco?.focus({ preventScroll: true });
    if (!copiado) throw new Error('Sin acceso al portapapeles');
  }
}

/**
 * Copia texto al portapapeles y recuerda qué se copió durante 2 s para que el botón muestre «Copiado».
 * Cada botón se identifica con una clave; el aviso para lectores de pantalla vive en `anuncio`.
 */
@Injectable({ providedIn: 'root' })
export class Portapapeles {
  private readonly ultimo = signal<{ clave: string; estado: EstadoCopia } | null>(null);
  readonly anuncio = signal('');
  private temporizador?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizador));
  }

  estado(clave: string): EstadoCopia {
    const ultimo = this.ultimo();
    return ultimo?.clave === clave ? ultimo.estado : 'listo';
  }

  async copiar(texto: string, clave: string, descripcion = 'Código'): Promise<void> {
    let estado: EstadoCopia;
    try {
      await escribir(texto);
      estado = 'copiado';
      this.anuncio.set(`${descripcion} copiado al portapapeles`);
    } catch {
      estado = 'error';
      this.anuncio.set('No se pudo copiar. Selecciona el texto y cópialo con el teclado.');
    }
    this.ultimo.set({ clave, estado });
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => {
      this.ultimo.set(null);
      this.anuncio.set('');
    }, 2000);
  }
}
