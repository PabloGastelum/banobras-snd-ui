# Spec: Marca y patrones de página de UKI, entrega 5 (desde intent/marca-y-patrones.md)

- Sistema: compartido · Slug: `marca-y-patrones` · Estado: approved
- Aprobado por: Pablo Gastelum · Fecha: 30/10/2026
- Fuente: UKI - Library v0.5.0, leída el 30/10/2026 desde el navegador integrado (árbol de capas completo de las 8 páginas y panel de Propiedades de cada parte). Nodos:
  - 🔰 Brand `572:6984`: GobMX `572:7004` (Default `572:7005`, White `572:7007`); Hacienda `604:175` (Default/White × Default/Small: `602:5201`, `604:169`, `604:171`, `604:173`); FONADIN `596:153` (Color/White × Default/Small: `594:4751`, `596:144`, `596:147`, `596:150`); Banobras `578:334` (Color/White × Default/Small: `578:335`, `578:337`, `578:339`, `578:341`); Banobras Icon `572:6999` (Color `572:7000`, White `572:7002`); La Patria `572:6987` (Default `572:6988`, Guinda `572:6990`, Verde `572:6992`; capa «Mujer» con relleno de imagen `image.png` de 800 × 991).
  - Header `335:493`: organismo `351:1465` (Desktop Closed `351:1466`, Desktop Open `351:1468`, Mobile Closed `351:1471`, Mobile Open `351:1473`); User button `353:128` (Default `353:92`, Hover `353:101`, Focus `353:110`, Open `353:119`); User menu `353:142`; Menu item `353:141` (Default `353:129`, Hover `353:133`, Focus `353:137`).
  - Footer `335:494`: componente `335:526` (Copyright `335:521`).
  - Sidebar `180:2372`: Item `186:135` (Default/Hover/Active/Focus × Expanded/Collapsed, `186:71`–`186:127`); Subitem `188:89` (Level 2 y 3 × Children × State, `188:83`–`421:494`); Flyout item `188:105`; Bottom nav item `188:114`; Header `188:124`; Topbar link `188:132`; Footer `188:146` (sin uso); Toggle `188:153`; organismos Desktop `189:290` (Expanded `189:144`, Collapsed `189:223`), acordeón de 3 niveles `190:193`, Collapsed + flyout `190:266` y de 3 niveles `421:4649`, Mobile bar `190:343` y Mobile drawer `190:369`.
  - Auth `263:913`: componente `278:2661` (Header `278:2626`, Body `278:2628`, Heading `278:2629`, Alert `281:2733`, Form `278:2632`, Footer `278:2637`).
  - Hero `276:2468`: componente `275:2316` (GobMX `278:2549`, La Patria `275:2314`, patrón `275:2460`).
  - En progreso: Page Header `641:5475` y App shell `641:5407`.
- Fuera de la fábrica: no aplican RN, TP ni `trazabilidad.csv`.

## Resumen
Se agregan a `@banobras/uki`:

- **Logotipos** (`uki-logo-banobras`, `uki-logo-banobras-icon`, `uki-logo-gobmx`, `uki-logo-hacienda`, `uki-logo-fonadin`): SVG en línea con `role="img"` y nombre accesible.
- **Header** (`header[ukiHeader]`) y **menú de usuario** (`uki-user-menu`).
- **Footer** (`footer[ukiFooter]`).
- **Sidebar** (`uki-sidebar`): expandida, colapsada con paneles flotantes y versión de teléfono (barra inferior y panel «Más» sobre la capa de modales de la entrega 4).
- **Auth** (`uki-auth`) y **Hero** (`uki-hero`): los dos bloques de la pantalla de acceso, solo maquetación.

Además, dos **plantillas documentadas** (código copiable en la documentación, sin componente exportado): pantalla de acceso y pantalla de administración.

## Lo que dice Figma
Textos de la documentación de Figma, resumidos:

- **Brand.** «Brand es la primera capa del sistema: Brand → Foundations → Components. Tiene lo que no son tokens (logotipos, símbolo e ilustración).» Tres reglas: **una sola fuente** («los logotipos viven solo en esta página; Header, Footer, Auth y Hero usan instancias»); **solo archivos oficiales** («usa los vectores oficiales; nunca redibujes, calques ni aproximes un logotipo, y nunca edites la ilustración de la Joven Mexicana»); **escala con su contenedor** (dos tamaños, Default de 60 px y Small de 32 px de alto, y escala proporcional entre 32 px de alto y 400 px de ancho).
  - **Banobras**: Theme Color o White × Size Default (284 × 60) o Small (≈152 × 32, el mínimo). Máximo: 400 px de ancho (≈84 de alto, Guía de Estilos Gráficos Web V2.1). Espacio libre x = ¼ del alto (16 px en Default, 8 px en Small). Color sobre superficies claras; White solo sobre la marca o superficies oscuras de la paleta institucional, «nunca sobre fotos». Descripción del componente: «`alt="Banobras"` cuando el logotipo enlaza a Inicio o informa; `alt=""` cuando es decorativo». **Banobras Icon**: el símbolo solo, Color o White.
  - **GobMX**: imagotipo horizontal, el Escudo Nacional siempre a la izquierda. Default (a color) o White (dos tintas, sobre superficies oscuras o bandas Guinda, Verde o Dorado). 188 × 60. Espacio libre: la letra «O» de México. Nunca a una tinta en medios digitales ni sobre colores fuera de la paleta. Mínimo y máximo: pendientes en la guía.
  - **Hacienda**: Default o White × Default (273 × 60) o Small (≈146 × 32). White: texto blanco y escudo dorado. Espacio libre pendiente (sección «Imagotipos» de la Guía de Identidad Gráfica, que no está en las páginas que tiene diseño).
  - **FONADIN**: Color o White × Default (262 × 60) o Small (≈140 × 32, el mínimo). Espacio libre x = ¼ del alto. Máximo pendiente.
  - **La Patria** (Joven Mexicana): Default, Guinda y Verde; es una imagen de 800 × 991.
