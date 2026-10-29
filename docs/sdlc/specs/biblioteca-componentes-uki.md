# Spec: Biblioteca de componentes Angular del sistema de diseño UKI, entrega 1 (desde intent/biblioteca-componentes-uki.md)

- Sistema: compartido · Slug: `biblioteca-componentes-uki` · Estado: approved
- Aprobado por: Pablo Gastelum · Fecha: 29/10/2026
- Fuente de diseño: UKI - Library v0.5.0, archivo `6fzZVvIfv44dGFePtb5F9n`. Páginas leídas: Changelog (5:2), Colors (5:4), Button (195:3254), Checkbox (359:2693), Spinner (292:2961).
- Fuera de la fábrica: no aplican RN, TP ni `trazabilidad.csv`.

## Resumen
Se construye `@banobras/uki`, una librería de Angular que implementa los fundamentos de UKI (tokens, tipografías y estilos base del tema guinda) y sus primeros componentes: Button, Button group, Spinner y Checkbox. Incluye una aplicación de muestra para compararlos contra Figma. Es la primera entrega; los demás componentes siguen el mismo patrón en entregas posteriores.

## Decisiones de diseño
| # | Decisión | Motivo |
|---|---|---|
| D1 | La fuente de verdad es UKI (Figma), no el CSS del SND. No se carga `snd-*.css` ni `snd.js`. | UKI es el sistema de Banobras, usa la misma paleta del SND (`--pguinda-900` = `#611232` en ambos) y sí define formularios y estados. El CSS del SND usa otras clases y no cubre formularios. |
| D2 | Paquete `@banobras/uki`, prefijo `uki` en selectores. Confirmado por Pablo el 29/10/2026. | Lo que se implementa es UKI, no el SND. |
| D3 | Entradas, tokens y nombres de archivo en inglés, igual que Figma (`variant="secondary"`, `--button-primary`). Documentación, comentarios y textos por omisión en español. Confirmado por Pablo el 29/10/2026. | Correspondencia 1:1 entre Figma y código: lo que dice la propiedad en Figma es lo que se escribe en el template. |
| D4 | Los tokens son variables CSS en una hoja global (`uki.css`). Los componentes tienen estilos encapsulados que solo leen esas variables. | El consumidor importa un solo archivo global, y cada componente solo agrega su CSS si se usa. El tema verde se podrá añadir después redefiniendo variables, sin tocar componentes. |
| D5 | Componentes standalone, `ChangeDetectionStrategy.OnPush`, signals (`input()`, `model()`, `computed()`) y compatibles con aplicaciones sin zone.js. | Es la forma vigente en Angular 20–22 y la que usan FONADIN y SISEC. |
| D6 | Button es un componente con selector de atributo sobre `<button>` y `<a>`, no una etiqueta propia. | Conserva la semántica nativa: `type="submit"`, foco, teclado, `disabled` y lectores de pantalla. |
| D7 | Checkbox envuelve un `<input type="checkbox">` nativo con `appearance: none` e implementa `ControlValueAccessor`. | El control nativo da accesibilidad, `indeterminate` y teclado. CVA lo integra con formularios reactivos y `ngModel`. |
| D8 | Se compila con Angular 20.3 y se declara `peerDependencies` `>=20.0.0 <23.0.0`. | Angular 20 es la versión más baja de los proyectos conocidos. Una librería compilada en modo parcial funciona en versiones posteriores. |
| D9 | Mismas herramientas que FONADIN: Vitest con `@angular/build:unit-test`, Playwright con `@axe-core/playwright`, ESLint con `angular-eslint`. | Lo conoce el equipo y evita una segunda pila de pruebas. |

