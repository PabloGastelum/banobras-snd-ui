import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { UkiAlert, UkiButton } from '@banobras/uki';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';
import { TIPOS_FEEDBACK } from '../doc/tipos-feedback';
import { DocToken } from '../doc/token';

const PARTES: Parte[] = [
  { selector: '.uki-alert', nombre: 'Contenedor', detalle: 'feedback/{tipo}/background · 1 px feedback/{tipo}/foreground · radius-4 · relleno 12/16', lado: 'arriba', alinear: 'inicio' },
  { selector: '.uki-alert__icon', nombre: 'Ícono de estado', detalle: 'Ícono Linear de 24 px · feedback/{tipo}/foreground · opcional (icon)', lado: 'abajo' },
  { selector: '.uki-alert__message', nombre: 'Mensaje', detalle: 'Body/Medium · feedback/{tipo}/foreground · ocupa el ancho que queda', lado: 'arriba' },
  { selector: '.uki-alert__close', nombre: 'Botón de cerrar', detalle: 'Linear/x de 24 px · feedback/{tipo}/foreground · opcional (dismissible) · «Cerrar aviso»', lado: 'abajo' },
];

const ICONOS = [
  { nombre: 'Linear/check-circle', tipo: 'success' },
  { nombre: 'Linear/info-circle', tipo: 'info' },
  { nombre: 'Linear/exclamation-triangle', tipo: 'warning' },
  { nombre: 'Linear/x-circle', tipo: 'error' },
] as const;

