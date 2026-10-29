# Plan: Biblioteca de componentes Angular del sistema de diseño UKI, entrega 1 (desde specs/biblioteca-componentes-uki.md)

- Sistema: compartido · Slug: `biblioteca-componentes-uki` · Riesgo: medio
- Aprobado por: Pablo Gastelum · Fecha: 29/10/2026
- Repositorio: `~/Work/Personal/banobras-snd-ui` (local, sin remoto) · Rama: `main` cuando se inicialice git. No hay commits hasta que Pablo lo pida.
- Herramientas: Node 24.11.1 o posterior (en este Mac hay 24.13.0), npm 11, Angular CLI 20.3.x.

## Archivos que cambian
Todos son nuevos.

- `package.json`, `package-lock.json`: espacio de trabajo con las mismas versiones de herramientas que FONADIN (Angular 20.3.34, `@angular/build` 20.3.41, Vitest 3.2.7, Playwright 1.64.1, `@axe-core/playwright` 4.14.0, ESLint 9 con `angular-eslint` 20.7.0, TypeScript 5.9.3). Scripts: `build:uki`, `start`, `test`, `lint`, `e2e`, `verify:consumo`.
- `angular.json`, `tsconfig.json`: proyectos `uki` (librería) y `demo` (aplicación); `test` con `@angular/build:unit-test` y runner `vitest`.
- `eslint.config.js`: reglas de `angular-eslint`, prefijo de selector `uki` en la librería.
- `projects/uki/package.json`: `name` `@banobras/uki`, `version` `0.1.0`, `peerDependencies` `@angular/core`, `@angular/common` y `@angular/forms` `>=20.0.0 <23.0.0`, `sideEffects` `["*.css"]`. Campo `uki.figmaVersion` `0.5.0`.
- `projects/uki/ng-package.json`: `assets` para `styles/**` y `fonts/**`.
- `projects/uki/styles/uki.css`: entrada; importa los tres siguientes.
- `projects/uki/styles/fonts.css`: `@font-face` de Patria y Noto Sans (RF-2).
- `projects/uki/styles/tokens.css`: variables primitivas y semánticas, modo Guinda (RF-1).
- `projects/uki/styles/base.css`: `body` y clases de estilos de texto (RF-3).
- `projects/uki/fonts/`: `Patria_Light.otf`, `Patria_Regular.otf`, `Patria_Bold.otf`, `NotoSans-VariableFont_wdth,wght.ttf`, `NotoSans-Italic-VariableFont_wdth,wght.ttf`, copiados del CDN del SND v1.1.0.
- `projects/uki/src/public-api.ts`: exportaciones públicas.
- `projects/uki/src/lib/spinner/spinner.ts`, `spinner.css`, `spinner.spec.ts`: RF-10.
- `projects/uki/src/lib/button/button.ts`, `button.css`, `button.spec.ts`: RF-4 a RF-8.
- `projects/uki/src/lib/button-group/button-group.ts`, `button-group.css`, `button-group.spec.ts`: RF-9.
- `projects/uki/src/lib/checkbox/checkbox.ts`, `checkbox.css`, `checkbox.spec.ts`: RF-11 y RF-12.
- `projects/demo/src/…`: aplicación de muestra (RF-13), con una página por sección: Fundamentos, Button, Spinner, Checkbox.
- `e2e/demo.spec.ts`, `playwright.config.ts`: axe, teclado y colores calculados contra los valores de referencia de la especificación.
- `scripts/verify-consumo.sh`: empaqueta, instala el `.tgz` en una aplicación Angular 20.3 y otra 22.2 creadas en un directorio temporal, usa los cuatro componentes y compila.
- `README.md`: qué es, instalación, uso y cómo se actualiza cuando cambia UKI.
- `docs/sdlc/…`: este plan, la especificación y la intención.

