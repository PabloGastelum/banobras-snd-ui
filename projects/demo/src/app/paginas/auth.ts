import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UkiAlert, UkiAuth, UkiButton, UkiField, UkiInput } from '@banobras/uki';
import { DocAnatomia, Parte } from '../doc/anatomia';
import { DemoEjemplo } from '../doc/ejemplo';
import { DocToken } from '../doc/token';

const SISTEMA = 'Sistema de Administración y Actualización del Inventario de Procesos de BANOBRAS';

const PARTES: Parte[] = [
  { selector: '.uki-auth__marca', nombre: 'Logotipo', detalle: 'Banobras · Color · 284 × 60 · centrado arriba', lado: 'arriba' },
  { selector: '.uki-auth__encabezado', nombre: 'Encabezado', detalle: 'Título Heading/H3 (es el h1) + nombre del sistema Body/Small', lado: 'arriba', alinear: 'inicio' },
  { selector: '.uki-alert', nombre: 'Alert', detalle: 'Alert · Warning · opcional, solo para problemas reales', lado: 'abajo', alinear: 'inicio' },
  { selector: '.uki-field', nombre: 'Campos', detalle: 'Text field × 2 · usuario y contraseña · requeridos', lado: 'abajo', alinear: 'inicio' },
  { selector: '.uki-button', nombre: 'Botón', detalle: 'Button · Primary · Default · ancho completo (400 px)', lado: 'abajo' },
  { selector: '.uki-auth__pie', nombre: 'Aviso de derechos', detalle: 'Caption · «© año BANOBRAS.» en SemiBold', lado: 'abajo' },
];