@Component({
  selector: 'demo-alert',
  imports: [UkiAlert, UkiButton, DocAnatomia, DocToken, DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Alert</h1>
          <p class="doc-descripcion">
            Un alert muestra un mensaje corto sobre el resultado de una acción o el estado del sistema. Combina color e ícono y
            se queda cerca del contenido del que habla.
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsalo para</h3>
            <p>Confirmar una acción (guardado, enviado), advertir antes de un paso riesgoso o explicar por qué algo falló. Para decisiones que bloquean el flujo, usa un diálogo.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Nunca solo color</h3>
            <p>Cada tipo tiene su color y su ícono, para que el significado se entienda aunque no se distingan los colores.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Corto y accionable</h3>
            <p>Una o dos líneas. Di qué pasó y qué hacer después. Los errores explican cómo corregir el problema, no solo qué falló.</p>
          </article>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-atomos">
        <header class="doc-encabezado">
          <h2 id="t-atomos" class="doc-titulo">Átomos</h2>
          <p class="doc-descripcion">
            Los íconos del alert vienen del juego Linear de UKI (24 px), los mismos que usa Toast. Cada tipo siempre muestra el
            suyo; el de cerrar es Linear/x.
          </p>
        </header>
        <div class="rejilla">
          @for (i of iconos; track i.nombre) {
            <uki-alert [type]="i.tipo"><span class="doc-mono">{{ i.nombre }}</span></uki-alert>
          }
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-moleculas">
        <header class="doc-encabezado">
          <h2 id="t-moleculas" class="doc-titulo">Moléculas</h2>
          <p class="doc-descripcion">
            Alert combina el contenedor, el ícono de estado, el mensaje y el botón de cerrar. Elige el tipo con type, escribe el
            mensaje como contenido y apaga el ícono (icon) o enciende el botón de cerrar (dismissible).
          </p>
        </header>
        <demo-ejemplo titulo="Cuatro tipos" nombre="alert" [html]="codigo.tipos" [ts]="codigo.importar">
          <div class="pila">
            @for (t of tipos; track t.tipo) {
              <uki-alert [type]="t.tipo" dismissible [attr.data-prueba]="'alert-' + t.tipo">Aquí se te notificará.</uki-alert>
            }
          </div>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">Cuatro partes. Cada parte corresponde a un token, así que un cambio en el token actualiza todos los alerts.</p>
        </header>
        <demo-anatomia [partes]="partes" [escala]="1.2">
          <div class="ancho-figma">
            <uki-alert type="success" dismissible>Aquí se te notificará.</uki-alert>
          </div>
        </demo-anatomia>
      </section>

      <section class="doc-seccion" aria-labelledby="t-tipos">
        <header class="doc-encabezado">
          <h2 id="t-tipos" class="doc-titulo">Tipos</h2>
          <p class="doc-descripcion">
            Cuatro tipos, uno por intención. Cada tipo solo cambia los tokens de fondo, borde, texto e ícono, y siempre muestra
            su ícono.
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
                  <th scope="row">{{ t.nombre }}<small>{{ t.uso }}</small></th>
                  <td class="vista"><uki-alert [type]="t.tipo" dismissible>Aquí se te notificará.</uki-alert></td>
                  <td><demo-token [nombre]="t.primerPlano" nota="1 px" /></td>
                  <td><demo-token [nombre]="t.fondo" /></td>
                  <td><demo-token [nombre]="t.primerPlano" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-ejemplos">
        <header class="doc-encabezado">
          <h2 id="t-ejemplos" class="doc-titulo">Ejemplos</h2>
          <p class="doc-descripcion">
            Error lleva role="alert" y se anuncia de inmediato; Success, Info y Warning llevan role="status". Solo se anuncian si
            aparecen después de cargar la página, por ejemplo con &#64;if. Para confirmar una acción sin ocupar espacio, usa Toast.
          </p>
        </header>
        <demo-ejemplo titulo="Error al enviar un formulario" nombre="envio" [html]="codigo.envio" [ts]="codigo.envioTs">
          <div class="pila">
            <button ukiButton type="button" data-prueba="enviar" (click)="enviado.set(true)">Enviar solicitud</button>
            @if (enviado()) {
              <uki-alert type="error" data-prueba="alert-envio">
                No pudimos enviar la solicitud porque falta el <strong>comprobante de domicilio</strong>.
                <a href="#t-ejemplos">Revisa los requisitos</a> y vuelve a intentarlo.
              </uki-alert>
            }
          </div>
        </demo-ejemplo>
        <demo-ejemplo titulo="Se puede cerrar" nombre="cerrar" [html]="codigo.cerrar" [ts]="codigo.cerrarTs">
          <div class="pila">
            <uki-alert type="info" dismissible [(open)]="visible" data-prueba="alert-cerrar">
              Desde el 1 de noviembre las solicitudes se firman con e.firma.
            </uki-alert>
            @if (!visible()) {
              <button ukiButton variant="secondary" type="button" data-prueba="mostrar" (click)="visible.set(true)">Mostrar de nuevo</button>
            }
          </div>
        </demo-ejemplo>
      </section>
    </div>
  `,
  styles: `
    .rejilla {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: var(--spacing-16);
    }
    .pila {
      display: grid;
      gap: var(--spacing-16);
      width: 100%;
      justify-items: start;
    }
    .pila uki-alert {
      justify-self: stretch;
    }
    .ancho-figma {
      width: 300px;
    }
    .vista {
      min-width: 280px;
    }
  `,
})
export default class AlertPagina {
  protected readonly tipos = TIPOS_FEEDBACK;
  protected readonly iconos = ICONOS;
  protected readonly partes = PARTES;
  protected readonly enviado = signal(false);
  protected readonly visible = signal(true);
  protected readonly codigo = {
    importar: `import { UkiAlert } from '@banobras/uki';

@Component({
  imports: [UkiAlert],
  // …
})`,
    tipos: `<uki-alert type="success" dismissible>Aquí se te notificará.</uki-alert>
<uki-alert type="info" dismissible>Aquí se te notificará.</uki-alert>
<uki-alert type="warning" dismissible>Aquí se te notificará.</uki-alert>
<uki-alert type="error" dismissible>Aquí se te notificará.</uki-alert>`,
    envio: `<button ukiButton type="button" (click)="enviar()">Enviar solicitud</button>
@if (errorEnvio()) {
  <uki-alert type="error">
    No pudimos enviar la solicitud porque falta el <strong>comprobante de domicilio</strong>.
    <a routerLink="/requisitos">Revisa los requisitos</a> y vuelve a intentarlo.
  </uki-alert>
}`,
    envioTs: `protected readonly errorEnvio = signal(false);

protected enviar(): void {
  // El mensaje lo decide el sistema con la respuesta del servidor.
  this.errorEnvio.set(true);
}`,
    cerrar: `<uki-alert type="info" dismissible [(open)]="visible">
  Desde el 1 de noviembre las solicitudes se firman con e.firma.
</uki-alert>`,
    cerrarTs: `protected readonly visible = signal(true);`,
  };
}