## Orden de trabajo
1. **Espacio de trabajo.** Crear con `npx @angular/cli@20.3.41 new` en un directorio temporal (`--no-create-application`, `--style=css`, sin SSR) y mover el resultado a esta carpeta sin pisar `docs/`. `ng g library uki --prefix=uki`, `ng g application demo --style=css --ssr=false`. Ajustar nombre, versión y `peerDependencies`. Configurar Vitest, ESLint y Playwright como en FONADIN. Verificar: `npm test` (0 pruebas, sin error), `npm run build:uki`, `npm run lint`.
2. **Tokens.** Con el MCP de Figma, `get_variable_defs` sobre el frame raíz de cada página de fundamentos (Colors 42:235, Spacing, Layout, Radius, Elevation, Typography) y sobre los conjuntos de componentes de esta entrega. Escribir `tokens.css`. Comparar el conteo con el del Changelog (50 primitivas y 31 semánticas de color, 16 espaciados, 7 radios, 4 elevaciones). Si falta alguna, anotarla en «Desviaciones».
3. **Fuentes y base.** Copiar las fuentes al paquete, escribir `fonts.css` y `base.css` con los 13 estilos de texto (medidas por dispositivo de la página Typography). Verificar que `ng build uki` deja `dist/uki/styles/` y `dist/uki/fonts/`.
4. **Spinner.** Primero `spinner.spec.ts` en rojo: `role="status"`, `aria-label` por omisión «Cargando», tamaño 24/36/48, 12 puntos con la opacidad decreciente. Después `get_design_context` del símbolo `Step=01` (293:71) para las opacidades exactas de la estela, e implementar con SVG y animación CSS (`steps(12)` con movimiento reducido).
5. **Button.** Primero `button.spec.ts` en rojo: clases por `variant` y `size`; `disabled` nativo en `<button>`; `aria-disabled` y `tabindex="-1"` en `<a>` con navegación cancelada; `loading` pone `aria-busy`, ignora clics y conserva el foco; `ghost` ignora `loading` y avisa en modo desarrollo; proyección de íconos. Después `get_design_context` de una instancia Primary con íconos para la separación entre ícono y texto, e implementar los estilos según la tabla de la especificación (hover dentro de `@media (hover: hover)`, foco con `:focus-visible` y `outline`).
6. **Button group.** Prueba de la clase y el atributo; implementar con flexbox y la consulta de 768 px.
7. **Checkbox.** Primero `checkbox.spec.ts` en rojo: con `FormControl` (`setValue`, `disable`, `touched` al perder el foco), con `ngModel`, `[(checked)]`, `indeterminate` (propiedad nativa y `aria-checked="mixed"`), clic en la etiqueta, `ariaLabel` sin etiqueta visible. Exportar de Figma los SVG de `check-lg` y `dash-lg`. Implementar según la tabla de la especificación.
8. **Demo.** Páginas con todas las combinaciones, un formulario reactivo y uno con `ngModel` que muestran `value`, `disabled` y `touched`.
9. **E2E.** `e2e/demo.spec.ts`: axe con 0 violaciones en cada página; recorrido con Tab y activación con Espacio y Enter; color de fondo calculado del botón Primary = `rgb(97, 18, 50)` (#611232) y del checkbox marcado igual; ninguna petición a dominios externos.
10. **Consumo.** `scripts/verify-consumo.sh`: `npm run build:uki`, `npm pack` en `dist/uki`, crear aplicaciones Angular 20.3 y 22.2 en el directorio temporal, instalar el `.tgz`, agregar `uki.css` a `styles`, usar los cuatro componentes en `app.html` y ejecutar `ng build`. Debe terminar con código 0 en ambas.
11. **README** con instalación, uso de cada componente y cómo actualizar tokens cuando UKI publique otra versión.
12. **Revisión visual.** Capturas de la demo de Button y Checkbox junto a las de Figma (`get_screenshot` de 198:542 y 359:2704) para que Pablo las compare.

## Riesgos
- **Qué puede romperse.** Las rutas relativas de las fuentes al consumir desde `node_modules`. Lo cubre el paso 10, que compila una aplicación real. El otro punto frágil es la compatibilidad con Angular 22 de una librería compilada con 20; también la cubre el paso 10.
- **Paso de mayor riesgo.** El 2 (tokens): es transcripción desde Figma y un token mal copiado se propaga a los 5 sistemas. Se mitiga comparando el conteo con el Changelog y verificando en E2E los valores de referencia de la especificación.
- **Alternativas descartadas.**
  - Envolver el CSS del SND con componentes de Angular: no cubre formularios, sus clases no corresponden a UKI y su URL cambia sin aviso.
  - Angular Material o PrimeNG con un tema UKI: arrastra el diseño y las dependencias de esa librería, y cuesta más ajustarlos a UKI que construir los componentes.
  - Web Components (Angular Elements o Lit): servirían fuera de Angular, pero complican formularios reactivos y la CSP sin que hoy haga falta.
  - Storybook: más configuración y dependencias; por ahora basta la aplicación `demo`.
- **Semántica que se preserva.** No aplica Oracle. Lo que se preserva es la semántica nativa de `<button>`, `<a>` e `<input type="checkbox">`: envío de formularios, teclado, foco y estado `indeterminate`.

## Prueba de terminación
```bash
npm ci
npm run lint            # 0 errores y 0 advertencias
npm test                # Vitest: todas las pruebas de uki en verde
npm run build:uki       # dist/uki con styles/ y fonts/
npm run e2e             # Playwright: axe 0 violaciones, teclado y colores de referencia
npm run verify:consumo  # Angular 20.3 y 22.2 compilan consumiendo el .tgz
```
Además, Pablo revisa las capturas del paso 12 contra Figma. Se pega la salida de cada comando al terminar.

## Desviaciones durante la implementación
Todas del 29/10/2026; falta que Pablo las acepte.

1. **Tokens generados, no transcritos.** En lugar de copiar valores con `get_variable_defs` nodo por nodo, se exportaron las 7 colecciones completas con la Plugin API de Figma (solo lectura) a `projects/uki/tokens/uki-figma.json`. `scripts/generar-tokens.mjs` produce `tokens.css` y `npm run tokens:check` detecta si quedó desfasado. Elimina el riesgo de transcripción del paso 2. El Changelog decía 50 primitivas y 31 semánticas (v0.1.0); hoy hay 53 y 77, porque los componentes posteriores agregaron tokens.
2. **Noto Sans recortada.** Los TTF del CDN pesaban 4.3 MB. Se recortaron a latín, ancho 100 y pesos 400–700, en woff2 (72 KB en total), con `unicode-range` y la licencia OFL incluida. Patria se dejó sin cambios por su licencia pendiente.
3. **Límite del MCP de Figma.** El asiento View del plan Professional agotó sus llamadas. No se leyeron las opacidades exactas de la estela del Spinner ni los trazos de `check-lg` y `dash-lg`, ni se pudieron tomar las capturas de Figma del paso 12. Se usó la documentación de UKI: estela lineal de 90 % a 5 % y trazos de 1.5 px dibujados a mano. **Pendiente:** compararlos con Figma cuando se libere la cuota.
4. **`ViewEncapsulation.None` con clases `uki-*`.** Los estilos encapsulados no alcanzan los íconos proyectados en el botón; con clases con prefijo se resuelve sin `::ng-deep`. Sigue cumpliendo RNF Tamaño: el CSS de cada componente solo se carga si el componente se usa.
5. **Alto del botón.** La primera versión medía 50 px por el borde de 1 px; la E2E lo detectó. El relleno vertical descuenta el borde, como el trazo interior de Figma.
6. **Angular 22 y Node.** `ng new` de Angular 22.2 exige Node 24.15 o posterior; este equipo tiene 24.13.0 y FONADIN fija 24.11.1. La verificación de consumo en 22.2.5 se corrió con Node 24.22.2 descargado aparte. La librería no exige Node, pero los proyectos que suban a Angular 22 tendrán que subir Node.
7. **Pruebas en rojo.** Las pruebas unitarias se escribieron junto con cada componente y no se corrieron antes en rojo; las E2E sí encontraron dos fallas reales (alto del botón y una espera en el checkbox) que se corrigieron.
8. **Prueba de terminación.** La compilación de consumo se verificó en Angular 20.3 y 22.2; la ejecución en navegador solo se probó en Angular 20 (demo y E2E).
9. **Nombre accesible en Loading (corregido).** Al rehacer la demo con la distribución de Figma, axe detectó que un botón en Loading se quedaba sin nombre accesible: el texto se ocultaba con `visibility: hidden`, que lo saca del árbol de accesibilidad. Ahora se oculta con `opacity: 0` y la E2E comprueba `toHaveAccessibleName('Guardar')` durante la carga.
10. **Demo como documentación.** La demo replica la distribución de las páginas de UKI en Figma (barra lateral; Colores con roles, temas y escalas; Overview, Átomos, Anatomía y Estados en cada componente). Las escalas de color se excluyen de axe porque muestran el color y su contraste, no son interfaz.
11. **Tema verde (fuera de alcance en la especificación; pedido por Pablo el 29/10/2026).** `generar-tokens.mjs` emite además `[data-uki-theme='verde']` con los 29 tokens semánticos que cambian; el resto de los componentes no cambió porque ya usaban solo tokens semánticos. La documentación tiene un selector Guinda/Verde que se recuerda en el navegador. Hay E2E de colores en verde y axe sin violaciones en las páginas de Colores, Button, Checkbox y Spinner con el tema verde.
12. **Documentación con código.** Cada ejemplo tiene «Ver código» (con pestañas .html/.ts/.css y resaltado) y «Copiar», con confirmación visible y aviso `aria-live`. Los pasos de color y los tokens semánticos se copian con un clic. Se siguieron las skills del proyecto: impeccable (modo Read, *craft floor*) y ui-ux-pro-max (confirmación de acciones, nombres accesibles, íconos SVG de un solo trazo). El lanzador de impeccable no se ejecutó porque descarga un binario; se usó su alternativa documentada (leer el contexto del proyecto).
