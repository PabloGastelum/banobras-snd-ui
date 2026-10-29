# Intent: Componentes de retroalimentación de UKI (entrega 3)

- Sistema: compartido (Portal FONADIN, SISSARR, SAAIPB, SISEC, SIVARMER) · Slug: `retroalimentacion` · Estado: accepted
- Autor: Pablo Gastelum (frontend) · Fecha: 29/10/2026
- Origen: plan de entregas acordado el 29/10/2026 (entrega 1: tokens y Button; entrega 2: campos de formulario). Fuera de la fábrica, con el mismo orden intención → especificación → plan → código.
- Referencias: UKI - Library en Figma, páginas **Alert** (`268:1858`), **Toast** (`450:59`), **Badge** (`359:3226`) y **Avatar** (`310:747`). Leídas desde el navegador integrado con permiso de lector (árbol de capas y panel de Propiedades), sin usar la cuota del MCP.

## Problema
Los 5 sistemas necesitan avisarle a la persona qué pasó: «Solicitud enviada», «El folio no existe», «Tu sesión vence en 5 minutos». También necesitan mostrar el estado de un registro en tablas y tarjetas («Aprobada», «En revisión») y quién es la persona con sesión o quién es dueña de un expediente. Hoy `@banobras/uki` no tiene ninguna de estas piezas, así que cada equipo haría las suyas con colores, íconos y comportamiento distintos, y con el riesgo de anunciar mal los mensajes a lectores de pantalla o de depender solo del color.

UKI ya define las cuatro piezas en Figma, con los mismos tokens `feedback/*` para Alert, Toast y Badge, y `avatar/status` para Avatar.

## Resultado propuesto
Que cualquier sistema pueda dar retroalimentación igual en todos lados:

- **Alert:** mensaje dentro de la página, junto al contenido del que habla, en cuatro tipos (Success, Info, Warning y Error), con ícono y, si se quiere, botón para cerrarlo.
- **Toast:** mensaje flotante que confirma una acción y se cierra solo (Success e Info a los 5 s; Warning y Error se quedan hasta cerrarlos). Se muestra desde el código con un servicio, sin poner nada en la plantilla, se anuncia a lectores de pantalla y no le quita el foco a la persona.
- **Badge:** etiqueta de solo lectura con punto y texto para el estado de un registro.
- **Avatar:** foto circular de una persona en cinco tamaños (24 a 56 px), con punto de «en línea» opcional.

La documentación tiene una página por componente con la distribución de Figma (Overview, Átomos o Moléculas, Anatomía, Tipos o Tamaños con sus tokens) y ejemplos con «Ver código» y «Copiar».

## Usuarios y sistemas afectados
- Desarrolladores frontend de los 5 sistemas.
- Diseño UKI, que revisa la documentación contra Figma.
- Personas usuarias de los 5 sistemas, en particular quienes usan lector de pantalla, teclado o no distinguen colores.

## Restricciones
- Las mismas de las entregas 1 y 2: Angular 20–22, WCAG 2.1 AA, CSP con nonce, sin dependencias externas en tiempo de ejecución, temas guinda y verde solo con tokens semánticos.
- Sin lógica de negocio en el frontend: los componentes muestran el mensaje que el sistema decide; no traducen errores del servidor ni deciden cuándo avisar.
- Toast no puede ser la única forma de terminar una tarea, porque desaparece (regla de Figma).

## Criterio de éxito
- Cada tipo de Alert, Toast y Badge y cada tamaño de Avatar se ve con sus tokens; las E2E comparan colores y medidas con los valores de Figma en los dos temas.
- Un lector de pantalla anuncia cada Toast una sola vez (Error de inmediato; los demás sin interrumpir) y el foco no se mueve al mostrarlo.
- El cierre automático del Toast se pausa con el puntero encima o con el foco dentro.
- axe sin violaciones en las páginas nuevas, en los dos temas y en móvil.

## Preguntas abiertas
1. **Avatar sin foto.** Figma solo dibuja el avatar con imagen (y tiene ilustraciones de muestra de 1000 px: logo de Banobras sobre `brand/primary` y «La Patria»). No dice qué mostrar si la persona no tiene foto o la imagen falla. Propuesta: iniciales sobre `brand/primary`.
2. **Punto de estado del Avatar.** Figma lo pide «siempre visible», pero en Figma es una propiedad (`Status`) que se puede apagar, y la mayoría de los sistemas no saben si la persona está en línea. Propuesta: apagado por omisión y se enciende con una entrada.
3. **Varios Toast seguidos.** Figma pide «uno a la vez». Propuesta: el nuevo reemplaza al que está visible, en lugar de formarlos en cola.
4. **Relleno vertical de Badge.** La anatomía de Figma dice `spacing-8 / spacing-2`, pero el componente usa `spacing-4` arriba y abajo (24 px de alto). Propuesta: seguir al componente y avisar a diseño.
