# Spec: Componentes de retroalimentación de UKI, entrega 3 (desde intent/retroalimentacion.md)

- Sistema: compartido · Slug: `retroalimentacion` · Estado: approved
- Aprobado por: Pablo Gastelum · Fecha: 29/10/2026
- Fuente: UKI - Library v0.5.0, leída el 29/10/2026 desde el navegador integrado (árbol de capas completo y panel de Propiedades de cada parte). Nodos: Alert `268:1858` (componente `268:1934`, variante Success `268:1932`: Status icon `284:373`, Message `268:1859`, Close `268:1931`); Toast `450:59` (componente `450:96`, Success `450:60`: Content `450:63`, Title `450:64`, Description `450:65`, Close `450:66` con Icon `450:67`); Badge `359:3226` (componente `367:106`, Success `367:94`: Dot `367:95`, Label `367:96`); Avatar `310:747` (componente `310:762`, md `310:767`: Image `310:768`, Status `314:72`).
- Fuera de la fábrica: no aplican RN, TP ni `trazabilidad.csv`.

## Resumen
Se agregan a `@banobras/uki` cuatro componentes: **Alert** (mensaje dentro de la página), **Toast** (mensaje flotante que se cierra solo, mostrado con un servicio), **Badge** (estado de un registro) y **Avatar** (foto de una persona). Alert, Toast y Badge comparten los cuatro tipos de UKI (Success, Info, Warning y Error) y los mismos tokens `feedback/{tipo}/background` y `feedback/{tipo}/foreground`; Alert y Toast comparten además los íconos.

## Lo que dice Figma
Textos de la documentación de Figma, resumidos:

- **Alert.** «Mensaje corto sobre el resultado de una acción o el estado del sistema. El ícono acompaña al color para que el significado nunca dependa solo del color. Ancho flexible: llena su contenedor.» Úsalo para confirmar, advertir antes de un paso riesgoso o explicar por qué algo falló; para decisiones que bloquean el flujo, un diálogo. Una o dos líneas; los errores dicen cómo corregir. Propiedades: `Type`, `Message`, `Leading Icon`, `Trailing Icon`.
- **Toast.** «Mensaje flotante que confirma el resultado de una acción y desaparece solo.» Título de 2–5 palabras y, si hace falta, una línea de descripción. Arriba a la derecha en escritorio y abajo al centro en móvil, uno a la vez. Success e Info se cierran a los 5 s (con pausa al pasar el puntero o enfocar); Warning y Error se quedan hasta cerrarlos. «Usa `role="status"` (o `role="alert"` para errores) para que los lectores de pantalla lo anuncien.» El botón de cerrar lleva `aria-label` «Cerrar aviso». Nunca pongas en un toast la única forma de terminar una tarea. Propiedades: `Type`, `Title`, `Description`, `Leading Icon`, `Trailing Icon`.
- **Badge.** «Etiqueta corta de solo lectura con el estado de un elemento. Siempre tiene punto y texto, para que el estado nunca dependa solo del color.» Una o dos palabras, y la misma etiqueta para el mismo estado en todo el portal (Aprobada, Recibida, En revisión, Rechazada). Propiedades: `Type`, `Label`.
- **Avatar.** «Representa a una persona con su foto. Siempre circular, con borde `border/low-contrast`.» Cinco tamaños en pasos de 8 px; `md` es el de uso general. Foto cuadrada con la cara al centro. «El punto verde significa que la persona está en línea; no cambies su color ni lo uses para otros estados.» Propiedades: `Size`, `Status`.

