# Spec: Campos de formulario de UKI, entrega 2 (desde intent/formularios.md)

- Sistema: compartido · Slug: `formularios` · Estado: draft
- Aprobado por: pendiente (Pablo Gastelum) · Fecha: 29/10/2026
- Fuente: UKI - Library v0.5.0, leída el 29/10/2026 desde el navegador integrado (árbol de capas completo y panel de Propiedades de cada parte). Nodos: Text field `210:140` (`_Label 220:194`, `_Input 214:5781`, `_Helper 214:5795`, molécula `214:5802`); Text area `445:931` (`_Textarea box 443:249`, molécula `443:417`); Select `445:274` (`_Select box 443:189`, `_Option 443:206`, `_Select menu 443:207`, molécula `443:344`); Search `375:59` (componente `375:124`).
- Fuera de la fábrica: no aplican RN, TP ni `trazabilidad.csv`.

## Resumen
Se agregan a `@banobras/uki` los campos de UKI: Text field, Text area, Select y Search. Comparten una estructura de campo (etiqueta, control, ayuda o error), los tokens `field/*` y los mismos estados, y funcionan con formularios reactivos y `ngModel`.

## Decisiones de diseño
| # | Decisión | Motivo |
|---|---|---|
| D1 | **Campo como contenedor + control nativo proyectado.** `<uki-field>` dibuja la etiqueta, la ayuda, el error y el contador; el control es un `<input ukiInput>` o `<textarea ukiInput>` nativo dentro. | Igual que en Button: se conservan todos los atributos nativos (`type`, `autocomplete`, `inputmode`, `pattern`, `name`) sin volver a exponerlos uno por uno, y `formControlName`/`ngModel` van directo al control nativo, sin `ControlValueAccessor` propio. |
| D2 | `uki-field` toma el estado del control (`NgControl`) para decidir el error, `aria-invalid`, `aria-required` y `aria-describedby`, y genera los `id` que unen etiqueta, control, ayuda y contador. | Las reglas de accesibilidad de Figma (`aria-required`, `aria-describedby`, `aria-invalid`) quedan resueltas una vez y no en cada sistema. |
| D3 | **Select propio** (`<uki-select>`) con el patrón *select-only combobox* de WAI-ARIA: botón con `role="combobox"`, lista con `role="listbox"`, `aria-activedescendant` e implementa `ControlValueAccessor`. Pendiente de confirmar (pregunta 1 del intent). | El `<select>` nativo no permite dibujar el estado Open de UKI (opción seleccionada con fondo y palomita, hover, sombra `Elevation/overlay`). |
| D4 | **Text area con límite flexible**: `maxlength` del campo solo dibuja el contador; el error lo marca el validador del formulario (`Validators.maxLength`). Pendiente de confirmar (pregunta 2). | Figma pide que el contador se ponga rojo al pasar el límite; con `maxlength` nativo no se puede pasar y el texto pegado se corta sin aviso. |
| D5 | **Search como componente propio** (`<uki-search>`) con `<input type="search">` dentro de `role="search"`, `ControlValueAccessor` y salida `(buscar)` con espera de 300 ms. No filtra nada. | Así lo describe Figma, y en el programa el filtrado va en el servidor. |
| D6 | El borde de 2 px de Focus y Error se dibuja como borde de 1 px más una sombra interior de 1 px. | Figma usa 2 px; así el texto no se mueve un píxel al enfocar. El resultado visual es el mismo. |

## Requisitos funcionales

