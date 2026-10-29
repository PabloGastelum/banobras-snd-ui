import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UkiAvatar, UkiAvatarSize } from '@banobras/uki';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';
import { DocToken } from '../doc/token';

const FOTO = 'avatar-ejemplo.svg';

const PARTES: Parte[] = [
  { selector: '.uki-avatar', nombre: 'Contenedor', detalle: 'Círculo · 1 px border/low-contrast · radius-full', lado: 'arriba', alinear: 'inicio' },
  { selector: '.uki-avatar__image', nombre: 'Imagen', detalle: 'Foto que llena el círculo, centrada · radius-full · crece con el tamaño', lado: 'abajo' },
  { selector: '.uki-avatar__status', nombre: 'Estado', detalle: 'Opcional (status) · avatar/status · anillo de 2 px background/surface · abajo a la derecha', lado: 'arriba' },
];

const TAMANOS: { size: UkiAvatarSize; lado: number; punto: number; uso: string }[] = [
  { size: 'xs', lado: 24, punto: 6, uso: 'Tablas y listas densas' },
  { size: 'sm', lado: 32, punto: 8, uso: 'Comentarios y chips' },
  { size: 'md', lado: 40, punto: 10, uso: 'Por omisión · menús y tarjetas' },
  { size: 'lg', lado: 48, punto: 12, uso: 'Encabezados de perfil' },
  { size: 'xl', lado: 56, punto: 14, uso: 'Páginas de perfil' },
];

