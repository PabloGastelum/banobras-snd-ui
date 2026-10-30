import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

/** Clase de `<html>` mientras haya un modal abierto: bloquea el scroll de la página (modal.css). */
export const CLASE_SIN_SCROLL = 'uki-modal-abierto';

type Observador = (superior: HTMLDialogElement | null) => void;

/**
 * Pila de modales abiertos (interna). Bloquea el scroll del fondo mientras haya alguno y avisa cuál está arriba, para
 * que la región de avisos de Toast se mueva dentro de él: todo lo que queda fuera de un modal es inerte.
 */
@Injectable({ providedIn: 'root' })
export class UkiPilaModales {
  private readonly document = inject(DOCUMENT);
  private readonly pila: HTMLDialogElement[] = [];
  private readonly observadores = new Set<Observador>();

  /** El modal de arriba, o `null` si no hay ninguno abierto. */
  get superior(): HTMLDialogElement | null {
    return this.pila.at(-1) ?? null;
  }

  /** Se llama antes de `showModal()`, para que lo que se mueva dentro ya esté ahí al abrir. */
  entrar(dialogo: HTMLDialogElement): void {
    if (this.pila.includes(dialogo)) return;
    this.pila.push(dialogo);
    this.document.documentElement.classList.add(CLASE_SIN_SCROLL);
    this.avisar();
  }

  salir(dialogo: HTMLDialogElement): void {
    const i = this.pila.indexOf(dialogo);
    if (i < 0) return;
    this.pila.splice(i, 1);
    if (!this.pila.length) this.document.documentElement.classList.remove(CLASE_SIN_SCROLL);
    this.avisar();
  }

  /** Escucha los cambios del modal de arriba. Devuelve la función para dejar de escuchar. */
  observar(observador: Observador): () => void {
    this.observadores.add(observador);
    return () => this.observadores.delete(observador);
  }

  private avisar(): void {
    for (const observador of this.observadores) observador(this.superior);
  }
}
