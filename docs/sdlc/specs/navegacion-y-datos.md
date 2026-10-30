# Spec: Modal, Breadcrumbs y Table de UKI, entrega 4 (desde intent/navegacion-y-datos.md)

- Sistema: compartido · Slug: `navegacion-y-datos` · Estado: approved
- Aprobado por: Pablo Gastelum · Fecha: 29/10/2026
- Fuente: UKI - Library v0.5.0, leída el 29/10/2026 desde el navegador integrado (árbol de capas completo y panel de Propiedades de cada parte). Nodos:
  - Modal `458:59`: componente `458:157`; Informative Default `458:67` (Header `458:68`, Title `458:63`, Close `458:64`, Body `458:73`, Intro `458:74`, Footer `458:76`); Informative Small `458:93`; Confirmation Default `458:115` (Message `458:122`, Footer `458:123`, Button group `458:130`).
  - Breadcrumbs `360:59`: la página tiene dos documentaciones. Se sigue la de la capa superior, `363:216`, que usa los tokens `breadcrumb/*` y `aria-label="Ruta de navegación"`: Item `362:180` (Default `362:164`, Hover `362:168`, Focus `362:172`, Current `362:176`), Separator `429:3654`, Overflow `362:193`, organismo `362:1539` (3 levels `362:1463`, Mobile `362:1533`, Back link `362:1534`). La otra, `361:115`, usa `text/brand` y un chevron de 12 px; parece la versión anterior (pregunta abierta 5).
  - Table `365:59`: componente `369:842` (Desktop Default `369:198`); Cell `483:2864` (Header Text `367:107` y su Label `367:108`, Data Text `470:7277`); Action `489:4763` (View Default `489:4770`, Hover `489:4772`, Focus `489:4774`, Large `489:4794`); Page button `367:150` (Default `367:142`, Current `367:146`); Toolbar `368:305` (None `368:266`); Pagination `368:342` (Desktop `368:306`); Card `368:387`; Empty `368:388`.
- Fuera de la fábrica: no aplican RN, TP ni `trazabilidad.csv`.

## Resumen
Se agregan a `@banobras/uki` tres componentes: **Modal** (`<uki-modal>` y `UkiDialogService`), **Breadcrumbs** (`<uki-breadcrumbs>`) y **Table** (`<uki-table>`). Además, se agrega una **capa superpuesta interna** que usan la lista del Select, el menú «…» de Breadcrumbs y los tooltips de la tabla, para que no se recorten dentro de contenedores con `overflow: hidden`. Por último, la región de avisos de Toast pasa al modal abierto para que siga visible y se siga anunciando.

## Lo que dice Figma
Textos de la documentación de Figma, resumidos:

- **Modal.** «Ventana que aparece sobre el contenido principal y necesita la atención de la persona antes de seguir.» Siempre centrado sobre un velo oscuro que bloquea la página. Úsalo para confirmar acciones destructivas o irreversibles, avisar antes de perder trabajo sin guardar o mostrar algo que se tiene que leer ya. Para avisos rápidos, Toast; para mensajes en la página, Alert. El título dice qué pasa («¿Eliminar el trámite?») y el botón de confirmar repite la acción («Eliminar», no «Aceptar») y va a la derecha, con «Cancelar» a su izquierda. Siempre hay salida: ×, Cancelar y Esc. Si el contenido necesita scroll o muchos campos, usa una página. Descripción del componente: `role="dialog"` + `aria-modal="true"`, el foco entra al modal y vuelve al disparador al cerrar, y Esc y × lo cierran. Tipos: **Informative** (se cierra con ×, Entendido o Esc) y **Confirmation** (con ×, Cancelar o Esc, «nunca con un clic fuera»). Tamaños: Default de 640 px y Small de 480 px.
- **Breadcrumbs.** «Navegación secundaria: muestra la ruta desde “Inicio” hasta la página actual.» Úsalo en páginas de dos o más niveles; no en Inicio ni en páginas de un nivel. El último elemento es la página actual: texto sin enlace con el mismo nombre que el título. Los nombres son los del menú, de 1 a 3 palabras. Desde 5 niveles se colapsan los intermedios con «…», que abre un menú con ellos. En teléfonos (< 768 px) se muestra solo un enlace para volver a la página padre. Va debajo del Header y arriba del título. Los enlaces siempre van subrayados «para que nunca dependan solo del color». Se envuelve en `<nav aria-label="Ruta de navegación">` con una lista ordenada.
- **Table.** «Muestra listas de registros para que la gente los compare, los encuentre y actúe sobre ellos.» Combina la distribución de Bootstrap (filas alternas y paginación numerada) con la interacción de Material (barra de selección, flechas de orden y filas por página). El texto se alinea a la izquierda y los importes a la derecha, con filas de 52 px. Debajo de 768 px, cada fila se vuelve una tarjeta: «nunca fuerces scroll horizontal en teléfonos». En escritorio, la tabla se ajusta a sus columnas y se desplaza en horizontal cuando no cabe. Comportamiento: selección múltiple con «seleccionar todas» en estado indeterminado; orden por una columna a la vez (ascendente y luego descendente) con un `<button>` dentro del `<th>` y `aria-sort`; búsqueda con conteo anunciado (`aria-live`); paginación de 5, 10 o 25 filas con `<nav aria-label="Paginación">` y `aria-current`; acciones Ver, Editar y Eliminar por fila, con `aria-label` que nombra el registro («Editar subproceso Promoción») y tooltip. Eliminar pide confirmación. Un registro eliminado solo muestra Restaurar. «Las columnas son solo visuales: el código dibuja una `<table>` semántica con `<th scope="col">` y `<td>`, y solo las filas de la página actual.»

