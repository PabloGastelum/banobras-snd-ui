# Plan: Marca y patrones de página de UKI, entrega 5 (desde specs/marca-y-patrones.md)

- Sistema: compartido · Slug: `marca-y-patrones` · Riesgo: alto en Sidebar, medio en menú de usuario y bajo en logotipos, Header, Footer, Auth y Hero
- Aprobado por: Pablo Gastelum · Fecha: 30/10/2026
- Repositorio: `PabloGastelum/banobras-snd-ui` · Rama: `feat/marca-y-patrones`, creada desde `main` (entregas 1 a 4 fusionadas) en la copia `~/Work/Personal/banobras-snd-ui-entrega-5` · Integra por PR a `main` con CI y vista previa de Vercel.

## Archivos que cambian
- `projects/uki/src/lib/iconos/icono.ts` (modificado): íconos de D15 (`file-earmark-text`, `journal-text`, `folder`, `people`, `gear`, `globe`, `box-arrow-right`, `three-dots`, `list`, `chevron-up`; `house` ya existe).
- `projects/uki/src/lib/capa/capa.ts` y `capa.spec.ts` (modificados): lado `derecha` (panel flotante de la Sidebar) y alineación `fin` (menú de usuario).
- `projects/uki/src/lib/marca/` (nuevo): `logo.ts` (base común: tamaño, espacio libre, nombre accesible, marcador de D4), `logo-banobras.ts`, `logo-banobras-icon.ts`, `logo-gobmx.ts`, `logo-hacienda.ts`, `logo-fonadin.ts`, `logo.css`, `logo.spec.ts`.
- `projects/uki/src/lib/header/` (nuevo): `header.ts`, `user-menu.ts`, `header.css`, `header.spec.ts`, `user-menu.spec.ts`.
- `projects/uki/src/lib/footer/` (nuevo): `footer.ts`, `footer.css`, `footer.spec.ts`.
- `projects/uki/src/lib/sidebar/` (nuevo): `sidebar.ts` (estado, forma según el ancho, rama abierta), `sidebar-lista.ts` (acordeón, compartido con el panel «Más»), `sidebar-flotante.ts` (panel de la versión colapsada), `sidebar-movil.ts` (barra inferior y panel «Más» sobre `UkiPilaModales`), `sidebar.directivas.ts` (`ukiSidebarIcon`), `sidebar.css`, `sidebar.spec.ts`.
- `projects/uki/src/lib/auth/` (nuevo): `auth.ts`, `hero.ts`, `auth.css`, `auth.spec.ts`.
- `projects/uki/src/public-api.ts` (modificado): exportaciones nuevas.
- `projects/demo/src/app/paginas/` (nuevos): `logotipos.ts`, `auth.ts`, `footer.ts`, `header.ts`, `hero.ts`, `sidebar.ts`, `plantilla-acceso.ts`, `plantilla-administracion.ts`; `projects/demo/src/app/muestras/acceso.ts` y `administracion.ts` (pantalla completa, sin marco).
- `projects/demo/src/app/app.ts`, `app.routes.ts` y `paginas/inicio.ts` (modificados): grupos «Marca» y «Patrones», rutas y tarjetas. En `app.ts` solo se toca la constante `GRUPOS` (y `INICIO` si hace falta), **no** los estilos de `.lateral` ni `.marca`, que cambia la rama `fix/menu-scroll`.
- `e2e/marca-y-patrones.spec.ts` (nuevo) y `e2e/accesibilidad.spec.ts`, `e2e/maquetacion.spec.ts`, `e2e/temas.spec.ts`, `e2e/menu.spec.ts` (modificados): rutas nuevas y el grupo nuevo del menú.
- `README.md` (modificado): «Qué incluye», «Uso», estructura y pendientes.
- `docs/sdlc/…/marca-y-patrones.md`: esta intención, especificación y plan.

