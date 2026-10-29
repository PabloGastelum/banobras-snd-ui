import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';
import { Tema } from './tokens';

const CLAVE = 'uki-demo-tema';

function leerGuardado(): Tema {
  try {
    return localStorage.getItem(CLAVE) === 'Verde' ? 'Verde' : 'Guinda';
  } catch {
    return 'Guinda';
  }
}

/**
 * Tema de la documentación. Guinda es el de :root; Verde se activa con data-uki-theme="verde" en <html>, igual que en
 * cualquier aplicación que use @banobras/uki. La elección se recuerda en este navegador.
 */
@Injectable({ providedIn: 'root' })
export class TemaDoc {
  readonly actual = signal<Tema>(leerGuardado());
  private readonly documento = inject(DOCUMENT);
  private readonly raiz = this.documento.documentElement;

  constructor() {
    // Otras ventanas o iframes de la misma documentación (la muestra a 375 px) siguen el cambio.
    addEventListener('storage', (evento) => {
      if (evento.key === CLAVE) this.actual.set(leerGuardado());
    });
    effect(() => {
      const tema = this.actual();
      if (tema === 'Verde') this.raiz.setAttribute('data-uki-theme', 'verde');
      else this.raiz.removeAttribute('data-uki-theme');
      // El favicon toma los colores del tema, igual que la marca de la barra lateral.
      this.documento.getElementById('favicon')?.setAttribute('href', `favicon-${tema.toLowerCase()}.svg`);
      try {
        localStorage.setItem(CLAVE, tema);
      } catch {
        // Sin almacenamiento (ventana privada): el tema dura lo que dure la página.
      }
    });
  }
}
