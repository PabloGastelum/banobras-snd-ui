# Intent: Marca y patrones de página de UKI (entrega 5)

- Sistema: compartido (Portal FONADIN, SISSARR, SAAIPB, SISEC, SIVARMER) · Slug: `marca-y-patrones` · Estado: accepted
- Autor: Pablo Gastelum (frontend) · Fecha: 30/10/2026
- Origen: plan de entregas acordado el 29/10/2026 (entrega 1: tokens y Button; 2: campos; 3: retroalimentación; 4: Modal, Breadcrumbs y Table). Es la última entrega. Fuera de la fábrica, con el mismo orden: intención → especificación → plan → código.
- Referencias: UKI - Library en Figma, páginas **🔰 Brand** (`572:6984`), **Auth** (`263:913`), **Hero** (`276:2468`), **Header** (`335:493`), **Footer** (`335:494`) y **Sidebar** (`180:2372`), más dos páginas en progreso: **WIP - Page Header** (`641:5408`) y **WIP - ▣ App shell** (`639:5363`). Leídas desde el navegador integrado con permiso de lector (árbol de capas y panel de Propiedades), sin usar la cuota del MCP.

## Problema
Con las entregas 1 a 4, los 5 sistemas ya tienen los componentes de una pantalla (botones, campos, avisos, tablas, modales), pero no el **marco** que las rodea. Hoy cada sistema dibuja por su cuenta:

- **La identidad**: el logotipo de Banobras, el del Gobierno de México y, en algunos sistemas, los de Hacienda o FONADIN. Cada equipo usa un archivo distinto, con otros tamaños, sin el espacio libre que pide la guía de identidad y, a veces, sin texto alternativo.
- **La navegación principal**: la barra lateral, con niveles, estado activo, versión colapsada y versión de teléfono. Es la pieza que más se repite y la que más distinto se comporta de un sistema a otro (teclado, foco, scroll).
- **La barra superior** con el usuario y «Cerrar sesión», y **el pie** con el aviso de derechos.
- **La pantalla de acceso**: el bloque de inicio de sesión y el panel de marca con la ilustración La Patria.

Mientras eso no esté en `@banobras/uki`, los 5 sistemas no se ven idénticos aunque usen los mismos botones.

## Resultado propuesto
- **Logotipos**: Banobras (y su ícono), Gobierno de México, Hacienda y FONADIN como componentes, con sus dos versiones (color y blanco), sus dos tamaños (60 y 32 px de alto), el espacio libre de la guía y un nombre accesible. Los trazos son los vectores oficiales; mientras no estén confirmados los derechos y los archivos, el componente funciona con un marcador del mismo tamaño.
- **Header**: barra superior de 60 px con el botón de usuario (Avatar) que abre un menú con la persona que inició sesión y «Cerrar sesión».
- **Footer**: pie con «© año BANOBRAS.» y el texto de derechos.
- **Sidebar**: navegación principal de 256 px con acordeón de hasta 3 niveles; colapsada a 56 px con paneles flotantes en tableta o cuando la persona la contrae; en teléfono, barra inferior con 4 destinos y un panel de pantalla completa («Más»). La lista hace scroll; la marca, la persona y el botón de contraer quedan fijos.
- **Auth**: bloque de inicio de sesión (logotipo, título, nombre del sistema, aviso opcional, el formulario del sistema y el pie). **El componente no autentica**: el formulario y lo que pasa al enviarlo son del sistema.
- **Hero**: panel de marca de la pantalla de acceso (fondo `brand/primary`, logotipo del Gobierno de México e ilustración La Patria), que se oculta en tableta y teléfono.
- **Plantillas documentadas** (sin componente): la pantalla de acceso completa (Hero + Auth) y la pantalla de administración (Sidebar + Header + Breadcrumbs + título + Footer), que en Figma todavía está en progreso.

La documentación tiene un grupo nuevo, **Marca**, antes de Fundamentos (como en Figma: Brand → Foundations → Components), y otro, **Patrones**, después de Componentes. Cada página sigue la distribución de Figma (Overview, Moléculas u Organismos, Anatomía, estados, dispositivos o tokens) con ejemplos con «Ver código» y «Copiar».

## Usuarios y sistemas afectados
- Desarrolladores frontend de los 5 sistemas, que hoy arman su propio marco.
- Diseño UKI, que revisa la documentación contra Figma, y la Dirección de Imagen, dueña de los logotipos y de la ilustración.
- Personas usuarias de los 5 sistemas, en particular quienes navegan con teclado, lector de pantalla o teléfono.

## Restricciones
- Las de las entregas anteriores: Angular 20–22, WCAG 2.1 AA, CSP con nonce (sin estilos ni scripts en línea), sin CDN ni dependencias en tiempo de ejecución, temas guinda y verde solo con tokens semánticos.
- **Identidad**: Figma pide usar solo los vectores oficiales y «nunca redibujar, calcar o aproximar un logotipo, ni editar la ilustración». Esta entrega no descarga ni exporta archivos de Figma ni de internet (pregunta abierta 2).
- **Sin lógica de negocio ni de autenticación en el frontend**: Auth no valida credenciales ni llama a servicios; el menú de usuario emite «cerrar sesión» y el sistema decide qué hacer. La Sidebar recibe los destinos que el sistema le da (por ejemplo, según el rol); no decide permisos.
- El arreglo del menú de la documentación (rama `fix/menu-scroll`) toca la barra lateral propia del demo; esta entrega no la cambia ni la reemplaza por la Sidebar de UKI.

## Criterio de éxito
- Cada patrón se ve con sus tokens y medidas de Figma; las E2E comparan medidas y colores en guinda y en verde.
- La Sidebar se usa completa con teclado en sus tres formas (expandida, colapsada con paneles flotantes y teléfono con panel), marca la página actual con `aria-current="page"`, y solo la lista hace scroll.
- El menú de usuario sigue el patrón de botón de menú de WAI-ARIA (flechas, Esc, Tab) y devuelve el foco al botón.
- Las pantallas de ejemplo tienen sus regiones (`header`, `nav` con `aria-label`, `main`, `footer`) y axe no encuentra violaciones en las páginas nuevas, en los dos temas y en móvil.
- Ningún logotipo se dibuja sin nombre accesible, salvo que se marque como decorativo.

## Preguntas abiertas
1. **Derechos de uso de los logotipos y de La Patria.** ¿Puede un paquete npm interno del Banco incluir los logotipos de Banobras, Gobierno de México, Hacienda y FONADIN, y la ilustración La Patria? ¿Quién lo autoriza (Dirección de Imagen, Comunicación Social)?
2. **Archivos oficiales.** Figma prohíbe redibujar los logotipos y la ilustración es una imagen (no un vector). ¿Quién entrega los SVG oficiales (5 logotipos en sus versiones color y blanco) y el archivo de La Patria? Propuesta: diseño UKI o Pablo los exportan de Figma, o la Dirección de Imagen los entrega, y se integran sin cambios en cuanto estén.
3. **Contraste del elemento activo de la Sidebar.** El texto blanco sobre `sidebar/item-active` da 3.9:1 en guinda y 4.4:1 en verde, debajo del 4.5:1 de AA. Propuesta: usar `sidebar/mobile-active` (5.7:1 y 7.8:1) y pedir a UKI que ajuste el token.
4. **Medidas del marco.** Los tokens de la retícula dicen `admin/topbar` = 64 px y `admin/sidebar` = 64 px en tableta, pero los componentes miden 60 px (Header) y 56 px (Sidebar colapsada). Propuesta: seguir a los componentes y avisar a diseño.