## Requisitos funcionales
| ID | Requisito verificable | Fuente en UKI |
|---|---|---|
| RF-1 | `uki.css` define como variables CSS todos los tokens primitivos y semánticos del modo Guinda, con el nombre de Figma pasado a kebab-case (`button/primary` → `--button-primary`, `checkbox/border` → `--checkbox-border`). | Colors, Spacing, Radius, Elevation, Typography, Layout |
| RF-2 | `uki.css` declara con `@font-face` Patria (Light, Regular, Bold) y Noto Sans (variable, normal e itálica) desde archivos dentro del paquete. No hay ninguna petición a dominios externos. | Typography |
| RF-3 | `uki.css` aplica estilos base: `body` en Noto Sans con `--text-primary` sobre `--background-page`, y clases para los 13 estilos de texto (`uki-heading-1` … `uki-heading-6`, cuerpo, etiqueta, leyenda, botón y liga) con sus medidas por dispositivo. | Typography |
| RF-4 | `button[ukiButton]` y `a[ukiButton]` aceptan `variant` (`primary` por omisión, `secondary`, `ghost`, `danger`), `size` (`default` 48 px, `large` 64 px), `loading` y `disabled`. | Button › Atoms, Anatomy |
| RF-5 | Cada combinación de variante y estado (Default, Hover, Focus, Pressed, Disabled, Loading) usa exactamente los tokens de la tabla «Botón: tokens por estado» de esta especificación. | Button › States |
| RF-6 | En `loading` se mantiene el ancho, el texto se oculta visualmente, se muestra el Spinner centrado del color del texto, se pone `aria-busy="true"` y los clics se ignoran sin perder el foco. En `ghost`, `loading` no tiene efecto y en desarrollo se avisa en consola. | Button › States («Loading · not available» en Ghost) |
| RF-7 | `disabled` en `<button>` usa el atributo nativo (ni clic ni foco). En `<a>` pone `aria-disabled="true"` y `tabindex="-1"`, y cancela la navegación. | Button › States › Disabled |
| RF-8 | El botón acepta ícono inicial y final de 24 px proyectados con los atributos `ukiButtonLeading` y `ukiButtonTrailing`. Heredan el color del texto. | Button › Anatomy |
| RF-9 | `[ukiButtonGroup]` alinea los botones a la derecha con `--spacing-16`. Por debajo de 768 px los apila a todo lo ancho con `--spacing-12` y el último del DOM (Primary) queda arriba. | Button › Button group |
| RF-10 | `<uki-spinner>` dibuja 12 puntos de 3.6 px (escalados) cada 30°, con el punto activo al 100 % y una estela de 90 % a 5 %, en `--icon-default` o `currentColor` cuando va dentro de un botón. Gira una vuelta por segundo de forma lineal e infinita. Acepta `size` de 24 (por omisión), 36 o 48 y `label` (por omisión «Cargando»), expuesto con `role="status"`. | Spinner |
| RF-11 | `<uki-checkbox>` tiene los valores Unchecked, Checked e Indeterminate y los estados Default, Hover, Focus y Disabled con los tokens de la tabla «Checkbox: tokens por estado». Área táctil de 40×40 px, caja de 20 px con `--radius-4` e ícono de 16 px. | Checkbox › Atoms, Anatomy, States |
| RF-12 | `<uki-checkbox>` implementa `ControlValueAccessor`: refleja `writeValue`, notifica cambios, marca `touched` al perder el foco y respeta `setDisabledState`. También expone `[(checked)]`, `[(indeterminate)]`, `disabled` y `ariaLabel` (para filas de tabla sin etiqueta visible). Al hacer clic en el texto de la etiqueta cambia el valor. | Checkbox › Overview |
| RF-13 | La aplicación `demo` muestra los fundamentos (paleta, espaciados, radios, tipografía) y cada componente en todas sus variantes, tamaños y valores, más un formulario reactivo y uno con `ngModel` que enseñan el valor y el estado del control. | — |