## Decisiones de diseño
| # | Decisión | Motivo |
|---|---|---|
| D1 | **Modal con `<dialog>` nativo y `showModal()`**, sin `@angular/cdk`. | `showModal()` pone el diálogo en la capa superior (encima de todo, sin `z-index`), vuelve inerte el resto de la página (no se puede usar ni lo lee el lector) y trae Esc. Funciona en todos los navegadores de Angular 20 (Chrome 37, Firefox 98, Safari 15.4). El CDK haría lo mismo con un `div` y `aria-hidden` en los hermanos, pero sería una peerDependency nueva atada a la versión mayor de Angular de cada sistema y no trae nada que el navegador no dé ya. Se comparan en «Alternativas» del plan. |
| D2 | **Capa superpuesta propia** (interna, `capa/`): el panel flotante (lista del Select, menú «…», tooltip) se coloca con `position: fixed` y coordenadas calculadas desde el elemento que lo abre. Se voltea hacia arriba si no cabe abajo, se recoloca con scroll y resize, y si el navegador tiene el **Popover API** (`popover="manual"` + `showPopover()`) además sube a la capa superior. | `position: fixed` ya escapa de `overflow: hidden` en todos los navegadores. El Popover API agrega lo que falta (escapar de ancestros con `transform` y de cualquier `z-index`), pero llegó en Safari 17 y Firefox 125, después del mínimo de Angular 20. Así funciona en todos y mejora donde se puede. Las coordenadas se fijan con `[style.top.px]`, que usa CSSOM y está permitido con CSP con nonce (no es un atributo `style` en el HTML). Sin `CSS anchor positioning`, que aún no está en Firefox ni en Safari 17. |
| D3 | **El modal es el velo.** El `<dialog>` ocupa toda la pantalla con fondo `elevation/scrim` y dentro va el panel visible; `::backdrop` queda transparente. | Hasta Chrome 122 y Safari 17.4, `::backdrop` no heredaba variables CSS, así que `var(--elevation-scrim)` no funcionaba. Así el velo sigue el tema, y saber si el clic fue «fuera» es comparar con el propio `<dialog>`. |
| D4 | **Modal declarativo y servicio.** `<uki-modal [(open)]>` para contenido propio (formularios cortos, texto con enlaces) y `UkiDialogService` con `confirm()` (devuelve `Promise<boolean>`) e `inform()` para los dos casos de Figma sin tocar la plantilla. El servicio usa el mismo componente. | La confirmación destructiva es lo más común y sale de código («antes de eliminar, pregunta»); obligar a poner un `<uki-modal>` por cada pregunta llena las plantillas. El contenido libre necesita la plantilla. |
| D5 | **Foco del modal.** Al abrir, el foco va al elemento con `ukiModalFocus`; si no hay, en Confirmation a «Cancelar» (la acción menos destructiva, según WAI-ARIA) y en Informative al botón principal; si no hay pie, al botón ×. Tab y Mayús+Tab dan la vuelta dentro del modal. Al cerrar, el foco vuelve al elemento que lo tenía al abrir; si ya no existe, al `<body>`. | Figma pide que el foco entre y vuelva. `showModal()` no da la vuelta (deja salir el foco a la barra del navegador) y la devolución del foco no es igual en todos los navegadores, así que se hace explícita. |
| D6 | **Cierre del modal.** × y Esc cierran siempre (`closeOnEsc` se puede apagar mientras una acción está en curso). El clic en el velo **no** cierra por omisión (`closeOnBackdrop` = `false`). | Figma: Confirmation «nunca» se cierra con un clic fuera; para Informative no lo dice. Apagado en los dos evita perder un formulario por un clic. |
| D7 | **Bloqueo del scroll del fondo**: mientras haya un modal abierto, `<html>` lleva la clase `uki-modal-abierto` (`overflow: hidden` y `scrollbar-gutter: stable` para que no salte el contenido). | `<dialog>` no bloquea el scroll de la página. `html:has(dialog[open])` no funciona en Firefox antes de la 121. |
| D8 | **Toast dentro del modal.** Mientras haya modales abiertos, la región de avisos se mueve dentro del modal de arriba y vuelve al final de `<body>` al cerrarse el último. | Todo lo que está fuera de un modal es inerte: el aviso no se vería ni se anunciaría. Una región en la capa superior (popover) fuera del modal también queda inerte. Las regiones vivas se mueven con su contenido, sin crearse de nuevo. |
| D9 | **Breadcrumbs con datos**: `[items]="[{ label, link }]"`, y el componente dibuja `<a [routerLink]>`. `@angular/router` pasa a ser peerDependency (`>=20 <23`, igual que `core`). | El colapso «…» y el enlace de teléfono necesitan conocer todos los niveles y moverlos; con enlaces proyectados habría que mover nodos ajenos. Los 5 sistemas ya usan el router. Con `href` se aceptan enlaces que no son del router. |
| D10 | **Breadcrumbs en teléfono por CSS**: se dibujan la ruta completa y el enlace «‹ Padre», y una `@media (max-width: 767.98px)` muestra uno u otro con `display: none`. | Sin código que escuche el tamaño de la ventana; lo oculto con `display: none` no se lee. |
| D11 | **Menú «…» como lista de enlaces que se despliega** (patrón *disclosure*, botón con `aria-expanded`), no `role="menu"`. | Son enlaces de navegación; `role="menu"` obliga a manejar el teclado con flechas y los lectores lo anuncian como un menú de aplicación. |
| D12 | **Table con columnas como datos y celdas con plantilla opcional**: `[columns]` define encabezado, orden, alineación y papel en la tarjeta de teléfono; `<ng-template ukiTableCell="estado" let-row>` dibuja una celda propia (por ejemplo, un Badge). | La tabla tiene que dibujar la misma fila como `<tr>` en escritorio y como tarjeta en teléfono; con filas proyectadas no podría. Figma también arma la tabla por columnas. |
| D13 | **Datos del servidor**: la tabla recibe solo la página actual (`rows`) y el `total`, y emite `page`, `pageSize`, `sort`, `searchChange` y `action`. No ordena, no filtra y no pagina por su cuenta. | Regla del programa: esas reglas viven en el servidor. Figma también dice «solo las filas de la página actual». |
| D14 | **Teléfono con tarjetas**, decididas con `matchMedia('(max-width: 767.98px)')`: se dibuja la tabla o la lista de tarjetas, no las dos. En tableta y escritorio, la tabla va dentro de una región con scroll horizontal, enfocable con teclado (`tabindex="0"`) y nombrada por el `caption`. | Figma: «nunca scroll horizontal en teléfonos» (pregunta abierta 3). Dibujar solo una versión evita checkboxes y botones duplicados. En SSR se dibuja la tabla. |
| D15 | **Selección por clave**: `[(selection)]` es la lista de claves (`rowKey`) seleccionadas y se conserva al cambiar de página, de orden o de búsqueda. «Seleccionar todas» actúa sobre las filas de la página visible y queda indeterminado si solo hay algunas. | Figma: la paginación «conserva búsqueda, orden y selección». Con claves, la selección no depende de que el objeto de la fila sea el mismo al volver de una página. |
| D16 | **Cargando**: con filas, se quedan visibles, la tabla lleva `aria-busy="true"` y la barra superior muestra un Spinner de 24 px («Cargando»). Sin filas (primera carga), el cuerpo muestra un Spinner de 36 px con «Cargando resultados» en el mismo alto que el estado vacío. | Figma no define un estado cargando. Mantener las filas evita que la página brinque en cada cambio de página u orden. |
| D17 | **Tooltip de las acciones**: aparece al pasar el puntero o al enfocar, se oculta con Esc y al salir, y es solo visual (`aria-hidden`), porque el nombre accesible ya está en el `aria-label` del botón. Usa la capa de D2. | Figma pide «aria-label + tooltip». UKI no tiene un componente Tooltip; se hace uno interno mínimo que cumple WCAG 1.4.13. |
| D18 | **`caption` obligatorio**: la tabla lleva `<caption>` con el título (oculto a la vista) y la barra superior muestra el mismo título como texto visible con `aria-hidden`. | Un lector oye el nombre de la tabla al entrar en ella, sin oír el título dos veces. La región con scroll también se nombra con el `caption`. |
| D19 | **Íconos dibujados**: `house`, `chevron-right`, `chevron-left`, `x`, `eye`, `pencil`, `trash`, `arrow-counterclockwise`, `chat`, `arrow-up`, `arrow-down` y `arrows-vertical` en el componente interno `uki-icono`, con el trazo de 1.5 px del juego «Linear». | Exportar SVG desde Figma como lector es descargar archivos (misma razón que en las entregas 2 y 3). |

