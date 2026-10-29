import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UkiButton, UkiButtonGroup } from '@banobras/uki';

/** Muestra sin barra lateral para incrustarla en un iframe a 375 px y ver el grupo apilado de verdad. */
@Component({
  selector: 'demo-muestra-grupo',
  imports: [UkiButton, UkiButtonGroup],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <h1 class="oculto">Grupo de botones</h1>
      <div ukiButtonGroup>
        <button ukiButton variant="ghost" type="button">Cancelar</button>
        <button ukiButton variant="secondary" type="button">Guardar borrador</button>
        <button ukiButton type="button">Continuar</button>
      </div>
    </main>
  `,
  styles: `
    main {
      padding: var(--spacing-16);
    }
    .oculto {
      position: absolute;
      top: 0;
      left: 0;
      margin: 0;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `,
})
export default class MuestraGrupo {}