## Orden de trabajo
1. **Íconos y capa.** Agregar los íconos. Pruebas en rojo de la capa: lado `derecha` (el panel a la derecha del ancla, volteado a la izquierda si no cabe, y alineado arriba con el ancla) y alineación `fin` (borde derecho del panel con el del ancla). Después la implementación.
2. **Logotipos.** Pruebas en rojo: `role="img"` y `aria-label` por omisión y con `label`; `decorative` con `aria-hidden` y sin nombre; alto de 60 y 32 px y ancho según la proporción; espacio libre de ¼ del alto y `[clearSpace]="false"`; colores fijos en ambos temas; marcador con el nombre mientras no haya trazos y aviso único en desarrollo. Después la base común y los cinco componentes.
3. **Footer.** Pruebas en rojo: `<footer>` nativo (`contentinfo`), «© {año} BANOBRAS.» en `<strong>` con SemiBold, año en curso por omisión y con `year`, texto por omisión y contenido proyectado. Después la implementación.
4. **Header y menú de usuario.** Pruebas en rojo: `<header>` nativo; botón con Avatar, `aria-label`, `aria-haspopup="menu"`, `aria-expanded` y `aria-controls`; el menú abre con clic, Enter, Espacio, ↓ (primera opción) y ↑ (última); ↑ ↓ Inicio Fin; Esc cierra y devuelve el foco; Tab cierra; clic fuera; opciones proyectadas antes de «Cerrar sesión»; `(signOut)` y cierre al elegir; el perfil no es opción. Después la implementación.
5. **Sidebar.** Es el paso de mayor riesgo; se divide, cada parte con sus pruebas en rojo antes de implementarla:
   1. Estructura y datos: `nav` con `aria-label`, barra de marca (con y sin `topbarLink`), persona, lista con `routerLink`, `href` e íconos (incorporados y `ukiSidebarIcon`), `aria-current="page"` y estilo activo con `routerLinkActive`.
   2. Acordeón: padres como `<button>` con `aria-expanded`/`aria-controls`, una rama abierta por nivel, rama de la página actual abierta sola, tercer nivel, aviso de un cuarto nivel.
   3. Forma según el ancho con `matchMedia` falso (ayudas de `pruebas/jsdom.ts`), `[(collapsed)]` y botón de contraer.
   4. Colapsada: panel flotante con clic, teclado (Enter, Espacio, →, Esc, ←) y puntero (temporizadores falsos activados después de montar), grupos de nivel 3, tooltip de los elementos sin hijos.
   5. Teléfono: barra inferior (`bottomBar`, máximo 3, respaldo con los 3 primeros), «Más» con `aria-expanded`, panel con el polyfill de `<dialog>`, entrada y salida de la pila de modales, Esc y × con el foco de vuelta en «Más», secciones, cierre al elegir un destino.
   6. Scroll: solo la lista tiene `overflow-y: auto`; el activo se lleva a la vista al cambiar de página.
6. **Auth y Hero.** Pruebas en rojo: `<h1>` con `heading`, nombre del sistema, logotipo Banobras con nombre, contenido proyectado en su lugar, pie con el año; Hero con el logotipo GobMX nombrado, ilustración con `alt=""` solo si hay `illustrationSrc`, y sin contenido enfocable. Después la implementación.
7. **Documentación.** Páginas de Logotipos, Auth, Footer, Header, Hero y Sidebar con la distribución de Figma (ver «Documentación» en la especificación), anatomía (`demo-anatomia`), tablas de tokens (`demo-token`) y ejemplos copiables (`demo-ejemplo`). Plantillas de acceso y de administración con sus muestras a pantalla completa y en `iframe` de 375 px. Rutas, grupos del menú e inicio.
8. **E2E.** `e2e/marca-y-patrones.spec.ts`:
   - Medidas y colores contra Figma en guinda y verde: logotipos de 60 y 32 px; Header de 60 px y su fondo; menú de 280 px; Footer de 64 px con `background/page` y `text/secondary`; Sidebar de 256 y 56 px, elementos de 56 px, subelementos de 40 y 36 px con sus sangrías, barra de marca de 60 px, degradado, hover, activo e indicador de 4 px; panel flotante de 188 y 220 px; barra inferior de 76 px y destinos de 74 × 60 a 375 px; Auth de 636 px con contenido de 400 px; Hero de 644 px visible a 1280 y oculto a 1024.
   - Teclado: menú de usuario completo; Sidebar expandida (Tab, Enter, Espacio en el acordeón), colapsada (panel flotante con teclado y Esc) y en teléfono («Más», trampa de foco del panel, Esc y foco de vuelta).
   - Scroll: con una lista larga, la barra de marca y el botón de contraer no se mueven al desplazar la lista, y la página no se desplaza con ella.
   - Regiones: en las muestras de las plantillas hay `banner`, `navigation` con nombre, `main` y `contentinfo`, uno de cada uno.
   - axe en las páginas y muestras nuevas, en ambos temas y a 375 px. Agregar las rutas a accesibilidad, maquetación (sin scroll horizontal) y temas, y el grupo nuevo a `menu.spec.ts`.
