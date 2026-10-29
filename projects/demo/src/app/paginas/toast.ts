import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UkiButton, UkiFeedbackType, UkiToastService } from '@banobras/uki';
// Vista interna del aviso, solo para las vistas previas fijas de la documentación; los sistemas usan UkiToastService.
import { UkiToastView } from '../../../../uki/src/lib/toast/toast-view';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';
import { TIPOS_FEEDBACK } from '../doc/tipos-feedback';
import { DocToken } from '../doc/token';

const PARTES: Parte[] = [
  { selector: '.uki-toast', nombre: 'Contenedor', detalle: 'feedback/{tipo}/background · 1 px feedback/{tipo}/foreground · radius-8 · Elevation/floating · 360 px · relleno 16', lado: 'arriba', alinear: 'inicio' },
  { selector: '.uki-toast__icon', nombre: 'Ícono de estado', detalle: 'Ícono Linear de 24 px · feedback/{tipo}/foreground · opcional (icon)', lado: 'abajo' },
  { selector: '.uki-toast__title', nombre: 'Título', detalle: 'Body/Small Bold · feedback/{tipo}/foreground · 2–5 palabras', lado: 'arriba' },
  { selector: '.uki-toast__description', nombre: 'Descripción', detalle: 'Body/Small · feedback/{tipo}/foreground · una línea, opcional', lado: 'abajo' },
  { selector: '.uki-toast__close', nombre: 'Cerrar', detalle: 'Linear/x de 20 px en un botón de 24 px · opcional en Success e Info · «Cerrar aviso»', lado: 'arriba' },
];

/** Mensajes reales de ejemplo, uno por tipo. */
const MENSAJES: Record<UkiFeedbackType, { title: string; description: string; uso: string }> = {
  success: { title: 'Solicitud enviada', description: 'Te enviamos el acuse por correo.', uso: 'La acción terminó bien.' },
  info: { title: 'Folio copiado', description: 'Pégalo en el campo de búsqueda.', uso: 'Información útil, sin urgencia.' },
  warning: { title: 'Tu sesión vence pronto', description: 'Guarda tus cambios en los próximos 5 minutos.', uso: 'Requiere atención pronto. Se queda hasta cerrarlo.' },
  error: { title: 'No se pudo enviar', description: 'Revisa tu conexión e inténtalo de nuevo.', uso: 'La acción falló. Se queda hasta cerrarlo.' },
};

const ICONOS = [
  { nombre: 'Linear/check-circle', tipo: 'success' },
  { nombre: 'Linear/info-circle', tipo: 'info' },
  { nombre: 'Linear/exclamation-triangle', tipo: 'warning' },
  { nombre: 'Linear/x-circle', tipo: 'error' },
] as const;

const COMPORTAMIENTO = [
  ['Anuncio', 'Error se anuncia de inmediato (role="alert"); los demás, sin interrumpir (role="status"). Se lee una vez: «Título. Descripción.»'],
  ['Foco', 'El aviso nunca toma el foco. Quien escribe o navega sigue donde estaba.'],
  ['Tiempo', 'Success e Info se cierran a los 5 s; Warning y Error se quedan hasta cerrarlos. Cambia el tiempo con duration.'],
  ['Pausa', 'El tiempo se detiene con el puntero encima o con el foco dentro, y sigue con lo que quedaba al salir.'],
  ['Teclado', 'El botón «Cerrar aviso» se alcanza con Tab. Esc cierra el aviso si el foco está dentro.'],
  ['Uno a la vez', 'Un aviso nuevo reemplaza al visible.'],
  ['Posición', 'Arriba a la derecha desde 768 px; abajo al centro en móvil.'],
];