/** Página Auth de Figma: el bloque de inicio de sesión. */
@Component({
  selector: 'demo-auth',
  imports: [ReactiveFormsModule, UkiAuth, UkiAlert, UkiField, UkiInput, UkiButton, DemoEjemplo, DocAnatomia, DocToken],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="doc-pagina">
      <section class="doc-seccion" aria-labelledby="t-resumen">
        <header class="doc-encabezado">
          <h1 id="t-resumen" class="doc-titulo">Auth</h1>
          <p class="doc-descripcion">
            El bloque de inicio de sesión del portal. Pide el usuario y la contraseña y muestra un aviso opcional cuando algo
            necesita atención. Combínalo con Hero para armar la pantalla de acceso completa.
          </p>
        </header>
        <div class="doc-tarjetas">
          <article class="doc-tarjeta">
            <h3>Úsalo para</h3>
            <p>La pantalla de acceso de los sistemas internos y portales. Un bloque Auth por pantalla, centrado en su columna.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Junto a Hero</h3>
            <p>En escritorio va junto a Hero (644 + 636 = 1280 px). En tableta y teléfono queda solo Auth.</p>
          </article>
          <article class="doc-tarjeta">
            <h3>Mensajes claros</h3>
            <p>Usa el Alert solo para problemas reales, como una contraseña incorrecta o una cuenta bloqueada.</p>
          </article>
        </div>
        <div class="aviso" role="note">
          <strong>Sin lógica de autenticación.</strong>
          uki-auth es solo la maquetación: el formulario, sus validaciones y lo que pasa al enviarlo son del sistema. En este
          ejemplo, enviar solo muestra el aviso.
        </div>
        <demo-ejemplo titulo="Auth con formulario reactivo" nombre="auth" [html]="codigo.html" [ts]="codigo.ts" fondo="pagina">
          <uki-auth heading="Inicia sesión en tu cuenta" [systemName]="sistema" [headingLevel]="2" data-prueba="auth">
            @if (error()) {
              <uki-alert type="warning">El usuario o la contraseña no coinciden. Revisa los datos e intenta de nuevo.</uki-alert>
            }
            <form [formGroup]="acceso" (ngSubmit)="entrar()" novalidate>
              <uki-field label="Usuario" required error="Escribe tu usuario.">
                <input ukiInput autocomplete="username" placeholder="Ingresa tu usuario" formControlName="usuario" />
              </uki-field>
              <uki-field label="Contraseña" required error="Escribe tu contraseña.">
                <input ukiInput type="password" autocomplete="current-password" placeholder="Ingresa tu contraseña" formControlName="contrasena" />
              </uki-field>
              <button ukiButton type="submit">Iniciar sesión</button>
            </form>
          </uki-auth>
        </demo-ejemplo>
      </section>

      <section class="doc-seccion" aria-labelledby="t-anatomia">
        <header class="doc-encabezado">
          <h2 id="t-anatomia" class="doc-titulo">Anatomía</h2>
          <p class="doc-descripcion">
            Seis partes forman el bloque. Cada una es un componente o un estilo de UKI, así que un cambio en la librería
            actualiza el bloque.
          </p>
        </header>
        <demo-anatomia [partes]="partes" [escala]="0.6">
          <uki-auth class="anatomia" heading="Inicia sesión en tu cuenta" [systemName]="sistema" [year]="2026" [headingLevel]="2">
            <uki-alert type="warning">El usuario o la contraseña no coinciden.</uki-alert>
            <form>
              <uki-field label="Usuario" required><input ukiInput placeholder="Ingresa tu usuario" /></uki-field>
              <uki-field label="Contraseña" required><input ukiInput type="password" placeholder="Ingresa tu contraseña" /></uki-field>
              <button ukiButton type="button">Iniciar sesión</button>
            </form>
          </uki-auth>
        </demo-anatomia>
      </section>

      <section class="doc-seccion" aria-labelledby="t-composicion">
        <header class="doc-encabezado">
          <h2 id="t-composicion" class="doc-titulo">Composición</h2>
          <p class="doc-descripcion">
            Las piezas de Auth y de dónde vienen. El componente de Figma usa variables que no son de UKI (color-background,
            color-text, Neutral/gray-500); aquí se usan los tokens semánticos equivalentes.
          </p>
        </header>
        <div class="doc-tabla-contenedor" tabindex="0">
          <table class="doc-tabla">
            <caption>Composición de Auth</caption>
            <thead>
              <tr>
                <th scope="col">Parte</th>
                <th scope="col">Origen</th>
                <th scope="col">Token o estilo</th>
                <th scope="col">Nota</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">Fondo</th><td>Auth</td><td><demo-token nombre="background/surface" /></td><td>Figma: color-background</td></tr>
              <tr><th scope="row">Logotipo</th><td>Banobras · Color</td><td>—</td><td>Centrado arriba</td></tr>
              <tr><th scope="row">Título</th><td>Heading/H3</td><td><demo-token nombre="text/primary" /></td><td>Es el h1 de la página</td></tr>
              <tr><th scope="row">Nombre del sistema</th><td>Body/Small</td><td><demo-token nombre="text/secondary" /></td><td>systemName</td></tr>
              <tr><th scope="row">Aviso</th><td>Alert · Warning</td><td><demo-token nombre="feedback/warning/background" /></td><td>Opcional</td></tr>
              <tr><th scope="row">Campos</th><td>Text field</td><td><code>field/*</code></td><td>Usuario y contraseña, requeridos</td></tr>
              <tr><th scope="row">Botón</th><td>Button · Primary</td><td><demo-token nombre="button/primary" /></td><td>A lo ancho (400 px)</td></tr>
              <tr><th scope="row">Aviso de derechos</th><td>Caption</td><td><demo-token nombre="text/secondary" /></td><td>El mismo texto que el Footer</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: `
    .aviso {
      padding: var(--spacing-16) var(--spacing-24);
      border-left: 4px solid var(--feedback-info-foreground);
      border-radius: var(--radius-8);
      background: var(--feedback-info-background);
      color: var(--text-primary);
      font-size: var(--font-size-body-sm);
      line-height: var(--font-line-height-body-sm);
    }
    .anatomia {
      width: 636px;
    }
  `,
})
export default class AuthPagina {
  protected readonly sistema = SISTEMA;
  protected readonly partes = PARTES;
  protected readonly error = signal(false);
  protected readonly acceso = new FormGroup({
    usuario: new FormControl('', { nonNullable: true, validators: Validators.required }),
    contrasena: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  protected entrar(): void {
    this.acceso.markAllAsTouched();
    // La documentación no autentica: con los campos llenos muestra el aviso de ejemplo.
    this.error.set(this.acceso.valid);
  }

  protected readonly codigo = {
    html: `<main>
  <uki-auth heading="Inicia sesión en tu cuenta"
            systemName="Sistema de Administración y Actualización del Inventario de Procesos de BANOBRAS">
    @if (error()) {
      <uki-alert type="warning">El usuario o la contraseña no coinciden. Revisa los datos e intenta de nuevo.</uki-alert>
    }
    <form [formGroup]="acceso" (ngSubmit)="entrar()" novalidate>
      <uki-field label="Usuario" required error="Escribe tu usuario.">
        <input ukiInput autocomplete="username" formControlName="usuario" />
      </uki-field>
      <uki-field label="Contraseña" required error="Escribe tu contraseña.">
        <input ukiInput type="password" autocomplete="current-password" formControlName="contrasena" />
      </uki-field>
      <button ukiButton type="submit" [loading]="entrando()">Iniciar sesión</button>
    </form>
  </uki-auth>
</main>`,
    ts: `import { UkiAlert, UkiAuth, UkiButton, UkiField, UkiInput } from '@banobras/uki';

@Component({
  imports: [ReactiveFormsModule, UkiAuth, UkiAlert, UkiField, UkiInput, UkiButton],
})
export class Acceso {
  private readonly sesion = inject(SesionService);
  protected readonly error = signal(false);
  protected readonly entrando = signal(false);
  protected readonly acceso = new FormGroup({
    usuario: new FormControl('', { nonNullable: true, validators: Validators.required }),
    contrasena: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  // La autenticación es del sistema (y del servidor), no de UKI.
  protected async entrar(): Promise<void> {
    if (this.acceso.invalid) return this.acceso.markAllAsTouched();
    this.entrando.set(true);
    this.error.set(!(await this.sesion.iniciar(this.acceso.getRawValue())));
    this.entrando.set(false);
  }
}`,
  };
}