- **Header.** «Barra superior de portales transaccionales y paneles de administración. Va junto a la Sidebar y mide 60 px de alto, lo mismo que la parte superior de la Sidebar.» Una por página, fija mientras el contenido hace scroll. A la derecha, el botón de usuario (Avatar sm + chevron); al hacer clic abre el menú con la persona que inició sesión (Avatar md, nombre y rol) y «Cerrar sesión», la última opción, con ícono de salida. Escritorio (768 px o más): relleno `spacing-24`, espacio `spacing-16`. Teléfono: relleno `spacing-8`, espacio `spacing-4`. Fondo `header/background`. Botón de usuario: «necesita `aria-label` (por ejemplo, “Menú de usuario”), `aria-haspopup="menu"` y `aria-expanded`». Menú: «se cierra con Esc, con un clic fuera o al elegir una opción».
- **Footer.** «Cierra cada página del portal con el aviso de derechos de BANOBRAS, en un estilo discreto.» Uno por página, mismo texto en todo el portal. Caption `text/secondary` sobre `background/page`, sin borde. «Conserva “© año BANOBRAS.” en SemiBold al inicio.» Ancho completo, 64 px de alto, relleno `spacing-24` arriba y abajo y `spacing-32` a los lados.
- **Sidebar.** «Navegación principal de portales transaccionales y paneles de administración», basada en la «Barra lateral» del SND. Úsala para 4 a 8 destinos de primer nivel entre los que la gente se mueve seguido; no en sitios públicos de pocas páginas ni en flujos lineales. Una por pantalla, en la columna `admin/sidebar`, «nunca hace scroll con el contenido».
  - **Escritorio, expandida** (1280 px o más): 256 px con etiquetas; los hijos se abren en acordeón debajo del padre, hasta 3 niveles (nivel 2 con sangría de 52 px y 40 px de alto; nivel 3 con 76 px y 36 px), con ícono de 16 px y línea guía. «Solo una rama abierta a la vez.» El botón del borde derecho la contrae.
  - **Tableta, colapsada** (768–1279 px, o cuando la persona la contrae): 56 px, solo íconos. Los hijos se abren en un panel flotante blanco (188 px, o 220 con 3 niveles; `radius-16`, `Elevation/overlay`); un nivel 2 con hijos se vuelve título de grupo.
  - **Teléfono** (< 768 px): barra inferior con hasta 4 destinos y esquinas superiores `radius-16`; el último, «Más», abre el panel completo. Panel: pantalla completa con botón de cerrar y secciones; «Esc o X lo cierran y el foco vuelve a “Más”».
  - Estados: Default (transparente), Hover (`sidebar/item-hover`, solo con puntero), Active («página actual; agrega `aria-current="page"`», `sidebar/item-active` y barra de 4 px `sidebar/indicator`) y Focus («foco de teclado; nunca lo quites», anillo de 2 px `sidebar/indicator`). Toggle: «requiere `aria-expanded` y `aria-controls`».
  - Temas: degradado `pguinda/900 → pguinda/600` (verde: `pverde/900 → pverde/600`), activo `400`.
- **Auth.** «El bloque de inicio de sesión del portal. Pide usuario y contraseña y muestra un aviso opcional cuando algo necesita atención. Combínalo con Hero para armar la pantalla completa.» Uno por pantalla, centrado en su columna. Escritorio: Hero + Auth (644 + 636 = 1280 px); en teléfono, solo Auth. «Usa el Alert solo para problemas reales, como una contraseña incorrecta o una cuenta bloqueada.» Seis partes: logotipo Banobras Color 284 × 60 centrado arriba; título Heading/H3 y nombre del sistema Body/Small; Alert Warning opcional; dos Text field requeridos (usuario y contraseña); Button Primary de ancho completo (400 px); y «© año BANOBRAS.» en Caption.
- **Hero.** «Panel de marca de la pantalla de acceso: logotipo del Gobierno de México e ilustración La Patria sobre el color de marca, junto a Auth.» Es decorativo y no tiene acciones; «en tableta y teléfono, quítalo y deja solo Auth». No edites el arte. Componente único de 644 × 832 sin propiedades; el fondo sigue el tema con `brand/primary`. Partes: fondo, patrón decorativo con degradado, ilustración (600 × 743, abajo a la derecha) y logotipo GobMX White 188 × 60 (arriba a la izquierda, a 40 px).
- **En progreso.** Page Header (Breadcrumbs, título Heading/H1 y descripción; 960 px, espacio `spacing-20`) y App shell (Sidebar | Header, contenido con Page Header, Footer).

