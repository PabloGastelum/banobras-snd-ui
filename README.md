<div align="center">

<img src="projects/demo/public/favicon-guinda.svg" alt="" width="72" height="72">

# @banobras/uki

**Componentes Angular del sistema de diseño UKI de Banobras.**<br>
Un solo paquete para que Portal FONADIN, SISSARR, SAAIPB, SISEC y SIVARMER se vean idénticos.

[![Angular 20–22](https://img.shields.io/badge/Angular-20%E2%80%9322-611232?logo=angular&logoColor=white)](https://angular.dev)
[![UKI en Figma v0.5.0](https://img.shields.io/badge/Figma-UKI%20v0.5.0-611232?logo=figma&logoColor=white)](https://www.figma.com/design/6fzZVvIfv44dGFePtb5F9n/UKI---Library)
[![Temas guinda y verde](https://img.shields.io/badge/temas-guinda%20%C2%B7%20verde-002F2A)](#temas)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-086308)](#accesibilidad)
[![Versión 0.1.0](https://img.shields.io/badge/versi%C3%B3n-0.1.0-434343)](projects/uki/package.json)

**[Ver la documentación en vivo →](https://banobras-uki.vercel.app)**

[Inicio rápido](#inicio-rápido) · [Componentes](#qué-incluye) · [Temas](#temas) · [Documentación](#documentación) · [Desarrollo](#desarrollo)

<br>

<img src="docs/img/inicio.png" alt="Portada de la documentación de UKI: título UKI - Library, descripción del sistema de diseño de Banobras y la composición de círculos de la marca en guinda." width="900">

</div>

## Por qué existe

El Sistema Nacional de Diseño solo se distribuye como CSS y JS por CDN: no hay paquete npm, la URL versionada cambia de contenido sin aviso, `snd.js` no funciona con lo que Angular pinta después y no trae diseño para formularios. Banobras ya tiene su sistema en Figma, **UKI - Library**, con la misma paleta del SND y tokens por componente, pero sin implementación en código.

`@banobras/uki` es esa implementación: tokens generados desde Figma, componentes standalone con signals y una documentación viva para que diseño y QA comparen contra Figma.

## Qué incluye

| Pieza | Selector | API |
|---|---|---|
| **Estilos globales** | `styles/uki.css` | Tokens como variables CSS (`--button-primary`, `--spacing-16`…), temas guinda y verde, fuentes Patria y Noto Sans, clases de texto `uki-heading-1` … `uki-link`. |
| **Button** | `<button ukiButton>` · `<a ukiButton>` | `variant`: `primary` · `secondary` · `ghost` · `danger`<br>`size`: `default` · `large`<br>`loading` · `disabled` · íconos con `ukiButtonLeading` / `ukiButtonTrailing` |
| **Button group** | `<div ukiButtonGroup>` | A la derecha en escritorio; apilado con el Primary arriba en móvil. |
| **Checkbox** | `<uki-checkbox>` | `ControlValueAccessor` · `[(checked)]` · `[(indeterminate)]` · `disabled` · `ariaLabel` |
| **Text field** | `<uki-field>` + `<input ukiInput>` | `label` · `required` · `helper` · `error`; el input nativo conserva `type`, `autocomplete` y `formControlName` |
| **Text area** | `<uki-field [maxlength]>` + `<textarea ukiInput>` | Contador «n/máximo» con límite flexible (el error lo marca el validador) |
| **Select** | `<uki-select>` | `options` · `placeholder` · `label` · `required` · `helper` · `error`; *select-only combobox* de WAI-ARIA con teclado completo |
| **Search** | `<uki-search>` | `size`: `default` (40 px) · `large` (48 px) · `(buscar)` con espera de 300 ms · `resultados` anunciados · × y Esc borran |
| **Spinner** | `<uki-spinner>` | `size`: 24 · 36 · 48 · `label` |
| **Alert** | `<uki-alert>` | `type`: `success` · `info` · `warning` · `error` · `icon` · `dismissible` · `[(open)]`; el mensaje es el contenido (admite enlaces) |
| **Toast** | `UkiToastService` | `success()` · `info()` · `warning()` · `error()` · `show({ type, title, description, duration })`; uno a la vez, anunciado sin mover el foco |
| **Badge** | `<uki-badge>` | `type`: `success` · `info` · `warning` · `error`; la etiqueta es el contenido |
| **Avatar** | `<uki-avatar>` | `name` · `src` · `size`: `xs` 24 · `sm` 32 · `md` 40 · `lg` 48 · `xl` 56 · `status` · `decorative` · `initials` |
| **Modal** | `<uki-modal>` · `UkiDialogService` | `[(open)]` · `title` · `size`: `default` 640 · `small` 480 · `type`: `informative` · `confirmation` · `closeOnEsc` · `closeOnBackdrop` · `(closed)`; `ukiModalFooter`, `ukiModalClose`, `ukiModalFocus`; servicio con `confirm()` → `Promise<boolean>` e `inform()` |
| **Breadcrumbs** | `<uki-breadcrumbs>` | `[items]`: `{ label, link?, href? }`; el último es la página actual · desde 5 niveles colapsa en «…» · en móvil, enlace «‹ Padre» |
| **Logotipos** | `<uki-logo-banobras>` · `<uki-logo-banobras-icon>` · `<uki-logo-gobmx>` · `<uki-logo-hacienda>` · `<uki-logo-fonadin>` | `theme`: `color` · `white` (GobMX y Hacienda: `default` · `white`) · `size`: `default` 60 px · `small` 32 px · `label` · `decorative` · `clearSpace` · `--uki-logo-alto`; SVG con `role="img"` y nombre accesible |
| **Header** | `<header ukiHeader>` | Barra de 60 px con `header/background`; el contenido va a la derecha |
| **Menú de usuario** | `<uki-user-menu>` | `name` · `userRole` · `avatarSrc` · `ariaLabel` · `(signOut)`; opciones propias con `ukiUserMenuItem`; patrón de botón de menú de WAI-ARIA |
| **Footer** | `<footer ukiFooter>` | `year`; «© año BANOBRAS.» en SemiBold y el contenido proyectado (por omisión, «Todos los derechos reservados») |
| **Sidebar** | `<uki-sidebar>` | `[items]`: `{ label, icon?, link?, href?, children?, section?, bottomBar? }` · `user` · `topbarLink` · `[(collapsed)]` · `device`: `auto` · `desktop` · `mobile` · `ariaLabel`; íconos propios con `ukiSidebarIcon` |
| **Auth** | `<uki-auth>` | `heading` · `systemName` · `headingLevel` · `year`; el formulario del sistema va proyectado |
| **Hero** | `<uki-hero>` | `illustrationSrc` (La Patria, decorativa); se oculta debajo de 1280 px |
| **Table** | `<uki-table>` | `caption` · `columns` · `rows` (solo la página) · `total` · `rowKey` · `rowLabel` · `selectable` + `[(selection)]` · `actions` · `searchable` + `(searchChange)` · `loading` · `[(page)]` · `[(pageSize)]` · `[(sort)]` · `(action)`; celdas propias con `ukiTableCell`; tarjetas en móvil |

> [!NOTE]
> UKI va en la v0.5.0 de Figma y todavía puede cambiar tokens antes de su v1.0.0. El paquete registra la versión que implementa en `uki.figmaVersion` de [`projects/uki/package.json`](projects/uki/package.json).

## Inicio rápido

**1. Instala el paquete.** Mientras no esté en el registro privado, genera el `.tgz` en este repositorio con `npm run pack:uki` e instálalo en tu proyecto:

```bash
npm install ../banobras-snd-ui/dist/uki/banobras-uki-0.1.0.tgz
```

Pide como peerDependencies `@angular/common`, `core`, `forms` y `router` de la versión 20 a la 22 (Breadcrumbs usa `routerLink`).

**2. Agrega los estilos globales** antes de los del proyecto, en `angular.json`:

```json
"styles": ["node_modules/@banobras/uki/styles/uki.css", "src/styles.css"]
```

Las fuentes van dentro del paquete: Angular las copia al `dist` y no se pide nada a CDNs externos.

**3. Importa los componentes** que uses; cada uno trae solo su CSS:

```ts
import { Component, signal } from '@angular/core';
import { UkiButton } from '@banobras/uki';

@Component({
  selector: 'app-guardar',
  imports: [UkiButton],
  template: `<button ukiButton type="button" [loading]="guardando()" (click)="guardar()">Guardar</button>`,
})
export class Guardar {
  protected readonly guardando = signal(false);
  protected guardar(): void { /* … */ }
}
```

## Uso

```html
<!-- Botones: el elemento nativo conserva type, foco, teclado y envío de formularios. -->
<button ukiButton type="submit" [loading]="guardando()">Guardar</button>
<button ukiButton variant="secondary" type="button">Cancelar</button>
<button ukiButton variant="danger" type="button">Eliminar</button>
<a ukiButton variant="ghost" routerLink="/aviso">Aviso de privacidad</a>

<!-- Grupo: en el DOM, Ghost → Secondary → Primary. -->
<div ukiButtonGroup>
  <button ukiButton variant="ghost" type="button">Cancelar</button>
  <button ukiButton type="submit">Continuar</button>
</div>

<!-- Checkbox con formularios reactivos, ngModel o [(checked)]. -->
<uki-checkbox formControlName="aceptaTerminos">Acepto los términos</uki-checkbox>
<uki-checkbox [(ngModel)]="avisos">Recibir avisos</uki-checkbox>
<uki-checkbox [(checked)]="todas" [indeterminate]="algunas()" ariaLabel="Seleccionar todas las filas" />

<uki-spinner size="36" label="Cargando resultados" />

<!-- Campos: el error aparece al salir de un campo inválido o al enviar. -->
<uki-field label="Correo electrónico" helper="Te enviaremos el acuse." error="Escribe un correo con el formato nombre@dominio.mx">
  <input ukiInput type="email" autocomplete="email" formControlName="correo" />
</uki-field>
<uki-field label="Motivo" [maxlength]="500" error="Usa máximo 500 caracteres.">
  <textarea ukiInput formControlName="motivo"></textarea>
</uki-field>
<uki-select label="Tipo de trámite" [options]="tramites" formControlName="tramite" error="Elige un tipo de trámite." />
<uki-search placeholder="Buscar por folio o solicitante" ariaLabel="Buscar en la tabla"
            [resultados]="total()" (buscar)="filtrar($event)" />

<!-- Retroalimentación: Error lleva role="alert"; los demás, role="status". -->
<uki-alert type="error" dismissible [(open)]="hayError">
  No pudimos enviar la solicitud. <a routerLink="/requisitos">Revisa los requisitos</a>.
</uki-alert>
<uki-badge type="warning">En revisión</uki-badge>
<uki-avatar name="Mariana López Hernández" src="/fotos/mlopez.jpg" size="lg" status />

<!-- Navegación y datos: la tabla no ordena, filtra ni pagina; emite eventos y el servidor responde. -->
<uki-breadcrumbs [items]="[{ label: 'Inicio', link: '/' }, { label: 'Trámites', link: '/tramites' }, { label: 'SOL-2026-0148' }]" />
<uki-table caption="Solicitudes" [columns]="columnas" [rows]="pagina().filas" [total]="pagina().total"
           [rowKey]="porFolio" selectable [(selection)]="seleccion" [actions]="['view', 'edit', 'delete']"
           searchable [loading]="cargando()" [(page)]="numero" [(pageSize)]="tamano" [(sort)]="orden"
           (searchChange)="buscar($event)" (action)="actuar($event)">
  <ng-template ukiTableCell="estado" let-fila><uki-badge [type]="fila.tipo">{{ fila.estado }}</uki-badge></ng-template>
</uki-table>
<!-- Marco de las pantallas de administración (plantilla en la documentación). -->
<uki-sidebar [items]="menu" [user]="persona" [topbarLink]="{ label: 'Ir a Llave MX', href: llaveMx }" />
<header ukiHeader>
  <uki-user-menu name="Mariana López Hernández" userRole="Administradora" (signOut)="salir()" />
</header>
<footer ukiFooter></footer>

<!-- Pantalla de acceso: maquetación de UKI, formulario y autenticación del sistema. -->
<uki-hero illustrationSrc="/assets/la-patria.webp" />
<main>
  <uki-auth heading="Inicia sesión en tu cuenta" systemName="Sistema de Administración y Actualización…">
    <form [formGroup]="acceso" (ngSubmit)="entrar()">…</form>
  </uki-auth>
</main>

<uki-modal [(open)]="editando" title="Cambiar responsable" size="small">
  …
  <div ukiModalFooter>
    <button ukiButton variant="secondary" type="button" ukiModalClose>Cancelar</button>
    <button ukiButton type="submit" form="responsable">Guardar</button>
  </div>
</uki-modal>
```

```ts
// Toast: desde el código, sin nada en la plantilla. Success e Info se cierran a los 5 s; Warning y Error, al cerrarlos.
private readonly avisos = inject(UkiToastService);

guardar(): void {
  this.avisos.success('Solicitud enviada', 'Te enviamos el acuse por correo.');
}

// Modal de confirmación desde el código: el botón Danger repite la acción.
private readonly dialogos = inject(UkiDialogService);

async eliminar(folio: string): Promise<void> {
  const confirmado = await this.dialogos.confirm({
    title: '¿Eliminar el trámite?',
    message: 'Esta acción no se puede deshacer.',
    confirmLabel: 'Eliminar',
    destructive: true,
  });
  if (confirmado) this.tramites.eliminar(folio);
}
```

<details>
<summary><strong>Detalles de comportamiento</strong></summary>

- `type` no se fija por ti: dentro de un `<form>`, un `<button>` sin `type` envía el formulario, como en HTML.
- `loading` ignora clics y envíos sin quitar el foco y marca `aria-busy`. El texto se oculta a la vista, pero sigue siendo el nombre accesible. La variante `ghost` no tiene loading en UKI.
- En `<a ukiButton disabled>` se cancela la navegación y el enlace sale del orden de tabulación.
- `indeterminate` se apaga cuando la persona hace clic, igual que en el control nativo.
- **Toast** crea una sola región al final de `<body>` con dos regiones vivas fijas (`status` y `alert`); el aviso no toma el foco, se pausa con el puntero encima o el foco dentro, y Esc lo cierra si el foco está dentro. Un aviso nuevo reemplaza al visible.
- **Alert** con `dismissible` se oculta al cerrarlo y lleva el foco al siguiente elemento enfocable.
- **Avatar** sin `src`, o si la foto no carga, muestra las iniciales de `name` (sin «de», «del», «la», «los», «las» ni «y») sobre `brand/primary`. Con el nombre escrito al lado, usa `decorative`.
- **Modal** usa `<dialog>` con `showModal()`: queda en la capa superior y lo de atrás es inerte. El foco entra a Cancelar (Confirmation), al botón principal (Informative) o al elemento con `ukiModalFocus`; da la vuelta con Tab y vuelve al disparador al cerrar. Esc y × cierran; un clic en el velo no, salvo con `closeOnBackdrop`. El scroll de la página se bloquea y la región de avisos de Toast pasa dentro del modal abierto.
- **Capa superpuesta**: la lista del Select, el menú «…» de Breadcrumbs y los tooltips de Table se colocan con `position: fixed` (y en la capa superior con el Popover API, si el navegador lo tiene). No se recortan dentro de contenedores con `overflow: hidden`.
- **Logotipos**: Figma pide usar solo los vectores oficiales. Mientras se confirman los derechos de uso y llegan los archivos, cada logotipo dibuja un marcador con su tamaño, su espacio libre y su nombre accesible (y avisa una vez en desarrollo). Sus colores son los oficiales: el tema verde no los cambia.
- **Menú de usuario**: Enter, Espacio o ↓ abren en la primera opción y ↑ en la última; las flechas, Inicio y Fin se mueven; Esc cierra y devuelve el foco; Tab cierra. «Cerrar sesión» solo emite `signOut`.
- **Sidebar** cambia de forma con el ancho: expandida (256 px, acordeón de hasta 3 niveles, una rama abierta) desde 1280 px; colapsada (56 px, panel flotante con puntero o teclado) de 768 a 1279 px o al contraerla; en teléfono, barra inferior fija con 3 destinos y «Más», que abre un panel de pantalla completa sobre la pila de modales. Llena el alto de su columna: solo la lista hace scroll. Marca la página actual con `aria-current="page"` según el router. El activo usa `sidebar/mobile-active` (con `sidebar/item-active` el texto blanco no llega a 4.5:1).
- **Auth** no autentica: dibuja logotipo, título (`<h1>`), nombre del sistema, el contenido proyectado y el aviso de derechos; acomoda un `<form>` proyectado como en Figma (campos a 16 px y botón a lo ancho).
- **Table** recibe solo la página actual. Emite `sort`, `page`, `pageSize`, `searchChange` y `action`; la selección son las claves de `rowKey` y se conserva entre páginas. Debajo de 768 px dibuja tarjetas en lugar de la tabla.

</details>

## Temas

Guinda es el tema por omisión. Para el verde (proyectos transversales) agrega el atributo a `<html>` o a cualquier contenedor:

```html
<html lang="es-MX" data-uki-theme="verde">
```

Solo cambian los 29 tokens semánticos que dependen de la marca, y todos los componentes lo siguen.

> [!TIP]
> En tus propios componentes usa siempre tokens semánticos (`var(--button-primary)`, `var(--text-brand)`), nunca primitivos (`var(--pguinda-900)`). Así el tema funciona sin tocar código.

<img src="docs/img/button-verde.png" alt="Página de Button de la documentación con el tema verde: barra lateral y botones Primary en verde institucional." width="900">

## Documentación

La documentación está publicada en **<https://banobras-uki.vercel.app>** (despliegue de prueba en Vercel; se actualiza con cada push a `main`). En local, `npm start` la levanta en <http://localhost:4320>. Sigue la distribución de las páginas de UKI en Figma.

| | |
|---|---|
| <img src="docs/img/ejemplo-codigo.png" alt="Ejemplo de formulario reactivo con «Ver código» abierto y pestañas avisos.html y avisos.ts." width="440"> | <img src="docs/img/menu-movil.png" alt="Menú de navegación abierto en un teléfono, con la marca UKI, los grupos Fundamentos y Componentes y el botón para cerrar." width="200"> |
| **Ejemplos vivos.** Cada ejemplo tiene «Ver código» (pestañas `.html` / `.ts` / `.css` con resaltado) y «Copiar». Los tokens y las escalas de color se copian con un clic. | **Responsiva.** En móvil la navegación vive en un menú lateral; en escritorio hay índice «En esta página» y anterior/siguiente. |

Incluye **Marca** (logotipos), **Fundamentos** (colores, espaciado, retícula, radios, elevación y tipografía), **Componentes** (Alert, Avatar, Badge, Breadcrumbs, Button, Checkbox, Modal, Search, Select, Spinner, Table, Text area, Text field y Toast, con la distribución de cada página de Figma: Overview, Átomos o Moléculas, Anatomía y Estados, Tipos o Tamaños) y **Patrones** (Auth, Footer, Header, Hero y Sidebar, más las plantillas «Pantalla de acceso» y «Pantalla de administración» con muestras a pantalla completa y a 375 px), además de un selector de tema y un enlace a Figma en cada página.

## Accesibilidad

- WCAG 2.1 AA verificado con axe en todas las páginas de la documentación, en escritorio y en móvil, y con los dos temas.
- Controles nativos (`<button>`, `<a>`, `<input type="checkbox">`): teclado, foco y lectores de pantalla sin reinventarlos.
- Foco visible con borde exterior que no depende solo del color, y Spinner con `prefers-reduced-motion`.
- Compatible con CSP con nonce: no genera atributos `style` ni scripts en línea; los estilos de componente siguen `ngCspNonce` de Angular.

## Desarrollo

Requiere Node 24.11.1 o posterior.

| Comando | Qué hace |
|---|---|
| `npm start` | Documentación en <http://localhost:4320> |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run lint` · `npm run typecheck` | ESLint y TypeScript |
| `npm run build:uki` | Compila la librería en `dist/uki` |
| `npm run pack:uki` | Genera `dist/uki/banobras-uki-<versión>.tgz` |
| `npm run e2e` | Playwright + axe sobre la documentación |
| `npm run tokens` · `npm run tokens:check` | Regenera `tokens.css` desde Figma y comprueba que esté al día |
| `npm run verify:consumo` | Instala el `.tgz` en aplicaciones nuevas de Angular 20.3 y 22.2 y las compila (Angular 22.2 exige Node 24.15+) |

<details>
<summary><strong>Estructura del repositorio</strong></summary>

```text
projects/
  uki/                 Librería @banobras/uki
    src/lib/           button, button-group, checkbox, spinner, field, select, search,
                       alert, toast, badge, avatar, modal, breadcrumbs, table,
                       marca (logotipos), header, footer, sidebar, auth (Auth y Hero),
                       capa (interna: capa superpuesta y tooltip)
    styles/            uki.css → fonts.css, tokens.css (generado), base.css
    tokens/            uki-figma.json, exportado de Figma
    fonts/             Patria y Noto Sans, con sus licencias
  demo/                Documentación (Angular)
e2e/                   Playwright + axe
scripts/               generar-tokens.mjs, verify-consumo.sh
docs/sdlc/             Intención, especificación y plan
```

</details>

### Cuando UKI publique una versión nueva

1. Exporta otra vez las variables de Figma a `projects/uki/tokens/uki-figma.json` (formato `nombre|tipo|valor por modo`).
2. `npm run tokens` regenera `styles/tokens.css`. No se edita a mano.
3. Actualiza `uki.figmaVersion` en `projects/uki/package.json` y sube la versión del paquete: menor si UKI solo agregó tokens, mayor si renombró o quitó alguno.
4. Corre todas las pruebas y revisa la documentación contra Figma.

## Pendientes antes de publicar

> [!WARNING]
> **Licencia de Patria.** Noto Sans va recortada a latín en woff2 (72 KB en lugar de 4.3 MB) con su licencia OFL. Patria va sin cambios y su licencia debe confirmarse antes de publicar el paquete. Ver [`projects/uki/fonts/LICENCIAS.md`](projects/uki/fonts/LICENCIAS.md).

- Registro privado y responsable de publicar versiones.
- Comparar con Figma la estela del Spinner y los íconos del Checkbox.
- Comparar con Figma los íconos dibujados (`check-circle`, `info-circle`, `exclamation-triangle`, `x-circle`, `x`) y confirmar con diseño las iniciales del Avatar sin foto y el relleno de Badge.
- Confirmar con diseño UKI: Danger en la confirmación destructiva, foco con `border/brand` en lugar de `button/focus-ring` (contraste), encabezado del Modal de 80 px (la anatomía dice 64), estilo del tooltip y cuál de las dos documentaciones de Breadcrumbs es la vigente.
- **Logotipos y La Patria**: confirmar los derechos de uso dentro del paquete e integrar los SVG oficiales (5 logotipos, color y blanco) y el archivo de la ilustración; hoy son marcadores.
- Confirmar con diseño UKI: `sidebar/mobile-active` para el elemento activo de la Sidebar (contraste), `admin/topbar` = 64 frente al Header de 60 y `admin/sidebar` = 64 frente a la Sidebar colapsada de 56, las variables ajenas a UKI del componente Auth, los patrones decorativos de Auth y Hero, la barra de marca «Ir a Llave MX» y si habrá un componente Icon público.
- Page Header y App shell siguen en progreso en Figma: hoy son plantillas documentadas. Radio aún no existe en UKI.

La intención, la especificación y el plan, con sus decisiones y desviaciones, están en [`docs/sdlc/`](docs/sdlc/).