### Campo (`uki-field`) y control (`ukiInput`)
| ID | Requisito | Figma |
|---|---|---|
| RF-1 | `<uki-field label="…" [required] helper="…" error="…">` muestra la etiqueta arriba, el control y debajo la ayuda o el error, separados por `spacing-4`. | Molécula: flujo vertical, espacio `spacing-4` |
| RF-2 | La etiqueta usa el estilo Label (Noto Sans Medium 14/20) en `text/primary` y se arma como en UKI: texto, asterisco y dos puntos («Correo electrónico\*:»). El asterisco usa `field/required`, solo aparece si el campo es obligatorio y se oculta a lectores de pantalla; el control lleva `required` o `aria-required="true"`. | `_Label`: «Text», «Asterisk», «Colon» |
| RF-3 | La ayuda usa Caption (12/16) en `text/secondary`. El error usa Caption en `feedback/error/foreground`, reemplaza a la ayuda y siempre está visible mientras haya error. | `_Helper` Default y Error |
| RF-4 | Hay error cuando hay texto en `error` y el control es inválido y ya se tocó (`touched`), o cuando el formulario se envió. Sin control de formulario basta con que `error` tenga texto. Con error, el control lleva `aria-invalid="true"` y `aria-describedby` apunta al mensaje. | Descripción de Text field |
| RF-5 | `input[ukiInput]`: 48 px de alto, relleno `spacing-16` a los lados, `radius-4`, texto Body/Medium. Los estados usan los tokens de la tabla «Campo: tokens por estado». | `_Input` |
| RF-6 | `textarea[ukiInput]`: 120 px de alto mínimo, relleno `spacing-12` vertical y `spacing-16` horizontal, texto desde arriba a la izquierda, redimensionable solo en vertical. Mismos tokens por estado. | `_Textarea box` |
| RF-7 | Con `maxlength` en `uki-field`, se muestra el contador «92/500» en Caption `text/secondary`, a la derecha de la ayuda. Al pasar el límite, el contador cambia a `feedback/error/foreground`. El contador forma parte de `aria-describedby`. | Text area: Footer con Helper y Counter |

### Select (`uki-select`)
| ID | Requisito | Figma |
|---|---|---|
| RF-8 | Mismo campo que Text field (etiqueta, 48 px, ayuda o error) con el texto de la opción elegida o el *placeholder* («Selecciona una opción») y un chevron de 20 px en `icon/default` que gira al abrir. | `_Select box`, anatomía |
| RF-9 | Estado Open: borde de 2 px `field/border-focus` y lista debajo del campo, del mismo ancho, con `background/surface`, borde 1 px `border/low-contrast`, `radius-4`, `Elevation/overlay`, relleno `spacing-4`, espacio `spacing-2`, máximo 248 px (6 opciones) y desplazamiento después. | `_Select menu` |
| RF-10 | Opción: 40 px, relleno `spacing-12`, `radius-4`, espacio `spacing-8`, Body/Medium. Hover `background/page`. Seleccionada: `button/tint`, texto `brand/primary` SemiBold y palomita. Deshabilitada: `text/disabled`. | `_Option` |
| RF-11 | Teclado según el patrón de WAI-ARIA: Enter, Espacio, Alt+↓ o ↓ abren; ↑/↓ mueven; Inicio/Fin van al extremo; una letra salta a la siguiente opción que empieza con ella; Enter elige y cierra; Esc cierra sin cambiar; Tab elige la opción activa y sale. Un clic fuera cierra. | «arrow keys move, Enter selects, Esc closes» |
| RF-12 | Implementa `ControlValueAccessor` y acepta `[options]` como lista de `{ value, label, disabled? }`. El error usa la misma regla que RF-4; en Error el *placeholder* conserva su color. | Estados de Select |

### Search (`uki-search`)
| ID | Requisito | Figma |
|---|---|---|
| RF-13 | `size`: `default` (40 px, Body/Small, ícono de 16 px, relleno `spacing-12`/`spacing-8`) o `large` (48 px, Body/Medium, ícono de 20 px, relleno `spacing-16`/`spacing-12`). Espacio `spacing-8`, `radius-4`, ícono en `text/secondary`. | Search Default y Large |
| RF-14 | Estados Empty, Hover, Focus, Filled y Disabled con los tokens de la tabla «Search: tokens por estado». | Search › States |
| RF-15 | El botón × (24 px en default, 32 px en large, `aria-label="Borrar búsqueda"`) aparece solo cuando hay texto; borra y devuelve el foco al campo. Esc también borra. | Anatomía: Clear |
| RF-16 | Emite `(buscar)` 300 ms después de dejar de escribir, y de inmediato al borrar o al presionar Enter. Implementa `ControlValueAccessor`. Con `[resultados]` anuncia «N resultados» en una región `aria-live="polite"`. | Descripción de Search |

### Campo: tokens por estado (Text field, Text area y Select)
| Estado | Borde | Fondo | Texto |
|---|---|---|---|
| Default | 1 px `field/border` | `field/background` | *placeholder* `field/placeholder` |
| Hover (solo con puntero) | 1 px `field/border-hover` | `field/background` | `field/placeholder` |
| Focus | 2 px `field/border-focus` | `field/background` | `text/primary` (Select cerrado: `field/placeholder` sin valor) |
| Open (solo Select) | 2 px `field/border-focus` | `field/background` | `field/placeholder` sin valor |
| Filled | 1 px `field/border` | `field/background` | `text/primary` |
| Error | 2 px `feedback/error/foreground` | `field/background` | `text/primary` (Select sin valor: `field/placeholder`) |
| Disabled | 1 px `field/border` | `field/disabled-background` | `text/disabled` |