9. **README** y prueba de terminación. Antes del PR, revisar si `fix/menu-scroll` ya se fusionó en `main`; si sí, traer `main` y resolver los choques de `app.ts` conservando los dos cambios. Commits por tema, push, PR con `gh` y revisión de la vista previa de Vercel contra Figma.

## Riesgos
- **Qué puede romperse.**
  - La capa superpuesta de Select, Breadcrumbs y Table al agregar el lado `derecha` y la alineación `fin`: se cubre con las pruebas existentes de la capa y las E2E de campos y navegación.
  - La pila de modales y la región de avisos de Toast al entrar el panel «Más»: las pruebas del Modal y de Toast siguen en verde, y la E2E muestra un Toast desde el panel.
  - El menú de la documentación: solo cambia la lista `GRUPOS`; si `fix/menu-scroll` ya se fusionó, se trae `main` antes del PR.
  - `matchMedia` y `<dialog>` en jsdom: con las ayudas de `pruebas/jsdom.ts` de la entrega 4; las formas reales se prueban en Playwright a 375, 1024 y 1440 px.
- **Paso de mayor riesgo.** El 5 (Sidebar): tres formas, tres niveles, puntero y teclado. Se divide en seis partes con pruebas propias, y la documentación se arma cuando la API ya no cambia.
- **Alternativas descartadas.**
  - **Un solo `<uki-logo name>`**: más simple de documentar, pero mete los cinco logotipos en cada aplicación (D1).
  - **Logotipos como `<img src="…svg">` servidos por el sistema**: evita los trazos en el bundle, pero cada sistema tendría que copiar y servir los archivos y se pierde la «única fuente» que pide Figma.
  - **Redibujar los logotipos con trazos aproximados**: lo prohíbe Figma («never redraw, trace or approximate a logo»).
  - **Sidebar con enlaces proyectados** (`<a ukiSidebarItem>`): más flexible, pero no permite dibujar los mismos destinos como acordeón, panel flotante, barra inferior y panel «Más» (D9).
  - **Panel lateral en teléfono** (como la barra de la documentación): lo pedía la entrega, pero Figma dibuja barra inferior más panel completo (D14, pregunta abierta 9).
  - **Header y Footer como directivas sin plantilla**: el Footer necesita dibujar «© año BANOBRAS.» y el Header un contenedor con sus medidas; un componente sobre el elemento nativo da las dos cosas sin perder el landmark.
  - **Auth solo como plantilla documentada**: cada sistema copiaría la maquetación y se desviaría con el tiempo; como componente de maquetación con proyección, la parte común queda en la librería y el formulario sigue siendo del sistema (D18).
  - **Page Header y App shell como componentes**: están en progreso en Figma (D21).

## Prueba de terminación
```bash
npm ci
npm run lint
npm run typecheck
npm run tokens:check
npm test                # Vitest: capa, logotipos, footer, header, user-menu, sidebar, auth y hero en verde
npm run build:uki
npm run build:demo
npm run e2e             # Playwright + axe con las rutas y muestras nuevas, ambos temas y móvil
```
Además, CI en verde en el PR y revisión de la vista previa de Vercel contra Figma.

## Desviaciones durante la implementación
Todas del 30/10/2026.