## Requisitos funcionales

### Capa superpuesta (interna) y Select
| ID | Requisito | Figma |
|---|---|---|
| RF-1 | La lista del Select se dibuja con la capa de D2: mismo ancho que el campo, a `spacing-4` debajo (o arriba si no cabe), y se recoloca al hacer scroll o cambiar el tamaño de la ventana. No se recorta dentro de un contenedor con `overflow: hidden` ni dentro de un modal. | Entrega 2, área de preocupación |
| RF-2 | La capa conserva el teclado, `aria-activedescendant`, el clic fuera y el foco que ya tiene el Select. Esc con la lista abierta solo cierra la lista, no el modal que la contiene. | — |

### Modal (`uki-modal`, `UkiDialogService`)
| ID | Requisito | Figma |
|---|---|---|
| RF-3 | `<uki-modal [(open)] title="…" size="default\|small" type="informative\|confirmation">`: abre con `showModal()` y cierra con `close()`. El velo ocupa toda la pantalla con `elevation/scrim` (D3) y el panel queda centrado. | Overlay; descripción del componente |
| RF-4 | Panel: ancho 640 px (Default) o 480 px (Small), y en pantallas angostas `100% − 32px`; `radius-8`, `background/surface`, `Elevation/modal`. Alto máximo `100dvh − 32px`: el cuerpo se desplaza y el encabezado y el pie se quedan. | Variantes `458:67`, `458:93` |
| RF-5 | Encabezado de 80 px: relleno `spacing-20` arriba y abajo, `spacing-32` a la izquierda y `spacing-16` a la derecha, espacio `spacing-16`, fondo `modal/header`. Título `<h2>` en Noto Sans SemiBold h5 y `modal/header-foreground`; es el nombre accesible del diálogo (`aria-labelledby`). | Header `458:68`, Title `458:63` |
| RF-6 | Botón × de 40 × 40 px, `radius-4`, ícono `x` de 24 px en `modal/header-foreground`, `aria-label="Cerrar"`. Foco: borde de 2 px `text/inverse` (sobre `modal/header` da 9.9:1). | Close `458:64`; anatomía |
| RF-7 | Cuerpo: relleno `spacing-24` arriba y `spacing-32` a los lados y abajo, espacio `spacing-16`, Body/Medium `text/primary`. Con `describeBody` (encendido por omisión), el diálogo lleva `aria-describedby` al cuerpo. | Body `458:73`, Intro/Message |
| RF-8 | Pie (`[ukiModalFooter]`, opcional): relleno `spacing-8` arriba y `spacing-32` a los lados y abajo; los botones (48 px) se acomodan como Button group: a la derecha con espacio `spacing-16` en escritorio y apilados con el principal arriba en < 768 px. `ukiModalClose` en un botón cierra el modal. | Footer `458:76`, Button group `458:130` |
| RF-9 | Foco según D5, cierre según D6 y bloqueo del scroll según D7. `(closed)` emite el motivo: `'close'` (×), `'escape'`, `'backdrop'` o `'action'` (`ukiModalClose` o `open = false`). | Descripción del componente |
| RF-10 | Varios modales apilados (una confirmación desde otro modal): Esc cierra solo el de arriba y el foco vuelve dentro del de abajo. | — |
| RF-11 | `UkiDialogService.confirm({ title, message, confirmLabel, cancelLabel = 'Cancelar', destructive, size = 'small' })` devuelve `Promise<boolean>` (`true` solo con el botón de confirmar). Con `destructive`, el botón de confirmar es Danger (pregunta abierta 2); si no, Primary. `inform({ title, message, actionLabel = 'Entendido', size })` devuelve `Promise<void>`. En SSR, `confirm` responde `false` sin abrir nada. | Tipos Informative y Confirmation |
| RF-12 | Entrada y salida de 200 ms (opacidad del velo y opacidad y escala de 0.98 del panel); sin animación con `prefers-reduced-motion: reduce`. | No lo define Figma |
| RF-13 | La región de avisos de Toast sigue a D8. | Entrega 3, área de preocupación |