## Decisiones de diseño
| # | Decisión | Motivo |
|---|---|---|
| D1 | **Alert como componente con contenido proyectado**: `<uki-alert type="error">…</uki-alert>`. El mensaje va como contenido, no como texto en una entrada. | Permite negritas y enlaces dentro del mensaje («Revisa el [aviso de privacidad]»), que Figma no puede expresar con una propiedad de texto. |
| D2 | **Nombres de la API frente a Figma**: `type` = Type; `icon` = Leading Icon (encendido por omisión); `dismissible` = Trailing Icon (apagado por omisión en Alert). | `trailingIcon` sugiere un adorno y en código es un botón con comportamiento. Alert se apaga por omisión porque un botón de cerrar que no hace nada es peor que no tenerlo; con `dismissible` el Alert se oculta solo y emite `[(open)]`. |
| D3 | **Rol de Alert según el tipo**: `role="alert"` solo en Error; `role="status"` en Success, Info y Warning. | Error interrumpe porque la persona tiene que corregir algo; los demás se anuncian sin interrumpir. Figma da la misma regla para Toast. |
| D4 | **Toast como servicio**: `inject(UkiToastService).show({ type, title, description })`, sin nada en la plantilla. El servicio crea una sola vez la región de avisos al final de `<body>`. | Los avisos salen de acciones en código (guardar, enviar, copiar), no de la plantilla. Un solo lugar garantiza «uno a la vez» y la misma posición en los 5 sistemas. |
| D5 | **Anuncio del Toast en regiones vivas aparte**: la región tiene dos contenedores ocultos a la vista que existen desde que se crea, `role="status"` (Success, Info y Warning) y `role="alert"` (Error). El texto «Título. Descripción.» se escribe ahí 100 ms después. El Toast visible no es región viva. | Los lectores de pantalla no anuncian de forma fiable una región viva que se acaba de insertar; con contenedores fijos se anuncia una sola vez y sin leer el botón «Cerrar aviso». |
| D6 | **El Toast nunca recibe el foco** al aparecer. Se pausa con el puntero encima o con el foco dentro y se reanuda con el tiempo que le quedaba; Esc lo cierra si el foco está dentro. | Figma pide que no bloquee. Mover el foco interrumpiría a quien está escribiendo o navegando. La pausa da tiempo de leer (WCAG 2.2.1). |
| D7 | **Uno a la vez: el nuevo reemplaza al visible**, sin cola. | Figma pide uno a la vez; una cola mostraría avisos viejos que ya no corresponden a lo que la persona ve. |
| D8 | **Badge sin rol**: es texto con un punto decorativo (`aria-hidden`). | Es de solo lectura; el texto ya es el estado. Un rol `status` haría que se anuncie cada vez que cambia una fila de la tabla. |
| D9 | **Avatar con nombre accesible propio**: el host lleva `role="img"` y `aria-label` con `name` (más «, en línea» si `status`); la imagen interna lleva `alt=""`. Con `decorative` se oculta a lectores (cuando el nombre ya está escrito al lado). | Un solo nombre accesible para foto, iniciales y punto de estado, en lugar de repartirlo entre `alt` y texto oculto. |
| D10 | **Avatar sin foto: iniciales** sobre `brand/primary` en `text/inverse`, con las dos primeras palabras de `name` (sin «de», «del», «la», «los», «las», «y»). Se usan también si la imagen falla al cargar. Se pueden fijar con `initials`. | Figma no lo define (pregunta abierta 1). `brand/primary` es el fondo de la ilustración `_Avatar` de Figma y sigue el tema; el contraste es 12.8:1 (guinda) y 14.6:1 (verde). |
| D11 | **Punto de estado apagado por omisión** (`status` = `false`). | Pregunta abierta 2. Encenderlo por omisión diría «en línea» de personas de las que el sistema no sabe nada. |
| D12 | **Íconos dibujados**, no exportados: `check-circle`, `info-circle`, `exclamation-triangle`, `x-circle` y `x` del juego «Linear», con trazo de 1.5 px, en el componente interno `uki-icono`. | Exportar SVG como lector es descargar archivos (misma razón que en la entrega 2, desviación 1). |

## Requisitos funcionales

