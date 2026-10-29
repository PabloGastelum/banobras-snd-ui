import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cssVar } from './tokens';

/** Una línea «Parte · muestra · token» como en las tablas de estados de Figma. */
@Component({
  selector: 'demo-token',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'doc-token' },
  template: `
    @if (parte()) {
      <span class="doc-token__parte">{{ parte() }}</span>
    }
    @if (muestra()) {
      <span class="doc-token__muestra" [style.background]="fondo()"></span>
    }
    <code>{{ nombre() }}</code>
    @if (nota()) {
      <span class="doc-token__parte">{{ nota() }}</span>
    }
  `,
})
export class DocToken {
  readonly nombre = input.required<string>();
  readonly parte = input<string>();
  readonly nota = input<string>();
  readonly muestra = input(true);
  protected readonly fondo = computed(() => (this.nombre() === 'none' ? 'transparent' : `var(${cssVar(this.nombre())})`));
}