### Breadcrumbs (`uki-breadcrumbs`)
| ID | Requisito | Figma |
|---|---|---|
| RF-14 | `[items]`: lista de `{ label, link?, href? }`. Se dibuja `<nav aria-label="Ruta de navegación">` con `<ol>`; cada nivel es un `<li>`. El último es la página actual: `<span aria-current="page">` sin enlace, aunque traiga `link`. | Descripción del organismo |
| RF-15 | Elemento: relleno `spacing-2` arriba y abajo y `spacing-4` a los lados, espacio `spacing-4`, `radius-4`, 24 px de alto. Texto en estilo Label (14/20, Medium). Enlace en `breadcrumb/link`, siempre subrayado; Hover en `breadcrumb/link-hover`. Actual en `breadcrumb/current`, sin subrayado. | Item `362:164`, Label `362:167`, `362:171`, `362:179` |
| RF-16 | El primer nivel lleva el ícono `house` de 16 px antes del texto (se apaga con `[homeIcon]="false"`). | «First level shows the house icon» |
| RF-17 | Separador: `chevron-right` de 16 px en `breadcrumb/separator`, decorativo (`aria-hidden`), con espacio `spacing-4` entre elementos. | Separator `429:3654`; organismo `362:1463` |
| RF-18 | Con 5 niveles o más: primer nivel, botón «…» y los dos últimos. El botón mide 24 × 24 px, `radius-4`, `aria-label="Mostrar ruta completa"`, `aria-expanded` y `aria-controls`; abre en la capa de D2 una lista con los niveles ocultos (D11). Esc o un clic fuera la cierran y el foco vuelve al botón. | Overflow `362:193`; tipo Collapsed |
| RF-19 | En < 768 px, solo un enlace a la página padre (el penúltimo nivel) con `chevron-left` de 16 px y su nombre; el lector oye «Volver a Solicitudes» (D10). | Mobile `362:1533`, Back link `362:1534` |
| RF-20 | Foco: borde de 2 px alrededor del elemento (pregunta abierta 4: `border/brand` en lugar de `button/focus-ring`). | Item Focus `362:172` |