1. **`device` en la Sidebar** (`auto` · `desktop` · `mobile`, por omisión `auto`). La documentación tiene que mostrar las tres formas en una misma pantalla, y un sistema puede querer fijar una. Con `desktop`, la colapsada solo sale con `[collapsed]="true"`.
2. **`headingLevel` en Auth** (1 por omisión). En la documentación la página ya tiene su `<h1>`, y dos `<h1>` rompen el índice y la prueba de maquetación; un sistema que muestre Auth dentro de otra página también lo necesita.
3. **Nombre accesible con texto oculto, no con `aria-label`**, en el botón del menú de usuario y en la barra de marca de la Sidebar. axe (WCAG 2.5.3, `label-content-name-mismatch`) marca un `aria-label` que no contiene el texto visible (las iniciales del Avatar, el nombre del marcador del logotipo). El Avatar y el logotipo quedan decorativos.
4. **`userRole` en lugar de `role`** en `uki-user-menu`. Escrita como atributo estático (`role="Administradora"`), una entrada `role` queda en el elemento como un atributo ARIA `role` inválido (axe `aria-roles`).
5. **Espacio libre exacto de ¼ del alto**: 15 px a 60 px y 8 px a 32 px. Figma redondea el de 60 px a `spacing-16`; con `calc()` el margen sigue al alto que se ponga con `--uki-logo-alto`.
6. **Título del panel «Más» como párrafo**, no `<h2>`: nombra el diálogo con `aria-labelledby` y no se cuela en el índice «En esta página» de la documentación ni en la jerarquía de títulos de la página del sistema.
7. **La Sidebar en un componente** (`sidebar.ts`, `sidebar.html`, `sidebar.css`) en lugar de `sidebar-lista`, `sidebar-flotante`, `sidebar-movil` y `sidebar.directivas`: las tres formas comparten plantillas recursivas (rama, enlace, ícono). `UkiSidebarIcon` va en el mismo archivo.
8. **El destino actual se lleva a la vista con `scrollTop` de la lista**, no con `scrollIntoView`, que también desplazaba la página al cargar.
9. **`flex: none` en el anfitrión de la Sidebar**: dentro de una fila flex, la barra colapsada se encogía a 45 px.
10. **Padre con la página actual en la versión colapsada**: su botón lleva el estado activo, porque los hijos no se ven hasta abrir el panel. En la expandida, el activo es el hijo.
11. **Tooltip interno con `ukiTooltipLado`** (`arriba` o `derecha`) para los elementos de la Sidebar colapsada, y sin tooltip cuando el texto está vacío.
12. **Botón de contraer a 72 px del borde superior** (a la altura de la persona, como en el organismo de Figma) y transición de ancho de 300 ms con `ease-out`, la del prototipo de Figma (la especificación decía de 150 a 200 ms).
13. **Sin el borde inferior de 1 px del subelemento**: Figma lo declara pero no expone su color.
14. **Etiquetas de la barra inferior**: bajan de línea entre palabras, nunca a media palabra («Mis trámites» en dos líneas, como en Figma).
15. **Patrón del Hero con un degradado de CSS** (135°, `brand/secondary → brand/primary` al 20 %); el vector decorativo de Figma queda pendiente (pregunta abierta 6). El de Auth se omite.
16. **Formulario proyectado en Auth**: el componente acomoda un `<form>` hijo directo (campos a `spacing-16` y el `ukiButton` a lo ancho con `spacing-24` arriba), para que la plantilla salga como en Figma sin CSS del sistema.
17. **Pruebas**: `anchoFalso()` en `pruebas/jsdom.ts` (la Sidebar usa dos consultas de ancho); las pruebas de Header y del menú de usuario van juntas en `user-menu.spec.ts`.
18. **Documentación**: la página de Sidebar usa `ViewEncapsulation.None` con clases `pg-sidebar-*` (como la de Spinner) para dejar la barra de teléfono dentro de su marco; la documentación suma los íconos `abajo`, `arriba` y `salir` para las vistas fijas del Header. Las muestras viven en `projects/demo/src/app/plantillas/`.
