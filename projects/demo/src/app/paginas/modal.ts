import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  UkiButton,
  UkiDialogService,
  UkiField,
  UkiInput,
  UkiModal,
  UkiModalClose,
  UkiModalFocus,
  UkiModalFooter,
  UkiSelect,
  UkiSelectOption,
  UkiToastService,
} from '@banobras/uki';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';
import { DemoIcono } from '../doc/iconos';
import { DocToken } from '../doc/token';

const PARTES: Parte[] = [
  { selector: '.velo-estatico', nombre: 'Velo', detalle: 'elevation/scrim (neutral/800 al 48 %) sobre toda la página · la bloquea · el modal siempre va centrado', lado: 'arriba', alinear: 'inicio' },
  { selector: '.uki-modal__header', nombre: 'Encabezado', detalle: 'modal/header · título Noto Sans SemiBold (h5) en modal/header-foreground · 80 px', lado: 'arriba', alinear: 'inicio' },
  { selector: '.uki-modal__close', nombre: 'Cerrar', detalle: 'Botón de 40 × 40 · ícono x de 24 px · modal/header-foreground · aria-label «Cerrar»', lado: 'arriba' },
  { selector: '.uki-modal__body', nombre: 'Cuerpo', detalle: 'background/surface · Body/Medium · text/primary · relleno spacing-24 / spacing-32', lado: 'abajo', alinear: 'inicio' },
  { selector: '.accion-principal', nombre: 'Acción principal', detalle: 'Button Primary (o Danger si es destructiva) con el nombre de la acción («Eliminar», «Entendido») · a la derecha', lado: 'abajo' },
  { selector: '.accion-secundaria', nombre: 'Acción secundaria', detalle: 'Button Secondary «Cancelar» · a la izquierda de la principal · no va en Informative', lado: 'abajo' },
];

const TIPOS = [
  { tipo: 'Informative', resumen: 'Explica algo importante', uso: 'La persona tiene que leerlo antes de seguir: requisitos, cambios, reglas.', acciones: 'Entendido (principal)', cierre: '×, Entendido o Esc' },
  { tipo: 'Confirmation', resumen: 'Pregunta antes de una acción', uso: 'Acciones destructivas o irreversibles: eliminar, enviar, cancelar una solicitud.', acciones: 'Cancelar + la acción («Eliminar»)', cierre: '×, Cancelar o Esc · nunca con un clic fuera' },
];

const TECLAS = [
  ['Al abrir', 'El foco entra al modal: a Cancelar en Confirmation, al botón principal en Informative o al elemento con ukiModalFocus.'],
  ['Tab · Mayús+Tab', 'Recorren solo el modal y dan la vuelta; lo de atrás es inerte (no se usa ni lo lee el lector de pantalla).'],
  ['Esc', 'Cierra el modal (closeOnEsc). Si una lista del Select está abierta, primero cierra la lista.'],
  ['Al cerrar', 'El foco vuelve al botón que abrió el modal.'],
];

const RESPONSABLES: UkiSelectOption<string>[] = [
  { value: 'mlopez', label: 'Mariana López Hernández' },
  { value: 'jramirez', label: 'Jorge Ramírez Soto' },
  { value: 'acastro', label: 'Ana Castro Villa' },
  { value: 'rmendez', label: 'Raúl Méndez Ortiz' },
  { value: 'lsanchez', label: 'Laura Sánchez Peña' },
  { value: 'ptorres', label: 'Pedro Torres Gil' },
  { value: 'cvargas', label: 'Carmen Vargas Luna' },
];

