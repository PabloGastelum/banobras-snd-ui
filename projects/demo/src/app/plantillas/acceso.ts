import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UkiAlert, UkiAuth, UkiButton, UkiField, UkiHero, UkiInput } from '@banobras/uki';

/**
 * Plantilla «Pantalla de acceso»: Hero + Auth (644 + 636 = 1280 px) en escritorio; debajo de 1280 px, solo Auth. Sin
 * barra de la documentación, para verla a pantalla completa o en un iframe de 375 px. No autentica.
 */
@Component({
  selector: 'demo-plantilla-acceso',
  imports: [ReactiveFormsModule, UkiHero, UkiAuth, UkiAlert, UkiField, UkiInput, UkiButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="acceso">
      <uki-hero class="acceso__hero" />
      <main class="acceso__principal">
        <uki-auth heading="Inicia sesión en tu cuenta" systemName="Sistema de Administración y Actualización del Inventario de Procesos de BANOBRAS">
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
      </main>
    </div>
  `,
  styles: `
    .acceso {
      display: flex;
      justify-content: center;
      min-height: 100dvh;
      background: var(--background-surface);
    }
    .acceso__hero {
      flex: none;
      min-height: 100dvh;
    }
    .acceso__principal {
      display: flex;
      flex: 0 1 636px;
      justify-content: center;
    }
    @media (max-width: 1279.98px) {
      .acceso__principal {
        flex-basis: 100%;
      }
    }
  `,
})
export default class PlantillaAcceso {
  protected readonly error = signal(false);
  protected readonly acceso = new FormGroup({
    usuario: new FormControl('', { nonNullable: true, validators: Validators.required }),
    contrasena: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  protected entrar(): void {
    this.acceso.markAllAsTouched();
    this.error.set(this.acceso.valid);
  }
}