### Table (`uki-table`)
| ID | Requisito | Figma |
|---|---|---|
| RF-21 | Estructura: barra superior, región con scroll horizontal (D14) con `<table>` semántica (`<caption>` según D18, `<th scope="col">` y `<td>`) y paginación. Contenedor con borde 1 px `table/border`, `radius-8` y `background/surface`. | Desktop Default `369:198` |
| RF-22 | `columns`: lista de `{ key, header, sortable?, align?: 'start' \| 'end', card?: 'title' \| 'status' \| 'field' \| 'hidden', value?: (row) => string }`. Sin `value` ni plantilla `ukiTableCell`, la celda muestra `row[key]`. | Molecules: Cell y Column |
| RF-23 | Encabezado: 48 px, relleno `spacing-16` a los lados, espacio `spacing-8`, fondo `table/header-background`, borde inferior 1 px `table/border`, texto en Label Bold (14/20, 700) `text/secondary`, máximo 256 px con elipsis. | Header Text `367:107`, Label `367:108` |
| RF-24 | Celda: 52 px de alto, relleno `spacing-16` a los lados, mínimo 80 px y máximo 288 px de texto con elipsis (el texto completo queda en el DOM para el lector), Body/Small `text/primary`, borde inferior 1 px `table/border`. Importes alineados a la derecha con `align: 'end'`. | Data Text `470:7277`; «right-align amounts» |
| RF-25 | Filas: impares `table/row`, pares `table/row-striped`, Hover `table/row-hover` (solo con puntero), seleccionadas `table/row-selected`. Hover y selección ganan a la franja, y el borde entre filas se queda siempre. | «Striped rows», Anatomy: Rows |
| RF-26 | Orden: en las columnas `sortable`, el texto del encabezado es un `<button>` con el ícono de orden; el `<th>` lleva `aria-sort` (`ascending`, `descending` o `none`). El clic cambia de ascendente a descendente y una columna nueva empieza en ascendente. `[(sort)]` es `{ key, direction } \| null`. Se anuncia «Ordenado por Fecha, descendente». | «Sort», Header `367:107` |
| RF-27 | Selección (con `selectable`): columna de 56 px con `uki-checkbox`. El encabezado tiene «Seleccionar todas las filas» (indeterminado si hay algunas) y cada fila «Seleccionar {rowLabel}». `[(selection)]` según D15. | Select column; Cell Select |
| RF-28 | Acciones por fila (`actions`: lista o función por fila de `'view' \| 'edit' \| 'delete' \| 'restore' \| 'comment'`): botones de ícono de 32 px (40 px en tarjetas), `radius-4`, separados `spacing-4`, alineados a la izquierda en la última columna (mínimo 96 px). Hover `button/tint` (Delete: `feedback/error/background`); Delete en `feedback/error/foreground`. `aria-label` «Ver {rowLabel}», «Editar…», «Eliminar…», «Restaurar…», «Comentar…», y tooltip con la acción (D17). Emiten `(action)` con `{ action, row }`; la tabla no confirma ni elimina. | Action `489:4763`–`489:4794` |
| RF-29 | Barra superior, 72 px, relleno `spacing-16` a los lados, espacio `spacing-16`, `background/surface`. Sin selección: título (D18), conteo («48 registros»), `uki-search` (Default, 40 px) con `searchable`, y acciones propias (`[ukiTableToolbar]`, por ejemplo Exportar). Con selección: fondo `table/row-selected`, botón × «Quitar selección», «3 filas seleccionadas» y acciones en lote proyectadas (`[ukiTableBulkActions]`). | Toolbar `368:305`, None `368:266` |
| RF-30 | Búsqueda: `(searchChange)` emite el texto (desviación 1 del plan) (300 ms de espera de Search) y la tabla anuncia el total con `resultados` de Search. | «Search» |
| RF-31 | Paginación (desktop): 56 px, relleno `spacing-24` a la izquierda y `spacing-16` a la derecha, espacio `spacing-16`, `background/surface`, dentro de `<nav aria-label="Paginación">`. Filas por página (`pageSizeOptions`, por omisión 5, 10 y 25) con el Select en tamaño compacto; rango «1–10 de 48»; botones de página de 32 × 32 px, `radius-4` (actual: fondo `checkbox/selected`, texto `text/inverse`, `aria-current="page"`; Hover `button/tint`); «…» deshabilitado para las páginas omitidas; anterior y siguiente con `aria-label`. Se muestran la primera, la última y la actual ± 1. `[(page)]` empieza en 1; al cambiar `pageSize` vuelve a 1. | Pagination `368:342`, Desktop `368:306`, Page button `367:150` |
| RF-32 | Teléfono (< 768 px, D14): lista de tarjetas. Cada una tiene arriba la casilla, la columna `card: 'title'` (folio) y la `card: 'status'`; luego las demás como pares etiqueta/valor (`<dl>`) y abajo las acciones de 40 px. Seleccionada: `table/row-selected` y borde 1 px `border/brand`. Arriba de la lista, «Seleccionar todas» y un Select «Ordenar por» con las columnas ordenables. Paginación compacta: rango, anterior y siguiente, y «1 / 10». | Card `368:387`; Mobile Default y Selected |
| RF-33 | Estado vacío (`rows` vacío y sin `loading`): una fila con el mensaje (`emptyMessage`) en Body/Medium `text/secondary`, relleno `spacing-48` arriba y abajo y `spacing-24` a los lados, espacio `spacing-12`, fondo `table/row`, y, si hay búsqueda, el botón Secondary «Limpiar búsqueda», que borra Search y emite `(searchChange)` con `''`. Encabezado y barra superior siguen visibles. | Empty `368:388` |
| RF-34 | Cargando según D16. | No lo define Figma |