/** Vista fija del modal para Átomos, Moléculas y Anatomía: las mismas clases, sin <dialog> ni velo real. */
@Component({
  selector: 'demo-modal-fijo',
  imports: [UkiButton, DemoIcono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="uki-modal__panel" [class.panel-small]="size() === 'small'">
      <div class="uki-modal__header">
        <p class="uki-modal__title">{{ titulo() }}</p>
        <span class="uki-modal__close" aria-hidden="true"><demo-icono nombre="cerrar" /></span>
      </div>
      @if (!soloEncabezado()) {
        <div class="uki-modal__body">
          <p>{{ mensaje() }}</p>
        </div>
        <div class="uki-modal__footer">
          @if (tipo() === 'confirmation') {
            <button ukiButton variant="secondary" type="button" class="accion-secundaria" tabindex="-1">Cancelar</button>
          }
          <button ukiButton type="button" class="accion-principal" tabindex="-1">{{ accion() }}</button>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      flex: 1 1 100%;
      width: 100%;
      min-width: 0;
    }
    /* En la vista fija el ancho lo da el contenedor; 640 o 480 px como máximo. */
    .uki-modal__panel {
      width: 100%;
      max-width: 640px;
      margin: 0 auto;
    }
    .panel-small {
      max-width: 480px;
    }
    .uki-modal__close demo-icono {
      width: 24px;
      height: 24px;
    }
  `,
})
export class DemoModalFijo {
  readonly titulo = input('Título del modal');
  readonly tipo = input<'informative' | 'confirmation'>('informative');
  readonly size = input<'default' | 'small'>('default');
  readonly mensaje = input('Para completar tu solicitud necesitas tener a la mano tu identificación oficial.');
  readonly accion = input('Entendido');
  readonly soloEncabezado = input(false);
}

@Component({
  selector: 'demo-modal',
  imports: [
    ReactiveFormsModule,
    UkiButton,
    UkiModal,
    UkiModalFooter,
    UkiModalClose,
    UkiModalFocus,
    UkiField,
    UkiInput,
    UkiSelect,
    DemoModalFijo,
    DocAnatomia,
    DocToken,
    DemoEjemplo,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Modal</h1>
          <p class="doc-descripcion">
            Un modal es una ventana que aparece sobre el contenido y necesita la atención de la persona antes de seguir. Sirve
            para confirmar una acción importante o informar algo que se tiene que saber. Siempre aparece centrado, sobre un
            velo oscuro que bloquea la página.
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsalo para</h3>
            <p>Confirmar acciones destructivas o irreversibles, avisar antes de perder trabajo sin guardar o mostrar algo que se tiene que leer ya. Para avisos rápidos usa Toast; para mensajes en la página, Alert.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Título y acciones claros</h3>
            <p>El título dice qué pasa («¿Eliminar el trámite?»). El botón de confirmar repite la acción («Eliminar», no «Aceptar») y va a la derecha; Cancelar va a su izquierda.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Fácil de salir</h3>
            <p>Siempre hay salida: el botón ×, Cancelar y la tecla Esc. Si el contenido necesita scroll o muchos campos, usa una página.</p>
          </article>
        </div>
        <demo-ejemplo titulo="Pruébalo" nombre="tramites" [html]="codigo.pruebalo" [ts]="codigo.servicio">
          <button ukiButton variant="danger" type="button" data-prueba="abrir-confirmacion" (click)="eliminar()">Eliminar trámite</button>
          <button ukiButton variant="secondary" type="button" data-prueba="abrir-informativo" (click)="requisitos()">Ver requisitos</button>
          <button ukiButton variant="secondary" type="button" data-prueba="abrir-formulario" (click)="editando.set(true)">Cambiar responsable</button>
          @if (resultado()) {
            <p class="uki-body-sm resultado" data-prueba="resultado">{{ resultado() }}</p>
          }
        </demo-ejemplo>
      </section>

      <uki-modal [(open)]="editando" title="Cambiar responsable" size="small" [describeBody]="false" data-prueba="modal-formulario">
        <form id="form-responsable" class="formulario" (ngSubmit)="guardar()" [formGroup]="formulario">
          <uki-select
            label="Nuevo responsable"
            required
            [options]="responsables"
            formControlName="responsable"
            error="Elige a la persona responsable."
            data-prueba="select-en-modal"
          />
          <uki-field label="Motivo del cambio" helper="Se guarda en la bitácora del trámite.">
            <input ukiInput ukiModalFocus formControlName="motivo" />
          </uki-field>
          <button ukiButton variant="ghost" type="button" data-prueba="toast-en-modal" (click)="copiarFolio()">Copiar folio FON-2026-0142</button>
        </form>
        <div ukiModalFooter>
          <button ukiButton variant="secondary" type="button" ukiModalClose>Cancelar</button>
          <button ukiButton type="submit" form="form-responsable">Guardar</button>
        </div>
      </uki-modal>

      <section class="doc-seccion" aria-labelledby="t-atomos">
        <header class="doc-encabezado">
          <h2 id="t-atomos" class="doc-titulo">Átomos</h2>
          <p class="doc-descripcion">
            El encabezado del modal: título sobre modal/header y el botón de cerrar. Los botones del pie son el componente
            Button.
          </p>
        </header>
        <div class="doc-visual">
          <demo-modal-fijo [soloEncabezado]="true" />
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-moleculas">
        <header class="doc-encabezado">
          <h2 id="t-moleculas" class="doc-titulo">Moléculas</h2>
          <p class="doc-descripcion">
            El modal combina encabezado, cuerpo y pie. Elige el tipo (type: informative o confirmation) y el tamaño (size:
            default de 640 px o small de 480 px). El pie es opcional.
          </p>
        </header>
        <div class="doc-visual moleculas" data-prueba="moleculas">
          <demo-modal-fijo data-prueba="fijo-default" />
          <demo-modal-fijo size="small" />
          <demo-modal-fijo
            tipo="confirmation"
            mensaje="Se eliminarán todos los elementos del trámite. Esta acción no se puede deshacer."
            accion="Eliminar"
          />
          <demo-modal-fijo
            tipo="confirmation"
            size="small"
            data-prueba="fijo-small"
            mensaje="Se eliminarán todos los elementos del trámite. Esta acción no se puede deshacer."
            accion="Eliminar"
          />
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">
            Seis partes forman cada modal. Cada una usa un token, así que un cambio en el token actualiza todos los modales.
          </p>
        </header>
        <demo-anatomia [partes]="partes" [escala]="0.7">
          <div class="velo-estatico">
            <demo-modal-fijo
              tipo="confirmation"
              size="small"
              titulo="¿Eliminar el trámite?"
              mensaje="Se eliminarán todos los elementos del trámite."
              accion="Eliminar"
            />
          </div>
        </demo-anatomia>
      </section>

      <section class="doc-seccion" aria-labelledby="t-tipos">
        <header class="doc-encabezado">
          <h2 id="t-tipos" class="doc-titulo">Tipos</h2>
          <p class="doc-descripcion">Dos tipos, uno por intención. Comparten encabezado, velo y comportamiento.</p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Tipos de modal</caption>
            <thead>
              <tr>
                <th scope="col">Tipo</th>
                <th scope="col">Úsalo cuando</th>
                <th scope="col">Acciones</th>
                <th scope="col">Se cierra con</th>
              </tr>
            </thead>
            <tbody>
              @for (t of tipos; track t.tipo) {
                <tr>
                  <th scope="row">{{ t.tipo }}<small>{{ t.resumen }}</small></th>
                  <td>{{ t.uso }}</td>
                  <td>{{ t.acciones }}</td>
                  <td>{{ t.cierre }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-tokens">
        <header class="doc-encabezado">
          <h2 id="t-tokens" class="doc-titulo">Tokens por parte</h2>
          <p class="doc-descripcion">Los colores del encabezado y del velo no cambian con el tema.</p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Tokens del modal</caption>
            <thead>
              <tr>
                <th scope="col">Parte</th>
                <th scope="col">Fondo</th>
                <th scope="col">Texto y otros</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Velo</th>
                <td><demo-token nombre="elevation/scrim" [muestra]="false" nota="neutral/800 al 48 %" /></td>
                <td>—</td>
              </tr>
              <tr>
                <th scope="row">Panel<small>Default 640 px · Small 480 px</small></th>
                <td><demo-token nombre="background/surface" /></td>
                <td><demo-token nombre="radius-8" [muestra]="false" /><demo-token nombre="Elevation/modal" [muestra]="false" /></td>
              </tr>
              <tr>
                <th scope="row">Encabezado<small>80 px</small></th>
                <td><demo-token nombre="modal/header" /></td>
                <td><demo-token nombre="modal/header-foreground" nota="SemiBold h5" /></td>
              </tr>
              <tr>
                <th scope="row">Cerrar · Focus</th>
                <td>—</td>
                <td><demo-token nombre="text/inverse" nota="borde 2 px" /></td>
              </tr>
              <tr>
                <th scope="row">Cuerpo</th>
                <td><demo-token nombre="background/surface" /></td>
                <td><demo-token nombre="text/primary" nota="Body/Medium" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-accesibilidad">
        <header class="doc-encabezado">
          <h2 id="t-accesibilidad" class="doc-titulo">Accesibilidad</h2>
          <p class="doc-descripcion">
            Usa el &lt;dialog&gt; nativo con showModal(): el título es su nombre accesible y el cuerpo, su descripción. Un
            toast mostrado desde el modal se ve y se anuncia (pruébalo con «Copiar folio» en «Cambiar responsable»).
          </p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Foco y teclado</caption>
            <thead>
              <tr>
                <th scope="col">Momento o tecla</th>
                <th scope="col">Qué pasa</th>
              </tr>
            </thead>
            <tbody>
              @for (t of teclas; track t[0]) {
                <tr>
                  <th scope="row">{{ t[0] }}</th>
                  <td>{{ t[1] }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <demo-ejemplo titulo="Modal declarativo con formulario" nombre="responsable" [html]="codigo.declarativo" [ts]="codigo.declarativoTs" [soloCodigo]="true" />
      </section>
    </div>
  `,
  styles: `
    .moleculas {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--spacing-24);
    }
    .velo-estatico {
      box-sizing: border-box;
      width: 460px;
      padding: var(--spacing-32);
      background: var(--elevation-scrim);
    }
    .formulario {
      display: grid;
      gap: var(--spacing-16);
      justify-items: start;
    }
    .formulario > uki-select,
    .formulario > uki-field {
      justify-self: stretch;
    }
    .resultado {
      flex-basis: 100%;
      margin: 0;
    }
  `,
})
export default class ModalPagina {
  private readonly dialogos = inject(UkiDialogService);
  private readonly avisos = inject(UkiToastService);
  protected readonly partes = PARTES;
  protected readonly tipos = TIPOS;
  protected readonly teclas = TECLAS;
  protected readonly responsables = RESPONSABLES;
  protected readonly editando = signal(false);
  protected readonly resultado = signal('');
  protected readonly formulario = new FormGroup({
    responsable: new FormControl<string | null>(null, Validators.required),
    motivo: new FormControl(''),
  });

  protected async eliminar(): Promise<void> {
    const confirmado = await this.dialogos.confirm({
      title: '¿Eliminar el trámite?',
      message: 'Se eliminarán todos los elementos del trámite FON-2026-0142. Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      destructive: true,
    });
    this.resultado.set(confirmado ? 'Confirmado: el sistema eliminaría el trámite.' : 'Cancelado: no se eliminó nada.');
    if (confirmado) this.avisos.success('Trámite eliminado');
  }

  protected async requisitos(): Promise<void> {
    await this.dialogos.inform({
      title: 'Requisitos del trámite',
      message: 'Para completar tu solicitud necesitas tener a la mano tu identificación oficial y el comprobante de domicilio.',
    });
    this.resultado.set('Informado: la persona cerró el aviso.');
  }

  protected copiarFolio(): void {
    this.avisos.info('Folio copiado', 'FON-2026-0142');
  }

  protected guardar(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;
    this.editando.set(false);
    this.avisos.success('Responsable actualizado');
    this.formulario.reset();
  }

  protected readonly codigo = {
    pruebalo: `<button ukiButton variant="danger" type="button" (click)="eliminar()">Eliminar trámite</button>
<button ukiButton variant="secondary" type="button" (click)="requisitos()">Ver requisitos</button>`,
    servicio: `import { inject } from '@angular/core';
import { UkiDialogService } from '@banobras/uki';

private readonly dialogos = inject(UkiDialogService);

async eliminar(): Promise<void> {
  const confirmado = await this.dialogos.confirm({
    title: '¿Eliminar el trámite?',
    message: 'Se eliminarán todos los elementos del trámite. Esta acción no se puede deshacer.',
    confirmLabel: 'Eliminar',
    destructive: true, // botón Danger
  });
  if (confirmado) this.tramites.eliminar(this.folio);
}

async requisitos(): Promise<void> {
  await this.dialogos.inform({
    title: 'Requisitos del trámite',
    message: 'Necesitas tu identificación oficial y el comprobante de domicilio.',
  });
}`,
    declarativo: `<button ukiButton variant="secondary" type="button" (click)="editando.set(true)">Cambiar responsable</button>

<uki-modal [(open)]="editando" title="Cambiar responsable" size="small" [describeBody]="false">
  <form id="form-responsable" [formGroup]="formulario" (ngSubmit)="guardar()">
    <uki-select label="Nuevo responsable" required [options]="responsables" formControlName="responsable" />
    <uki-field label="Motivo del cambio">
      <input ukiInput ukiModalFocus formControlName="motivo" />
    </uki-field>
  </form>
  <div ukiModalFooter>
    <button ukiButton variant="secondary" type="button" ukiModalClose>Cancelar</button>
    <button ukiButton type="submit" form="form-responsable">Guardar</button>
  </div>
</uki-modal>`,
    declarativoTs: `import { UkiModal, UkiModalClose, UkiModalFocus, UkiModalFooter } from '@banobras/uki';

protected readonly editando = signal(false);`,
  };
}
