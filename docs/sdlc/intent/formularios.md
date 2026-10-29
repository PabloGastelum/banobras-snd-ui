# Intent: Campos de formulario de UKI (entrega 2)

- Sistema: compartido (Portal FONADIN, SISSARR, SAAIPB, SISEC, SIVARMER) · Slug: `formularios` · Estado: draft
- Autor: Pablo Gastelum (frontend) · Fecha: 29/10/2026
- Origen: plan de entregas acordado el 29/10/2026 después de la entrega 1 (`biblioteca-componentes-uki`). Fuera de la fábrica, con el mismo orden intención → especificación → plan → código.
- Referencias: UKI - Library en Figma, páginas **Fields** (`208:245`: Text field `210:140`, Text area `445:931`, Select `445:274`) y **Search** (`375:59`). Leídas desde el navegador integrado con permiso de lector (árbol de capas y panel de Propiedades), sin usar la cuota del MCP.

## Problema
Los 5 sistemas son, sobre todo, formularios y listados: registro de solicitudes, filtros de consulta, captura de expedientes. `@banobras/uki` todavía no tiene campos, así que cada equipo armaría los suyos con estilos, estados y accesibilidad distintos. UKI ya los define en Figma con detalle: anatomía, tokens por estado, medidas y reglas de accesibilidad (`aria-required`, `aria-describedby`, `aria-invalid`, `role="listbox"`, `role="search"`).

## Resultado propuesto
Que cualquier sistema pueda armar un formulario o un filtro con piezas de UKI que ya se ven y se comportan igual en todos lados:

- **Text field:** etiqueta siempre visible con indicador de obligatorio, campo de 48 px y texto de ayuda o de error.
- **Text area:** el mismo campo en varias líneas, de 120 px, redimensionable en vertical y con contador de caracteres.
- **Select:** una opción de una lista de 5 a 15, con el mismo aspecto que Text field y su lista desplegable.
- **Search:** campo de búsqueda para tablas y listas, con botón para borrar y el número de resultados anunciado.

Todos funcionan con formularios reactivos y `ngModel`, muestran el error solo cuando corresponde y se pueden operar completos con teclado y lector de pantalla. La documentación tiene una página por componente con ejemplos, «Ver código» y «Copiar».

## Usuarios y sistemas afectados
- Desarrolladores frontend de los 5 sistemas.
- Diseño UKI, que revisa la documentación contra Figma.
- Personas usuarias de los formularios y filtros de los 5 sistemas.

## Restricciones
- Las mismas de la entrega 1: Angular 20–22, accesibilidad WCAG 2.1 AA, CSP con nonce, sin dependencias externas en tiempo de ejecución, temas guinda y verde solo con tokens semánticos.
- Sin lógica de negocio en el frontend: Search solo emite el texto. Filtrar, ordenar y paginar le toca al servidor, según las reglas del programa.
- Los campos no validan reglas de negocio (CURP, RFC, folios); muestran el error que el formulario del sistema decide.

## Criterio de éxito
- Cada estado de Figma (Default, Hover, Focus, Filled, Error, Disabled y, en Select, Open) se ve con sus tokens. Las E2E comprueban colores y medidas contra los valores de Figma.
- Un formulario reactivo con Text field, Text area y Select refleja `value`, `disabled`, `touched` y `dirty`, y el error aparece al salir de un campo inválido.
- Select y Search se usan completos con teclado (flechas, Inicio/Fin, Enter, Esc, Tab y búsqueda por letra en Select; Esc y botón de borrar en Search).
- axe sin violaciones en las páginas nuevas, en los dos temas y en móvil.

## Preguntas abiertas
1. **Select propio o `<select>` nativo.** Figma acepta los dos. El nativo no permite dibujar la lista abierta como UKI (opción seleccionada con fondo y palomita, hover, sombra). Propuesta: un *select-only combobox* propio según el patrón de WAI-ARIA, que respete el estado Open de Figma.
2. **Límite del Text area: estricto o flexible.** Figma dice que el contador «se pone rojo al pasar el límite», o sea que se puede escribir de más. Propuesta: límite flexible (el validador del formulario lo marca como error) en lugar de `maxlength`, que corta el texto sin avisar.
3. **Íconos.** UKI usa el juego «Linear» (`search`, `chevron-down`, `check`, cierre). Falta probar si el archivo deja exportar SVG a lectores. Si no, los dibujo con el mismo trazo de 1.5 px que el resto de la librería.
4. **Radio** sigue sin existir en UKI. Select remite a radio para 2–4 opciones; se pide a diseño y queda fuera de esta entrega.