### Breadcrumbs: tokens por estado
| Estado | Texto | Subrayado | Foco |
|---|---|---|---|
| Link · Default | `breadcrumb/link` | Sí | — |
| Link · Hover | `breadcrumb/link-hover` | Sí | — |
| Link · Focus | `breadcrumb/link` | Sí | borde 2 px (`border/brand`, pregunta abierta 4) |
| Current | `breadcrumb/current` | No | — |
| Separador | `breadcrumb/separator` | — | — |

Valores de referencia: `breadcrumb/link` #8E1D3F (guinda) y #004339 (verde), 8.8:1 y 11.3:1 sobre blanco; `breadcrumb/link-hover` #611232 y #002F2A; `breadcrumb/current` #161A1D; `breadcrumb/separator` #AAAAAA.

### Table: tokens por parte y estado
| Parte · estado | Fondo | Texto | Borde |
|---|---|---|---|
| Contenedor | `background/surface` | — | 1 px `table/border`, `radius-8` |
| Encabezado | `table/header-background` | `text/secondary`, Label Bold | inferior 1 px `table/border` |
| Fila impar | `table/row` | `text/primary`, Body/Small | inferior 1 px `table/border` |
| Fila par | `table/row-striped` | `text/primary` | inferior 1 px `table/border` |
| Fila · Hover | `table/row-hover` | `text/primary` | inferior 1 px `table/border` |
| Fila · Selected | `table/row-selected` | `text/primary` | inferior 1 px `table/border` |
| Barra superior · selección | `table/row-selected` | `text/primary` | — |
| Acción · Hover | `button/tint` (Delete: `feedback/error/background`) | ícono (Delete: `feedback/error/foreground`) | — |
| Acción · Focus | — | — | 2 px (pregunta abierta 4) |
| Página actual | `checkbox/selected` | `text/inverse` | — |
| Página · Hover | `button/tint` | `text/primary` | — |
| Tarjeta · Selected | `table/row-selected` | `text/primary` | 1 px `border/brand` |