@Component({
  selector: 'demo-toast',
  imports: [UkiButton, UkiToastView, DocAnatomia, DocToken, DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Toast</h1>
          <p class="doc-descripcion">
            Un toast es un mensaje corto que flota sobre la página para confirmar lo que acaba de pasar, como «Solicitud
            enviada». No bloquea la pantalla y se cierra solo, a diferencia de Alert, que se queda en la página junto al
            contenido del que habla.
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsalo para</h3>
            <p>Retroalimentación rápida después de una acción: guardado, enviado, eliminado, copiado o un problema de conexión. Para mensajes que deben quedarse, usa Alert; para decisiones, un diálogo.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Corto y claro</h3>
            <p>Un título de 2 a 5 palabras y, si hace falta, una línea de descripción. Nunca pongas en un toast la única forma de terminar una tarea, porque desaparece.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Tiempo y posición</h3>
            <p>Arriba a la derecha en escritorio, abajo al centro en móvil, uno a la vez. Success e Info se cierran a los 5 s (con pausa); Warning y Error se quedan hasta cerrarlos.</p>
          </article>
        </div>
        <demo-ejemplo titulo="Pruébalo" nombre="avisos" [html]="codigo.botones" [ts]="codigo.servicio">
          @for (t of tipos; track t.tipo) {
            <button ukiButton variant="secondary" type="button" [attr.data-prueba]="'mostrar-' + t.tipo" (click)="mostrar(t.tipo)">
              {{ t.nombre }}
            </button>
          }
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-atomos">
        <header class="doc-encabezado">
          <h2 id="t-atomos" class="doc-titulo">Átomos</h2>
          <p class="doc-descripcion">Los íconos del toast vienen del juego Linear de UKI (24 px), los mismos que usa Alert.</p>
        </header>
        <div class="rejilla">
          @for (i of iconos; track i.nombre) {
            <uki-toast [type]="i.tipo" [title]="i.nombre" [dismissible]="false" />
          }
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-moleculas">
        <header class="doc-encabezado">
          <h2 id="t-moleculas" class="doc-titulo">Moléculas</h2>
          <p class="doc-descripcion">
            Toast combina el contenedor, el ícono de estado, el título, la descripción y el botón de cerrar. Elige el tipo y
            escribe el título y la descripción al llamar al servicio; apaga la descripción, el ícono (icon) o el botón
            (dismissible, solo en Success e Info).
          </p>
        </header>
        <demo-ejemplo titulo="Opciones" nombre="opciones" [ts]="codigo.opciones">
          <div class="rejilla">
            <uki-toast type="success" title="Título del aviso" description="Describe en una línea qué pasó o qué puede hacer la persona." data-prueba="toast-fijo" />
            <uki-toast type="success" title="Cambios guardados" />
            <uki-toast type="info" title="Folio copiado" [icon]="false" [dismissible]="false" />
          </div>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">
            Cinco partes. Cada parte corresponde a un token, así que un cambio en el token actualiza todos los toasts y todos los
            alerts.
          </p>
        </header>
        <demo-anatomia [partes]="partes" [escala]="1">
          <uki-toast type="success" title="Título del aviso" description="Describe en una línea qué pasó o qué puede hacer la persona." />
        </demo-anatomia>
      </section>

      <section class="doc-seccion" aria-labelledby="t-tipos">
        <header class="doc-encabezado">
          <h2 id="t-tipos" class="doc-titulo">Tipos</h2>
          <p class="doc-descripcion">
            Cuatro tipos, uno por intención. Cada tipo solo cambia los tokens de fondo, borde, texto e ícono, y siempre muestra
            su ícono. Mensajes reales de ejemplo.
          </p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Tokens por tipo</caption>
            <thead>
              <tr>
                <th scope="col">Tipo</th>
                <th scope="col">Vista previa</th>
                <th scope="col">Borde</th>
                <th scope="col">Fondo</th>
                <th scope="col">Texto e ícono</th>
              </tr>
            </thead>
            <tbody>
              @for (t of tipos; track t.tipo) {
                <tr>
                  <th scope="row">{{ t.nombre }}<small>{{ mensajes[t.tipo].uso }}</small></th>
                  <td>
                    <uki-toast
                      [type]="t.tipo"
                      [title]="mensajes[t.tipo].title"
                      [description]="mensajes[t.tipo].description"
                      [attr.data-prueba]="'toast-tabla-' + t.tipo"
                    />
                  </td>
                  <td><demo-token [nombre]="t.primerPlano" nota="1 px" /></td>
                  <td><demo-token [nombre]="t.fondo" /></td>
                  <td><demo-token [nombre]="t.primerPlano" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-accesibilidad">
        <header class="doc-encabezado">
          <h2 id="t-accesibilidad" class="doc-titulo">Accesibilidad</h2>
          <p class="doc-descripcion">
            El servicio crea una sola región de avisos al final de la página, con dos regiones vivas que existen desde el inicio
            para que el anuncio sea confiable. El aviso visible no es región viva, así que no se lee «Cerrar aviso».
          </p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Comportamiento</caption>
            <thead>
              <tr>
                <th scope="col">Tema</th>
                <th scope="col">Qué hace</th>
              </tr>
            </thead>
            <tbody>
              @for (c of comportamiento; track c[0]) {
                <tr>
                  <th scope="row">{{ c[0] }}</th>
                  <td>{{ c[1] }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: `
    .rejilla {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
      align-items: start;
      gap: var(--spacing-16);
      width: 100%;
      min-width: 0;
    }
    /* 360 px como en Figma, sin pasar del ancho de la celda en móvil. */
    .rejilla uki-toast {
      width: min(360px, 100%);
    }
    /* En la tabla el ancho de la celda depende del contenido: el aviso fija sus 360 px y la tabla se desplaza en móvil. */
    td uki-toast {
      width: 360px;
      max-width: none;
    }
  `,
})
export default class ToastPagina {
  private readonly avisos = inject(UkiToastService);
  protected readonly tipos = TIPOS_FEEDBACK;
  protected readonly mensajes = MENSAJES;
  protected readonly iconos = ICONOS;
  protected readonly partes = PARTES;
  protected readonly comportamiento = COMPORTAMIENTO;

  protected mostrar(tipo: UkiFeedbackType): void {
    const { title, description } = this.mensajes[tipo];
    this.avisos.show({ type: tipo, title, description });
  }

  protected readonly codigo = {
    botones: `<button ukiButton type="button" (click)="enviar()">Enviar solicitud</button>`,
    servicio: `import { Component, inject } from '@angular/core';
import { UkiButton, UkiToastService } from '@banobras/uki';

@Component({
  selector: 'app-solicitud',
  imports: [UkiButton],
  templateUrl: './solicitud.html',
})
export class Solicitud {
  private readonly avisos = inject(UkiToastService);

  protected enviar(): void {
    // … después de que el servidor confirma:
    this.avisos.success('Solicitud enviada', 'Te enviamos el acuse por correo.');
  }
}`,
    opciones: `// Atajos por tipo: título y descripción opcional.
this.avisos.success('Cambios guardados');
this.avisos.error('No se pudo enviar', 'Revisa tu conexión e inténtalo de nuevo.');

// Todas las opciones.
const aviso = this.avisos.show({
  type: 'info',
  title: 'Folio copiado',
  icon: false,         // sin ícono de estado
  dismissible: false,  // sin botón de cerrar (solo Success e Info)
  duration: 3000,      // ms; null = hasta que lo cierren
});
aviso.close();                  // ciérralo antes de tiempo
await aviso.closed;             // se cumple al cerrarse por cualquier motivo`,
  };
}
