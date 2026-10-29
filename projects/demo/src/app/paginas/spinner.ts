import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { UkiButton, UkiSpinner } from '@banobras/uki';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';

const PARTES: Parte[] = [
  { selector: 'circle:nth-child(1)', nombre: 'Cabeza', detalle: 'Punto al 100 % · marca la posición actual · avanza 30° en sentido horario', lado: 'arriba' },
  { selector: 'circle:nth-child(11)', nombre: 'Estela', detalle: '11 puntos con opacidad de 90 % a 5 % · muestra la dirección del giro', lado: 'arriba' },
  { selector: 'circle:nth-child(4)', nombre: 'Punto', detalle: 'Círculo de 3.6 px · icon/default · 12 puntos, uno cada 30°', lado: 'abajo' },
  { selector: '.uki-spinner', nombre: 'Marco', detalle: '24 × 24 px (36 y 48 escalan) · sin relleno', lado: 'abajo', alinear: 'inicio' },
];

@Component({
  selector: 'demo-spinner',
  imports: [UkiSpinner, UkiButton, DocAnatomia, DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Sin encapsulación para detener y girar el SVG interno del spinner en Anatomía y Pasos.
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Spinner</h1>
          <p class="doc-descripcion">
            Un spinner indica que el sistema está trabajando. El punto más oscuro gira en sentido horario, como las manecillas
            de un reloj, hasta que el contenido está listo.
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsalo para</h3>
            <p>Indicar que algo carga y la espera es corta o desconocida. Para tareas largas con avance conocido, usa una barra de progreso.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Siempre con etiqueta</h3>
            <p>Acompáñalo de un texto breve como «Cargando…» o de label, para que los lectores de pantalla anuncien la espera.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Uno por área</h3>
            <p>Muestra un spinner por región, donde aparecerá el contenido, y quítalo en cuanto el contenido cargue.</p>
          </article>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-atomos">
        <header class="doc-encabezado">
          <h2 id="t-atomos" class="doc-titulo">Átomos</h2>
          <p class="doc-descripcion">Tres tamaños. Dentro de un botón en Loading toma el color del texto y se oculta a lectores de pantalla.</p>
        </header>
        <div class="doc-tarjetas">
          @for (t of tamanos; track t) {
            <article class="doc-tarjeta">
              <div class="doc-visual"><uki-spinner [size]="t" [label]="'Cargando, tamaño ' + t" /></div>
              <h3>{{ t }} px</h3>
              <p class="doc-tokens doc-mono">size="{{ t }}"</p>
            </article>
          }
          <article class="doc-tarjeta">
            <div class="doc-visual"><button ukiButton type="button" loading>Guardar</button></div>
            <h3>En un botón</h3>
            <p class="doc-tokens doc-mono">&lt;button ukiButton loading&gt;</p>
          </article>
        </div>
        <demo-ejemplo titulo="Spinner con etiqueta" nombre="carga" [html]="codigo.tamanos" [ts]="codigo.ts">
          <uki-spinner />
          <uki-spinner size="36" label="Cargando resultados" />
          <uki-spinner size="48" label="Cargando el expediente" />
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">Cuatro partes. Todos los puntos usan icon/default, así que un cambio de color alcanza a todos.</p>
        </header>
        <demo-anatomia class="anatomia-quieta" [partes]="partes">
          <uki-spinner size="48" decorative />
        </demo-anatomia>
      </section>

      <section class="doc-seccion" aria-labelledby="t-pasos">
        <header class="doc-encabezado">
          <h2 id="t-pasos" class="doc-titulo">Pasos</h2>
          <p class="doc-descripcion">
            Doce pasos hacen una vuelta en un segundo: cada paso suma 30° y 80 ms. En código es una sola rotación lineal e
            infinita de 1 s; con «reducir movimiento» avanza en estos 12 pasos.
          </p>
        </header>
        <ol class="pasos">
          @for (p of pasos; track p.n) {
            <li class="doc-tarjeta">
              <span class="pasos__figura" [style.--giro]="p.angulo + 'deg'"><uki-spinner size="48" decorative /></span>
              <strong>Paso {{ p.etiqueta }}</strong>
              <span class="doc-mono">{{ p.ms }} ms · {{ p.angulo }}°</span>
            </li>
          }
        </ol>
      </section>
    </div>
  `,
  styles: `
    .anatomia-quieta .uki-spinner__figure,
    .pasos .uki-spinner__figure {
      animation: none;
    }
    .pasos .uki-spinner__figure {
      transform: rotate(var(--giro));
    }
    .pasos {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--spacing-16);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .pasos li {
      justify-items: center;
      text-align: center;
    }
    .pasos__figura {
      display: grid;
      place-items: center;
      width: 72px;
      height: 72px;
      margin-bottom: var(--spacing-4);
      border-radius: var(--radius-12);
      background: var(--background-surface);
    }
    .pasos .doc-mono {
      font-size: var(--font-size-caption);
      color: var(--text-secondary);
    }
  `,
})
export default class SpinnerPagina {
  protected readonly tamanos = [24, 36, 48] as const;
  protected readonly codigo = {
    tamanos: `<!-- label es lo que anuncian los lectores de pantalla (por omisión «Cargando») -->
<uki-spinner />
<uki-spinner size="36" label="Cargando resultados" />
<uki-spinner size="48" label="Cargando el expediente" />`,
    ts: `import { Component } from '@angular/core';
import { UkiSpinner } from '@banobras/uki';

@Component({
  selector: 'app-resultados',
  imports: [UkiSpinner],
  templateUrl: './carga.html',
})
export class Resultados {}`,
  };
  protected readonly partes = PARTES;
  protected readonly pasos = Array.from({ length: 12 }, (_, i) => ({
    n: i,
    etiqueta: String(i + 1).padStart(2, '0'),
    ms: i * 80,
    angulo: i * 30,
  }));
}