### Botón: tokens por estado
| Estado | Primary | Secondary | Ghost | Danger |
|---|---|---|---|---|
| Default | fondo `button/primary` · texto `text/inverse` | fondo `background/surface` · texto `text/brand` · borde 1 px `border/brand` | sin fondo · texto `text/brand` | fondo `button/danger` · texto `text/inverse` |
| Hover (solo con puntero) | fondo `button/primary-hover` · texto `text/inverse` | fondo `button/tint` · texto `text/brand` · borde 1 px `border/brand` | fondo `button/tint` · texto `button/primary-hover` | fondo `button/danger-hover` · texto `text/inverse` |
| Focus (teclado) | como Default + borde exterior 2 px `button/focus-ring` | como Default + borde exterior 3 px `border/brand` | fondo `button/tint` · texto `text/brand` + borde exterior 2 px `border/brand` | como Default + borde exterior 2 px `button/danger-focus-ring` |
| Pressed | fondo `button/tint` · texto `text/primary` | fondo `button/tint-pressed` · texto `text/brand` | fondo `button/tint-pressed` · texto `button/ghost-pressed` | fondo `button/danger-pressed` · texto `text/inverse` |
| Disabled | fondo `button/disabled-background` · texto `button/disabled-foreground` | fondo `background/surface` · texto y borde 1 px `button/disabled-border` | sin fondo · texto `button/disabled-foreground` | fondo `button/disabled-background` · texto `button/disabled-foreground` |
| Loading | como Default + Spinner | como Default + Spinner | no aplica | como Default + Spinner |

Medidas comunes: alto 48 px (Large 64 px), `--radius-8`, relleno horizontal `--spacing-24` (Ghost `--spacing-8`), texto con el estilo Button (Noto Sans 16/24, SemiBold).

Valores de referencia en modo Guinda: `button/primary` #611232, `button/primary-hover` #9b2247, `button/focus-ring` #ce92a6, `button/tint` #f3e4e9, `button/tint-pressed` #e1bdc9, `button/ghost-pressed` #4a0c26, `button/danger` #9b0f15, `button/danger-hover` #b8232a, `button/danger-pressed` #730a0f, `button/danger-focus-ring` #e8a0a3, `button/disabled-background` #dddddd, `button/disabled-foreground` #aaaaaa, `button/disabled-border` #767676.

### Checkbox: tokens por estado
| Estado | Unchecked | Checked / Indeterminate | Área táctil |
|---|---|---|---|
| Default | borde 2 px `checkbox/border` · fondo `background/surface` | fondo `checkbox/selected` · ícono `icon/inverse` | — |
| Hover | igual que Default | igual que Default | fondo `button/tint` |
| Focus | igual que Default | igual que Default | `button/focus-ring` al 24 % |
| Disabled | borde `border/low-contrast` · fondo `background/page` | fondo `text/disabled` | — · etiqueta en `text/disabled` |

Etiqueta: estilo Body/Small en `text/primary`. Íconos: `check-lg` y `dash-lg` de 16 px.

## Requisitos no funcionales
- **Accesibilidad:** WCAG 2.1 AA. axe con 0 violaciones en `demo`. Foco visible que no depende solo del color (borde exterior). Todo se opera con teclado (Tab, Espacio y Enter según el control nativo).
- **CSP:** sin estilos ni scripts en línea en el HTML generado. Los estilos de componente siguen la regla de Angular (`ngCspNonce` en la aplicación consumidora).
- **Movimiento:** con `prefers-reduced-motion: reduce`, el Spinner avanza en 12 pasos discretos en lugar de girar de forma continua.
- **Compatibilidad:** Angular 20.0–22.x, con o sin zone.js. Navegadores soportados por Angular 20.
- **Tamaño:** cada componente se puede importar por separado; lo que no se usa no entra en el bundle de la aplicación consumidora.

## Diseño
### Estructura
- Espacio de trabajo Angular CLI 20.3 con dos proyectos: `projects/uki` (librería, ng-packagr) y `projects/demo` (aplicación).
- `projects/uki/styles/`: `uki.css` (punto de entrada) importa `fonts.css`, `tokens.css` y `base.css`. Se copia al paquete junto con `fonts/` como *assets* de ng-packagr, de modo que las rutas `url(../fonts/…)` siguen resolviendo desde `node_modules`.
- `projects/uki/src/lib/<componente>/`: `<componente>.ts`, `<componente>.css`, `<componente>.spec.ts`.
- `projects/uki/src/public-api.ts` exporta `UkiButton`, `UkiButtonGroup`, `UkiSpinner`, `UkiCheckbox` y sus tipos (`UkiButtonVariant`, `UkiButtonSize`, `UkiSpinnerSize`).

