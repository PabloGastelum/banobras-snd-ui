import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, inject, input, Renderer2 } from '@angular/core';
import { UkiCapa } from './capa';

/** Espera antes de ocultar, para poder pasar el puntero del botón al tooltip (WCAG 1.4.13). */
const ESPERA_OCULTAR_MS = 100;

/**
 * Tooltip interno (acciones de la tabla). Solo visual: el nombre accesible ya está en el `aria-label` del botón, así que
 * el tooltip lleva `aria-hidden`. Aparece con el puntero o el foco, se queda si el puntero pasa encima y se oculta con
 * Esc o al salir. Va en la capa superpuesta para no recortarse dentro de la región con scroll de la tabla.
 */
@Directive({
  selector: '[ukiTooltip]',
  host: {
    '(mouseenter)': 'mostrar()',
    '(mouseleave)': 'ocultarLuego()',
    '(focusin)': 'mostrar()',
    '(focusout)': 'ocultar()',
  },
})
export class UkiTooltip {
  readonly texto = input.required<string>({ alias: 'ukiTooltip' });

  private readonly anfitrion: HTMLElement = inject(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);
  private elemento?: HTMLElement;
  private capa?: UkiCapa;
  private temporizador?: ReturnType<typeof setTimeout>;
  private readonly alTeclear = (evento: KeyboardEvent) => {
    if (evento.key === 'Escape' && this.elemento) {
      // Esc solo oculta el tooltip: no debe cerrar un modal que lo contenga.
      evento.preventDefault();
      evento.stopPropagation();
      this.ocultar();
    }
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => this.ocultar());
  }

  protected mostrar(): void {
    clearTimeout(this.temporizador);
    if (this.elemento) return;
    const elemento: HTMLElement = this.renderer.createElement('span');
    this.renderer.addClass(elemento, 'uki-tooltip');
    this.renderer.setAttribute(elemento, 'aria-hidden', 'true');
    this.renderer.appendChild(elemento, this.renderer.createText(this.texto()));
    this.renderer.listen(elemento, 'mouseenter', () => clearTimeout(this.temporizador));
    this.renderer.listen(elemento, 'mouseleave', () => this.ocultarLuego());
    // Junto al botón, no dentro: así queda dentro del mismo modal (no inerte) sin ser parte del nombre del botón.
    this.renderer.insertBefore(this.anfitrion.parentNode, elemento, this.anfitrion.nextSibling);
    this.elemento = elemento;
    this.capa = new UkiCapa(elemento, this.anfitrion, { lado: 'arriba', alinear: 'centro', separacion: 4 });
    this.capa.abrir();
    this.document.addEventListener('keydown', this.alTeclear, true);
  }

  protected ocultarLuego(): void {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.ocultar(), ESPERA_OCULTAR_MS);
  }

  protected ocultar(): void {
    clearTimeout(this.temporizador);
    this.document.removeEventListener('keydown', this.alTeclear, true);
    this.capa?.cerrar();
    this.capa = undefined;
    this.elemento?.remove();
    this.elemento = undefined;
  }
}
