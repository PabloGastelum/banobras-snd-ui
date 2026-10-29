# Plan: Campos de formulario de UKI, entrega 2 (desde specs/formularios.md)

- Sistema: compartido · Slug: `formularios` · Riesgo: medio (alto en Select)
- Aprobado por: pendiente (Pablo Gastelum) · Fecha: 29/10/2026
- Repositorio: `PabloGastelum/banobras-snd-ui` · Rama: `feat/formularios` · Integra por PR a `main` con CI y vista previa de Vercel.

## Archivos que cambian
- `projects/uki/src/lib/field/field.ts`, `field.css`, `field.spec.ts` (nuevo): `UkiField`, con etiqueta, ayuda, error, contador, `id` y atributos ARIA (RF-1 a RF-4 y RF-7).
- `projects/uki/src/lib/field/input.ts`, `input.css`, `input.spec.ts` (nuevo): directiva `ukiInput` para `input` y `textarea` (RF-5 y RF-6).
- `projects/uki/src/lib/select/select.ts`, `select.css`, `select.spec.ts` (nuevo): `UkiSelect` (RF-8 a RF-12).
- `projects/uki/src/lib/search/search.ts`, `search.css`, `search.spec.ts` (nuevo): `UkiSearch` (RF-13 a RF-16).
- `projects/uki/src/lib/iconos/` (nuevo, interno): `search`, `chevron-down`, `check` y cierre como SVG en línea.
- `projects/uki/src/public-api.ts` (modificado): exportaciones nuevas.
- `projects/demo/src/app/paginas/text-field.ts`, `text-area.ts`, `select.ts`, `search.ts` (nuevos) y `app.routes.ts`, `app.ts`, `paginas/inicio.ts` (modificados): páginas y navegación.
- `e2e/campos.spec.ts` (nuevo) y `e2e/accesibilidad.spec.ts`, `e2e/maquetacion.spec.ts`, `e2e/temas.spec.ts` (modificados): rutas nuevas.
- `README.md` (modificado): tabla «Qué incluye» y ejemplos.
- `docs/sdlc/…/formularios.md`: esta intención, especificación y plan.

## Orden de trabajo
1. **Íconos.** Probar en Figma, como lector, si «Exportar» da el SVG de `Linear/search`, `chevron-down`, `check` y el cierre. Si funciona, usar esos trazos; si no, dibujarlos con el trazo de 1.5 px de la librería y anotarlo en Desviaciones.
2. **Campo.** Primero `field.spec.ts` e `input.spec.ts` en rojo: etiqueta con «\*:» y asterisco oculto a lectores; `for`/`id`; ayuda y error en `aria-describedby`; regla de error de RF-4 con `FormControl` (sin tocar, tocado, enviado); `aria-invalid` y `aria-required`; contador con y sin exceso; `disable()`. Después la implementación con los tokens de la tabla y el borde de 2 px según D6.
3. **Search.** Pruebas en rojo: tamaños, botón × solo con texto, borrar devuelve el foco, Esc borra, `(buscar)` con 300 ms (`vi.useFakeTimers`), Enter inmediato, anuncio de resultados, `ControlValueAccessor`. Después la implementación.
4. **Select.** Pruebas en rojo de cada tecla de RF-11, clic fuera, opción deshabilitada que no se elige, `aria-activedescendant`, `aria-expanded`, `ControlValueAccessor` con `FormControl` y `ngModel`, y regla de error. Después la implementación. Es el paso de mayor riesgo; va al final de los componentes para no bloquear a los otros tres.
5. **Documentación.** Cuatro páginas con la distribución de la entrega 1 y un ejemplo de formulario completo (Text field, Text area, Select y botón de envío) en «En formularios» de Text field.
6. **E2E.** `e2e/campos.spec.ts`: colores y medidas de cada estado contra los valores de referencia, en guinda y en verde; error al salir del campo; contador; teclado completo de Select; Search con Esc, × y anuncio. Agregar las rutas nuevas a accesibilidad, maquetación y temas.
7. **README** y prueba de terminación. Abrir el PR y revisar la vista previa de Vercel contra Figma.

## Riesgos
- **Qué puede romperse.**
  - La lista de Select dentro de contenedores con `overflow: hidden` (ver Áreas de preocupación de la especificación).
  - El foco al cerrar Select con Tab o con un clic fuera.
  - La espera de Search si el sistema también usa `debounceTime` por su cuenta: se documenta que no hace falta.
- **Paso de mayor riesgo.** El 4 (Select), por la cantidad de casos de teclado. Se mitiga con pruebas de cada tecla antes de implementar y con una E2E que recorre el componente solo con teclado.
- **Alternativas descartadas.**
  - Un componente `uki-text-field` con todos los atributos del input como entradas: obliga a reexponer `type`, `autocomplete`, `inputmode`, etcétera, y a escribir un `ControlValueAccessor` que el control nativo ya resuelve.
  - Angular CDK (`cdk/listbox`, `cdk/overlay`) para Select: resolvería el *overlay*, pero agrega una dependencia nueva a los 5 sistemas por un solo componente. Se reconsidera en la entrega 4, con Modal.
  - `<select>` nativo: no se puede dibujar el estado Open de UKI.

## Prueba de terminación
```bash
npm ci
npm run lint
npm run typecheck
npm run tokens:check
npm test                # Vitest: nuevas pruebas de field, input, search y select en verde
npm run build:uki
npm run build:demo
npm run e2e             # Playwright + axe con las rutas nuevas, ambos temas y móvil
```
Además, CI en verde en el PR y revisión de la vista previa de Vercel contra Figma.

## Desviaciones durante la implementación
Vacío.