## Decisiones de diseño
| # | Decisión | Motivo |
|---|---|---|
| D1 | **Un componente por logotipo**, con el nombre del componente de Figma: `uki-logo-banobras`, `uki-logo-banobras-icon`, `uki-logo-gobmx`, `uki-logo-hacienda` y `uki-logo-fonadin`. Entradas: `theme` (los nombres de Figma: `color`/`white` en Banobras y FONADIN, `default`/`white` en GobMX y Hacienda), `size` (`default` 60 px, `small` 32 px) y `decorative`. | Cada sistema usa uno o dos logotipos; con un componente por logotipo, el bundle solo trae los trazos que usa. Un `<uki-logo name="…">` con un `@switch` metería los cinco en cada aplicación. |
| D2 | **SVG en línea con `role="img"` y `aria-label`** («Banobras», «Gobierno de México», «Secretaría de Hacienda y Crédito Público», «FONADIN, Fondo Nacional de Infraestructura»; se puede cambiar con `label`). Con `decorative`, `aria-hidden="true"` y sin nombre. El alto se fija por `size` y el ancho sale del `viewBox`; con `--uki-logo-alto` se escala entre 32 px y el máximo. | Lo pide la entrega y cumple la descripción del logotipo en Figma (`alt` o vacío si es decorativo). En línea, el SVG no hace otra petición, respeta la CSP (sin `innerHTML`, los trazos van en la plantilla) y no depende de rutas de assets en cada sistema. |
| D3 | **Colores fijos en los logotipos.** Los trazos usan los colores oficiales (guinda `#6B0E35`, dorado `#B38E5D`, gris `#171B1C` en Figma) como atributos `fill` del SVG, no tokens. El tema verde no cambia los logotipos. | Son la identidad, no la interfaz: Figma prohíbe cambiar sus colores. Es la única excepción a la regla de solo tokens semánticos y se documenta. |
| D4 | **Trazos oficiales pendientes: marcador del mismo tamaño.** Mientras no se resuelvan las preguntas 1 y 2, cada componente dibuja un rectángulo con el borde punteado y el nombre de la institución, con el ancho y el alto del logotipo real (por ejemplo, 284 × 60) y el mismo nombre accesible. En desarrollo avisa una vez en la consola. Los trazos se integran sin cambiar la API. | Figma prohíbe redibujar o aproximar los logotipos, y esta entrega no exporta ni descarga archivos. Así la maquetación, las medidas, el espacio libre y la accesibilidad quedan listos y probados, y el cambio posterior solo toca los trazos. |
| D5 | **Header como componente sobre el `<header>` nativo** (`<header ukiHeader>`, como `button[ukiButton]`), con contenido proyectado alineado a la derecha. El menú de usuario es un componente aparte, `<uki-user-menu>`, que se pone dentro. | El elemento nativo da el landmark `banner` sin `role` extra, y el sistema decide qué más va en la barra (un selector de sistema, un aviso). El menú es la parte con comportamiento y se prueba solo. |
| D6 | **Menú de usuario con el patrón de botón de menú de WAI-ARIA** (`aria-haspopup="menu"`, `role="menu"` y `role="menuitem"`): Enter, Espacio o ↓ abren con el foco en la primera opción; ↑ abre en la última; ↑ ↓ Inicio y Fin se mueven; Esc cierra y devuelve el foco al botón; Tab cierra. El perfil (Avatar md, nombre y rol) es texto, no una opción. «Cerrar sesión» siempre va al final; otras opciones se proyectan con `ukiUserMenuItem`. El panel usa la capa superpuesta de la entrega 4, alineado a la derecha del botón. | Figma pide `aria-haspopup="menu"`. A diferencia del «…» de Breadcrumbs (enlaces de navegación, patrón de despliegue), aquí son acciones de la sesión. La capa evita que el menú se recorte o quede detrás de la Sidebar. |
| D7 | **«Cerrar sesión» solo emite** `(signOut)`. El componente no borra tokens, no navega y no llama a servicios. | Regla del programa: sin lógica de autenticación en el frontend compartido. |
| D8 | **Footer como componente sobre el `<footer>` nativo** (`<footer ukiFooter [year]>`). Dibuja «© {year} BANOBRAS.» en SemiBold y, después, el contenido proyectado; si no hay contenido, «Todos los derechos reservados». `year` es el año en curso por omisión. | El landmark `contentinfo` lo da el elemento nativo. La parte fija («© año BANOBRAS.») no la escribe cada sistema; el resto del texto sí puede cambiar. |
| D9 | **Sidebar con datos**: `[items]` es una lista de `{ label, icon?, link?, href?, children?, section?, bottomBar? }` y el componente dibuja la versión expandida, la colapsada o la de teléfono. | Es la misma idea que Breadcrumbs y Table en la entrega 4: hay que dibujar los mismos destinos de tres formas (acordeón, panel flotante, barra inferior y panel completo); con enlaces proyectados no se podría. Los sistemas ya arman sus menús como datos (por rol). |
| D10 | **Forma según el ancho**, con `matchMedia` (como la tabla): teléfono < 768 px, colapsada de 768 a 1279 px y expandida desde 1280 px. `[(collapsed)]` permite que la persona la contraiga o la expanda en tableta y escritorio; su elección gana hasta que cambie el rango de ancho. El sistema puede guardarla. En SSR se dibuja la expandida. | Figma define los tres rangos con los breakpoints de la colección Layout. Con `model`, el sistema decide si recuerda la preferencia, sin `localStorage` en la librería. |
| D11 | **La Sidebar llena el alto de su columna** (no usa `position: fixed`). Dentro, la barra de marca (Topbar link), la persona (Sidebar/Header) y el botón de contraer quedan fijos, y **solo la lista de navegación hace scroll**. La plantilla de pantalla de administración muestra cómo fijarla al alto de la ventana (`position: sticky; height: 100dvh`). | Figma: «nunca hace scroll con el contenido» y la retícula reserva su columna. Sin `fixed`, la Sidebar se puede mostrar dentro de la documentación y en cualquier maquetación del sistema. |
| D12 | **Acordeón expandido**: un padre con hijos es un `<button>` con `aria-expanded` y `aria-controls` (no navega); los destinos son `<a>` con `routerLink` y `aria-current="page"` en el activo (`routerLinkActive`). Abrir una rama cierra las demás del mismo nivel. La rama que contiene la página actual se abre sola. Máximo 3 niveles (un cuarto se ignora y avisa en desarrollo). | Figma: «solo una rama abierta a la vez», tres niveles como máximo y `aria-current` en el activo. Un padre que navega y además abre hijos confunde con teclado y lector. |
| D13 | **Colapsada con panel flotante**: el elemento con hijos abre el panel con clic, Enter, Espacio o →, y también al pasar el puntero (con 150 ms de espera para cerrar, para poder llegar al panel). El panel lleva el nombre del padre como título y sus destinos como enlaces; Esc o ← lo cierran y devuelven el foco. Los elementos sin hijos muestran su nombre en el tooltip interno de la entrega 4 y lo llevan en `aria-label`. Usa la capa superpuesta con un lado nuevo, `derecha`. | Figma solo dibuja el panel «al pasar el puntero»; WCAG 2.1.1 pide lo mismo con teclado y 1.4.13 que el contenido que aparece al pasar el puntero se pueda recorrer y cerrar. Sin etiqueta visible, el tooltip da el nombre a quien ve la pantalla. |
| D14 | **Teléfono: barra inferior y panel «Más» sobre la pila de modales.** La barra lleva los elementos con `bottomBar: true` (máximo 3; si ninguno lo tiene, los 3 primeros sin hijos) y «Más». El panel es un `<dialog>` de pantalla completa que entra en la pila de la entrega 4 (`UkiPilaModales`): lo de atrás queda inerte, el scroll se bloquea, los avisos de Toast siguen visibles, Esc o × lo cierran y el foco vuelve a «Más». Dentro, todos los destinos con el acordeón expandido, agrupados por `section`. | Es lo que dibuja Figma. La entrega pedía un panel lateral en móvil; Figma pide barra inferior más panel completo, y se sigue a Figma. Reutilizar la pila da la inercia y el manejo del foco ya probados en el Modal. |
| D15 | **Íconos de la Sidebar.** `icon` acepta un nombre del juego interno, que se amplía con los íconos «Linear» que usan Sidebar y Header (`house`, `file-earmark-text`, `journal-text`, `folder`, `people`, `gear`, `globe`, `box-arrow-right`, `three-dots`, `list`, `chevron-up`) o el nombre de una plantilla propia `<ng-template ukiSidebarIcon="…">`. Los íconos son decorativos. | UKI no tiene página de íconos ni componente Icon público. Así hay íconos listos para lo común y una salida para los propios, sin abrir todavía un componente de íconos público (pregunta abierta 7). |
| D16 | **Estado activo con `sidebar/mobile-active` en lugar de `sidebar/item-active`.** Texto blanco sobre `sidebar/item-active` da 3.9:1 (guinda) y 4.4:1 (verde); sobre `sidebar/mobile-active`, 5.7:1 y 7.8:1. La barra de 4 px `sidebar/indicator` se queda. | WCAG 1.4.3 pide 4.5:1 para texto de 14 px. Es un token semántico que ya existe para lo mismo en teléfono (pregunta abierta 3). |
| D17 | **Foco**: sobre la Sidebar y el Header (fondos oscuros) se usan los tokens de Figma (`sidebar/indicator` en Item, `button/focus-ring` en Subitem y botón de usuario; de 3.1:1 a 11.8:1). Sobre superficies blancas (opciones del menú de usuario, panel flotante) se usa `border/brand`, como en la entrega 4. | `button/focus-ring` sobre blanco da 2.5:1, menos del 3:1 de WCAG 1.4.11. Sobre fondo oscuro sí cumple. |
| D18 | **Auth como componente de maquetación con proyección**: `<uki-auth heading systemName>` dibuja el logotipo Banobras Color, el título como `<h1>` con estilo Heading/H3, el nombre del sistema, el contenido proyectado (Alert y el `<form>` del sistema con sus `uki-field` y su `ukiButton`) y el pie «© año BANOBRAS.». No tiene entradas de usuario ni salidas. | Lo común a los 5 sistemas es la maquetación (medidas, logotipo, títulos, pie); el formulario cambia (Llave MX, recuperar contraseña, captcha) y su envío es del sistema. Es el único título de la página, por eso `<h1>`. |
| D19 | **Variables ajenas a UKI en Auth.** El componente de Figma usa variables que no son de UKI (`color-background` #FCFDFF, `color-text` #0A1215, `Neutral/gray-500` #6B7580, `spacing-bg`, `spacing-xs`) y un pie en Bold 700. Se mapean a `background/surface`, `text/primary`, `text/secondary`, `spacing-16`, `spacing-8` y SemiBold, como pide su anatomía. | Regla de solo tokens semánticos; la anatomía de Auth ya dice «Caption, “© año BANOBRAS.” en SemiBold» (pregunta abierta 5). |
| D20 | **Hero como componente decorativo** `<uki-hero [illustrationSrc]>`: fondo `brand/primary`, patrón con degradado `brand/secondary → brand/primary` al 20 % hecho con CSS, logotipo GobMX White con nombre accesible y la ilustración como `<img alt="">` (decorativa) si se le da `illustrationSrc`. Debajo de 1280 px se oculta con `display: none`. | La Patria es una imagen y no se puede reconstruir ni exportar en esta entrega (preguntas 1 y 2); el sistema la sirve desde sus assets o la librería la incluye cuando esté autorizada. Figma: «decorativo, sin acciones»; el único dato que informa es el logotipo. Se oculta con CSS, como el enlace de teléfono de Breadcrumbs. |
| D21 | **Plantillas documentadas, no componentes**: «Pantalla de acceso» (Hero + Auth en una retícula de 644 + 636 px, centrada, que deja solo Auth debajo de 1280 px) y «Pantalla de administración» (Sidebar + Header + `<main>` con Breadcrumbs, `<h1>` y descripción + Footer). Se publican como ejemplos con «Ver código» y una muestra a pantalla completa. | Page Header y App shell están en progreso en Figma; un componente ahora congelaría una API que diseño todavía no cierra. La maquetación de página también depende del router y del layout de cada sistema. |
| D22 | **Medidas del marco: las de los componentes.** Header de 60 px y Sidebar colapsada de 56 px, aunque `admin/topbar` y `admin/sidebar` (tableta) digan 64 px. | La descripción del Header dice «60 px, lo mismo que la parte superior de la Sidebar», y el Topbar link mide 60. Se avisa a diseño (pregunta abierta 4). |

## Requisitos funcionales

### Logotipos (`uki-logo-*`)
| ID | Requisito | Figma |
|---|---|---|
| RF-1 | Cinco componentes (D1): `uki-logo-banobras` (`theme`: `color` · `white`; `size`: `default` 284 × 60 · `small` ≈152 × 32), `uki-logo-banobras-icon` (`theme`: `color` · `white`), `uki-logo-gobmx` (`theme`: `default` · `white`; 188 × 60), `uki-logo-hacienda` (`theme`: `default` · `white`; 273 × 60 · ≈146 × 32) y `uki-logo-fonadin` (`theme`: `color` · `white`; 262 × 60 · ≈140 × 32). | Componentes `578:334`, `572:6999`, `572:7004`, `604:175`, `596:153` |
| RF-2 | Nombre accesible según D2. Con `decorative`, el SVG lleva `aria-hidden="true"` y no tiene `role` ni nombre. | Descripción de Banobras (`alt`) |
| RF-3 | Espacio libre: el componente reserva alrededor del logotipo un margen de ¼ del alto (16 px en Default, 8 px en Small) con `margin`, apagable con `[clearSpace]="false"` cuando el contenedor ya lo da (por ejemplo, la barra de 60 px). GobMX y Hacienda usan el mismo margen hasta que diseño confirme su regla. | «Clear space» de cada logotipo |
| RF-4 | Escala: `--uki-logo-alto` cambia el alto entre 32 px y el que da 400 px de ancho; el ancho sigue la proporción del `viewBox`. Más chico de 32 px no se permite (se queda en 32). | «Scales with its container» |
| RF-5 | Mientras falten los trazos oficiales, marcador según D4. | — |

### Header (`header[ukiHeader]`) y menú de usuario (`uki-user-menu`)
| ID | Requisito | Figma |
|---|---|---|
| RF-6 | `<header ukiHeader>`: 60 px de alto, fondo `header/background`, contenido alineado a la derecha, relleno `spacing-24` a los lados y espacio `spacing-16` desde 768 px; debajo, relleno `spacing-8` y espacio `spacing-4`. Ancho completo de su contenedor. | Header `351:1466`, `351:1471`; Devices |
| RF-7 | `<uki-user-menu name userRole [avatarSrc] (signOut)>`: botón con Avatar sm (32 px, con punto de estado) y chevron de 16 px; alto 40 px, `radius-8`, relleno `spacing-4` arriba, abajo e izquierda y `spacing-8` a la derecha, espacio `spacing-8`. Hover y abierto: fondo `sidebar/item-hover`. Foco: borde de 2 px `button/focus-ring` (D17). Abierto, el chevron apunta hacia arriba. nombre accesible «Menú de usuario» en un texto oculto a la vista (cambiable con `ariaLabel`; desviación 3), `aria-haspopup="menu"`, `aria-expanded` y `aria-controls`. | User button `353:92`–`353:119` |
| RF-8 | Menú: 280 px de ancho, debajo del botón y alineado a su borde derecho, a `spacing-4`. Fondo `background/surface`, borde 1 px `border/low-contrast`, `radius-8`, `Elevation/overlay`, relleno y espacio `spacing-8`. Arriba, el perfil (Avatar md de 40 px, nombre en Body/Small SemiBold `text/primary` y rol en Body/Small `text/secondary`), un separador (`border/low-contrast`) y las opciones. | User menu `353:142` |
| RF-9 | Opción: 44 px de alto, `radius-4`, relleno `spacing-16` a los lados, espacio `spacing-12`, ícono de 20 px y texto Body/Small `text/primary`. Hover: `background/page`. Foco: borde de 2 px `border/brand` (D17). «Cerrar sesión» con el ícono `box-arrow-right` siempre al final; antes, las opciones proyectadas con `ukiUserMenuItem` (en `<button>` o `<a>`). | Menu item `353:129`–`353:137` |
| RF-10 | Teclado y cierre según D6. Elegir una opción cierra el menú; «Cerrar sesión» emite `(signOut)` (D7). Un clic fuera cierra sin mover el foco. | Descripción del User menu |
| RF-11 | Entrada del menú con opacidad en 150 ms y `ease-out`; sin animación con `prefers-reduced-motion: reduce`. | Interacción del prototipo |

### Footer (`footer[ukiFooter]`)
| ID | Requisito | Figma |
|---|---|---|
| RF-12 | `<footer ukiFooter [year]>`: ancho completo, mínimo 64 px de alto, fondo `background/page`, sin borde, relleno `spacing-24` arriba y abajo y `spacing-32` a los lados (en < 768 px, `spacing-16` a los lados). Texto en Caption (12/16) `text/secondary`: «© {year} BANOBRAS.» en SemiBold y el contenido según D8. | Footer `335:526`, tabla de tokens |

### Sidebar (`uki-sidebar`)
| ID | Requisito | Figma |
|---|---|---|
| RF-13 | Estructura: `<nav>` con `aria-label` (por omisión «Menú principal») que contiene la barra de marca, la persona (opcional), la lista (`<ul>` anidadas) y el botón de contraer. El contenedor ocupa el alto de su columna; fondo con degradado lineal `sidebar/background → sidebar/background-end` y `Elevation/raised`. Ancho 256 px expandida y 56 px colapsada. | Sidebar `189:144`, `189:223` |
| RF-14 | Barra de marca (Topbar link): 60 px, fondo `sidebar/topbar`, relleno `spacing-12` arriba y abajo y `spacing-16` a los lados; logotipo Banobras White Small (152 × 32) expandida y Banobras Icon colapsada. Con `topbarLink` (`{ label, href }`) toda la barra es un enlace con ese nombre accesible («Ir a Llave MX»); sin él, solo el logotipo con su nombre. | Topbar link `188:125`, `188:129` |
| RF-15 | Persona (opcional, con `user`: `{ name, role, avatarSrc? }`): 72 px, relleno `spacing-16` a los lados, espacio `spacing-12`, Avatar sm, nombre en Label SemiBold y rol en Caption, ambos `text/inverse`; borde inferior 1 px `text/inverse` al 24 %. Colapsada, solo el Avatar (con el nombre como nombre accesible). | Sidebar/Header `188:115`, `188:121` |
| RF-16 | Elemento (nivel 1): 56 px, relleno `spacing-16` a los lados, espacio `spacing-12`, ícono de 24 px y etiqueta Label Medium `text/inverse`; si tiene hijos, chevron (abajo cerrado, arriba abierto). Estados según la tabla de tokens. Colapsado: 56 × 56, solo el ícono centrado. | Item `186:71`–`186:127` |
| RF-17 | Subelemento: nivel 2 de 40 px con sangría de 52 px; nivel 3 de 36 px con sangría de 76 px; relleno `spacing-16` a la derecha, espacio 8 px, ícono opcional de 16 px, texto Body/Small `text/inverse` (SemiBold en el activo) y línea guía de 1 px `text/inverse` que lo une al padre. Solo el nivel 2 puede tener hijos. | Subitem `188:83`–`421:494` |
| RF-18 | Acordeón según D12. Los hijos de una rama abierta se muestran debajo del padre; las ramas cerradas no se dibujan (no quedan en el orden de tabulación). | Acordeón de 3 niveles `190:193` |
| RF-19 | Colapsada y panel flotante según D13. Panel: 188 px de ancho (220 px si tiene un nivel 3), `radius-16`, `background/surface`, `Elevation/overlay`, relleno `spacing-8`, espacio `spacing-4`, a `spacing-8` a la derecha de la barra. Título: nombre del padre en Caption `text/secondary`. Opción (Flyout item): 32 px, `radius-8`, relleno `spacing-8`, espacio `spacing-8`, ícono y texto Caption `text/primary`; Hover `background/page`; Active `sidebar/mobile-active` con texto `text/inverse` (D16); foco `border/brand` (D17). Grupo (nivel 2 con hijos): título en Caption SemiBold con ícono y sus hijos debajo con línea guía. | Flyout `190:319`, `421:4651`; Flyout item `188:90`–`188:100` |
| RF-20 | Botón de contraer (Toggle): 24 × 48 px pegado al borde derecho, fondo `sidebar/background`, `radius-8` en las esquinas derechas, ícono chevron. `aria-expanded` (expandida = `true`), `aria-controls` a la lista y `aria-label` «Contraer menú» o «Expandir menú». No se muestra en teléfono. | Toggle `188:147`, `188:150` |
| RF-21 | Scroll según D11: la lista tiene `overflow-y: auto` y el resto no se mueve. Al cambiar de página, el elemento activo queda a la vista. | — |
| RF-22 | Teléfono según D14. Barra inferior: ancho completo, 76 px, esquinas superiores `radius-16`, fondo `sidebar/background`, `Elevation/floating`, relleno `spacing-8`, distribuida con `space-between`, fija abajo con `position: fixed` y el área segura (`env(safe-area-inset-bottom)`). Destino: 74 × 60 px (área táctil mínima), `radius-8`, ícono de 24 px y etiqueta de una palabra en Caption `text/inverse`; activo con `sidebar/mobile-active` y `aria-current="page"`. «Más» es un `<button>` con `aria-haspopup="dialog"` y `aria-expanded`. | Mobile bar `190:343`; Bottom nav item `188:106`, `188:110` |
| RF-23 | Panel «Más»: `<dialog>` a pantalla completa con el degradado de la Sidebar. Arriba, 56 px con fondo `sidebar/topbar`, relleno 16 px, título «Menú» (Label SemiBold, nombre accesible del diálogo) y botón × «Cerrar menú». Secciones con título en Caption `text/inverse` al 72 % y en mayúsculas (relleno 24/0/8/16) y elementos de 56 px a lo ancho; divisor entre secciones. Elegir un destino cierra el panel. | Mobile drawer `190:369` |
| RF-24 | Más de 8 destinos de primer nivel o más de 3 niveles: funciona, pero avisa en desarrollo (Figma: «4 a 8 destinos», «tres niveles como máximo»). | Overview; Subitem |

### Auth (`uki-auth`) y Hero (`uki-hero`)
| ID | Requisito | Figma |
|---|---|---|
| RF-25 | `<uki-auth heading systemName>` según D18 y D19: 636 px de ancho como máximo y alto mínimo de 832 px (o el de la ventana), fondo `background/surface`, relleno `spacing-80` arriba y abajo y `spacing-40` a los lados, columnas con `space-between` (logotipo arriba, pie abajo). Contenido central de 400 px de ancho como máximo con espacio `spacing-40`. Encabezado: título Heading/H3 `text/primary` y nombre del sistema Body/Small `text/secondary`, con `spacing-8` entre ellos. | Auth `278:2661`, Body `278:2628`, Heading `278:2629` |
| RF-26 | Teléfono (< 768 px): ancho completo, relleno `spacing-24` arriba y abajo y `spacing-16` a los lados, logotipo Banobras Small, título con la escala tipográfica de móvil. | Figma no lo dibuja; el título usa el modo tipográfico «Mobile» |
| RF-27 | El contenido proyectado conserva su semántica: el `<form>` y sus campos son del sistema. La documentación muestra el formulario de Figma: «Usuario» y «Contraseña» requeridos (`autocomplete="username"` y `"current-password"`), Button Primary «Iniciar sesión» a lo ancho y el Alert Warning opcional arriba del formulario. | Form `278:2632`; textos del componente |
| RF-28 | `<uki-hero [illustrationSrc]>` según D20: 644 px de ancho, alto de su contenedor, fondo `brand/primary`, patrón con degradado `brand/secondary → brand/primary` al 20 %, logotipo GobMX White 188 × 60 a 40 px de arriba y de la izquierda, e ilustración de 600 × 743 abajo a la derecha. Oculto con `display: none` debajo de 1280 px. | Hero `275:2316` |

### Sidebar: tokens por parte y estado
| Parte · estado | Fondo | Texto e ícono | Indicador o borde |
|---|---|---|---|
| Contenedor | degradado `sidebar/background → sidebar/background-end` | — | `Elevation/raised` |
| Barra de marca | `sidebar/topbar` | logotipo White | — |
| Persona | transparente | `text/inverse` | inferior 1 px `text/inverse` 24 % |
| Elemento · Default | transparente | `text/inverse` | — |
| Elemento · Hover (puntero) | `sidebar/item-hover` | `text/inverse` | — |
| Elemento · Active | `sidebar/mobile-active` (D16; Figma: `sidebar/item-active`) | `text/inverse` | barra izquierda 4 px `sidebar/indicator` |
| Elemento · Focus | transparente | `text/inverse` | anillo interior 2 px `sidebar/indicator` |
| Subelemento · Hover / Active | `sidebar/item-hover` / `sidebar/mobile-active` | `text/inverse` (Active en SemiBold) | — |
| Subelemento · Focus | transparente | `text/inverse` | 2 px `button/focus-ring` |
| Panel flotante | `background/surface` | título `text/secondary`, opciones `text/primary` | `Elevation/overlay` |
| Opción del panel · Hover / Active / Focus | `background/page` / `sidebar/mobile-active` / — | `text/primary` / `text/inverse` / `text/primary` | — / — / 2 px `border/brand` |
| Botón de contraer | `sidebar/background` | `text/inverse` | foco 2 px `sidebar/indicator` |
| Barra inferior | `sidebar/background` | `text/inverse` | `Elevation/floating` |
| Destino inferior · Active | `sidebar/mobile-active` | `text/inverse` | — |
| Panel «Más» · encabezado | `sidebar/topbar` | `text/inverse` | — |

Valores de referencia (guinda / verde): `sidebar/background` #611232 / #002F2A, `sidebar/background-end` #9B2247 / #004D40, `sidebar/topbar` y `sidebar/item-hover` #8E1D3F / #004339, `sidebar/item-active` #BA6783 / #51807A, `sidebar/mobile-active` #A84565 / #335955, `sidebar/indicator` #F3E4E9 / #E0E9E8. Contrastes con `text/inverse`: 12.8 / 14.6 (fondo), 7.7 / 9.8 (fin del degradado), 8.8 / 11.3 (hover), 3.9 / 4.4 (`item-active`, no cumple) y 5.7 / 7.8 (`mobile-active`).

### Header y menú de usuario: tokens
| Parte · estado | Fondo | Texto | Borde |
|---|---|---|---|
| Barra | `header/background` | — | — |
| Botón de usuario · Hover / Open | `sidebar/item-hover` | — | — |
| Botón de usuario · Focus | — | — | 2 px `button/focus-ring` (5.1:1 sobre el fondo) |
| Menú | `background/surface` | — | 1 px `border/low-contrast`, `radius-8`, `Elevation/overlay` |
| Perfil | — | nombre `text/primary`, rol `text/secondary` | separador `border/low-contrast` |
| Opción · Hover / Focus | `background/page` / — | `text/primary` | — / 2 px `border/brand` |

### Footer, Auth y Hero: tokens
| Parte | Token |
|---|---|
| Footer · fondo y texto | `background/page` · `text/secondary` (9.4:1) · Caption, «© año BANOBRAS.» en `font/weight/semibold` |
| Auth · fondo, título y nombre del sistema | `background/surface` · `text/primary` Heading/H3 · `text/secondary` Body/Small |
| Auth · aviso, campos y botón | los de Alert Warning, Text field y Button Primary (entregas 1 a 3) |
| Hero · fondo y patrón | `brand/primary` · degradado `brand/secondary → brand/primary` al 20 % |

## Requisitos no funcionales
- **Accesibilidad:** WCAG 2.1 AA y axe sin violaciones en las páginas nuevas, en los dos temas y en móvil. Regiones: `header` (banner), `nav` con `aria-label` (Sidebar, y la barra inferior con el mismo nombre), `main` y `footer` (contentinfo) en las plantillas. Todo se usa con teclado: Tab, Enter y Espacio en la Sidebar; flechas en el menú de usuario; Esc en el menú, el panel flotante y el panel «Más». Áreas táctiles de 44 px o más en teléfono (destinos de 74 × 60).
- **Lectores de pantalla:** la página actual se anuncia con `aria-current="page"`; las ramas, con `aria-expanded`; los logotipos, por su nombre; el Hero no se anuncia salvo su logotipo.
- **Compatibilidad, CSP y tamaño:** igual que las entregas anteriores. Sin `innerHTML` (los trazos van en las plantillas), sin estilos en línea (coordenadas de la capa con CSSOM). En SSR, la Sidebar dibuja la versión expandida y el menú y los paneles no se abren.
- **Movimiento:** acordeón, panel flotante y menú con transiciones de 150 a 200 ms; ninguna con `prefers-reduced-motion: reduce`.
- **Dependencias:** ninguna nueva. Se usan Avatar, Alert, la capa superpuesta, el tooltip interno y la pila de modales de entregas anteriores.

## Diseño
### API pública
```html
<!-- Logotipos -->
<uki-logo-banobras />                                   <!-- Color, 284 × 60, «Banobras» -->
<uki-logo-banobras theme="white" size="small" />
<uki-logo-gobmx theme="white" decorative />

<!-- Pantalla de administración (plantilla) -->
<div class="app">
  <uki-sidebar class="app__lateral" [items]="menu" [user]="persona" [topbarLink]="{ label: 'Ir a Llave MX', href: llaveMx }"
               [(collapsed)]="contraida" />
  <div class="app__contenido">
    <header ukiHeader>
      <uki-user-menu [name]="persona.name" [userRole]="persona.role" [avatarSrc]="persona.avatarSrc" (signOut)="salir()">
        <a ukiUserMenuItem routerLink="/perfil">Mi perfil</a>
      </uki-user-menu>
    </header>
    <main id="contenido">
      <uki-breadcrumbs [items]="ruta" />
      <h1 class="uki-heading-1">Solicitudes</h1>
      …
    </main>
    <footer ukiFooter />
  </div>
</div>

<!-- Pantalla de acceso (plantilla) -->
<div class="acceso">
  <uki-hero illustrationSrc="/assets/la-patria.webp" />
  <main>
    <uki-auth heading="Inicia sesión en tu cuenta"
              systemName="Sistema de Administración y Actualización del Inventario de Procesos de BANOBRAS">
      @if (error()) { <uki-alert type="warning">{{ error() }}</uki-alert> }
      <form [formGroup]="acceso" (ngSubmit)="entrar()">
        <uki-field label="Usuario" required><input ukiInput autocomplete="username" formControlName="usuario" /></uki-field>
        <uki-field label="Contraseña" required><input ukiInput type="password" autocomplete="current-password" formControlName="contrasena" /></uki-field>
        <button ukiButton type="submit" [loading]="entrando()">Iniciar sesión</button>
      </form>
    </uki-auth>
  </main>
</div>
```

```ts
protected readonly menu: UkiSidebarItem[] = [
  { label: 'Inicio', icon: 'house', link: '/', bottomBar: true },
  { label: 'Mis trámites', icon: 'file-earmark-text', link: '/tramites', bottomBar: true },
  { label: 'Administración', icon: 'gear', children: [
    { label: 'Usuarios', link: '/admin/usuarios' },
    { label: 'Catálogos', icon: 'journal-text', children: [
      { label: 'Macroprocesos', link: '/admin/catalogos/macroprocesos' },
      { label: 'Procesos', link: '/admin/catalogos/procesos' },
    ] },
    { label: 'Bitácora', link: '/admin/bitacora' },
  ] },
];
```

Exportaciones nuevas: `UkiLogoBanobras`, `UkiLogoBanobrasIcon`, `UkiLogoGobmx`, `UkiLogoHacienda`, `UkiLogoFonadin`, `UkiHeader`, `UkiUserMenu`, `UkiUserMenuItem`, `UkiFooter`, `UkiSidebar`, `UkiSidebarIcon`, `UkiAuth`, `UkiHero`, y los tipos `UkiLogoSize`, `UkiSidebarItem`, `UkiSidebarUser`, `UkiSidebarLink`, `UkiSidebarIconName`. Siguen internos: la capa (con el lado nuevo `derecha` y la alineación `fin`), el tooltip, la pila de modales y `uki-icono`.

### Documentación
Dos grupos nuevos en el menú y dos plantillas:

- **Marca** (antes de Fundamentos), página **Logotipos**: Overview (las tres reglas de Figma), una sección por logotipo (Componente, Tamaños, Espacio libre y Uso con sus versiones color y blanco sobre fondo claro y oscuro), La Patria (con la nota de D20) y Accesibilidad (nombre o decorativo). Mientras falten los trazos, un aviso en la página.
- **Patrones** (después de Componentes), en orden alfabético: **Auth**, **Footer**, **Header**, **Hero** y **Sidebar**, con la distribución de su página de Figma: Overview, Moléculas, Organismos (Header y Sidebar), Anatomía, Estados (Sidebar), Dispositivos o Comportamiento responsivo, Temas y Tokens.
- **Plantillas** (dentro de Patrones): **Pantalla de acceso** y **Pantalla de administración**, con «Ver código», «Copiar» y una muestra a pantalla completa en `muestra/acceso` y `muestra/administracion` (rutas sin marco, como `muestra/grupo-botones`), también dentro de un `iframe` de 375 px para ver la versión de teléfono.
- Inicio: las tarjetas de los grupos nuevos.

## Áreas de preocupación
| Punto | Dueño | Estado |
|---|---|---|
| Sin los trazos oficiales, las páginas de Logotipos, Auth, Hero, Header y Sidebar muestran marcadores; la revisión visual contra Figma de esas partes queda pendiente. | Pablo / Dirección de Imagen | Propuesto |
| La Sidebar en teléfono usa `position: fixed` para la barra inferior: el sistema tiene que dejar espacio abajo (76 px más el área segura); la plantilla lo muestra con una variable `--uki-sidebar-barra-inferior`. | Pablo | Propuesto |
| Un tema puesto en un contenedor no llega al panel «Más» si el sistema lo pone fuera de ese contenedor; el panel se dibuja dentro del componente, así que hereda el tema del contenedor (a diferencia de los diálogos del servicio). | Pablo | Aceptado |
| El panel flotante al pasar el puntero puede abrirse sin querer al mover el ratón por la barra colapsada: se abre a los 100 ms de estar encima y se cierra a los 150 ms de salir. | Diseño UKI | Propuesto |
| Las variables ajenas a UKI en Auth y el año 2027 del ejemplo se reportan a diseño. | Diseño UKI | Propuesto |

## Preguntas abiertas
1. **Derechos de uso** de los logotipos (Banobras, Gobierno de México, Hacienda, FONADIN) y de la ilustración La Patria dentro de `@banobras/uki` (intent, pregunta 1). No bloquea el código (D4), sí la publicación.
2. **Archivos oficiales** (intent, pregunta 2): los SVG de los 5 logotipos en sus dos versiones y el archivo de La Patria. Propuesta: diseño UKI (o Pablo, con permiso de exportar) los exporta de Figma o la Dirección de Imagen los entrega; se integran tal cual en `projects/uki/src/lib/marca/` sin cambiar la API. La Patria se incluiría como asset del paquete (`@banobras/uki/assets/`), como las fuentes.
3. **Contraste del activo** (D16): ¿UKI acepta `sidebar/mobile-active` para el elemento activo, o prefiere oscurecer `sidebar/item-active`?
4. **Medidas del marco** (D22): ¿se corrigen `admin/topbar` (64 → 60) y `admin/sidebar` en tableta (64 → 56), o se cambian los componentes?
5. **Auth** (D19): confirmar el mapeo de las variables ajenas, el peso del pie (SemiBold, como la anatomía) y el texto del aviso (el componente dice «Here you’ll be notified.»).
6. **Patrones decorativos** de Auth (vector con degradado `#FFFFFF → #ECECEF`) y de Hero: no son logotipos. Propuesta: el de Hero con un degradado de CSS (D20) y el de Auth se omite hasta tener el SVG. ¿Se aceptan, o diseño entrega los vectores?
7. **Íconos** (D15): ¿basta el juego incorporado más plantillas propias, o UKI planea un componente Icon público?
8. **Barra de marca de la Sidebar**: Figma la nombra «Ir a Llave MX» y dibuja el logotipo de Banobras. ¿Es un enlace a Llave MX en todos los sistemas, o solo el logotipo? Propuesta: enlace opcional (`topbarLink`).
9. **Teléfono** (D14): la entrega pedía un panel lateral; Figma dibuja barra inferior más panel completo. Propuesta: seguir a Figma.
10. **Page Header y App shell** (D21): ¿se quedan como plantillas hasta que salgan de «WIP» en Figma?

## Fuera de alcance
- Reemplazar la barra lateral de la documentación por `uki-sidebar` (la rama `fix/menu-scroll` la está arreglando).
- Componente Icon público, Page Header y App shell como componentes.
- Footer de la Sidebar («Navegación del sitio»): Figma lo guarda «para uso futuro».
- Lógica de sesión, permisos por rol, recuperación de contraseña, Llave MX y captcha.
- Logotipos de otras Secretarías y el imagotipo GobMX con la Joven Mexicana («lo entrega la Dirección de Imagen; no lo construyas»).