### Alert (`uki-alert`)
| ID | Requisito | Figma |
|---|---|---|
| RF-1 | `type`: `success` (por omisión), `info`, `warning` o `error`. Llena el ancho de su contenedor. | Type; «Flexible width» |
| RF-2 | Caja horizontal: relleno `spacing-12` arriba y abajo y `spacing-16` a los lados, espacio `spacing-12`, `radius-4`, borde 1 px. Con una línea mide 50 px de alto. Los elementos se alinean arriba para que el ícono quede junto a la primera línea. | Variante Success `268:1932` |
| RF-3 | Ícono de estado de 24 px a la izquierda, uno por tipo (`check-circle`, `info-circle`, `exclamation-triangle`, `x-circle`), en `feedback/{tipo}/foreground`, decorativo. Se apaga con `[icon]="false"`. | Status icon; Leading Icon |
| RF-4 | Mensaje en Body/Medium (16/24, 400) y `feedback/{tipo}/foreground`; ocupa el espacio que queda. | Message `268:1859` |
| RF-5 | Con `dismissible`, botón de 24 px a la derecha con el ícono `x` en `feedback/{tipo}/foreground` y `aria-label="Cerrar aviso"`. Al activarlo, el Alert se oculta, `open` pasa a `false` (`[(open)]`) y el foco pasa al siguiente elemento enfocable de la página, para que no se pierda en `<body>`. | Close `268:1931`; Trailing Icon |
| RF-6 | Rol: `alert` en Error y `status` en los demás (D3). | Descripción de Toast |

### Toast (`UkiToastService`)
| ID | Requisito | Figma |
|---|---|---|
| RF-7 | `show({ type, title, description?, duration?, icon?, dismissible? })` muestra el aviso y devuelve un `UkiToastRef` con `close()` y `closed` (promesa). Atajos: `success()`, `info()`, `warning()`, `error()` con `(title, description?)`. | Propiedades de Toast |
| RF-8 | Caja de 360 px: relleno `spacing-16` arriba, abajo e izquierda y `spacing-12` a la derecha, espacio `spacing-12`, `radius-8`, borde 1 px, sombra `Elevation/floating`. | Variante Success `450:60` |
| RF-9 | Ícono de estado de 24 px como en Alert. Contenido en columna con espacio `spacing-4`: título en Body/Small Bold (14/20, 700) y descripción opcional en Body/Small (14/20, 400), ambos en `feedback/{tipo}/foreground`. | Content `450:63`, Title `450:64`, Description `450:65` |
| RF-10 | Botón de cerrar de 24 px (`radius-4`) con el ícono `x` de 20 px y `aria-label="Cerrar aviso"`. En Warning y Error siempre aparece. | Close `450:66`, Icon `450:67` |
| RF-11 | Duración por omisión: 5000 ms en Success e Info; sin cierre automático en Warning y Error. `duration` la cambia (`null` = hasta cerrarlo). Se pausa con el puntero encima o con el foco dentro (D6). | «Timing and position» |
| RF-12 | Posición: desde 768 px, arriba a la derecha a `spacing-24` de los bordes; en menos de 768 px, abajo al centro a `spacing-16` del borde y con ancho de `min(360px, 100% − 32px)`. Uno a la vez (D7). | «Timing and position» |
| RF-13 | Anuncio a lectores de pantalla según D5 y sin mover el foco (D6). Esc cierra el aviso si el foco está dentro. | Descripción de Toast |
| RF-14 | Entrada y salida con 200 ms de opacidad y desplazamiento; sin animación con `prefers-reduced-motion: reduce`. | No lo define Figma |

### Badge (`uki-badge`)
| ID | Requisito | Figma |
|---|---|---|
| RF-15 | `type`: `success` (por omisión), `info`, `warning` o `error`. La etiqueta es el contenido: `<uki-badge type="warning">En revisión</uki-badge>`. | Type, Label |
| RF-16 | Caja en línea de 24 px de alto: relleno `spacing-4` arriba y abajo y `spacing-8` a los lados, espacio `spacing-4`, `radius-full`, fondo `feedback/{tipo}/background`, sin borde. | Variante Success `367:94` |
| RF-17 | Punto de 6 px en `feedback/{tipo}/foreground`, decorativo. Etiqueta en Caption SemiBold (12/16, 600) y `feedback/{tipo}/foreground`, en una sola línea. | Dot `367:95`, Label `367:96` |