Valores de referencia (guinda): `field/border` #DDDDDD, `field/border-hover` #767676, `field/border-focus` #611232, `feedback/error/foreground` #9B0F15, `field/disabled-background` #F9F9F9, `field/placeholder` #767676, `field/required` #9B2247.

### Search: tokens por estado
| Estado | Borde | Texto | Botón × |
|---|---|---|---|
| Empty | 1 px `field/border` | *placeholder* `field/placeholder` | Oculto |
| Hover | 1 px `field/border-hover` | `field/placeholder` | Oculto |
| Focus | 2 px `field/border-focus` | `text/primary` | Visible si hay texto |
| Filled | 1 px `field/border` | `text/primary` | Visible |
| Disabled | 1 px `field/border` · fondo `field/disabled-background` | `text/disabled` | Oculto |

## Requisitos no funcionales
- **Accesibilidad:** WCAG 2.1 AA y axe sin violaciones en las páginas nuevas, en los dos temas y en móvil. Etiqueta siempre asociada (`for`/`id` o `aria-labelledby`). El error no depende solo del color (borde de 2 px más texto).
- **Formularios:** los cuatro funcionan con `FormControl`, `formControlName` y `ngModel`, y respetan `disable()`.
- **Compatibilidad, CSP y tamaño:** igual que la entrega 1.

## Diseño
### API pública
```html
<uki-field label="Correo electrónico" required helper="Te enviaremos el acuse a este correo."
           error="Escribe un correo con el formato nombre@dominio.mx">
  <input ukiInput type="email" autocomplete="email" formControlName="correo" />
</uki-field>

<uki-field label="Motivo de la solicitud" [maxlength]="500" error="Usa máximo 500 caracteres.">
  <textarea ukiInput formControlName="motivo"></textarea>
</uki-field>

<uki-select label="Tipo de trámite" required placeholder="Selecciona una opción"
            [options]="tramites" formControlName="tramite" error="Elige un tipo de trámite." />

<uki-search placeholder="Buscar por folio o solicitante" ariaLabel="Buscar en la tabla"
            [resultados]="total()" (buscar)="filtrar($event)" />
```

Exportaciones nuevas: `UkiField`, `UkiInput`, `UkiSelect`, `UkiSelectOption` (tipo), `UkiSearch`, `UkiSearchSize` (tipo).

### Documentación
Cuatro páginas nuevas en el grupo Componentes (Text field, Text area, Select y Search), con la distribución de la entrega 1: Overview, Átomos, Anatomía, Estados con tabla de tokens y «En formularios», con ejemplos copiables.

## Áreas de preocupación
| Punto | Dueño | Estado |
|---|---|---|
| Select propio: el patrón de teclado de WAI-ARIA tiene muchos casos (búsqueda por letra, desplazamiento de la lista, foco al cerrar). Es la pieza de mayor riesgo; se cubre con pruebas unitarias y E2E de teclado. | Pablo | Propuesto (D3) |
| La lista de Select se dibuja debajo del campo con `position: absolute`. Dentro de contenedores con `overflow: hidden` (modales, tablas) se recorta. Se resuelve con Modal en la entrega 4 o con un *overlay* si aparece antes. | Pablo | Aceptado |
| El tema verde redefine `field/border-focus` y `field/required`; las E2E verifican ambos temas. | Pablo | Aceptado |
| Figma no dice si el error se muestra al perder el foco o al enviar. Esta especificación usa «al perder el foco o al enviar», que es lo que dice el flujo de Figma («invalid on blur»). | Diseño UKI | Propuesto |

## Preguntas abiertas heredadas del intent
1. Select propio o nativo: **propuesto** propio (D3). Falta confirmarlo.
2. Límite del Text area: **propuesto** flexible (D4). Falta confirmarlo.
3. Íconos: **arrastrada**. Se prueba la exportación en el plan; si no se puede, se dibujan.
4. Radio: **arrastrada** a diseño UKI.

## Fuera de alcance
- Radio (no existe en UKI), *combobox* con búsqueda o autocompletado, selección múltiple, fechas, máscaras de captura (CURP, RFC, teléfono) y campos con ícono o prefijo.
- Validaciones de negocio y filtrado de resultados.
