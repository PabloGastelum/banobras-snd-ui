# Intent: Modal, Breadcrumbs y Table de UKI (entrega 4)

- Sistema: compartido (Portal FONADIN, SISSARR, SAAIPB, SISEC, SIVARMER) · Slug: `navegacion-y-datos` · Estado: accepted
- Autor: Pablo Gastelum (frontend) · Fecha: 29/10/2026
- Origen: plan de entregas acordado el 29/10/2026 (entrega 1: tokens y Button; entrega 2: campos; entrega 3: retroalimentación). Fuera de la fábrica, con el mismo orden: intención → especificación → plan → código.
- Referencias: UKI - Library en Figma, páginas **Modal** (`458:59`), **Breadcrumbs** (`360:59`) y **Table** (`365:59`). Leídas desde el navegador integrado con permiso de lector (árbol de capas y panel de Propiedades), sin usar la cuota del MCP.

## Problema
Los 5 sistemas son, sobre todo, listados de registros con acciones: solicitudes, trámites, procesos del catálogo Universo. Para eso les faltan tres piezas de `@banobras/uki`:

- **Una tabla** con orden, selección, acciones por fila, paginación y una versión para teléfono. Sin ella, cada equipo arma la suya, con estilos, teclado y anuncios distintos, y con la tentación de filtrar y paginar en el navegador, lo que contradice la regla de que esas reglas viven en el servidor.
- **Un diálogo modal** para confirmar acciones destructivas («¿Eliminar el trámite?») e informar de algo que se tiene que leer antes de seguir. Un modal mal hecho deja escapar el foco, no se cierra con Esc o deja que se use la página de atrás.
- **Una ruta de navegación** (breadcrumbs) para las páginas de dos o más niveles, que hoy cada sistema dibuja a mano.

Además, hay dos deudas de las entregas anteriores:

- La lista del Select se dibuja con `position: absolute` y se recorta dentro de contenedores con `overflow: hidden` (modales, tablas, tarjetas). La entrega 2 lo dejó para hoy.
- La región de avisos de Toast queda inerte detrás de un modal abierto, así que un aviso mostrado desde un modal no se vería ni se anunciaría. La entrega 3 lo dejó para hoy.

## Resultado propuesto
- **Modal:** diálogo centrado sobre un velo oscuro, en dos tipos (Informative y Confirmation) y dos anchos (640 y 480 px). El foco entra al abrir, no sale mientras está abierto y vuelve al botón que lo abrió al cerrar. Se cierra con ×, con Esc o con sus botones. Se usa en la plantilla o desde el código, y para las confirmaciones basta una línea: `await dialogos.confirm({...})`.
- **Breadcrumbs:** ruta desde «Inicio» hasta la página actual, con la última sin enlace y con `aria-current="page"`. Desde 5 niveles, los intermedios se agrupan en «…»; en teléfonos queda un solo enlace «‹ Página anterior».
- **Table:** tabla semántica con barra superior (título, conteo y búsqueda, o la barra de acciones en lote cuando hay filas seleccionadas), orden por columna, selección con Checkbox, acciones por fila con íconos, paginación y estados vacío y cargando. En teléfonos, cada fila se vuelve una tarjeta. **El componente no ordena, filtra ni pagina**: emite eventos para que el sistema le pida la página al servidor.
- **Capa superpuesta:** la lista del Select, el menú «…» de Breadcrumbs y los tooltips de la tabla se dibujan en una capa que no se recorta. Los avisos de Toast se siguen viendo y anunciando con un modal abierto.

La documentación tiene una página por componente con la distribución de Figma (Overview, Átomos, Moléculas u Organismos, Anatomía, tipos o comportamiento con sus tokens) y ejemplos con «Ver código» y «Copiar».

## Usuarios y sistemas afectados
- Desarrolladores frontend de los 5 sistemas.
- Diseño UKI, que revisa la documentación contra Figma.
- Personas usuarias de los listados de los 5 sistemas, en particular quienes usan lector de pantalla, teclado o teléfono.

## Restricciones
- Las mismas de las entregas anteriores: Angular 20–22, WCAG 2.1 AA, CSP con nonce (sin estilos ni scripts en línea), sin CDN ni dependencias en tiempo de ejecución, temas guinda y verde solo con tokens semánticos.
- Sin lógica de negocio en el frontend: la tabla muestra la página que le dan y emite eventos. No ordena, no filtra y no pagina. El modal no decide qué es destructivo.
- Soporte de navegadores: el de Angular 20 («Baseline ampliamente disponible»: Chrome y Edge 107+, Firefox 104+, Safari 16+), salvo que el Banco tenga una lista más estricta (pregunta abierta 1).

## Criterio de éxito
- Cada parte de Modal, Breadcrumbs y Table se ve con sus tokens y medidas de Figma. Las E2E comparan colores y medidas en guinda y en verde.
- En el modal, el foco no puede salir con Tab ni con Mayús+Tab, vuelve al disparador al cerrar, y lo que queda atrás no se puede usar ni se lee.
- La tabla se usa completa con teclado (orden, selección, acciones y paginación) y anuncia el orden (`aria-sort`) y el resultado de la búsqueda.
- La lista del Select no se recorta dentro de un contenedor con `overflow: hidden` ni dentro de un modal.
- axe sin violaciones en las páginas nuevas, en los dos temas y en móvil.

## Preguntas abiertas
1. **Navegadores del Banco.** ¿Hay una lista oficial de navegadores y versiones mínimas? El Popover API (para la capa superpuesta) llegó en Safari 17 y Firefox 125. La propuesta funciona sin él, pero conviene saber si se puede contar con él.
2. **Botón de confirmar en una acción destructiva.** Figma usa Primary («Guardar», «Borrar») en el modal de confirmación, pero la página de Button pide Danger para lo destructivo. Propuesta: Danger cuando la confirmación es destructiva.
3. **Tabla en teléfono.** Figma pide tarjetas debajo de 768 px y «nunca scroll horizontal en teléfonos». La instrucción de la entrega mencionaba scroll horizontal en móvil. Propuesta: tarjetas en teléfono (Figma), y scroll horizontal accesible solo en tableta y escritorio cuando las columnas no caben.
4. **Foco visible de enlaces y botones de ícono.** Figma usa un borde de 2 px `button/focus-ring` (#CE92A6), que sobre blanco da 2.5:1, menos del 3:1 de WCAG 1.4.11. Propuesta: `border/brand`, como el foco del Ghost button.