### Avatar (`uki-avatar`)
| ID | Requisito | Figma |
|---|---|---|
| RF-18 | `size`: `xs` 24, `sm` 32, `md` 40 (por omisión), `lg` 48 o `xl` 56 px. Círculo con borde 1 px `border/low-contrast`. | Size; tabla Sizes |
| RF-19 | Con `src`, la foto llena el círculo interior (`object-fit: cover`, centrada). | Image `310:768`: Rellenar, radius-full |
| RF-20 | Sin `src` o si la imagen falla, iniciales según D10 en SemiBold: Caption (12) en xs y sm, Body/Small (14) en md, Body/Medium (16) en lg y Body/Large (18) en xl. | No lo define Figma (D10) |
| RF-21 | Con `status`, punto en `avatar/status` con anillo de 2 px `background/surface` por fuera, en la esquina inferior derecha. Mide 6, 8, 10, 12 o 14 px según el tamaño. | Status `314:72`: borde 2 px exterior |
| RF-22 | Nombre accesible según D9: `name` es obligatorio salvo con `decorative`. | — |

### Tipos: tokens (Alert, Toast y Badge)
| Tipo | Uso | Borde (Alert y Toast) | Fondo | Texto, ícono y punto |
|---|---|---|---|---|
| Success | La acción terminó bien. | 1 px `feedback/success/foreground` | `feedback/success/background` | `feedback/success/foreground` |
| Info | Información útil, sin urgencia. | 1 px `feedback/info/foreground` | `feedback/info/background` | `feedback/info/foreground` |
| Warning | Requiere atención antes de seguir. | 1 px `feedback/warning/foreground` | `feedback/warning/background` | `feedback/warning/foreground` |
| Error | La acción falló; explica cómo corregir. | 1 px `feedback/error/foreground` | `feedback/error/background` | `feedback/error/foreground` |

Valores de referencia (iguales en guinda y verde): success #086308 sobre #F0FAF5 (7.0:1), info #224497 sobre #EDF2FE (8.0:1), warning #684700 sobre #FFEB99 (7.1:1), error #9B0F15 sobre #FAE5E5 (7.0:1). Badge no lleva borde.

### Avatar: medidas por tamaño
| Tamaño | Lado | Punto de estado | Uso (Figma) |
|---|---|---|---|
| xs | 24 px | 6 px | Tablas y listas densas |
| sm | 32 px | 8 px | Comentarios y chips |
| md | 40 px | 10 px | Por omisión · menús y tarjetas |
| lg | 48 px | 12 px | Encabezados de perfil |
| xl | 56 px | 14 px | Páginas de perfil |