### Contratos (API pública)
```html
<button ukiButton variant="secondary" size="large" [loading]="guardando()" [disabled]="!form.valid">
  <svg ukiButtonLeading …></svg> Guardar
</button>
<a ukiButton variant="ghost" routerLink="/aviso">Aviso de privacidad</a>

<div ukiButtonGroup>
  <button ukiButton variant="ghost">Cancelar</button>
  <button ukiButton>Continuar</button>
</div>

<uki-spinner size="36" label="Cargando resultados" />

<uki-checkbox formControlName="aceptaTerminos">Acepto los términos</uki-checkbox>
<uki-checkbox [(checked)]="todas" [indeterminate]="algunas()" ariaLabel="Seleccionar todas las filas" />
```

Uso en una aplicación:
```json
"styles": ["node_modules/@banobras/uki/styles/uki.css", "src/styles.css"]
```

### Datos
No aplica: no hay datos del Banco ni llamadas a servicios.

### UI
Referencia: UKI - Library v0.5.0. Cada valor visual sale de un token de Figma; no se permiten colores ni medidas sueltas en el CSS de los componentes, salvo las medidas que Figma da en píxeles sin token (alto del botón, caja del checkbox, área táctil).

## Áreas de preocupación
| Punto | Dueño | Estado |
|---|---|---|
| UKI está en 0.x: un token puede renombrarse en una versión menor. El paquete registra la versión de UKI que implementa y sube de versión menor cuando UKI cambie tokens. | Diseño UKI / Pablo | Aceptado |
| `get_variable_defs` solo devuelve las variables que usa cada nodo. Para tener las 147 hay que recorrer las seis páginas de fundamentos; puede faltar alguna sin uso visible. | Pablo | Se mitiga en el plan (comparación contra el conteo del Changelog) |
| Angular 20 deja de tener soporte LTS a finales de noviembre de 2026. Compilar con 20 mantiene la compatibilidad con FONADIN y SISEC; cuando suban de versión, se sube el mínimo. | Pablo | Aceptado |
| El grupo de botones en móvil invierte el orden visual (Primary arriba) respecto al DOM; el foco con Tab va de abajo hacia arriba. Es lo que pide UKI; hay que confirmar con diseño si se acepta. | Diseño UKI | Abierto |
| UKI no define Loading para Ghost ni el comportamiento del Spinner con movimiento reducido. Esta especificación propone una solución (RF-6, RNF Movimiento). | Diseño UKI | Propuesto |
| Licencia de Patria para empaquetarla (pregunta 5). No bloquea el desarrollo local; sí bloquea publicar. | Pablo → Banobras | Abierto |

## Preguntas abiertas heredadas del intent
1. Nombre y prefijo: **resuelta**: `@banobras/uki` / `uki` (D2).
2. Registro y dueño: **arrastrada**; no hace falta hasta publicar. Esta entrega termina en `npm pack`.
3. Radio: **arrastrada** a diseño UKI. Fuera de esta entrega.
4. CSS del SND / barra gob.mx: **arrastrada**. Esta entrega no toca encabezado ni pie.
5. Licencia de Patria: **arrastrada** (ver Áreas de preocupación).
6. Íconos: **resuelta para esta entrega**. Los dos íconos del checkbox se exportan de Figma como SVG dentro del componente. El juego completo se define cuando llegue un componente que lo necesite.
7. Idioma de la API: **resuelta**: inglés (D3).

## Fuera de alcance
- ~~Tema verde y cambio de tema en tiempo de ejecución.~~ Incluido después a pedido de Pablo (29/10/2026): `data-uki-theme="verde"`; ver Desviaciones 11 del plan.
- Text field, Select, Text area, Badge, Avatar, Alert, Toast, Modal, Search, Breadcrumbs, Table y los patrones (Auth, Hero, Header, Footer, Sidebar).
- Radio (no existe en UKI).
- Publicación en un registro, Storybook, Code Connect de Figma y generación automática de tokens.
- Integración en cualquiera de los 5 sistemas.

## Trazabilidad
No aplica (fuera de la fábrica).
