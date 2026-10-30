# Plan: Modal, Breadcrumbs y Table de UKI, entrega 4 (desde specs/navegacion-y-datos.md)

- Sistema: compartido · Slug: `navegacion-y-datos` · Riesgo: alto (Table y capa superpuesta), medio en Modal y bajo en Breadcrumbs
- Aprobado por: Pablo Gastelum · Fecha: 29/10/2026
- Repositorio: `PabloGastelum/banobras-snd-ui` · Rama: `feat/navegacion-y-datos`, creada desde `main` (el PR #2 de la entrega 3 ya se fusionó) · Integra por PR a `main` con CI y vista previa de Vercel.

## Archivos que cambian
- `projects/uki/package.json` (modificado): `@angular/router` como peerDependency `>=20.0.0 <23.0.0` (D9).
- `projects/uki/src/lib/iconos/icono.ts` (modificado): los íconos de D19.
- `projects/uki/src/lib/capa/` (nuevo, interno): `capa.ts` (posición con `position: fixed`, volteo, scroll y resize, Popover API si existe; D2), `tooltip.ts` (D17), `capa.spec.ts`.
- `projects/uki/src/lib/select/select.ts`, `select.css`, `select.spec.ts` (modificados): la lista usa la capa (RF-1 y RF-2) y una variante compacta interna para la paginación.
- `projects/uki/src/lib/modal/modal.ts`, `modal.css`, `modal-pila.ts`, `dialog.service.ts`, `modal.spec.ts`, `dialog.service.spec.ts` (nuevos): `UkiModal`, sus directivas y `UkiDialogService` (RF-3 a RF-13). `modal-pila.ts` lleva la pila de modales abiertos, el bloqueo del scroll y el aviso a Toast.
- `projects/uki/src/lib/toast/toast.service.ts` y `toast.spec.ts` (modificados): la región se mueve con la pila de modales (D8).
- `projects/uki/src/lib/breadcrumbs/breadcrumbs.ts`, `breadcrumbs.css`, `breadcrumbs.spec.ts` (nuevos): `UkiBreadcrumbs` (RF-14 a RF-20).
- `projects/uki/src/lib/table/table.ts`, `table.css`, `table-paginacion.ts`, `table-tarjetas.ts`, `table.directivas.ts`, `table.spec.ts` (nuevos): `UkiTable` y sus partes (RF-21 a RF-34).
- `projects/uki/src/public-api.ts` (modificado): exportaciones nuevas.
- `projects/uki/src/test-setup.ts` o equivalente (modificado): polyfill de prueba de `HTMLDialogElement.showModal`/`close` y de `matchMedia` en jsdom, solo para Vitest.
- `projects/demo/src/app/paginas/modal.ts`, `breadcrumbs.ts`, `table.ts` (nuevos), `paginas/select.ts` (modificado: ejemplo con `overflow: hidden`) y `app.routes.ts`, `app.ts`, `paginas/inicio.ts` (modificados).
- `e2e/navegacion-y-datos.spec.ts` (nuevo), `e2e/campos.spec.ts` (modificado: Select sin recorte) y `e2e/accesibilidad.spec.ts`, `e2e/maquetacion.spec.ts`, `e2e/temas.spec.ts` (modificados): rutas nuevas.
- `README.md` (modificado): tabla «Qué incluye», ejemplos, peerDependency nueva y pendientes.
- `docs/sdlc/…/navegacion-y-datos.md`: esta intención, especificación y plan.

## Orden de trabajo
1. **Íconos y capa.** Agregar los íconos. Pruebas en rojo de la capa: coloca el panel debajo del ancla con su ancho, lo voltea si no cabe, se recoloca con scroll y resize, usa `showPopover()` si existe y `z-index` si no, y limpia sus escuchas al cerrar. Después la implementación.
2. **Select con la capa.** Ajustar `select.spec.ts` (las pruebas de teclado no cambian) y mover la lista a la capa. Esc con la lista abierta llama a `preventDefault` para que no cierre un modal. Revisar a mano en la documentación que nada cambió.
3. **Modal.** Pruebas en rojo con el polyfill de `<dialog>`: abre y cierra con `[(open)]`; `aria-labelledby` y `aria-describedby`; foco inicial según D5 (`ukiModalFocus`, Cancelar, principal, ×); Tab y Mayús+Tab dan la vuelta; el foco vuelve al disparador; Esc, × y velo según D6 y `(closed)` con el motivo; clase de bloqueo de scroll; dos modales apilados; `confirm()` y `inform()` con sus promesas; SSR. Después la implementación.
4. **Toast dentro del modal.** Prueba en rojo: con un modal abierto, la región de avisos está dentro del `<dialog>` y vuelve a `<body>` al cerrarlo; las regiones vivas no se crean de nuevo. Después el cambio.
5. **Breadcrumbs.** Pruebas en rojo: `nav` con `aria-label`, `ol`, último con `aria-current` y sin enlace, `routerLink` y `href`, ícono de casa, separadores ocultos, colapso desde 5 niveles con «…» y su lista (Esc y foco), y el enlace de teléfono con «Volver a». Después la implementación.
6. **Table.** Es el paso de mayor riesgo; se divide:
   1. Estructura, columnas, plantillas de celda, `caption`, alineación, franjas, vacío y cargando.
   2. Orden con `aria-sort` y anuncio.
   3. Selección por clave con «Seleccionar todas» indeterminado y barra de acciones en lote.
   4. Acciones por fila con `aria-label` y tooltip.
   5. Paginación (páginas visibles, «…», anterior y siguiente, filas por página).
   6. Tarjetas en teléfono con `matchMedia` falso en las pruebas.

   Cada parte va con sus pruebas en rojo antes de implementarla.
7. **Documentación.** Tres páginas con la distribución de Figma (ver «Documentación» en la especificación), con anatomía (`demo-anatomia`), tablas de tokens (`demo-token`) y ejemplos copiables (`demo-ejemplo`). Datos de ejemplo de la tabla en un servicio simulado de la documentación que ordena y pagina como lo haría el servidor. Ejemplo nuevo del Select dentro de una tarjeta con `overflow: hidden`. Rutas, menú e inicio.
8. **E2E.** `e2e/navegacion-y-datos.spec.ts`:
   - Medidas y colores contra Figma en guinda y verde: panel de 640 y 480 px, encabezado de 80 px, velo; elementos de 24 px, colores de enlace, hover y actual; encabezado de 48 px, celdas de 52 px, franjas, hover, selección, página actual.
   - Modal: trampa de foco con Tab y Mayús+Tab, foco inicial y devolución, Esc, lo de atrás inerte (un clic fuera no llega), sin scroll del fondo, y un Toast mostrado desde el modal visible y en la región viva.
   - Breadcrumbs: teclado en el «…», enlace de teléfono a 375 px.
   - Table: teclado completo (orden, casillas, acciones, páginas), `aria-sort`, tarjetas a 375 px y scroll horizontal enfocable a 1024 px.
   - En `campos.spec.ts`: el Select dentro de un contenedor con `overflow: hidden` muestra la lista completa (sus 6 opciones visibles y clicables) y dentro de un modal.
   - Agregar las rutas a accesibilidad, maquetación y temas.
9. **README** y prueba de terminación. Abrir el PR y revisar la vista previa de Vercel contra Figma.

## Riesgos
- **Qué puede romperse.**
  - El Select de las entregas anteriores al cambiar a la capa: foco, clic fuera y scroll de la lista. Se cubre con las pruebas existentes y con la E2E de teclado de `campos.spec.ts`.
  - `<dialog>` en jsdom: no implementa `showModal()` ni la inercia. Las pruebas unitarias cubren la lógica con un polyfill; la inercia, el Esc nativo y la capa superior se prueban en Playwright.
  - Toast: mover la región puede cortar un anuncio en curso; se mueve antes de abrir el modal (`showModal` va después) y la E2E lo comprueba.
  - Un `peerDependency` nuevo (`@angular/router`) en los sistemas: todos lo tienen; `verify:consumo` lo confirma con Angular 20.3 y 22.2.
- **Paso de mayor riesgo.** El 6 (Table), por su tamaño. Se divide en seis partes con pruebas propias y la documentación se arma al final, cuando la API ya no cambia.
- **Alternativas descartadas.**
  - **`@angular/cdk`** (`Dialog`, `Overlay`, `FocusTrap`, `LiveAnnouncer`): resuelve el modal y la capa, y su CSS respeta el nonce. Pero agrega una peerDependency atada a la versión mayor de Angular de cada sistema (cada uno tendría que instalar la misma mayor que su `core`), su diálogo es un `div` con `aria-hidden` en los hermanos en lugar de la capa superior y la inercia nativas, y suma código que el navegador ya trae. Se reconsidera si un componente futuro (por ejemplo, un *combobox* con autocompletado) necesita más de lo que da D2.
  - **Solo Popover API** para la capa: más simple, pero deja sin lista a Safari 16 y Firefox < 125, que entran en el soporte de Angular 20.
  - **CSS anchor positioning**: no está en Firefox ni en Safari 17.
  - **Breadcrumbs con enlaces proyectados** (`<a ukiBreadcrumb routerLink>`): evita la peerDependency, pero el colapso y el enlace de teléfono tendrían que mover nodos que no son del componente.
  - **Table como directivas sobre una `<table>` propia del sistema**: más flexible, pero no puede dibujar las tarjetas de teléfono ni garantizar `scope`, `aria-sort` y el resto de la anatomía de Figma.
  - **Tabla con scroll horizontal también en teléfono**: lo prohíbe Figma (pregunta abierta 3).

## Prueba de terminación
```bash
npm ci
npm run lint
npm run typecheck
npm run tokens:check
npm test                # Vitest: capa, select, modal, dialog.service, toast, breadcrumbs y table en verde
npm run build:uki
npm run build:demo
npm run e2e             # Playwright + axe con las rutas nuevas, ambos temas y móvil
npm run verify:consumo  # peerDependency nueva con Angular 20.3 y 22.2
```
Además, CI en verde en el PR y revisión de la vista previa de Vercel contra Figma.

## Desviaciones durante la implementación
Todas del 30/10/2026.

1. **`(searchChange)` en lugar de `(search)`.** La regla `no-output-native` de ESLint no permite una salida con el nombre de un evento del DOM (`search` lo es en `<input type="search">`).
2. **Filas por página con `<select>` nativo** con los tokens de campo (32 px), en lugar de una variante compacta de `uki-select`. Así no se agrega una entrada pública al Select solo para la paginación, y el control nativo es más cómodo en teléfono.
3. **Anterior y siguiente con `aria-disabled`**, no `disabled`, para que el foco no se pierda al llegar a la primera o a la última página.
4. **Relleno del modal en móvil.** Figma no tiene versión móvil: debajo de 768 px el encabezado, el cuerpo y el pie usan `spacing-24` a los lados en lugar de `spacing-32`.
5. **`aria-modal="true"` explícito** en el `<dialog>`, como pide la descripción del componente en Figma, aunque `showModal()` ya lo implica.
6. **Vistas fijas en la documentación.** Un `<dialog>` cerrado no se dibuja, así que Átomos, Moléculas y Anatomía de Modal usan una vista fija con las mismas clases (`demo-modal-fijo`). Lo mismo para los estados Hover y Focus del elemento de Breadcrumbs y para el enlace de teléfono.
7. **Esc del menú «…» en el anfitrión** de Breadcrumbs, no en la lista: la regla `interactive-supports-focus` no permite un manejador de teclado en una `<ul>` que no recibe foco.
8. **Tooltip junto al botón** (no dentro, para no cambiar su nombre accesible) y Esc escuchado en fase de captura, para que no cierre un modal que contenga la tabla.
9. **`let-fila` sin tipo** en `ukiTableCell` (contexto `any`, como en las tablas de Angular Material): el tipo de la fila no se puede inferir desde una plantilla proyectada.
10. **Barra superior.** Figma no da la tipografía del título: se usa Body/Large SemiBold y el conteo en Body/Small `text/secondary`. La barra mide 72 px como mínimo y crece si las acciones pasan a otra línea.
11. **Estado vacío y cargando** con alto según el contenido (mínimo 160 px), no fijo en 260 px.
12. **Color de los íconos de acción**: `icon/primary` (Eliminar en `feedback/error/foreground`). Figma no lo expone en las variantes leídas; se compara en la revisión de la vista previa.
13. **Ayudas de prueba en `projects/uki/src/lib/pruebas/jsdom.ts`** (polyfill de `<dialog>` y `matchMedia` controlable), importadas por las pruebas que las usan, en lugar de un `test-setup.ts` global.
14. **Tarjetas en `table.ts`.** No hizo falta `table-tarjetas.ts`: la tarjeta comparte las plantillas de celda y de acciones con la fila.
15. **E2E de ancho del modal en móvil.** Se compara contra el ancho del `<dialog>`, porque Chrome de escritorio reserva el carril de la barra de scroll (`scrollbar-gutter: stable`); en un teléfono el carril mide 0.
16. **Átomos de Table** con una tabla viva de una fila (las cinco acciones, el botón de página y anterior/siguiente), porque los íconos de la librería son internos.
17. **El Select del ejemplo nuevo se llama «Entidad»**, para no chocar con el Select «Estado» que ya prueba `campos.spec.ts`.