Borde 1 px `border/low-contrast` (#DDDDDD) · punto `avatar/status` (#086308) · anillo 2 px `background/surface` (#FFFFFF) · iniciales `text/inverse` sobre `brand/primary` (#611232 en guinda, #002F2A en verde).

## Requisitos no funcionales
- **Accesibilidad:** WCAG 2.1 AA y axe sin violaciones en las páginas nuevas, en los dos temas y en móvil. Ningún tipo depende solo del color (ícono en Alert y Toast, texto en Badge). Botones de cerrar con nombre accesible y foco visible (borde de 2 px en el color del texto del tipo).
- **Lectores de pantalla:** cada Toast se anuncia una vez; Alert según D3; Avatar con un solo nombre accesible.
- **Compatibilidad, CSP y tamaño:** igual que las entregas anteriores. La región de avisos se crea con la API de Angular (`createComponent`), sin `innerHTML` ni estilos en línea. En SSR el servicio no hace nada.

## Diseño
### API pública
```html
<uki-alert type="success">Guardamos tu solicitud con el folio FON-2026-0142.</uki-alert>
<uki-alert type="error" dismissible [(open)]="hayError">
  No pudimos enviar la solicitud. Revisa los campos marcados y vuelve a intentarlo.
</uki-alert>

<uki-badge type="success">Aprobada</uki-badge>
<uki-badge type="warning">En revisión</uki-badge>

<uki-avatar name="Mariana López Hernández" src="/fotos/mlopez.jpg" size="lg" status />
<uki-avatar name="Mariana López Hernández" decorative /> <!-- iniciales «ML», con el nombre escrito al lado -->
```

```ts
import { UkiToastService } from '@banobras/uki';

private readonly avisos = inject(UkiToastService);

guardar(): void {
  this.avisos.success('Solicitud enviada', 'Te enviamos el acuse por correo.');
}
```

Exportaciones nuevas: `UkiAlert`, `UkiBadge`, `UkiAvatar`, `UkiToastService`, y los tipos `UkiFeedbackType`, `UkiToastOptions`, `UkiToastRef`, `UkiAvatarSize`.

### Documentación
Cuatro páginas nuevas en el grupo Componentes (Alert, Avatar, Badge y Toast), en orden alfabético con las demás, con la distribución de cada página de Figma:

- **Alert:** Overview, Átomos (íconos), Moléculas, Anatomía (4 partes), Tipos con tabla de tokens y «Ejemplos» (después de enviar un formulario, con enlace, que se puede cerrar).
- **Toast:** Overview, Átomos, Moléculas, Anatomía (5 partes), Tipos con tabla de tokens y un ejemplo vivo con botones que muestran cada tipo, más «Accesibilidad» (anuncio, foco y pausa).
- **Badge:** Overview, Átomos, Anatomía (3 partes), Tipos con tokens y etiquetas de ejemplo, y Badge en una tabla.
- **Avatar:** Overview, Moléculas, Anatomía (3 partes), Tamaños con medidas, y ejemplos con foto, iniciales, error de carga y nombre al lado.

La foto de ejemplo es una imagen propia de la documentación (no la ilustración de Figma, que no se puede descargar).

## Áreas de preocupación
| Punto | Dueño | Estado |
|---|---|---|
| Toast y Modal (entrega 4): un `<dialog>` modal vuelve inerte todo lo de fuera, incluida la región de avisos al final de `<body>`, y queda encima. Se resuelve al hacer Modal (la región se mueve dentro del diálogo abierto o a la capa superior). | Pablo | Aceptado |
| Con teclado, el botón de cerrar del Toast queda al final del orden de tabulación. Warning y Error no se cierran solos, así que la persona puede llegar; Success e Info no hace falta cerrarlos. | Pablo | Propuesto |
| El cierre automático a los 5 s (Success e Info) puede ser poco para algunas personas. Se mitiga con la pausa y con que el aviso nunca sea la única forma de terminar algo (regla de Figma). | Diseño UKI | Aceptado |
| `role="status"` en un Alert que ya está en la página al cargar no se anuncia; solo se anuncia si aparece después (por ejemplo, con `@if`). Se documenta: para confirmar una acción, Toast. | Pablo | Aceptado |
| Las fotos de Avatar que vengan de otro dominio necesitan permiso en `img-src` de la CSP del sistema. | Cada sistema | Aceptado |

## Preguntas abiertas heredadas del intent
1. Avatar sin foto: **resuelta**: iniciales sobre `brand/primary` (D10), confirmado por Pablo el 29/10/2026. Se avisa a diseño UKI.
2. Punto de estado: **resuelta**: apagado por omisión (D11).
3. Varios Toast: **resuelta**: el nuevo reemplaza al visible (D7).
4. Relleno de Badge: **resuelta**: seguir al componente (`spacing-4` / `spacing-8`, 24 px); se avisa a diseño de la diferencia con la anatomía.

## Fuera de alcance
- Toast con botón de acción («Deshacer»), cola o pila de varios avisos, y avisos que no vienen de una acción (notificaciones del servidor).
- Alert con título o con botones, y Alert de página completa (banner).
- Badge con número (contador de notificaciones), tipo neutro o tamaños.
- Grupo de avatares, avatar con ícono y punto de estado con otros colores (Figma lo prohíbe).