@Component({
  selector: 'demo-avatar',
  imports: [UkiAvatar, DocAnatomia, DocToken, DemoEjemplo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Avatar</h1>
          <p class="doc-descripcion">
            Un avatar representa a una persona: quien tiene la sesión, la dueña de un registro o quien participó en una acción.
            Siempre es un círculo y tiene cinco tamaños.
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsalo para</h3>
            <p>Mostrar quién tiene la sesión, quién es dueño de un registro o quién dejó un comentario. Escribe el nombre al lado cuando haya espacio.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Foto clara</h3>
            <p>Usa una foto cuadrada con la cara al centro. Se recorta en círculo, así que deja la cara lejos de los bordes. Sin foto, se muestran las iniciales.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Punto de estado</h3>
            <p>El punto verde significa que la persona está en línea. Enciéndelo solo si el sistema lo sabe; no cambies su color ni lo uses para otros estados.</p>
          </article>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-moleculas">
        <header class="doc-encabezado">
          <h2 id="t-moleculas" class="doc-titulo">Moléculas</h2>
          <p class="doc-descripcion">
            Avatar tiene cinco tamaños (xs a xl); md es el de uso general. La foto va en src y el nombre en name, que también es
            su nombre accesible.
          </p>
        </header>
        <demo-ejemplo titulo="Tamaños con foto y estado" nombre="avatar" [html]="codigo.tamanos" [ts]="codigo.importar">
          @for (t of tamanos; track t.size) {
            <uki-avatar [size]="t.size" name="Mariana López Hernández" [src]="foto" status [attr.data-prueba]="'avatar-' + t.size" />
          }
        </demo-ejemplo>
        <demo-ejemplo titulo="Sin foto: iniciales" nombre="iniciales" [html]="codigo.iniciales">
          @for (t of tamanos; track t.size) {
            <uki-avatar [size]="t.size" name="María de la Luz Pérez" [attr.data-prueba]="'iniciales-' + t.size" />
          }
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">Tres partes. Cada parte corresponde a un token, así que un cambio en el token actualiza todos los avatares.</p>
        </header>
        <demo-anatomia [partes]="partes" [escala]="4">
          <uki-avatar size="xl" name="Mariana López Hernández" [src]="foto" status />
        </demo-anatomia>
      </section>

      <section class="doc-seccion" aria-labelledby="t-tamanos">
        <header class="doc-encabezado">
          <h2 id="t-tamanos" class="doc-titulo">Tamaños</h2>
          <p class="doc-descripcion">Cinco tamaños en pasos de 8 px. El punto de estado crece con el avatar para conservar el equilibrio.</p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Medidas por tamaño</caption>
            <thead>
              <tr>
                <th scope="col">Tamaño</th>
                <th scope="col">Vista previa</th>
                <th scope="col">Medida</th>
                <th scope="col">Punto de estado</th>
              </tr>
            </thead>
            <tbody>
              @for (t of tamanos; track t.size) {
                <tr>
                  <th scope="row">{{ t.size }}<small>{{ t.uso }}</small></th>
                  <td><uki-avatar [size]="t.size" name="Mariana López Hernández" [src]="foto" status /></td>
                  <td class="doc-mono">{{ t.lado }} × {{ t.lado }} px</td>
                  <td><demo-token nombre="avatar/status" [nota]="t.punto + ' px'" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Tokens</caption>
            <thead>
              <tr>
                <th scope="col">Parte</th>
                <th scope="col">Token</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Borde</th>
                <td><demo-token nombre="border/low-contrast" nota="1 px" /></td>
              </tr>
              <tr>
                <th scope="row">Punto de estado</th>
                <td><demo-token nombre="avatar/status" /></td>
              </tr>
              <tr>
                <th scope="row">Anillo del punto</th>
                <td><demo-token nombre="background/surface" nota="2 px por fuera" /></td>
              </tr>
              <tr>
                <th scope="row">Iniciales<small>Sin foto o si la imagen no carga</small></th>
                <td>
                  <demo-token parte="Fondo" nombre="brand/primary" />
                  <demo-token parte="Texto" nombre="text/inverse" nota="SemiBold" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="doc-seccion" aria-labelledby="t-ejemplos">
        <header class="doc-encabezado">
          <h2 id="t-ejemplos" class="doc-titulo">Ejemplos</h2>
          <p class="doc-descripcion">
            Con el nombre escrito al lado, usa decorative para que el lector de pantalla no lo lea dos veces. Si la foto no carga,
            el avatar muestra las iniciales.
          </p>
        </header>
        <demo-ejemplo titulo="Con el nombre al lado" nombre="persona" [html]="codigo.persona">
          <div class="persona">
            <uki-avatar name="Mariana López Hernández" [src]="foto" decorative />
            <div>
              <p class="uki-label">Mariana López Hernández</p>
              <p class="uki-caption">Responsable del proyecto</p>
            </div>
          </div>
        </demo-ejemplo>
        <demo-ejemplo titulo="La foto no carga" nombre="error" [html]="codigo.error">
          <uki-avatar size="lg" name="Ángel del Río" src="avatar-que-no-existe.jpg" data-prueba="avatar-error" />
        </demo-ejemplo>
      </section>
    </div>
  `,
  styles: `
    .persona {
      display: flex;
      align-items: center;
      gap: var(--spacing-12);
    }
    .persona p {
      margin: 0;
    }
    .persona .uki-caption {
      color: var(--text-secondary);
    }
  `,
})
export default class AvatarPagina {
  protected readonly foto = FOTO;
  protected readonly tamanos = TAMANOS;
  protected readonly partes = PARTES;
  protected readonly codigo = {
    importar: `import { UkiAvatar } from '@banobras/uki';

@Component({
  imports: [UkiAvatar],
  // …
})`,
    tamanos: `<uki-avatar size="xs" name="Mariana López Hernández" src="/fotos/mlopez.jpg" status />
<uki-avatar size="sm" name="Mariana López Hernández" src="/fotos/mlopez.jpg" status />
<uki-avatar name="Mariana López Hernández" src="/fotos/mlopez.jpg" status />
<uki-avatar size="lg" name="Mariana López Hernández" src="/fotos/mlopez.jpg" status />
<uki-avatar size="xl" name="Mariana López Hernández" src="/fotos/mlopez.jpg" status />`,
    iniciales: `<!-- Sin src: iniciales «ML» (se omiten «de», «del», «la», «los», «las» y «y»). -->
<uki-avatar name="María de la Luz Pérez" />
<!-- Iniciales fijas -->
<uki-avatar name="Banobras" initials="BN" />`,
    persona: `<div class="persona">
  <uki-avatar name="Mariana López Hernández" src="/fotos/mlopez.jpg" decorative />
  <div>
    <p class="uki-label">Mariana López Hernández</p>
    <p class="uki-caption">Responsable del proyecto</p>
  </div>
</div>`,
    error: `<!-- Si la imagen falla, se muestran las iniciales «ÁR». -->
<uki-avatar size="lg" name="Ángel del Río" [src]="persona.foto" />`,
  };
}
