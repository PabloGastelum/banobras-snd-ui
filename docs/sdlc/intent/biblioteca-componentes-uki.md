# Intent: Biblioteca de componentes Angular del sistema de diseño UKI

- Sistema: compartido (Portal FONADIN, SISSARR, SAAIPB, SISEC, SIVARMER) · Slug: `biblioteca-componentes-uki` · Estado: accepted
- Autor: Pablo Gastelum (frontend, Portal FONADIN) · Fecha: 29/10/2026
- Origen: migración de los 5 sistemas a Angular; necesidad de una interfaz idéntica entre ellos. Fuera del ciclo de la fábrica por decisión del autor (29/10/2026), con el mismo orden intención → especificación → plan → código.
- Referencias:
  - UKI - Library (Figma, Banobras): https://www.figma.com/design/6fzZVvIfv44dGFePtb5F9n/UKI---Library · versión publicada v0.5.0 (27/10/2026)
  - Gráfica base del SND: https://www.snd.gob.mx/comenzar · CSS/JS por CDN `framework-gb.cdn.gob.mx/snd/v1.1.0/` (el archivo declara v1.3.0 del 15/09/2026)

## Problema
Los 5 sistemas de Banobras se migran a Angular y deben verse idénticos. Hoy no existe una pieza de código común que lo garantice:

- El Sistema Nacional de Diseño solo se distribuye como CSS y JS por CDN. No hay paquete npm ni componentes de Angular.
- La URL «versionada» del CDN cambia de contenido sin aviso: la ruta `v1.1.0` sirve un archivo marcado como v1.3.0.
- `snd.js` engancha su comportamiento al cargar la página, así que no funciona con lo que Angular pinta después (rutas, `@if`, carga diferida).
- El CSS del SND no trae diseño para casillas, radios ni campos de texto, solo el reseteo del navegador.
- Banobras ya tiene su sistema de diseño en Figma, **UKI - Library**: usa la misma paleta del SND (guinda, verde, dorado), define tokens semánticos por componente y documenta 14 componentes y 5 patrones. Pero no existe su implementación en código.

Si cada equipo implementa los estilos por su cuenta, los 5 sistemas van a divergir desde el primer sprint y cualquier ajuste de diseño se tendría que repetir 5 veces.

## Resultado propuesto
Un paquete npm privado de Banobras que cualquiera de los 5 proyectos Angular instala. Con él:

- Se importa una sola hoja de estilos global con los tokens, las tipografías (Patria y Noto Sans) y los estilos base del tema guinda.
- Se usan componentes listos que ya se ven como en UKI y exponen entradas para variante, tamaño y estado (por ejemplo `<button ukiButton variant="secondary" [loading]="guardando()">`).
- Los campos de formulario funcionan con formularios reactivos y con `ngModel` igual que un control nativo.
- Un cambio de diseño se hace una vez en el paquete y llega a los 5 sistemas al subir de versión.
- Una aplicación de muestra enseña cada componente en todas sus variantes y estados para que diseño y QA comparen contra Figma.

## Usuarios y sistemas afectados
- Desarrolladores frontend de los 5 sistemas (consumen el paquete).
- Diseño UKI (fuente de verdad; revisa la aplicación de muestra contra Figma).
- Personas usuarias finales de los 5 sistemas, de forma indirecta.
- Versiones de Angular conocidas: Portal FONADIN 20.3, SISEC 20.3, SAAIPB 22.2. SISSARR y SIVARMER: por confirmar.

## Restricciones
- Angular ≥ 20 (ADR-002 del programa). El paquete debe funcionar al menos de Angular 20 a 22.
- Sin lógica de negocio: solo presentación e interacción.
- Accesibilidad WCAG 2.1 AA; los proyectos ya verifican con axe (FONADIN usa `@axe-core/playwright`).
- Compatible con la CSP con nonce del contenedor nginx de FONADIN: nada de `style="…"` en línea ni scripts externos.
- Sin dependencias en tiempo de ejecución de CDNs externos: fuentes e íconos van dentro del paquete.
- Tema guinda (decisión del 29/10/2026). El verde existe en UKI pero no se entrega por ahora.
- UKI está antes de su v1.0.0: los tokens todavía pueden cambiar entre versiones menores.

## Criterio de éxito
- Un proyecto Angular 20 limpio y otro Angular 22 instalan el paquete, importan los componentes y compilan sin errores ni advertencias del paquete.
- En la aplicación de muestra, cada variante y estado de los componentes entregados coincide con UKI: los colores, medidas y radios usan los mismos tokens que Figma.
- axe reporta 0 violaciones en la aplicación de muestra y todo se opera con teclado.
- Los campos de formulario reflejan valor, `disabled` y `touched` con `FormControl` y con `ngModel`.

## Preguntas abiertas
1. **Nombre del paquete y prefijo.** Propuesta: `@banobras/uki` con prefijo `uki` en selectores y clases, porque la fuente es UKI y no el SND. La carpeta local sigue siendo `banobras-snd-ui` hasta decidirlo.
2. **Registro privado y dueño.** ¿GitHub Packages bajo qué organización? ¿Quién mantiene el paquete y aprueba versiones cuando haya equipos en los 5 sistemas?
3. **Radio.** UKI no tiene componente Radio (la página de Checkbox lo menciona, pero no existe). ¿Diseño lo agrega o se deja fuera?
4. **Relación con el CSS del SND.** UKI ya cubre encabezado y pie como patrones. ¿Hace falta cargar además la gráfica del SND (por ejemplo, la barra gob.mx)? Está relacionado con la escalación pendiente de FONADIN sobre la gráfica gob.mx.
5. **Licencia de Patria.** El SND la distribuye en su CDN. ¿Se puede empaquetar en un npm privado o hay que servirla desde otro lado?
6. **Íconos.** UKI nombra íconos como `Linear/check-lg` y `dash-lg`. ¿De qué juego vienen y con qué licencia? En la primera entrega solo se usan los del checkbox.
7. **Idioma de la API.** Propuesta: entradas y tokens en inglés, igual que las propiedades de Figma (`variant`, `size`, `--button-primary`), y documentación en español. Difiere de la convención de la fábrica (clases en español).