Valores de referencia: `table/header-background` #F3F3F3, `table/row` #FFFFFF, `table/row-striped` #F9F9F9, `table/row-hover` #F3F3F3, `table/row-selected` #F3E4E9 (guinda) y #E0E9E8 (verde), `table/border` #DDDDDD, `text/secondary` #434343 (8.9:1 sobre el encabezado).

### Modal: tokens por parte
| Parte | Fondo | Texto | Otros |
|---|---|---|---|
| Velo | `elevation/scrim` (neutral/800 al 48 %) | — | — |
| Panel | `background/surface` | — | `radius-8`, `Elevation/modal` |
| Encabezado | `modal/header` (#434343) | `modal/header-foreground` (#FFFFFF), 9.9:1 | 80 px |
| Botón × · Focus | — | `modal/header-foreground` | borde 2 px `text/inverse` |
| Cuerpo | `background/surface` | `text/primary`, Body/Medium | — |

## Requisitos no funcionales
- **Accesibilidad:** WCAG 2.1 AA y axe sin violaciones en las páginas nuevas, en los dos temas y en móvil. Todo se usa con teclado: Tab, Mayús+Tab y Esc en el modal; Enter en los enlaces de la ruta y en el botón «…»; Espacio en las casillas; Enter y Espacio en los botones de orden, acciones y páginas. Áreas táctiles de 40 px en teléfono (tarjetas).
- **Lectores de pantalla:** el modal se anuncia con su título y su descripción; lo de atrás no se lee. El orden, el cambio de página y la selección se anuncian en una región `polite` de la tabla.
- **Compatibilidad, CSP y tamaño:** igual que las entregas anteriores. Sin `innerHTML` ni estilos en línea; las coordenadas de la capa se fijan con CSSOM. En SSR, el servicio de diálogos no abre nada y la tabla dibuja la versión de escritorio.
- **Dependencias:** `@angular/router` pasa a ser peerDependency (D9). No se agrega `@angular/cdk`.

## Diseño
### API pública
```html
<!-- Modal declarativo -->
<uki-modal [(open)]="editando" title="Editar responsable" size="small">
  <uki-field label="Correo"><input ukiInput ukiModalFocus formControlName="correo" /></uki-field>
  <div ukiModalFooter>
    <button ukiButton variant="secondary" type="button" ukiModalClose>Cancelar</button>
    <button ukiButton type="submit">Guardar</button>
  </div>
</uki-modal>

<!-- Breadcrumbs -->
<uki-breadcrumbs [items]="[
  { label: 'Inicio', link: '/' },
  { label: 'Trámites', link: '/tramites' },
  { label: 'Solicitudes', link: '/tramites/solicitudes' },
  { label: 'SOL-2026-0148' }
]" />

<!-- Table -->
<uki-table caption="Solicitudes" [columns]="columnas" [rows]="pagina().filas" [total]="pagina().total"
           [rowKey]="porFolio" [rowLabel]="nombreDeFila" selectable [(selection)]="seleccion"
           [actions]="['view', 'edit', 'delete']" searchable [loading]="cargando()"
           [(page)]="pag" [(pageSize)]="tam" [(sort)]="orden" emptyMessage="No hay solicitudes que coincidan."
           (searchChange)="buscar($event)" (action)="alActuar($event)">
  <ng-template ukiTableCell="estado" let-fila><uki-badge [type]="fila.tipo">{{ fila.estado }}</uki-badge></ng-template>
  <button ukiTableBulkActions ukiButton variant="secondary" type="button">Descargar</button>
</uki-table>
```

```ts
private readonly dialogos = inject(UkiDialogService);

async alActuar({ action, row }: UkiTableActionEvent<Solicitud>): Promise<void> {
  if (action !== 'delete') return;
  const eliminar = await this.dialogos.confirm({
    title: '¿Eliminar la solicitud?',
    message: `Se eliminará ${row.folio}. Esta acción no se puede deshacer.`,
    confirmLabel: 'Eliminar',
    destructive: true,
  });
  if (eliminar) this.solicitudes.eliminar(row.folio);
}
```

Exportaciones nuevas: `UkiModal`, `UkiModalFooter`, `UkiModalClose`, `UkiModalFocus`, `UkiDialogService`, `UkiBreadcrumbs`, `UkiTable`, `UkiTableCell`, `UkiTableToolbar`, `UkiTableBulkActions`, y los tipos `UkiModalSize`, `UkiModalType`, `UkiModalCloseReason`, `UkiConfirmOptions`, `UkiInformOptions`, `UkiBreadcrumbItem`, `UkiTableColumn`, `UkiTableSort`, `UkiTableActionType`, `UkiTableActionEvent`. La capa (`capa/`) y el tooltip son internos.

### Documentación
Tres páginas nuevas en el grupo Componentes (Breadcrumbs, Modal y Table), en orden alfabético, con la distribución de cada página de Figma:

- **Modal:** Overview, Átomos (encabezado), Moléculas (los dos tipos y tamaños, vivos), Anatomía (6 partes), Tipos con tabla (uso, acciones y cómo se cierra), y ejemplos: confirmación con el servicio, informativo y formulario corto. Más «Accesibilidad» (foco, Esc, inerte) y una demostración de un Toast mostrado desde el modal.
- **Breadcrumbs:** Overview, Moléculas (elemento en sus cuatro estados, separador y «…»), Organismos (2, 3 y 4 niveles, Collapsed y Mobile), Anatomía (5 partes) y Tipos con tabla de tokens.
- **Table:** Overview, Átomos (acciones, botón de página y anterior/siguiente), Moléculas (celdas, barra superior, paginación, tarjeta y vacío), Organismos (tabla viva con datos de ejemplo paginados por un «servidor» simulado en la documentación), Anatomía (8 partes), Comportamiento (tabla de Figma) y Teclado.
- **Select:** ejemplo nuevo dentro de una tarjeta con `overflow: hidden`.

## Áreas de preocupación
| Punto | Dueño | Estado |
|---|---|---|
| La capa sin Popover API (Safari 16, Firefox < 125) queda con `z-index: 1000` y se recorta si un ancestro tiene `transform`, `filter` o `contain`. Se documenta; el modal no usa `transform` en el elemento que contiene la lista. | Pablo | Propuesto |
| Chrome ignora un segundo `preventDefault` de `cancel` seguido si no hubo interacción (protección contra modales que no se cierran). `closeOnEsc = false` se resuelve en `keydown` y se documenta como temporal. | Pablo | Propuesto |
| Un tema puesto en un contenedor (`data-uki-theme` en un `div`) no llega a los diálogos del servicio, que se crean al final de `<body>`. Se documenta: el tema va en `<html>`. | Pablo | Aceptado |
| La tabla en teléfono decide con `matchMedia`; si un sistema la pone en una columna angosta de escritorio, verá la tabla con scroll horizontal, no tarjetas. | Diseño UKI | Propuesto |
| El encabezado del modal mide 80 px en el componente y 64 px en la anatomía de Figma. Se sigue el componente y se avisa a diseño. | Diseño UKI | Propuesto |
| Figma no define el estilo del tooltip; se usa `text/primary` de fondo, `text/inverse` y Caption. | Diseño UKI | Propuesto |

## Preguntas abiertas
1. Navegadores del Banco: si hay lista oficial (intent, pregunta 1). No bloquea: D2 funciona con y sin Popover API.
2. Danger o Primary en la confirmación destructiva (intent, pregunta 2). Propuesta: Danger con `destructive`.
3. Tarjetas en teléfono en lugar de scroll horizontal (intent, pregunta 3). Propuesta: seguir a Figma (D14).
4. Foco con `border/brand` en lugar de `button/focus-ring` en enlaces de la ruta y botones de ícono de la tabla, por contraste (intent, pregunta 4).
5. Confirmar con diseño que la documentación vigente de Breadcrumbs es la `363:216` y que la `361:115` se puede borrar.

## Fuera de alcance
- Modal de pantalla completa, con pasos (wizard), arrastrable o no modal; `UkiDialogService.open(Componente)` con datos.
- Breadcrumbs generados solos desde la configuración del router.
- Filtros por columna, columnas que se reordenan o cambian de ancho, filas que se expanden, edición en la celda, selección por rango con Mayús, exportar (el botón va proyectado), «Deshacer» después de eliminar (Toast no tiene acción) y virtualización.
- Tooltip como componente público.
